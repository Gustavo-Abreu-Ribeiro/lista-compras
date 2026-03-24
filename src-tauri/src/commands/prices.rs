use reqwest::blocking::Client;
use scraper::{Html, Selector};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::time::Duration;
use tauri::command;

#[command]
pub fn fetch_price_from_url(url: String) -> Result<Option<f64>, String> {
    if !url.starts_with("http://") && !url.starts_with("https://") {
        return Ok(None);
    }

    let client = Client::builder()
        .user_agent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36")
        .timeout(Duration::from_secs(12))
        .build()
        .map_err(|e| e.to_string())?;

    let response = client.get(&url).send().map_err(|e| e.to_string())?;
    if !response.status().is_success() {
        return Ok(None);
    }

    let body = response.text().map_err(|e| e.to_string())?;
    Ok(extract_price_from_html(&body))
}

#[command]
pub fn fetch_average_price_google_shopping(query: String) -> Result<Option<f64>, String> {
    let api_key = match std::env::var("SERPAPI_KEY") {
        Ok(value) if !value.trim().is_empty() => value,
        _ => return Ok(None),
    };

    let client = Client::builder()
        .user_agent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36")
        .timeout(Duration::from_secs(12))
        .build()
        .map_err(|e| e.to_string())?;

    let response = client
        .get("https://serpapi.com/search.json")
        .query(&[
            ("engine", "google_shopping"),
            ("q", query.trim()),
            ("hl", "pt"),
            ("gl", "br"),
            ("api_key", api_key.as_str()),
        ])
        .send()
        .map_err(|e| e.to_string())?;

    if !response.status().is_success() {
        return Ok(None);
    }

    let body: Value = response.json().map_err(|e| e.to_string())?;
    let results = match body.get("shopping_results") {
        Some(Value::Array(items)) => items,
        _ => return Ok(None),
    };

    let mut total = 0.0;
    let mut count = 0;

    for item in results.iter().take(10) {
        if let Some(price) = item.get("extracted_price").and_then(|value| value.as_f64()) {
            if price > 0.0 {
                total += price;
                count += 1;
            }
        }
    }

    if count == 0 {
        return Ok(None);
    }

    Ok(Some(total / count as f64))
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ShoppingOffer {
    pub store_name: String,
    pub url: String,
    pub price: f64,
}

#[command]
pub fn fetch_top_shopping_offers(
    query: String,
    api_key: Option<String>,
) -> Result<Vec<ShoppingOffer>, String> {
    let api_key = match api_key {
        Some(value) if !value.trim().is_empty() => value,
        _ => return Ok(vec![]),
    };

    let client = Client::builder()
        .user_agent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36")
        .timeout(Duration::from_secs(12))
        .build()
        .map_err(|e| e.to_string())?;

    let response = client
        .get("https://serpapi.com/search.json")
        .query(&[
            ("engine", "google_shopping"),
            ("q", query.trim()),
            ("hl", "pt"),
            ("gl", "br"),
            ("api_key", api_key.as_str()),
        ])
        .send()
        .map_err(|e| e.to_string())?;

    if !response.status().is_success() {
        return Ok(vec![]);
    }

    let body: Value = response.json().map_err(|e| e.to_string())?;
    let results = match body.get("shopping_results") {
        Some(Value::Array(items)) => items,
        _ => return Ok(vec![]),
    };

        let mut offers = Vec::new();

    let allowed = [
        "amazon",
        "kabum",
        "ka bu m",
        "terabyte",
        "terabyteshop",
        "mercado livre",
        "mercadolivre",
        "magazine luiza",
        "magazineluiza",
        "casas bahia",
        "extra",
        "americanas",
        "shopee",
        "fast shop",
        "pichau",
    ];

    for item in results.iter() {
        let price = item.get("extracted_price").and_then(|value| value.as_f64());
        let url = item
            .get("link")
            .and_then(|value| value.as_str())
            .map(|value| value.to_string());
        let store_name = item
            .get("source")
            .and_then(|value| value.as_str())
            .map(|value| value.to_string())
            .unwrap_or_else(|| "Loja".to_string());

        if let (Some(price), Some(url)) = (price, url) {
            let store_lower = store_name.to_lowercase();
            let is_allowed = allowed.iter().any(|needle| store_lower.contains(needle));
            if is_allowed {
                offers.push(ShoppingOffer {
                    store_name,
                    url,
                    price,
                });
            }
        }
    }

    offers.sort_by(|a, b| a.price.partial_cmp(&b.price).unwrap_or(std::cmp::Ordering::Equal));
    offers.truncate(3);

    Ok(offers)
}
fn extract_price_from_html(body: &str) -> Option<f64> {
    let document = Html::parse_document(body);
    let selector = Selector::parse(
        "meta[property='product:price:amount'], \
         meta[property='og:price:amount'], \
         meta[property='og:price'], \
         meta[itemprop='price'], \
         meta[name='price'], \
         meta[property='product:price']",
    )
    .ok()?;

    for element in document.select(&selector) {
        if let Some(content) = element.value().attr("content") {
            if let Some(price) = parse_price_str(content) {
                return Some(price);
            }
        }
    }

    let json_selector = Selector::parse("script[type='application/ld+json']").ok()?;
    for element in document.select(&json_selector) {
        let json_text = element.text().collect::<String>();
        if let Some(price) = price_from_jsonld(&json_text) {
            return Some(price);
        }
    }

    let text_selectors = [
        "#priceblock_ourprice",
        "#priceblock_dealprice",
        "#priceblock_saleprice",
        "span.a-price span.a-offscreen",
        "span.a-price-whole",
    ];

    for selector_str in text_selectors {
        if let Ok(selector) = Selector::parse(selector_str) {
            for element in document.select(&selector) {
                let text = element.text().collect::<String>();
                if let Some(price) = parse_price_str(&text) {
                    return Some(price);
                }
            }
        }
    }

    None
}

fn price_from_jsonld(text: &str) -> Option<f64> {
    let parsed: Value = serde_json::from_str(text).ok()?;
    find_price_in_value(&parsed)
}

fn find_price_in_value(value: &Value) -> Option<f64> {
    match value {
        Value::Object(map) => {
            if let Some(price_value) = map.get("price") {
                if let Some(price) = value_to_price(price_value) {
                    return Some(price);
                }
            }
            if let Some(offers) = map.get("offers") {
                if let Some(price) = find_price_in_value(offers) {
                    return Some(price);
                }
            }
            for entry in map.values() {
                if let Some(price) = find_price_in_value(entry) {
                    return Some(price);
                }
            }
            None
        }
        Value::Array(items) => items.iter().find_map(find_price_in_value),
        _ => None,
    }
}

fn value_to_price(value: &Value) -> Option<f64> {
    match value {
        Value::Number(number) => number.as_f64(),
        Value::String(text) => parse_price_str(text),
        _ => None,
    }
}

fn parse_price_str(input: &str) -> Option<f64> {
    let trimmed = input.trim();
    if trimmed.is_empty() {
        return None;
    }

    let mut cleaned: String = trimmed
        .chars()
        .filter(|c| c.is_ascii_digit() || *c == ',' || *c == '.')
        .collect();

    if cleaned.is_empty() {
        return None;
    }

    let last_comma = cleaned.rfind(',');
    let last_dot = cleaned.rfind('.');

    match (last_comma, last_dot) {
        (Some(comma), Some(dot)) => {
            if comma > dot {
                cleaned = cleaned.replace('.', "");
                cleaned = cleaned.replace(',', ".");
            } else {
                cleaned = cleaned.replace(',', "");
            }
        }
        (Some(_), None) => {
            cleaned = cleaned.replace(',', ".");
        }
        _ => {}
    }

    cleaned.parse::<f64>().ok()
}




#[derive(Debug, Serialize, Deserialize)]
pub struct StoreOffer {
    pub store_name: String,
    pub url: String,
    pub price: f64,
}

#[command]
pub fn fetch_store_offer(
    query: String,
    store: String,
    api_key: Option<String>,
) -> Result<Option<StoreOffer>, String> {
    let api_key = match api_key {
        Some(value) if !value.trim().is_empty() => value,
        _ => return Ok(None),
    };

    let client = Client::builder()
        .user_agent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36")
        .timeout(Duration::from_secs(12))
        .build()
        .map_err(|e| e.to_string())?;

    let response = client
        .get("https://serpapi.com/search.json")
        .query(&[
            ("engine", "google_shopping"),
            ("q", query.trim()),
            ("hl", "pt"),
            ("gl", "br"),
            ("api_key", api_key.as_str()),
        ])
        .send()
        .map_err(|e| e.to_string())?;

    if !response.status().is_success() {
        return Ok(None);
    }

    let body: Value = response.json().map_err(|e| e.to_string())?;
    let results = match body.get("shopping_results") {
        Some(Value::Array(items)) => items,
        _ => return Ok(None),
    };

    let store_lower = store.to_lowercase();

    for item in results.iter() {
        let price = item.get("extracted_price").and_then(|value| value.as_f64());
        let url = item
            .get("link")
            .and_then(|value| value.as_str())
            .map(|value| value.to_string());
        let store_name = item
            .get("source")
            .and_then(|value| value.as_str())
            .map(|value| value.to_string())
            .unwrap_or_else(|| "Loja".to_string());

        if let (Some(price), Some(url)) = (price, url) {
            if store_name.to_lowercase().contains(&store_lower) {
                return Ok(Some(StoreOffer {
                    store_name,
                    url,
                    price,
                }));
            }
        }
    }

    Ok(None)
}

