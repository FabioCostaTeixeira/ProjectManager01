import type { VercelRequest, VercelResponse } from '@vercel/node'
import bcrypt from 'bcryptjs'
import { getPool, SCHEMA } from './_lib/db.js'
import { toCamel, toSnake } from './_lib/case.js'
import { ENTITIES, pkOf, validate } from './_lib/entities.js'
import { requireAuth } from './_lib/auth.js'

const clean = (row: Record<string, unknown>) => {
  const r = toCamel(row)
  delete r.passwordHash
  return r
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireAuth(req, res)) return
  const entity = String(req.query.entity)
  const table = ENTITIES[entity]
  if (!table) return res.status(404).json({ error: `Entidade desconhecida: ${entity}` })
  const pool = getPool()

  try {
    if (req.method === 'GET') {
      const { rows } = await pool.query(`SELECT * FROM ${SCHEMA}.${table} ORDER BY ${pkOf(entity)}`)
      return res.status(200).json(rows.map(clean))
    }

    if (req.method === 'POST') {
      const body = req.body as Record<string, unknown>
      const invalid = validate[entity]?.(body)
      if (invalid) return res.status(400).json({ error: invalid })
      // Usuário novo com senha: hash antes de gravar.
      if (entity === 'users' && typeof body.password === 'string' && body.password) {
        body.passwordHash = bcrypt.hashSync(body.password, 10)
      }
      delete body.password
      const data = toSnake(body)
      const cols = Object.keys(data)
      const placeholders = cols.map((_, i) => `$${i + 1}`).join(', ')
      const { rows } = await pool.query(
        `INSERT INTO ${SCHEMA}.${table} (${cols.join(', ')}) VALUES (${placeholders}) RETURNING *`,
        Object.values(data),
      )
      return res.status(201).json(clean(rows[0]))
    }

    res.setHeader('Allow', 'GET, POST')
    return res.status(405).json({ error: 'Método não permitido' })
  } catch (e) {
    return res.status(500).json({ error: e instanceof Error ? e.message : 'Erro interno' })
  }
}
