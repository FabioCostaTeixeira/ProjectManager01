// Catálogo fixo de permissões do sistema. Perfis marcam chaves daqui;
// a chave especial 'tudo' representa acesso total (Gestor Geral).
export interface PermissionDef {
  key: string
  label: string
  group: string
}

export const ALL_ACCESS = 'tudo'

export const PERMISSIONS_CATALOG: PermissionDef[] = [
  { key: 'projetos:read', label: 'Ver projetos', group: 'Projetos' },
  { key: 'projetos:write', label: 'Editar projetos', group: 'Projetos' },
  { key: 'financeiro:read', label: 'Ver financeiro', group: 'Financeiro' },
  { key: 'financeiro:write', label: 'Editar financeiro', group: 'Financeiro' },
  { key: 'capacidade:read', label: 'Ver capacidade', group: 'Capacidade' },
  { key: 'capacidade:write', label: 'Gerir jornadas/férias', group: 'Capacidade' },
  { key: 'tarefas:read', label: 'Ver tarefas', group: 'Tarefas' },
  { key: 'tarefas:write', label: 'Editar tarefas', group: 'Tarefas' },
  { key: 'apontamentos:read', label: 'Ver apontamentos', group: 'Apontamentos' },
  { key: 'apontamentos:write', label: 'Lançar apontamentos', group: 'Apontamentos' },
  { key: 'admin:read', label: 'Ver administração', group: 'Admin' },
  { key: 'admin:write', label: 'Gerir tenants/cadastros', group: 'Admin' },
]

export const PERMISSION_GROUPS = Array.from(new Set(PERMISSIONS_CATALOG.map((p) => p.group)))
