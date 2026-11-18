import { FormEvent, useEffect, useState } from "react"
import { Link } from "react-router-dom"
import AppNavigation from "./AppNavigation"
import {
  createFinancialDebtPlan, listFinancialDebtInstallments, listFinancialDebts,
  markFinancialInstallmentPaid, setFinancialDebtPlan,
} from "../../features/finance/api"
import type { FinancialDebt, FinancialDebtInstallment } from "../../types/Finance"

const now = new Date()
const today = new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10)
const currentMonth = today.slice(0, 7)
const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })
const formatMoney = (value: number) => money.format(value / 100)

function toCents(value: string) {
  const normalized = value.includes(",") ? value.replace(/\./g, "").replace(",", ".") : value
  const amount = Number(normalized)
  if (!Number.isFinite(amount) || amount <= 0) throw new Error("Informe um valor maior que zero.")
  return Math.round(amount * 100)
}

type PlanForm = { count: string; payment: string; dueOn: string }
const emptyPlan = (): PlanForm => ({ count: "1", payment: "", dueOn: today })

export default function FinanceDebtsLayout() {
  const [debts, setDebts] = useState<FinancialDebt[]>([])
  const [installments, setInstallments] = useState<FinancialDebtInstallment[]>([])
  const [plansUnavailable, setPlansUnavailable] = useState(false)
  const [notice, setNotice] = useState("")
  const [saving, setSaving] = useState(false)
  const [newDebt, setNewDebt] = useState({ name: "", total: "", ...emptyPlan() })
  const [legacyPlans, setLegacyPlans] = useState<Record<number, PlanForm>>({})

  async function load() {
    try {
      const debtRows = await listFinancialDebts()
      setDebts(debtRows)
      try {
        setInstallments(await listFinancialDebtInstallments())
        setPlansUnavailable(false)
      } catch {
        setInstallments([])
        setPlansUnavailable(true)
      }
    } catch (error) {
      setNotice(error instanceof Error ? error.message : String(error))
    }
  }

  useEffect(() => { void load() }, [])

  async function submitNewDebt(event: FormEvent) {
    event.preventDefault()
    try {
      setSaving(true)
      const total = toCents(newDebt.total)
      const payment = toCents(newDebt.payment)
      if (payment * Number(newDebt.count) < total) throw new Error("O total das parcelas precisa cobrir o valor da dívida.")
      await createFinancialDebtPlan(newDebt.name, total, Number(newDebt.count), payment, newDebt.dueOn)
      setNewDebt({ name: "", total: "", ...emptyPlan() })
      setNotice("Dívida cadastrada e incluída na previsão mensal.")
      await load()
    } catch (error) {
      setNotice(error instanceof Error ? error.message : String(error))
    } finally { setSaving(false) }
  }

  async function submitLegacyPlan(event: FormEvent, debt: FinancialDebt) {
    event.preventDefault()
    const form = legacyPlans[debt.id] ?? emptyPlan()
    try {
      setSaving(true)
      const payment = toCents(form.payment)
      if (payment * Number(form.count) < debt.balance_cents) throw new Error("O total das parcelas precisa cobrir o valor da dívida.")
      await setFinancialDebtPlan(debt.id, Number(form.count), payment, form.dueOn)
      setNotice("Parcelamento definido e incluído na previsão mensal.")
      await load()
    } catch (error) {
      setNotice(error instanceof Error ? error.message : String(error))
    } finally { setSaving(false) }
  }

  async function payInstallment(row: FinancialDebtInstallment) {
    try {
      await markFinancialInstallmentPaid(row.id)
      setNotice(`${row.description} marcada como paga.`)
      await load()
    } catch (error) { setNotice(error instanceof Error ? error.message : String(error)) }
  }

  const totalDebt = debts.reduce((sum, debt) => sum + debt.balance_cents, 0)
  const remaining = installments.filter(row => row.state === "pending").reduce((sum, row) => sum + row.amount_cents, 0)
  const currentCommitment = installments.filter(row => row.state === "pending" && row.due_on.startsWith(currentMonth)).reduce((sum, row) => sum + row.amount_cents, 0)

  return <div className="page finance-page debt-page">
    <AppNavigation />
    <main className="finance-shell">
      <header className="finance-header debt-header"><div><p className="eyebrow">Finanças</p><h1>Dívidas</h1><p className="muted">Parcelamentos, pagamentos e compromissos dos próximos meses.</p></div><Link className="btn btn-ghost" to="/finance">← Voltar para finanças</Link></header>
      {notice && <p className="finance-notice" role="status" aria-live="polite">{notice}</p>}
      {plansUnavailable && <p className="finance-notice" role="status">A atualização do banco de planos parcelados ainda está pendente. O total cadastrado permanece visível; parcelas e valor restante ficam disponíveis após aplicá-la.</p>}
      <section className="finance-kpis" aria-label="Resumo das dívidas">
        <Metric label="Total cadastrado" value={totalDebt} hint={`${debts.length} dívida(s)`} />
        <Metric label="Falta pagar" value={plansUnavailable ? null : remaining} hint="Soma das parcelas pendentes" emphasis />
        <Metric label="Neste mês" value={plansUnavailable ? null : currentCommitment} hint={`Compromissos de ${currentMonth}`} />
      </section>

      <details className="finance-supporting debt-new"><summary>+ Cadastrar nova dívida</summary><section className="card finance-card"><form className="form-stack finance-details" onSubmit={submitNewDebt}>
        <label className="field"><span>Nome da dívida</span><input className="input" required placeholder="Ex.: Mercado Pago" value={newDebt.name} onChange={event => setNewDebt({ ...newDebt, name: event.target.value })}/></label>
        <label className="field"><span>Valor total da dívida</span><input className="input" required inputMode="decimal" placeholder="Ex.: 1.000,00" value={newDebt.total} onChange={event => setNewDebt({ ...newDebt, total: event.target.value })}/></label>
        <PlanFields value={newDebt} onChange={value => setNewDebt({ ...newDebt, ...value })}/>
        <PlanPreview total={newDebt.total} count={newDebt.count} payment={newDebt.payment}/>
        {plansUnavailable && <p className="finance-notice" role="status">A migration de planos parcelados precisa ser aplicada ao projeto Supabase antes de salvar.</p>}
        <button className="btn btn-primary" disabled={saving || plansUnavailable}>{saving ? "Salvando…" : "Cadastrar dívida"}</button>
      </form></section></details>

      <section className="debt-list" aria-label="Dívidas cadastradas">
        {debts.length === 0 && <div className="card empty-state"><h2>Nenhuma dívida cadastrada</h2><p>Cadastre a primeira dívida para montar a previsão mensal.</p></div>}
        {debts.map(debt => {
          const plan = installments.filter(row => row.debt_id === debt.id)
          const planTotal = plan.reduce((sum, row) => sum + row.amount_cents, 0)
          const planRemaining = plan.filter(row => row.state === "pending").reduce((sum, row) => sum + row.amount_cents, 0)
          const paid = plan.filter(row => row.state === "paid").length
          const legacy = plan.length === 0
          const form = legacyPlans[debt.id] ?? emptyPlan()
          return <details className="debt-row card" key={debt.id}>
            <summary><span><strong>{debt.name}</strong><small>{legacy ? "Parcelamento ainda não definido" : `${paid} de ${plan.length} parcelas pagas`}</small></span><span className="debt-summary-values"><small>Falta pagar</small><strong>{formatMoney(legacy ? debt.balance_cents : planRemaining)}</strong></span></summary>
            <div className="debt-plan-detail">
              <dl className="debt-totals"><div><dt>Valor da dívida</dt><dd>{formatMoney(debt.balance_cents)}</dd></div><div><dt>Total do plano</dt><dd>{legacy ? "—" : formatMoney(planTotal)}</dd></div><div><dt>Falta pagar</dt><dd>{legacy ? "A definir" : formatMoney(planRemaining)}</dd></div></dl>
              {legacy ? <form className="form-stack debt-legacy-plan" onSubmit={event => submitLegacyPlan(event, debt)}><h3>Definir parcelamento</h3><p className="muted">Informe as parcelas desta dívida antiga para incluí-la no planejamento mensal.</p><PlanFields value={form} onChange={value => setLegacyPlans({ ...legacyPlans, [debt.id]: value })}/><PlanPreview total={String(debt.balance_cents / 100).replace(".", ",")} count={form.count} payment={form.payment}/>{plansUnavailable && <p className="finance-notice">A migration de planos parcelados precisa ser aplicada antes de converter esta dívida.</p>}<button className="btn btn-secondary" disabled={saving || plansUnavailable}>Salvar parcelamento</button></form>
              : <ul className="debt-month-grid">{plan.map((row, index) => <li key={row.id}><label className="debt-month-check"><input type="checkbox" checked={row.state === "paid"} disabled={row.state === "paid"} onChange={() => void payInstallment(row)}/><span><strong>{index + 1}ª parcela</strong><small>{new Date(`${row.due_on}T00:00:00`).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}</small></span></label><strong>{formatMoney(row.amount_cents)}</strong></li>)}</ul>}
            </div>
          </details>
        })}
      </section>

      <details className="finance-supporting debt-forecast"><summary>Previsão de parcelas <span className="muted">· próximos 6 meses</span></summary><section className="card finance-card"><ul className="finance-list">{Array.from({ length: 6 }, (_, index) => { const [year, monthNumber] = currentMonth.split("-").map(Number); const date = new Date(year, monthNumber - 1 + index, 1); const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`; const amount = installments.filter(row => row.state === "pending" && row.due_on.startsWith(key)).reduce((sum, row) => sum + row.amount_cents, 0); return <li key={key}><span><strong>{date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}</strong><small>{installments.filter(row => row.state === "pending" && row.due_on.startsWith(key)).length} parcela(s)</small></span><strong>{formatMoney(amount)}</strong></li> })}</ul></section></details>
    </main>
  </div>
}

function PlanFields({ value, onChange }: { value: PlanForm; onChange: (value: PlanForm) => void }) {
  return <><div className="form-row"><label className="field"><span>Quantidade de parcelas</span><input className="input" required type="number" min="1" max="120" value={value.count} onChange={event => onChange({ ...value, count: event.target.value })}/></label><label className="field"><span>Valor por parcela</span><input className="input" required inputMode="decimal" placeholder="Ex.: 50,00" value={value.payment} onChange={event => onChange({ ...value, payment: event.target.value })}/></label></div><label className="field"><span>Primeiro vencimento</span><input className="input" required type="date" value={value.dueOn} onChange={event => onChange({ ...value, dueOn: event.target.value })}/></label></>
}

function PlanPreview({ total, count, payment }: { total: string; count: string; payment: string }) {
  let debtTotal = 0; let planTotal = 0
  try { debtTotal = toCents(total) } catch { /* preview vazio */ }
  try { planTotal = toCents(payment) * (Number(count) || 0) } catch { /* preview vazio */ }
  return <p className="debt-plan-preview"><span>Total programado <strong>{formatMoney(planTotal)}</strong></span><span>Diferença sobre a dívida <strong>{formatMoney(Math.max(0, planTotal - debtTotal))}</strong></span></p>
}

function Metric({ label, value, hint, emphasis = false }: { label: string; value: number | null; hint: string; emphasis?: boolean }) {
  return <article className={`finance-metric ${emphasis ? "is-emphasis" : ""}`}><span>{label}</span><strong>{value === null ? "—" : formatMoney(value)}</strong><small>{hint}</small></article>
}
