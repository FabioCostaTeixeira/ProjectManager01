import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Plus, Pencil, Trash2 } from 'lucide-react'
import { api, createEntity, updateEntity, removeEntity } from '../../services/api'
import { Card, PageHeader, StatTile, Badge, ProgressBar, Avatar, TableWrap, Th, Td, Loading, Modal } from '../../components/ui'
import { projectStatusBadge, priorityBadge, taskStatusLabel, deliverableBadge, healthDot, brl, dateBR } from '../../lib/format'
import type { Task, Deliverable, Priority, TaskStatus, DeliverableStatus } from '../../types'

const emptyTask = (projectId: string): Task => ({
  id: `t-${Date.now()}`,
  projectId,
  title: '',
  status: 'todo',
  priority: 'media',
  assigneeId: '',
  dueDate: new Date().toISOString().slice(0, 10),
  tags: [],
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

export function ProjetoDetalhePage() {
  const { id } = useParams()
  const projects = useQuery({ queryKey: ['projects'], queryFn: api.getProjects })
  const tasks = useQuery({ queryKey: ['tasks'], queryFn: api.getTasks })
  const deliverables = useQuery({ queryKey: ['deliverables'], queryFn: api.getDeliverables })
  const users = useQuery({ queryKey: ['users'], queryFn: api.getUsers })
  const finance = useQuery({ queryKey: ['finance'], queryFn: api.getFinance })
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [editingDeliverable, setEditingDeliverable] = useState<Deliverable | null>(null)
  const queryClient = useQueryClient()

  if (projects.isLoading) return <Loading />
  const p = projects.data?.find((x) => x.id === id)
  if (!p) return <div className="text-sm text-slate-500">Projeto não encontrado. <Link to="/projetos" className="text-indigo-500">Voltar</Link></div>

  const st = projectStatusBadge[p.status]
  const owner = users.data?.find((u) => u.id === p.ownerId)
  const pTasks = tasks.data?.filter((t) => t.projectId === p.id) ?? []
  const pDels = deliverables.data?.filter((d) => d.projectId === p.id) ?? []
  const pFin = finance.data?.filter((f) => f.projectId === p.id) ?? []
  const userOf = (uid: string) => users.data?.find((u) => u.id === uid)

  const saveTask = async () => {
    if (!editingTask?.title.trim()) return
    if (isNew(tasks.data, editingTask.id)) await createEntity('tasks', editingTask)
    else await updateEntity('tasks', editingTask.id, editingTask)
    await queryClient.invalidateQueries({ queryKey: ['tasks'] })
    setEditingTask(null)
  }
  const removeTask = async (taskId: string) => {
    await removeEntity('tasks', taskId)
    await queryClient.invalidateQueries({ queryKey: ['tasks'] })
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Tarefas ({pTasks.length})</h2>
            <button
              onClick={() => setEditingTask(emptyTask(p.id))}
              className="inline-flex items-center gap-1 rounded-lg bg-indigo-500 px-2 py-1 text-xs font-medium text-white hover:bg-indigo-600"
            >
              <Plus size={13} /> Nova
            </button>
          </div>
          <TableWrap>
            <thead><tr><Th>Tarefa</Th><Th>Status</Th><Th>Prioridade</Th><Th>Resp.</Th><Th>Ações</Th></tr></thead>
            <tbody>
              {pTasks.map((t) => {
                const u = userOf(t.assigneeId)
                return (
                  <tr key={t.id}>
                    <Td className="font-medium text-slate-900 dark:text-white">{t.title}</Td>
                    <Td className="text-xs">{taskStatusLabel[t.status]}</Td>
                    <Td><Badge className={priorityBadge[t.priority].className}>{priorityBadge[t.priority].label}</Badge></Td>
                    <Td>{u && <Avatar name={u.name} color={u.color} size={24} />}</Td>
                    <Td>
                      <div className="flex gap-1">
                        <button onClick={() => setEditingTask({ ...t })} title="Editar" className="rounded p-1 text-slate-400 hover:text-indigo-500">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => removeTask(t.id)} title="Excluir" className="rounded p-1 text-slate-400 hover:text-rose-500">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </Td>
                  </tr>
                )
              })}
            </tbody>
          </TableWrap>
        </div>

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
          <TableWrap>
            <thead><tr><Th>Entregável</Th><Th>Status</Th><Th>Prazo</Th><Th>Ações</Th></tr></thead>
            <tbody>
              {pDels.map((d) => (
                <tr key={d.id}>
                  <Td className="font-medium text-slate-900 dark:text-white">{d.name}</Td>
                  <Td><Badge className={deliverableBadge[d.status].className}>{deliverableBadge[d.status].label}</Badge></Td>
                  <Td className="whitespace-nowrap text-xs text-slate-500">{dateBR(d.dueDate)}</Td>
                  <Td>
                    <div className="flex gap-1">
                      <button onClick={() => setEditingDeliverable({ ...d })} title="Editar" className="rounded p-1 text-slate-400 hover:text-indigo-500">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => removeDeliverable(d.id)} title="Excluir" className="rounded p-1 text-slate-400 hover:text-rose-500">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>

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
      </div>

      <Modal
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
            <input
              value={editingTask.title}
              onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
              placeholder="Título da tarefa"
              className="w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
            />
            <div className="grid grid-cols-3 gap-2">
              <select
                value={editingTask.status}
                onChange={(e) => setEditingTask({ ...editingTask, status: e.target.value as TaskStatus })}
                className="rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
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
                className="rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
              >
                <option value="baixa">Baixa</option>
                <option value="media">Média</option>
                <option value="alta">Alta</option>
                <option value="critica">Crítica</option>
              </select>
              <select
                value={editingTask.assigneeId}
                onChange={(e) => setEditingTask({ ...editingTask, assigneeId: e.target.value })}
                className="rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
              >
                <option value="">Responsável…</option>
                {(users.data ?? []).map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Prazo
              <input
                type="date"
                value={editingTask.dueDate}
                onChange={(e) => setEditingTask({ ...editingTask, dueDate: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
              />
            </label>
          </div>
        )}
      </Modal>

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
              className="w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
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
                className="flex-1 rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
              >
                <option value="pendente">Pendente</option>
                <option value="em_producao">Em produção</option>
                <option value="em_aprovacao">Em aprovação</option>
                <option value="aprovado">Aprovado</option>
                <option value="entregue">Entregue</option>
              </select>
              <label className="flex-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                Prazo
                <input
                  type="date"
                  value={editingDeliverable.dueDate}
                  onChange={(e) => setEditingDeliverable({ ...editingDeliverable, dueDate: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
                />
              </label>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
