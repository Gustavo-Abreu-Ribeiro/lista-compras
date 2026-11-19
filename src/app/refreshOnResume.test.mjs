import assert from "node:assert/strict"
import test from "node:test"
import { subscribeRefreshOnResume } from "./refreshOnResume.ts"

test("recarrega uma vez ao voltar, mesmo com dois eventos de retorno", () => {
  const previousWindow = globalThis.window
  const previousDocument = globalThis.document
  const browserWindow = new EventTarget()
  const pageDocument = new EventTarget()
  pageDocument.visibilityState = "visible"
  globalThis.window = browserWindow
  globalThis.document = pageDocument
  let calls = 0
  try {
    const unsubscribe = subscribeRefreshOnResume(() => { calls += 1 })
    browserWindow.dispatchEvent(new Event("focus"))
    assert.equal(calls, 0)
    pageDocument.visibilityState = "hidden"
    pageDocument.dispatchEvent(new Event("visibilitychange"))
    browserWindow.dispatchEvent(new Event("focus"))
    assert.equal(calls, 0)
    pageDocument.visibilityState = "visible"
    pageDocument.dispatchEvent(new Event("visibilitychange"))
    browserWindow.dispatchEvent(new Event("focus"))
    assert.equal(calls, 1)
    browserWindow.dispatchEvent(new Event("blur"))
    browserWindow.dispatchEvent(new Event("focus"))
    assert.equal(calls, 2)
    unsubscribe()
    browserWindow.dispatchEvent(new Event("blur"))
    browserWindow.dispatchEvent(new Event("focus"))
    assert.equal(calls, 2)
  } finally {
    globalThis.window = previousWindow
    globalThis.document = previousDocument
  }
})
