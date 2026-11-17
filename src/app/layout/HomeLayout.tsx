import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import AppNavigation from "./AppNavigation"
import { listCategories } from "../../features/categories/api"
import { listItemsByCategory } from "../../features/items/api"
import { listLinksByItem } from "../../features/itemLinks/api"
import { getFinancialDashboard, listFinancialInstallments } from "../../features/finance/api"
import type { FinancialDashboard, FinancialInstallment } from "../../types/Finance"
import type { Category } from "../../types/Category"
import type { Item } from "../../types/Item"
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
  const [notice, setNotice] = useState("")

  useEffect(() => {
    let active = true

    async function loadOverview() {
      setLoading(true)
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

      if (categoryResult.status === "rejected" && dashboardResult.status === "rejected") {
        setNotice("Abra o aplicativo pelo Tauri para carregar seus dados locais.")
        setLoading(false)
        return
      }
      if (dashboardResult.status === "rejected" || installmentResult.status === "rejected" || categoryResult.status === "rejected") {
        setNotice("Alguns dados não puderam ser carregados. Abra a área correspondente para tentar novamente.")
      }

      const itemGroups = await Promise.all(categoryRows.map(async (category) => {
        try {
          return await listItemsByCategory(category.id)
        } catch {
          return [] as Item[]
        }
      }))
      if (!active) return

      const items = itemGroups.flat()
      setItemCount(items.length)
      const linkGroups = await Promise.all(items.map(async (item) => {
        try {
          return (await listLinksByItem(item.id)).map((link) => ({ ...link, item_name: item.name }))
        } catch {
          return [] as PricedLink[]
        }
      }))
      if (active) {
        const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000
        setRecentPrices(linkGroups.flat()
          .filter((link) => link.price !== null && new Date(link.created_at).getTime() >= cutoff)
          .sort((a, b) => b.created_at.localeCompare(a.created_at))
          .slice(0, 4))
        setLoading(false)
      }
    }

    void loadOverview()
    return () => { active = false }
  }, [])

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

      {notice && <p className="finance-notice" role="status">{notice}</p>}

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
          <strong>{loading ? "…" : `${itemCount} itens`}</strong>
          <small>{loading ? "Carregando categorias…" : `${categories.length} categorias na lista`}</small>
          <Link to="/shopping" className="home-card-link">Abrir lista <span aria-hidden="true">→</span></Link>
        </article>
        <article className="home-stat-card">
          <span>Parcelas deste mês</span>
          <strong>{loading ? "…" : formatMoney(pendingInstallments.reduce((sum, installment) => sum + installment.amount_cents, 0))}</strong>
          <small>{loading ? "Carregando parcelas…" : pendingInstallments.length ? "Pagamentos ainda pendentes" : "Nenhuma parcela pendente"}</small>
          <Link to="/finance" className="home-card-link">Ver parcelas <span aria-hidden="true">→</span></Link>
        </article>
      </section>

      <section className="home-content-grid">
        <article className="card home-panel">
          <div className="card-header">
            <div><h2>Preços recentes</h2></div>
            <Link className="btn btn-ghost" to="/shopping">Ver compras</Link>
          </div>
          {recentPrices.length ? <ul className="home-price-list">
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
