import { invoke } from "@tauri-apps/api/core"
import { supabase } from "../../services/supabase"

type Row = Record<string, unknown>
type LegacyExport = { has_database: boolean; tables: Record<string, Row[]> }
const migrationVersion = "sqlite-business-v1"
const batchSize = 250

function getMigrationKey(): string {
  const storageKey = "lista-compras:sqlite-migration-id"
  let installationId = localStorage.getItem(storageKey)
  if (!installationId) {
    installationId = crypto.randomUUID()
    localStorage.setItem(storageKey, installationId)
  }
  return `${migrationVersion}:${installationId}`
}

function client() {
  if (!supabase) throw new Error("Configure o Supabase antes de migrar os dados locais.")
  return supabase
}

function rows(data: LegacyExport, table: string) { return data.tables[table] ?? [] }
function uuid(row: Row): string {
  if (typeof row.uuid !== "string" || !/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(row.uuid)) {
    throw new Error("A base local contém um UUID inválido. Nenhum dado local foi removido.")
  }
  return row.uuid
}
function requiredId(value: unknown, mapping: Map<number, number>, field: string): number {
  const localId = Number(value)
  const remoteId = mapping.get(localId)
  if (remoteId === undefined) throw new Error(`Não foi possível relacionar ${field} durante a importação.`)
  return remoteId
}
function optionalId(value: unknown, mapping: Map<number, number>, field: string): number | null {
  return value === null || value === undefined ? null : requiredId(value, mapping, field)
}

async function upsertRows(table: string, values: Row[], conflict = "owner_id,uuid") {
  const api = client()
  for (let start = 0; start < values.length; start += batchSize) {
    const { error } = await api.from(table).upsert(values.slice(start, start + batchSize), { onConflict: conflict })
    if (error) throw new Error(`Falha ao importar ${table}: ${error.message}`)
  }
}

async function idMap(table: string, localRows: Row[]): Promise<Map<number, number>> {
  const api = client()
  const result = new Map<number, number>()
  const uuids = [...new Set(localRows.map(uuid))]
  for (let start = 0; start < uuids.length; start += batchSize) {
    const batch = uuids.slice(start, start + batchSize)
    const { data, error } = await api.from(table).select("id,uuid").in("uuid", batch)
    if (error) throw new Error(`Falha ao conferir UUIDs importados em ${table}: ${error.message}`)
    const byUuid = new Map((data ?? []).map((row) => [row.uuid, Number(row.id)]))
    for (const local of localRows) {
      const remote = byUuid.get(uuid(local))
      if (remote !== undefined) result.set(Number(local.id), remote)
    }
  }
  if (result.size !== localRows.length) throw new Error(`A conferência de UUIDs falhou em ${table}.`)
  return result
}

async function countRows(table: string): Promise<number> {
  const { count, error } = await client().from(table).select("id", { count: "exact", head: true })
  if (error) throw new Error(`Falha ao conferir ${table}: ${error.message}`)
  return count ?? 0
}

function legacyGames(): Row[] {
  if (typeof localStorage === "undefined") return []
  const raw = localStorage.getItem("lista-compras:games")
  if (!raw) return []
  const parsed = JSON.parse(raw) as Array<Record<string, unknown>>
  const seen = new Set<string>()
  return parsed.flatMap((game) => {
    const id = typeof game.id === "string" && /^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(game.id) ? game.id : crypto.randomUUID()
    if (seen.has(id)) return []
    seen.add(id)
    const status = game.status === "playing" || game.status === "finished" ? game.status : game.done ? "finished" : "backlog"
    const name = String(game.name ?? "").trim()
    const url = String(game.url ?? "").trim()
    return name && url ? [{ id, name, url, status, updated_at: typeof game.updated_at === "string" ? game.updated_at : new Date().toISOString() }] : []
  })
}

export async function legacyDatabaseExists(): Promise<boolean> {
  return invoke<boolean>("legacy_database_exists")
}

export async function getLegacyMigrationStatus() {
  const migrationKey = getMigrationKey()
  const [databaseExists, marker] = await Promise.all([
    legacyDatabaseExists(),
    client().from("app_data_imports").select("status").eq("migration_key", migrationKey).maybeSingle(),
  ])
  if (marker.error) throw new Error(`O esquema cloud ainda não foi aplicado: ${marker.error.message}`)
  return { databaseExists, imported: marker.data?.status === "completed" }
}

export async function importLegacyData(): Promise<{ imported: boolean; alreadyImported: boolean; counts: Record<string, number> }> {
  const migrationKey = getMigrationKey()
  const api = client()
  const { data: sessionData, error: sessionError } = await api.auth.getSession()
  if (sessionError || !sessionData.session) throw new Error("Entre na sua conta antes de importar os dados.")

  const { data: marker, error: markerError } = await api.from("app_data_imports")
    .select("status").eq("migration_key", migrationKey).maybeSingle()
  if (markerError) throw new Error(`O esquema cloud ainda não foi aplicado: ${markerError.message}`)
  if (marker?.status === "completed") return { imported: false, alreadyImported: true, counts: {} }

  const legacy = await invoke<LegacyExport>("export_legacy_data")
  const gameRows = legacyGames()
  if (!legacy.has_database && !marker && !gameRows.length) throw new Error("Não encontrei dados locais para importar.")

  if (!marker) {
    const protectedTables = [
      "app_categories", "app_items", "app_item_links", "app_item_link_price_history",
      "app_financial_accounts", "app_financial_categories", "app_financial_transactions",
      "app_financial_installments", "app_financial_goals", "app_financial_budgets",
      "app_financial_recurrences", "app_financial_debts", "app_games",
    ]
    for (const table of protectedTables) {
      if (await countRows(table)) throw new Error("Esta conta Supabase já contém dados. A importação foi interrompida para não sobrescrevê-los.")
    }
    const { error } = await api.from("app_data_imports").insert({ migration_key: migrationKey, status: "in_progress" })
    if (error) throw new Error(`Não foi possível iniciar a importação: ${error.message}`)
  }

  const counts: Record<string, number> = {}
  const categoryRows = rows(legacy, "categories")
  await upsertRows("app_categories", categoryRows.map((row) => ({ uuid: uuid(row), name: row.name, created_at: row.created_at })))
  const categoryIds = await idMap("app_categories", categoryRows)
  counts.categories = categoryRows.length

  const accountRows = rows(legacy, "financial_accounts")
  await upsertRows("app_financial_accounts", accountRows.map((row) => ({ uuid: uuid(row), name: row.name, account_type: row.account_type, opening_balance_cents: row.opening_balance_cents, created_at: row.created_at })))
  const accountIds = await idMap("app_financial_accounts", accountRows)
  counts.financial_accounts = accountRows.length

  const financeCategoryRows = rows(legacy, "financial_categories")
  await upsertRows("app_financial_categories", financeCategoryRows.map((row) => ({ uuid: uuid(row), name: row.name, kind: row.kind, is_essential: Boolean(row.is_essential), created_at: row.created_at })))
  const financeCategoryIds = await idMap("app_financial_categories", financeCategoryRows)
  counts.financial_categories = financeCategoryRows.length

  const recurrenceRows = rows(legacy, "financial_recurrences")
  await upsertRows("app_financial_recurrences", recurrenceRows.map((row) => ({ uuid: uuid(row), kind: row.kind, description: row.description, amount_cents: row.amount_cents, day_of_month: row.day_of_month, start_month: row.start_month, category_id: optionalId(row.category_id, financeCategoryIds, "categoria da recorrência"), account_id: optionalId(row.account_id, accountIds, "conta da recorrência"), active: Boolean(row.active), created_at: row.created_at })))
  const recurrenceIds = await idMap("app_financial_recurrences", recurrenceRows)
  counts.financial_recurrences = recurrenceRows.length

  const installmentRows = rows(legacy, "financial_installments")
  await upsertRows("app_financial_installments", installmentRows.map((row) => ({ uuid: uuid(row), description: row.description, amount_cents: row.amount_cents, due_on: row.due_on, category_id: optionalId(row.category_id, financeCategoryIds, "categoria da parcela"), account_id: optionalId(row.account_id, accountIds, "conta da parcela"), state: row.state, created_at: row.created_at })))
  const installmentIds = await idMap("app_financial_installments", installmentRows)
  counts.financial_installments = installmentRows.length

  const goalRows = rows(legacy, "financial_goals")
  await upsertRows("app_financial_goals", goalRows.map((row) => ({ uuid: uuid(row), name: row.name, target_cents: row.target_cents, saved_cents: row.saved_cents, due_on: row.due_on, priority: row.priority, contribution_min_cents: row.contribution_min_cents, contribution_ideal_cents: row.contribution_ideal_cents, created_at: row.created_at })))
  counts.financial_goals = goalRows.length

  const debtRows = rows(legacy, "financial_debts")
  await upsertRows("app_financial_debts", debtRows.map((row) => ({ uuid: uuid(row), name: row.name, balance_cents: row.balance_cents, monthly_payment_cents: row.monthly_payment_cents, due_day: row.due_day, created_at: row.created_at })))
  counts.financial_debts = debtRows.length

  const budgetRows = rows(legacy, "financial_budgets")
  await upsertRows("app_financial_budgets", budgetRows.map((row) => ({ uuid: uuid(row), category_id: requiredId(row.category_id, financeCategoryIds, "categoria do limite"), month: row.month, limit_cents: row.limit_cents, created_at: row.created_at ?? new Date().toISOString() })))
  counts.financial_budgets = budgetRows.length

  const transactionRows = rows(legacy, "financial_transactions")
  await upsertRows("app_financial_transactions", transactionRows.map((row) => ({ uuid: uuid(row), kind: row.kind, amount_cents: row.amount_cents, occurred_on: row.occurred_on, description: row.description, category_id: optionalId(row.category_id, financeCategoryIds, "categoria do lançamento"), account_id: optionalId(row.account_id, accountIds, "conta do lançamento"), status: row.status, recurrence_id: optionalId(row.recurrence_id, recurrenceIds, "recorrência do lançamento"), recurrence_month: row.recurrence_month, installment_id: optionalId(row.installment_id, installmentIds, "parcela do lançamento"), created_at: row.created_at })))
  counts.financial_transactions = transactionRows.length

  const itemRows = rows(legacy, "items")
  await upsertRows("app_items", itemRows.map((row) => ({ uuid: uuid(row), name: row.name, category_id: requiredId(row.category_id, categoryIds, "categoria do item"), notes: row.notes, created_at: row.created_at })))
  const itemIds = await idMap("app_items", itemRows)
  counts.items = itemRows.length

  const linkRows = rows(legacy, "item_links")
  await upsertRows("app_item_links", linkRows.map((row) => ({ uuid: uuid(row), item_id: requiredId(row.item_id, itemIds, "item do link"), store_name: row.store_name, url: row.url, price: row.price, created_at: row.created_at, last_checked_at: row.last_checked_at })))
  const linkIds = await idMap("app_item_links", linkRows)
  counts.item_links = linkRows.length

  const historyRows = rows(legacy, "item_link_price_history")
  await upsertRows("app_item_link_price_history", historyRows.map((row) => ({ item_link_id: requiredId(row.item_link_id, linkIds, "link do histórico de preço"), price: row.price, observed_at: row.observed_at })), "owner_id,item_link_id,price,observed_at")
  counts.item_link_price_history = historyRows.length

  const gameCount = gameRows.length
  await upsertRows("app_games", gameRows, "owner_id,id")
  counts.games = gameCount

  const tableByCount: Record<string, string> = {
    categories: "app_categories", items: "app_items", item_links: "app_item_links",
    item_link_price_history: "app_item_link_price_history", financial_accounts: "app_financial_accounts",
    financial_categories: "app_financial_categories", financial_transactions: "app_financial_transactions",
    financial_installments: "app_financial_installments", financial_goals: "app_financial_goals",
    financial_budgets: "app_financial_budgets", financial_recurrences: "app_financial_recurrences",
    financial_debts: "app_financial_debts", games: "app_games",
  }
  for (const [sourceTable, remoteTable] of Object.entries(tableByCount)) {
    const actual = await countRows(remoteTable)
    const expected = counts[sourceTable]
    if (sourceTable === "item_link_price_history" ? actual < expected : actual !== expected) {
      throw new Error(`A quantidade importada em ${remoteTable} não confere. Os dados locais foram preservados.`)
    }
  }

  const { error: completeError } = await api.from("app_data_imports").update({ status: "completed", completed_at: new Date().toISOString() }).eq("migration_key", migrationKey)
  if (completeError) throw new Error(`Os dados foram enviados, mas não foi possível concluir a marcação da importação: ${completeError.message}`)
  if (typeof localStorage !== "undefined") localStorage.removeItem("lista-compras:games")
  return { imported: true, alreadyImported: false, counts }
}

export const removeLegacyDatabase = () => invoke<void>("remove_legacy_database")
