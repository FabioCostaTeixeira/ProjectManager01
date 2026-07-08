import { navItems, groupLabels, navGroups } from '../nav'

export interface PermissionDef { key: string; label: string; group: string }

export const ALL_ACCESS = 'tudo'

// Catálogo derivado do menu: uma permissão por página, agrupada como na sidebar.
// Marcar o grupo inteiro = todas as páginas do grupo; granular = página a página.
export const PERMISSIONS_CATALOG: PermissionDef[] = navItems.map((i) => ({
  key: `page:${i.to}`,
  label: i.label,
  group: groupLabels[i.group],
}))

export const PERMISSION_GROUPS = navGroups.map((g) => groupLabels[g])

export const pageKey = (path: string) => `page:${path}`

// Sem perfil (permissions undefined) = acesso liberado (compatibilidade).
export function canAccess(permissions: string[] | undefined, path: string): boolean {
  if (!permissions) return true
  return permissions.includes(ALL_ACCESS) || permissions.includes(pageKey(path))
}
