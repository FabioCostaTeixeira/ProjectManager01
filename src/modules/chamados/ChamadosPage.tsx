import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api, updateEntity } from '../../services/api'
import { PageHeader, Badge, TableWrap, Th, Td, Loading, Tabs } from '../../components/ui'
import { ticketBadge, priorityBadge, dateBR } from '../../lib/format'
import type { SlaPolicy } from '../../types'

type ViewTab = 'chamados' | 'catalogo' | 'sla'

export function ChamadosPage() {
  const [view, setView] = useState<ViewTab>('chamados')
  const tickets = useQuery({ queryKey: ['tickets'], queryFn: api.getTickets })
  const ticketTypes = useQuery({ queryKey: ['ticketTypes'], queryFn: api.getTicketTypes })
  const slaPolicies = useQuery({ queryKey: ['slaPolicies'], queryFn: api.getSlaPolicies })
  const [localSla, setLocalSla] = useState<SlaPolicy[] | null>(null)
  const queryClient = useQueryClient()

  if (tickets.isLoading) return <Loading />

  const sla = localSla ?? slaPolicies.data ?? []

  const updateSla = (priority: SlaPolicy['priority'], field: 'responderH' | 'resolverH', value: number) => {
    const base = localSla ?? slaPolicies.data ?? []
    setLocalSla(base.map((s) => (s.priority === priority ? { ...s, [field]: value } : s)))
  }

  // Persiste a linha no blur do input (a digitação fica no state local).
  const saveSla = async (s: SlaPolicy) => {
    await updateEntity('sla-policies', s.priority, { responderH: s.responderH, resolverH: s.resolverH })
    await queryClient.invalidateQueries({ queryKey: ['slaPolicies'] })
    setLocalSla(null)
  }

  return (
    <div>
      <PageHeader title="Chamados" subtitle="Suporte e atendimento com SLA" />

      <Tabs
        tabs={[
          { id: 'chamados', label: 'Chamados' },
          { id: 'catalogo', label: 'Catálogo' },
          { id: 'sla', label: 'SLA' },
        ]}
        active={view}
        onChange={setView}
      />

      {view === 'chamados' && (
        <TableWrap>
          <thead>
            <tr>
              <Th>Assunto</Th>
              <Th>Solicitante</Th>
              <Th>Categoria</Th>
              <Th>Prioridade</Th>
              <Th>SLA</Th>
              <Th>Status</Th>
              <Th>Aberto em</Th>
            </tr>
          </thead>
          <tbody>
            {(tickets.data ?? []).map((c) => {
              const st = ticketBadge[c.status]
              const pr = priorityBadge[c.priority]
              return (
                <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <Td className="font-medium text-slate-900 dark:text-white">{c.subject}</Td>
                  <Td>{c.requester}</Td>
                  <Td>{c.category}</Td>
                  <Td><Badge className={pr.className}>{pr.label}</Badge></Td>
                  <Td className="whitespace-nowrap text-xs text-slate-500">{c.slaHours}h</Td>
                  <Td><Badge className={st.className}>{st.label}</Badge></Td>
                  <Td className="whitespace-nowrap text-xs text-slate-500">{dateBR(c.createdAt)}</Td>
                </tr>
              )
            })}
          </tbody>
        </TableWrap>
      )}

      {view === 'catalogo' && (
        <TableWrap>
          <thead><tr><Th>Tipo</Th><Th>Categoria</Th><Th>Prioridade padrão</Th></tr></thead>
          <tbody>
            {(ticketTypes.data ?? []).map((tt) => {
              const pr = priorityBadge[tt.defaultPriority]
              return (
                <tr key={tt.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <Td className="font-medium text-slate-900 dark:text-white">{tt.name}</Td>
                  <Td>{tt.category}</Td>
                  <Td><Badge className={pr.className}>{pr.label}</Badge></Td>
                </tr>
              )
            })}
          </tbody>
        </TableWrap>
      )}

      {view === 'sla' && (
        <TableWrap>
          <thead><tr><Th>Prioridade</Th><Th>Responder (h)</Th><Th>Resolver (h)</Th></tr></thead>
          <tbody>
            {sla.map((s) => {
              const pr = priorityBadge[s.priority]
              return (
                <tr key={s.priority} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <Td><Badge className={pr.className}>{pr.label}</Badge></Td>
                  <Td>
                    <input
                      type="number"
                      value={s.responderH}
                      onChange={(e) => updateSla(s.priority, 'responderH', Number(e.target.value))}
                      onBlur={() => saveSla(s)}
                      className="w-20 rounded-lg border border-slate-200 bg-transparent px-2 py-1 text-sm dark:border-slate-700"
                    />
                  </Td>
                  <Td>
                    <input
                      type="number"
                      value={s.resolverH}
                      onChange={(e) => updateSla(s.priority, 'resolverH', Number(e.target.value))}
                      onBlur={() => saveSla(s)}
                      className="w-20 rounded-lg border border-slate-200 bg-transparent px-2 py-1 text-sm dark:border-slate-700"
                    />
                  </Td>
                </tr>
              )
            })}
          </tbody>
        </TableWrap>
      )}
    </div>
  )
}
