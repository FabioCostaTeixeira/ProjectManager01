import { useQuery } from '@tanstack/react-query'
import { ArrowRight, Bell, BellOff } from 'lucide-react'
import { api } from '../../services/api'
import { PageHeader, Card, Badge, Loading } from '../../components/ui'
import { depStatusBadge, depKindBadge } from '../../lib/format'

export function DependenciasPage() {
  const { data, isLoading } = useQuery({ queryKey: ['dependencies'], queryFn: api.getDependencies })
  if (isLoading) return <Loading />

  return (
    <div>
      <PageHeader title="Dependências" subtitle="Bloqueios e relações entre entregas" />
      <div className="space-y-3">
        {(data ?? []).map((d) => {
          const stt = depStatusBadge[d.status]
          const knd = depKindBadge[d.kind]
          return (
            <Card key={d.id} className="flex flex-wrap items-center gap-3 p-4">
              <span className="text-sm font-medium text-slate-900 dark:text-white">{d.from}</span>
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <Badge className={knd.className}>{knd.label}</Badge>
                <ArrowRight size={14} />
              </span>
              <span className="text-sm font-medium text-slate-900 dark:text-white">{d.to}</span>
              <div className="ml-auto flex items-center gap-3">
                {d.notified ? (
                  <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400"><Bell size={13} /> Notificado</span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-slate-400"><BellOff size={13} /> Sem aviso</span>
                )}
                <Badge className={stt.className}>{stt.label}</Badge>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
