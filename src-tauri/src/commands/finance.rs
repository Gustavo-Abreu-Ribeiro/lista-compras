use chrono::{Datelike, Months, NaiveDate, Utc};
use rusqlite::{params, Connection, Params};
use tauri::command;
use uuid::Uuid;
use crate::{db::connection::get_connection, models::finance::{FinancialAccount, FinancialCategory, FinancialDashboard, FinancialDebt, FinancialGoal, FinancialHistoryPoint, FinancialInstallment, FinancialRecurrence, FinancialTransaction}};

fn now() -> String { Utc::now().to_rfc3339() }

struct FinancialExampleFixture {
    account_id: i32,
    food_category_id: i32,
    salary_category_id: i32,
    transaction_ids: [i32; 3],
    installment_id: i32,
    goal_id: i32,
}

struct ExampleTransaction {
    id: i32,
    kind: String,
    amount_cents: i64,
    occurred_on: String,
    description: String,
    category_id: Option<i32>,
    account_id: Option<i32>,
    status: String,
}

fn unique_id<P: Params>(conn: &Connection, sql: &str, values: P) -> Result<Option<i32>, String> {
    let mut stmt = conn.prepare(sql).map_err(|e| e.to_string())?;
    let ids = stmt.query_map(values, |row| row.get(0)).map_err(|e| e.to_string())?
        .collect::<Result<Vec<i32>, _>>().map_err(|e| e.to_string())?;
    Ok((ids.len() == 1).then(|| ids[0]))
}

fn find_financial_example_fixture(conn: &Connection) -> Result<Option<FinancialExampleFixture>, String> {
    let Some(account_id) = unique_id(conn,
        "SELECT id FROM financial_accounts WHERE name='Conta principal' AND account_type='checking' AND opening_balance_cents=180000",
        [],
    )? else { return Ok(None) };
    let Some(food_category_id) = unique_id(conn,
        "SELECT id FROM financial_categories WHERE name='Alimentação' AND kind='expense' AND is_essential=0",
        [],
    )? else { return Ok(None) };
    let Some(salary_category_id) = unique_id(conn,
        "SELECT id FROM financial_categories WHERE name='Salário' AND kind='income' AND is_essential=1",
        [],
    )? else { return Ok(None) };

    let mut stmt = conn.prepare("SELECT id,kind,amount_cents,occurred_on,description,category_id,account_id,status FROM financial_transactions WHERE description IN ('Receita de exemplo','Mercado de exemplo','Assinatura planejada')").map_err(|e| e.to_string())?;
    let transactions = stmt.query_map([], |row| Ok(ExampleTransaction {
        id: row.get(0)?, kind: row.get(1)?, amount_cents: row.get(2)?, occurred_on: row.get(3)?,
        description: row.get(4)?, category_id: row.get(5)?, account_id: row.get(6)?, status: row.get(7)?,
    })).map_err(|e| e.to_string())?.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())?;
    if transactions.len() != 3 { return Ok(None) }

    let expected = [
        ("Receita de exemplo", "income", 320_000, Some(salary_category_id), Some(account_id), "posted"),
        ("Mercado de exemplo", "expense", 4_850, Some(food_category_id), Some(account_id), "posted"),
        ("Assinatura planejada", "expense", 7_990, None, None, "planned"),
    ];
    let mut transaction_ids = Vec::with_capacity(3);
    for (description, kind, amount, category_id, linked_account_id, status) in expected {
        let matches = transactions.iter().filter(|row| row.description == description).collect::<Vec<_>>();
        if matches.len() != 1 { return Ok(None) }
        let row = matches[0];
        if row.kind != kind || row.amount_cents != amount || row.category_id != category_id
            || row.account_id != linked_account_id || row.status != status {
            return Ok(None)
        }
        transaction_ids.push(row.id);
    }
    let Some(sample_date) = transactions.first().map(|row| row.occurred_on.as_str()) else { return Ok(None) };
    if NaiveDate::parse_from_str(sample_date, "%Y-%m-%d").is_err()
        || transactions.iter().any(|row| row.occurred_on != sample_date) {
        return Ok(None)
    }

    let mut stmt = conn.prepare("SELECT id,due_on FROM financial_installments WHERE description='Parcela de exemplo' AND amount_cents=12500 AND category_id=?1 AND account_id=?2 AND state='pending'").map_err(|e| e.to_string())?;
    let installments = stmt.query_map(params![food_category_id, account_id], |row| Ok((row.get::<_, i32>(0)?, row.get::<_, String>(1)?)))
        .map_err(|e| e.to_string())?.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())?;
    if installments.len() != 1 || installments[0].1 != sample_date { return Ok(None) }
    let installment_id = installments[0].0;

    let Some(goal_id) = unique_id(conn,
        "SELECT id FROM financial_goals WHERE name='Reserva de emergência' AND target_cents=1000000 AND saved_cents=120000 AND due_on IS NULL AND priority=1 AND contribution_min_cents=20000 AND contribution_ideal_cents=40000",
        [],
    )? else { return Ok(None) };

    let mut stmt = conn.prepare("SELECT id FROM financial_transactions WHERE account_id=?1 OR category_id IN (?2,?3)").map_err(|e| e.to_string())?;
    let mut related_transactions = stmt.query_map(params![account_id, food_category_id, salary_category_id], |row| row.get::<_, i32>(0))
        .map_err(|e| e.to_string())?.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())?;
    let mut expected_related_transactions = vec![transaction_ids[0], transaction_ids[1]];
    related_transactions.sort_unstable();
    expected_related_transactions.sort_unstable();
    if related_transactions != expected_related_transactions { return Ok(None) }

    let related_installments: i64 = conn.query_row(
        "SELECT COUNT(*) FROM financial_installments WHERE account_id=?1 OR category_id IN (?2,?3)",
        params![account_id, food_category_id, salary_category_id], |row| row.get(0),
    ).map_err(|e| e.to_string())?;
    let related_budgets: i64 = conn.query_row(
        "SELECT COUNT(*) FROM financial_budgets WHERE category_id IN (?1,?2)",
        params![food_category_id, salary_category_id], |row| row.get(0),
    ).map_err(|e| e.to_string())?;
    let related_recurrences: i64 = conn.query_row(
        "SELECT COUNT(*) FROM financial_recurrences WHERE account_id=?1 OR category_id IN (?2,?3)",
        params![account_id, food_category_id, salary_category_id], |row| row.get(0),
    ).map_err(|e| e.to_string())?;
    if related_installments != 1 || related_budgets != 0 || related_recurrences != 0 {
        return Ok(None)
    }

    Ok(Some(FinancialExampleFixture {
        account_id, food_category_id, salary_category_id,
        transaction_ids: [transaction_ids[0], transaction_ids[1], transaction_ids[2]],
        installment_id, goal_id,
    }))
}

#[command]
pub fn has_financial_example_fixture() -> Result<bool, String> {
    let conn = get_connection()?;
    Ok(find_financial_example_fixture(&conn)?.is_some())
}

#[command]
pub fn remove_financial_example_fixture() -> Result<bool, String> {
    let mut conn = get_connection()?;
    let tx = conn.transaction().map_err(|e| e.to_string())?;
    let Some(fixture) = find_financial_example_fixture(&tx)? else { return Ok(false) };

    tx.execute("DELETE FROM financial_transactions WHERE id IN (?1,?2,?3)", params![fixture.transaction_ids[0], fixture.transaction_ids[1], fixture.transaction_ids[2]])
        .map_err(|e| e.to_string())?;
    tx.execute("DELETE FROM financial_installments WHERE id=?1", params![fixture.installment_id]).map_err(|e| e.to_string())?;
    tx.execute("DELETE FROM financial_goals WHERE id=?1", params![fixture.goal_id]).map_err(|e| e.to_string())?;
    tx.execute("DELETE FROM financial_accounts WHERE id=?1", params![fixture.account_id]).map_err(|e| e.to_string())?;
    tx.execute("DELETE FROM financial_categories WHERE id IN (?1,?2)", params![fixture.food_category_id, fixture.salary_category_id])
        .map_err(|e| e.to_string())?;
    tx.commit().map_err(|e| e.to_string())?;
    Ok(true)
}

fn value(conn: &rusqlite::Connection, sql: &str, month: Option<&str>) -> Result<i64, String> {
    let result = if let Some(month) = month { conn.query_row(sql, params![format!("{month}%")], |r| r.get::<_, i64>(0)) } else { conn.query_row(sql, [], |r| r.get::<_, i64>(0)) };
    result.map_err(|e| e.to_string())
}

fn ensure_recurrences_for_month(conn: &rusqlite::Connection, month: &str) -> Result<(), String> {
    let month_start = NaiveDate::parse_from_str(&format!("{month}-01"), "%Y-%m-%d").map_err(|_| "Mês inválido".to_string())?;
    let (year, month_number) = if month_start.month() == 12 { (month_start.year() + 1, 1) } else { (month_start.year(), month_start.month() + 1) };
    let days_in_month = NaiveDate::from_ymd_opt(year, month_number, 1).and_then(|date| date.pred_opt()).ok_or("Mês inválido")?.day();
    let mut stmt = conn.prepare("SELECT id,kind,description,amount_cents,day_of_month,category_id,account_id FROM financial_recurrences WHERE active=1 AND start_month<=?1").map_err(|e| e.to_string())?;
    let rows = stmt.query_map(params![month], |r| Ok((r.get::<_, i32>(0)?, r.get::<_, String>(1)?, r.get::<_, String>(2)?, r.get::<_, i64>(3)?, r.get::<_, i32>(4)?, r.get::<_, Option<i32>>(5)?, r.get::<_, Option<i32>>(6)?))).map_err(|e| e.to_string())?.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())?;
    for (id, kind, description, amount, day, category, account) in rows {
        let date = NaiveDate::from_ymd_opt(month_start.year(), month_start.month(), (day as u32).min(days_in_month)).ok_or("Data recorrente inválida")?;
        conn.execute("INSERT OR IGNORE INTO financial_transactions(uuid,kind,amount_cents,occurred_on,description,category_id,account_id,status,created_at,recurrence_id,recurrence_month) VALUES(?1,?2,?3,?4,?5,?6,?7,'planned',?8,?9,?10)", params![Uuid::new_v4().to_string(),kind,amount,date.format("%Y-%m-%d").to_string(),description,category,account,now(),id,month]).map_err(|e| e.to_string())?;
    }
    Ok(())
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
    let conn=get_connection()?; ensure_recurrences_for_month(&conn, &month)?; let mut stmt=conn.prepare("SELECT id,kind,amount_cents,occurred_on,description,category_id,account_id,status FROM financial_transactions WHERE occurred_on LIKE ?1 ORDER BY occurred_on DESC,id DESC").map_err(|e|e.to_string())?;
    let rows = stmt.query_map(params![format!("{month}%")],|r|Ok(FinancialTransaction{id:r.get(0)?,kind:r.get(1)?,amount_cents:r.get(2)?,occurred_on:r.get(3)?,description:r.get(4)?,category_id:r.get(5)?,account_id:r.get(6)?,status:r.get(7)?})).map_err(|e|e.to_string())?;
    rows.collect::<Result<Vec<_>,_>>().map_err(|e|e.to_string())
}

#[command]
pub fn list_financial_history(month:String)->Result<Vec<FinancialHistoryPoint>,String>{
    let selected=NaiveDate::parse_from_str(&format!("{month}-01"),"%Y-%m-%d").map_err(|_|"Mês inválido".to_string())?;
    let start=selected.checked_sub_months(Months::new(5)).ok_or("Mês inválido")?;
    let (next_year,next_month)=if selected.month()==12{(selected.year()+1,1)}else{(selected.year(),selected.month()+1)};
    let end=NaiveDate::from_ymd_opt(next_year,next_month,1).ok_or("Mês inválido")?;
    let conn=get_connection()?;let mut stmt=conn.prepare("SELECT substr(occurred_on,1,7),COALESCE(SUM(CASE WHEN kind='income' THEN amount_cents ELSE 0 END),0),COALESCE(SUM(CASE WHEN kind='expense' THEN amount_cents ELSE 0 END),0) FROM financial_transactions WHERE status='posted' AND occurred_on>=?1 AND occurred_on<?2 GROUP BY substr(occurred_on,1,7)").map_err(|e|e.to_string())?;
    let rows=stmt.query_map(params![start.format("%Y-%m-%d").to_string(),end.format("%Y-%m-%d").to_string()],|r|Ok((r.get::<_,String>(0)?,(r.get::<_,i64>(1)?,r.get::<_,i64>(2)?)))).map_err(|e|e.to_string())?.collect::<Result<std::collections::HashMap<_,_>,_>>().map_err(|e|e.to_string())?;
    let mut result=Vec::with_capacity(6);for offset in 0..6{let date=start.checked_add_months(Months::new(offset)).ok_or("Mês inválido")?;let key=date.format("%Y-%m").to_string();let (income_cents,spent_cents)=rows.get(&key).copied().unwrap_or((0,0));result.push(FinancialHistoryPoint{month:key,income_cents,spent_cents});}Ok(result)
}
#[command]
pub fn create_financial_transaction(kind:String, amount_cents:i64, occurred_on:String, description:String, category_id:Option<i32>, account_id:Option<i32>, status:String) -> Result<(),String> {
    if !["income","expense","investment"].contains(&kind.as_str()) || amount_cents <= 0 || description.trim().is_empty() || !["posted","planned"].contains(&status.as_str()) { return Err("Lançamento inválido".into()) }
    let conn=get_connection()?; conn.execute("INSERT INTO financial_transactions(uuid,kind,amount_cents,occurred_on,description,category_id,account_id,status,created_at) VALUES(?1,?2,?3,?4,?5,?6,?7,?8,?9)",params![Uuid::new_v4().to_string(),kind,amount_cents,occurred_on,description.trim(),category_id,account_id,status,now()]).map_err(|e|e.to_string())?; Ok(())
}
#[command]
pub fn set_financial_transaction_status(id:i32,status:String)->Result<(),String>{if !["posted","planned"].contains(&status.as_str()){return Err("Status inválido".into())}let conn=get_connection()?;conn.execute("UPDATE financial_transactions SET status=?1 WHERE id=?2",params![status,id]).map_err(|e|e.to_string())?;Ok(())}
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
pub fn mark_financial_installment_paid(id:i32) -> Result<(),String> {
    let mut conn=get_connection()?;
    let tx=conn.transaction().map_err(|e|e.to_string())?;
    let installment=tx.query_row("SELECT description,amount_cents,due_on,category_id,account_id,state FROM financial_installments WHERE id=?1",params![id],|r|Ok((r.get::<_,String>(0)?,r.get::<_,i64>(1)?,r.get::<_,String>(2)?,r.get::<_,Option<i32>>(3)?,r.get::<_,Option<i32>>(4)?,r.get::<_,String>(5)?))).map_err(|e|e.to_string())?;
    if installment.5!="pending" { return Err("Esta parcela já foi marcada como paga".into()) }
    tx.execute("INSERT INTO financial_transactions(uuid,kind,amount_cents,occurred_on,description,category_id,account_id,status,created_at,installment_id) VALUES(?1,'expense',?2,?3,?4,?5,?6,'posted',?7,?8)",params![Uuid::new_v4().to_string(),installment.1,installment.2,format!("Parcela: {}",installment.0),installment.3,installment.4,now(),id]).map_err(|e|e.to_string())?;
    tx.execute("UPDATE financial_installments SET state='paid' WHERE id=?1",params![id]).map_err(|e|e.to_string())?;
    tx.commit().map_err(|e|e.to_string())?; Ok(())
}

#[command]
pub fn list_financial_recurrences() -> Result<Vec<FinancialRecurrence>, String> {
    let conn=get_connection()?; let mut stmt=conn.prepare("SELECT id,kind,description,amount_cents,day_of_month,start_month,category_id,account_id,active FROM financial_recurrences ORDER BY active DESC,day_of_month,description").map_err(|e|e.to_string())?;
    let rows=stmt.query_map([],|r|Ok(FinancialRecurrence{id:r.get(0)?,kind:r.get(1)?,description:r.get(2)?,amount_cents:r.get(3)?,day_of_month:r.get(4)?,start_month:r.get(5)?,category_id:r.get(6)?,account_id:r.get(7)?,active:r.get::<_,i32>(8)?!=0})).map_err(|e|e.to_string())?;
    rows.collect::<Result<Vec<_>,_>>().map_err(|e|e.to_string())
}

#[command]
pub fn create_financial_recurrence(kind:String,description:String,amount_cents:i64,day_of_month:i32,start_month:String,category_id:Option<i32>,account_id:Option<i32>) -> Result<(),String> {
    if !["income","expense"].contains(&kind.as_str()) || description.trim().is_empty() || amount_cents<=0 || !(1..=31).contains(&day_of_month) { return Err("Confira descrição, tipo, valor e dia do mês".into()) }
    NaiveDate::parse_from_str(&format!("{start_month}-01"),"%Y-%m-%d").map_err(|_|"Mês inicial inválido".to_string())?;
    let conn=get_connection()?; conn.execute("INSERT INTO financial_recurrences(uuid,kind,description,amount_cents,day_of_month,start_month,category_id,account_id,active,created_at) VALUES(?1,?2,?3,?4,?5,?6,?7,?8,1,?9)",params![Uuid::new_v4().to_string(),kind,description.trim(),amount_cents,day_of_month,start_month,category_id,account_id,now()]).map_err(|e|e.to_string())?; Ok(())
}

#[command]
pub fn set_financial_recurrence_active(id:i32,active:bool) -> Result<(),String> { let conn=get_connection()?; conn.execute("UPDATE financial_recurrences SET active=?1 WHERE id=?2",params![active as i32,id]).map_err(|e|e.to_string())?; Ok(()) }

#[command]
pub fn list_financial_debts() -> Result<Vec<FinancialDebt>,String> {
    let conn=get_connection()?; let mut stmt=conn.prepare("SELECT id,name,balance_cents,monthly_payment_cents,due_day FROM financial_debts ORDER BY due_day,name").map_err(|e|e.to_string())?;
    let rows=stmt.query_map([],|r|Ok(FinancialDebt{id:r.get(0)?,name:r.get(1)?,balance_cents:r.get(2)?,monthly_payment_cents:r.get(3)?,due_day:r.get(4)?})).map_err(|e|e.to_string())?;
    rows.collect::<Result<Vec<_>,_>>().map_err(|e|e.to_string())
}

#[command]
pub fn create_financial_debt(name:String,balance_cents:i64,monthly_payment_cents:i64,due_day:Option<i32>,start_month:String) -> Result<(),String> {
    if name.trim().is_empty() || balance_cents<0 || monthly_payment_cents<0 || due_day.is_some_and(|day| !(1..=31).contains(&day)) || (monthly_payment_cents>0 && due_day.is_none()) { return Err("Confira nome, saldo e vencimento do pagamento mensal".into()) }
    NaiveDate::parse_from_str(&format!("{start_month}-01"),"%Y-%m-%d").map_err(|_|"Mês inicial inválido".to_string())?;
    let mut conn=get_connection()?; let tx=conn.transaction().map_err(|e|e.to_string())?;
    tx.execute("INSERT INTO financial_debts(uuid,name,balance_cents,monthly_payment_cents,due_day,created_at) VALUES(?1,?2,?3,?4,?5,?6)",params![Uuid::new_v4().to_string(),name.trim(),balance_cents,monthly_payment_cents,due_day,now()]).map_err(|e|e.to_string())?;
    if monthly_payment_cents>0 { tx.execute("INSERT INTO financial_recurrences(uuid,kind,description,amount_cents,day_of_month,start_month,active,created_at) VALUES(?1,'expense',?2,?3,?4,?5,1,?6)",params![Uuid::new_v4().to_string(),format!("Pagamento da dívida: {}",name.trim()),monthly_payment_cents,due_day.unwrap_or(1),start_month,now()]).map_err(|e|e.to_string())?; }
    tx.commit().map_err(|e|e.to_string())?; Ok(())
}

#[command]
pub fn update_financial_debt_balance(id:i32,balance_cents:i64)->Result<(),String>{if balance_cents<0{return Err("Saldo da dívida inválido".into())}let conn=get_connection()?;conn.execute("UPDATE financial_debts SET balance_cents=?1 WHERE id=?2",params![balance_cents,id]).map_err(|e|e.to_string())?;Ok(())}
#[command]
pub fn list_financial_goals() -> Result<Vec<FinancialGoal>,String> { let conn=get_connection()?; let mut stmt=conn.prepare("SELECT id,name,target_cents,saved_cents,due_on,priority,contribution_min_cents,contribution_ideal_cents FROM financial_goals ORDER BY priority,name").map_err(|e|e.to_string())?; let rows=stmt.query_map([],|r|Ok(FinancialGoal{id:r.get(0)?,name:r.get(1)?,target_cents:r.get(2)?,saved_cents:r.get(3)?,due_on:r.get(4)?,priority:r.get(5)?,contribution_min_cents:r.get(6)?,contribution_ideal_cents:r.get(7)?})).map_err(|e|e.to_string())?; rows.collect::<Result<Vec<_>,_>>().map_err(|e|e.to_string()) }
#[command]
pub fn create_financial_goal(name:String,target_cents:i64,saved_cents:i64,due_on:Option<String>,priority:i32,contribution_min_cents:i64,contribution_ideal_cents:i64)->Result<(),String>{if name.trim().is_empty()||target_cents<=0||saved_cents<0{return Err("Meta inválida".into())}let conn=get_connection()?;conn.execute("INSERT INTO financial_goals(uuid,name,target_cents,saved_cents,due_on,priority,contribution_min_cents,contribution_ideal_cents,created_at) VALUES(?1,?2,?3,?4,?5,?6,?7,?8,?9)",params![Uuid::new_v4().to_string(),name.trim(),target_cents,saved_cents,due_on,priority.clamp(1,5),contribution_min_cents.max(0),contribution_ideal_cents.max(0),now()]).map_err(|e|e.to_string())?;Ok(())}
#[cfg(test)]
fn seed_financial_example() -> Result<(), String> {
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
pub fn get_financial_dashboard(month:String)->Result<FinancialDashboard,String>{let conn=get_connection()?; ensure_recurrences_for_month(&conn,&month)?;
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
    // Reserve only the part of a category budget not already covered by explicit planned expenses/installments.
    let budgeted_remaining = conn.query_row("
        SELECT COALESCE(SUM(MAX(0, b.limit_cents
            - COALESCE((SELECT SUM(amount_cents) FROM financial_transactions t
                WHERE t.category_id=b.category_id AND t.occurred_on LIKE ?1 AND t.kind='expense' AND t.status='posted'),0)
            - COALESCE((SELECT SUM(amount_cents) FROM financial_transactions t
                WHERE t.category_id=b.category_id AND t.occurred_on LIKE ?1 AND t.kind='expense' AND t.status='planned'),0)
            - COALESCE((SELECT SUM(amount_cents) FROM financial_installments i
                WHERE i.category_id=b.category_id AND i.due_on LIKE ?1 AND i.state='pending'),0))),0)
        FROM financial_budgets b WHERE b.month=?2
    ", params![format!("{month}%"), month], |r| r.get::<_, i64>(0)).unwrap_or(0);

    let balance=opening+posted;
    let committed=planned_expense+installments+budgeted_remaining;
    let available=(balance-committed-goals).max(0);
    let projected=balance+planned_income-committed-goals;
    Ok(FinancialDashboard{current_balance_cents:balance,available_to_spend_cents:available,committed_cents:committed,projected_end_cents:projected,income_cents:income,spent_cents:spent,investments_cents:investments,pending_bills_count:pending,goal_minimum_cents:goals})
}

#[command]
pub fn list_financial_budgets(month: String) -> Result<Vec<crate::models::finance::FinancialBudget>, String> {
    let conn = get_connection()?;
    let mut stmt = conn.prepare("
        SELECT b.id, b.category_id, b.month, b.limit_cents,
               COALESCE((SELECT SUM(amount_cents) FROM financial_transactions t WHERE t.category_id = b.category_id AND t.occurred_on LIKE ?1 AND t.kind = 'expense' AND t.status = 'posted'), 0) as spent_cents,
               COALESCE((SELECT SUM(amount_cents) FROM financial_transactions t WHERE t.category_id = b.category_id AND t.occurred_on LIKE ?1 AND t.kind = 'expense' AND t.status = 'planned'), 0)
               + COALESCE((SELECT SUM(amount_cents) FROM financial_installments i WHERE i.category_id=b.category_id AND i.due_on LIKE ?1 AND i.state='pending'), 0) as committed_cents
        FROM financial_budgets b
        WHERE b.month = ?2
    ").map_err(|e| e.to_string())?;

    let rows = stmt.query_map(params![format!("{month}%"), month], |r| Ok(crate::models::finance::FinancialBudget {
        id: r.get(0)?, category_id: r.get(1)?, month: r.get(2)?, limit_cents: r.get(3)?, spent_cents: r.get(4)?, committed_cents: r.get(5)?
    })).map_err(|e| e.to_string())?;

    rows.collect::<Result<Vec<_>,_>>().map_err(|e|e.to_string())
}

#[command]
pub fn upsert_financial_budget(category_id: i32, month: String, limit_cents: i64) -> Result<(), String> {
    if limit_cents < 0 { return Err("Limite inválido".into()) }
    let conn = get_connection()?;
    conn.execute("INSERT INTO financial_budgets(uuid, category_id, month, limit_cents, created_at) VALUES(?1, ?2, ?3, ?4, ?5) ON CONFLICT(category_id, month) DO UPDATE SET limit_cents = ?4",
        params![Uuid::new_v4().to_string(), category_id, month, limit_cents, now()]
    ).map_err(|e| e.to_string())?;
    Ok(())
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

        let categories = list_financial_categories().unwrap();
        let food_category = categories.iter().find(|category| category.kind == "expense").unwrap();
        upsert_financial_budget(food_category.id, month.clone(), 10_000).unwrap();
        let budgets = list_financial_budgets(month.clone()).unwrap();
        assert_eq!(budgets.len(), 1);
        assert_eq!(budgets[0].spent_cents, 4_850);
        let budgeted_dashboard = get_financial_dashboard(month.clone()).unwrap();
        assert_eq!(budgeted_dashboard.committed_cents, 20_490, "Compromissos da categoria nao devem ser reservados novamente pelo limite");

        // Test 3: Mark installment as paid changes semantics correctly
        let installments = list_financial_installments(month.clone()).unwrap();
        assert_eq!(installments.len(), 1);
        let inst_id = installments[0].id;

        mark_financial_installment_paid(inst_id).unwrap();

        let dash2 = get_financial_dashboard(month.clone()).unwrap();
        assert_eq!(dash2.committed_cents, 7_990, "Parcela paga e lancada no saldo nao deve compor o comprometido");
        assert_eq!(dash2.pending_bills_count, 0, "Deve haver 0 parcelas pendentes");
        assert_eq!(dash2.available_to_spend_cents, 454_660, "Confirmar o pagamento deve refletir a baixa no saldo e na parcela");
    }
}
