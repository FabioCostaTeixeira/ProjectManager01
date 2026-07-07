import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../services/api'
import { PageHeader, StatTile, Badge, TableWrap, Th, Td, Loading, Tabs } from '../../components/ui'
import { closingBadge, recurringStatusBadge, brl, monthBR } from '../../lib/format'

type ViewTab = 'competencias' | 'recorrencia'

export function FechamentoPage() {
  const { data, isLoading } = useQuery({ queryKey: ['closings'], queryFn: api.getClosings })
  const { data: clients } = useQuery({ queryKey: ['clients'], queryFn: api.getClients })
  const { data: recurring } = useQuery({ queryKey: ['recurringItems'], queryFn: api.getRecurringItems })
  const rows = data ?? []
  const competencias = useMemo(() => Array.from(new Set(rows.map((r) => r.competencia))).sort().reverse(), [rows])
  const [tab, setTab] = useState<string | null>(null)
  const active = tab ?? competencias[0]
  const [view, setView] = useState<ViewTab>('competencias')

  if (isLoading) return <Loading />

  const clientOf = (id: string) => clients?.find((c) => c.id === id)?.name ?? id
  const list = rows.filter((r) => r.competencia === active)
  const totalHoras = list.reduce((s, r) => s + r.hours, 0)
  const totalValor = list.reduce((s, r) => s + r.amount, 0)
  const liberados = list.filter((r) => r.status === 'liberado').length
  const incideNaCompetencia = (start: string, end: string | null) =>
    active >= start && (end === null || active <= end)

  return (
    <div>
      <PageHeader title="Fechamento" subtitle="Apuração de horas e valores por competência" />

      <Tabs
        tabs={[
          { id: 'competencias', label: 'Competências' },
          { id: 'recorrencia', label: 'Recorrência' },
        ]}
        active={view}
        onChange={setView}
      />

      {view === 'competencias' && (
        <>
          <div className="mb-4 flex flex-wrap gap-2">
            {competencias.map((c) => (
              <button
                key={c}
                onClick={() => setTab(c)}
                className={
                  active === c
                    ? 'rounded-full bg-indigo-500 px-4 py-1.5 text-sm font-medium text-white transition-colors'
                    : 'rounded-full bg-slate-100 px-4 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                }
              >
                {monthBR(c)}
              </button>
            ))}
          </div>

          <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3">
            <StatTile label="Horas apuradas" value={`${totalHoras}h`} />
            <StatTile label="Valor" value={brl(totalValor)} accent="text-emerald-500" />
            <StatTile label="Liberados" value={`${liberados}/${list.length}`} accent="text-violet-500" />
          </div>

          <TableWrap>
            <thead>
              <tr>
                <Th>Cliente</Th>
                <Th>Competência</Th>
                <Th>Horas</Th>
                <Th>Valor</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {list.map((r) => {
                const st = closingBadge[r.status]
                return (
                  <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <Td className="font-medium text-slate-900 dark:text-white">{clientOf(r.clientId)}</Td>
                    <Td>{monthBR(r.competencia)}</Td>
                    <Td>{r.hours}h</Td>
                    <Td className="font-medium">{brl(r.amount)}</Td>
                    <Td><Badge className={st.className}>{st.label}</Badge></Td>
                  </tr>
                )
              })}
            </tbody>
          </TableWrap>
        </>
      )}

      {view === 'recorrencia' && (
        <TableWrap>
          <thead>
            <tr>
              <Th>Cliente</Th>
              <Th>Descrição</Th>
              <Th>Valor</Th>
              <Th>Vigência</Th>
              <Th>Incide em {monthBR(active)}</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {(recurring ?? []).map((r) => {
              const st = recurringStatusBadge[r.status]
              const incide = r.status === 'ativo' && incideNaCompetencia(r.startCompetencia, r.endCompetencia)
              return (
                <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <Td className="font-medium text-slate-900 dark:text-white">{clientOf(r.clientId)}</Td>
                  <Td>{r.description}</Td>
                  <Td className="font-medium">{brl(r.amount)}</Td>
                  <Td>{monthBR(r.startCompetencia)} — {r.endCompetencia ? monthBR(r.endCompetencia) : 'atual'}</Td>
                  <Td>{incide ? <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">Sim</Badge> : <Badge className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">Não</Badge>}</Td>
                  <Td><Badge className={st.className}>{st.label}</Badge></Td>
                </tr>
              )
            })}
          </tbody>
        </TableWrap>
      )}
    </div>
  )
}
