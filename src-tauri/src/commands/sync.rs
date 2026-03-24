use crate::db::connection::get_connection;
use rusqlite::params;
use tauri::command;

#[command]
pub fn upsert_category(uuid: String, name: String, created_at: String) -> Result<i32, String> {
    let conn = get_connection()?;

    let mut stmt = conn
        .prepare("SELECT id FROM categories WHERE uuid = ?1")
        .map_err(|e| e.to_string())?;

    let existing: Option<i32> = stmt
        .query_row(params![uuid.clone()], |row| row.get(0))
        .ok();

    if let Some(id) = existing {
        conn.execute(
            "UPDATE categories SET name = ?1, created_at = ?2 WHERE id = ?3",
            params![name, created_at, id],
        )
        .map_err(|e| e.to_string())?;
        return Ok(id);
    }

    conn.execute(
        "INSERT INTO categories (uuid, name, created_at) VALUES (?1, ?2, ?3)",
        params![uuid, name, created_at],
    )
    .map_err(|e| e.to_string())?;

    let id = conn.last_insert_rowid() as i32;
    Ok(id)
}

#[command]
pub fn upsert_item(
    uuid: String,
    name: String,
    category_uuid: String,
    notes: Option<String>,
    created_at: String,
) -> Result<i32, String> {
    let conn = get_connection()?;

    let mut cat_stmt = conn
        .prepare("SELECT id FROM categories WHERE uuid = ?1")
        .map_err(|e| e.to_string())?;

    let category_id: i32 = cat_stmt
        .query_row(params![category_uuid], |row| row.get(0))
        .map_err(|_| "Categoria nao encontrada".to_string())?;

    let mut stmt = conn
        .prepare("SELECT id FROM items WHERE uuid = ?1")
        .map_err(|e| e.to_string())?;

    let existing: Option<i32> = stmt
        .query_row(params![uuid.clone()], |row| row.get(0))
        .ok();

    if let Some(id) = existing {
        conn.execute(
            "UPDATE items SET name = ?1, category_id = ?2, notes = ?3, created_at = ?4 WHERE id = ?5",
            params![name, category_id, notes, created_at, id],
        )
        .map_err(|e| e.to_string())?;
        return Ok(id);
    }

    conn.execute(
        "INSERT INTO items (uuid, name, category_id, notes, created_at) VALUES (?1, ?2, ?3, ?4, ?5)",
        params![uuid, name, category_id, notes, created_at],
    )
    .map_err(|e| e.to_string())?;

    let id = conn.last_insert_rowid() as i32;
    Ok(id)
}

#[command]
pub fn upsert_item_link(
    uuid: String,
    item_uuid: String,
    store_name: String,
    url: String,
    price: Option<f64>,
    created_at: String,
) -> Result<i32, String> {
    let conn = get_connection()?;

    let mut item_stmt = conn
        .prepare("SELECT id FROM items WHERE uuid = ?1")
        .map_err(|e| e.to_string())?;

    let item_id: i32 = item_stmt
        .query_row(params![item_uuid], |row| row.get(0))
        .map_err(|_| "Item nao encontrado".to_string())?;

    let mut stmt = conn
        .prepare("SELECT id FROM item_links WHERE uuid = ?1")
        .map_err(|e| e.to_string())?;

    let existing: Option<i32> = stmt
        .query_row(params![uuid.clone()], |row| row.get(0))
        .ok();

    if let Some(id) = existing {
        conn.execute(
            "UPDATE item_links SET item_id = ?1, store_name = ?2, url = ?3, price = ?4, created_at = ?5 WHERE id = ?6",
            params![item_id, store_name, url, price, created_at, id],
        )
        .map_err(|e| e.to_string())?;
        return Ok(id);
    }

    conn.execute(
        "INSERT INTO item_links (uuid, item_id, store_name, url, price, created_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        params![uuid, item_id, store_name, url, price, created_at],
    )
    .map_err(|e| e.to_string())?;

    let id = conn.last_insert_rowid() as i32;
    Ok(id)
}
