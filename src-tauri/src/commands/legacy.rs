use rusqlite::{types::ValueRef, Connection, OpenFlags};
use serde_json::{Map, Number, Value};
use std::{fs, path::PathBuf};
use tauri::{command, AppHandle, Manager};

fn database_path(app: &AppHandle) -> Result<PathBuf, String> {
    Ok(app.path().app_data_dir().map_err(|error| error.to_string())?.join("database.sqlite"))
}

#[command]
pub fn legacy_database_exists(app: AppHandle) -> Result<bool, String> {
    Ok(database_path(&app)?.is_file())
}

#[command]
pub fn export_legacy_data(app: AppHandle) -> Result<Value, String> {
    let path = database_path(&app)?;
    if !path.is_file() {
        return Ok(serde_json::json!({ "has_database": false, "tables": {} }));
    }
    let conn = Connection::open_with_flags(path, OpenFlags::SQLITE_OPEN_READ_ONLY | OpenFlags::SQLITE_OPEN_NO_MUTEX)
        .map_err(|error| error.to_string())?;
    let tables = [
        ("categories", "SELECT * FROM categories"),
        ("items", "SELECT * FROM items"),
        ("item_links", "SELECT * FROM item_links"),
        ("item_link_price_history", "SELECT * FROM item_link_price_history"),
        ("financial_accounts", "SELECT * FROM financial_accounts"),
        ("financial_categories", "SELECT * FROM financial_categories"),
        ("financial_transactions", "SELECT * FROM financial_transactions"),
        ("financial_installments", "SELECT * FROM financial_installments"),
        ("financial_goals", "SELECT * FROM financial_goals"),
        ("financial_budgets", "SELECT * FROM financial_budgets"),
        ("financial_recurrences", "SELECT * FROM financial_recurrences"),
        ("financial_debts", "SELECT * FROM financial_debts"),
    ];
    let mut output = Map::new();
    for (name, query) in tables {
        let exists: bool = conn.query_row(
            "SELECT EXISTS(SELECT 1 FROM sqlite_master WHERE type='table' AND name=?1)",
            [name], |row| row.get(0),
        ).map_err(|error| error.to_string())?;
        output.insert(name.to_string(), if exists { read_rows(&conn, query)? } else { Value::Array(Vec::new()) });
    }
    Ok(serde_json::json!({ "has_database": true, "tables": output }))
}

fn read_rows(conn: &Connection, query: &str) -> Result<Value, String> {
    let mut statement = conn.prepare(query).map_err(|error| error.to_string())?;
    let columns = statement.column_names().iter().map(|name| name.to_string()).collect::<Vec<_>>();
    let mut rows = statement.query([]).map_err(|error| error.to_string())?;
    let mut output = Vec::new();
    while let Some(row) = rows.next().map_err(|error| error.to_string())? {
        let mut record = Map::new();
        for (index, column) in columns.iter().enumerate() {
            let value = match row.get_ref(index).map_err(|error| error.to_string())? {
                ValueRef::Null => Value::Null,
                ValueRef::Integer(number) => Value::Number(number.into()),
                ValueRef::Real(number) => Number::from_f64(number).map(Value::Number).unwrap_or(Value::Null),
                ValueRef::Text(text) => Value::String(String::from_utf8_lossy(text).into_owned()),
                ValueRef::Blob(_) => return Err(format!("A tabela contém um campo binário não suportado: {column}")),
            };
            record.insert(column.clone(), value);
        }
        output.push(Value::Object(record));
    }
    Ok(Value::Array(output))
}

#[command]
pub fn remove_legacy_database(app: AppHandle) -> Result<(), String> {
    let path = database_path(&app)?;
    for path in [
        path.clone(),
        PathBuf::from(format!("{}-wal", path.display())),
        PathBuf::from(format!("{}-shm", path.display())),
    ] {
        if path.exists() {
            fs::remove_file(&path).map_err(|error| format!("Não foi possível remover {}: {error}", path.display()))?;
        }
    }
    Ok(())
}
