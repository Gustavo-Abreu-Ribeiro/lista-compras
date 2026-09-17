import { invoke } from "@tauri-apps/api/core"
import type { FinancialAccount, FinancialCategory, FinancialDashboard, FinancialGoal, FinancialInstallment, FinancialTransaction } from "../../types/Finance"

export const listFinancialAccounts = () => invoke<FinancialAccount[]>("list_financial_accounts")
export const createFinancialAccount = (name: string, accountType: string, openingBalanceCents: number) => invoke<void>("create_financial_account", { name, accountType, openingBalanceCents })
export const listFinancialCategories = () => invoke<FinancialCategory[]>("list_financial_categories")
export const createFinancialCategory = (name: string, kind: string, isEssential: boolean) => invoke<void>("create_financial_category", { name, kind, isEssential })
export const listFinancialTransactions = (month: string) => invoke<FinancialTransaction[]>("list_financial_transactions", { month })
export const createFinancialTransaction = (kind: string, amountCents: number, occurredOn: string, description: string, categoryId: number | null, accountId: number | null, status: string) => invoke<void>("create_financial_transaction", { kind, amountCents, occurredOn, description, categoryId, accountId, status })
export const createFinancialInstallment = (description: string, totalCents: number, installmentCount: number, firstDueOn: string, categoryId: number | null, accountId: number | null) => invoke<void>("create_financial_installment", { description, totalCents, installmentCount, firstDueOn, categoryId, accountId })
export const listFinancialInstallments = (month: string) => invoke<FinancialInstallment[]>("list_financial_installments", { month })
export const markFinancialInstallmentPaid = (id: number) => invoke<void>("mark_financial_installment_paid", { id })
export const listFinancialGoals = () => invoke<FinancialGoal[]>("list_financial_goals")
export const createFinancialGoal = (name: string, targetCents: number, savedCents: number, dueOn: string | null, priority: number, contributionMinCents: number, contributionIdealCents: number) => invoke<void>("create_financial_goal", { name, targetCents, savedCents, dueOn, priority, contributionMinCents, contributionIdealCents })
export const seedFinancialExample = () => invoke<void>("seed_financial_example")
export const getFinancialDashboard = (month: string) => invoke<FinancialDashboard>("get_financial_dashboard", { month })
