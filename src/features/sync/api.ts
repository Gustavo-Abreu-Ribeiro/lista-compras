import { invoke } from "@tauri-apps/api/core"

export function upsertCategory(
  uuid: string,
  name: string,
  createdAt: string
): Promise<number> {
  return invoke("upsert_category", { uuid, name, createdAt })
}

export function upsertItem(
  uuid: string,
  name: string,
  categoryUuid: string,
  notes: string | null | undefined,
  createdAt: string
): Promise<number> {
  return invoke("upsert_item", {
    uuid,
    name,
    categoryUuid,
    notes: notes ?? null,
    createdAt,
  })
}

export function upsertItemLink(
  uuid: string,
  itemUuid: string,
  storeName: string,
  url: string,
  price: number | null,
  createdAt: string
): Promise<number> {
  return invoke("upsert_item_link", {
    uuid,
    itemUuid,
    storeName,
    url,
    price,
    createdAt,
  })
}
