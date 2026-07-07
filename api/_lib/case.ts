const snake = (s: string) => s.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`)
const camel = (s: string) => s.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase())

export function toCamel(row: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(row).map(([k, v]) => [camel(k), v]))
}

// Converte chaves para snake_case e serializa objetos/arrays (colunas jsonb) —
// o pg converteria array JS em array Postgres, que não é o que o schema usa.
export function toSnake(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => {
      const col = snake(k)
      // Nomes de coluna entram no SQL sem placeholder — só identificadores válidos.
      if (!/^[a-z][a-z0-9_]*$/.test(col)) throw new Error(`Coluna inválida: ${k}`)
      return [col, v !== null && typeof v === 'object' ? JSON.stringify(v) : v]
    }),
  )
}
