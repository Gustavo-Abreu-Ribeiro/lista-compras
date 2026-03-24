use rusqlite::{params, Connection};
use crate::models::item::Item;

pub fn list_items_by_category(
    conn: &Connection,
    category_id: i32,
) -> Vec<Item> {
    let mut stmt = conn
        .prepare(
            "
            SELECT id, uuid, name, category_id, notes, created_at
            FROM items
            WHERE category_id = ?
            ORDER BY created_at DESC
            ",
        )
        .expect("Erro ao preparar query");

    let items_iter = stmt
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
        .expect("Erro ao buscar items");

    items_iter.map(|i| i.unwrap()).collect()
}
