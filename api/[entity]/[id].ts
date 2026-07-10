import type { VercelRequest, VercelResponse } from '@vercel/node'
import bcrypt from 'bcryptjs'
import { getPool, SCHEMA } from '../_lib/db.js'
import { toCamel, toSnake } from '../_lib/case.js'
import { ENTITIES, pkOf, validate } from '../_lib/entities.js'
import { requireAuth } from '../_lib/auth.js'

const clean = (row: Record<string, unknown>) => {
  const r = toCamel(row)
  delete r.passwordHash
  return r
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireAuth(req, res)) return
  const entity = String(req.query.entity)
  const id = String(req.query.id)
  const table = ENTITIES[entity]
  if (!table) return res.status(404).json({ error: `Entidade desconhecida: ${entity}` })
  const pool = getPool()
  const pk = pkOf(entity)

  try {
    if (req.method === 'GET') {
      const { rows } = await pool.query(`SELECT * FROM ${SCHEMA}.${table} WHERE ${pk} = $1`, [id])
      if (!rows[0]) return res.status(404).json({ error: 'Não encontrado' })
      return res.status(200).json(clean(rows[0]))
    }

    if (req.method === 'PATCH') {
      const body = req.body as Record<string, unknown>
      const invalid = validate[entity]?.(body)
      if (invalid) return res.status(400).json({ error: invalid })
      // Troca de senha de usuário: hash antes de gravar.
      if (entity === 'users' && typeof body.password === 'string' && body.password) {
        body.passwordHash = bcrypt.hashSync(body.password, 10)
      }
      delete body.password
      const data = toSnake(body)
      const cols = Object.keys(data)
      if (cols.length === 0) return res.status(400).json({ error: 'Corpo vazio' })
      const sets = cols.map((c, i) => `"${c}" = $${i + 1}`).join(', ')
      const { rows } = await pool.query(
        `UPDATE ${SCHEMA}.${table} SET ${sets} WHERE ${pk} = $${cols.length + 1} RETURNING *`,
        [...Object.values(data), id],
      )
      if (!rows[0]) return res.status(404).json({ error: 'Não encontrado' })
      return res.status(200).json(clean(rows[0]))
    }

    if (req.method === 'DELETE') {
      const { rowCount } = await pool.query(`DELETE FROM ${SCHEMA}.${table} WHERE ${pk} = $1`, [id])
      if (!rowCount) return res.status(404).json({ error: 'Não encontrado' })
      return res.status(204).end()
    }

    res.setHeader('Allow', 'GET, PATCH, DELETE')
    return res.status(405).json({ error: 'Método não permitido' })
  } catch (e) {
    return res.status(500).json({ error: e instanceof Error ? e.message : 'Erro interno' })
  }
}
