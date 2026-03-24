import { invoke } from "@tauri-apps/api/core"
import { Category } from "../../types/Category"

export function listCategories(): Promise<Category[]> {
  return invoke("list_categories")
}

export function createCategory(name: string): Promise<void> {
  return invoke("create_category", { name })
}
export function deleteCategory(id: number): Promise<void> {
  return invoke("delete_category", { id })
}
