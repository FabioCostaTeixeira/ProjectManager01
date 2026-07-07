import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../services/api'
import { PageHeader, Badge, ProgressBar, Avatar, TableWrap, Th, Td, Loading, cn } from '../../components/ui'
import { projectStatusBadge, healthDot, brl, dateBR } from '../../lib/format'
import type { ProjectStatus } from '../../types'

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

  if (isLoading) return <Loading />

  const rows = (projects ?? []).filter((p) => filter === 'todos' || p.status === filter)
  const owner = (id: string) => users?.find((u) => u.id === id)

  return (
    <div>
      <PageHeader title="Projetos" subtitle={`${rows.length} projeto(s)`} />

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
              </tr>
            )
          })}
        </tbody>
      </TableWrap>
    </div>
  )
}
