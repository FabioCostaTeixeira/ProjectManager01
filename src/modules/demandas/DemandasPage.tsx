import { useQuery } from '@tanstack/react-query'
import { api } from '../../services/api'
import { PageHeader, Badge, TableWrap, Th, Td, Loading } from '../../components/ui'
import { demandBadge, priorityBadge, dateBR } from '../../lib/format'

export function DemandasPage() {
  const { data, isLoading } = useQuery({ queryKey: ['demands'], queryFn: api.getDemands })
  if (isLoading) return <Loading />

  return (
    <div>
      <PageHeader title="Demandas" subtitle="Solicitações recebidas e seu andamento" />
      <TableWrap>
        <thead>
          <tr>
            <Th>Demanda</Th>
            <Th>Solicitante</Th>
            <Th>Área</Th>
            <Th>Prioridade</Th>
            <Th>Status</Th>
            <Th>Criada em</Th>
          </tr>
        </thead>
        <tbody>
          {(data ?? []).map((d) => {
            const st = demandBadge[d.status]
            const pr = priorityBadge[d.priority]
            return (
              <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <Td className="font-medium text-slate-900 dark:text-white">{d.title}</Td>
                <Td>{d.requester}</Td>
                <Td>{d.area}</Td>
                <Td><Badge className={pr.className}>{pr.label}</Badge></Td>
                <Td><Badge className={st.className}>{st.label}</Badge></Td>
                <Td className="whitespace-nowrap text-xs text-slate-500">{dateBR(d.createdAt)}</Td>
              </tr>
            )
          })}
        </tbody>
      </TableWrap>
    </div>
  )
}
