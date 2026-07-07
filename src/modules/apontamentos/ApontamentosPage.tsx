import { useQuery } from '@tanstack/react-query'
import { api } from '../../services/api'
import { PageHeader, StatTile, Badge, Avatar, TableWrap, Th, Td, Loading } from '../../components/ui'
import { dateBR } from '../../lib/format'

export function ApontamentosPage() {
  const { data, isLoading } = useQuery({ queryKey: ['worklog'], queryFn: api.getWorklog })
  const { data: users } = useQuery({ queryKey: ['users'], queryFn: api.getUsers })
  const { data: projects } = useQuery({ queryKey: ['projects'], queryFn: api.getProjects })
  if (isLoading) return <Loading />

  const rows = data ?? []
  const userOf = (id: string) => users?.find((u) => u.id === id)
  const projectOf = (id: string | null) => (id ? projects?.find((p) => p.id === id)?.name ?? '—' : 'Avulso')
  const total = rows.reduce((s, r) => s + r.hours, 0)
  const avulso = rows.filter((r) => r.kind === 'avulso').reduce((s, r) => s + r.hours, 0)

  return (
    <div>
      <PageHeader title="Apontamentos" subtitle="Registro diário de horas (projeto e avulso)" />

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3">
        <StatTile label="Total no período" value={`${total}h`} />
        <StatTile label="Avulso" value={`${avulso}h`} accent="text-amber-500" />
        <StatTile label="Registros" value={rows.length} accent="text-violet-500" />
      </div>

      <TableWrap>
        <thead>
          <tr>
            <Th>Data</Th>
            <Th>Colaborador</Th>
            <Th>Projeto</Th>
            <Th>Tipo</Th>
            <Th>Descrição</Th>
            <Th>Horas</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const u = userOf(r.userId)
            return (
              <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <Td className="whitespace-nowrap text-xs text-slate-500">{dateBR(r.date)}</Td>
                <Td>
                  {u && (
                    <span className="flex items-center gap-2">
                      <Avatar name={u.name} color={u.color} size={24} /> {u.name}
                    </span>
                  )}
                </Td>
                <Td>{projectOf(r.projectId)}</Td>
                <Td>
                  {r.kind === 'avulso' ? (
                    <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400">Avulso</Badge>
                  ) : (
                    <Badge className="bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400">Projeto</Badge>
                  )}
                </Td>
                <Td>{r.description}</Td>
                <Td className="font-medium">{r.hours}h</Td>
              </tr>
            )
          })}
        </tbody>
      </TableWrap>
    </div>
  )
}
