import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { api, createEntity, updateEntity, removeEntity } from '../../services/api'
import { PageHeader, Badge, ProgressBar, Avatar, TableWrap, Th, Td, Loading, Modal, cn } from '../../components/ui'
import { projectStatusBadge, healthDot, brl, dateBR } from '../../lib/format'
import type { Project, ProjectStatus } from '../../types'

const emptyProject = (): Project => ({
  id: `p-${Date.now()}`,
  name: '',
  client: '',
  status: 'planejado',
  health: 'verde',
  progress: 0,
  startDate: new Date().toISOString().slice(0, 10),
  endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  ownerId: '',
  budget: 0,
  spent: 0,
})

const isNew = (projects: Project[] | undefined, id: string) => !projects?.some((p) => p.id === id)

const filters: { value: ProjectStatus | 'todos'; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'em_andamento', label: 'Em andamento' },
  { value: 'em_risco', label: 'Em risco' },
  { value: 'planejado', label: 'Planejado' },
  { value: 'pausado', label: 'Pausado' },
  { value: 'concluido', label: 'Concluído' },
]

export function ProjetosPage() {
  const { data: projects, isLoading } = useQuery({ queryKey: ['projects'], queryFn: api.getProjects })
  const { data: users } = useQuery({ queryKey: ['users'], queryFn: api.getUsers })
  const [filter, setFilter] = useState<ProjectStatus | 'todos'>('todos')
  const [editing, setEditing] = useState<Project | null>(null)
  const queryClient = useQueryClient()

  if (isLoading) return <Loading />

  const rows = (projects ?? []).filter((p) => filter === 'todos' || p.status === filter)
  const owner = (id: string) => users?.find((u) => u.id === id)

  const save = async () => {
    if (!editing?.name.trim() || !editing.client.trim() || !editing.ownerId) return
    if (isNew(projects, editing.id)) await createEntity('projects', editing)
    else await updateEntity('projects', editing.id, editing)
    await queryClient.invalidateQueries({ queryKey: ['projects'] })
    setEditing(null)
  }
  const remove = async (id: string) => {
    await removeEntity('projects', id)
    await queryClient.invalidateQueries({ queryKey: ['projects'] })
  }

  return (
    <div>
      <PageHeader
        title="Projetos"
        subtitle={`${rows.length} projeto(s)`}
        actions={
          <button
            onClick={() => setEditing(emptyProject())}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-600"
          >
            <Plus size={15} /> Novo projeto
          </button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              'rounded-full px-3 py-1 text-sm font-medium transition-colors',
              filter === f.value
                ? 'bg-indigo-500 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <TableWrap>
        <thead>
          <tr>
            <Th>Projeto</Th>
            <Th>Cliente</Th>
            <Th>Responsável</Th>
            <Th>Status</Th>
            <Th>Progresso</Th>
            <Th>Orçamento</Th>
            <Th>Prazo</Th>
            <Th>Ações</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => {
            const st = projectStatusBadge[p.status]
            const o = owner(p.ownerId)
            const over = p.spent > p.budget
            return (
              <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <Td>
                  <Link to={`/projetos/${p.id}`} className="flex items-center gap-2 font-medium text-slate-900 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400">
                    <span className={`h-2 w-2 rounded-full ${healthDot[p.health]}`} />
                    {p.name}
                  </Link>
                </Td>
                <Td>{p.client}</Td>
                <Td>
                  {o && (
                    <span className="flex items-center gap-2">
                      <Avatar name={o.name} color={o.color} size={24} />
                      <span className="text-slate-600 dark:text-slate-300">{o.name}</span>
                    </span>
                  )}
                </Td>
                <Td><Badge className={st.className}>{st.label}</Badge></Td>
                <Td>
                  <div className="flex w-32 items-center gap-2">
                    <ProgressBar value={p.progress} />
                    <span className="text-xs text-slate-400">{p.progress}%</span>
                  </div>
                </Td>
                <Td>
                  <span className={cn('text-xs', over && 'text-rose-500')}>
                    {brl(p.spent)} / {brl(p.budget)}
                  </span>
                </Td>
                <Td className="whitespace-nowrap text-xs text-slate-500">{dateBR(p.endDate)}</Td>
                <Td>
                  <div className="flex gap-1">
                    <button onClick={() => setEditing({ ...p })} title="Editar" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-500 dark:hover:bg-slate-800">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => remove(p.id)} title="Excluir" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-rose-500 dark:hover:bg-slate-800">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </Td>
              </tr>
            )
          })}
        </tbody>
      </TableWrap>

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing && !isNew(projects, editing.id) ? 'Editar projeto' : 'Novo projeto'}
        footer={
          <>
            <button onClick={() => setEditing(null)} className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
              Cancelar
            </button>
            <button onClick={save} className="rounded-lg bg-indigo-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-600">
              Salvar
            </button>
          </>
        }
      >
        {editing && (
          <div className="space-y-3">
            <input
              value={editing.name}
              onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              placeholder="Nome do projeto"
              className="w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
            />
            <input
              value={editing.client}
              onChange={(e) => setEditing({ ...editing, client: e.target.value })}
              placeholder="Cliente"
              className="w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
            />
            <select
              value={editing.ownerId}
              onChange={(e) => setEditing({ ...editing, ownerId: e.target.value })}
              className="w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
            >
              <option value="">Responsável…</option>
              {(users ?? []).map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
            <div className="grid grid-cols-2 gap-2">
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Data de início
                <input
                  type="date"
                  value={editing.startDate}
                  onChange={(e) => setEditing({ ...editing, startDate: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
                />
              </label>
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Data de término
                <input
                  type="date"
                  value={editing.endDate}
                  onChange={(e) => setEditing({ ...editing, endDate: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
                />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Orçamento (R$)
                <input
                  type="number"
                  min="0"
                  value={editing.budget}
                  onChange={(e) => setEditing({ ...editing, budget: Number(e.target.value) })}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
                />
              </label>
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Status
                <select
                  value={editing.status}
                  onChange={(e) => setEditing({ ...editing, status: e.target.value as ProjectStatus })}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
                >
                  <option value="planejado">Planejado</option>
                  <option value="em_andamento">Em andamento</option>
                  <option value="pausado">Pausado</option>
                  <option value="em_risco">Em risco</option>
                  <option value="concluido">Concluído</option>
                </select>
              </label>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
