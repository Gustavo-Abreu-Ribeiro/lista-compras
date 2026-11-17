import { supabase } from "../../services/supabase"
import { Category } from "../../types/Category"

function client() {
  if (!supabase) throw new Error("Configure VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY para usar os dados na nuvem.")
  return supabase
}

export async function listCategories(): Promise<Category[]> {
  const { data, error } = await client().from("app_categories").select("id,uuid,name,created_at").order("name")
  if (error) throw error
  return (data ?? []) as Category[]
}

export async function createCategory(name: string): Promise<void> {
  const { error } = await client().from("app_categories").insert({ uuid: crypto.randomUUID(), name })
  if (error) throw error
}

export async function deleteCategory(id: number): Promise<void> {
  const { error } = await client().from("app_categories").delete().eq("id", id)
  if (error) throw error
}
