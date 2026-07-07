import { useQuery } from '@tanstack/react-query'
import { FolderKanban, PackageCheck, LifeBuoy, Clock, AlertTriangle } from 'lucide-react'
import { api } from '../../services/api'
import { Card, PageHeader, StatTile, Badge, ProgressBar, Avatar, Loading } from '../../components/ui'
import { projectStatusBadge, priorityBadge, dateBR, healthDot } from '../../lib/format'

export function HojePage() {
  const projects = useQuery({ queryKey: ['projects'], queryFn: api.getProjects })
  const tasks = useQuery({ queryKey: ['tasks'], queryFn: api.getTasks })
  const tickets = useQuery({ queryKey: ['tickets'], queryFn: api.getTickets })
  const time = useQuery({ queryKey: ['time'], queryFn: api.getTimeEntries })
  const deliverables = useQuery({ queryKey: ['deliverables'], queryFn: api.getDeliverables })
  const insights = useQuery({ queryKey: ['insights'], queryFn: api.getInsights })
  const users = useQuery({ queryKey: ['users'], queryFn: api.getUsers })

  if (projects.isLoading || tasks.isLoading) return <Loading />

  const activeProjects = projects.data?.filter((p) => p.status === 'em_andamento' || p.status === 'em_risco').length ?? 0
  const approvals = deliverables.data?.filter((d) => d.status === 'em_aprovacao').length ?? 0
  const criticalTickets = tickets.data?.filter((t) => t.priority === 'critica' && t.status !== 'fechado' && t.status !== 'resolvido').length ?? 0
  const weekHours = time.data?.reduce((s, e) => s + e.hours, 0) ?? 0

  const userName = (id: string) => users.data?.find((u) => u.id === id)
  const upcoming = (tasks.data ?? [])
    .filter((t) => t.status !== 'done')
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 6)
  const atRisk = (projects.data ?? []).filter((p) => p.health !== 'verde')

  return (
    <div>
      <PageHeader title="Hoje" subtitle="Visão geral do dia e do que precisa de atenção" />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Projetos ativos" value={activeProjects} icon={<FolderKanban />} accent="text-indigo-500" />
        <StatTile label="Em aprovação" value={approvals} icon={<PackageCheck />} accent="text-violet-500" />
        <StatTile label="Chamados críticos" value={criticalTickets} icon={<LifeBuoy />} accent="text-rose-500" />
        <StatTile label="Horas na semana" value={`${weekHours}h`} icon={<Clock />} accent="text-emerald-500" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="border-b border-slate-100 px-5 py-3 dark:border-slate-800">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Próximas tarefas</h2>
          </div>
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {upcoming.map((t) => {
              const u = userName(t.assigneeId)
              const pr = priorityBadge[t.priority]
              return (
                <li key={t.id} className="flex items-center gap-3 px-5 py-3">
                  {u && <Avatar name={u.name} color={u.color} size={30} />}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{t.title}</p>
                    <p className="text-xs text-slate-400">Vence em {dateBR(t.dueDate)}</p>
                  </div>
                  <Badge className={pr.className}>{pr.label}</Badge>
                </li>
              )
            })}
          </ul>
        </Card>

        <Card>
          <div className="border-b border-slate-100 px-5 py-3 dark:border-slate-800">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
              <AlertTriangle size={15} className="text-amber-500" /> Projetos em atenção
            </h2>
          </div>
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {atRisk.map((p) => {
              const st = projectStatusBadge[p.status]
              return (
                <li key={p.id} className="px-5 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2 truncate text-sm font-medium text-slate-900 dark:text-white">
                      <span className={`h-2 w-2 rounded-full ${healthDot[p.health]}`} />
                      {p.name}
                    </span>
                    <Badge className={st.className}>{st.label}</Badge>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <ProgressBar value={p.progress} />
                    <span className="text-xs text-slate-400">{p.progress}%</span>
                  </div>
                </li>
              )
            })}
          </ul>
        </Card>
      </div>

      <div className="mt-6">
        <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">Insights de IA</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {(insights.data ?? []).slice(0, 3).map((i) => (
            <Card key={i.id} className="p-4">
              <div className="mb-1 flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full ${
                    i.severity === 'critico' ? 'bg-rose-500' : i.severity === 'atencao' ? 'bg-amber-500' : 'bg-sky-500'
                  }`}
                />
                <p className="text-sm font-medium text-slate-900 dark:text-white">{i.title}</p>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">{i.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
