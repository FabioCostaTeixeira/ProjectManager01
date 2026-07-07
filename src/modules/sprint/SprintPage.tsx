import { useQuery } from '@tanstack/react-query'
import { api } from '../../services/api'
import { Card, PageHeader, Badge, ProgressBar, Loading } from '../../components/ui'
import { sprintBadge, dateBR } from '../../lib/format'

export function SprintPage() {
  const { data, isLoading } = useQuery({ queryKey: ['sprints'], queryFn: api.getSprints })
  const { data: projects } = useQuery({ queryKey: ['projects'], queryFn: api.getProjects })
  if (isLoading) return <Loading />

  const projectOf = (id: string) => projects?.find((p) => p.id === id)?.name ?? '—'

  return (
    <div>
      <PageHeader title="Sprint" subtitle="Ciclos de trabalho e progresso comprometido" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {(data ?? []).map((s) => {
          const st = sprintBadge[s.status]
          const pct = s.committed ? Math.round((s.done / s.committed) * 100) : 0
          return (
            <Card key={s.id} className="p-5">
              <div className="mb-1 flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white">{s.name}</h3>
                  <p className="text-xs text-slate-400">{projectOf(s.projectId)}</p>
                </div>
                <Badge className={st.className}>{st.label}</Badge>
              </div>
              <p className="mb-3 text-xs text-slate-400">
                {dateBR(s.startDate)} — {dateBR(s.endDate)}
              </p>
              <div className="mb-2 flex items-center gap-2">
                <ProgressBar value={pct} />
                <span className="w-10 text-right text-xs text-slate-500">{pct}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Comprometido: <b className="text-slate-700 dark:text-slate-200">{s.committed} pts</b></span>
                <span className="text-slate-500 dark:text-slate-400">Concluído: <b className="text-emerald-600 dark:text-emerald-400">{s.done} pts</b></span>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
