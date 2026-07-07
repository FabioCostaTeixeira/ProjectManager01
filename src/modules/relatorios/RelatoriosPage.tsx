import { useQuery } from '@tanstack/react-query'
import { TrendingUp, TrendingDown, Minus, CalendarClock } from 'lucide-react'
import { api } from '../../services/api'
import { Card, PageHeader, TableWrap, Th, Td, Loading } from '../../components/ui'
import { dateBR } from '../../lib/format'

export function RelatoriosPage() {
  const margem = useQuery({ queryKey: ['reportRows'], queryFn: api.getReportRows })
  const projects = useQuery({ queryKey: ['projects'], queryFn: api.getProjects })
  const deliverables = useQuery({ queryKey: ['deliverables'], queryFn: api.getDeliverables })
  if (margem.isLoading || projects.isLoading) return <Loading />

  const projectOf = (id: string) => projects.data?.find((p) => p.id === id)?.name ?? '—'
  const proximas = [...(deliverables.data ?? [])]
    .filter((d) => d.status !== 'entregue')
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 6)

  const trendIcon = (t: string) =>
    t === 'up' ? <TrendingUp size={15} className="text-emerald-500" /> : t === 'down' ? <TrendingDown size={15} className="text-rose-500" /> : <Minus size={15} className="text-slate-400" />

  return (
    <div>
      <PageHeader title="Relatórios" subtitle="Margem por projeto e próximas entregas" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">Margem por projeto</h2>
          <TableWrap>
            <thead><tr><Th>Projeto</Th><Th>Métrica</Th><Th>Valor</Th><Th>Tendência</Th></tr></thead>
            <tbody>
              {(margem.data ?? []).map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <Td className="font-medium text-slate-900 dark:text-white">{projectOf(r.projectId)}</Td>
                  <Td className="text-xs text-slate-500">{r.metric}</Td>
                  <Td className="font-semibold">{r.value}</Td>
                  <Td>{trendIcon(r.trend)}</Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">Próximas entregas</h2>
          <Card>
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {proximas.map((d) => (
                <li key={d.id} className="flex items-center gap-3 px-4 py-3">
                  <CalendarClock size={16} className="text-indigo-500" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{d.name}</p>
                    <p className="text-xs text-slate-400">{projectOf(d.projectId)}</p>
                  </div>
                  <span className="whitespace-nowrap text-xs text-slate-500">{dateBR(d.dueDate)}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  )
}
