import { useEffect, useRef, useState } from "react"
import type { FormEvent, KeyboardEvent } from "react"
import AppNavigation from "./AppNavigation"
import {
  listCategories,
  createCategory,
  deleteCategory,
} from "../../features/categories/api"
import {
  listItemsByCategory,
  createItem,
  deleteItem,
} from "../../features/items/api"
import {
  listLinksByItem,
  listItemLinkPriceHistory,
  type ItemLinkPricePoint,
  createLink,
  deleteLink,
  fetchPriceFromUrl,
  fetchAveragePriceGoogleShopping,
  fetchStoreOffer,
} from "../../features/itemLinks/api"
import { Category } from "../../types/Category"
import { Item } from "../../types/Item"
import { ItemLink } from "../../types/ItemLink"

export default function AppLayout() {
  const [categories, setCategories] = useState<Category[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [links, setLinks] = useState<ItemLink[]>([])
  const [priceHistory, setPriceHistory] = useState<ItemLinkPricePoint[]>([])
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [modalType, setModalType] = useState<
    "category" | "item" | "link" | null
  >(null)
  const [categoryName, setCategoryName] = useState("")
  const [itemName, setItemName] = useState("")
  const [itemCategoryChoice, setItemCategoryChoice] = useState("")
  const [newItemCategoryName, setNewItemCategoryName] = useState("")
  const [storeName, setStoreName] = useState("")
  const [productUrl, setProductUrl] = useState("")
  const [priceValue, setPriceValue] = useState("")
  const [linkError, setLinkError] = useState("")
  const [isSavingLink, setIsSavingLink] = useState(false)
  const [formError, setFormError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dataError, setDataError] = useState("")
  const submitLock = useRef(false)
  const itemsRequest = useRef(0)
  const linksRequest = useRef(0)
  const modalRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!modalType) return
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const firstControl = modalRef.current?.querySelector<HTMLElement>(
      'input:not([disabled]), select:not([disabled]), textarea:not([disabled])'
    ) ?? modalRef.current?.querySelector<HTMLElement>(
      'button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
    firstControl?.focus()
    return () => previousFocus?.focus()
  }, [modalType])

  function handleModalKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault()
      closeModal()
      return
    }
    if (event.key !== "Tab") return
    const controls = modalRef.current?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
    if (!controls?.length) return
    const first = controls[0]
    const last = controls[controls.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  function openCategoryModal() {
    setCategoryName("")
    setFormError("")
    setModalType("category")
  }

  function openItemModal() {
    setItemName("")
    setItemCategoryChoice(selectedCategory ? String(selectedCategory.id) : categories.length === 0 ? "__new__" : "")
    setNewItemCategoryName("")
    setFormError("")
    setModalType("item")
  }

  function openLinkModal() {
    if (!selectedItem) return
    setStoreName("")
    setProductUrl("")
    setPriceValue("")
    setLinkError("")
    setModalType("link")
  }

  function closeModal() {
    if (submitLock.current) return
    setModalType(null)
  }

  /* ---------------- CATEGORIES ---------------- */

  async function loadCategories() {
    const loadedCategories = await listCategories()
    setCategories(loadedCategories)

  }

  async function addCategory() {
    openCategoryModal()
  }

  async function submitCategory() {
    if (!categoryName.trim() || submitLock.current) return
    submitLock.current = true
    setIsSubmitting(true)
    setFormError("")
    try {
      const created = await createCategory(categoryName.trim())
      setCategories((current) => [...current, created].sort((a, b) => a.name.localeCompare(b.name, "pt-BR")))
      setDataError("")
      setModalType(null)
    } catch (error) {
      setFormError(error instanceof Error ? error.message : String(error))
    } finally {
      submitLock.current = false
      setIsSubmitting(false)
    }
  }

  async function removeCategory(category: Category) {
    try {
      const affectedItems = await listItemsByCategory(category.id)
      const affectedLinks = await Promise.all(affectedItems.map((item) => listLinksByItem(item.id)))
      const linkCount = affectedLinks.reduce((sum, group) => sum + group.length, 0)
      if (!confirm(`Remover a categoria “${category.name}”? Isso também removerá ${affectedItems.length} item(ns) e ${linkCount} link(s) de loja associados. Esta ação não pode ser desfeita.`)) return
      await deleteCategory(category.id)
      itemsRequest.current += 1
      linksRequest.current += 1
      setSelectedCategory(null)
      setSelectedItem(null)
      setItems([])
      setLinks([])
      setPriceHistory([])
      await loadCategories()
      setDataError("")
    } catch (error) {
      setDataError(error instanceof Error ? error.message : String(error))
    }
  }

  /* ---------------- ITEMS ---------------- */

  async function loadItems(categoryId: number) {
    const request = ++itemsRequest.current
    linksRequest.current += 1
    setItems([])
    setSelectedItem(null)
    setLinks([])
    setPriceHistory([])
    try {
      const loadedItems = await listItemsByCategory(categoryId)
      if (request === itemsRequest.current) { setItems(loadedItems); setDataError("") }
    } catch (error) {
      if (request === itemsRequest.current) setDataError(error instanceof Error ? error.message : String(error))
    }
  }

  async function addItem() {
    openItemModal()
  }

  async function submitItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!itemName.trim() || submitLock.current) return
    submitLock.current = true
    setIsSubmitting(true)
    setFormError("")
    try {
      let category = categories.find((candidate) => String(candidate.id) === itemCategoryChoice)
      if (itemCategoryChoice === "__new__") {
        const name = newItemCategoryName.trim()
        if (!name) return
        const created = await createCategory(name)
        category = created
        setCategories((current) => [...current, created].sort((a, b) => a.name.localeCompare(b.name, "pt-BR")))
        setItemCategoryChoice(String(created.id))
        setNewItemCategoryName("")
      }
      if (!category) { setFormError("Escolha uma categoria para o item."); return }
      await createItem(itemName.trim(), category.id)
      setSelectedCategory(category)
      await loadItems(category.id)
      setModalType(null)
    } catch (error) {
      setFormError(error instanceof Error ? error.message : String(error))
    } finally {
      submitLock.current = false
      setIsSubmitting(false)
    }
  }

  async function removeItem(item: Item) {
    if (!confirm(`Remover item "${item.name}"?`)) return
    try {
      await deleteItem(item.id)
      if (selectedCategory) await loadItems(selectedCategory.id)
    } catch (error) { setDataError(error instanceof Error ? error.message : String(error)) }
  }

  /* ---------------- LINKS ---------------- */

  async function loadLinks(itemId: number) {
    const request = ++linksRequest.current
    setLinks([])
    setPriceHistory([])
    const [linksResult, historyResult] = await Promise.allSettled([
      listLinksByItem(itemId), listItemLinkPriceHistory(itemId),
    ])
    if (request !== linksRequest.current) return
    if (linksResult.status === "fulfilled") setLinks(linksResult.value)
    if (historyResult.status === "fulfilled") setPriceHistory(historyResult.value)
    const failure = linksResult.status === "rejected" ? linksResult.reason
      : historyResult.status === "rejected" ? historyResult.reason : null
    if (failure) setDataError(failure instanceof Error ? failure.message : String(failure))
    else setDataError("")
  }

  async function addLink() {
    openLinkModal()
  }

  async function submitLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitLock.current) return
    if (!selectedItem) {
      setLinkError("Selecione um item antes de adicionar uma loja.")
      return
    }

    setLinkError("")
    submitLock.current = true
    setIsSavingLink(true)
    try {
      const storeNameRaw = storeName.trim()
      const urlInput = productUrl.trim()
      const priceRaw = priceValue.trim()
      const parsedPrice = priceRaw ? Number(priceRaw.replace(",", ".")) : undefined
      if (priceRaw && (!Number.isFinite(parsedPrice) || (parsedPrice ?? 0) <= 0)) {
        setLinkError("Informe um preço maior que zero, como 120,50.")
        return
      }

      let finalPrice = parsedPrice
      let finalUrl = ""
      if (urlInput) {
        const normalizedUrl = /^https?:\/\//i.test(urlInput) ? urlInput : `https://${urlInput}`
        let parsedUrl: URL
        try {
          parsedUrl = new URL(normalizedUrl)
          if (!['http:', 'https:'].includes(parsedUrl.protocol)) throw new Error("protocolo")
        } catch {
          setLinkError("Confira o endereço da loja. Exemplo: https://loja.com/produto")
          return
        }
        finalUrl = parsedUrl.toString()
        if (!finalPrice) {
          try {
            const fetchedPrice = await fetchPriceFromUrl(finalUrl)
            if (typeof fetchedPrice === "number") finalPrice = fetchedPrice
          } catch {
            // O link ainda pode ser salvo se a loja não permitir ler o preço.
          }
        }
        if (!finalPrice && /amazon\./i.test(parsedUrl.hostname)) {
          try {
            const offer = await fetchStoreOffer(selectedItem.name, "amazon")
            if (offer) finalPrice = offer.price
          } catch {
            // A consulta externa é auxiliar; não impede salvar o endereço.
          }
        }
      } else {
        const query = encodeURIComponent(`${selectedItem.name} ${storeNameRaw}`.trim())
        finalUrl = `https://www.google.com/search?tbm=shop&q=${query}`
        if (!finalPrice) {
          try {
            const averagePrice = await fetchAveragePriceGoogleShopping(selectedItem.name)
            if (typeof averagePrice === "number") finalPrice = averagePrice
          } catch {
            // A lista continua utilizável mesmo sem consulta externa.
          }
        }
      }

      let finalStoreName = storeNameRaw
      if (!finalStoreName && urlInput) {
        finalStoreName = new URL(finalUrl).hostname.replace(/^www\./i, "")
      }
      if (!finalStoreName) finalStoreName = "Google Shopping"

      await createLink(selectedItem.id, finalStoreName, finalUrl, finalPrice)
      await loadLinks(selectedItem.id)
      setModalType(null)
    } catch (error) {
      setLinkError(error instanceof Error ? error.message : String(error))
    } finally {
      submitLock.current = false
      setIsSavingLink(false)
    }
  }

  function truncateText(text: string, maxLength: number) {
    if (text.length <= maxLength) return text
    return `${text.slice(0, Math.max(0, maxLength - 1))}…`
  }

  async function removeLink(link: ItemLink) {
    if (!confirm(`Remover link da loja "${link.store_name}"?`)) return
    try {
      await deleteLink(link.id)
      if (selectedItem) await loadLinks(selectedItem.id)
    } catch (error) { setDataError(error instanceof Error ? error.message : String(error)) }
  }

  useEffect(() => {
    const storedTheme = localStorage.getItem("lista-compras:theme")
    if (storedTheme) document.documentElement.dataset.theme = storedTheme
    void loadCategories().then(() => setDataError("")).catch((error) => {
      setDataError(error instanceof Error ? error.message : String(error))
    })
  }, [])

  const selectedItemId = selectedItem?.id
  useEffect(() => {
    if (selectedItemId == null) return
    let active = true
    const updateHistory = () => {
      void listItemLinkPriceHistory(selectedItemId)
        .then((history) => { if (active) setPriceHistory(history) })
        .catch(() => undefined)
    }
    const timer = window.setInterval(updateHistory, 30_000)
    return () => {
      active = false
      window.clearInterval(timer)
    }
  }, [selectedItemId])

  /* ---------------- UI ---------------- */

  return (
    <div className="page">
      <AppNavigation />
      {dataError && <p className="finance-notice" role="alert">{dataError}</p>}

      <div className="app-shell">
      {/* ---------- CATEGORIES ---------- */}
      <aside className="panel sidebar">
        <div className="panel-header">
          <div>
            <h2>Categorias</h2>
          </div>
          <div className="actions">
            <button className="btn btn-primary" onClick={addCategory}>
              Nova
            </button>
          </div>
        </div>

        <ul className="list">
          {categories.map((c) => (
              <li key={c.id} className={`list-item category-list-item ${selectedCategory?.id === c.id ? "is-selected" : ""}`}>
              <button
                className="ghost category-choice"
                aria-pressed={selectedCategory?.id === c.id}
                onClick={() => {
                  setSelectedCategory(c)
                  loadItems(c.id)
                }}
              >
                {c.name}
              </button>
              <button className="icon danger" aria-label={`Remover categoria ${c.name}`} onClick={() => removeCategory(c)}>
                ✕
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* ---------- ITEMS ---------- */}
      <main className="panel main">
        <header className="main-header">
          <div>
            <span className="cartucho-session" aria-hidden="true">SESSION 02 // 買物 // LOG DE AQUISIÇÕES</span>
            <h1>Itens</h1>
            {selectedCategory && <p className="selected-category-label">Categoria: {selectedCategory.name}</p>}
          </div>
          <div className="actions">
            <button
              className="btn btn-secondary"
              onClick={addItem}
            >
              + Novo item
            </button>
            {selectedCategory && <button
              className="btn btn-ghost"
              onClick={() => {
                itemsRequest.current += 1
                linksRequest.current += 1
                setSelectedCategory(null)
                setSelectedItem(null)
                setItems([])
                setLinks([])
                setPriceHistory([])
              }}
            >
              Limpar seleção
            </button>}
          </div>
        </header>

        <section className={`content-grid ${selectedItem ? "has-selected-item" : ""}`}>
          <div className="card">
            <div className="card-header">
              <h3>Itens</h3>
              <span className="badge">{items.length}</span>
            </div>

            <ul className="list">
              {selectedCategory && items.map((i) => (
                <li
                  key={i.id}
                  className={`list-item is-clickable ${
                    selectedItem?.id === i.id ? "active" : ""
                  }`}
                >
                  <button className="item-select" onClick={() => {
                    setSelectedItem(i)
                    loadLinks(i.id)
                  }}>
                    <span>{i.name}</span>
                    <span className="item-open-hint" aria-hidden="true">Ver lojas →</span>
                  </button>
                  <button
                    className="icon danger"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeItem(i)
                    }}
                  >
                    ✕
                  </button>
                </li>
              ))}
              {!selectedCategory && <li className="empty-state shopping-empty-state">
                <h4>{categories.length ? "Escolha uma categoria" : "Comece sua lista"}</h4>
                <p>{categories.length ? "Selecione uma categoria para ver os itens ou adicione um novo item." : "Você pode criar uma categoria agora ou começar por um item; a categoria será criada no mesmo fluxo."}</p>
              </li>}
            </ul>
          </div>

          {selectedItem && <div className="card">
            <div className="card-header">
              <h3>Links</h3>
              <span className="badge">{links.length}</span>
            </div>

            {selectedItem ? (
              <>
                <p className="muted">
                  Comparar preços para <strong>{selectedItem.name}</strong>
                </p>
                <button className="btn btn-primary" onClick={addLink}>
                  + Adicionar link
                </button>

                <ul className="link-list">
                  {links.map((l) => (
                    <li key={l.id} className="link-item">
                      <a href={l.url} target="_blank" rel="noopener noreferrer">
                        <div>
                          <strong>{l.store_name}</strong>
                          <span className="muted" title={l.url}>
                            {truncateText(l.url, 15)}
                          </span>
                        </div>
                        <span className="price">
                          {l.price ? `R$ ${l.price}` : "Preço a definir"}
                        </span>
                      </a>
                      <button className="icon danger" onClick={() => removeLink(l)}>
                        ✕
                      </button>
                      <PriceHistoryChart points={priceHistory.filter((point) => point.item_link_id === l.id)} />
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <div className="empty-state">
                <h4>Escolha um item</h4>
                <p>Selecione um item ao lado para ver ou adicionar links.</p>
              </div>
            )}
          </div>}
        </section>
      </main>

      {modalType && (
        <div className="modal-overlay" role="presentation">
          <div ref={modalRef} className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" onKeyDown={handleModalKeyDown}>
            <div className="modal-header">
              <div>
                <p className="eyebrow">Cadastro rápido</p>
                <h3 id="modal-title">
                  {modalType === "category" && "Nova categoria"}
                  {modalType === "item" && "Novo item"}
                  {modalType === "link" && "Novo link"}
                </h3>
              </div>
              <button className="icon" aria-label="Fechar janela" onClick={closeModal} disabled={isSubmitting || isSavingLink}>
                ✕
              </button>
            </div>

            {modalType === "category" && (
              <form className="modal-body" onSubmit={(event) => { event.preventDefault(); void submitCategory() }}>
                <label className="field">
                  <span>Nome da categoria</span>
                  <input
                    className="input"
                    placeholder="Ex: Padaria"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                  />
                </label>
                {formError && <p className="form-error" role="alert">{formError}</p>}
                <div className="modal-actions">
                  <button type="button" className="btn btn-ghost" onClick={closeModal} disabled={isSubmitting}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={isSubmitting || !categoryName.trim()}>
                    {isSubmitting ? "Salvando…" : "Salvar"}
                  </button>
                </div>
              </form>
            )}

            {modalType === "item" && (
              <form className="modal-body" onSubmit={submitItem}>
                <label className="field">
                  <span>Nome do item</span>
                  <input
                    className="input"
                    required
                    placeholder="Ex: Café em grãos"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                  />
                </label>
                <label className="field">
                  <span>Categoria</span>
                  {categories.length > 0 && <select
                    className="input"
                    required
                    value={itemCategoryChoice}
                    onChange={(event) => setItemCategoryChoice(event.target.value)}
                  >
                    <option value="">Escolha uma categoria</option>
                    {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                    <option value="__new__">+ Criar nova categoria</option>
                  </select>}
                  {itemCategoryChoice === "__new__" && <input
                    className="input"
                    required
                    autoFocus
                    placeholder="Nome da nova categoria"
                    value={newItemCategoryName}
                    onChange={(event) => setNewItemCategoryName(event.target.value)}
                  />}
                  {categories.length === 0 && <p className="muted">Crie uma categoria e adicione o item em um único passo.</p>}
                </label>
                {formError && <p className="form-error" role="alert">{formError}</p>}
                <div className="modal-actions">
                  <button type="button" className="btn btn-ghost" onClick={closeModal} disabled={isSubmitting}>
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting || !itemName.trim() || (itemCategoryChoice === "__new__" ? !newItemCategoryName.trim() : !itemCategoryChoice)}
                  >
                    {isSubmitting ? "Salvando…" : "Adicionar item"}
                  </button>
                </div>
              </form>
            )}

            {modalType === "link" && (
              <form className="modal-body" onSubmit={submitLink}>
                <label className="field">
                  <span>Loja (opcional se informar o endereço)</span>
                  <input
                    className="input"
                    placeholder="Ex: Mercado Central"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                  />
                </label>
                <label className="field">
                  <span>URL do produto (opcional)</span>
                  <input
                    className="input"
                    placeholder="https://"
                    value={productUrl}
                    onChange={(e) => setProductUrl(e.target.value)}
                  />
                </label>
                <label className="field">
                  <span>Preço (opcional)</span>
                  <input
                    className="input"
                    placeholder="Ex: 18.90"
                    value={priceValue}
                    onChange={(e) => setPriceValue(e.target.value)}
                  />
                </label>
                {linkError && <p className="form-error" role="alert">{linkError}</p>}
                <div className="modal-actions">
                  <button type="button" className="btn btn-ghost" onClick={closeModal} disabled={isSavingLink}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={isSavingLink}>
                    {isSavingLink ? "Salvando…" : "Adicionar link"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
      </div>

    </div>
  )
}

function PriceHistoryChart({ points }: { points: ItemLinkPricePoint[] }) {
  if (points.length === 0) {
    return <div className="price-history-empty">O gráfico começa quando um preço for registrado.</div>
  }

  const width = 320
  const height = 100
  const padding = 10
  const values = points.map((point) => point.price)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const coordinates = points.map((point, index) => {
    const x = points.length === 1 ? width / 2 : padding + index * (width - padding * 2) / (points.length - 1)
    const y = height - padding - (point.price - min) / range * (height - padding * 2)
    return { x, y }
  })
  const formatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })
  const latest = points[points.length - 1]

  return <div className="price-history">
    <div className="price-history-heading"><strong>Histórico de preço</strong><span>{points.length} registro(s)</span></div>
    <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Variação de preço entre ${formatter.format(min)} e ${formatter.format(max)}`}>
      <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} />
      <polyline points={coordinates.map(({ x, y }) => `${x},${y}`).join(" ")} />
      {coordinates.map(({ x, y }, index) => <circle key={points[index].id} cx={x} cy={y} r="3" />)}
    </svg>
    <div className="price-history-foot"><span>{formatter.format(min)} – {formatter.format(max)}</span><span>Atualizado {new Date(latest.observed_at).toLocaleDateString("pt-BR")}</span></div>
    <small>Verificação no máximo uma vez por dia enquanto o app estiver aberto.</small>
  </div>
}






