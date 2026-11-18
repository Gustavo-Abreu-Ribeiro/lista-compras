export function installmentSchedule(totalCents: number, count: number, firstDueOn: string) {
  const first = new Date(`${firstDueOn}T00:00:00Z`)
  const year = first.getUTCFullYear()
  const month = first.getUTCMonth()
  const day = first.getUTCDate()
  const base = Math.floor(totalCents / count)
  const remainder = totalCents % count

  return Array.from({ length: count }, (_, index) => {
    const monthStart = new Date(Date.UTC(year, month + index, 1))
    const lastDay = new Date(Date.UTC(year, month + index + 1, 0)).getUTCDate()
    monthStart.setUTCDate(Math.min(day, lastDay))
    return {
      due_on: monthStart.toISOString().slice(0, 10),
      amount_cents: base + (index < remainder ? 1 : 0),
    }
  })
}
