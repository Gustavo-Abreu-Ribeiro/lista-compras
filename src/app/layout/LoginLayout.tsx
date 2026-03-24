import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import type { Session } from "@supabase/supabase-js"
import { supabase } from "../../services/supabase"

export default function LoginLayout() {
  const [session, setSession] = useState<Session | null>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [authStatus, setAuthStatus] = useState("")
  const [isBusy, setIsBusy] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("lista-compras:theme")
    if (stored) {
      document.documentElement.dataset.theme = stored
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

  async function signUp() {
    if (!supabase) return
    setIsBusy(true)
    setAuthStatus("")
    try {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setAuthStatus(error.message)
      } else {
        setAuthStatus("Conta criada! Voce ja pode entrar.")
      }
    } finally {
      setIsBusy(false)
    }
  }

  async function signIn() {
    if (!supabase) return
    setIsBusy(true)
    setAuthStatus("")
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) {
        setAuthStatus(error.message)
      }
    } finally {
      setIsBusy(false)
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
          <Link to="/settings" className="btn btn-ghost">
            Ajustes
          </Link>
        </div>
      </nav>

      <div className="intro-shell">
        <section className="sync-card">
          <div className="sync-header">
            <div>
              <p className="eyebrow">Conta</p>
              <h2>Login</h2>
              <p className="muted">
                Acesse sua conta para sincronizar automaticamente.
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
            <div className="auth-form">
              <label className="field">
                <span>Email</span>
                <input
                  className="input"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="voce@email.com"
                />
              </label>
              <label className="field">
                <span>Senha</span>
                <input
                  className="input"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </label>
              {authStatus && <p className="muted">{authStatus}</p>}
              <div className="sync-actions">
                <button className="btn btn-secondary" onClick={signIn} disabled={isBusy}>
                  Entrar
                </button>
                <button className="btn btn-ghost" onClick={signUp} disabled={isBusy}>
                  Criar conta
                </button>
              </div>
            </div>
          )}
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
