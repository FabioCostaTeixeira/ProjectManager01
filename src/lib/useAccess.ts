import { useQuery } from '@tanstack/react-query'
import { api } from '../services/api'
import { useAuthStore } from '../stores/authStore'
import { canAccess } from './permissions'

// Permissões do perfil do usuário logado. Sem perfil (ou perfis ainda
// carregando) = acesso liberado, para não piscar menu vazio.
export function useAccess(): (path: string) => boolean {
  const profileId = useAuthStore((s) => s.user?.profileId ?? null)
  const { data: profiles } = useQuery({ queryKey: ['profiles'], queryFn: api.getProfiles })
  const permissions = profileId ? profiles?.find((p) => p.id === profileId)?.permissions : undefined
  return (path: string) => canAccess(permissions, path)
}
