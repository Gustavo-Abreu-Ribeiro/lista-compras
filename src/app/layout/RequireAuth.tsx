import { useEffect, useState, type ReactNode } from "react"
import { Navigate } from "react-router-dom"
import { supabase } from "../../services/supabase"

export default function RequireAuth({ children }: { children: ReactNode }) {
  const [state, setState] = useState<"loading" | "signed-in" | "signed-out" | "unconfigured">("loading")

  useEffect(() => {
    if (!supabase) {
      setState("unconfigured")
      return
    }
    supabase.auth.getSession().then(({ data, error }) => {
      setState(!error && data.session ? "signed-in" : "signed-out")
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setState(session ? "signed-in" : "signed-out")
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  if (state === "loading") return <main className="page"><p className="muted">Conectando à sua conta…</p></main>
  if (state !== "signed-in") return <Navigate to={state === "unconfigured" ? "/login?setup=required" : "/login"} replace />
  return children
}
