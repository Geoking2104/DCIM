use axum::{
    extract::State,
    http::StatusCode,
    routing::{get, post},
    Json, Router,
};
use qinode_core::{pue, wue, MetricPreview, PueInput, WueInput};
use serde::Serialize;
use std::net::SocketAddr;
use tower_http::{cors::CorsLayer, trace::TraceLayer};

#[derive(Clone)]
struct AppState {
    nest_graphql: String,
}

#[derive(Serialize)]
struct Health {
    service: &'static str,
    rust: bool,
    nest_graphql: String,
}

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt()
        .with_env_filter("qinode_gateway=info,tower_http=info")
        .init();

    let state = AppState {
        nest_graphql: std::env::var("NEST_GRAPHQL_URL")
            .unwrap_or_else(|_| "http://127.0.0.1:4000/graphql".into()),
    };

    let app = Router::new()
        .route("/health", get(health))
        .route("/v1/metrics/pue", post(calc_pue))
        .route("/v1/metrics/wue", post(calc_wue))
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
        nest_graphql: state.nest_graphql,
    })
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
