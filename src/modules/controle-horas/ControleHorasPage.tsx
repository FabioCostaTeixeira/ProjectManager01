import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { api, createEntity } from '../../services/api'
import { PageHeader, Card, StatTile, Badge, TableWrap, Th, Td, Loading } from '../../components/ui'
import { dateBR } from '../../lib/format'

export function ControleHorasPage() {
  const { data, isLoading } = useQuery({ queryKey: ['time'], queryFn: api.getTimeEntries })
  const { data: projects } = useQuery({ queryKey: ['projects'], queryFn: api.getProjects })
  const { data: users } = useQuery({ queryKey: ['users'], queryFn: api.getUsers })
  const [form, setForm] = useState({ projectId: '', hours: '2', description: '' })
  const queryClient = useQueryClient()

  const all = data ?? []
  if (isLoading) return <Loading />

  const projectOf = (id: string) => projects?.find((p) => p.id === id)?.name ?? '—'
  const userOf = (id: string) => users?.find((u) => u.id === id)?.name ?? '—'
  const total = all.reduce((s, e) => s + e.hours, 0)
  const billable = all.filter((e) => e.billable).reduce((s, e) => s + e.hours, 0)

  const add = async (e: React.FormEvent) => {
    e.preventDefault()
    const hours = Number(form.hours)
    const projectId = form.projectId || projects?.[0]?.id
    if (!hours || hours <= 0 || !projectId) return
    await createEntity('time-entries', {
      id: `te-${Date.now()}`,
      userId: users?.[0]?.id ?? 'u1',
      projectId,
      date: new Date().toISOString().slice(0, 10),
      hours,
      description: form.description || 'Apontamento manual',
      billable: true,
    })
    await queryClient.invalidateQueries({ queryKey: ['time'] })
    setForm({ ...form, hours: '2', description: '' })
  }

  return (
    <div>
      <PageHeader title="Controle de Horas" subtitle="Apontamentos da equipe" />

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3">
        <StatTile label="Total apontado" value={`${total}h`} />
        <StatTile label="Faturável" value={`${billable}h`} accent="text-emerald-500" />
        <StatTile label="Apontamentos" value={all.length} accent="text-violet-500" />
      </div>

      <Card className="mb-6 p-4">
        <form onSubmit={add} className="flex flex-wrap items-end gap-3">
          <div className="min-w-[180px] flex-1">
            <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Projeto</label>
            <select
              value={form.projectId || projects?.[0]?.id || ''}
              onChange={(e) => setForm({ ...form, projectId: e.target.value })}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
            >
              {(projects ?? []).map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className="w-24">
            <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Horas</label>
            <input
              type="number"
              min="0.5"
              step="0.5"
              value={form.hours}
              onChange={(e) => setForm({ ...form, hours: e.target.value })}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
            />
          </div>
          <div className="min-w-[200px] flex-1">
            <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Descrição</label>
            <input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="O que foi feito"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-400"
          >
            <Plus size={16} /> Apontar
          </button>
        </form>
      </Card>

      <TableWrap>
        <thead>
          <tr>
            <Th>Data</Th>
            <Th>Colaborador</Th>
            <Th>Projeto</Th>
            <Th>Descrição</Th>
            <Th>Horas</Th>
            <Th>Faturável</Th>
          </tr>
        </thead>
        <tbody>
          {all.map((e) => (
            <tr key={e.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
              <Td className="whitespace-nowrap text-xs text-slate-500">{dateBR(e.date)}</Td>
              <Td>{userOf(e.userId)}</Td>
              <Td>{projectOf(e.projectId)}</Td>
              <Td>{e.description}</Td>
              <Td className="font-medium">{e.hours}h</Td>
              <Td>
                {e.billable ? (
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
  )
}
