use serde::Serialize;

#[derive(Serialize)]
pub struct Category {
    pub id: i32,
    pub uuid: String,
    pub name: String,
    pub created_at: String,
}
