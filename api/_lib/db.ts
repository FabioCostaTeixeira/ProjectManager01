import pg from 'pg'

// date (OID 1082) como string 'YYYY-MM-DD' crua — o front formata com dateBR.
pg.types.setTypeParser(1082, (v) => v)
// numeric (1700) e bigint (20) como number — o front faz aritmética/brl() direto.
pg.types.setTypeParser(1700, parseFloat)
pg.types.setTypeParser(20, Number)

const url =
  process.env.DATABASE_URL ??
  `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}/${process.env.PGDATABASE}?sslmode=require`

let pool: pg.Pool | undefined

export function getPool(): pg.Pool {
  if (!pool) pool = new pg.Pool({ connectionString: url, max: 3 })
  return pool
}

export const SCHEMA = 'gestor_projetos'
