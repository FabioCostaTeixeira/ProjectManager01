import type { VercelRequest, VercelResponse } from '@vercel/node'
import bcrypt from 'bcryptjs'
import { getPool, SCHEMA } from './_lib/db.js'
import { toCamel } from './_lib/case.js'
import { signToken } from './_lib/auth.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Método não permitido' })
  }
  const { email, password } = (req.body ?? {}) as { email?: string; password?: string }
  if (!email || !password) return res.status(400).json({ error: 'Informe e-mail e senha' })

  try {
    const { rows } = await getPool().query(
      `SELECT * FROM ${SCHEMA}.users WHERE lower(email) = lower($1)`,
      [email],
    )
    const row = rows[0]
    if (!row?.password_hash || !bcrypt.compareSync(password, row.password_hash)) {
      return res.status(401).json({ error: 'E-mail ou senha inválidos' })
    }
    const user = toCamel(row)
    delete user.passwordHash
    return res.status(200).json({ user, token: signToken(row.id) })
  } catch (e) {
    return res.status(500).json({ error: e instanceof Error ? e.message : 'Erro interno' })
  }
}
