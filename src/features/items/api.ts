import { supabase } from "../../services/supabase"
import { Item } from "../../types/Item"

function client() {
  if (!supabase) throw new Error("Configure o Supabase para usar os dados na nuvem.")
  return supabase
}

export async function listItemsByCategory(categoryId: number): Promise<Item[]> {
  const { data, error } = await client().from("app_items").select("id,uuid,name,category_id,notes,created_at").eq("category_id", categoryId).order("name")
  if (error) throw error
  return (data ?? []) as Item[]
}

export async function createItem(name: string, categoryId: number, notes?: string): Promise<void> {
  const { error } = await client().from("app_items").insert({
    uuid: crypto.randomUUID(), name, category_id: categoryId, notes: notes ?? null,
  })
  if (error) throw error
}

export async function deleteItem(id: number): Promise<void> {
  const { error } = await client().from("app_items").delete().eq("id", id)
  if (error) throw error
}
