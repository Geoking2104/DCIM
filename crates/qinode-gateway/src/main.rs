use async_graphql::{http::ALL_WEBSOCKET_PROTOCOLS, Data};
use async_graphql_axum::{GraphQLProtocol, GraphQLRequest, GraphQLResponse, GraphQLWebSocket};
use axum::{
    extract::{State, WebSocketUpgrade},
    http::{header::AUTHORIZATION, HeaderMap, StatusCode},
    response::Response,
    routing::{get, post},
    Json, Router,
};
use qinode_auth::{Keycloak, Principal};
use qinode_core::{pue, wue, MetricPreview, PueInput, WueInput};
use qinode_graph::{schema as graph_schema, AppSchema, Neo4jStore};
use qinode_ingest::{snapshot, BmcTarget, RedfishSnapshot};
use qinode_timeseries::{ClickHouse, PowerSample};
use serde::Serialize;
use std::net::SocketAddr;
use std::sync::Arc;
use tower_http::{cors::CorsLayer, trace::TraceLayer};

#[derive(Clone)]
struct AppState {
    ch: Arc<ClickHouse>,
    gql: AppSchema,
    kc: Arc<Keycloak>,
    topology: Neo4jStore,
}

#[derive(Serialize)]
struct Health {
    status: &'static str,
    service: &'static str,
    rust: bool,
    graphql: bool,
    graphql_ws: bool,
    keycloak: bool,
    topology_store: &'static str,
}

#[derive(Serialize)]
struct Dependencies {
    clickhouse: &'static str,
    keycloak: &'static str,
    neo4j: &'static str,
}

#[derive(Serialize)]
struct Readiness {
    status: &'static str,
    dependencies: Dependencies,
}

/// Authentification commune : quand Keycloak est requis, tout accès hors
/// `/health*` doit porter un jeton ; sinon (dev local) le principal est anonyme.
async fn authenticate(
    state: &AppState,
    headers: &HeaderMap,
) -> Result<Principal, (StatusCode, String)> {
    let auth = headers
        .get(AUTHORIZATION)
        .and_then(|value| value.to_str().ok());
    state
        .kc
        .authenticate(auth)
        .await
        .map_err(|error| (StatusCode::UNAUTHORIZED, error.to_string()))
}

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt()
        .with_env_filter("qinode_gateway=info,tower_http=info")
        .init();

    let ch = ClickHouse::from_env();
    if let Err(error) = ch.ensure_schema().await {
        tracing::warn!(%error, "ClickHouse indisponible au démarrage");
    }
    let topology = Neo4jStore::connect_from_env()
        .await
        .expect("initialisation du stockage topologique Neo4j");
    let gql = graph_schema(topology.clone());
    let kc = Arc::new(Keycloak::from_env());

    let state = AppState {
        ch: Arc::new(ch),
        gql: gql.clone(),
        kc: kc.clone(),
        topology,
    };

    let app = Router::new()
        .route("/health", get(live))
        .route("/health/live", get(live))
        .route("/health/ready", get(ready))
        .route("/graphql", post(graphql_handler))
        .route("/graphql/ws", get(graphql_ws_handler))
        .route("/v1/metrics/pue", post(calc_pue))
        .route("/v1/metrics/wue", post(calc_wue))
        .route("/v1/redfish/snapshot", post(redfish_snapshot))
        .route("/v1/telemetry/power", post(insert_power))
        .layer(CorsLayer::permissive())
        .layer(TraceLayer::new_for_http())
        .with_state(state);

    let addr: SocketAddr = std::env::var("LISTEN")
        .unwrap_or_else(|_| "0.0.0.0:8088".into())
        .parse()
        .expect("LISTEN");
    tracing::info!(%addr, "qinode-gateway");
    let listener = tokio::net::TcpListener::bind(addr).await.expect("bind");
    axum::serve(listener, app).await.expect("serve");
}

async fn graphql_ws_handler(
    protocol: GraphQLProtocol,
    State(state): State<AppState>,
    ws: WebSocketUpgrade,
) -> Response {
    let schema = state.gql.clone();
    let kc = state.kc.clone();

    ws.protocols(ALL_WEBSOCKET_PROTOCOLS)
        .on_upgrade(move |stream| {
            GraphQLWebSocket::new(stream, schema, protocol)
                .on_connection_init(move |value| {
                    let kc = kc.clone();
                    async move {
                        let auth = value.get("authorization").and_then(|v| v.as_str());
                        let principal = kc
                            .authenticate(auth)
                            .await
                            .map_err(|e| async_graphql::Error::new(e.to_string()))?;
                        let mut data = Data::default();
                        data.insert(principal);
                        Ok(data)
                    }
                })
                .serve()
        })
}

async fn live(State(state): State<AppState>) -> Json<Health> {
    Json(Health {
        status: "ok",
        service: "qinode-gateway",
        rust: true,
        graphql: true,
        graphql_ws: true,
        keycloak: state.kc.required(),
        topology_store: "neo4j",
    })
}

async fn ready(State(state): State<AppState>) -> (StatusCode, Json<Readiness>) {
    let (clickhouse, neo4j) = tokio::join!(state.ch.ready(), state.topology.ready());
    let keycloak = state.kc.ready();
    let clickhouse_ready = clickhouse.is_ok();
    let keycloak_ready = keycloak.is_ok();
    let neo4j_ready = neo4j.is_ok();

    if let Err(error) = clickhouse {
        tracing::warn!(%error, "Échec du probe ClickHouse");
    }
    if let Err(error) = neo4j {
        tracing::warn!(%error, "Échec du probe Neo4j");
    }
    if let Err(error) = keycloak {
        tracing::warn!(%error, "Configuration Keycloak non prête");
    }

    let ready = clickhouse_ready && keycloak_ready && neo4j_ready;
    (
        if ready {
            StatusCode::OK
        } else {
            StatusCode::SERVICE_UNAVAILABLE
        },
        Json(Readiness {
            status: if ready { "ready" } else { "unavailable" },
            dependencies: Dependencies {
                clickhouse: if clickhouse_ready {
                    "ready"
                } else {
                    "unavailable"
                },
                keycloak: if keycloak_ready {
                    "ready"
                } else {
                    "unavailable"
                },
                neo4j: if neo4j_ready { "ready" } else { "unavailable" },
            },
        }),
    )
}

async fn graphql_handler(
    State(state): State<AppState>,
    headers: HeaderMap,
    req: GraphQLRequest,
) -> Result<GraphQLResponse, (StatusCode, String)> {
    let principal = authenticate(&state, &headers).await?;
    let mut request = req.into_inner();
    request = request.data(principal);
    Ok(state.gql.execute(request).await.into())
}

async fn calc_pue(
    Json(input): Json<PueInput>,
) -> Result<Json<MetricPreview>, (StatusCode, String)> {
    pue(input)
        .map(Json)
        .map_err(|e| (StatusCode::UNPROCESSABLE_ENTITY, e.to_string()))
}
async fn calc_wue(
    Json(input): Json<WueInput>,
) -> Result<Json<MetricPreview>, (StatusCode, String)> {
    wue(input)
        .map(Json)
        .map_err(|e| (StatusCode::UNPROCESSABLE_ENTITY, e.to_string()))
}
async fn redfish_snapshot(
    State(state): State<AppState>,
    headers: HeaderMap,
    Json(target): Json<BmcTarget>,
) -> Result<Json<RedfishSnapshot>, (StatusCode, String)> {
    authenticate(&state, &headers).await?;
    snapshot(target)
        .await
        .map(Json)
        .map_err(|e| (StatusCode::BAD_GATEWAY, e.to_string()))
}
async fn insert_power(
    State(state): State<AppState>,
    headers: HeaderMap,
    Json(row): Json<PowerSample>,
) -> Result<Json<serde_json::Value>, (StatusCode, String)> {
    authenticate(&state, &headers).await?;
    state
        .ch
        .insert_power(&row)
        .await
        .map(|_| Json(serde_json::json!({"ok": true, "rack_id": row.rack_id})))
        .map_err(|e| (StatusCode::BAD_GATEWAY, e.to_string()))
}
