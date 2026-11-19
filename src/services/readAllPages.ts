type PageResult = { data: unknown; error: { message: string } | null; count: number | null }

// A consulta deve ter uma ordem estavel (id) e solicitar count: "exact".
// Avancamos pelo numero recebido: o limite de linhas do PostgREST pode ser
// menor que o tamanho solicitado.
export async function readAllPages<T>(page: (from: number, to: number) => PromiseLike<PageResult>): Promise<T[]> {
  const rows: T[] = []
  const pageSize = 500
  let total: number | null = null
  while (total === null || rows.length < total) {
    const { data, error, count } = await page(rows.length, rows.length + pageSize - 1)
    if (error) throw new Error(error.message)
    if (count === null) throw new Error("A consulta nao informou o total de registros.")
    if (total !== null && count !== total) throw new Error("Os dados mudaram durante a leitura. Tente novamente.")
    total = count
    const batch = data as T[] | null
    if (!batch?.length && rows.length < total) throw new Error("A consulta retornou apenas parte dos registros.")
    rows.push(...(batch ?? []))
  }
  return rows
}
