use async_graphql_axum::{GraphQLRequest, GraphQLResponse};
use axum::{
    extract::State,
    http::StatusCode,
    routing::{get, post},
    Json, Router,
};
use qinode_core::{pue, wue, MetricPreview, PueInput, WueInput};
use qinode_graph::{schema as graph_schema, AppSchema};
use qinode_ingest::{snapshot, BmcTarget, RedfishSnapshot};
use qinode_timeseries::{ClickHouse, PowerSample};
use serde::Serialize;
use std::net::SocketAddr;
use std::sync::Arc;
use tower_http::{cors::CorsLayer, trace::TraceLayer};

#[derive(Clone)]
struct AppState {
    nest_graphql: String,
    ch: Arc<ClickHouse>,
    gql: AppSchema,
}

#[derive(Serialize)]
struct Health {
    service: &'static str,
    rust: bool,
    graphql: bool,
    redfish: bool,
    clickhouse: String,
    nest_graphql: String,
}

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt()
        .with_env_filter("qinode_gateway=info,tower_http=info")
        .init();

    let ch = ClickHouse::from_env();
    let _ = ch.ensure_schema().await;

    let state = AppState {
        nest_graphql: std::env::var("NEST_GRAPHQL_URL")
            .unwrap_or_else(|_| "http://127.0.0.1:4000/graphql".into()),
        ch: Arc::new(ch),
        gql: graph_schema(),
    };

    let app = Router::new()
        .route("/health", get(health))
        .route("/graphql", post(graphql_handler))
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

async fn health(State(state): State<AppState>) -> Json<Health> {
    Json(Health {
        service: "qinode-gateway",
        rust: true,
        graphql: true,
        redfish: true,
        clickhouse: std::env::var("CLICKHOUSE_URL").unwrap_or_else(|_| "http://127.0.0.1:8123".into()),
        nest_graphql: state.nest_graphql,
    })
}

async fn graphql_handler(State(state): State<AppState>, req: GraphQLRequest) -> GraphQLResponse {
    state.gql.execute(req.into_inner()).await.into()
}

async fn calc_pue(Json(input): Json<PueInput>) -> Result<Json<MetricPreview>, (StatusCode, String)> {
    pue(input)
        .map(Json)
        .map_err(|e| (StatusCode::UNPROCESSABLE_ENTITY, e.to_string()))
}

async fn calc_wue(Json(input): Json<WueInput>) -> Result<Json<MetricPreview>, (StatusCode, String)> {
    wue(input)
        .map(Json)
        .map_err(|e| (StatusCode::UNPROCESSABLE_ENTITY, e.to_string()))
}

async fn redfish_snapshot(
    Json(target): Json<BmcTarget>,
) -> Result<Json<RedfishSnapshot>, (StatusCode, String)> {
    snapshot(target)
        .await
        .map(Json)
        .map_err(|e| (StatusCode::BAD_GATEWAY, e.to_string()))
}

async fn insert_power(
    State(state): State<AppState>,
    Json(row): Json<PowerSample>,
) -> Result<Json<serde_json::Value>, (StatusCode, String)> {
    state
        .ch
        .insert_power(&row)
        .await
        .map(|_| Json(serde_json::json!({"ok": true, "rack_id": row.rack_id})))
        .map_err(|e| (StatusCode::BAD_GATEWAY, e.to_string()))
}
