import { FormEvent, useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import {
  createFinancialAccount, createFinancialCategory, createFinancialGoal,
  createFinancialInstallment, createFinancialTransaction, getFinancialDashboard,
  listFinancialAccounts, listFinancialCategories, listFinancialGoals,
  listFinancialInstallments, listFinancialTransactions, markFinancialInstallmentPaid,
  seedFinancialExample,
} from "../../features/finance/api"
import type { FinancialAccount, FinancialCategory, FinancialDashboard, FinancialGoal, FinancialInstallment, FinancialTransaction } from "../../types/Finance"

const today = new Date().toISOString().slice(0, 10)
const currentMonth = today.slice(0, 7)
const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })
const toCents = (value: string) => Math.round(Number(value.replace(",", ".")) * 100)
const formatMoney = (value: number) => money.format(value / 100)

export default function FinanceLayout() {
  const [month, setMonth] = useState(currentMonth)
  const [dashboard, setDashboard] = useState<FinancialDashboard | null>(null)
  const [accounts, setAccounts] = useState<FinancialAccount[]>([])
  const [categories, setCategories] = useState<FinancialCategory[]>([])
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([])
  const [installments, setInstallments] = useState<FinancialInstallment[]>([])
  const [goals, setGoals] = useState<FinancialGoal[]>([])
  const [notice, setNotice] = useState("")
  const [accountName, setAccountName] = useState("")
  const [accountBalance, setAccountBalance] = useState("")
  const [categoryName, setCategoryName] = useState("")
  const [transaction, setTransaction] = useState({ kind: "expense", amount: "", description: "", date: today, categoryId: "", accountId: "", status: "posted" })
  const [goal, setGoal] = useState({ name: "", target: "", saved: "", dueOn: "", minimum: "", ideal: "" })
  const [installment, setInstallment] = useState({ description: "", total: "", count: "2", dueOn: today, categoryId: "", accountId: "" })

  const expenseCategories = useMemo(() => categories.filter((category) => category.kind === "expense"), [categories])

  async function load() {
    try {
      const [data, accountRows, categoryRows, transactionRows, installmentRows, goalRows] = await Promise.all([
        getFinancialDashboard(month), listFinancialAccounts(), listFinancialCategories(),
        listFinancialTransactions(month), listFinancialInstallments(month), listFinancialGoals(),
      ])
      setDashboard(data); setAccounts(accountRows); setCategories(categoryRows)
      setTransactions(transactionRows); setInstallments(installmentRows); setGoals(goalRows)
    } catch (error) { setNotice(String(error)) }
  }
  useEffect(() => { load() }, [month])

  async function submitAccount(event: FormEvent) {
    event.preventDefault()
    await createFinancialAccount(accountName, "checking", toCents(accountBalance || "0"))
    setAccountName(""); setAccountBalance(""); setNotice("Conta adicionada."); load()
  }
  async function submitCategory(event: FormEvent) {
    event.preventDefault()
    await createFinancialCategory(categoryName, "expense", false)
    setCategoryName(""); setNotice("Categoria adicionada."); load()
  }
  async function submitTransaction(event: FormEvent) {
    event.preventDefault()
    await createFinancialTransaction(transaction.kind, toCents(transaction.amount), transaction.date, transaction.description, transaction.categoryId ? Number(transaction.categoryId) : null, transaction.accountId ? Number(transaction.accountId) : null, transaction.status)
    setTransaction({ kind: "expense", amount: "", description: "", date: today, categoryId: "", accountId: "", status: "posted" })
    setNotice("Lançamento registrado."); load()
  }
  async function submitGoal(event: FormEvent) {
    event.preventDefault()
    await createFinancialGoal(goal.name, toCents(goal.target), toCents(goal.saved || "0"), goal.dueOn || null, 3, toCents(goal.minimum || "0"), toCents(goal.ideal || "0"))
    setGoal({ name: "", target: "", saved: "", dueOn: "", minimum: "", ideal: "" }); setNotice("Meta criada."); load()
  }
  async function submitInstallment(event: FormEvent) {
    event.preventDefault()
    await createFinancialInstallment(installment.description, toCents(installment.total), Number(installment.count), installment.dueOn, installment.categoryId ? Number(installment.categoryId) : null, installment.accountId ? Number(installment.accountId) : null)
    setInstallment({ description: "", total: "", count: "2", dueOn: today, categoryId: "", accountId: "" }); setNotice("Parcelas planejadas."); load()
  }
  async function payInstallment(id: number) { await markFinancialInstallmentPaid(id); setNotice("Parcela marcada como paga. Registre o gasto realizado para refletir no saldo."); load() }
  async function addExample() { try { await seedFinancialExample(); setNotice("Exemplos inseridos. Você pode começar a substituí-los pelos seus dados."); load() } catch (error) { setNotice(String(error)) } }

  return <div className="page finance-page">
    <nav className="top-nav"><div className="brand"><span className="badge">Finanças</span></div><div className="nav-links"><Link to="/" className="btn btn-ghost">Compras</Link><Link to="/finance" className="btn btn-secondary">Finanças</Link></div></nav>
    <main className="finance-shell">
      <header className="finance-header"><div><p className="eyebrow">Visão mensal</p><h1>Clareza para decidir hoje.</h1><p className="muted">Valores reais, compromissos e estimativas ficam separados.</p></div><div className="finance-header-actions"><button className="btn btn-ghost" onClick={addExample}>Usar exemplos</button><label className="field finance-month"><span>Mês analisado</span><input className="input" type="month" value={month} onChange={(event) => setMonth(event.target.value)} /></label></div></header>
      {notice && <p className="finance-notice">{notice}</p>}
      <section className="finance-kpis">
        <Metric label="Saldo real" value={dashboard?.current_balance_cents ?? 0} hint="Dinheiro confirmado nas contas" />
        <Metric label="Seguro para gastar" value={dashboard?.available_to_spend_cents ?? 0} hint="Após compromissos e mínimos de metas" emphasis />
        <Metric label="Comprometido" value={dashboard?.committed_cents ?? 0} hint={`${dashboard?.pending_bills_count ?? 0} parcela(s) pendente(s)`} />
        <Metric label="Projeção do mês" value={dashboard?.projected_end_cents ?? 0} hint="Estimativa, não garantia" />
      </section>
      <section className="finance-grid">
        <article className="card finance-card"><div className="card-header"><h2>Resumo de {month}</h2><span className="badge">Estimativa</span></div><dl className="finance-summary"><div><dt>Entradas realizadas</dt><dd>{formatMoney(dashboard?.income_cents ?? 0)}</dd></div><div><dt>Gastos realizados</dt><dd>{formatMoney(dashboard?.spent_cents ?? 0)}</dd></div><div><dt>Investimentos realizados</dt><dd>{formatMoney(dashboard?.investments_cents ?? 0)}</dd></div><div><dt>Mínimos para metas</dt><dd>{formatMoney(dashboard?.goal_minimum_cents ?? 0)}</dd></div></dl><p className="muted">O saldo seguro considera apenas compromissos registrados. Planeje imprevistos antes de assumir novas compras.</p></article>
        <article className="card finance-card"><div className="card-header"><h2>+ Adicionar</h2><span className="badge">rápido</span></div><form className="form-stack" onSubmit={submitTransaction}><select className="input" value={transaction.kind} onChange={(e) => setTransaction({...transaction, kind:e.target.value})}><option value="expense">Gasto</option><option value="income">Receita</option><option value="investment">Investimento</option></select><input className="input" required placeholder="Descrição" value={transaction.description} onChange={(e) => setTransaction({...transaction, description:e.target.value})}/><input className="input" required inputMode="decimal" placeholder="Valor (ex.: 120,50)" value={transaction.amount} onChange={(e) => setTransaction({...transaction, amount:e.target.value})}/><div className="form-row"><input className="input" type="date" value={transaction.date} onChange={(e) => setTransaction({...transaction, date:e.target.value})}/><select className="input" value={transaction.status} onChange={(e) => setTransaction({...transaction, status:e.target.value})}><option value="posted">Realizado</option><option value="planned">Planejado</option></select></div><select className="input" value={transaction.accountId} onChange={(e) => setTransaction({...transaction, accountId:e.target.value})}><option value="">Sem conta vinculada</option>{accounts.map((a)=><option key={a.id} value={a.id}>{a.name}</option>)}</select><select className="input" value={transaction.categoryId} onChange={(e) => setTransaction({...transaction, categoryId:e.target.value})}><option value="">Sem categoria</option>{categories.filter((c)=>transaction.kind === "income" ? c.kind === "income" : c.kind === "expense").map((c)=><option key={c.id} value={c.id}>{c.name}</option>)}</select><button className="btn btn-primary">Registrar lançamento</button></form></article>
      </section>
      <section className="finance-grid finance-grid-lower">
        <article className="card finance-card"><h2>Contas e categorias</h2><form className="inline-form" onSubmit={submitAccount}><input className="input" required placeholder="Conta (ex.: Banco)" value={accountName} onChange={(e)=>setAccountName(e.target.value)}/><input className="input" inputMode="decimal" placeholder="Saldo inicial" value={accountBalance} onChange={(e)=>setAccountBalance(e.target.value)}/><button className="btn btn-secondary">Conta</button></form><ul className="finance-list">{accounts.length ? accounts.map((a)=><li key={a.id}><span>{a.name}</span><strong>{formatMoney(a.opening_balance_cents)}</strong></li>) : <li className="muted">Adicione uma conta para começar pelo seu saldo real.</li>}</ul><form className="inline-form" onSubmit={submitCategory}><input className="input" required placeholder="Nova categoria de gasto" value={categoryName} onChange={(e)=>setCategoryName(e.target.value)}/><button className="btn btn-ghost">Categoria</button></form></article>
        <article className="card finance-card"><h2>Parcelas do mês</h2><ul className="finance-list">{installments.length ? installments.map((i)=><li key={i.id}><span><strong>{i.description}</strong><small>{i.due_on}</small></span><span>{formatMoney(i.amount_cents)} {i.state === "pending" && <button className="icon" title="Marcar como paga" onClick={()=>payInstallment(i.id)}>✓</button>}</span></li>) : <li className="muted">Nenhuma parcela para este mês.</li>}</ul><details><summary>Planejar compra parcelada</summary><form className="form-stack finance-details" onSubmit={submitInstallment}><input className="input" required placeholder="Compra" value={installment.description} onChange={(e)=>setInstallment({...installment,description:e.target.value})}/><div className="form-row"><input className="input" required inputMode="decimal" placeholder="Total" value={installment.total} onChange={(e)=>setInstallment({...installment,total:e.target.value})}/><input className="input" required type="number" min="2" placeholder="Parcelas" value={installment.count} onChange={(e)=>setInstallment({...installment,count:e.target.value})}/></div><input className="input" type="date" value={installment.dueOn} onChange={(e)=>setInstallment({...installment,dueOn:e.target.value})}/><select className="input" value={installment.categoryId} onChange={(e)=>setInstallment({...installment,categoryId:e.target.value})}><option value="">Categoria opcional</option>{expenseCategories.map((c)=><option key={c.id} value={c.id}>{c.name}</option>)}</select><button className="btn btn-ghost">Criar parcelas</button></form></details></article>
        <article className="card finance-card"><h2>Metas</h2><ul className="finance-list">{goals.length ? goals.map((g)=><li key={g.id} className="goal-row"><span><strong>{g.name}</strong><small>{formatMoney(g.saved_cents)} de {formatMoney(g.target_cents)}</small><i><b style={{width:`${Math.min(100,(g.saved_cents/g.target_cents)*100)}%`}} /></i></span><strong>{Math.round((g.saved_cents/g.target_cents)*100)}%</strong></li>) : <li className="muted">Crie uma meta para reservar dinheiro com intenção.</li>}</ul><details><summary>Nova meta</summary><form className="form-stack finance-details" onSubmit={submitGoal}><input className="input" required placeholder="Nome da meta" value={goal.name} onChange={(e)=>setGoal({...goal,name:e.target.value})}/><div className="form-row"><input className="input" required inputMode="decimal" placeholder="Valor alvo" value={goal.target} onChange={(e)=>setGoal({...goal,target:e.target.value})}/><input className="input" inputMode="decimal" placeholder="Já guardado" value={goal.saved} onChange={(e)=>setGoal({...goal,saved:e.target.value})}/></div><input className="input" type="date" value={goal.dueOn} onChange={(e)=>setGoal({...goal,dueOn:e.target.value})}/><div className="form-row"><input className="input" inputMode="decimal" placeholder="Mínimo mensal" value={goal.minimum} onChange={(e)=>setGoal({...goal,minimum:e.target.value})}/><input className="input" inputMode="decimal" placeholder="Ideal mensal" value={goal.ideal} onChange={(e)=>setGoal({...goal,ideal:e.target.value})}/></div><button className="btn btn-ghost">Criar meta</button></form></details></article>
      </section>
      <section className="card finance-card"><div className="card-header"><h2>Lançamentos de {month}</h2><span className="badge">{transactions.length}</span></div><ul className="finance-list">{transactions.length ? transactions.map((t)=><li key={t.id}><span><strong>{t.description}</strong><small>{t.occurred_on} · {t.status === "planned" ? "planejado" : "realizado"}</small></span><strong className={t.kind === "income" ? "income" : "expense"}>{t.kind === "income" ? "+" : "−"}{formatMoney(t.amount_cents)}</strong></li>) : <li className="muted">Registre uma receita, gasto ou investimento para formar seu histórico.</li>}</ul></section>
    </main>
  </div>
}

function Metric({ label, value, hint, emphasis = false }: { label: string; value: number; hint: string; emphasis?: boolean }) { return <article className={`finance-metric ${emphasis ? "is-emphasis" : ""}`}><span>{label}</span><strong>{formatMoney(value)}</strong><small>{hint}</small></article> }
