import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api, createEntity } from '../../services/api'
import { Card, PageHeader, Avatar, Badge, TableWrap, Th, Td, Loading, Tabs, cn } from '../../components/ui'
import { dateBR } from '../../lib/format'
import type { Holiday } from '../../types'

type ViewTab = 'alocacao' | 'timeline' | 'jornadas' | 'ferias' | 'feriados'

// Semanas mock consideradas na Timeline (ISO de segunda-feira).
const TIMELINE_WEEKS = ['2026-07-06', '2026-07-13', '2026-07-20', '2026-07-27']

const NATIONAL_HOLIDAYS_SEED: Holiday[] = [
  { id: 'nat1', date: '2026-01-01', name: 'Confraternização Universal', national: true },
  { id: 'nat2', date: '2026-04-21', name: 'Tiradentes', national: true },
  { id: 'nat3', date: '2026-05-01', name: 'Dia do Trabalho', national: true },
  { id: 'nat4', date: '2026-12-25', name: 'Natal', national: true },
]

export function CapacidadePage() {
  const [view, setView] = useState<ViewTab>('alocacao')
  const capacity = useQuery({ queryKey: ['capacity'], queryFn: api.getCapacity })
  const users = useQuery({ queryKey: ['users'], queryFn: api.getUsers })
  const workSchedules = useQuery({ queryKey: ['workSchedules'], queryFn: api.getWorkSchedules })
  const vacations = useQuery({ queryKey: ['vacations'], queryFn: api.getVacations })
  const holidaysQuery = useQuery({ queryKey: ['holidays'], queryFn: api.getHolidays })
  const queryClient = useQueryClient()

  if (capacity.isLoading) return <Loading />

  const userOf = (id: string) => users.data?.find((u) => u.id === id)
  const holidays = holidaysQuery.data ?? []

  const isOnVacation = (userId: string, weekStart: string) =>
    (vacations.data ?? []).some((v) => v.userId === userId && weekStart >= v.startDate && weekStart <= v.endDate)

  const importNationalHolidays = async () => {
    const existingDates = new Set(holidays.map((h) => h.date))
    const missing = NATIONAL_HOLIDAYS_SEED.filter((h) => !existingDates.has(h.date))
    await Promise.all(missing.map((h) => createEntity('holidays', h)))
    await queryClient.invalidateQueries({ queryKey: ['holidays'] })
  }

  return (
    <div>
      <PageHeader title="Capacidade" subtitle="Alocação, timeline e disponibilidade da equipe" />

      <Tabs
        tabs={[
          { id: 'alocacao', label: 'Alocação' },
          { id: 'timeline', label: 'Timeline' },
          { id: 'jornadas', label: 'Jornadas' },
          { id: 'ferias', label: 'Férias' },
          { id: 'feriados', label: 'Feriados' },
        ]}
        active={view}
        onChange={setView}
      />

      {view === 'alocacao' && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {(capacity.data ?? []).map((c) => {
            const u = userOf(c.userId)
            const ratio = c.allocatedHours / c.availableHours
            const over = ratio > 1
            const width = Math.min(100, ratio * 100)
            return (
              <Card key={c.userId} className="p-4">
                <div className="flex items-center gap-3">
                  {u && <Avatar name={u.name} color={u.color} size={38} />}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{u?.name}</p>
                    <p className="text-xs text-slate-400">{u?.role} · {c.activeProjects} projetos</p>
                  </div>
                  {over ? (
                    <Badge className="bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400">Sobrealocado</Badge>
                  ) : (
                    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">OK</Badge>
                  )}
                </div>
                <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                  <div
                    className={cn('h-full rounded-full', over ? 'bg-rose-500' : ratio > 0.85 ? 'bg-amber-500' : 'bg-emerald-500')}
                    style={{ width: `${width}%` }}
                  />
                </div>
                <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                  {c.allocatedHours}h alocadas de {c.availableHours}h disponíveis
                </p>
              </Card>
            )
          })}
        </div>
      )}

      {view === 'timeline' && (
        <TableWrap>
          <thead>
            <tr>
              <Th>Pessoa</Th>
              {TIMELINE_WEEKS.map((w) => <Th key={w}>{dateBR(w)}</Th>)}
            </tr>
          </thead>
          <tbody>
            {(capacity.data ?? []).map((c) => {
              const u = userOf(c.userId)
              return (
                <tr key={c.userId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <Td className="font-medium text-slate-900 dark:text-white">{u?.name}</Td>
                  {TIMELINE_WEEKS.map((w) => {
                    const onVacation = isOnVacation(c.userId, w)
                    const ratio = onVacation ? 0 : c.allocatedHours / c.availableHours
                    const over = ratio > 1
                    return (
                      <Td key={w}>
                        {onVacation ? (
                          <Badge className="bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">Férias</Badge>
                        ) : (
                          <div className="h-2.5 w-24 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                            <div
                              className={cn('h-full rounded-full', over ? 'bg-rose-500' : ratio > 0.85 ? 'bg-amber-500' : 'bg-emerald-500')}
                              style={{ width: `${Math.min(100, ratio * 100)}%` }}
                            />
                          </div>
                        )}
                      </Td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </TableWrap>
      )}

      {view === 'jornadas' && (
        <TableWrap>
          <thead><tr><Th>Pessoa</Th><Th>Horas/semana</Th></tr></thead>
          <tbody>
            {(workSchedules.data ?? []).map((w) => {
              const u = userOf(w.userId)
              return (
                <tr key={w.userId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <Td className="font-medium text-slate-900 dark:text-white">{u?.name}</Td>
                  <Td>{w.hoursPerWeek}h</Td>
                </tr>
              )
            })}
          </tbody>
        </TableWrap>
      )}

      {view === 'ferias' && (
        <TableWrap>
          <thead><tr><Th>Pessoa</Th><Th>Início</Th><Th>Fim</Th></tr></thead>
          <tbody>
            {(vacations.data ?? []).map((v) => {
              const u = userOf(v.userId)
              return (
                <tr key={v.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <Td className="font-medium text-slate-900 dark:text-white">{u?.name}</Td>
                  <Td>{dateBR(v.startDate)}</Td>
                  <Td>{dateBR(v.endDate)}</Td>
                </tr>
              )
            })}
          </tbody>
        </TableWrap>
      )}

      {view === 'feriados' && (
        <div>
          <div className="mb-4 flex justify-end">
            <button
              onClick={importNationalHolidays}
              className="rounded-lg bg-indigo-500 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-600"
            >
              Importar nacionais
            </button>
          </div>
          <TableWrap>
            <thead><tr><Th>Data</Th><Th>Nome</Th><Th>Nacional</Th></tr></thead>
            <tbody>
              {holidays.map((h) => (
                <tr key={h.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <Td>{dateBR(h.date)}</Td>
                  <Td className="font-medium text-slate-900 dark:text-white">{h.name}</Td>
                  <Td>
                    {h.national ? (
                      <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">Sim</Badge>
                    ) : (
                      <Badge className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">Não</Badge>
                    )}
                  </Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        </div>
      )}
    </div>
  )
}
