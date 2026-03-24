use serde::Serialize;

#[derive(Serialize)]
pub struct Item {
    pub id: i32,
    pub uuid: String,
    pub name: String,
    pub category_id: i32,
    pub notes: Option<String>,
    pub created_at: String,
}
