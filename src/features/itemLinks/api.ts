import { invoke, isTauri } from "@tauri-apps/api/core"
import { supabase } from "../../services/supabase"
import { ItemLink } from "../../types/ItemLink"

function client() {
  if (!supabase) throw new Error("Configure o Supabase para usar os dados na nuvem.")
  return supabase
}

export async function listLinksByItem(itemId: number): Promise<ItemLink[]> {
  const { data, error } = await client().from("app_item_links")
    .select("id,uuid,item_id,store_name,url,price,created_at,last_checked_at")
    .eq("item_id", itemId).order("store_name")
  if (error) throw error
  return (data ?? []) as ItemLink[]
}

export async function createLink(itemId: number, storeName: string, url: string, price?: number): Promise<void> {
  const { error } = await client().from("app_item_links").insert({
    uuid: crypto.randomUUID(), item_id: itemId, store_name: storeName, url, price: price ?? null,
  })
  if (error) throw error
}

export async function deleteLink(id: number): Promise<void> {
  const { error } = await client().from("app_item_links").delete().eq("id", id)
  if (error) throw error
}

export type ItemLinkPricePoint = {
  id: number
  item_link_id: number
  price: number
  observed_at: string
}

export async function listItemLinkPriceHistory(itemId: number): Promise<ItemLinkPricePoint[]> {
  const api = client()
  const { data: links, error: linksError } = await api.from("app_item_links").select("id").eq("item_id", itemId)
  if (linksError) throw linksError
  if (!links?.length) return []
  const { data, error } = await api.from("app_item_link_price_history")
    .select("id,item_link_id,price,observed_at").in("item_link_id", links.map((link) => link.id)).order("observed_at")
  if (error) throw error
  return (data ?? []) as ItemLinkPricePoint[]
}

export async function refreshStalePrices(): Promise<void> {
  const api = client()
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const { data: links, error } = await api.from("app_item_links")
    .select("id,url")
    .or(`last_checked_at.is.null,last_checked_at.lte.${cutoff}`)
    .not("url", "ilike", "%google.com/search?tbm=shop%")
    .order("last_checked_at", { ascending: true, nullsFirst: true })
    .limit(3)
  if (error) throw error

  for (const link of links ?? []) {
    let price: number | null = null
    try { price = await fetchPriceFromUrl(link.url) } catch { /* preço externo é auxiliar */ }
    const observedAt = new Date().toISOString()
    const patch: { last_checked_at: string; price?: number } = { last_checked_at: observedAt }
    if (price !== null && price > 0) patch.price = price
    const { error: updateError } = await api.from("app_item_links").update(patch).eq("id", link.id)
    if (updateError) throw updateError
    if (price !== null && price > 0) {
      const { error: historyError } = await api.from("app_item_link_price_history").upsert({
        item_link_id: link.id, price, observed_at: observedAt,
      }, { onConflict: "owner_id,item_link_id,price,observed_at", ignoreDuplicates: true })
      if (historyError) throw historyError
    }
  }
}

export function startPriceRefreshSchedule() {
  if (!isTauri()) return () => undefined
  const refresh = () => {
    if (!supabase) return
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) return refreshStalePrices()
    }).catch(() => undefined)
  }
  const { data: listener } = supabase?.auth.onAuthStateChange((_event, session) => {
    if (session) refresh()
  }) ?? { data: { subscription: { unsubscribe: () => undefined } } }
  const timer = window.setInterval(refresh, 60 * 60 * 1000)
  return () => {
    window.clearInterval(timer)
    listener.subscription.unsubscribe()
  }
}

export function fetchPriceFromUrl(url: string): Promise<number | null> {
  return invoke("fetch_price_from_url", { url })
}

export function fetchAveragePriceGoogleShopping(query: string): Promise<number | null> {
  return invoke("fetch_average_price_google_shopping", { query })
}

export type ShoppingOffer = { store_name: string; url: string; price: number }

export function fetchTopShoppingOffers(query: string): Promise<ShoppingOffer[]> {
  return invoke("fetch_top_shopping_offers", { query })
}

export type StoreOffer = { store_name: string; url: string; price: number }

export function fetchStoreOffer(query: string, store: string): Promise<StoreOffer | null> {
  return invoke("fetch_store_offer", { query, store })
}
