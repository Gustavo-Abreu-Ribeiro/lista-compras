import { useEffect, useState } from "react"
import AppNavigation from "./AppNavigation"
import type { Session } from "@supabase/supabase-js"
import { isTauri } from "@tauri-apps/api/core"
import { supabase } from "../../services/supabase"
import { getLegacyMigrationStatus, importLegacyData, removeLegacyDatabase } from "../../features/migration/api"

export default function SettingsLayout() {
  const themes = ["light", "ocean", "sunset", "dark", "berry", "blueprint", "citrus", "cartucho", "aero"] as const
  const themeNames: Record<(typeof themes)[number], string> = {
    light: "Feira",
    ocean: "Horta",
    sunset: "Barro",
    dark: "Noite",
    berry: "Jabuticaba",
    blueprint: "Azulejo",
    citrus: "Limão",
    cartucho: "Cartucho",
    aero: "Frutiger Aero",
  }
  const [themeIndex, setThemeIndex] = useState(0)
  const [session, setSession] = useState<Session | null>(null)
  const [legacyStatus, setLegacyStatus] = useState<{ databaseExists: boolean; imported: boolean } | null>(null)
  const [migrationBusy, setMigrationBusy] = useState(false)
  const [migrationNotice, setMigrationNotice] = useState("")

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
    if (!isTauri()) return
    getLegacyMigrationStatus().then(setLegacyStatus).catch((error) => {
      setMigrationNotice(error instanceof Error ? error.message : String(error))
    })
  }, [])

  function applyTheme(theme: (typeof themes)[number]) {
    const index = themes.indexOf(theme)
    if (index >= 0) setThemeIndex(index)
    document.documentElement.dataset.theme = theme
    localStorage.setItem("lista-compras:theme", theme)
  }

  async function signOut() {
    if (!supabase) return
    await supabase.auth.signOut()
  }

  async function migrateLocalData() {
    setMigrationBusy(true)
    setMigrationNotice("")
    try {
      const result = await importLegacyData()
      setLegacyStatus({ databaseExists: true, imported: true })
      setMigrationNotice(result.alreadyImported
        ? "A importação já foi concluída e conferida."
        : `Importação conferida: ${Object.values(result.counts).reduce((sum, count) => sum + count, 0)} registros enviados.`)
    } catch (error) {
      setMigrationNotice(error instanceof Error ? error.message : String(error))
    } finally {
      setMigrationBusy(false)
    }
  }

  async function deleteLocalCopy() {
    if (!legacyStatus?.imported) return
    const confirmed = window.confirm("A importação cloud foi concluída. Remover definitivamente a cópia SQLite deste computador? Compras e finanças continuarão disponíveis na conta Supabase.")
    if (!confirmed) return
    setMigrationBusy(true)
    try {
      await removeLegacyDatabase()
      setLegacyStatus({ databaseExists: false, imported: true })
      setMigrationNotice("A cópia SQLite local foi removida.")
    } catch (error) {
      setMigrationNotice(error instanceof Error ? error.message : String(error))
    } finally {
      setMigrationBusy(false)
    }
  }

  return (
    <div className="page">
      <AppNavigation />

      <div className="intro-shell settings-shell">
        <span className="cartucho-session" aria-hidden="true">SESSION 05 // 設定 // CONFIG</span>
        <section className="sync-card">
          <div className="sync-header">
            <div>
              <p className="eyebrow">Perfil</p>
              <h2>Conta</h2>
              <p className="muted">Seus dados acompanham a conta Supabase.</p>
            </div>
            {session?.user?.email && (
              <span className="badge">{session.user.email}</span>
            )}
          </div>

          <div className="sync-actions">
            <p className="muted">Conectado.</p>
            <button className="btn btn-ghost" onClick={signOut}>Sair</button>
          </div>
        </section>

        {isTauri() && legacyStatus?.databaseExists && <section className="sync-card">
          <div>
            <p className="eyebrow">Migração de dados</p>
            <h2>{legacyStatus.imported ? "Dados conferidos na nuvem" : "Trazer dados deste dispositivo"}</h2>
            <p className="muted">A importação preserva IDs portáteis e relações. A cópia local só é removida depois de confirmar.</p>
          </div>
          {migrationNotice && <p className="finance-notice" role="status">{migrationNotice}</p>}
          <div className="sync-actions">
            <button className="btn btn-secondary" onClick={migrateLocalData} disabled={migrationBusy}>
              {migrationBusy ? "Processando…" : legacyStatus.imported ? "Conferir importação" : "Importar para minha conta"}
            </button>
            {legacyStatus.imported && <button className="btn btn-ghost" onClick={deleteLocalCopy} disabled={migrationBusy}>Remover cópia local</button>}
          </div>
        </section>}

        <section className="sync-card">
          <div>
            <p className="eyebrow">Visual</p>
            <h2>Aparência</h2>
            <p className="muted">Escolha a identidade visual do app. Cartucho e Frutiger Aero transformam a navegação e as telas com um toque.</p>
          </div>
          <div className="theme-grid">
            {themes.map((theme) => (
              <button
                key={theme}
                className={`btn theme-choice theme-${theme} ${themeIndex === themes.indexOf(theme) ? "is-selected" : ""}`}
                aria-pressed={themeIndex === themes.indexOf(theme)}
                onClick={() => applyTheme(theme)}
              >
                <span className="theme-swatch" aria-hidden="true" />
                {themeNames[theme]}
                {theme === "cartucho" && <small className="cartucho-theme-detail">Navegação, painéis e jogos em nova identidade</small>}
                {theme === "aero" && <small className="aero-theme-detail">Céu, água e vidro. Uma nova atmosfera em um toque.</small>}
              </button>
            ))}
          </div>
        </section>

      </div>

    </div>
  )
}
