import { supabase } from "../../services/supabase"
import { installmentSchedule } from "./installmentSchedule"
import type {
  FinancialAccount, FinancialBudget, FinancialCategory, FinancialDashboard,
  FinancialDebt, FinancialDebtInstallment, FinancialGoal, FinancialHistoryPoint, FinancialInstallment,
  FinancialRecurrence, FinancialTransaction,
} from "../../types/Finance"

function client() {
  if (!supabase) throw new Error("Configure o Supabase para acessar os dados financeiros.")
  return supabase
}

async function read<T>(query: PromiseLike<{ data: unknown; error: { message: string } | null }>): Promise<T> {
  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data as T
}

export const listFinancialAccounts = () => read<FinancialAccount[]>(client().from("app_financial_accounts").select("id,name,account_type,opening_balance_cents").order("name"))
export async function createFinancialAccount(name: string, accountType: string, openingBalanceCents: number): Promise<void> {
  await read(client().from("app_financial_accounts").insert({ uuid: crypto.randomUUID(), name: name.trim(), account_type: accountType, opening_balance_cents: openingBalanceCents }))
}
export const listFinancialCategories = () => read<FinancialCategory[]>(client().from("app_financial_categories").select("id,name,kind,is_essential").order("name"))
export async function createFinancialCategory(name: string, kind: string, isEssential: boolean): Promise<FinancialCategory> {
  return read<FinancialCategory>(client().from("app_financial_categories")
    .insert({ uuid: crypto.randomUUID(), name: name.trim(), kind, is_essential: isEssential })
    .select("id,name,kind,is_essential").single())
}

function monthBounds(month: string) {
  const [year, monthIndex] = month.split("-").map(Number)
  const start = new Date(Date.UTC(year, monthIndex - 1, 1))
  const end = new Date(Date.UTC(year, monthIndex, 1))
  return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) }
}

async function materializeRecurrences(month: string) {
  const api = client()
  const recurrences = await read<FinancialRecurrence[]>(api.from("app_financial_recurrences")
    .select("id,kind,description,amount_cents,day_of_month,start_month,category_id,account_id,active")
    .eq("active", true).lte("start_month", month))
  if (!recurrences.length) return
  const [year, monthIndex] = month.split("-").map(Number)
  const monthDays = new Date(Date.UTC(year, monthIndex, 0)).getUTCDate()
  const rows = recurrences.map((recurrence) => ({
    uuid: crypto.randomUUID(), kind: recurrence.kind, amount_cents: recurrence.amount_cents,
    occurred_on: `${month}-${String(Math.min(recurrence.day_of_month, monthDays)).padStart(2, "0")}`,
    description: recurrence.description, category_id: recurrence.category_id,
    account_id: recurrence.account_id, status: "planned", recurrence_id: recurrence.id,
    recurrence_month: month,
  }))
  await read(api.from("app_financial_transactions").upsert(rows, {
    onConflict: "owner_id,recurrence_id,recurrence_month", ignoreDuplicates: true,
  }))
}

export async function listFinancialTransactions(month: string): Promise<FinancialTransaction[]> {
  await materializeRecurrences(month)
  const { start, end } = monthBounds(month)
  return read(client().from("app_financial_transactions")
    .select("id,kind,amount_cents,occurred_on,description,category_id,account_id,status,recurrence_id,installment_id")
    .gte("occurred_on", start).lt("occurred_on", end).order("occurred_on", { ascending: false }).order("id", { ascending: false }))
}

export async function listFinancialHistory(month: string): Promise<FinancialHistoryPoint[]> {
  const [year, monthIndex] = month.split("-").map(Number)
  const start = new Date(Date.UTC(year, monthIndex - 5, 1))
  const end = new Date(Date.UTC(year, monthIndex + 1, 1))
  const rows = await read<Array<Pick<FinancialTransaction, "kind" | "amount_cents" | "occurred_on" | "status">>>(
    client().from("app_financial_transactions").select("kind,amount_cents,occurred_on,status")
      .eq("status", "posted").gte("occurred_on", start.toISOString().slice(0, 10)).lt("occurred_on", end.toISOString().slice(0, 10)),
  )
  const totals = new Map<string, FinancialHistoryPoint>()
  for (let offset = 0; offset < 6; offset++) {
    const date = new Date(Date.UTC(year, monthIndex - 5 + offset, 1))
    const key = date.toISOString().slice(0, 7)
    totals.set(key, { month: key, income_cents: 0, spent_cents: 0 })
  }
  for (const row of rows) {
    const point = totals.get(row.occurred_on.slice(0, 7))
    if (!point) continue
    if (row.kind === "income") point.income_cents += row.amount_cents
    if (row.kind === "expense") point.spent_cents += row.amount_cents
  }
  return [...totals.values()]
}

export async function createFinancialTransaction(kind: string, amountCents: number, occurredOn: string, description: string, categoryId: number | null, accountId: number | null, status: string): Promise<void> {
  await read(client().from("app_financial_transactions").insert({
    uuid: crypto.randomUUID(), kind, amount_cents: amountCents, occurred_on: occurredOn,
    description: description.trim(), category_id: categoryId, account_id: accountId, status,
  }))
}
export async function setFinancialTransactionStatus(id: number, status: string): Promise<void> {
  await read(client().from("app_financial_transactions").update({ status }).eq("id", id))
}

export async function deleteFinancialTransaction(id: number): Promise<void> {
  const api = client()
  const transaction = await read<{ recurrence_id: number | null; installment_id: number | null }>(
    api.from("app_financial_transactions").select("recurrence_id,installment_id").eq("id", id).single(),
  )
  if (transaction.recurrence_id !== null || transaction.installment_id !== null) {
    throw new Error("Este lançamento pertence a uma recorrência ou parcela. Edite-o pelo planejamento para manter os compromissos consistentes.")
  }
  await read(api.from("app_financial_transactions").delete().eq("id", id))
}

export async function createFinancialInstallment(description: string, totalCents: number, installmentCount: number, firstDueOn: string, categoryId: number | null, accountId: number | null): Promise<void> {
  const rows = installmentSchedule(totalCents, installmentCount, firstDueOn).map((installment) => ({
    uuid: crypto.randomUUID(), description: description.trim(),
    ...installment, category_id: categoryId, account_id: accountId, state: "pending",
  }))
  await read(client().from("app_financial_installments").insert(rows))
}
export async function listFinancialInstallments(month: string): Promise<FinancialInstallment[]> {
  const { start, end } = monthBounds(month)
  // A consulta mensal também atende contas que ainda usam o schema inicial.
  // O vínculo com dívidas é consultado separadamente pelo planejamento.
  return read(client().from("app_financial_installments").select("id,description,amount_cents,due_on,state")
    .gte("due_on", start).lt("due_on", end).order("due_on"))
}
export const listFinancialDebtInstallments = () => read<FinancialDebtInstallment[]>(
  client().from("app_financial_installments")
    .select("id,debt_id,description,amount_cents,due_on,state")
    .not("debt_id", "is", null).order("due_on"),
)
export async function createFinancialDebtPlan(name: string, balanceCents: number, installmentCount: number, installmentCents: number, firstDueOn: string): Promise<void> {
  await read(client().rpc("app_create_financial_debt_plan", {
    p_name: name.trim(), p_balance_cents: balanceCents,
    p_installment_count: installmentCount, p_installment_cents: installmentCents,
    p_first_due_on: firstDueOn,
  }))
}
export async function setFinancialDebtPlan(debtId: number, installmentCount: number, installmentCents: number, firstDueOn: string): Promise<void> {
  await read(client().rpc("app_set_financial_debt_plan", {
    p_debt_id: debtId, p_installment_count: installmentCount,
    p_installment_cents: installmentCents, p_first_due_on: firstDueOn,
  }))
}
export async function markFinancialInstallmentPaid(id: number): Promise<void> {
  await read(client().rpc("app_mark_financial_installment_paid", { p_installment_id: id }))
}

export const listFinancialGoals = () => read<FinancialGoal[]>(client().from("app_financial_goals")
  .select("id,name,target_cents,saved_cents,due_on,priority,contribution_min_cents,contribution_ideal_cents").order("priority"))
export async function createFinancialGoal(name: string, targetCents: number, savedCents: number, dueOn: string | null, priority: number, contributionMinCents: number, contributionIdealCents: number): Promise<void> {
  await read(client().from("app_financial_goals").insert({ uuid: crypto.randomUUID(), name: name.trim(), target_cents: targetCents, saved_cents: savedCents, due_on: dueOn, priority, contribution_min_cents: contributionMinCents, contribution_ideal_cents: contributionIdealCents }))
}

export async function getFinancialDashboard(month: string): Promise<FinancialDashboard> {
  await materializeRecurrences(month)
  const api = client()
  const { start, end } = monthBounds(month)
  const [accounts, transactions, monthTransactions, installments, goals, budgets] = await Promise.all([
    read<FinancialAccount[]>(api.from("app_financial_accounts").select("id,name,account_type,opening_balance_cents")),
    read<Array<Pick<FinancialTransaction, "kind" | "amount_cents" | "status">>>(api.from("app_financial_transactions").select("kind,amount_cents,status").eq("status", "posted")),
    read<FinancialTransaction[]>(api.from("app_financial_transactions").select("id,kind,amount_cents,occurred_on,description,category_id,account_id,status").gte("occurred_on", start).lt("occurred_on", end)),
    read<Array<FinancialInstallment & { category_id: number | null }>>(api.from("app_financial_installments").select("id,description,amount_cents,due_on,state,category_id").gte("due_on", start).lt("due_on", end)),
    read<FinancialGoal[]>(api.from("app_financial_goals").select("id,name,target_cents,saved_cents,due_on,priority,contribution_min_cents,contribution_ideal_cents")),
    read<Array<Pick<FinancialBudget, "category_id" | "limit_cents">>>(api.from("app_financial_budgets").select("category_id,limit_cents").eq("month", month)),
  ])
  const currentBalance = accounts.reduce((sum, account) => sum + account.opening_balance_cents, 0)
    + transactions.reduce((sum, transaction) => sum + (transaction.kind === "income" ? transaction.amount_cents : -transaction.amount_cents), 0)
  const income = monthTransactions.filter((row) => row.kind === "income" && row.status === "posted").reduce((sum, row) => sum + row.amount_cents, 0)
  const spent = monthTransactions.filter((row) => row.kind === "expense" && row.status === "posted").reduce((sum, row) => sum + row.amount_cents, 0)
  const investments = monthTransactions.filter((row) => row.kind === "investment" && row.status === "posted").reduce((sum, row) => sum + row.amount_cents, 0)
  const plannedIncome = monthTransactions.filter((row) => row.kind === "income" && row.status === "planned").reduce((sum, row) => sum + row.amount_cents, 0)
  const plannedExpenses = monthTransactions.filter((row) => row.kind !== "income" && row.status === "planned").reduce((sum, row) => sum + row.amount_cents, 0)
  const pendingInstallments = installments.filter((row) => row.state === "pending")
  const installmentTotal = pendingInstallments.reduce((sum, row) => sum + row.amount_cents, 0)
  const goalMinimum = goals.reduce((sum, goal) => sum + goal.contribution_min_cents, 0)
  const budgetedRemaining = budgets.reduce((sum, budget) => {
    const postedByCategory = monthTransactions.filter((row) => row.category_id === budget.category_id && row.kind === "expense" && row.status === "posted").reduce((total, row) => total + row.amount_cents, 0)
    const plannedByCategory = monthTransactions.filter((row) => row.category_id === budget.category_id && row.kind === "expense" && row.status === "planned").reduce((total, row) => total + row.amount_cents, 0)
    const installmentByCategory = pendingInstallments.filter((row) => row.category_id === budget.category_id).reduce((total, row) => total + row.amount_cents, 0)
    return sum + Math.max(0, budget.limit_cents - postedByCategory - plannedByCategory - installmentByCategory)
  }, 0)
  const committed = plannedExpenses + installmentTotal + budgetedRemaining
  return {
    current_balance_cents: currentBalance,
    available_to_spend_cents: Math.max(0, currentBalance - committed - goalMinimum),
    committed_cents: committed,
    projected_end_cents: currentBalance + plannedIncome - committed - goalMinimum,
    income_cents: income, spent_cents: spent, investments_cents: investments,
    pending_bills_count: pendingInstallments.length, goal_minimum_cents: goalMinimum,
  }
}

export async function listFinancialBudgets(month: string): Promise<FinancialBudget[]> {
  const api = client()
  const { start, end } = monthBounds(month)
  const [budgets, transactions, installments] = await Promise.all([
    read<Array<Pick<FinancialBudget, "id" | "category_id" | "month" | "limit_cents">>>(api.from("app_financial_budgets").select("id,category_id,month,limit_cents").eq("month", month)),
    read<FinancialTransaction[]>(api.from("app_financial_transactions").select("kind,amount_cents,occurred_on,category_id,status").gte("occurred_on", start).lt("occurred_on", end)),
    read<Array<FinancialInstallment & { category_id: number | null }>>(api.from("app_financial_installments").select("id,description,amount_cents,due_on,state,category_id").gte("due_on", start).lt("due_on", end)),
  ])
  return budgets.map((budget) => {
    const related = transactions.filter((row) => row.category_id === budget.category_id && row.kind === "expense")
    const spent = related.filter((row) => row.status === "posted").reduce((sum, row) => sum + row.amount_cents, 0)
    const committed = related.filter((row) => row.status === "planned").reduce((sum, row) => sum + row.amount_cents, 0)
      + installments.filter((row) => row.category_id === budget.category_id && row.state === "pending").reduce((sum, row) => sum + row.amount_cents, 0)
    return { ...budget, spent_cents: spent, committed_cents: committed }
  })
}
export async function upsertFinancialBudget(categoryId: number, month: string, limitCents: number): Promise<void> {
  await read(client().from("app_financial_budgets").upsert({ uuid: crypto.randomUUID(), category_id: categoryId, month, limit_cents: limitCents }, { onConflict: "owner_id,category_id,month" }))
}

export const listFinancialRecurrences = () => read<FinancialRecurrence[]>(client().from("app_financial_recurrences")
  .select("id,kind,description,amount_cents,day_of_month,start_month,category_id,account_id,active").order("day_of_month"))
export async function createFinancialRecurrence(kind: string, description: string, amountCents: number, dayOfMonth: number, startMonth: string, categoryId: number | null, accountId: number | null): Promise<void> {
  await read(client().from("app_financial_recurrences").insert({ uuid: crypto.randomUUID(), kind, description: description.trim(), amount_cents: amountCents, day_of_month: dayOfMonth, start_month: startMonth, category_id: categoryId, account_id: accountId }))
}
export async function setFinancialRecurrenceActive(id: number, active: boolean): Promise<void> {
  await read(client().from("app_financial_recurrences").update({ active }).eq("id", id))
}

export const listFinancialDebts = () => read<FinancialDebt[]>(client().from("app_financial_debts").select("id,name,balance_cents,monthly_payment_cents,due_day").order("name"))
export async function createFinancialDebt(name: string, balanceCents: number, monthlyPaymentCents: number, dueDay: number | null, startMonth: string): Promise<void> {
  await read(client().rpc("app_create_financial_debt", { p_name: name.trim(), p_balance_cents: balanceCents, p_monthly_payment_cents: monthlyPaymentCents, p_due_day: dueDay, p_start_month: startMonth }))
}
