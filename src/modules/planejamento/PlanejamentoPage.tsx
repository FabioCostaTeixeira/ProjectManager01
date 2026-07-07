import { useQuery } from '@tanstack/react-query'
import { api } from '../../services/api'
import { PageHeader, StatTile, Badge, TableWrap, Th, Td, Loading } from '../../components/ui'

export function PlanejamentoPage() {
  const { data, isLoading } = useQuery({ queryKey: ['planning'], queryFn: api.getPlanning })
  const { data: projects } = useQuery({ queryKey: ['projects'], queryFn: api.getProjects })
  if (isLoading) return <Loading />

  const rows = data ?? []
  const projectOf = (id: string) => projects?.find((p) => p.id === id)?.name ?? '—'
  const semDemanda = rows.filter((r) => !r.hasDemand).length
  const esforcoTotal = rows.reduce((s, r) => s + r.esforco, 0)

  return (
    <div>
      <PageHeader title="Planejamento" subtitle="Entregáveis e demandas a lançar no cronograma" />

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3">
        <StatTile label="Itens" value={rows.length} />
        <StatTile label="Sem demanda vinculada" value={semDemanda} accent="text-amber-500" />
        <StatTile label="Esforço estimado" value={`${esforcoTotal}h`} accent="text-indigo-500" />
      </div>

      <TableWrap>
        <thead>
          <tr>
            <Th>Item</Th>
            <Th>Projeto</Th>
            <Th>Tipo</Th>
            <Th>Demanda?</Th>
            <Th>Esforço</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
              <Td className="font-medium text-slate-900 dark:text-white">{r.name}</Td>
              <Td>{projectOf(r.projectId)}</Td>
              <Td className="capitalize">{r.kind}</Td>
              <Td>
                {r.hasDemand ? (
                  <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">Vinculada</Badge>
                ) : (
                  <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400">Pendente</Badge>
                )}
              </Td>
              <Td className="font-medium">{r.esforco}h</Td>
            </tr>
          ))}
        </tbody>
      </TableWrap>
    </div>
  )
}
