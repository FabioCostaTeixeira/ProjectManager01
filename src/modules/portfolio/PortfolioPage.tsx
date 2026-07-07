import { useQuery } from '@tanstack/react-query'
import { api } from '../../services/api'
import { Card, PageHeader, Loading } from '../../components/ui'
import { healthDot, dateBR } from '../../lib/format'

const ms = (iso: string) => new Date(iso + 'T00:00:00').getTime()

export function PortfolioPage() {
  const { data, isLoading } = useQuery({ queryKey: ['projects'], queryFn: api.getProjects })
  if (isLoading) return <Loading />

  const rows = data ?? []
  const min = Math.min(...rows.map((p) => ms(p.startDate)))
  const max = Math.max(...rows.map((p) => ms(p.endDate)))
  const span = max - min || 1
  const pos = (iso: string) => ((ms(iso) - min) / span) * 100

  return (
    <div>
      <PageHeader title="Portfólio / Gantt" subtitle="Linha do tempo dos projetos" />
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[720px] p-4">
            {rows.map((p) => {
              const left = pos(p.startDate)
              const width = Math.max(2, pos(p.endDate) - left)
              return (
                <div key={p.id} className="mb-3 flex items-center gap-3">
                  <div className="flex w-44 shrink-0 items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${healthDot[p.health]}`} />
                    <span className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">{p.name}</span>
                  </div>
                  <div className="relative h-7 flex-1 rounded bg-slate-100 dark:bg-slate-800/50">
                    <div
                      className="absolute top-0 flex h-7 items-center rounded bg-indigo-500/20 dark:bg-indigo-500/20"
                      style={{ left: `${left}%`, width: `${width}%` }}
                      title={`${dateBR(p.startDate)} — ${dateBR(p.endDate)}`}
                    >
                      <div className="h-7 rounded bg-indigo-500" style={{ width: `${p.progress}%` }} />
                      <span className="absolute right-1.5 text-[10px] font-medium text-slate-600 dark:text-slate-300">{p.progress}%</span>
                    </div>
                  </div>
                </div>
              )
            })}
            <div className="mt-2 flex justify-between border-t border-slate-100 pt-2 text-[11px] text-slate-400 dark:border-slate-800">
              <span>{dateBR(new Date(min).toISOString().slice(0, 10))}</span>
              <span>{dateBR(new Date(max).toISOString().slice(0, 10))}</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
