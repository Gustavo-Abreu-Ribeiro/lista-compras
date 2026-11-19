import assert from "node:assert/strict"
import test from "node:test"
import { readAllPages } from "./readAllPages.ts"

test("le todas as linhas mesmo quando o servidor limita cada resposta", async () => {
  const source = Array.from({ length: 1201 }, (_, id) => ({ id }))
  const calls = []
  const rows = await readAllPages((from, to) => {
    calls.push(from)
    return Promise.resolve({ data: source.slice(from, Math.min(to + 1, from + 200)), count: source.length, error: null })
  })
  assert.deepEqual(rows, source)
  assert.deepEqual(calls, [0, 200, 400, 600, 800, 1000, 1200])
})

test("recusa resultado parcial ou alterado durante a leitura", async () => {
  await assert.rejects(readAllPages((from) => Promise.resolve({
    data: from ? [] : [{ id: 1 }], count: 2, error: null,
  })), /apenas parte/)
  await assert.rejects(readAllPages((from) => Promise.resolve({
    data: [{ id: from }], count: from ? 3 : 2, error: null,
  })), /mudaram/)
})
