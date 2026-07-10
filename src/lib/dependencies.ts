import type { Project, Deliverable, Task } from '../types'

interface EntityCtx {
  projects?: Project[]
  deliverables?: Deliverable[]
  tasks?: Task[]
}

// IDs de projeto/entregável/tarefa carregam o prefixo do tipo (p-/d-/t-),
// então uma dependência pode apontar pra qualquer um dos três sem precisar
// de coluna separada por tipo.
export function resolveEntityName(id: string, ctx: EntityCtx): string {
  if (id.startsWith('t-')) return ctx.tasks?.find((t) => t.id === id)?.title ?? id
  if (id.startsWith('d-')) return ctx.deliverables?.find((d) => d.id === id)?.name ?? id
  if (id.startsWith('p-')) return ctx.projects?.find((p) => p.id === id)?.name ?? id
  return id
}

export function isEntityDone(id: string, ctx: EntityCtx): boolean {
  if (id.startsWith('t-')) return ctx.tasks?.find((t) => t.id === id)?.status === 'done'
  if (id.startsWith('d-')) return ctx.deliverables?.find((d) => d.id === id)?.status === 'entregue'
  if (id.startsWith('p-')) return ctx.projects?.find((p) => p.id === id)?.status === 'concluido'
  return false
}
