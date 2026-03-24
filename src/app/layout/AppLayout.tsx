import { useEffect, useRef, useState } from "react"
import type { Session } from "@supabase/supabase-js"
import { Link } from "react-router-dom"
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
  createLink,
  deleteLink,
  fetchPriceFromUrl,
  fetchAveragePriceGoogleShopping,
  fetchStoreOffer,
} from "../../features/itemLinks/api"
import {
  upsertCategory,
  upsertItem,
  upsertItemLink,
} from "../../features/sync/api"
import { getActiveListId, supabase } from "../../services/supabase"
import { Category } from "../../types/Category"
import { Item } from "../../types/Item"
import { ItemLink } from "../../types/ItemLink"

export default function AppLayout() {
  const [categories, setCategories] = useState<Category[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [links, setLinks] = useState<ItemLink[]>([])
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [modalType, setModalType] = useState<
    "category" | "item" | "link" | null
  >(null)
  const [categoryName, setCategoryName] = useState("")
  const [itemName, setItemName] = useState("")
  const [storeName, setStoreName] = useState("")
  const [productUrl, setProductUrl] = useState("")
  const [priceValue, setPriceValue] = useState("")
  const restoreCategoryId = useRef<number | null>(null)
  const restoreItemId = useRef<number | null>(null)
  const hasHydrated = useRef(false)
  const cloudReady = useRef(false)
  const syncTimer = useRef<number | null>(null)
  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null)
    })
    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession)
      }
    )
    return () => {
      subscription?.subscription?.unsubscribe()
    }
  }, [])
  const [session, setSession] = useState<Session | null>(null)

  function openCategoryModal() {
    setCategoryName("")
    setModalType("category")
  }

  function openItemModal() {
    if (!selectedCategory) return
    setItemName("")
    setModalType("item")
  }

  function openLinkModal() {
    if (!selectedItem) return
    setStoreName("")
    setProductUrl("")
    setPriceValue("")
    setModalType("link")
  }

  function closeModal() {
    setModalType(null)
  }

  async function syncShoppingFromCloud() {
    if (!supabase) {
      cloudReady.current = true
      return
    }

    const listId = getActiveListId(session)
    try {
      const { data: cloudCategories } = await supabase
        .from("categories")
        .select("id,name,created_at,deleted_at")
        .eq("list_id", listId)
        .is("deleted_at", null)

      if (cloudCategories && cloudCategories.length > 0) {
        for (const category of cloudCategories) {
          await upsertCategory(category.id, category.name, category.created_at)
        }
      }

      const { data: cloudItems } = await supabase
        .from("items")
        .select("id,name,category_id,notes,created_at,deleted_at")
        .eq("list_id", listId)
        .is("deleted_at", null)

      if (cloudItems && cloudItems.length > 0) {
        const validCategoryIds = new Set(
          (cloudCategories ?? []).map((category) => category.id)
        )
        for (const item of cloudItems.filter((i) => validCategoryIds.has(i.category_id))) {
          await upsertItem(
            item.id,
            item.name,
            item.category_id,
            item.notes,
            item.created_at
          )
        }
      }

      const { data: cloudLinks } = await supabase
        .from("item_links")
        .select("id,item_id,store_name,url,price,created_at,deleted_at")
        .eq("list_id", listId)
        .is("deleted_at", null)

      if (cloudLinks && cloudLinks.length > 0) {
        const validItemIds = new Set(
          (cloudItems ?? []).map((item) => item.id)
        )
        for (const link of cloudLinks.filter((l) => validItemIds.has(l.item_id))) {
          await upsertItemLink(
            link.id,
            link.item_id,
            link.store_name,
            link.url,
            link.price,
            link.created_at
          )
        }
      }
    } catch {
      // ignore cloud issues
    } finally {
      cloudReady.current = true
    }
  }

  async function syncShoppingToCloud() {
    if (!supabase) return
    const listId = getActiveListId(session)

    const categoryRows = categories.map((category) => ({
      id: category.uuid,
      list_id: listId,
      name: category.name,
      created_at: category.created_at,
    }))

    if (categoryRows.length > 0) {
      await supabase.from("categories").upsert(categoryRows, {
        onConflict: "id",
      })
    }

    const allItems: Item[] = []
    const allLinks: ItemLink[] = []

    for (const category of categories) {
      const itemsForCategory = await listItemsByCategory(category.id)
      allItems.push(...itemsForCategory)
      for (const item of itemsForCategory) {
        const linksForItem = await listLinksByItem(item.id)
        allLinks.push(...linksForItem)
      }
    }

    if (allItems.length > 0) {
      const itemRows = allItems
        .map((item) => {
          const categoryUuid = categories.find(
            (c) => c.id === item.category_id
          )?.uuid
          if (!categoryUuid) return null
          return {
            id: item.uuid,
            list_id: listId,
            name: item.name,
            category_id: categoryUuid,
            notes: item.notes ?? null,
            created_at: item.created_at,
          }
        })
        .filter(Boolean)

      if (itemRows.length > 0) {
        await supabase.from("items").upsert(itemRows, { onConflict: "id" })
      }
    }

    if (allLinks.length > 0) {
      const linkRows = allLinks
        .map((link) => {
          const itemUuid = allItems.find((i) => i.id === link.item_id)?.uuid
          if (!itemUuid) return null
          return {
            id: link.uuid,
            list_id: listId,
            item_id: itemUuid,
            store_name: link.store_name,
            url: link.url,
            price: link.price,
            created_at: link.created_at,
          }
        })
        .filter(Boolean)

      if (linkRows.length > 0) {
        await supabase
          .from("item_links")
          .upsert(linkRows, { onConflict: "id" })
      }
    }
  }

  function queueShoppingSync() {
    if (!cloudReady.current || !supabase) return
    if (syncTimer.current) window.clearTimeout(syncTimer.current)
    syncTimer.current = window.setTimeout(() => {
      syncShoppingToCloud()
    }, 800)
  }

  /* ---------------- CATEGORIES ---------------- */

  async function loadCategories() {
    const loadedCategories = await listCategories()
    setCategories(loadedCategories)

    if (restoreCategoryId.current) {
      const cachedCategory = loadedCategories.find(
        (category) => category.id === restoreCategoryId.current
      )
      if (cachedCategory) {
        setSelectedCategory(cachedCategory)
        loadItems(cachedCategory.id)
      }
      restoreCategoryId.current = null
    }
  }

  async function addCategory() {
    openCategoryModal()
  }

  async function submitCategory() {
    if (!categoryName.trim()) return
    await createCategory(categoryName.trim())
    loadCategories()
    closeModal()
  }

  async function removeCategory(category: Category) {
    if (!confirm(`Remover categoria "${category.name}"?`)) return
    if (supabase) {
      const listId = getActiveListId(session)
      const now = new Date().toISOString()
      await supabase
        .from("categories")
        .update({ deleted_at: now })
        .eq("id", category.uuid)
        .eq("list_id", listId)
    }
    await deleteCategory(category.id)

    setSelectedCategory(null)
    setSelectedItem(null)
    setItems([])
    setLinks([])

    loadCategories()
  }

  /* ---------------- ITEMS ---------------- */

  async function loadItems(categoryId: number) {
    const loadedItems = await listItemsByCategory(categoryId)
    setItems(loadedItems)
    setSelectedItem(null)
    setLinks([])

    if (restoreItemId.current) {
      const cachedItem = loadedItems.find(
        (item) => item.id === restoreItemId.current
      )
      if (cachedItem) {
        setSelectedItem(cachedItem)
        loadLinks(cachedItem.id)
      }
      restoreItemId.current = null
    }
  }

  async function addItem() {
    openItemModal()
  }

  async function submitItem() {
    if (!selectedCategory) return
    if (!itemName.trim()) return
    await createItem(itemName.trim(), selectedCategory.id)
    loadItems(selectedCategory.id)
    closeModal()
  }

  async function removeItem(item: Item) {
    if (!confirm(`Remover item "${item.name}"?`)) return
    if (supabase) {
      const listId = getActiveListId(session)
      const now = new Date().toISOString()
      await supabase
        .from("items")
        .update({ deleted_at: now })
        .eq("id", item.uuid)
        .eq("list_id", listId)
    }
    await deleteItem(item.id)
    if (selectedCategory) loadItems(selectedCategory.id)
  }

  /* ---------------- LINKS ---------------- */

  async function loadLinks(itemId: number) {
    setLinks(await listLinksByItem(itemId))
  }

  async function addLink() {
    openLinkModal()
  }

  async function submitLink() {
    if (!selectedItem) return
    const storeNameRaw = storeName.trim()
    const urlRaw = productUrl.trim()
    const priceRaw = priceValue.trim()

    const parsedPrice = priceRaw ? Number(priceRaw.replace(",", ".")) : undefined
    const price = Number.isNaN(parsedPrice) ? undefined : parsedPrice

    let finalUrl = urlRaw
    let finalStoreName = storeNameRaw

    let finalPrice = price

    if (!finalPrice && urlRaw) {
      try {
        const fetchedPrice = await fetchPriceFromUrl(urlRaw)
        if (typeof fetchedPrice === "number") finalPrice = fetchedPrice
      } catch {
        // ignore fetch issues
      }

      if (!finalPrice && /amazon\./i.test(urlRaw)) {
        try {
          const offer = await fetchStoreOffer(
            selectedItem.name,
            "amazon",
            import.meta.env.VITE_SERPAPI_KEY
          )
          if (offer) {
            finalPrice = offer.price
            if (!finalStoreName) finalStoreName = offer.store_name
          }
        } catch {
          // ignore fetch issues
        }
      }
    }

    if (!urlRaw && !priceRaw) {
      try {
        const averagePrice = await fetchAveragePriceGoogleShopping(
          selectedItem.name
        )
        if (typeof averagePrice === "number") finalPrice = averagePrice
      } catch {
        // ignore fetch issues
      }

      const query = encodeURIComponent(selectedItem.name)
      finalUrl = `https://www.google.com/search?tbm=shop&q=${query}`
      if (!finalStoreName) finalStoreName = "Google Shopping"
    }

    if (!finalUrl) return
    if (!finalStoreName) return

    await createLink(
      selectedItem.id,
      finalStoreName,
      finalUrl,
      finalPrice
    )
    loadLinks(selectedItem.id)
    closeModal()
  }

  function truncateText(text: string, maxLength: number) {
    if (text.length <= maxLength) return text
    return `${text.slice(0, Math.max(0, maxLength - 1))}…`
  }

  async function removeLink(link: ItemLink) {
    if (!confirm(`Remover link da loja "${link.store_name}"?`)) return
    if (supabase) {
      const listId = getActiveListId(session)
      const now = new Date().toISOString()
      await supabase
        .from("item_links")
        .update({ deleted_at: now })
        .eq("id", link.uuid)
        .eq("list_id", listId)
    }
    await deleteLink(link.id)
    if (selectedItem) loadLinks(selectedItem.id)
  }

  useEffect(() => {
    const storedTheme = localStorage.getItem("lista-compras:theme")
    if (storedTheme) {
      document.documentElement.dataset.theme = storedTheme
    }
    if (typeof localStorage !== "undefined") {
      const cacheRaw = localStorage.getItem("lista-compras:shopping-cache")
      if (cacheRaw) {
        try {
          const cache = JSON.parse(cacheRaw) as {
            categories?: Category[]
            items?: Item[]
            links?: ItemLink[]
            selectedCategoryId?: number | null
            selectedItemId?: number | null
          }
          if (cache.categories) setCategories(cache.categories)
          if (cache.items) setItems(cache.items)
          if (cache.links) setLinks(cache.links)
          if (cache.selectedCategoryId) {
            const cachedCategory = cache.categories?.find(
              (category) => category.id === cache.selectedCategoryId
            )
            if (cachedCategory) setSelectedCategory(cachedCategory)
            restoreCategoryId.current = cache.selectedCategoryId
            restoreItemId.current = cache.selectedItemId ?? null
          }
        } catch {
          // ignore cache issues
        }
      }
    }
    hasHydrated.current = true

    const runSync = async () => {
      await syncShoppingFromCloud()
      loadCategories()
    }
    runSync()
  }, [])

  useEffect(() => {
    if (!hasHydrated.current) return
    const runSync = async () => {
      await syncShoppingFromCloud()
      loadCategories()
    }
    runSync()
  }, [session?.user?.id])

  useEffect(() => {
    if (!hasHydrated.current || typeof localStorage === "undefined") return
    localStorage.setItem(
      "lista-compras:shopping-cache",
      JSON.stringify({
        categories,
        items,
        links,
        selectedCategoryId: selectedCategory?.id ?? null,
        selectedItemId: selectedItem?.id ?? null,
      })
    )
    queueShoppingSync()
  }, [categories, items, links, selectedCategory, selectedItem])

  /* ---------------- UI ---------------- */

  return (
    <div className="page">
      <nav className="top-nav">
        <div className="brand">
          <span className="badge">Lista</span>
        </div>
        <div className="nav-links">
          <Link to="/" className="btn btn-ghost">
            Inicio
          </Link>
          <Link to="/shopping" className="btn btn-secondary">
            Compras
          </Link>
          <Link to="/games" className="btn btn-ghost">
            Jogos
          </Link>
        </div>
      </nav>

      <div className="app-shell">
      {/* ---------- CATEGORIES ---------- */}
      <aside className="panel sidebar">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Coleções</p>
            <h2>Categorias</h2>
          </div>
          <div className="actions">
            <Link to="/" className="btn btn-ghost">
              Inicio
            </Link>
            <button className="btn btn-primary" onClick={addCategory}>
              Nova
            </button>
          </div>
        </div>

        <ul className="list">
          {categories.map((c) => (
            <li key={c.id} className="list-item">
              <button
                className="ghost"
                onClick={() => {
                  setSelectedCategory(c)
                  loadItems(c.id)
                }}
              >
                {c.name}
              </button>
              <button className="icon danger" onClick={() => removeCategory(c)}>
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
            <p className="eyebrow">Lista de compras</p>
            <h1>
              Itens{" "}
              {selectedCategory
                ? `— ${selectedCategory.name}`
                : "— selecione uma categoria"}
            </h1>
          </div>
          <div className="actions">
            <button
              className="btn btn-secondary"
              onClick={addItem}
              disabled={!selectedCategory}
            >
              + Item
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => {
                setSelectedCategory(null)
                setSelectedItem(null)
                setItems([])
                setLinks([])
              }}
            >
              Limpar seleção
            </button>
          </div>
        </header>

        <section className="content-grid">
          <div className="card">
            <div className="card-header">
              <h3>Itens</h3>
              <span className="badge">{items.length}</span>
            </div>

            <ul className="list">
              {items.map((i) => (
                <li
                  key={i.id}
                  className={`list-item is-clickable ${
                    selectedItem?.id === i.id ? "active" : ""
                  }`}
                  onClick={() => {
                    setSelectedItem(i)
                    loadLinks(i.id)
                  }}
                >
                  <span>{i.name}</span>
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
            </ul>
          </div>

          <div className="card">
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
          </div>
        </section>
      </main>

      {modalType && (
        <div className="modal-overlay" role="presentation">
          <div className="modal" role="dialog" aria-modal="true">
            <div className="modal-header">
              <div>
                <p className="eyebrow">Cadastro rápido</p>
                <h3>
                  {modalType === "category" && "Nova categoria"}
                  {modalType === "item" && "Novo item"}
                  {modalType === "link" && "Novo link"}
                </h3>
              </div>
              <button className="icon" onClick={closeModal}>
                ✕
              </button>
            </div>

            {modalType === "category" && (
              <div className="modal-body">
                <label className="field">
                  <span>Nome da categoria</span>
                  <input
                    className="input"
                    placeholder="Ex: Padaria"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                  />
                </label>
                <div className="modal-actions">
                  <button className="btn btn-ghost" onClick={closeModal}>
                    Cancelar
                  </button>
                  <button className="btn btn-primary" onClick={submitCategory}>
                    Salvar
                  </button>
                </div>
              </div>
            )}

            {modalType === "item" && (
              <div className="modal-body">
                <label className="field">
                  <span>Nome do item</span>
                  <input
                    className="input"
                    placeholder="Ex: Café em grãos"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                  />
                </label>
                <div className="modal-actions">
                  <button className="btn btn-ghost" onClick={closeModal}>
                    Cancelar
                  </button>
                  <button className="btn btn-primary" onClick={submitItem}>
                    Salvar
                  </button>
                </div>
              </div>
            )}

            {modalType === "link" && (
              <div className="modal-body">
                <label className="field">
                  <span>Loja</span>
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
                <div className="modal-actions">
                  <button className="btn btn-ghost" onClick={closeModal}>
                    Cancelar
                  </button>
                  <button className="btn btn-primary" onClick={submitLink}>
                    Salvar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      </div>

      <div className="bottom-nav">
        <Link to="/" className="nav-link">
          Inicio
        </Link>
        <Link to="/shopping" className="nav-link">
          Compras
        </Link>
        <Link to="/games" className="nav-link">
          Jogos
        </Link>
        <Link to="/settings" className="nav-link">
          Ajustes
        </Link>
      </div>
    </div>
  )
}






