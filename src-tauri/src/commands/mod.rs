use tauri::command;

#[command]
pub fn ping() -> String {
    "pong".to_string()
}
pub mod categories;
pub mod items;
pub mod item_links;
pub mod prices;
pub mod sync;
