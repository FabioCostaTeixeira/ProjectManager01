import { useQuery } from '@tanstack/react-query'
import { api } from '../../services/api'
import { PageHeader, Badge, Avatar, TableWrap, Th, Td, Loading } from '../../components/ui'
import { deliverableBadge, dateBR } from '../../lib/format'

export function EntregaveisPage() {
  const { data, isLoading } = useQuery({ queryKey: ['deliverables'], queryFn: api.getDeliverables })
  const { data: projects } = useQuery({ queryKey: ['projects'], queryFn: api.getProjects })
  const { data: users } = useQuery({ queryKey: ['users'], queryFn: api.getUsers })
  if (isLoading) return <Loading />

  const projectOf = (id: string) => projects?.find((p) => p.id === id)?.name ?? '—'
  const userOf = (id: string) => users?.find((u) => u.id === id)

  return (
    <div>
      <PageHeader title="Entregáveis" subtitle="Produtos e marcos a entregar por projeto" />
      <TableWrap>
        <thead>
          <tr>
            <Th>Entregável</Th>
            <Th>Projeto</Th>
            <Th>Responsável</Th>
            <Th>Status</Th>
            <Th>Prazo</Th>
          </tr>
        </thead>
        <tbody>
          {(data ?? []).map((d) => {
            const st = deliverableBadge[d.status]
            const u = userOf(d.ownerId)
            return (
              <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <Td className="font-medium text-slate-900 dark:text-white">{d.name}</Td>
                <Td>{projectOf(d.projectId)}</Td>
                <Td>
                  {u && (
                    <span className="flex items-center gap-2">
                      <Avatar name={u.name} color={u.color} size={24} />
                      {u.name}
                    </span>
                  )}
                </Td>
                <Td><Badge className={st.className}>{st.label}</Badge></Td>
                <Td className="whitespace-nowrap text-xs text-slate-500">{dateBR(d.dueDate)}</Td>
              </tr>
            )
          })}
        </tbody>
      </TableWrap>
    </div>
  )
}
