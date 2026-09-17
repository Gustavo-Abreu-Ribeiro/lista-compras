use chrono::{Datelike, NaiveDate, Utc};
use rusqlite::params;
use tauri::command;
use uuid::Uuid;
use crate::{db::connection::get_connection, models::finance::{FinancialAccount, FinancialCategory, FinancialDashboard, FinancialGoal, FinancialInstallment, FinancialTransaction}};

fn now() -> String { Utc::now().to_rfc3339() }
fn value(conn: &rusqlite::Connection, sql: &str, month: Option<&str>) -> Result<i64, String> {
    let result = if let Some(month) = month { conn.query_row(sql, params![format!("{month}%")], |r| r.get::<_, i64>(0)) } else { conn.query_row(sql, [], |r| r.get::<_, i64>(0)) };
    result.map_err(|e| e.to_string())
}

#[command]
pub fn list_financial_accounts() -> Result<Vec<FinancialAccount>, String> {
    let conn = get_connection()?; let mut stmt = conn.prepare("SELECT id,name,account_type,opening_balance_cents FROM financial_accounts ORDER BY name").map_err(|e|e.to_string())?;
    let rows = stmt.query_map([], |r| Ok(FinancialAccount { id:r.get(0)?, name:r.get(1)?, account_type:r.get(2)?, opening_balance_cents:r.get(3)? })).map_err(|e|e.to_string())?;
    rows.collect::<Result<Vec<_>,_>>().map_err(|e|e.to_string())
}
#[command]
pub fn create_financial_account(name:String, account_type:String, opening_balance_cents:i64) -> Result<(),String> {
    if name.trim().is_empty() || opening_balance_cents < 0 { return Err("Conta e saldo inicial válido são obrigatórios".into()) }
    let conn=get_connection()?; conn.execute("INSERT INTO financial_accounts(uuid,name,account_type,opening_balance_cents,created_at) VALUES(?1,?2,?3,?4,?5)", params![Uuid::new_v4().to_string(),name.trim(),account_type,opening_balance_cents,now()]).map_err(|e|e.to_string())?; Ok(())
}
#[command]
pub fn list_financial_categories() -> Result<Vec<FinancialCategory>,String> {
    let conn=get_connection()?; let mut stmt=conn.prepare("SELECT id,name,kind,is_essential FROM financial_categories ORDER BY kind,name").map_err(|e|e.to_string())?;
    let rows = stmt.query_map([], |r| Ok(FinancialCategory{id:r.get(0)?,name:r.get(1)?,kind:r.get(2)?,is_essential:r.get::<_,i32>(3)? != 0})).map_err(|e|e.to_string())?;
    rows.collect::<Result<Vec<_>,_>>().map_err(|e|e.to_string())
}
#[command]
pub fn create_financial_category(name:String, kind:String, is_essential:bool) -> Result<(),String> {
    if name.trim().is_empty() || !["income","expense"].contains(&kind.as_str()) { return Err("Categoria inválida".into()) }
    let conn=get_connection()?; conn.execute("INSERT OR IGNORE INTO financial_categories(uuid,name,kind,is_essential,created_at) VALUES(?1,?2,?3,?4,?5)",params![Uuid::new_v4().to_string(),name.trim(),kind,is_essential as i32,now()]).map_err(|e|e.to_string())?; Ok(())
}
#[command]
pub fn list_financial_transactions(month:String) -> Result<Vec<FinancialTransaction>,String> {
    let conn=get_connection()?; let mut stmt=conn.prepare("SELECT id,kind,amount_cents,occurred_on,description,category_id,account_id,status FROM financial_transactions WHERE occurred_on LIKE ?1 ORDER BY occurred_on DESC,id DESC").map_err(|e|e.to_string())?;
    let rows = stmt.query_map(params![format!("{month}%")],|r|Ok(FinancialTransaction{id:r.get(0)?,kind:r.get(1)?,amount_cents:r.get(2)?,occurred_on:r.get(3)?,description:r.get(4)?,category_id:r.get(5)?,account_id:r.get(6)?,status:r.get(7)?})).map_err(|e|e.to_string())?;
    rows.collect::<Result<Vec<_>,_>>().map_err(|e|e.to_string())
}
#[command]
pub fn create_financial_transaction(kind:String, amount_cents:i64, occurred_on:String, description:String, category_id:Option<i32>, account_id:Option<i32>, status:String) -> Result<(),String> {
    if !["income","expense","investment"].contains(&kind.as_str()) || amount_cents <= 0 || description.trim().is_empty() || !["posted","planned"].contains(&status.as_str()) { return Err("Lançamento inválido".into()) }
    let conn=get_connection()?; conn.execute("INSERT INTO financial_transactions(uuid,kind,amount_cents,occurred_on,description,category_id,account_id,status,created_at) VALUES(?1,?2,?3,?4,?5,?6,?7,?8,?9)",params![Uuid::new_v4().to_string(),kind,amount_cents,occurred_on,description.trim(),category_id,account_id,status,now()]).map_err(|e|e.to_string())?; Ok(())
}
#[command]
pub fn create_financial_installment(description:String,total_cents:i64,installment_count:i32,first_due_on:String,category_id:Option<i32>,account_id:Option<i32>) -> Result<(),String> {
    if description.trim().is_empty() || total_cents<=0 || installment_count<2 { return Err("Informe compra, total e ao menos 2 parcelas".into()) }
    let first=NaiveDate::parse_from_str(&first_due_on,"%Y-%m-%d").map_err(|_|"Data inválida".to_string())?;
    let conn=get_connection()?; let base=total_cents/installment_count as i64; let remainder=total_cents%installment_count as i64;
    for index in 0..installment_count { let absolute=first.month0() as i32+index; let year=first.year()+absolute/12; let month=(absolute%12+1) as u32; let due=NaiveDate::from_ymd_opt(year,month,1).ok_or("Data inválida")?; let amount=base+if index<remainder as i32 {1}else{0}; conn.execute("INSERT INTO financial_installments(uuid,description,amount_cents,due_on,category_id,account_id,state,created_at) VALUES(?1,?2,?3,?4,?5,?6,'pending',?7)",params![Uuid::new_v4().to_string(),description.trim(),amount,due.format("%Y-%m-%d").to_string(),category_id,account_id,now()]).map_err(|e|e.to_string())?; } Ok(())
}
#[command]
pub fn list_financial_installments(month:String) -> Result<Vec<FinancialInstallment>,String> {
    let conn=get_connection()?; let mut stmt=conn.prepare("SELECT id,description,amount_cents,due_on,state FROM financial_installments WHERE due_on LIKE ?1 ORDER BY due_on,id").map_err(|e|e.to_string())?;
    let rows = stmt.query_map(params![format!("{month}%")],|r|Ok(FinancialInstallment{id:r.get(0)?,description:r.get(1)?,amount_cents:r.get(2)?,due_on:r.get(3)?,state:r.get(4)?})).map_err(|e|e.to_string())?;
    rows.collect::<Result<Vec<_>,_>>().map_err(|e|e.to_string())
}
#[command]
pub fn mark_financial_installment_paid(id:i32) -> Result<(),String> { let conn=get_connection()?; conn.execute("UPDATE financial_installments SET state='paid' WHERE id=?1",params![id]).map_err(|e|e.to_string())?; Ok(()) }
#[command]
pub fn list_financial_goals() -> Result<Vec<FinancialGoal>,String> { let conn=get_connection()?; let mut stmt=conn.prepare("SELECT id,name,target_cents,saved_cents,due_on,priority,contribution_min_cents,contribution_ideal_cents FROM financial_goals ORDER BY priority,name").map_err(|e|e.to_string())?; let rows=stmt.query_map([],|r|Ok(FinancialGoal{id:r.get(0)?,name:r.get(1)?,target_cents:r.get(2)?,saved_cents:r.get(3)?,due_on:r.get(4)?,priority:r.get(5)?,contribution_min_cents:r.get(6)?,contribution_ideal_cents:r.get(7)?})).map_err(|e|e.to_string())?; rows.collect::<Result<Vec<_>,_>>().map_err(|e|e.to_string()) }
#[command]
pub fn create_financial_goal(name:String,target_cents:i64,saved_cents:i64,due_on:Option<String>,priority:i32,contribution_min_cents:i64,contribution_ideal_cents:i64)->Result<(),String>{if name.trim().is_empty()||target_cents<=0||saved_cents<0{return Err("Meta inválida".into())}let conn=get_connection()?;conn.execute("INSERT INTO financial_goals(uuid,name,target_cents,saved_cents,due_on,priority,contribution_min_cents,contribution_ideal_cents,created_at) VALUES(?1,?2,?3,?4,?5,?6,?7,?8,?9)",params![Uuid::new_v4().to_string(),name.trim(),target_cents,saved_cents,due_on,priority.clamp(1,5),contribution_min_cents.max(0),contribution_ideal_cents.max(0),now()]).map_err(|e|e.to_string())?;Ok(())}
#[command]
pub fn seed_financial_example() -> Result<(), String> {
    let mut conn = get_connection()?;
    let existing: i64 = conn.query_row("SELECT COUNT(*) FROM financial_accounts", [], |row| row.get(0)).map_err(|e| e.to_string())?;
    if existing > 0 { return Err("Os exemplos só podem ser incluídos em uma área financeira vazia".into()) }
    let tx = conn.transaction().map_err(|e| e.to_string())?;
    let created = now(); let date = Utc::now().date_naive().format("%Y-%m-%d").to_string();
    tx.execute("INSERT INTO financial_accounts(uuid,name,account_type,opening_balance_cents,created_at) VALUES(?1,'Conta principal','checking',180000,?2)", params![Uuid::new_v4().to_string(), created]).map_err(|e|e.to_string())?;
    let account_id = tx.last_insert_rowid();
    tx.execute("INSERT INTO financial_categories(uuid,name,kind,is_essential,created_at) VALUES(?1,'Alimentação','expense',0,?2)", params![Uuid::new_v4().to_string(), now()]).map_err(|e|e.to_string())?;
    let food_id = tx.last_insert_rowid();
    tx.execute("INSERT INTO financial_categories(uuid,name,kind,is_essential,created_at) VALUES(?1,'Salário','income',1,?2)", params![Uuid::new_v4().to_string(), now()]).map_err(|e|e.to_string())?;
    let income_id = tx.last_insert_rowid();
    tx.execute("INSERT INTO financial_transactions(uuid,kind,amount_cents,occurred_on,description,category_id,account_id,status,created_at) VALUES(?1,'income',320000,?2,'Receita de exemplo',?3,?4,'posted',?5)",params![Uuid::new_v4().to_string(),date,income_id,account_id,now()]).map_err(|e|e.to_string())?;
    tx.execute("INSERT INTO financial_transactions(uuid,kind,amount_cents,occurred_on,description,category_id,account_id,status,created_at) VALUES(?1,'expense',4850,?2,'Mercado de exemplo',?3,?4,'posted',?5)",params![Uuid::new_v4().to_string(),date,food_id,account_id,now()]).map_err(|e|e.to_string())?;
    tx.execute("INSERT INTO financial_transactions(uuid,kind,amount_cents,occurred_on,description,status,created_at) VALUES(?1,'expense',7990,?2,'Assinatura planejada','planned',?3)",params![Uuid::new_v4().to_string(),date,now()]).map_err(|e|e.to_string())?;
    tx.execute("INSERT INTO financial_installments(uuid,description,amount_cents,due_on,category_id,account_id,state,created_at) VALUES(?1,'Parcela de exemplo',12500,?2,?3,?4,'pending',?5)",params![Uuid::new_v4().to_string(),date,food_id,account_id,now()]).map_err(|e|e.to_string())?;
    tx.execute("INSERT INTO financial_goals(uuid,name,target_cents,saved_cents,priority,contribution_min_cents,contribution_ideal_cents,created_at) VALUES(?1,'Reserva de emergência',1000000,120000,1,20000,40000,?2)",params![Uuid::new_v4().to_string(),now()]).map_err(|e|e.to_string())?;
    tx.commit().map_err(|e|e.to_string())?; Ok(())
}
#[command]
pub fn get_financial_dashboard(month:String)->Result<FinancialDashboard,String>{let conn=get_connection()?;
    let opening=value(&conn,"SELECT COALESCE(SUM(opening_balance_cents),0) FROM financial_accounts",None)?;
    let posted=value(&conn,"SELECT COALESCE(SUM(CASE WHEN kind='income' THEN amount_cents ELSE -amount_cents END),0) FROM financial_transactions WHERE status='posted'",None)?;
    let income=value(&conn,"SELECT COALESCE(SUM(amount_cents),0) FROM financial_transactions WHERE kind='income' AND status='posted' AND occurred_on LIKE ?1",Some(&month))?;
    let spent=value(&conn,"SELECT COALESCE(SUM(amount_cents),0) FROM financial_transactions WHERE kind='expense' AND status='posted' AND occurred_on LIKE ?1",Some(&month))?;
    let investments=value(&conn,"SELECT COALESCE(SUM(amount_cents),0) FROM financial_transactions WHERE kind='investment' AND status='posted' AND occurred_on LIKE ?1",Some(&month))?;
    let planned_income=value(&conn,"SELECT COALESCE(SUM(amount_cents),0) FROM financial_transactions WHERE kind='income' AND status='planned' AND occurred_on LIKE ?1",Some(&month))?;
    let planned_expense=value(&conn,"SELECT COALESCE(SUM(amount_cents),0) FROM financial_transactions WHERE kind!='income' AND status='planned' AND occurred_on LIKE ?1",Some(&month))?;
    let installments=value(&conn,"SELECT COALESCE(SUM(amount_cents),0) FROM financial_installments WHERE state='pending' AND due_on LIKE ?1",Some(&month))?;
    let pending=value(&conn,"SELECT COUNT(*) FROM financial_installments WHERE state='pending' AND due_on LIKE ?1",Some(&month))?;
    let goals=value(&conn,"SELECT COALESCE(SUM(contribution_min_cents),0) FROM financial_goals",None)?;
    let balance=opening+posted; let committed=planned_expense+installments; let available=(balance-committed-goals).max(0); let projected=balance+planned_income-committed-goals;
    Ok(FinancialDashboard{current_balance_cents:balance,available_to_spend_cents:available,committed_cents:committed,projected_end_cents:projected,income_cents:income,spent_cents:spent,investments_cents:investments,pending_bills_count:pending,goal_minimum_cents:goals})
}
#[cfg(test)]
mod tests {
    use super::*;
    use crate::db::connection::set_app_data_dir;
    use std::fs;

    #[test]
    fn test_financial_calculations_and_flow() {
        let mut path = std::env::temp_dir();
        path.push("lista_compras_finance_test");
        let _ = fs::remove_dir_all(&path);
        fs::create_dir_all(&path).unwrap();
        set_app_data_dir(path);
        
        let conn = crate::db::connection::get_connection().unwrap();
        crate::db::migrations::run_migrations(&conn).unwrap();
        
        let month = Utc::now().date_naive().format("%Y-%m").to_string();
        
        // Test 1: Empty dashboard
        let dash = get_financial_dashboard(month.clone()).unwrap();
        assert_eq!(dash.current_balance_cents, 0);
        
        // Test 2: Seed examples and check calculations
        seed_financial_example().expect("Failed to seed examples");
        let dash = get_financial_dashboard(month.clone()).expect("Failed to get dashboard");
        
        assert_eq!(dash.current_balance_cents, 495150, "Saldo real incorreto");
        assert_eq!(dash.committed_cents, 20490, "Comprometido incorreto");
        assert_eq!(dash.goal_minimum_cents, 20000, "Minimo de metas incorreto");
        assert_eq!(dash.available_to_spend_cents, 454660, "Seguro para gastar incorreto");
        assert_eq!(dash.projected_end_cents, 454660, "Projetado incorreto");
        assert_eq!(dash.pending_bills_count, 1, "Parcelas pendentes incorreto");
        
        // Test 3: Mark installment as paid changes semantics correctly
        let installments = list_financial_installments(month.clone()).unwrap();
        assert_eq!(installments.len(), 1);
        let inst_id = installments[0].id;
        
        mark_financial_installment_paid(inst_id).unwrap();
        
        let dash2 = get_financial_dashboard(month.clone()).unwrap();
        assert_eq!(dash2.committed_cents, 7990, "Parcela paga nao deve compor o comprometido");
        assert_eq!(dash2.pending_bills_count, 0, "Deve haver 0 parcelas pendentes");
        assert_eq!(dash2.available_to_spend_cents, 454660 + 12500, "Seguro sobe ate o lancamento real ser registrado");
    }
}
