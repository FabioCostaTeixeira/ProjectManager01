import { useQuery } from '@tanstack/react-query'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { api } from '../../services/api'
import { Card, PageHeader, StatTile, Badge, ProgressBar, Avatar, TableWrap, Th, Td, Loading } from '../../components/ui'
import { projectStatusBadge, priorityBadge, taskStatusLabel, deliverableBadge, healthDot, brl, dateBR } from '../../lib/format'

export function ProjetoDetalhePage() {
  const { id } = useParams()
  const projects = useQuery({ queryKey: ['projects'], queryFn: api.getProjects })
  const tasks = useQuery({ queryKey: ['tasks'], queryFn: api.getTasks })
  const deliverables = useQuery({ queryKey: ['deliverables'], queryFn: api.getDeliverables })
  const users = useQuery({ queryKey: ['users'], queryFn: api.getUsers })
  const finance = useQuery({ queryKey: ['finance'], queryFn: api.getFinance })

  if (projects.isLoading) return <Loading />
  const p = projects.data?.find((x) => x.id === id)
  if (!p) return <div className="text-sm text-slate-500">Projeto não encontrado. <Link to="/projetos" className="text-indigo-500">Voltar</Link></div>

  const st = projectStatusBadge[p.status]
  const owner = users.data?.find((u) => u.id === p.ownerId)
  const pTasks = tasks.data?.filter((t) => t.projectId === p.id) ?? []
  const pDels = deliverables.data?.filter((d) => d.projectId === p.id) ?? []
  const pFin = finance.data?.filter((f) => f.projectId === p.id) ?? []
  const userOf = (uid: string) => users.data?.find((u) => u.id === uid)

  return (
    <div>
      <Link to="/projetos" className="mb-3 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-500">
        <ArrowLeft size={15} /> Projetos
      </Link>
      <PageHeader
        title={p.name}
        subtitle={`${p.client} · Responsável: ${owner?.name ?? '—'}`}
        actions={<Badge className={st.className}>{st.label}</Badge>}
      />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Progresso" value={`${p.progress}%`} />
        <StatTile label="Orçamento" value={brl(p.budget)} />
        <StatTile label="Consumido" value={brl(p.spent)} accent={p.spent > p.budget ? 'text-rose-500' : 'text-emerald-500'} />
        <StatTile label="Prazo" value={dateBR(p.endDate)} />
      </div>

      <Card className="mb-6 p-4">
        <div className="mb-2 flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${healthDot[p.health]}`} />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Saúde do projeto</span>
        </div>
        <ProgressBar value={p.progress} />
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">Tarefas ({pTasks.length})</h2>
          <TableWrap>
            <thead><tr><Th>Tarefa</Th><Th>Status</Th><Th>Prioridade</Th><Th>Resp.</Th></tr></thead>
            <tbody>
              {pTasks.map((t) => {
                const u = userOf(t.assigneeId)
                return (
                  <tr key={t.id}>
                    <Td className="font-medium text-slate-900 dark:text-white">{t.title}</Td>
                    <Td className="text-xs">{taskStatusLabel[t.status]}</Td>
                    <Td><Badge className={priorityBadge[t.priority].className}>{priorityBadge[t.priority].label}</Badge></Td>
                    <Td>{u && <Avatar name={u.name} color={u.color} size={24} />}</Td>
                  </tr>
                )
              })}
            </tbody>
          </TableWrap>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">Entregáveis ({pDels.length})</h2>
          <TableWrap>
            <thead><tr><Th>Entregável</Th><Th>Status</Th><Th>Prazo</Th></tr></thead>
            <tbody>
              {pDels.map((d) => (
                <tr key={d.id}>
                  <Td className="font-medium text-slate-900 dark:text-white">{d.name}</Td>
                  <Td><Badge className={deliverableBadge[d.status].className}>{deliverableBadge[d.status].label}</Badge></Td>
                  <Td className="whitespace-nowrap text-xs text-slate-500">{dateBR(d.dueDate)}</Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>

          {pFin.length > 0 && (
            <>
              <h2 className="mb-3 mt-6 text-sm font-semibold text-slate-900 dark:text-white">Financeiro</h2>
              <TableWrap>
                <thead><tr><Th>Descrição</Th><Th>Valor</Th></tr></thead>
                <tbody>
                  {pFin.map((f) => (
                    <tr key={f.id}>
                      <Td>{f.description}</Td>
                      <Td className="font-medium">{brl(f.amount)}</Td>
                    </tr>
                  ))}
                </tbody>
              </TableWrap>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
