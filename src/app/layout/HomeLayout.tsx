import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import AppNavigation from "./AppNavigation"
import { useRefreshOnResume } from "../useRefreshOnResume"
import { listCategories } from "../../features/categories/api"
import { listAllItems } from "../../features/items/api"
import { listAllLinks } from "../../features/itemLinks/api"
import { getFinancialDashboard, listFinancialInstallments } from "../../features/finance/api"
import type { FinancialDashboard, FinancialInstallment } from "../../types/Finance"
import type { Category } from "../../types/Category"
import type { ItemLink } from "../../types/ItemLink"

type PricedLink = ItemLink & { item_name: string }

const now = new Date()
const localToday = new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
const currentMonth = localToday.toISOString().slice(0, 7)
const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })
const formatMoney = (cents: number) => money.format(cents / 100)

export default function HomeLayout() {
  const [categories, setCategories] = useState<Category[]>([])
  const [itemCount, setItemCount] = useState(0)
  const [recentPrices, setRecentPrices] = useState<PricedLink[]>([])
  const [dashboard, setDashboard] = useState<FinancialDashboard | null>(null)
  const [installments, setInstallments] = useState<FinancialInstallment[]>([])
  const [loading, setLoading] = useState(true)
  const [itemsUnavailable, setItemsUnavailable] = useState(false)
  const [pricesUnavailable, setPricesUnavailable] = useState(false)
  const [installmentsUnavailable, setInstallmentsUnavailable] = useState(false)
  const [notice, setNotice] = useState("")
  const [reloadKey, setReloadKey] = useState(0)
  useRefreshOnResume(() => setReloadKey((value) => value + 1))

  useEffect(() => {
    let active = true

    async function loadOverview() {
      setLoading(true)
      setNotice("")
      setItemsUnavailable(false)
      setPricesUnavailable(false)
      setInstallmentsUnavailable(false)
      const [categoryResult, dashboardResult, installmentResult] = await Promise.allSettled([
        listCategories(),
        getFinancialDashboard(currentMonth),
        listFinancialInstallments(currentMonth),
      ])
      if (!active) return

      const categoryRows = categoryResult.status === "fulfilled" ? categoryResult.value : []
      setCategories(categoryRows)
      setDashboard(dashboardResult.status === "fulfilled" ? dashboardResult.value : null)
      setInstallments(installmentResult.status === "fulfilled" ? installmentResult.value : [])
      setInstallmentsUnavailable(installmentResult.status === "rejected")

      if (categoryResult.status === "rejected" && dashboardResult.status === "rejected") {
        setItemsUnavailable(true)
        setPricesUnavailable(true)
        setNotice("Não foi possível carregar seus dados no Supabase. Verifique a conexão e tente novamente.")
        setLoading(false)
        return
      }
      if (dashboardResult.status === "rejected" || installmentResult.status === "rejected" || categoryResult.status === "rejected") {
        setNotice("Alguns dados não puderam ser carregados. Abra a área correspondente para tentar novamente.")
      }

      const [itemsResult, linksResult] = await Promise.allSettled([listAllItems(), listAllLinks()])
      if (!active) return

      const hasItemFailures = categoryResult.status === "rejected" || itemsResult.status === "rejected"
      const items = itemsResult.status === "fulfilled" ? itemsResult.value : []
      setItemsUnavailable(hasItemFailures)
      setItemCount(items.length)
      if (active) {
        const hasPriceFailures = hasItemFailures || linksResult.status === "rejected"
        setPricesUnavailable(hasPriceFailures)
        if (hasItemFailures || hasPriceFailures) {
          setNotice("Alguns dados de Compras não puderam ser carregados. Os totais indisponíveis aparecem como traço; tente novamente.")
        }
        const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000
        const itemNames = new Map(items.map((item) => [item.id, item.name]))
        setRecentPrices((linksResult.status === "fulfilled" ? linksResult.value : [])
          .filter((link) => link.price !== null && new Date(link.created_at).getTime() >= cutoff)
          .map((link) => ({ ...link, item_name: itemNames.get(link.item_id) ?? "Item removido" }))
          .sort((a, b) => b.created_at.localeCompare(a.created_at))
          .slice(0, 4))
        setLoading(false)
      }
    }

    void loadOverview()
    return () => { active = false }
  }, [reloadKey])

  const pendingInstallments = installments.filter((installment) => installment.state === "pending")

  return <div className="page">
    <AppNavigation />
    <main className="home-shell">
      <header className="home-hero">
        <div>
          <span className="cartucho-session" aria-hidden="true">SESSION 01 // 概要 // CADERNETA DA CASA</span>
          <p className="eyebrow">Caderneta da casa</p>
          <h1>Hoje, por aqui.</h1>
        </div>
        <span className="home-date">{localToday.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}</span>
      </header>

      {notice && <div className="finance-notice" role="alert">{notice} <button className="btn btn-ghost" type="button" onClick={() => setReloadKey((value) => value + 1)}>Tentar novamente</button></div>}

      <section className="home-overview-grid" aria-label="Resumo">
        <article className="home-stat-card home-stat-emphasis">
          <span>Saldo real</span>
          <strong>{dashboard ? formatMoney(dashboard.current_balance_cents) : loading ? "…" : "—"}</strong>
          <small>Contas registradas</small>
          <Link to="/finance" className="home-card-link">Abrir finanças <span aria-hidden="true">→</span></Link>
        </article>
        <article className="home-stat-card">
          <span>Reservado no mês</span>
          <strong>{dashboard ? formatMoney(dashboard.committed_cents) : loading ? "…" : "—"}</strong>
          <small>{pendingInstallments.length} parcela(s) pendente(s)</small>
          <Link to="/finance" className="home-card-link">Planejamento <span aria-hidden="true">→</span></Link>
        </article>
        <article className="home-stat-card">
          <span>Lista de compras</span>
          <strong>{loading ? "…" : itemsUnavailable ? "—" : `${itemCount} itens`}</strong>
          <small>{loading ? "Carregando categorias…" : itemsUnavailable ? "Itens indisponíveis" : `${categories.length} categorias na lista`}</small>
          <Link to="/shopping" className="home-card-link">Abrir lista <span aria-hidden="true">→</span></Link>
        </article>
        <article className="home-stat-card">
          <span>Parcelas deste mês</span>
          <strong>{loading ? "…" : installmentsUnavailable ? "—" : formatMoney(pendingInstallments.reduce((sum, installment) => sum + installment.amount_cents, 0))}</strong>
          <small>{loading ? "Carregando parcelas…" : installmentsUnavailable ? "Não foi possível carregar" : pendingInstallments.length ? "Pagamentos ainda pendentes" : "Nenhuma parcela pendente"}</small>
          <Link to="/finance" className="home-card-link">Ver parcelas <span aria-hidden="true">→</span></Link>
        </article>
      </section>

      <section className="home-content-grid">
        <article className="card home-panel">
          <div className="card-header">
            <div><h2>Preços recentes</h2></div>
            <Link className="btn btn-ghost" to="/shopping">Ver compras</Link>
          </div>
          {pricesUnavailable ? <div className="home-empty-state"><p>Não foi possível carregar os preços recentes.</p><button className="btn btn-ghost" type="button" onClick={() => setReloadKey((value) => value + 1)}>Tentar novamente</button></div> : recentPrices.length ? <ul className="home-price-list">
            {recentPrices.map((link) => <li key={link.id}>
              <span><strong>{link.item_name}</strong><small>{link.store_name}</small></span>
              <a href={link.url} target="_blank" rel="noopener noreferrer">{money.format(link.price ?? 0)} ↗</a>
            </li>)}
          </ul> : <div className="home-empty-state">
            <p>{loading ? "Carregando preços…" : "Nenhum preço salvo ainda."}</p>
            <Link to="/shopping" className="home-card-link">Adicionar link de loja <span aria-hidden="true">→</span></Link>
          </div>}
          <p className="home-footnote">Os valores vêm dos links salvos na lista.</p>
        </article>

        <article className="card home-panel home-shortcuts">
          <div><h2>Outras listas</h2></div>
          <Link to="/games" className="home-shortcut"><span className="shortcut-icon">J</span><span><strong>Jogos</strong><small>Em andamento e na lista de desejos.</small></span><span aria-hidden="true">→</span></Link>
          <Link to="/shopping" className="home-shortcut"><span className="shortcut-icon">C</span><span><strong>Compras</strong><small>Itens, categorias e lojas</small></span><span aria-hidden="true">→</span></Link>
        </article>
      </section>
    </main>
  </div>
}
