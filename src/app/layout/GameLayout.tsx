import { useEffect, useMemo, useRef, useState, type FormEvent } from "react"
import AppNavigation from "./AppNavigation"
import { createGame, deleteGame, listGames, setGameStatus, type Game, type GameStatus } from "../../features/games/api"

export default function GameLayout() {
  const [games, setGames] = useState<Game[]>([])
  const [name, setName] = useState("")
  const [url, setUrl] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(15)
  const [notice, setNotice] = useState("")
  const chartRef = useRef<HTMLDivElement | null>(null)

  function truncateText(text: string, maxLength: number) {
    if (text.length <= maxLength) return text
    return `${text.slice(0, Math.max(0, maxLength - 1))}…`
  }

  useEffect(() => {
    const storedTheme = localStorage.getItem("lista-compras:theme")
    if (storedTheme) document.documentElement.dataset.theme = storedTheme
    let active = true
    async function loadGames() {
      try {
        const rows = await listGames()
        if (active) setGames(rows)
      } catch (error) {
        if (active) setNotice(error instanceof Error ? error.message : String(error))
      }
    }
    void loadGames()
    return () => { active = false }
  }, [])

  useEffect(() => {
    function updatePerPage() {
      const height = window.innerHeight
      setPerPage(height < 700 ? 10 : height < 900 ? 12 : 15)
    }
    updatePerPage()
    window.addEventListener("resize", updatePerPage)
    return () => window.removeEventListener("resize", updatePerPage)
  }, [])

  const canSubmit = useMemo(() => Boolean(name.trim()) && Boolean(url.trim()), [name, url])

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

  async function addGame(event: FormEvent) {
    event.preventDefault()
    if (!canSubmit) return
    try {
      const game = await createGame(name, url)
      setGames((current) => [game, ...current])
      setName("")
      setUrl("")
      setNotice("")
    } catch (error) { setNotice(error instanceof Error ? error.message : String(error)) }
  }

  async function removeGame(game: Game) {
    if (!window.confirm(`Remover o jogo “${game.name}” da lista?`)) return
    try {
      await deleteGame(game.id)
      setGames((current) => current.filter((entry) => entry.id !== game.id))
    } catch (error) { setNotice(error instanceof Error ? error.message : String(error)) }
  }

  async function toggleStatus(id: string, status: GameStatus) {
    const game = games.find((entry) => entry.id === id)
    if (!game) return
    const updated = { status: game.status === status ? "backlog" as const : status, updated_at: new Date().toISOString() }
    try {
      await setGameStatus(id, updated.status, updated.updated_at)
      setGames((current) => current.map((entry) => entry.id === id ? { ...entry, ...updated } : entry))
    } catch (error) { setNotice(error instanceof Error ? error.message : String(error)) }
  }

  function scrollToChart() {
    chartRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <div className="page">
      <AppNavigation />

      <div className="app-shell">
        <aside className="panel sidebar">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Lista</p>
              <h2>Jogos</h2>
            </div>
            </div>
          <div className="card">
            <h3>Lista de jogos</h3>
            <p className="muted">
              Marque os jogos que está jogando ou já terminou.
            </p>
            <button className="btn btn-secondary" onClick={scrollToChart}>
              Ver totais
            </button>
          </div>
        </aside>

        <main className="panel main">
          {notice && <p className="finance-notice" role="status">{notice}</p>}
          <header className="main-header">
            <div>
              <span className="cartucho-session" aria-hidden="true">SESSION 03 // ゲーム // PRATELEIRA</span>
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
                  <p>Adicione um jogo pelo formulário ao lado.</p>
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
                          aria-label={`Remover ${game.name}`}
                          onClick={() => removeGame(game)}
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
                Jogos por estado.
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

    </div>
  )
}






