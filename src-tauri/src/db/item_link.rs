use crate::db::connection::get_connection;
use crate::models::item_link::ItemLink;
use chrono::Utc;
use rusqlite::params;

/* -------- LISTAR LINKS POR ITEM -------- */

pub fn list_links_by_item(item_id: i32) -> Result<Vec<ItemLink>, String> {
    let conn = get_connection()?;

    let mut stmt = conn
        .prepare(
            "
            SELECT
                id,
                uuid,
                item_id,
                store_name,
                url,
                price,
                created_at
            FROM item_links
            WHERE item_id = ?1
            ORDER BY created_at DESC
            ",
        )
        .map_err(|e| e.to_string())?;

    let links = stmt
        .query_map(params![item_id], |row| {
            Ok(ItemLink {
                id: row.get(0)?,
                uuid: row.get(1)?,
                item_id: row.get(2)?,
                store_name: row.get(3)?,
                url: row.get(4)?,
                price: row.get(5)?,
                created_at: row.get(6)?,
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(Result::ok)
        .collect();

    Ok(links)
}

/* -------- CRIAR LINK -------- */

pub fn create_link(
    item_id: i32,
    store_name: String,
    url: String,
    price: Option<f64>,
) -> Result<(), String> {
    let conn = get_connection()?;
    let now = Utc::now().to_rfc3339();

    conn.execute(
        "
        INSERT INTO item_links (item_id, store_name, url, price, created_at)
        VALUES (?1, ?2, ?3, ?4, ?5)
        ",
        params![item_id, store_name, url, price, now],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

/* -------- DELETAR LINK -------- */

pub fn delete_link(id: i32) -> Result<(), String> {
    let conn = get_connection()?;

    conn.execute(
        "DELETE FROM item_links WHERE id = ?1",
        params![id],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}
