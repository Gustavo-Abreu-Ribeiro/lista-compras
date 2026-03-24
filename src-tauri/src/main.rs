#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod models;
mod commands;
mod db;

//use tauri_plugin_opener::OpenerExt;
use tauri::Manager;

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let data_dir = app.path().app_data_dir()?;
            db::connection::set_app_data_dir(data_dir);

            let conn = db::connection::get_connection().map_err(|e| {
                std::io::Error::new(std::io::ErrorKind::Other, e)
            })?;
            db::migrations::run_migrations(&conn).map_err(|e| {
                std::io::Error::new(std::io::ErrorKind::Other, e)
            })?;

            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            commands::categories::create_category,
            commands::categories::list_categories,
            commands::categories::delete_category,
            commands::items::create_item,
            commands::items::list_items_by_category,
            commands::items::delete_item,
            commands::item_links::create_item_link,
            commands::item_links::list_links_by_item,
            commands::item_links::delete_link,
            commands::prices::fetch_price_from_url,
            commands::prices::fetch_average_price_google_shopping,
            commands::prices::fetch_top_shopping_offers,
            commands::prices::fetch_store_offer,
            commands::sync::upsert_category,
            commands::sync::upsert_item,
            commands::sync::upsert_item_link
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
