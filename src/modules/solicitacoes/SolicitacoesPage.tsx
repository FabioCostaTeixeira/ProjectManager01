import { useQuery } from '@tanstack/react-query'
import { api } from '../../services/api'
import { PageHeader, Badge, TableWrap, Th, Td, Loading } from '../../components/ui'
import { requestBadge, dateBR } from '../../lib/format'

export function SolicitacoesPage() {
  const { data, isLoading } = useQuery({ queryKey: ['requests'], queryFn: api.getServiceRequests })
  if (isLoading) return <Loading />

  return (
    <div>
      <PageHeader title="Solicitações" subtitle="Pedidos do cliente em levantamento até virarem demanda" />
      <TableWrap>
        <thead>
          <tr>
            <Th>Solicitação</Th>
            <Th>Cliente</Th>
            <Th>Premissas</Th>
            <Th>Status</Th>
            <Th>Criada em</Th>
          </tr>
        </thead>
        <tbody>
          {(data ?? []).map((r) => {
            const st = requestBadge[r.status]
            return (
              <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <Td className="font-medium text-slate-900 dark:text-white">{r.title}</Td>
                <Td>{r.client}</Td>
                <Td className="max-w-xs text-xs text-slate-500">{r.premissas || '—'}</Td>
                <Td><Badge className={st.className}>{st.label}</Badge></Td>
                <Td className="whitespace-nowrap text-xs text-slate-500">{dateBR(r.createdAt)}</Td>
              </tr>
            )
          })}
        </tbody>
      </TableWrap>
    </div>
  )
}
