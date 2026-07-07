import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { TrendingUp, TrendingDown, Wallet, AlertCircle } from 'lucide-react'
import { api, createEntity } from '../../services/api'
import { Card, PageHeader, StatTile, Badge, ProgressBar, TableWrap, Th, Td, Loading, Tabs, cn } from '../../components/ui'
import { financeBadge, brl, dateBR } from '../../lib/format'
import type { ID } from '../../types'

type ViewTab = 'visao-geral' | 'consumo' | 'ajuste-horas' | 'reclassificacao'

export function FinanceiroPage() {
  const [view, setView] = useState<ViewTab>('visao-geral')
  const finance = useQuery({ queryKey: ['finance'], queryFn: api.getFinance })
  const projects = useQuery({ queryKey: ['projects'], queryFn: api.getProjects })
  const consumption = useQuery({ queryKey: ['consumption'], queryFn: api.getConsumption })
  const hourAdjustments = useQuery({ queryKey: ['hourAdjustments'], queryFn: api.getHourAdjustments })
  const reclassifications = useQuery({ queryKey: ['reclassifications'], queryFn: api.getReclassifications })

  const [adjForm, setAdjForm] = useState({ projectId: '', hours: '', reason: '' })
  const [reclassForm, setReclassForm] = useState({ fromProjectId: '', toProjectId: '', hours: '', reason: '' })
  const [formError, setFormError] = useState('')
  const queryClient = useQueryClient()

  if (finance.isLoading) return <Loading />

  const rows = finance.data ?? []
  const projectOf = (id: string) => projects.data?.find((p) => p.id === id)?.name ?? '—'
  const receita = rows.filter((r) => r.type === 'receita')
  const despesa = rows.filter((r) => r.type === 'despesa')
  const recebido = receita.filter((r) => r.status === 'pago').reduce((s, r) => s + r.amount, 0)
  const previsto = receita.filter((r) => r.status !== 'pago').reduce((s, r) => s + r.amount, 0)
  const gastos = despesa.reduce((s, r) => s + r.amount, 0)
  const atrasado = rows.filter((r) => r.status === 'atrasado').reduce((s, r) => s + r.amount, 0)

  const adjustmentList = hourAdjustments.data ?? []
  const reclassList = reclassifications.data ?? []

  const submitAdjustment = async () => {
    if (!adjForm.projectId || !adjForm.hours || !adjForm.reason.trim()) {
      setFormError('Preencha projeto, horas e motivo.')
      return
    }
    setFormError('')
    await createEntity('hour-adjustments', {
      id: `ha-${Date.now()}`,
      projectId: adjForm.projectId,
      hours: Number(adjForm.hours),
      reason: adjForm.reason.trim(),
      date: new Date().toISOString().slice(0, 10),
    })
    await queryClient.invalidateQueries({ queryKey: ['hourAdjustments'] })
    setAdjForm({ projectId: '', hours: '', reason: '' })
  }

  const submitReclass = async () => {
    if (!reclassForm.fromProjectId || !reclassForm.toProjectId || !reclassForm.hours || !reclassForm.reason.trim()) {
      setFormError('Preencha origem, destino, horas e motivo.')
      return
    }
    if (reclassForm.fromProjectId === reclassForm.toProjectId) {
      setFormError('Origem e destino não podem ser o mesmo projeto.')
      return
    }
    setFormError('')
    try {
      // REGRA-004 também é validada no backend (400 → mensagem no form).
      await createEntity('reclassifications', {
        id: `rc-${Date.now()}`,
        fromProjectId: reclassForm.fromProjectId,
        toProjectId: reclassForm.toProjectId,
        hours: Number(reclassForm.hours),
        reason: reclassForm.reason.trim(),
        date: new Date().toISOString().slice(0, 10),
      })
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Erro ao reclassificar')
      return
    }
    await queryClient.invalidateQueries({ queryKey: ['reclassifications'] })
    setReclassForm({ fromProjectId: '', toProjectId: '', hours: '', reason: '' })
  }

  return (
    <div>
      <PageHeader title="Financeiro" subtitle="Receitas, despesas, consumo e ajustes por projeto" />

      <Tabs
        tabs={[
          { id: 'visao-geral', label: 'Visão geral' },
          { id: 'consumo', label: 'Consumo' },
          { id: 'ajuste-horas', label: 'Ajuste de horas' },
          { id: 'reclassificacao', label: 'Reclassificação' },
        ]}
        active={view}
        onChange={setView}
      />

      {view === 'visao-geral' && (
        <>
          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatTile label="Recebido" value={brl(recebido)} icon={<TrendingUp />} accent="text-emerald-500" />
            <StatTile label="A receber" value={brl(previsto)} icon={<Wallet />} accent="text-indigo-500" />
            <StatTile label="Despesas" value={brl(gastos)} icon={<TrendingDown />} accent="text-rose-500" />
            <StatTile label="Em atraso" value={brl(atrasado)} icon={<AlertCircle />} accent="text-amber-500" />
          </div>

          <TableWrap>
            <thead>
              <tr>
                <Th>Descrição</Th>
                <Th>Projeto</Th>
                <Th>Tipo</Th>
                <Th>Valor</Th>
                <Th>Vencimento</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const st = financeBadge[r.status]
                return (
                  <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <Td className="font-medium text-slate-900 dark:text-white">{r.description}</Td>
                    <Td>{projectOf(r.projectId)}</Td>
                    <Td>
                      <span className={cn('text-xs font-medium', r.type === 'receita' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400')}>
                        {r.type === 'receita' ? 'Receita' : 'Despesa'}
                      </span>
                    </Td>
                    <Td className="font-medium">{brl(r.amount)}</Td>
                    <Td className="whitespace-nowrap text-xs text-slate-500">{dateBR(r.dueDate)}</Td>
                    <Td><Badge className={st.className}>{st.label}</Badge></Td>
                  </tr>
                )
              })}
            </tbody>
          </TableWrap>
        </>
      )}

      {view === 'consumo' && (
        <TableWrap>
          <thead><tr><Th>Projeto</Th><Th>Contratado</Th><Th>Consumido</Th><Th>Progresso</Th></tr></thead>
          <tbody>
            {(consumption.data ?? []).map((c) => {
              const pct = Math.round((c.consumedHours / c.contractedHours) * 100)
              return (
                <tr key={c.projectId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <Td className="font-medium text-slate-900 dark:text-white">{projectOf(c.projectId)}</Td>
                  <Td>{c.contractedHours}h</Td>
                  <Td>{c.consumedHours}h</Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      <ProgressBar value={pct} className="w-32" />
                      <span className="text-xs text-slate-500">{pct}%</span>
                    </div>
                  </Td>
                </tr>
              )
            })}
          </tbody>
        </TableWrap>
      )}

      {view === 'ajuste-horas' && (
        <div>
          <Card className="mb-4 grid grid-cols-1 gap-2 p-3 md:grid-cols-4">
            <select
              value={adjForm.projectId}
              onChange={(e) => setAdjForm((f) => ({ ...f, projectId: e.target.value }))}
              className="rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
            >
              <option value="">Projeto…</option>
              {(projects.data ?? []).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <input
              type="number"
              placeholder="Horas (+/-)"
              value={adjForm.hours}
              onChange={(e) => setAdjForm((f) => ({ ...f, hours: e.target.value }))}
              className="rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
            />
            <input
              placeholder="Motivo"
              value={adjForm.reason}
              onChange={(e) => setAdjForm((f) => ({ ...f, reason: e.target.value }))}
              className="rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm dark:border-slate-700 md:col-span-1"
            />
            <button onClick={submitAdjustment} className="rounded-lg bg-indigo-500 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-600">
              Lançar ajuste
            </button>
          </Card>
          {formError && <p className="mb-3 text-sm text-rose-500">{formError}</p>}
          <TableWrap>
            <thead><tr><Th>Projeto</Th><Th>Horas</Th><Th>Motivo</Th><Th>Data</Th></tr></thead>
            <tbody>
              {adjustmentList.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <Td className="font-medium text-slate-900 dark:text-white">{projectOf(a.projectId)}</Td>
                  <Td className={a.hours < 0 ? 'text-rose-500' : 'text-emerald-500'}>{a.hours > 0 ? `+${a.hours}` : a.hours}h</Td>
                  <Td>{a.reason}</Td>
                  <Td className="whitespace-nowrap text-xs text-slate-500">{dateBR(a.date)}</Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        </div>
      )}

      {view === 'reclassificacao' && (
        <div>
          <Card className="mb-4 grid grid-cols-1 gap-2 p-3 md:grid-cols-5">
            <select
              value={reclassForm.fromProjectId}
              onChange={(e) => setReclassForm((f) => ({ ...f, fromProjectId: e.target.value }))}
              className="rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
            >
              <option value="">Origem…</option>
              {(projects.data ?? []).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <select
              value={reclassForm.toProjectId}
              onChange={(e) => setReclassForm((f) => ({ ...f, toProjectId: e.target.value }))}
              className="rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
            >
              <option value="">Destino…</option>
              {(projects.data ?? []).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <input
              type="number"
              placeholder="Horas"
              value={reclassForm.hours}
              onChange={(e) => setReclassForm((f) => ({ ...f, hours: e.target.value }))}
              className="rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
            />
            <input
              placeholder="Motivo"
              value={reclassForm.reason}
              onChange={(e) => setReclassForm((f) => ({ ...f, reason: e.target.value }))}
              className="rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
            />
            <button onClick={submitReclass} className="rounded-lg bg-indigo-500 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-600">
              Reclassificar
            </button>
          </Card>
          {formError && <p className="mb-3 text-sm text-rose-500">{formError}</p>}
          <TableWrap>
            <thead><tr><Th>Origem</Th><Th>Destino</Th><Th>Horas</Th><Th>Motivo</Th><Th>Data</Th></tr></thead>
            <tbody>
              {reclassList.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <Td className="font-medium text-slate-900 dark:text-white">{projectOf(r.fromProjectId)}</Td>
                  <Td className="font-medium text-slate-900 dark:text-white">{projectOf(r.toProjectId)}</Td>
                  <Td>{r.hours}h</Td>
                  <Td>{r.reason}</Td>
                  <Td className="whitespace-nowrap text-xs text-slate-500">{dateBR(r.date)}</Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        </div>
      )}
    </div>
  )
}
