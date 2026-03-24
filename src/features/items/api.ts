import { invoke } from "@tauri-apps/api/core"
import { Item } from "../../types/Item"

export function listItemsByCategory(categoryId: number): Promise<Item[]> {
  return invoke("list_items_by_category", {
    categoryId, // 👈 snake_case
  })
}

export function createItem(
  name: string,
  categoryId: number,
  notes?: string
): Promise<void> {
  return invoke("create_item", {
    name,
    categoryId, // 👈 snake_case
    notes: notes ?? null,
  })
}
export function deleteItem(id: number): Promise<void> {
  return invoke("delete_item", { id })
}
