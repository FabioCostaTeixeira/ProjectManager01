import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Eye, Clock, Newspaper, Tags, FileText } from 'lucide-react'
import { api } from '../../services/api'
import { Card, PageHeader, StatTile, Loading } from '../../components/ui'

// Sem integração real de analytics ainda — gera métricas de exemplo,
// deterministas por entregável (mesmo id => mesmos números sempre),
// só pra ter a tela pronta pro dia em que houver dado real.
function seededRandom(seed: string) {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0
  return () => {
    h = (Math.imul(h ^ (h >>> 15), 1 | h) + 0x6d2b79f5) | 0
    let t = Math.imul(h ^ (h >>> 7), 61 | h)
    t = (t ^ (t + Math.imul(t ^ (t >>> 7), 61 | t))) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function buildMetrics(deliverableId: string) {
  const rand = seededRandom(deliverableId)
  const base = 400 + Math.floor(rand() * 900)
  const days = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (13 - i))
    const weekend = d.getDay() === 0 || d.getDay() === 6
    const noise = 1 + (rand() - 0.5) * 0.5
    const views = Math.round(base * (weekend ? 0.55 : 1) * noise)
    return { date: d.toISOString().slice(0, 10), views }
  })
  const horas = ['09h', '11h', '14h', '16h', '19h', '21h']
  return {
    days,
    picoHorario: horas[Math.floor(rand() * horas.length)],
    noticias: 20 + Math.floor(rand() * 60),
    categorias: 4 + Math.floor(rand() * 10),
    materias: 80 + Math.floor(rand() * 300),
  }
}

const weekdayShort = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']

function BarChart({ days }: { days: { date: string; views: number }[] }) {
  const [hovered, setHovered] = useState<number | null>(null)
  const max = Math.max(...days.map((d) => d.views), 1)
  return (
    <div>
      <div className="flex h-40 items-end gap-1.5">
        {days.map((d, i) => {
          const h = Math.max(4, Math.round((d.views / max) * 100))
          const dow = weekdayShort[new Date(d.date).getDay()]
          return (
            <div key={d.date} className="relative flex flex-1 flex-col items-center justify-end">
              {hovered === i && (
                <div className="absolute -top-9 z-10 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[11px] font-medium text-white shadow-lg dark:bg-slate-100 dark:text-slate-900">
                  {d.views.toLocaleString('pt-BR')} · {dow} {d.date.slice(8, 10)}/{d.date.slice(5, 7)}
                </div>
              )}
              <div
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered((v) => (v === i ? null : v))}
                style={{ height: `${h}%` }}
                className="w-full min-w-[6px] cursor-default rounded-t bg-indigo-500 transition-colors hover:bg-indigo-600 dark:bg-indigo-400 dark:hover:bg-indigo-300"
              />
            </div>
          )
        })}
      </div>
      <div className="mt-1.5 flex gap-1.5">
        {days.map((d) => (
          <div key={d.date} className="flex-1 text-center text-[10px] text-slate-400">
            {weekdayShort[new Date(d.date).getDay()]}
          </div>
        ))}
      </div>
    </div>
  )
}

export function PortalMetricasPage() {
  const { id } = useParams()
  const deliverables = useQuery({ queryKey: ['deliverables'], queryFn: api.getDeliverables })
  const projects = useQuery({ queryKey: ['projects'], queryFn: api.getProjects })
  if (deliverables.isLoading) return <Loading />

  const d = deliverables.data?.find((x) => x.id === id)
  if (!d) return <div className="text-sm text-slate-500">Entregável não encontrado. <Link to="/entregaveis" className="text-indigo-500">Voltar</Link></div>

  const project = projects.data?.find((p) => p.id === d.projectId)
  const metrics = buildMetrics(d.id)
  const totalViews = metrics.days.reduce((s, x) => s + x.views, 0)

  return (
    <div>
      <Link to={`/projetos/${d.projectId}?entregavel=${d.id}`} className="mb-3 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-500">
        <ArrowLeft size={15} /> {project?.name ?? 'Projeto'}
      </Link>
      <PageHeader title={`Métricas — ${d.name}`} subtitle="Dados de exemplo — conectar analytics real do portal para números de verdade" />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Acessos (14 dias)" value={totalViews.toLocaleString('pt-BR')} icon={<Eye />} accent="text-indigo-500" />
        <StatTile label="Pico de acesso" value={metrics.picoHorario} icon={<Clock />} accent="text-amber-500" />
        <StatTile label="Notícias" value={metrics.noticias} icon={<Newspaper />} accent="text-sky-500" />
        <StatTile label="Categorias" value={metrics.categorias} icon={<Tags />} accent="text-violet-500" />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <StatTile label="Total de matérias" value={metrics.materias} icon={<FileText />} accent="text-emerald-500" />
      </div>

      <Card className="p-4">
        <h2 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">Acessos por dia (últimos 14 dias)</h2>
        <BarChart days={metrics.days} />
      </Card>
    </div>
  )
}
