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

    let _ = conn.execute("ALTER TABLE item_links ADD COLUMN last_checked_at TEXT", []);
    conn.execute_batch(
        "
        CREATE TABLE IF NOT EXISTS item_link_price_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            item_link_id INTEGER NOT NULL,
            price REAL NOT NULL CHECK(price > 0),
            observed_at TEXT NOT NULL,
            UNIQUE(item_link_id, price, observed_at),
            FOREIGN KEY(item_link_id) REFERENCES item_links(id) ON DELETE CASCADE
        );
        CREATE INDEX IF NOT EXISTS idx_item_link_price_history_link_time
            ON item_link_price_history(item_link_id, observed_at);
        CREATE INDEX IF NOT EXISTS idx_item_links_last_checked
            ON item_links(last_checked_at);
        INSERT OR IGNORE INTO item_link_price_history(item_link_id, price, observed_at)
            SELECT id, price, created_at FROM item_links WHERE price > 0;
        "
    ).map_err(|e| format!("Erro ao criar histórico de preços: {e}"))?;

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
            id INTEGER PRIMARY KEY AUTOINCREMENT, uuid TEXT UNIQUE,
            category_id INTEGER NOT NULL, month TEXT NOT NULL,
            limit_cents INTEGER NOT NULL CHECK(limit_cents >= 0), created_at TEXT,
            UNIQUE(category_id, month),
            FOREIGN KEY(category_id) REFERENCES financial_categories(id) ON DELETE CASCADE
        );
        CREATE TABLE IF NOT EXISTS financial_recurrences (
            id INTEGER PRIMARY KEY AUTOINCREMENT, uuid TEXT NOT NULL UNIQUE,
            kind TEXT NOT NULL CHECK(kind IN ('income','expense')),
            description TEXT NOT NULL, amount_cents INTEGER NOT NULL CHECK(amount_cents > 0),
            day_of_month INTEGER NOT NULL CHECK(day_of_month BETWEEN 1 AND 31),
            start_month TEXT NOT NULL, category_id INTEGER, account_id INTEGER,
            active INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL,
            FOREIGN KEY(category_id) REFERENCES financial_categories(id),
            FOREIGN KEY(account_id) REFERENCES financial_accounts(id)
        );
        CREATE TABLE IF NOT EXISTS financial_debts (
            id INTEGER PRIMARY KEY AUTOINCREMENT, uuid TEXT NOT NULL UNIQUE,
            name TEXT NOT NULL, balance_cents INTEGER NOT NULL CHECK(balance_cents >= 0),
            monthly_payment_cents INTEGER NOT NULL DEFAULT 0 CHECK(monthly_payment_cents >= 0),
            due_day INTEGER CHECK(due_day BETWEEN 1 AND 31), created_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_financial_transactions_date ON financial_transactions(occurred_on);
        CREATE INDEX IF NOT EXISTS idx_financial_installments_due ON financial_installments(due_on);
        "
    ).map_err(|e| format!("Erro ao criar tabelas financeiras: {e}"))?;

    let _ = conn.execute("ALTER TABLE financial_transactions ADD COLUMN recurrence_id INTEGER REFERENCES financial_recurrences(id)", []);
    let _ = conn.execute("ALTER TABLE financial_transactions ADD COLUMN recurrence_month TEXT", []);
    let _ = conn.execute("ALTER TABLE financial_transactions ADD COLUMN installment_id INTEGER REFERENCES financial_installments(id)", []);
    conn.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_financial_transactions_recurrence_month ON financial_transactions(recurrence_id, recurrence_month)", []).map_err(|e| format!("Erro ao indexar recorrências financeiras: {e}"))?;
    conn.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_financial_transactions_installment ON financial_transactions(installment_id)", []).map_err(|e| format!("Erro ao indexar lançamentos de parcelas: {e}"))?;

    ensure_uuid_column(conn, "financial_budgets");
    let _ = conn.execute("ALTER TABLE financial_budgets ADD COLUMN created_at TEXT", []);
    backfill_uuid(conn, "financial_budgets")?;

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
