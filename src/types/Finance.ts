export type FinancialAccount = { id: number; name: string; account_type: string; opening_balance_cents: number }
export type FinancialCategory = { id: number; name: string; kind: string; is_essential: boolean }
export type FinancialTransaction = { id: number; kind: "income" | "expense" | "investment"; amount_cents: number; occurred_on: string; description: string; category_id: number | null; account_id: number | null; status: "posted" | "planned"; recurrence_id?: number | null; installment_id?: number | null }
export type FinancialInstallment = { id: number; description: string; amount_cents: number; due_on: string; state: "pending" | "paid" }
export type FinancialGoal = { id: number; name: string; target_cents: number; saved_cents: number; due_on: string | null; priority: number; contribution_min_cents: number; contribution_ideal_cents: number }
export type FinancialDashboard = { current_balance_cents: number; available_to_spend_cents: number; committed_cents: number; projected_end_cents: number; income_cents: number; spent_cents: number; investments_cents: number; pending_bills_count: number; goal_minimum_cents: number }
export interface FinancialBudget {
  id: number
  category_id: number
  month: string
  limit_cents: number
  spent_cents: number
  committed_cents: number
}
export type FinancialRecurrence = { id: number; kind: "income" | "expense"; description: string; amount_cents: number; day_of_month: number; start_month: string; category_id: number | null; account_id: number | null; active: boolean }
export type FinancialDebt = { id: number; name: string; balance_cents: number; monthly_payment_cents: number; due_day: number | null }
export type FinancialHistoryPoint = { month: string; income_cents: number; spent_cents: number }
