import { useEffect } from "react"
import { Link } from "react-router-dom"

export default function IntroLayout() {
  useEffect(() => {
    const stored = localStorage.getItem("lista-compras:theme")
    if (stored) {
      document.documentElement.dataset.theme = stored
    }
  }, [])

  return (
    <div className="page">
      <nav className="top-nav">
        <div className="brand">
          <span className="badge">Lista</span>
        </div>
        <div className="nav-links">
          <Link to="/" className="btn btn-secondary">
            Inicio
          </Link>
          <Link to="/shopping" className="btn btn-ghost">
            Compras
          </Link>
          <Link to="/games" className="btn btn-ghost">
            Jogos
          </Link>
          <Link to="/settings" className="btn btn-ghost">
            Ajustes
          </Link>
        </div>
      </nav>

      <div className="intro-shell">
        <header className="intro-header">
          <p className="eyebrow">Bem-vindo</p>
          <h1>O que voce quer organizar hoje?</h1>
          <p className="muted">
            Escolha um caminho para comecar. Voce pode alternar a qualquer
            momento.
          </p>
        </header>

        <section className="intro-grid">
          <Link to="/shopping" className="intro-card">
            <h2>Lista de compras</h2>
            <p className="muted">
              Categorias, itens e comparacao de precos em um so lugar.
            </p>
            <span className="btn btn-secondary">Entrar</span>
          </Link>

          <Link to="/games" className="intro-card">
            <h2>Lista de jogos</h2>
            <p className="muted">Nome do jogo e link rapido para compra.</p>
            <span className="btn btn-primary">Abrir</span>
          </Link>
        </section>
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
