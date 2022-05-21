use futures::stream::StreamExt;
use std::net::SocketAddr;
use std::sync::{Arc, Mutex};
use axum::response::IntoResponse;
use axum::Router;
use axum::extract::Extension;
use axum::extract::ws::{Message, WebSocket, WebSocketUpgrade};
use axum::http::StatusCode;
use axum::routing::{get, get_service};
use futures::SinkExt;
use tokio::sync::broadcast;
use tower_http::services::ServeDir;
use kassen_reversi::game::{Game, Turn};

struct AppState {
    game: Mutex<Game>,
    tx: broadcast::Sender<String>,
}

#[tokio::main]
async fn main() {
    let game = Mutex::new(Game::new());
    let (tx, _) = broadcast::channel(100);
    let app_state = Arc::new(AppState { game, tx });
    let app = Router::new()
        .fallback(
            get_service(
                ServeDir::new("assets").append_index_html_on_directories(true)
            ).handle_error(|error| async move {
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    format!("Unhandled internal error: {}", error),
                )
            })
        )
        .route("/ws", get(ws_handler))
        .layer(Extension(app_state));

    let addr = SocketAddr::from(([127, 0, 0, 1], 3000));

    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .unwrap();
}

async fn ws_handler(ws: WebSocketUpgrade, Extension(state): Extension<Arc<AppState>>) -> impl IntoResponse {
    ws.on_upgrade(|socket| handle(socket, state))
}

async fn handle(stream: WebSocket, state: Arc<AppState>) {
    let (mut sender, mut receiver) = stream.split();
    let mut rx = state.tx.subscribe();
    if sender.send(Message::Text(serde_json::to_string(&state.game).unwrap())).await.is_err() {
        return;
    }

    let mut send_task = tokio::spawn(async move {
        while let Ok(msg) = rx.recv().await {
            println!("recv: {}", msg);
            if sender.send(Message::Text(msg)).await.is_err() {
                break;
            }
        }
    });

    let mut recv_task = tokio::spawn(async move {
        while let Some(Ok(Message::Text(text))) = receiver.next().await {
            println!("recv {}", text);
            let msg = text.split(": ").collect::<Vec<&str>>();
            if let Some(turn) = Turn::parse(msg[0]) {
                if let Ok(position) = msg[1].parse::<i32>() {
                    println!("turn :{:?}\nposition: {}", turn, position);
                    state.game.lock().unwrap().put(&turn, &position);
                }
                let _ = state.tx.send(serde_json::to_string(&state.game).unwrap());
            }
        }
    });

    tokio::select! {
        _ = (&mut send_task) => recv_task.abort(),
        _ = (&mut recv_task) => send_task.abort(),
    }
}
