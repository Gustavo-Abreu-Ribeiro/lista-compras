use crate::db::connection::get_connection;
use crate::models::item_link::{ItemLink, ItemLinkPricePoint};
use chrono::Utc;
use rusqlite::params;
use std::sync::atomic::{AtomicBool, Ordering};
use tauri::command;
use uuid::Uuid;

static PRICE_REFRESH_RUNNING: AtomicBool = AtomicBool::new(false);

#[command]
pub fn create_item_link(
    item_id: i32,
    store_name: String,
    url: String,
    price: Option<f64>,
) -> Result<(), String> {
    let conn = get_connection()?;
    let now = Utc::now().to_rfc3339();
    let uuid = Uuid::new_v4().to_string();

    conn.execute(
        "
        INSERT INTO item_links (uuid, item_id, store_name, url, price, created_at)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6)
        ",
        params![uuid, item_id, store_name, url, price, now],
    )
    .map_err(|e| e.to_string())?;

    if let Some(price) = price.filter(|value| *value > 0.0) {
        conn.execute(
            "INSERT INTO item_link_price_history(item_link_id, price, observed_at) VALUES(?1, ?2, ?3)",
            params![conn.last_insert_rowid(), price, now],
        ).map_err(|e| e.to_string())?;
    }

    Ok(())
}

#[command]
pub fn list_item_link_price_history(item_id: i32) -> Result<Vec<ItemLinkPricePoint>, String> {
    let conn = get_connection()?;
    let mut stmt = conn.prepare(
        "SELECT history.id, history.item_link_id, history.price, history.observed_at
         FROM item_link_price_history history
         JOIN item_links link ON link.id = history.item_link_id
         WHERE link.item_id = ?1
         ORDER BY history.observed_at, history.id",
    ).map_err(|e| e.to_string())?;
    let rows = stmt.query_map(params![item_id], |row| Ok(ItemLinkPricePoint {
        id: row.get(0)?, item_link_id: row.get(1)?, price: row.get(2)?, observed_at: row.get(3)?,
    })).map_err(|e| e.to_string())?;
    rows.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())
}

#[command]
pub fn refresh_stale_prices() -> Result<(), String> {
    if PRICE_REFRESH_RUNNING.compare_exchange(false, true, Ordering::AcqRel, Ordering::Acquire).is_err() {
        return Ok(());
    }

    if let Err(error) = std::thread::Builder::new().name("price-refresh".into()).spawn(|| {
        let _ = refresh_stale_prices_now();
        PRICE_REFRESH_RUNNING.store(false, Ordering::Release);
    }) {
        PRICE_REFRESH_RUNNING.store(false, Ordering::Release);
        return Err(error.to_string());
    }

    Ok(())
}

fn refresh_stale_prices_now() -> Result<(), String> {
    let links = {
        let conn = get_connection()?;
        let mut stmt = conn.prepare(
            "SELECT id, url FROM item_links
             WHERE (url LIKE 'https://%' OR url LIKE 'http://%')
               AND url NOT LIKE '%google.com/search?tbm=shop%'
               AND (last_checked_at IS NULL OR julianday(last_checked_at) <= julianday('now', '-1 day'))
             ORDER BY COALESCE(last_checked_at, created_at), id
             LIMIT 3",
        ).map_err(|e| e.to_string())?;
        let rows = stmt.query_map([], |row| Ok((row.get::<_, i32>(0)?, row.get::<_, String>(1)?)))
            .map_err(|e| e.to_string())?
            .collect::<Result<Vec<_>, _>>()
            .map_err(|e| e.to_string())?;
        rows
    };

    for (link_id, url) in links {
        let price = crate::commands::prices::fetch_price_from_url(url).ok().flatten().filter(|value| *value > 0.0);
        let checked_at = Utc::now().to_rfc3339();
        let conn = get_connection()?;
        conn.execute("UPDATE item_links SET last_checked_at = ?1 WHERE id = ?2", params![checked_at, link_id])
            .map_err(|e| e.to_string())?;
        if let Some(price) = price {
            conn.execute("UPDATE item_links SET price = ?1 WHERE id = ?2", params![price, link_id])
                .map_err(|e| e.to_string())?;
            conn.execute(
                "INSERT INTO item_link_price_history(item_link_id, price, observed_at) VALUES(?1, ?2, ?3)",
                params![link_id, price, checked_at],
            ).map_err(|e| e.to_string())?;
        }
    }
    Ok(())
}

#[command]
pub fn list_links_by_item(item_id: i32) -> Result<Vec<ItemLink>, String> {
    let conn = get_connection()?;

    let mut stmt = conn
        .prepare(
            "
            SELECT id, uuid, item_id, store_name, url, price, created_at
            FROM item_links
            WHERE item_id = ?1
            ORDER BY store_name
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

#[command]
pub fn delete_link(id: i32) -> Result<(), String> {
    let conn = get_connection()?;

    conn.execute(
        "DELETE FROM item_links WHERE id = ?1",
        params![id],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}
