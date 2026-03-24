import { invoke } from "@tauri-apps/api/core"
import { ItemLink } from "../../types/ItemLink"

export function listLinksByItem(itemId: number): Promise<ItemLink[]> {
  return invoke("list_links_by_item", { itemId })
}

export function createLink(
  itemId: number,
  storeName: string,
  url: string,
  price?: number
): Promise<void> {
  return invoke("create_item_link", {
    itemId,
    storeName,
    url,
    price: price ?? null,
  })
}

export function deleteLink(id: number): Promise<void> {
  return invoke("delete_link", { id })
}

export function fetchPriceFromUrl(url: string): Promise<number | null> {
  return invoke("fetch_price_from_url", { url })
}

export function fetchAveragePriceGoogleShopping(
  query: string
): Promise<number | null> {
  return invoke("fetch_average_price_google_shopping", { query })
}

export type ShoppingOffer = {
  store_name: string
  url: string
  price: number
}

export function fetchTopShoppingOffers(
  query: string,
  apiKey?: string
): Promise<ShoppingOffer[]> {
  return invoke("fetch_top_shopping_offers", { query, apiKey: apiKey ?? null })
}

export type StoreOffer = {
  store_name: string
  url: string
  price: number
}

export function fetchStoreOffer(
  query: string,
  store: string,
  apiKey?: string
): Promise<StoreOffer | null> {
  return invoke("fetch_store_offer", {
    query,
    store,
    apiKey: apiKey ?? null,
  })
}
