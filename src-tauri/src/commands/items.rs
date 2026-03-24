use crate::db::connection::get_connection;
use crate::models::item::Item;
use chrono::Utc;
use rusqlite::params;
use tauri::command;
use uuid::Uuid;

#[command]
pub fn create_item(
    name: String,
    category_id: i32,
    notes: Option<String>,
) -> Result<(), String> {
    let conn = get_connection()?;

    conn.execute("PRAGMA foreign_keys = ON;", [])
        .map_err(|e| e.to_string())?;

    let now = Utc::now().to_rfc3339();
    let uuid = Uuid::new_v4().to_string();

    conn.execute(
        "
        INSERT INTO items (uuid, name, category_id, notes, created_at)
        VALUES (?1, ?2, ?3, ?4, ?5)
        ",
        params![uuid, name, category_id, notes, now],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

#[command]
pub fn list_items_by_category(category_id: i32) -> Result<Vec<Item>, String> {
    let conn = get_connection()?;

    let mut stmt = conn
        .prepare(
            "
            SELECT id, uuid, name, category_id, notes, created_at
            FROM items
            WHERE category_id = ?1
            ORDER BY name
            ",
        )
        .map_err(|e| e.to_string())?;

    let items = stmt
        .query_map(params![category_id], |row| {
            Ok(Item {
                id: row.get(0)?,
                uuid: row.get(1)?,
                name: row.get(2)?,
                category_id: row.get(3)?,
                notes: row.get(4)?,
                created_at: row.get(5)?,
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(Result::ok)
        .collect();

    Ok(items)
}

#[command]
pub fn delete_item(id: i32) -> Result<(), String> {
    let conn = get_connection()?;

    conn.execute("PRAGMA foreign_keys = ON;", [])
        .map_err(|e| e.to_string())?;

    conn.execute(
        "DELETE FROM items WHERE id = ?1",
        params![id],
    )
    .map_err(|e| format!("Erro ao deletar item: {}", e))?;

    Ok(())
}
