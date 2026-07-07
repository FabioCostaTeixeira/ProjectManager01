import { useQuery } from '@tanstack/react-query'
import { MessageSquare } from 'lucide-react'
import { api } from '../../services/api'
import { PageHeader, StatTile, Avatar, Loading } from '../../components/ui'
import { crmStageLabel, brl } from '../../lib/format'
import type { CrmStage } from '../../types'

const stages: CrmStage[] = ['lead', 'qualificacao', 'proposta', 'negociacao', 'ganho', 'perdido']

export function CrmPage() {
  const { data, isLoading } = useQuery({ queryKey: ['opportunities'], queryFn: api.getOpportunities })
  const { data: users } = useQuery({ queryKey: ['users'], queryFn: api.getUsers })
  if (isLoading) return <Loading />

  const opps = data ?? []
  const userOf = (id: string) => users?.find((u) => u.id === id)
  const pipeline = opps.filter((o) => o.stage !== 'ganho' && o.stage !== 'perdido').reduce((s, o) => s + o.value, 0)
  const ganho = opps.filter((o) => o.stage === 'ganho').reduce((s, o) => s + o.value, 0)

  return (
    <div>
      <PageHeader title="CRM" subtitle="Funil de oportunidades comerciais" />

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3">
        <StatTile label="Oportunidades" value={opps.length} />
        <StatTile label="Em pipeline" value={brl(pipeline)} accent="text-indigo-500" />
        <StatTile label="Ganho" value={brl(ganho)} accent="text-emerald-500" />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {stages.map((stage) => {
          const items = opps.filter((o) => o.stage === stage)
          const total = items.reduce((s, o) => s + o.value, 0)
          return (
            <div key={stage} className="rounded-xl border border-slate-200 bg-slate-50 p-2 dark:border-slate-800 dark:bg-slate-900/40">
              <div className="mb-2 px-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{crmStageLabel[stage]}</p>
                <p className="text-[11px] text-slate-400">{brl(total)}</p>
              </div>
              <div className="flex flex-col gap-2">
                {items.map((o) => {
                  const u = userOf(o.ownerId)
                  return (
                    <div key={o.id} className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{o.client}</p>
                      <p className="text-xs text-slate-400">{o.title}</p>
                      <p className="mt-1 text-sm font-semibold text-indigo-600 dark:text-indigo-400">{brl(o.value)}</p>
                      <div className="mt-2 flex items-center justify-between">
                        {u && <Avatar name={u.name} color={u.color} size={22} />}
                        <span className="flex items-center gap-1 text-[11px] text-slate-400">
                          <MessageSquare size={12} /> {o.followups.length}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
