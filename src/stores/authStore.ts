import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface SessionUser {
  name: string
  email: string
  workspace: string
}

interface AuthState {
  user: SessionUser | null
  login: (email: string, workspace: string) => void
  logout: () => void
}

// Auth 100% local/fake — nenhuma chamada externa. Só para simular o fluxo.
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      login: (email, workspace) => {
        const name = email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
        set({ user: { name: name || 'Usuário', email, workspace: workspace || 'Meu Workspace' } })
      },
      logout: () => set({ user: null }),
    }),
    { name: 'gp-auth' },
  ),
)
