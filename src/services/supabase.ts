import { createClient, type Session, type SupabaseClient } from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null

export function getListId() {
  if (typeof localStorage === "undefined") return ""
  const key = "lista-compras:list-id"
  let listId = localStorage.getItem(key)
  if (!listId) {
    listId = crypto?.randomUUID?.() ?? fallbackId()
    localStorage.setItem(key, listId)
  }
  return listId
}

export function setListId(value: string) {
  if (typeof localStorage === "undefined") return
  const key = "lista-compras:list-id"
  localStorage.setItem(key, value)
}

export function getActiveListId(session?: Session | null) {
  if (session?.user?.id) return session.user.id
  return getListId()
}

function fallbackId() {
  return `list-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`
}
