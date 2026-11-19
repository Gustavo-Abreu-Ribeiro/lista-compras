export function subscribeRefreshOnResume(refresh: () => void): () => void {
  let away = false
  const markAway = () => { away = true }
  const resume = () => {
    if (!away || document.visibilityState !== "visible") return
    away = false
    refresh()
  }
  const onVisibilityChange = () => {
    if (document.visibilityState === "hidden") markAway()
    else resume()
  }
  window.addEventListener("blur", markAway)
  window.addEventListener("focus", resume)
  document.addEventListener("visibilitychange", onVisibilityChange)
  return () => {
    window.removeEventListener("blur", markAway)
    window.removeEventListener("focus", resume)
    document.removeEventListener("visibilitychange", onVisibilityChange)
  }
}
