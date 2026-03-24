import { useEffect, useMemo, useRef, useState, type FormEvent } from "react"
import type { Session } from "@supabase/supabase-js"
import { Link } from "react-router-dom"
import { getActiveListId, supabase } from "../../services/supabase"

type GameStatus = "backlog" | "playing" | "finished"

type Game = {
  id: string
  name: string
  url: string
  status: GameStatus
  updated_at: string
}

export default function GameLayout() {
  const [games, setGames] = useState<Game[]>([])
  const [name, setName] = useState("")
  const [url, setUrl] = useState("")
  const [session, setSession] = useState<Session | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(15)
  const chartRef = useRef<HTMLDivElement | null>(null)
  const syncTimer = useRef<number | null>(null)
  const hasSynced = useRef(false)

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

  function truncateText(text: string, maxLength: number) {
    if (text.length <= maxLength) return text
    return `${text.slice(0, Math.max(0, maxLength - 1))}…`
  }

  function ensureId(value: unknown) {
    if (typeof value === "string" && value.trim()) return value
    return crypto?.randomUUID?.() ?? fallbackId()
  }

  function fallbackId() {
    return `game-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`
  }

  const storageKey = "lista-compras:games"

  function normalizeGame(raw: any): Game {
    const status =
      raw.status ?? (raw.done ? ("finished" as GameStatus) : ("backlog" as GameStatus))
    return {
      id: ensureId(raw.id),
      name: String(raw.name ?? ""),
      url: String(raw.url ?? ""),
      status,
      updated_at: raw.updated_at ?? new Date().toISOString(),
    }
  }

  function persistGames(next: Game[], options?: { skipSync?: boolean }) {
    setGames(next)
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(storageKey, JSON.stringify(next))
    }
    if (!options?.skipSync) queueGamesSync(next)
  }

  useEffect(() => {
    const storedTheme = localStorage.getItem("lista-compras:theme")
    if (storedTheme) {
      document.documentElement.dataset.theme = storedTheme
    }
    if (typeof localStorage === "undefined") return
    const stored = localStorage.getItem(storageKey)
    if (!stored) return
    try {
      const parsed = JSON.parse(stored) as Array<Game & { done?: boolean }>
      if (Array.isArray(parsed)) {
        const normalized = parsed.map((game) => normalizeGame(game))
        setGames(normalized)
      }
    } catch {
      // ignore cache issues
    }
  }, [])

  useEffect(() => {
    function updatePerPage() {
      const height = window.innerHeight
      const nextPerPage = height < 700 ? 10 : height < 900 ? 12 : 15
      setPerPage(nextPerPage)
    }

    updatePerPage()
    window.addEventListener("resize", updatePerPage)
    return () => window.removeEventListener("resize", updatePerPage)
  }, [])

  useEffect(() => {
    const run = async () => {
      if (hasSynced.current || !supabase) return
      const listId = getActiveListId(session)
      try {
        const { data } = await supabase
          .from("games")
          .select("id,name,url,status,updated_at")
          .eq("list_id", listId)

        if (data && data.length > 0) {
          const remote = data.map((row) => normalizeGame(row))
          const merged = mergeGames(games, remote)
          persistGames(merged, { skipSync: true })
        } else if (games.length > 0) {
          await pushGamesToCloud(games)
        }
      } catch {
        // ignore cloud issues
      } finally {
        hasSynced.current = true
      }
    }
    run()
  }, [games, session?.user?.id])

  function mergeGames(local: Game[], remote: Game[]) {
    const map = new Map<string, Game>()
    for (const game of local) map.set(game.id, game)
    for (const game of remote) {
      const existing = map.get(game.id)
      if (!existing) {
        map.set(game.id, game)
        continue
      }
      const localTime = new Date(existing.updated_at).getTime()
      const remoteTime = new Date(game.updated_at).getTime()
      map.set(game.id, remoteTime >= localTime ? game : existing)
    }
    return Array.from(map.values())
  }

  function queueGamesSync(next: Game[]) {
    if (!supabase) return
    if (syncTimer.current) window.clearTimeout(syncTimer.current)
    syncTimer.current = window.setTimeout(() => {
      pushGamesToCloud(next)
    }, 800)
  }

  async function pushGamesToCloud(next: Game[]) {
    if (!supabase) return
    const listId = getActiveListId(session)
    await supabase.from("games").upsert(
      next.map((game) => ({
        id: game.id,
        list_id: listId,
        name: game.name,
        url: game.url,
        status: game.status,
        updated_at: game.updated_at,
      })),
      { onConflict: "id" }
    )
  }

  const canSubmit = useMemo(() => {
    return Boolean(name.trim()) && Boolean(url.trim())
  }, [name, url])

  const finishedCount = games.filter((game) => game.status === "finished").length
  const playingCount = games.filter((game) => game.status === "playing").length
  const backlogCount = games.length - finishedCount - playingCount

  const totalCount = games.length || 1
  const finishedPct = (finishedCount / totalCount) * 100
  const playingPct = (playingCount / totalCount) * 100
  const backlogPct = (backlogCount / totalCount) * 100

  const totalPages = Math.max(1, Math.ceil(games.length / perPage))
  const pageStart = (currentPage - 1) * perPage
  const pageEnd = pageStart + perPage
  const visibleGames = games.slice(pageStart, pageEnd)

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages))
  }, [totalPages])

  function addGame(event: FormEvent) {
    event.preventDefault()
    if (!canSubmit) return

    const nextGames = [
      ...games,
      {
        id: ensureId(null),
        name: name.trim(),
        url: url.trim(),
        status: "backlog" as GameStatus,
        updated_at: new Date().toISOString(),
      },
    ]
    persistGames(nextGames)
    setName("")
    setUrl("")
  }

  function removeGame(id: string) {
    persistGames(games.filter((game) => game.id !== id))
  }

  function toggleStatus(id: string, status: GameStatus) {
    persistGames(
      games.map((game) =>
        game.id === id
          ? {
              ...game,
              status: game.status === status ? "backlog" : status,
              updated_at: new Date().toISOString(),
            }
          : game
      )
    )
  }

  function scrollToChart() {
    chartRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

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
          <Link to="/shopping" className="btn btn-ghost">
            Compras
          </Link>
          <Link to="/games" className="btn btn-secondary">
            Jogos
          </Link>
        </div>
      </nav>

      <div className="app-shell">
        <aside className="panel sidebar">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Navegacao</p>
              <h2>Voltar</h2>
            </div>
            <Link to="/" className="btn btn-ghost">
              Inicio
            </Link>
          </div>
          <div className="card">
            <h3>Lista de jogos</h3>
            <p className="muted">
              Guarde seus proximos jogos favoritos em um unico lugar.
            </p>
            <button className="btn btn-secondary" onClick={scrollToChart}>
              Ver grafico
            </button>
          </div>
        </aside>

        <main className="panel main">
          <header className="main-header">
            <div>
              <p className="eyebrow">Colecao</p>
              <h1>Jogos para comprar</h1>
            </div>
            <span className="badge">{games.length}</span>
          </header>

          <section className="content-grid">
            <div className="card">
              <div className="card-header">
                <h3>Novo jogo</h3>
              </div>

              <form className="form-stack" onSubmit={addGame}>
                <label className="field">
                  <span>Nome do jogo</span>
                  <input
                    className="input"
                    placeholder="Ex: Stardew Valley"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                  />
                </label>
                <label className="field">
                  <span>Link</span>
                  <input
                    className="input"
                    placeholder="https://"
                    value={url}
                    onChange={(event) => setUrl(event.target.value)}
                  />
                </label>
                <button
                  className="btn btn-primary"
                  type="submit"
                  disabled={!canSubmit}
                >
                  Adicionar
                </button>
              </form>
            </div>

            <div className="card">
              <div className="card-header">
                <h3>Jogos salvos</h3>
                <span className="badge">{games.length}</span>
              </div>
              {games.length === 0 ? (
                <div className="empty-state">
                  <h4>Nenhum jogo por aqui</h4>
                  <p>Cadastre um jogo ao lado para montar sua lista.</p>
                </div>
              ) : (
                <>
                  <ul className="link-list">
                    {visibleGames.map((game) => (
                      <li
                        key={game.id}
                        className={`link-item game-item ${game.status}`}
                      >
                        <a
                          href={game.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <div>
                            <strong>{game.name}</strong>
                            <span className="muted" title={game.url}>
                              {truncateText(game.url, 15)}
                            </span>
                          </div>
                        </a>
                        <div className="check-group">
                          <label className="check">
                            <input
                              type="checkbox"
                              checked={game.status === "playing"}
                              onChange={() => toggleStatus(game.id, "playing")}
                            />
                            <span>Jogando</span>
                          </label>
                          <label className="check">
                            <input
                              type="checkbox"
                              checked={game.status === "finished"}
                              onChange={() => toggleStatus(game.id, "finished")}
                            />
                            <span>Concluido</span>
                          </label>
                        </div>
                        <button
                          className="icon danger"
                          type="button"
                          onClick={() => removeGame(game.id)}
                        >
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className="pagination">
                    <button
                      className="btn btn-ghost"
                      type="button"
                      onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                      disabled={currentPage === 1}
                    >
                      Anterior
                    </button>
                    <span className="muted">
                      Pagina {currentPage} de {totalPages}
                    </span>
                    <button
                      className="btn btn-ghost"
                      type="button"
                      onClick={() =>
                        setCurrentPage((page) => Math.min(totalPages, page + 1))
                      }
                      disabled={currentPage === totalPages}
                    >
                      Proxima
                    </button>
                  </div>
                </>
              )}
            </div>
          </section>

          <section className="chart-section" ref={chartRef}>
            <div className="card">
              <div className="card-header">
                <h3>Resumo visual</h3>
                <span className="badge">{games.length}</span>
              </div>
              <p className="muted">
                Comparativo entre jogos concluidos, em andamento e pendentes.
              </p>
              <div className="chart">
                <div className="chart-row">
                  <span>Concluidos</span>
                  <div className="bar">
                    <div
                      className="bar-fill finished"
                      style={{ width: `${finishedPct}%` }}
                    />
                  </div>
                  <span className="count">{finishedCount}</span>
                </div>
                <div className="chart-row">
                  <span>Jogando</span>
                  <div className="bar">
                    <div
                      className="bar-fill playing"
                      style={{ width: `${playingPct}%` }}
                    />
                  </div>
                  <span className="count">{playingCount}</span>
                </div>
                <div className="chart-row">
                  <span>Pendentes</span>
                  <div className="bar">
                    <div
                      className="bar-fill backlog"
                      style={{ width: `${backlogPct}%` }}
                    />
                  </div>
                  <span className="count">{backlogCount}</span>
                </div>
              </div>
            </div>
          </section>
        </main>
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






