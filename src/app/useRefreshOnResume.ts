import { useEffect, useRef } from "react"
import { subscribeRefreshOnResume } from "./refreshOnResume"

// Retomar a janela ou aba revalida dados que podem ter mudado em outro aparelho.
// Um retorno dispara uma unica recarga mesmo quando focus e visibilitychange
// chegam juntos.
export function useRefreshOnResume(refresh: () => void) {
  const refreshRef = useRef(refresh)
  refreshRef.current = refresh

  useEffect(() => {
    return subscribeRefreshOnResume(() => refreshRef.current())
  }, [])
}
