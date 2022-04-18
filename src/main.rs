use std::net::SocketAddr;
use std::sync::Arc;
use axum::response::{Html, IntoResponse};
use axum::{Extension, Router};
use axum::extract::ws::{WebSocket, WebSocketUpgrade};
use axum::routing::{get, get_service};
use kassen_reversi::board::Board;

#[tokio::main]
async fn main() {
    let app = Router::new()
        .fallback(
            get_service()
        )
        .route("/", get(index));

    let addr = SocketAddr::from(([127, 0, 0, 1], 3000));

    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .unwrap();
}

async fn ws_handler(ws: WebSocketUpgrade) -> impl IntoResponse {
    ws.on_upgrade(handle)
}

async fn handle(stream: WebSocket) {}

async fn index() -> Html<&'static str> {
    Html(std::include_str!("../index.html"))
}
