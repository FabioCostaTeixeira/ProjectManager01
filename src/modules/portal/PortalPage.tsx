import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Globe, ExternalLink } from 'lucide-react'
import { api, createEntity } from '../../services/api'
import { Card, PageHeader, Badge, ProgressBar, StatTile, Loading, Tabs, TableWrap, Th, Td, Modal } from '../../components/ui'
import { projectStatusBadge, ticketBadge, requestBadge, financeBadge, brl, dateBR } from '../../lib/format'

type ViewTab = 'projetos' | 'chamados' | 'solicitacoes' | 'relatorio' | 'financeiro'
const PORTAL_CLIENT = 'Acme Corp'

interface NewTicket {
  subject: string
  category: string
  priority: string
  slaHours: number
}

// Simula a visão que o cliente teria de seus dados (leitura, exceto abrir chamado/solicitação).
export function PortalPage() {
  const [view, setView] = useState<ViewTab>('projetos')
  const projects = useQuery({ queryKey: ['projects'], queryFn: api.getProjects })
  const deliverables = useQuery({ queryKey: ['deliverables'], queryFn: api.getDeliverables })
  const tickets = useQuery({ queryKey: ['tickets'], queryFn: api.getTickets })
  const serviceRequests = useQuery({ queryKey: ['serviceRequests'], queryFn: api.getServiceRequests })
  const finance = useQuery({ queryKey: ['finance'], queryFn: api.getFinance })
  const [newTicket, setNewTicket] = useState<NewTicket>({ subject: '', category: 'Portal', priority: 'media', slaHours: 24 })
  const [showTicketModal, setShowTicketModal] = useState(false)
  const [newRequest, setNewRequest] = useState('')
  const queryClient = useQueryClient()

  if (projects.isLoading) return <Loading />

  const openTicket = async () => {
    if (!newTicket.subject.trim()) return
    await createEntity('tickets', {
      id: `tk-${Date.now()}`,
      subject: newTicket.subject.trim(),
      requester: PORTAL_CLIENT,
      category: newTicket.category,
      priority: newTicket.priority,
      status: 'aberto',
      slaHours: newTicket.slaHours,
      createdAt: new Date().toISOString().slice(0, 10),
    })
    await queryClient.invalidateQueries({ queryKey: ['tickets'] })
    setNewTicket({ subject: '', category: 'Portal', priority: 'media', slaHours: 24 })
    setShowTicketModal(false)
  }

  const openRequest = async () => {
    if (!newRequest.trim()) return
    await createEntity('service-requests', {
      id: `sr-${Date.now()}`,
      client: PORTAL_CLIENT,
      title: newRequest.trim(),
      status: 'nova',
      premissas: '',
      createdAt: new Date().toISOString().slice(0, 10),
    })
    await queryClient.invalidateQueries({ queryKey: ['serviceRequests'] })
    setNewRequest('')
  }

  const clientProjects = (projects.data ?? []).filter((p) => p.client === PORTAL_CLIENT)
  const projectIds = new Set(clientProjects.map((p) => p.id))
  const clientTickets = (tickets.data ?? []).filter((t) => t.requester === PORTAL_CLIENT)
  const clientRequests = (serviceRequests.data ?? []).filter((r) => r.client === PORTAL_CLIENT)
  const clientFinance = (finance.data ?? []).filter((f) => projectIds.has(f.projectId))

  const totalProgress = clientProjects.length
    ? Math.round(clientProjects.reduce((s, p) => s + p.progress, 0) / clientProjects.length)
    : 0

  return (
    <div>
      <PageHeader
        title="Portal do Cliente"
        subtitle={`Prévia da visão compartilhada com ${PORTAL_CLIENT}`}
        actions={
          <span className="inline-flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
            <Globe size={15} /> Visão pública
          </span>
        }
      />

      <Tabs
        tabs={[
          { id: 'projetos', label: 'Projetos' },
          { id: 'chamados', label: 'Chamados' },
          { id: 'solicitacoes', label: 'Solicitações' },
          { id: 'relatorio', label: 'Relatório' },
          { id: 'financeiro', label: 'Financeiro' },
        ]}
        active={view}
        onChange={setView}
      />

      {view === 'projetos' && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {clientProjects.map((p) => {
            const st = projectStatusBadge[p.status]
            const dels = (deliverables.data ?? []).filter((d) => d.projectId === p.id)
            return (
              <Card key={p.id} className="p-5">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white">{p.name}</h3>
                    <p className="text-xs text-slate-400">Entrega prevista: {dateBR(p.endDate)}</p>
                  </div>
                  <Badge className={st.className}>{st.label}</Badge>
                </div>
                <div className="mb-4 flex items-center gap-2">
                  <ProgressBar value={p.progress} />
                  <span className="text-xs font-medium text-slate-500">{p.progress}%</span>
                </div>
                {dels.length > 0 && (
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Entregáveis</p>
                    <ul className="space-y-1">
                      {dels.map((d) => (
                        <li key={d.id} className="flex items-center justify-between text-sm">
                          <span className="text-slate-600 dark:text-slate-300">{d.name}</span>
                          <span className="text-xs text-slate-400">{dateBR(d.dueDate)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <button className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400">
                  Ver detalhes <ExternalLink size={13} />
                </button>
              </Card>
            )
          })}
        </div>
      )}

      {view === 'chamados' && (
        <div>
          <Card className="mb-4 p-3">
            <button
              onClick={() => setShowTicketModal(true)}
              className="w-full rounded-lg bg-indigo-500 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-600"
            >
              Abrir chamado
            </button>
          </Card>
          <Modal
            open={showTicketModal}
            onClose={() => setShowTicketModal(false)}
            title="Novo chamado"
            footer={
              <>
                <button onClick={() => setShowTicketModal(false)} className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
                  Cancelar
                </button>
                <button onClick={openTicket} className="rounded-lg bg-indigo-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-600">
                  Abrir
                </button>
              </>
            }
          >
            <div className="space-y-3">
              <input
                value={newTicket.subject}
                onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                placeholder="Descrição do problema…"
                className="w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
              />
              <div className="grid grid-cols-3 gap-2">
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Categoria
                  <select
                    value={newTicket.category}
                    onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
                  >
                    <option value="Portal">Portal</option>
                    <option value="Suporte">Suporte</option>
                    <option value="Bug">Bug</option>
                    <option value="Feature Request">Feature Request</option>
                  </select>
                </label>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Prioridade
                  <select
                    value={newTicket.priority}
                    onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
                  >
                    <option value="baixa">Baixa</option>
                    <option value="media">Média</option>
                    <option value="alta">Alta</option>
                    <option value="critica">Crítica</option>
                  </select>
                </label>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  SLA (h)
                  <select
                    value={newTicket.slaHours}
                    onChange={(e) => setNewTicket({ ...newTicket, slaHours: Number(e.target.value) })}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
                  >
                    <option value="4">4h</option>
                    <option value="8">8h</option>
                    <option value="24">24h</option>
                    <option value="48">48h</option>
                    <option value="72">72h</option>
                  </select>
                </label>
              </div>
            </div>
          </Modal>
          <TableWrap>
            <thead><tr><Th>Assunto</Th><Th>Categoria</Th><Th>SLA</Th><Th>Status</Th></tr></thead>
            <tbody>
              {clientTickets.map((t) => {
                const st = ticketBadge[t.status]
                return (
                  <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <Td className="font-medium text-slate-900 dark:text-white">{t.subject}</Td>
                    <Td>{t.category}</Td>
                    <Td>{t.slaHours}h</Td>
                    <Td><Badge className={st.className}>{st.label}</Badge></Td>
                  </tr>
                )
              })}
            </tbody>
          </TableWrap>
        </div>
      )}

      {view === 'solicitacoes' && (
        <div>
          <Card className="mb-4 flex items-center gap-2 p-3">
            <input
              value={newRequest}
              onChange={(e) => setNewRequest(e.target.value)}
              placeholder="Título da solicitação…"
              className="flex-1 rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
            />
            <button
              onClick={openRequest}
              className="rounded-lg bg-indigo-500 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-600"
            >
              Abrir solicitação
            </button>
          </Card>
          <TableWrap>
            <thead><tr><Th>Título</Th><Th>Status</Th><Th>Criada em</Th></tr></thead>
            <tbody>
              {clientRequests.map((r) => {
                const st = requestBadge[r.status]
                return (
                  <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <Td className="font-medium text-slate-900 dark:text-white">{r.title}</Td>
                    <Td><Badge className={st.className}>{st.label}</Badge></Td>
                    <Td className="text-slate-400">{dateBR(r.createdAt)}</Td>
                  </tr>
                )
              })}
            </tbody>
          </TableWrap>
        </div>
      )}

      {view === 'relatorio' && (
        <div>
          <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3">
            <StatTile label="Progresso médio" value={`${totalProgress}%`} accent="text-indigo-500" />
            <StatTile label="Projetos ativos" value={clientProjects.length} accent="text-emerald-500" />
            <StatTile label="Entregáveis" value={(deliverables.data ?? []).filter((d) => projectIds.has(d.projectId)).length} accent="text-violet-500" />
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Resumo executivo consolidado dos projetos de {PORTAL_CLIENT}: progresso médio de {totalProgress}%
            em {clientProjects.length} projeto(s) ativos.
          </p>
        </div>
      )}

      {view === 'financeiro' && (
        <TableWrap>
          <thead><tr><Th>Descrição</Th><Th>Tipo</Th><Th>Valor</Th><Th>Vencimento</Th><Th>Status</Th></tr></thead>
          <tbody>
            {clientFinance.map((f) => {
              const st = financeBadge[f.status]
              return (
                <tr key={f.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <Td className="font-medium text-slate-900 dark:text-white">{f.description}</Td>
                  <Td className="capitalize">{f.type}</Td>
                  <Td className="font-medium">{brl(f.amount)}</Td>
                  <Td>{dateBR(f.dueDate)}</Td>
                  <Td><Badge className={st.className}>{st.label}</Badge></Td>
                </tr>
              )
            })}
            {clientFinance.length === 0 && (
              <tr><Td className="text-slate-400">Nenhum lançamento financeiro para {PORTAL_CLIENT}.</Td><Td>—</Td><Td>—</Td><Td>—</Td><Td>—</Td></tr>
            )}
          </tbody>
        </TableWrap>
      )}
    </div>
  )
}
