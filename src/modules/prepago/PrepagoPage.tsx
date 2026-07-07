import { useQuery } from '@tanstack/react-query'
import { api } from '../../services/api'
import { Card, PageHeader, Badge, Loading, cn } from '../../components/ui'

export function PrepagoPage() {
  const { data, isLoading } = useQuery({ queryKey: ['prepaids'], queryFn: api.getPrepaids })
  const { data: clients } = useQuery({ queryKey: ['clients'], queryFn: api.getClients })
  if (isLoading) return <Loading />

  const clientOf = (id: string) => clients?.find((c) => c.id === id)?.name ?? id

  return (
    <div>
      <PageHeader title="Pré-pago" subtitle="Saldo de horas por cliente e consumo do mês" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {(data ?? []).map((p) => {
          const usoPct = p.cargaMes ? Math.round((p.consumoMes / p.cargaMes) * 100) : 0
          const baixo = p.saldo <= 10
          return (
            <Card key={p.id} className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">{clientOf(p.clientId)}</h3>
                {baixo ? (
                  <Badge className="bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400">Saldo baixo</Badge>
                ) : (
                  <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">OK</Badge>
                )}
              </div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{p.saldo}h</p>
              <p className="mb-3 text-xs text-slate-400">saldo disponível</p>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                <div className={cn('h-full rounded-full', usoPct >= 85 ? 'bg-rose-500' : usoPct >= 60 ? 'bg-amber-500' : 'bg-emerald-500')} style={{ width: `${usoPct}%` }} />
              </div>
              <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                Consumo do mês: {p.consumoMes}h de {p.cargaMes}h ({usoPct}%)
              </p>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
