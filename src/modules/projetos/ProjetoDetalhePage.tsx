import { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { ArrowLeft, Plus, Pencil, Trash2, ChevronDown, BarChart3 } from 'lucide-react'
import { api, createEntity, updateEntity, removeEntity } from '../../services/api'
import { Card, PageHeader, StatTile, Badge, ProgressBar, Avatar, TableWrap, Th, Td, Loading, Modal, Sheet, DateInput, cn } from '../../components/ui'
import { projectStatusBadge, priorityBadge, taskStatusLabel, deliverableBadge, healthDot, brl, dateBR } from '../../lib/format'
import type { Task, Deliverable, Priority, TaskStatus, DeliverableStatus, User } from '../../types'

const emptyTask = (entregableId: string): Task => ({
  id: `t-${Date.now()}`,
  entregableId,
  title: '',
  status: 'todo',
  priority: 'media',
  assigneeId: '',
  dueDate: new Date().toISOString().slice(0, 10),
  tags: [],
  description: '',
  checklist: [],
})

const emptyDeliverable = (projectId: string): Deliverable => ({
  id: `d-${Date.now()}`,
  projectId,
  name: '',
  status: 'pendente',
  ownerId: '',
  dueDate: new Date().toISOString().slice(0, 10),
})

const isNew = <T extends { id: string }>(items: T[] | undefined, id: string) => !items?.some((x) => x.id === id)

const priorityOrder: Record<Priority, number> = { critica: 0, alta: 1, media: 2, baixa: 3 }
type SortBy = 'prazo' | 'prioridade' | 'responsavel'

function TaskList({
  tasks,
  userOf,
  onSelect,
  onDelete,
}: {
  tasks: Task[]
  userOf: (id: string) => User | undefined
  onSelect: (t: Task) => void
  onDelete: (id: string) => void
}) {
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'todos'>('todos')
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'todas'>('todas')
  const [sortBy, setSortBy] = useState<SortBy>('prazo')

  if (tasks.length === 0) return <p className="text-xs text-slate-400">Sem tarefas</p>

  const filtered = tasks
    .filter((t) => statusFilter === 'todos' || t.status === statusFilter)
    .filter((t) => priorityFilter === 'todas' || t.priority === priorityFilter)
    .slice()
    .sort((a, b) => {
      if (sortBy === 'prioridade') return priorityOrder[a.priority] - priorityOrder[b.priority]
      if (sortBy === 'responsavel') return (userOf(a.assigneeId)?.name ?? '').localeCompare(userOf(b.assigneeId)?.name ?? '')
      return a.dueDate.localeCompare(b.dueDate)
    })

  const selectCls = 'rounded border border-slate-200 bg-transparent px-2 py-1 text-xs text-slate-900 dark:border-slate-700 dark:text-white'

  return (
    <>
      <div className="mb-2 flex flex-wrap gap-1.5">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as TaskStatus | 'todos')} className={selectCls}>
          <option value="todos">Status: todos</option>
          <option value="backlog">Backlog</option>
          <option value="todo">A fazer</option>
          <option value="doing">Fazendo</option>
          <option value="review">Revisão</option>
          <option value="done">Feito</option>
        </select>
        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value as Priority | 'todas')} className={selectCls}>
          <option value="todas">Prioridade: todas</option>
          <option value="baixa">Baixa</option>
          <option value="media">Média</option>
          <option value="alta">Alta</option>
          <option value="critica">Crítica</option>
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortBy)} className={selectCls}>
          <option value="prazo">Ordenar: prazo</option>
          <option value="prioridade">Ordenar: prioridade</option>
          <option value="responsavel">Ordenar: responsável</option>
        </select>
      </div>
      {filtered.length === 0 ? (
        <p className="text-xs text-slate-400">Nenhuma tarefa com esse filtro</p>
      ) : (
        <TableWrap>
          <thead><tr><Th>Tarefa</Th><Th>Status</Th><Th>Prioridade</Th><Th>Resp.</Th><Th>Prazo</Th><Th>Ações</Th></tr></thead>
          <tbody>
            {filtered.map((t) => {
              const u = userOf(t.assigneeId)
              return (
                <tr key={t.id} onClick={() => onSelect(t)} className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/60">
                  <Td className="font-medium text-slate-900 dark:text-white">{t.title}</Td>
                  <Td className="text-xs">{taskStatusLabel[t.status]}</Td>
                  <Td><Badge className={priorityBadge[t.priority].className}>{priorityBadge[t.priority].label}</Badge></Td>
                  <Td>{u && <Avatar name={u.name} color={u.color} size={20} />}</Td>
                  <Td className="text-xs text-slate-500">{dateBR(t.dueDate)}</Td>
                  <Td>
                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => onSelect(t)} title="Editar" className="rounded p-1 text-slate-400 hover:text-indigo-500">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => onDelete(t.id)} title="Excluir" className="rounded p-1 text-slate-400 hover:text-rose-500">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </Td>
                </tr>
              )
            })}
          </tbody>
        </TableWrap>
      )}
    </>
  )
}

export function ProjetoDetalhePage() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const focusDeliverable = searchParams.get('entregavel')
  const projects = useQuery({ queryKey: ['projects'], queryFn: api.getProjects })
  const tasks = useQuery({ queryKey: ['tasks'], queryFn: api.getTasks, refetchInterval: 4000 })
  const deliverables = useQuery({ queryKey: ['deliverables'], queryFn: api.getDeliverables })
  const users = useQuery({ queryKey: ['users'], queryFn: api.getUsers })
  const finance = useQuery({ queryKey: ['finance'], queryFn: api.getFinance })
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [editingDeliverable, setEditingDeliverable] = useState<Deliverable | null>(null)
  const [taskError, setTaskError] = useState<string | null>(null)
  const [checklistOpen, setChecklistOpen] = useState(false)
  const [newChecklistItem, setNewChecklistItem] = useState('')
  const [expandedDels, setExpandedDels] = useState<Set<string>>(new Set())
  const queryClient = useQueryClient()

  useEffect(() => {
    setTaskError(null)
    setNewChecklistItem('')
    if (editingTask) setChecklistOpen(editingTask.checklist.length > 0)
  }, [editingTask?.id])

  useEffect(() => {
    if (!focusDeliverable) return
    setExpandedDels((prev) => new Set(prev).add(focusDeliverable))
    document.getElementById(`entregavel-${focusDeliverable}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [focusDeliverable])

  if (projects.isLoading) return <Loading />
  const p = projects.data?.find((x) => x.id === id)
  if (!p) return <div className="text-sm text-slate-500">Projeto não encontrado. <Link to="/projetos" className="text-indigo-500">Voltar</Link></div>

  const st = projectStatusBadge[p.status]
  const owner = users.data?.find((u) => u.id === p.ownerId)
  const pDels = deliverables.data?.filter((d) => d.projectId === p.id) ?? []
  const pFin = finance.data?.filter((f) => f.projectId === p.id) ?? []
  const userOf = (uid: string) => users.data?.find((u) => u.id === uid)

  const saveTask = async () => {
    if (!editingTask?.title.trim()) return
    setTaskError(null)
    try {
      if (isNew(tasks.data, editingTask.id)) await createEntity('tasks', editingTask)
      else await updateEntity('tasks', editingTask.id, editingTask)
      await queryClient.invalidateQueries({ queryKey: ['tasks'] })
      setEditingTask(null)
    } catch (e) {
      setTaskError(e instanceof Error ? e.message : 'Erro ao salvar tarefa')
    }
  }
  const removeTask = async (taskId: string) => {
    await removeEntity('tasks', taskId)
    await queryClient.invalidateQueries({ queryKey: ['tasks'] })
  }

  const addChecklistItem = () => {
    if (!editingTask || !newChecklistItem.trim()) return
    setEditingTask({ ...editingTask, checklist: [...editingTask.checklist, { text: newChecklistItem.trim(), done: false }] })
    setNewChecklistItem('')
  }
  const toggleChecklistItem = (idx: number) => {
    if (!editingTask) return
    setEditingTask({ ...editingTask, checklist: editingTask.checklist.map((c, i) => (i === idx ? { ...c, done: !c.done } : c)) })
  }
  const removeChecklistItem = (idx: number) => {
    if (!editingTask) return
    setEditingTask({ ...editingTask, checklist: editingTask.checklist.filter((_, i) => i !== idx) })
  }

  const saveDeliverable = async () => {
    if (!editingDeliverable?.name.trim()) return
    if (isNew(deliverables.data, editingDeliverable.id)) await createEntity('deliverables', editingDeliverable)
    else await updateEntity('deliverables', editingDeliverable.id, editingDeliverable)
    await queryClient.invalidateQueries({ queryKey: ['deliverables'] })
    setEditingDeliverable(null)
  }
  const removeDeliverable = async (delId: string) => {
    await removeEntity('deliverables', delId)
    await queryClient.invalidateQueries({ queryKey: ['deliverables'] })
  }

  return (
    <div>
      <Link to="/projetos" className="mb-3 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-500">
        <ArrowLeft size={15} /> Projetos
      </Link>
      <PageHeader
        title={p.name}
        subtitle={`${p.client} · Responsável: ${owner?.name ?? '—'}`}
        actions={<Badge className={st.className}>{st.label}</Badge>}
      />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Progresso" value={`${p.progress}%`} />
        <StatTile label="Orçamento" value={brl(p.budget)} />
        <StatTile label="Consumido" value={brl(p.spent)} accent={p.spent > p.budget ? 'text-rose-500' : 'text-emerald-500'} />
        <StatTile label="Prazo" value={dateBR(p.endDate)} />
      </div>

      <Card className="mb-6 p-4">
        <div className="mb-2 flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${healthDot[p.health]}`} />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Saúde do projeto</span>
        </div>
        <ProgressBar value={p.progress} />
      </Card>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Entregáveis ({pDels.length})</h2>
          <button
            onClick={() => setEditingDeliverable(emptyDeliverable(p.id))}
            className="inline-flex items-center gap-1 rounded-lg bg-indigo-500 px-2 py-1 text-xs font-medium text-white hover:bg-indigo-600"
          >
            <Plus size={13} /> Novo
          </button>
        </div>
        <div className="space-y-2">
            {pDels.map((d) => {
              const isExpanded = expandedDels.has(d.id)
              const dTasks = tasks.data?.filter((t) => t.entregableId === d.id) ?? []
              const dOwner = userOf(d.ownerId)
              return (
                <div
                  key={d.id}
                  id={`entregavel-${d.id}`}
                  className={cn(
                    'rounded-lg border border-slate-200 dark:border-slate-700',
                    focusDeliverable === d.id && 'ring-2 ring-indigo-400 dark:ring-indigo-500',
                  )}
                >
                  <button
                    onClick={() => {
                      const newSet = new Set(expandedDels)
                      if (isExpanded) newSet.delete(d.id)
                      else newSet.add(d.id)
                      setExpandedDels(newSet)
                    }}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <ChevronDown size={16} className={cn('text-slate-400 transition-transform', isExpanded && 'rotate-180')} />
                    <div className="flex-1 text-left">
                      <p className="font-medium text-slate-900 dark:text-white">{d.name}</p>
                      <p className="text-xs text-slate-500">Prazo: {dateBR(d.dueDate)}</p>
                    </div>
                    <Badge className={deliverableBadge[d.status].className}>{deliverableBadge[d.status].label}</Badge>
                    {dOwner && <Avatar name={dOwner.name} color={dOwner.color} size={24} />}
                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                      <Link to={`/entregaveis/${d.id}/metricas`} title="Ver métricas do portal" className="rounded p-1 text-slate-400 hover:text-indigo-500">
                        <BarChart3 size={13} />
                      </Link>
                      <button onClick={() => setEditingDeliverable({ ...d })} title="Editar" className="rounded p-1 text-slate-400 hover:text-indigo-500">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => removeDeliverable(d.id)} title="Excluir" className="rounded p-1 text-slate-400 hover:text-rose-500">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/30">
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Tarefas ({dTasks.length})</p>
                        <button
                          onClick={() => setEditingTask(emptyTask(d.id))}
                          className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-500/10"
                        >
                          <Plus size={12} /> Nova
                        </button>
                      </div>
                      <TaskList tasks={dTasks} userOf={userOf} onSelect={(t) => setEditingTask({ ...t })} onDelete={removeTask} />
                    </div>
                  )}
                </div>
              )
            })}
        </div>

        {pFin.length > 0 && (
          <>
            <h2 className="mb-3 mt-6 text-sm font-semibold text-slate-900 dark:text-white">Financeiro</h2>
            <TableWrap>
              <thead><tr><Th>Descrição</Th><Th>Valor</Th></tr></thead>
              <tbody>
                {pFin.map((f) => (
                  <tr key={f.id}>
                    <Td>{f.description}</Td>
                    <Td className="font-medium">{brl(f.amount)}</Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          </>
        )}
      </div>

      <Sheet
        open={editingTask !== null}
        onClose={() => setEditingTask(null)}
        title={editingTask && !isNew(tasks.data, editingTask.id) ? 'Editar tarefa' : 'Nova tarefa'}
        footer={
          <>
            <button onClick={() => setEditingTask(null)} className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
              Cancelar
            </button>
            <button onClick={saveTask} className="rounded-lg bg-indigo-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-600">
              Salvar
            </button>
          </>
        }
      >
        {editingTask && (
          <div className="space-y-3">
            {taskError && (
              <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">{taskError}</p>
            )}
            <input
              value={editingTask.title}
              onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
              placeholder="Título da tarefa"
              className="w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
            />
            <textarea
              value={editingTask.description}
              onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
              placeholder="Descrição da tarefa"
              rows={3}
              className="w-full resize-none rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
            />
            <div className="grid grid-cols-3 gap-2">
              <select
                value={editingTask.status}
                onChange={(e) => setEditingTask({ ...editingTask, status: e.target.value as TaskStatus })}
                className="rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:text-white"
              >
                <option value="backlog">Backlog</option>
                <option value="todo">A fazer</option>
                <option value="doing">Fazendo</option>
                <option value="review">Revisão</option>
                <option value="done">Feito</option>
              </select>
              <select
                value={editingTask.priority}
                onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value as Priority })}
                className="rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:text-white"
              >
                <option value="baixa">Baixa</option>
                <option value="media">Média</option>
                <option value="alta">Alta</option>
                <option value="critica">Crítica</option>
              </select>
              <select
                value={editingTask.assigneeId}
                onChange={(e) => setEditingTask({ ...editingTask, assigneeId: e.target.value })}
                className="rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:text-white"
              >
                <option value="">Responsável…</option>
                {(users.data ?? []).map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Prazo
              <DateInput
                value={editingTask.dueDate}
                onChange={(v) => setEditingTask({ ...editingTask, dueDate: v })}
                className="mt-1"
              />
            </label>

            <div className="rounded-lg border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setChecklistOpen((v) => !v)}
                className="flex w-full items-center gap-1.5 px-3 py-2 text-left text-xs font-semibold text-slate-600 dark:text-slate-300"
              >
                <ChevronDown size={14} className={cn('text-slate-400 transition-transform', checklistOpen && 'rotate-180')} />
                Checklist
                {editingTask.checklist.length > 0 && (
                  <span className="text-slate-400">
                    ({editingTask.checklist.filter((c) => c.done).length}/{editingTask.checklist.length})
                  </span>
                )}
              </button>
              {checklistOpen && (
                <div className="space-y-1.5 border-t border-slate-200 px-3 py-2 dark:border-slate-700">
                  {editingTask.checklist.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={item.done}
                        onChange={() => toggleChecklistItem(idx)}
                        className="h-3.5 w-3.5 shrink-0 rounded border-slate-300"
                      />
                      <span className={cn('flex-1 text-sm text-slate-700 dark:text-slate-200', item.done && 'text-slate-400 line-through dark:text-slate-500')}>
                        {item.text}
                      </span>
                      <button type="button" onClick={() => removeChecklistItem(idx)} title="Remover" className="shrink-0 text-slate-400 hover:text-rose-500">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                  <div className="flex gap-1.5 pt-1">
                    <input
                      value={newChecklistItem}
                      onChange={(e) => setNewChecklistItem(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addChecklistItem()
                        }
                      }}
                      placeholder="Novo item…"
                      className="flex-1 rounded-lg border border-slate-200 bg-transparent px-2 py-1 text-xs dark:border-slate-700"
                    />
                    <button
                      type="button"
                      onClick={addChecklistItem}
                      className="inline-flex items-center rounded-lg bg-indigo-500 px-2 py-1 text-xs font-medium text-white hover:bg-indigo-600"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </Sheet>

      <Modal
        open={editingDeliverable !== null}
        onClose={() => setEditingDeliverable(null)}
        title={editingDeliverable && !isNew(deliverables.data, editingDeliverable.id) ? 'Editar entregável' : 'Novo entregável'}
        footer={
          <>
            <button onClick={() => setEditingDeliverable(null)} className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
              Cancelar
            </button>
            <button onClick={saveDeliverable} className="rounded-lg bg-indigo-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-600">
              Salvar
            </button>
          </>
        }
      >
        {editingDeliverable && (
          <div className="space-y-3">
            <input
              value={editingDeliverable.name}
              onChange={(e) => setEditingDeliverable({ ...editingDeliverable, name: e.target.value })}
              placeholder="Nome do entregável"
              className="w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
            />
            <select
              value={editingDeliverable.ownerId}
              onChange={(e) => setEditingDeliverable({ ...editingDeliverable, ownerId: e.target.value })}
              className="w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:text-white"
            >
              <option value="">Responsável…</option>
              {(users.data ?? []).map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <select
                value={editingDeliverable.status}
                onChange={(e) => setEditingDeliverable({ ...editingDeliverable, status: e.target.value as DeliverableStatus })}
                className="flex-1 rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:text-white"
              >
                <option value="pendente">Pendente</option>
                <option value="em_producao">Em produção</option>
                <option value="em_aprovacao">Em aprovação</option>
                <option value="aprovado">Aprovado</option>
                <option value="entregue">Entregue</option>
              </select>
              <label className="flex-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                Prazo
                <DateInput
                  value={editingDeliverable.dueDate}
                  onChange={(v) => setEditingDeliverable({ ...editingDeliverable, dueDate: v })}
                  className="mt-1"
                />
              </label>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
