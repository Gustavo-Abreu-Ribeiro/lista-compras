use serde::Serialize;

#[derive(Serialize)]
pub struct FinancialAccount { pub id: i32, pub name: String, pub account_type: String, pub opening_balance_cents: i64 }

#[derive(Serialize)]
pub struct FinancialCategory { pub id: i32, pub name: String, pub kind: String, pub is_essential: bool }

#[derive(Serialize)]
pub struct FinancialTransaction {
    pub id: i32, pub kind: String, pub amount_cents: i64, pub occurred_on: String,
    pub description: String, pub category_id: Option<i32>, pub account_id: Option<i32>, pub status: String,
}

#[derive(Serialize)]
pub struct FinancialGoal { pub id: i32, pub name: String, pub target_cents: i64, pub saved_cents: i64, pub due_on: Option<String>, pub priority: i32, pub contribution_min_cents: i64, pub contribution_ideal_cents: i64 }

#[derive(Serialize)]
pub struct FinancialInstallment { pub id: i32, pub description: String, pub amount_cents: i64, pub due_on: String, pub state: String }

#[derive(Serialize)]
pub struct FinancialDashboard {
    pub current_balance_cents: i64, pub available_to_spend_cents: i64, pub committed_cents: i64,
    pub projected_end_cents: i64, pub income_cents: i64, pub spent_cents: i64,
    pub investments_cents: i64, pub pending_bills_count: i64, pub goal_minimum_cents: i64,
}
#[derive(Serialize)]
pub struct FinancialBudget { pub id: i32, pub category_id: i32, pub month: String, pub limit_cents: i64, pub spent_cents: i64, pub committed_cents: i64 }

#[derive(Serialize)]
pub struct FinancialRecurrence { pub id: i32, pub kind: String, pub description: String, pub amount_cents: i64, pub day_of_month: i32, pub start_month: String, pub category_id: Option<i32>, pub account_id: Option<i32>, pub active: bool }

#[derive(Serialize)]
pub struct FinancialDebt { pub id: i32, pub name: String, pub balance_cents: i64, pub monthly_payment_cents: i64, pub due_day: Option<i32> }

#[derive(Serialize)]
pub struct FinancialHistoryPoint { pub month: String, pub income_cents: i64, pub spent_cents: i64 }
