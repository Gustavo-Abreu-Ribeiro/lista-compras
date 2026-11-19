import { FormEvent, useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import AppNavigation from "./AppNavigation"
import { useRefreshOnResume } from "../useRefreshOnResume"
import {
  createFinancialAccount, createFinancialCategory, createFinancialGoal,
  createFinancialInstallment, createFinancialTransaction, getFinancialDashboard,
  listFinancialAccounts, listFinancialCategories, listFinancialGoals,
  listFinancialDebtInstallments,
  listFinancialInstallments, listFinancialTransactions, markFinancialInstallmentPaid,
  createFinancialRecurrence, listFinancialRecurrences,
  setFinancialRecurrenceActive, createFinancialDebtPlan, listFinancialDebts, setFinancialTransactionStatus,
  listFinancialBudgets, upsertFinancialBudget,
  listFinancialHistory,
  deleteFinancialTransaction,
} from "../../features/finance/api"
import type { FinancialAccount, FinancialCategory, FinancialDashboard, FinancialGoal, FinancialInstallment, FinancialDebtInstallment, FinancialTransaction, FinancialRecurrence, FinancialDebt, FinancialBudget, FinancialHistoryPoint } from "../../types/Finance"

const now = new Date()
const today = new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10)
const currentMonth = today.slice(0, 7)
const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })
const toCents = (value: string) => {
  const normalized = value.includes(",") ? value.replace(/\./g, "").replace(",", ".") : value
  const amount = Number(normalized)
  if (!Number.isFinite(amount) || amount < 0) throw new Error("Informe um valor válido, como 120,50.")
  return Math.round(amount * 100)
}
const formatMoney = (value: number) => money.format(value / 100)
const previewCents = (value: string) => { try { return toCents(value) } catch { return 0 } }

export default function FinanceLayout() {
  const [month, setMonth] = useState(currentMonth)
  const [dashboard, setDashboard] = useState<FinancialDashboard | null>(null)
  const [accounts, setAccounts] = useState<FinancialAccount[]>([])
  const [categories, setCategories] = useState<FinancialCategory[]>([])
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([])
  const [installments, setInstallments] = useState<FinancialInstallment[]>([])
  const [goals, setGoals] = useState<FinancialGoal[]>([])
  const [recurrences, setRecurrences] = useState<FinancialRecurrence[]>([])
  const [debts, setDebts] = useState<FinancialDebt[]>([])
  const [debtInstallments, setDebtInstallments] = useState<FinancialDebtInstallment[]>([])
  const [debtPlansUnavailable, setDebtPlansUnavailable] = useState(true)
  const [budgets, setBudgets] = useState<FinancialBudget[]>([])
  const [history, setHistory] = useState<FinancialHistoryPoint[]>([])
  const [tab, setTab] = useState<"overview" | "planning" | "transactions">("overview")
  const [notice, setNotice] = useState("")
  const [accountName, setAccountName] = useState("")
  const [accountBalance, setAccountBalance] = useState("")
  const [categoryName, setCategoryName] = useState("")
  const [categoryKind, setCategoryKind] = useState<"income" | "expense">("expense")
  const [transaction, setTransaction] = useState({ kind: "expense", amount: "", description: "", date: today, categoryId: "", accountId: "", status: "posted" })
  const [goal, setGoal] = useState({ name: "", target: "", saved: "", dueOn: "", minimum: "", ideal: "" })
  const [installment, setInstallment] = useState({ description: "", total: "", count: "2", dueOn: today, categoryId: "", accountId: "" })
  const [recurrence, setRecurrence] = useState({ kind: "expense", description: "", amount: "", day: "5", categoryId: "", accountId: "" })
  const [debt, setDebt] = useState({ name: "", balance: "", count: "1", payment: "", dueOn: today })
  const [budgetForm, setBudgetForm] = useState({ categoryId: "", limit: "" })
  const latestMonth = useRef(month)
  const loadVersion = useRef(0)
  const debtBalanceCents = previewCents(debt.balance)
  const debtInstallmentCents = previewCents(debt.payment)
  const debtPlanTotalCents = (Number(debt.count) || 0) * debtInstallmentCents
  const debtPlanTooSmall = debtBalanceCents > 0 && debtPlanTotalCents > 0 && debtPlanTotalCents < debtBalanceCents

  async function load() {
    const requestedMonth = latestMonth.current
    const version = ++loadVersion.current
    try {
      const [data, accountRows, categoryRows, transactionRows, installmentRows, goalRows, recurrenceRows, debtRows, budgetRows, historyRows, debtPlanRows] = await Promise.all([
        getFinancialDashboard(requestedMonth), listFinancialAccounts(), listFinancialCategories(),
        listFinancialTransactions(requestedMonth), listFinancialInstallments(requestedMonth), listFinancialGoals(), listFinancialRecurrences(), listFinancialDebts(), listFinancialBudgets(requestedMonth),
        listFinancialHistory(requestedMonth), listFinancialDebtInstallments().catch(() => null),
      ])
      if (version !== loadVersion.current || requestedMonth !== latestMonth.current) return
      setDashboard(data); setAccounts(accountRows); setCategories(categoryRows)
      setTransactions(transactionRows); setInstallments(installmentRows); setGoals(goalRows); setRecurrences(recurrenceRows); setDebts(debtRows); setBudgets(budgetRows); setHistory(historyRows)
      setDebtPlansUnavailable(debtPlanRows === null)
      setDebtInstallments(debtPlanRows ?? [])
    } catch (error) {
      if (version !== loadVersion.current || requestedMonth !== latestMonth.current) return
      setDashboard(null); setTransactions([]); setInstallments([]); setBudgets([]); setHistory([])
      setNotice(String(error))
    }
  }
  useRefreshOnResume(() => { void load() })
  useEffect(() => {
    latestMonth.current = month
    setDashboard(null); setTransactions([]); setInstallments([]); setBudgets([]); setHistory([])
    void load()
    return () => { loadVersion.current += 1 }
  }, [month])

  async function submitAccount(event: FormEvent) {
    event.preventDefault()
    try {
      await createFinancialAccount(accountName, "checking", toCents(accountBalance || "0"))
      setAccountName(""); setAccountBalance(""); setNotice("Conta adicionada."); await load()
    } catch (error) { setNotice(String(error)) }
  }
  async function submitCategory(event: FormEvent) {
    event.preventDefault()
    try {
      await createFinancialCategory(categoryName, categoryKind, false)
      setCategoryName(""); setNotice("Categoria criada."); await load()
    } catch (error) { setNotice(String(error)) }
  }
  async function createCategoryFromPicker(name: string, kind: "income" | "expense") {
    try {
      const created = await createFinancialCategory(name, kind, false)
      setCategories((current) => [...current.filter((item) => item.id !== created.id), created]
        .sort((a, b) => a.name.localeCompare(b.name, "pt-BR")))
      setNotice("Categoria criada e selecionada.")
      return created.id
    } catch (error) {
      setNotice(String(error))
      return null
    }
  }
  async function submitTransaction(event: FormEvent) {
    event.preventDefault()
    try {
      await createFinancialTransaction(transaction.kind, toCents(transaction.amount), transaction.date, transaction.description, transaction.categoryId ? Number(transaction.categoryId) : null, transaction.accountId ? Number(transaction.accountId) : null, transaction.status)
      setTransaction({ kind: "expense", amount: "", description: "", date: today, categoryId: "", accountId: "", status: "posted" })
      setNotice("Lançamento registrado."); await load()
    } catch (error) { setNotice(String(error)) }
  }
  async function submitGoal(event: FormEvent) {
    event.preventDefault()
    try {
      await createFinancialGoal(goal.name, toCents(goal.target), toCents(goal.saved || "0"), goal.dueOn || null, 3, toCents(goal.minimum || "0"), toCents(goal.ideal || "0"))
      setGoal({ name: "", target: "", saved: "", dueOn: "", minimum: "", ideal: "" }); setNotice("Meta criada."); await load()
    } catch (error) { setNotice(String(error)) }
  }
  async function submitInstallment(event: FormEvent) {
    event.preventDefault()
    try {
      await createFinancialInstallment(installment.description, toCents(installment.total), Number(installment.count), installment.dueOn, installment.categoryId ? Number(installment.categoryId) : null, installment.accountId ? Number(installment.accountId) : null)
      setInstallment({ description: "", total: "", count: "2", dueOn: today, categoryId: "", accountId: "" }); setNotice("Parcelas planejadas."); await load()
    } catch (error) { setNotice(String(error)) }
  }
  async function submitRecurrence(event: FormEvent) {
    event.preventDefault()
    try {
      await createFinancialRecurrence(recurrence.kind, recurrence.description, toCents(recurrence.amount), Number(recurrence.day), month, recurrence.categoryId ? Number(recurrence.categoryId) : null, recurrence.accountId ? Number(recurrence.accountId) : null)
      setRecurrence({ ...recurrence, description: "", amount: "" }); setNotice("Recorrência criada e incluída no planejamento mensal."); await load()
    } catch (error) { setNotice(String(error)) }
  }
  async function submitDebt(event: FormEvent) {
    event.preventDefault()
    try {
      await createFinancialDebtPlan(debt.name, toCents(debt.balance), Number(debt.count), toCents(debt.payment), debt.dueOn)
      setDebt({ name: "", balance: "", count: "1", payment: "", dueOn: today }); setNotice("Dívida e parcelas adicionadas ao planejamento."); await load()
    } catch (error) { setNotice(String(error)) }
  }
  async function submitBudget(event: FormEvent) {
    event.preventDefault()
    try {
      await upsertFinancialBudget(Number(budgetForm.categoryId), month, toCents(budgetForm.limit))
      setBudgetForm({ categoryId: "", limit: "" }); setNotice("Orçamento salvo para este mês."); await load()
    } catch (error) { setNotice(String(error)) }
  }
  async function payInstallment(id: number) { try { await markFinancialInstallmentPaid(id); setNotice("Pagamento confirmado e gasto lançado no saldo."); await load() } catch (error) { setNotice(String(error)) } }
  async function removeTransaction(item: FinancialTransaction) {
    if (item.recurrence_id != null || item.installment_id != null) {
      setNotice("Este lançamento pertence a uma recorrência ou parcela e deve ser gerenciado pelo planejamento.")
      return
    }
    if (!window.confirm(`Remover o lançamento “${item.description}”?`)) return
    try {
      await deleteFinancialTransaction(item.id)
      setNotice("Lançamento removido.")
      await load()
    } catch (error) {
      setNotice(error instanceof Error ? error.message : String(error))
    }
  }

  return <div className="page finance-page">
    <AppNavigation />
    <main className="finance-shell">
      <header className="finance-header"><div><span className="cartucho-session" aria-hidden="true">SESSION 04 // 財務 // FINANÇAS</span><p className="eyebrow">Finanças</p><h1>Seu dinheiro</h1><p className="muted">Saldo, contas previstas e movimentações.</p></div><div className="finance-header-actions"><button className="btn btn-primary" onClick={() => setTab("transactions")}>Novo lançamento</button><label className="field finance-month"><span>Mês analisado</span><input className="input" type="month" value={month} onChange={(event) => setMonth(event.target.value)} /></label></div></header>
      {notice && <p className="finance-notice" role="status" aria-live="polite">{notice}</p>}
      {accounts.length === 0 && transactions.length === 0 && recurrences.length === 0 && <section className="card finance-onboarding"><div><p className="eyebrow">Primeiro passo</p><h2>Comece pelo saldo que você tem hoje</h2><p className="muted">Cadastre uma conta com o saldo atual. Depois, registre entradas e gastos ou planeje seus valores fixos.</p></div><div className="finance-onboarding-actions"><button className="btn btn-primary" onClick={() => setTab("planning")}>Cadastrar saldo inicial</button></div></section>}
      <nav className="finance-tabs" aria-label="Seções financeiras">{([ ["overview", "Resumo"], ["planning", "Planejamento"], ["transactions", "Lançamentos"] ] as const).map(([id, label]) => <button key={id} className={tab === id ? "is-active" : ""} aria-current={tab === id ? "page" : undefined} onClick={() => setTab(id)}>{label}</button>)}</nav>
      {tab === "overview" && <>
      <section className="finance-kpis">
        <Metric label="Seguro para gastar" value={dashboard?.available_to_spend_cents ?? 0} hint="Depois das contas previstas e reservas" emphasis />
        <Metric label="Saldo real" value={dashboard?.current_balance_cents ?? 0} hint="Saldo inicial + movimentações realizadas" />
        <Metric label="Reservado neste mês" value={dashboard?.committed_cents ?? 0} hint="Gastos previstos, parcelas e limites ainda livres" />
        <Metric label="Projeção do mês" value={dashboard?.projected_end_cents ?? 0} hint="Estimativa, não garantia" />
      </section>
      <section className="finance-grid finance-overview-grid">
        <article className="card finance-card"><div className="card-header"><h2>Resumo de {month}</h2><span className="badge">Realizado</span></div><dl className="finance-summary"><div><dt>Entradas</dt><dd>{formatMoney(dashboard?.income_cents ?? 0)}</dd></div><div><dt>Gastos</dt><dd>{formatMoney(dashboard?.spent_cents ?? 0)}</dd></div><div><dt>Investimentos</dt><dd>{formatMoney(dashboard?.investments_cents ?? 0)}</dd></div><div><dt>Reserva mínima</dt><dd>{formatMoney(dashboard?.goal_minimum_cents ?? 0)}</dd></div></dl></article>
        <article className="card finance-card"><h2>Realizado · últimos 6 meses</h2><FinanceChart rows={history}/></article>
      </section>
      <section className="finance-grid finance-overview-grid"><article className="card finance-card"><h2>Compromissos do mês</h2><p className="muted">{installments.filter((item) => item.state === "pending").length} parcelas pendentes · {recurrences.filter((item) => item.active).length} recorrências ativas</p><button className="btn btn-secondary" onClick={() => setTab("planning")}>Abrir planejamento</button></article><article className="card finance-card"><h2>Dívidas cadastradas</h2>{debts.length ? <ul className="finance-list">{debts.slice(0, 3).map((item) => <li key={item.id}><span>{item.name}</span><strong>{formatMoney(item.balance_cents)}</strong></li>)}</ul> : <p className="muted">Cadastre dívidas para acompanhar saldo e pagamento mensal.</p>}</article></section>
      </>}
      {tab === "planning" && <>
      <section className="finance-kpis finance-planning-kpis" aria-label="Painel do planejamento">
        <Metric label="Total cadastrado" value={debts.reduce((sum,item)=>sum+item.balance_cents,0)} hint={`${debts.length} dívida(s)`} />
        <Metric label="Falta pagar" value={debtPlansUnavailable?debts.reduce((sum,item)=>sum+item.balance_cents,0):debtInstallments.filter((item)=>item.state==="pending").reduce((sum,item)=>sum+item.amount_cents,0)} hint="Soma das parcelas pendentes" />
        <Metric label="Parcelas neste mês" value={debtInstallments.filter((item)=>item.due_on.startsWith(month)&&item.state==="pending").reduce((sum,item)=>sum+item.amount_cents,0)} hint={`Compromissos de ${month}`} emphasis />
      </section>
      <details className="finance-supporting finance-debt-projection"><summary>Parcelas nos próximos meses <span className="muted">· 6 meses</span></summary><section className="card finance-card"><div className="card-header"><div><h2>Parcelas nos próximos meses</h2><p className="muted">Saídas dos planos de dívida cadastrados; outros ganhos e gastos não entram neste quadro.</p></div></div><ul className="finance-list">{Array.from({length:6},(_,index)=>{const [year,monthNumber]=month.split("-").map(Number);const date=new Date(year,monthNumber-1+index,1);const key=`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}`;const amount=debtInstallments.filter((item)=>item.state==="pending"&&item.due_on.startsWith(key)).reduce((sum,item)=>sum+item.amount_cents,0);return <li key={key}><span><strong>{date.toLocaleDateString("pt-BR",{month:"long",year:"numeric"})}</strong><small>Parcelas de dívidas</small></span><strong>{formatMoney(amount)}</strong></li>})}</ul>{debtPlansUnavailable&&<p className="finance-notice" role="status">Atualize o banco para exibir os planos parcelados de dívidas.</p>}</section></details>
      <section className="finance-grid finance-grid-lower">
        <article className="card finance-card"><div className="card-header"><h2>Renda e gastos fixos</h2><span className="badge">mensal</span></div><p className="muted">Cada recorrência cria uma previsão para o mês selecionado. Marque como realizado em Lançamentos quando acontecer.</p><details className="finance-add-recurrence"><summary>+ Planejar renda ou gasto fixo</summary><form className="form-stack finance-details" onSubmit={submitRecurrence}><label className="field"><span>Tipo recorrente</span><select className="input" value={recurrence.kind} onChange={(e)=>setRecurrence({...recurrence,kind:e.target.value,categoryId:""})}><option value="income">Salário / renda</option><option value="expense">Gasto fixo</option></select></label><input className="input" required placeholder="Descrição (ex.: salário, aluguel)" value={recurrence.description} onChange={(e)=>setRecurrence({...recurrence,description:e.target.value})}/><div className="form-row"><input className="input" required inputMode="decimal" placeholder="Valor mensal" value={recurrence.amount} onChange={(e)=>setRecurrence({...recurrence,amount:e.target.value})}/><label className="field"><span>Dia do mês</span><input className="input" type="number" min="1" max="31" value={recurrence.day} onChange={(e)=>setRecurrence({...recurrence,day:e.target.value})}/></label></div><CategoryPicker label="Categoria da recorrência (opcional)" kind={recurrence.kind as "income" | "expense"} value={recurrence.categoryId} onChange={(categoryId) => setRecurrence({...recurrence, categoryId})} categories={categories} onCreate={createCategoryFromPicker} /><button className="btn btn-primary">Adicionar recorrência</button></form></details><ul className="finance-list">{recurrences.map((item)=><li key={item.id}><span><strong>{item.description}</strong><small>{item.kind === "income" ? "Renda" : "Gasto fixo"} · dia {item.day_of_month} · {formatMoney(item.amount_cents)}</small></span><button className="btn btn-ghost" onClick={async()=>{await setFinancialRecurrenceActive(item.id,!item.active); await load()}}>{item.active ? "Pausar" : "Ativar"}</button></li>)}</ul></article>
        <article className="card finance-card finance-debt-summary"><div className="card-header"><div><h2>Dívidas</h2><p className="muted">Visão rápida dos parcelamentos.</p></div><Link className="btn btn-ghost" to="/finance/debts">Ver todas →</Link></div><ul className="finance-list">{debts.slice(0,3).map(item=>{const plan=debtInstallments.filter(row=>row.debt_id===item.id);const remaining=plan.filter(row=>row.state==="pending").reduce((sum,row)=>sum+row.amount_cents,0);return <li key={item.id}><span><strong>{item.name}</strong><small>{plan.length?`${plan.filter(row=>row.state==="paid").length} de ${plan.length} pagas`:"Parcelamento não definido"}</small></span><strong>{formatMoney(plan.length?remaining:item.balance_cents)}</strong></li>})}{!debts.length&&<li className="muted">Nenhuma dívida cadastrada.</li>}</ul><div className="finance-debt-summary-actions"><details className="finance-add-debt"><summary>+ Cadastro rápido</summary><form className="form-stack finance-details" onSubmit={submitDebt}><input className="input" required placeholder="Nome da dívida" value={debt.name} onChange={(e)=>setDebt({...debt,name:e.target.value})}/><input className="input" required inputMode="decimal" placeholder="Valor total" value={debt.balance} onChange={(e)=>setDebt({...debt,balance:e.target.value})}/><div className="form-row"><input className="input" aria-label="Quantidade de parcelas" type="number" min="1" max="120" required value={debt.count} onChange={(e)=>setDebt({...debt,count:e.target.value})}/><input className="input" aria-label="Valor por parcela" required inputMode="decimal" placeholder="Valor por parcela" value={debt.payment} onChange={(e)=>setDebt({...debt,payment:e.target.value})}/></div><input className="input" aria-label="Primeiro vencimento" type="date" required value={debt.dueOn} onChange={(e)=>setDebt({...debt,dueOn:e.target.value})}/><p className="muted">Total programado: {formatMoney(debtPlanTotalCents)}</p>{debtPlanTooSmall&&<p className="finance-notice">O total das parcelas precisa cobrir a dívida.</p>}{debtPlansUnavailable&&<p className="finance-notice">A migration de planos parcelados precisa ser aplicada antes de salvar.</p>}<button className="btn btn-secondary" disabled={debtPlanTooSmall||debtPlansUnavailable}>Cadastrar dívida</button></form></details></div></article>
      </section>
      <details className="finance-supporting"><summary>Contas, categorias, parcelas, metas e limites</summary>
      <section className="finance-grid finance-grid-lower">
        <article className="card finance-card"><h2>Contas</h2><details className="finance-add-account"><summary>{accounts.length ? "Adicionar conta" : "Cadastrar saldo inicial"}</summary><form className="inline-form" onSubmit={submitAccount}><input className="input" required placeholder="Conta (ex.: Banco)" value={accountName} onChange={(e)=>setAccountName(e.target.value)}/><input className="input" required inputMode="decimal" placeholder="Saldo no início do controle (ex.: 1.500,00)" value={accountBalance} onChange={(e)=>setAccountBalance(e.target.value)}/><button className="btn btn-secondary">Salvar conta</button></form></details><ul className="finance-list">{accounts.length ? accounts.map((a)=><li key={a.id}><span>{a.name}<small>Saldo inicial</small></span><strong>{formatMoney(a.opening_balance_cents)}</strong></li>) : <li className="muted">Adicione uma conta para começar pelo seu saldo real.</li>}</ul><div className="category-management"><p className="muted">Categoria serve para agrupar lançamentos parecidos (por exemplo, Moradia ou Salário). É opcional e não representa uma conta.</p><form className="form-stack" onSubmit={submitCategory}><label className="field"><span>Tipo da categoria</span><select className="input" value={categoryKind} onChange={(event)=>setCategoryKind(event.target.value as "income" | "expense")}><option value="expense">Gastos</option><option value="income">Rendas</option></select></label><div className="inline-form"><input className="input" required placeholder="Nome da categoria" value={categoryName} onChange={(event)=>setCategoryName(event.target.value)}/><button className="btn btn-secondary">Criar categoria</button></div></form><ul className="finance-list">{categories.map((category)=><li key={category.id}><span>{category.name}</span><small>{category.kind === "income" ? "Renda" : "Gasto"}</small></li>)}</ul></div></article>
        <article className="card finance-card"><h2>Parcelas e pagamentos</h2><p className="muted">Ao confirmar, o app lança o gasto no saldo e tira a parcela dos pendentes de uma vez.</p><ul className="finance-list">{installments.length ? installments.map((i)=><li key={i.id}><span><strong>{i.description}</strong><small>{i.due_on}</small></span><span>{formatMoney(i.amount_cents)} {i.state === "pending" && <button className="btn btn-ghost" onClick={()=>payInstallment(i.id)}>Confirmar pagamento</button>}</span></li>) : <li className="muted">Nenhuma parcela para este mês.</li>}</ul><details><summary>Planejar compra parcelada</summary><form className="form-stack finance-details" onSubmit={submitInstallment}><input className="input" required placeholder="Compra" value={installment.description} onChange={(e)=>setInstallment({...installment,description:e.target.value})}/><div className="form-row"><input className="input" required inputMode="decimal" placeholder="Total" value={installment.total} onChange={(e)=>setInstallment({...installment,total:e.target.value})}/><input className="input" required type="number" min="2" placeholder="Parcelas" value={installment.count} onChange={(e)=>setInstallment({...installment,count:e.target.value})}/></div><input className="input" type="date" value={installment.dueOn} onChange={(e)=>setInstallment({...installment,dueOn:e.target.value})}/><CategoryPicker label="Categoria da parcela (opcional)" kind="expense" value={installment.categoryId} onChange={(categoryId) => setInstallment({...installment, categoryId})} categories={categories} onCreate={createCategoryFromPicker} /><button className="btn btn-ghost">Criar parcelas</button></form></details></article>
        <article className="card finance-card"><h2>Metas de reserva</h2><ul className="finance-list">{goals.length ? goals.map((g)=><li key={g.id} className="goal-row"><span><strong>{g.name}</strong><small>{formatMoney(g.saved_cents)} de {formatMoney(g.target_cents)}</small><i><b style={{width:`${Math.min(100,(g.saved_cents/g.target_cents)*100)}%`}} /></i></span><strong>{Math.round((g.saved_cents/g.target_cents)*100)}%</strong></li>) : <li className="muted">Crie uma meta para reservar dinheiro com intenção.</li>}</ul><details><summary>Nova meta</summary><form className="form-stack finance-details" onSubmit={submitGoal}><input className="input" required placeholder="Nome da meta" value={goal.name} onChange={(e)=>setGoal({...goal,name:e.target.value})}/><div className="form-row"><input className="input" required inputMode="decimal" placeholder="Valor alvo" value={goal.target} onChange={(e)=>setGoal({...goal,target:e.target.value})}/><input className="input" inputMode="decimal" placeholder="Já guardado" value={goal.saved} onChange={(e)=>setGoal({...goal,saved:e.target.value})}/></div><input className="input" type="date" value={goal.dueOn} onChange={(e)=>setGoal({...goal,dueOn:e.target.value})}/><div className="form-row"><input className="input" inputMode="decimal" placeholder="Mínimo mensal" value={goal.minimum} onChange={(e)=>setGoal({...goal,minimum:e.target.value})}/><input className="input" inputMode="decimal" placeholder="Ideal mensal" value={goal.ideal} onChange={(e)=>setGoal({...goal,ideal:e.target.value})}/></div><button className="btn btn-ghost">Criar meta</button></form></details></article>
        <article className="card finance-card"><h2>Limites de gastos</h2><p className="muted">Defina quanto pretende gastar em cada categoria neste mês. Limites ajudam a reservar o que ainda não foi gasto.</p><form className="form-stack finance-details" onSubmit={submitBudget}><CategoryPicker label="Categoria para limitar" kind="expense" value={budgetForm.categoryId} onChange={(categoryId) => setBudgetForm({...budgetForm,categoryId})} categories={categories} onCreate={createCategoryFromPicker} optional={false} /><input className="input" required inputMode="decimal" placeholder={`Limite de ${month}`} value={budgetForm.limit} onChange={(e)=>setBudgetForm({...budgetForm,limit:e.target.value})}/><button className="btn btn-secondary">Salvar limite</button></form><ul className="finance-list">{budgets.map((budget)=>{const category=categories.find((item)=>item.id===budget.category_id);const remaining=Math.max(0,budget.limit_cents-budget.spent_cents-budget.committed_cents);return <li key={budget.id}><span><strong>{category?.name ?? "Categoria"}</strong><small>Realizado {formatMoney(budget.spent_cents)} · previsto {formatMoney(budget.committed_cents)} · limite {formatMoney(budget.limit_cents)}</small><i><b style={{width:`${Math.min(100,budget.limit_cents ? (budget.spent_cents+budget.committed_cents)/budget.limit_cents*100 : 0)}%`}}/></i></span><strong>{formatMoney(remaining)}</strong></li>})}{!budgets.length && <li className="muted">Defina limites para acompanhar o que resta neste mês.</li>}</ul></article>
      </section></details></>}
      {tab === "transactions" && <>
      <article className="card finance-card finance-quick-card"><div className="card-header"><h2>Novo lançamento</h2></div><form className="form-stack" onSubmit={submitTransaction}><label className="field"><span>Tipo</span><select className="input" value={transaction.kind} onChange={(e) => setTransaction({...transaction, kind:e.target.value, categoryId:""})}><option value="expense">Gasto</option><option value="income">Receita / salário</option><option value="investment">Investimento</option></select></label><label className="field"><span>Descrição</span><input className="input" required placeholder="Ex.: salário, aluguel, mercado" value={transaction.description} onChange={(e) => setTransaction({...transaction, description:e.target.value})}/></label><label className="field"><span>Valor</span><input className="input" required inputMode="decimal" placeholder="Ex.: 120,50" value={transaction.amount} onChange={(e) => setTransaction({...transaction, amount:e.target.value})}/></label><div className="form-row"><label className="field"><span>Data</span><input className="input" type="date" value={transaction.date} onChange={(e) => setTransaction({...transaction, date:e.target.value})}/></label><label className="field"><span>Status</span><select className="input" value={transaction.status} onChange={(e) => setTransaction({...transaction, status:e.target.value})}><option value="posted">Realizado</option><option value="planned">Planejado</option></select></label></div><label className="field"><span>Conta</span><select className="input" value={transaction.accountId} onChange={(e) => setTransaction({...transaction, accountId:e.target.value})}><option value="">Sem conta vinculada</option>{accounts.map((a)=><option key={a.id} value={a.id}>{a.name}</option>)}</select></label><CategoryPicker label="Categoria do lançamento" kind={transaction.kind === "income" ? "income" : "expense"} value={transaction.categoryId} onChange={(categoryId) => setTransaction({...transaction, categoryId})} categories={categories} onCreate={createCategoryFromPicker} /><button className="btn btn-primary">Registrar lançamento</button></form></article>
      <section className="card finance-card"><div className="card-header"><h2>Lançamentos de {month}</h2><span className="badge">{transactions.length}</span></div><ul className="finance-list finance-transactions-list">{transactions.length ? transactions.map((t)=><li key={t.id}><span><strong>{t.description}</strong><small>{t.occurred_on} · {t.status === "planned" ? "previsto" : "realizado"} · {categories.find((category) => category.id === t.category_id)?.name ?? "sem categoria"} · {accounts.find((account) => account.id === t.account_id)?.name ?? "sem conta"}</small></span><span><strong className={t.kind === "income" ? "income" : "expense"}>{t.kind === "income" ? "+" : "−"}{formatMoney(t.amount_cents)}</strong>{t.status === "planned" && <button type="button" className="btn btn-ghost" onClick={async()=>{try { await setFinancialTransactionStatus(t.id,"posted"); await load(); setNotice("Lançamento confirmado como realizado.") } catch (error) { setNotice(String(error)) }}}>Marcar realizado</button>}{t.recurrence_id == null && t.installment_id == null && <button type="button" className="btn btn-ghost finance-delete" onClick={()=>removeTransaction(t)}>Remover</button>}</span></li>) : <li className="muted">Registre uma receita, gasto ou investimento para formar seu histórico.</li>}</ul></section>
      </>}
    </main>
  </div>
}

function Metric({ label, value, hint, emphasis = false }: { label: string; value: number; hint: string; emphasis?: boolean }) { return <article className={`finance-metric ${emphasis ? "is-emphasis" : ""}`}><span>{label}</span><strong>{formatMoney(value)}</strong><small>{hint}</small></article> }

function FinanceChart({ rows }: { rows: FinancialHistoryPoint[] }) {
  const max = Math.max(1, ...rows.flatMap((row) => [row.income_cents, row.spent_cents]))
  return <div className="finance-chart" role="img" aria-label="Gráfico de entradas e gastos realizados nos últimos seis meses">
    <div className="finance-chart-legend"><span><i className="chart-income"/>Entradas</span><span><i className="chart-expense"/>Gastos</span></div>
    <div className="finance-chart-bars">{rows.map((row) => <div className="finance-chart-month" key={row.month} title={`${row.month}: entradas ${formatMoney(row.income_cents)}, gastos ${formatMoney(row.spent_cents)}`}><div className="finance-chart-pair"><i className="chart-income" style={{ height: `${Math.max(2, row.income_cents / max * 100)}%` }}/><i className="chart-expense" style={{ height: `${Math.max(2, row.spent_cents / max * 100)}%` }}/></div><small>{row.month.slice(5)}</small></div>)}</div>
  </div>
}

function CategoryPicker({ label, kind, value, onChange, onCreate, categories, optional = true }: {
  label: string
  kind: "income" | "expense"
  value: string
  onChange: (value: string) => void
  onCreate: (name: string, kind: "income" | "expense") => Promise<number | null>
  categories: FinancialCategory[]
  optional?: boolean
}) {
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState("")
  const [saving, setSaving] = useState(false)
  async function submit() {
    if (!name.trim() || saving) return
    setSaving(true)
    try {
      const id = await onCreate(name.trim(), kind)
      if (id !== null) { onChange(String(id)); setName(""); setCreating(false) }
    } finally {
      setSaving(false)
    }
  }
  return <div className="category-picker">
    <label className="field"><span>{label}</span><select className="input" required={!optional} value={value} onChange={(event) => onChange(event.target.value)}><option value="">{optional ? "Sem categoria (opcional)" : "Escolha uma categoria"}</option>{categories.filter((category) => category.kind === kind).map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
    <button type="button" className="text-button" onClick={() => setCreating(!creating)}>{creating ? "Cancelar" : "+ Criar categoria"}</button>
    {creating && <div className="inline-form category-create"><input className="input" aria-label="Nome da nova categoria" autoFocus placeholder={kind === "income" ? "Ex.: Salário, renda extra" : "Ex.: Moradia, alimentação"} value={name} onChange={(event) => setName(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); void submit() } }}/><button type="button" className="btn btn-secondary" disabled={saving || !name.trim()} onClick={() => void submit()}>{saving ? "Salvando…" : "Criar e selecionar"}</button></div>}
    <small className="category-help">Categorias agrupam lançamentos para facilitar a leitura e os limites mensais. Não são contas.</small>
  </div>
}
