import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { LayoutGrid } from 'lucide-react'
import { api } from '../services/api'
import { healthDot, projectStatusBadge } from '../lib/format'

// Painel modo TV — standalone, sem sidebar (rota /tv). Bom para telão da sala.
export function TvPage() {
  const { data: projects } = useQuery({ queryKey: ['projects'], queryFn: api.getProjects })
  const { data: tickets } = useQuery({ queryKey: ['tickets'], queryFn: api.getTickets })
  const { data: deliverables } = useQuery({ queryKey: ['deliverables'], queryFn: api.getDeliverables })

  const ativos = projects?.filter((p) => p.status !== 'concluido').length ?? 0
  const risco = projects?.filter((p) => p.health !== 'verde').length ?? 0
  const criticos = tickets?.filter((t) => t.priority === 'critica' && t.status !== 'fechado').length ?? 0
  const aprov = deliverables?.filter((d) => d.status === 'em_aprovacao').length ?? 0

  return (
    <div className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500">
            <LayoutGrid size={22} />
          </div>
          <h1 className="text-2xl font-semibold">Painel de Operação</h1>
        </div>
        <Link to="/hoje" className="text-sm text-slate-400 hover:text-white">← voltar ao app</Link>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-6 lg:grid-cols-4">
        {[
          { label: 'Projetos ativos', value: ativos, color: 'text-indigo-400' },
          { label: 'Em risco', value: risco, color: 'text-rose-400' },
          { label: 'Chamados críticos', value: criticos, color: 'text-amber-400' },
          { label: 'Em aprovação', value: aprov, color: 'text-violet-400' },
        ].map((k) => (
          <div key={k.label} className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm uppercase tracking-wide text-slate-400">{k.label}</p>
            <p className={`mt-2 text-6xl font-bold ${k.color}`}>{k.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {(projects ?? []).map((p) => {
          const st = projectStatusBadge[p.status]
          return (
            <div key={p.id} className="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-lg font-medium">
                  <span className={`h-3 w-3 rounded-full ${healthDot[p.health]}`} />
                  {p.name}
                </span>
                <span className="text-sm text-slate-400">{st.label}</span>
              </div>
              <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-slate-800">
                <div className="h-full rounded-full bg-indigo-500" style={{ width: `${p.progress}%` }} />
              </div>
              <p className="mt-2 text-right text-sm text-slate-400">{p.progress}%</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
