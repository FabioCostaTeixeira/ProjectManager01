import { create } from 'zustand'
import { createEntity, updateEntity, removeEntity } from '../services/api'
import type { Profile } from '../types'

interface PermissionsState {
  profiles: Profile[]
  hydrated: boolean
  // Atribuições feitas em sessão; fallback é o profileId vindo da API de users.
  assignments: Record<string, string | null>
  setAll: (profiles: Profile[]) => void
  saveProfile: (profile: Profile) => void
  deleteProfile: (id: string) => void
  assignProfile: (userId: string, profileId: string | null) => void
}

// Hidratado do useQuery da página; mutações persistem na API (otimista com rollback).
export const usePermissionsStore = create<PermissionsState>((set, get) => ({
  profiles: [],
  hydrated: false,
  assignments: {},
  setAll: (profiles) => set({ profiles, hydrated: true }),
  saveProfile: (profile) => {
    const prev = get().profiles
    const exists = prev.some((p) => p.id === profile.id)
    set({
      profiles: exists ? prev.map((p) => (p.id === profile.id ? profile : p)) : [...prev, profile],
    })
    const req = exists
      ? updateEntity('profiles', profile.id, profile)
      : createEntity('profiles', profile)
    req.catch(() => set({ profiles: prev }))
  },
  deleteProfile: (id) => {
    const prev = get().profiles
    const prevAssign = get().assignments
    set({
      profiles: prev.filter((p) => p.id !== id),
      // Zera atribuições órfãs do perfil apagado (o banco faz o mesmo via ON DELETE SET NULL).
      assignments: Object.fromEntries(
        Object.entries(prevAssign).map(([uid, pid]) => [uid, pid === id ? null : pid]),
      ),
    })
    removeEntity('profiles', id).catch(() => set({ profiles: prev, assignments: prevAssign }))
  },
  assignProfile: (userId, profileId) => {
    const prevAssign = get().assignments
    set({ assignments: { ...prevAssign, [userId]: profileId } })
    updateEntity('users', userId, { profileId }).catch(() => set({ assignments: prevAssign }))
  },
}))
