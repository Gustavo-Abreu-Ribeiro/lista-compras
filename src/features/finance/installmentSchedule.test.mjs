import assert from "node:assert/strict"
import test from "node:test"
import { installmentSchedule } from "./installmentSchedule.ts"

test("preserva o dia informado e distribui todos os centavos", () => {
  const installments = installmentSchedule(10_000, 3, "2026-11-17")
  assert.deepEqual(installments, [
    { due_on: "2026-11-17", amount_cents: 3334 },
    { due_on: "2026-12-17", amount_cents: 3333 },
    { due_on: "2027-01-17", amount_cents: 3333 },
  ])
  assert.equal(installments.reduce((sum, item) => sum + item.amount_cents, 0), 10_000)
})

test("limita dias 29, 30 e 31 ao fim de fevereiro sem deslocar meses posteriores", () => {
  for (const [day, expectedFebruary] of [[29, "2027-02-28"], [30, "2027-02-28"], [31, "2027-02-28"]]) {
    const dates = installmentSchedule(300, 4, `2027-01-${day}`)
    assert.deepEqual(dates.map((item) => item.due_on), [
      `2027-01-${day}`, expectedFebruary, `2027-03-${day}`, `2027-04-${Math.min(day, 30)}`,
    ])
  }
})

test("respeita fevereiro bissexto e a virada de ano", () => {
  assert.deepEqual(installmentSchedule(200, 2, "2024-01-31").map((item) => item.due_on), [
    "2024-01-31", "2024-02-29",
  ])
  assert.deepEqual(installmentSchedule(200, 2, "2026-12-30").map((item) => item.due_on), [
    "2026-12-30", "2027-01-30",
  ])
})
