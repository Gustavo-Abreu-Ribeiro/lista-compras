import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import type { Session } from "@supabase/supabase-js"
import { getActiveListId, getListId, setListId, supabase } from "../../services/supabase"

export default function SettingsLayout() {
  const themes = ["light", "dark", "ocean", "sunset"] as const
  const [themeIndex, setThemeIndex] = useState(0)
  const [listId, setListIdState] = useState("")
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem("lista-compras:theme")
    if (stored) {
      const index = themes.indexOf(stored as (typeof themes)[number])
      if (index >= 0) {
        setThemeIndex(index)
        document.documentElement.dataset.theme = themes[index]
      }
    }

    if (supabase) {
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
    }
  }, [])

  useEffect(() => {
    if (session?.user?.id) {
      setListIdState(getActiveListId(session))
    } else {
      setListIdState(getListId())
    }
  }, [session])

  function applyTheme(theme: (typeof themes)[number]) {
    const index = themes.indexOf(theme)
    if (index >= 0) setThemeIndex(index)
    document.documentElement.dataset.theme = theme
    localStorage.setItem("lista-compras:theme", theme)
  }

  function applyListId() {
    const trimmed = listId.trim()
    if (!trimmed) return
    setListId(trimmed)
    setListIdState(trimmed)
  }

  async function copyListId() {
    if (!listId) return
    try {
      await navigator.clipboard.writeText(listId)
    } catch {
      // ignore clipboard issues
    }
  }

  async function signOut() {
    if (!supabase) return
    await supabase.auth.signOut()
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
          <Link to="/games" className="btn btn-ghost">
            Jogos
          </Link>
          <Link to="/settings" className="btn btn-secondary">
            Ajustes
          </Link>
        </div>
      </nav>

      <div className="intro-shell">
        <section className="sync-card">
          <div className="sync-header">
            <div>
              <p className="eyebrow">Perfil</p>
              <h2>Conta</h2>
              <p className="muted">
                Gerencie sua sessao e sincronizacao.
              </p>
            </div>
            {session?.user?.email && (
              <span className="badge">{session.user.email}</span>
            )}
          </div>

          {session ? (
            <div className="sync-actions">
              <p className="muted">Sessao ativa.</p>
              <button className="btn btn-ghost" onClick={signOut}>
                Sair
              </button>
            </div>
          ) : (
            <div className="sync-actions">
              <p className="muted">Voce nao esta conectado.</p>
              <Link to="/login" className="btn btn-secondary">
                Entrar
              </Link>
            </div>
          )}
        </section>

        <section className="sync-card">
          <div>
            <p className="eyebrow">Tema</p>
            <h2>Aparencia</h2>
            <p className="muted">Escolha a paleta que combina com voce.</p>
          </div>
          <div className="theme-grid">
            {themes.map((theme) => (
              <button
                key={theme}
                className={`btn ${themeIndex === themes.indexOf(theme) ? "btn-secondary" : "btn-ghost"}`}
                onClick={() => applyTheme(theme)}
              >
                {theme}
              </button>
            ))}
          </div>
        </section>

        {!session && (
          <section className="sync-card">
            <div>
              <p className="eyebrow">Sincronizacao</p>
              <h2>Codigo manual</h2>
              <p className="muted">
                Use o mesmo codigo em todos os dispositivos para ver os mesmos
                dados.
              </p>
            </div>
            <div className="sync-row">
              <input
                className="input"
                value={listId}
                onChange={(event) => setListIdState(event.target.value)}
              />
              <button className="btn btn-secondary" onClick={applyListId}>
                Usar
              </button>
            </div>
            <button className="btn btn-ghost" onClick={copyListId}>
              Copiar codigo
            </button>
          </section>
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
