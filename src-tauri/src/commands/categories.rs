use crate::db::connection::get_connection;
use crate::models::category::Category;
use chrono::Utc;
use rusqlite::params;
use tauri::command;
use uuid::Uuid;

#[command]
pub fn create_category(name: String) -> Result<(), String> {
    let conn = get_connection()?;
    let now = Utc::now().to_rfc3339();
    let uuid = Uuid::new_v4().to_string();

    conn.execute(
        "INSERT INTO categories (uuid, name, created_at) VALUES (?1, ?2, ?3)",
        params![uuid, name, now],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

#[command]
pub fn list_categories() -> Result<Vec<Category>, String> {
    let conn = get_connection()?;

    let mut stmt = conn
        .prepare("SELECT id, uuid, name, created_at FROM categories ORDER BY name")
        .map_err(|e| e.to_string())?;

    let categories = stmt
        .query_map([], |row| {
            Ok(Category {
                id: row.get(0)?,
                uuid: row.get(1)?,
                name: row.get(2)?,
                created_at: row.get(3)?,
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(Result::ok)
        .collect();

    Ok(categories)
}

#[command]
pub fn delete_category(id: i32) -> Result<(), String> {
    let conn = get_connection()?;

    conn.execute("PRAGMA foreign_keys = ON;", [])
        .map_err(|e| e.to_string())?;

    conn.execute(
        "DELETE FROM categories WHERE id = ?1",
        params![id],
    )
    .map_err(|e| format!("Erro ao deletar categoria: {}", e))?;

    Ok(())
}
