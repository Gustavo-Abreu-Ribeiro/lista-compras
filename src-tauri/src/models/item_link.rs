use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct ItemLink {
    pub id: i32,
    pub uuid: String,
    pub item_id: i32,
    pub store_name: String,
    pub url: String,
    pub price: Option<f64>,
    pub created_at: String,
}

#[derive(Debug, Serialize)]
pub struct ItemLinkPricePoint {
    pub id: i32,
    pub item_link_id: i32,
    pub price: f64,
    pub observed_at: String,
}
