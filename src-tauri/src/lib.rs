mod commands;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            commands::prices::fetch_price_from_url,
            commands::prices::fetch_average_price_google_shopping,
            commands::prices::fetch_top_shopping_offers,
            commands::prices::fetch_store_offer,
            commands::legacy::legacy_database_exists,
            commands::legacy::export_legacy_data,
            commands::legacy::remove_legacy_database,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
