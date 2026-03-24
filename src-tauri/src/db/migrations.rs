use rusqlite::{params, Connection};
use uuid::Uuid;

pub fn run_migrations(conn: &Connection) -> Result<(), String> {
    conn.execute("PRAGMA foreign_keys = ON;", [])
        .map_err(|e| format!("Erro ao ativar foreign keys: {e}"))?;

    conn.execute(
        "
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            uuid TEXT NOT NULL UNIQUE,
            name TEXT NOT NULL UNIQUE,
            created_at TEXT NOT NULL
        );
        ",
        [],
    )
    .map_err(|e| format!("Erro ao criar tabela categories: {e}"))?;

    conn.execute(
        "
        CREATE TABLE IF NOT EXISTS items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            uuid TEXT NOT NULL UNIQUE,
            name TEXT NOT NULL,
            category_id INTEGER NOT NULL,
            notes TEXT,
            created_at TEXT NOT NULL,
            FOREIGN KEY (category_id)
                REFERENCES categories(id)
                ON DELETE CASCADE
        );
        ",
        [],
    )
    .map_err(|e| format!("Erro ao criar tabela items: {e}"))?;

    conn.execute(
        "
        CREATE TABLE IF NOT EXISTS item_links (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            uuid TEXT NOT NULL UNIQUE,
            item_id INTEGER NOT NULL,
            store_name TEXT NOT NULL,
            url TEXT NOT NULL,
            price REAL,
            created_at TEXT NOT NULL,
            FOREIGN KEY (item_id)
                REFERENCES items(id)
                ON DELETE CASCADE
        );
        ",
        [],
    )
    .map_err(|e| format!("Erro ao criar tabela item_links: {e}"))?;

    ensure_uuid_column(conn, "categories");
    ensure_uuid_column(conn, "items");
    ensure_uuid_column(conn, "item_links");

    backfill_uuid(conn, "categories")?;
    backfill_uuid(conn, "items")?;
    backfill_uuid(conn, "item_links")?;

    Ok(())
}

fn ensure_uuid_column(conn: &Connection, table: &str) {
    let statement = format!("ALTER TABLE {table} ADD COLUMN uuid TEXT");
    let _ = conn.execute(&statement, []);
}

fn backfill_uuid(conn: &Connection, table: &str) -> Result<(), String> {
    let mut stmt = conn
        .prepare(&format!("SELECT id, uuid FROM {table}"))
        .map_err(|e| format!("Erro ao preparar query de uuid: {e}"))?;

    let rows = stmt
        .query_map([], |row| Ok((row.get::<_, i32>(0)?, row.get::<_, Option<String>>(1)?)))
        .map_err(|e| format!("Erro ao buscar uuid: {e}"))?
        .filter_map(Result::ok)
        .collect::<Vec<(i32, Option<String>)>>();

    for (id, uuid_value) in rows {
        if uuid_value.unwrap_or_default().is_empty() {
            let new_uuid = Uuid::new_v4().to_string();
            let update = format!("UPDATE {table} SET uuid = ?1 WHERE id = ?2");
            conn.execute(&update, params![new_uuid, id])
                .map_err(|e| format!("Erro ao atualizar uuid: {e}"))?;
        }
    }

    Ok(())
}
