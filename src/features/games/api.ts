import { supabase } from "../../services/supabase"

export type GameStatus = "backlog" | "playing" | "finished"
export type Game = { id: string; name: string; url: string; status: GameStatus; updated_at: string }

function client() {
  if (!supabase) throw new Error("Configure o Supabase para acessar sua lista de jogos.")
  return supabase
}

export async function listGames(): Promise<Game[]> {
  const { data, error } = await client().from("app_games")
    .select("id,name,url,status,updated_at").order("updated_at", { ascending: false })
  if (error) throw error
  return (data ?? []) as Game[]
}

export async function createGame(name: string, url: string): Promise<Game> {
  const { data, error } = await client().from("app_games")
    .insert({ name: name.trim(), url: url.trim(), status: "backlog" })
    .select("id,name,url,status,updated_at").single()
  if (error) throw error
  return data as Game
}

export async function deleteGame(id: string): Promise<void> {
  const { error } = await client().from("app_games").delete().eq("id", id)
  if (error) throw error
}

export async function setGameStatus(id: string, status: GameStatus, updatedAt: string): Promise<void> {
  const { error } = await client().from("app_games").update({ status, updated_at: updatedAt }).eq("id", id)
  if (error) throw error
}
