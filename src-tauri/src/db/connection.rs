use directories::ProjectDirs;
use rusqlite::Connection;
use std::{fs, path::PathBuf, sync::OnceLock};

static APP_DATA_DIR: OnceLock<PathBuf> = OnceLock::new();

pub fn set_app_data_dir(path: PathBuf) {
    let _ = APP_DATA_DIR.set(path);
}

fn resolve_data_dir() -> Result<PathBuf, String> {
    if let Some(dir) = APP_DATA_DIR.get() {
        return Ok(dir.clone());
    }

    ProjectDirs::from("com", "gustavo", "lista-compras")
        .map(|dirs| dirs.data_dir().to_path_buf())
        .ok_or_else(|| "Nao foi possivel obter AppData".to_string())
}

pub fn get_connection() -> Result<Connection, String> {
    let data_dir = resolve_data_dir()?;

    fs::create_dir_all(&data_dir)
        .map_err(|e| format!("Erro ao criar diretorio de dados: {e}"))?;

    let db_path = data_dir.join("database.sqlite");

    let conn = Connection::open(&db_path)
        .map_err(|e| format!("Erro ao abrir banco de dados em {}: {e}", db_path.display()))?;

    conn.execute("PRAGMA foreign_keys = ON;", [])
        .map_err(|e| format!("Erro ao habilitar foreign keys: {e}"))?;

    Ok(conn)
}
