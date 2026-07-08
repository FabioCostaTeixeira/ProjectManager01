import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '../types'

export interface SessionUser {
  id: string
  name: string
  email: string
  workspace: string
  profileId: string | null
}

interface AuthState {
  user: SessionUser | null
  token: string | null
  login: (email: string, password: string, workspace: string) => Promise<void>
  logout: () => void
}

// Auth real: POST /api/login valida contra o banco e retorna token HMAC.
// fetch direto (não services/api.ts) para evitar import circular — api.ts lê o token daqui.
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      login: async (email, password, workspace) => {
        const res = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })
        if (!res.ok) {
          const msg = await res.json().then((b) => b.error).catch(() => 'Falha no login')
          throw new Error(msg)
        }
        const { user, token } = (await res.json()) as { user: User; token: string }
        set({
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            workspace: workspace || 'Meu Workspace',
            profileId: user.profileId,
          },
          token,
        })
      },
      logout: () => set({ user: null, token: null }),
    }),
    { name: 'gp-auth' },
  ),
)
