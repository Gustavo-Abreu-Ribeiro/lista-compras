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

    conn.execute_batch(
        "
        CREATE TABLE IF NOT EXISTS financial_accounts (
            id INTEGER PRIMARY KEY AUTOINCREMENT, uuid TEXT NOT NULL UNIQUE,
            name TEXT NOT NULL, account_type TEXT NOT NULL, opening_balance_cents INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS financial_categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT, uuid TEXT NOT NULL UNIQUE,
            name TEXT NOT NULL, kind TEXT NOT NULL, is_essential INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL, UNIQUE(name, kind)
        );
        CREATE TABLE IF NOT EXISTS financial_transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT, uuid TEXT NOT NULL UNIQUE,
            kind TEXT NOT NULL, amount_cents INTEGER NOT NULL CHECK(amount_cents >= 0),
            occurred_on TEXT NOT NULL, description TEXT NOT NULL, category_id INTEGER,
            account_id INTEGER, status TEXT NOT NULL DEFAULT 'posted', created_at TEXT NOT NULL,
            FOREIGN KEY(category_id) REFERENCES financial_categories(id),
            FOREIGN KEY(account_id) REFERENCES financial_accounts(id)
        );
        CREATE TABLE IF NOT EXISTS financial_installments (
            id INTEGER PRIMARY KEY AUTOINCREMENT, uuid TEXT NOT NULL UNIQUE,
            description TEXT NOT NULL, amount_cents INTEGER NOT NULL CHECK(amount_cents >= 0),
            due_on TEXT NOT NULL, category_id INTEGER, account_id INTEGER,
            state TEXT NOT NULL DEFAULT 'pending', created_at TEXT NOT NULL,
            FOREIGN KEY(category_id) REFERENCES financial_categories(id),
            FOREIGN KEY(account_id) REFERENCES financial_accounts(id)
        );
        CREATE TABLE IF NOT EXISTS financial_goals (
            id INTEGER PRIMARY KEY AUTOINCREMENT, uuid TEXT NOT NULL UNIQUE,
            name TEXT NOT NULL, target_cents INTEGER NOT NULL CHECK(target_cents >= 0),
            saved_cents INTEGER NOT NULL DEFAULT 0 CHECK(saved_cents >= 0), due_on TEXT,
            priority INTEGER NOT NULL DEFAULT 3, contribution_min_cents INTEGER NOT NULL DEFAULT 0,
            contribution_ideal_cents INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS financial_budgets (
            id INTEGER PRIMARY KEY AUTOINCREMENT, category_id INTEGER NOT NULL, month TEXT NOT NULL,
            limit_cents INTEGER NOT NULL CHECK(limit_cents >= 0), UNIQUE(category_id, month),
            FOREIGN KEY(category_id) REFERENCES financial_categories(id) ON DELETE CASCADE
        );
        CREATE INDEX IF NOT EXISTS idx_financial_transactions_date ON financial_transactions(occurred_on);
        CREATE INDEX IF NOT EXISTS idx_financial_installments_due ON financial_installments(due_on);
        "
    ).map_err(|e| format!("Erro ao criar tabelas financeiras: {e}"))?;

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
