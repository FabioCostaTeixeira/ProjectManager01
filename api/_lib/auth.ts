import { createHmac, timingSafeEqual } from 'node:crypto'
import type { VercelRequest, VercelResponse } from '@vercel/node'

const SECRET = process.env.AUTH_SECRET ?? ''
const WEEK_MS = 7 * 24 * 60 * 60 * 1000

const sign = (data: string) => createHmac('sha256', SECRET).update(data).digest('base64url')

export function signToken(userId: string): string {
  const payload = Buffer.from(JSON.stringify({ sub: userId, exp: Date.now() + WEEK_MS })).toString('base64url')
  return `${payload}.${sign(payload)}`
}

export function verifyToken(token: string): string | null {
  const [payload, sig] = token.split('.')
  if (!payload || !sig || !SECRET) return null
  const expected = sign(payload)
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null
  try {
    const { sub, exp } = JSON.parse(Buffer.from(payload, 'base64url').toString())
    return typeof sub === 'string' && exp > Date.now() ? sub : null
  } catch {
    return null
  }
}

// Retorna o userId autenticado ou responde 401 e retorna null.
export function requireAuth(req: VercelRequest, res: VercelResponse): string | null {
  const token = (req.headers.authorization ?? '').replace(/^Bearer /, '')
  const userId = token ? verifyToken(token) : null
  if (!userId) res.status(401).json({ error: 'Não autenticado' })
  return userId
}
