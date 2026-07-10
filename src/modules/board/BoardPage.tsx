import { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { RotateCcw, ExternalLink, Lock, Plus } from 'lucide-react'
import { api, createEntity } from '../../services/api'
import { useBoardStore } from '../../stores/boardStore'
import { Badge, PageHeader, Avatar, Modal, DateInput, cn } from '../../components/ui'
import { priorityBadge, taskStatusLabel, dateBR } from '../../lib/format'
import { resolveEntityName, isEntityDone } from '../../lib/dependencies'
import type { Task, TaskStatus, Project, Deliverable, Priority, User } from '../../types'

const columns: TaskStatus[] = ['backlog', 'todo', 'doing', 'review', 'done']

const NEW = '__new__'

function NewCardModal({
  open,
  onClose,
  projects,
  deliverables,
  users,
  onCreated,
}: {
  open: boolean
  onClose: () => void
  projects: Project[]
  deliverables: Deliverable[]
  users: User[]
  onCreated: () => void
}) {
  const [projectId, setProjectId] = useState('')
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectClient, setNewProjectClient] = useState('')
  const [deliverableId, setDeliverableId] = useState('')
  const [newDeliverableName, setNewDeliverableName] = useState('')
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<Priority>('media')
  const [assigneeId, setAssigneeId] = useState('')
  const [dueDate, setDueDate] = useState(new Date().toISOString().slice(0, 10))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setProjectId('')
    setNewProjectName('')
    setNewProjectClient('')
    setDeliverableId('')
    setNewDeliverableName('')
    setTitle('')
    setPriority('media')
    setAssigneeId('')
    setDueDate(new Date().toISOString().slice(0, 10))
    setError(null)
  }, [open])

  if (!open) return null

  const isNewProject = projectId === NEW
  const isNewDeliverable = deliverableId === NEW
  const delsOfProject = deliverables.filter((d) => d.projectId === projectId)

  const save = async () => {
    setError(null)
    if (!title.trim()) return setError('Título da tarefa é obrigatório')
    if (!assigneeId) return setError('Selecione um responsável')
    if (isNewProject && !newProjectName.trim()) return setError('Nome do novo projeto é obrigatório')
    if (!isNewProject && !projectId) return setError('Selecione ou crie um projeto')
    if (isNewDeliverable && !newDeliverableName.trim()) return setError('Nome do novo entregável é obrigatório')
    if (!isNewDeliverable && !deliverableId) return setError('Selecione ou crie um entregável')

    setSaving(true)
    try {
      let pId = projectId
      if (isNewProject) {
        const project: Project = {
          id: `p-${Date.now()}`,
          name: newProjectName.trim(),
          client: newProjectClient.trim() || newProjectName.trim(),
          status: 'planejado',
          health: 'verde',
          progress: 0,
          startDate: new Date().toISOString().slice(0, 10),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          ownerId: assigneeId,
          budget: 0,
          spent: 0,
        }
        await createEntity('projects', project)
        pId = project.id
      }
      let dId = deliverableId
      if (isNewDeliverable) {
        const deliverable: Deliverable = {
          id: `d-${Date.now()}`,
          projectId: pId,
          name: newDeliverableName.trim(),
          status: 'pendente',
          ownerId: assigneeId,
          dueDate,
        }
        await createEntity('deliverables', deliverable)
        dId = deliverable.id
      }
      const task: Task = {
        id: `t-${Date.now()}`,
        entregableId: dId,
        title: title.trim(),
        status: 'backlog',
        priority,
        assigneeId,
        dueDate,
        tags: [],
        description: '',
        checklist: [],
      }
      await createEntity('tasks', task)
      onCreated()
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao criar')
    } finally {
      setSaving(false)
    }
  }

  const selectCls = 'w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:text-white'
  const inputCls = 'w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm dark:border-slate-700'

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Novo card"
      footer={
        <>
          <button onClick={onClose} className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
            Cancelar
          </button>
          <button onClick={save} disabled={saving} className="rounded-lg bg-indigo-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-600 disabled:opacity-50">
            {saving ? 'Criando…' : 'Criar'}
          </button>
        </>
      }
    >
      <div className="space-y-3">
        {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">{error}</p>}

        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400">
          Projeto
          <select value={projectId} onChange={(e) => { setProjectId(e.target.value); setDeliverableId('') }} className={cn(selectCls, 'mt-1')}>
            <option value="">Selecionar…</option>
            <option value={NEW}>+ Criar novo projeto</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </label>
        {isNewProject && (
          <div className="grid grid-cols-2 gap-2">
            <input value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} placeholder="Nome do projeto" className={inputCls} />
            <input value={newProjectClient} onChange={(e) => setNewProjectClient(e.target.value)} placeholder="Cliente" className={inputCls} />
          </div>
        )}

        {(projectId && !isNewProject) || isNewProject ? (
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400">
            Entregável
            <select value={deliverableId} onChange={(e) => setDeliverableId(e.target.value)} className={cn(selectCls, 'mt-1')}>
              <option value="">Selecionar…</option>
              <option value={NEW}>+ Criar novo entregável</option>
              {!isNewProject && delsOfProject.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </label>
        ) : null}
        {isNewDeliverable && (
          <input value={newDeliverableName} onChange={(e) => setNewDeliverableName(e.target.value)} placeholder="Nome do entregável" className={inputCls} />
        )}

        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título da tarefa" className={inputCls} />

        <div className="grid grid-cols-2 gap-2">
          <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)} className={selectCls}>
            <option value="baixa">Baixa</option>
            <option value="media">Média</option>
            <option value="alta">Alta</option>
            <option value="critica">Crítica</option>
          </select>
          <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)} className={selectCls}>
            <option value="">Responsável…</option>
            {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </div>

        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400">
          Prazo
          <DateInput value={dueDate} onChange={setDueDate} className="mt-1" />
        </label>
      </div>
    </Modal>
  )
}

export function BoardPage() {
  const tasks = useBoardStore((s) => s.tasks)
  const moveTask = useBoardStore((s) => s.moveTask)
  const setAll = useBoardStore((s) => s.setAll)
  const queryClient = useQueryClient()
  const { data: users } = useQuery({ queryKey: ['users'], queryFn: api.getUsers })
  const { data: projects } = useQuery({ queryKey: ['projects'], queryFn: api.getProjects })
  const { data: deliverables } = useQuery({ queryKey: ['deliverables'], queryFn: api.getDeliverables })
  const { data: dependencies } = useQuery({ queryKey: ['dependencies'], queryFn: api.getDependencies })
  const { data: taskData } = useQuery({ queryKey: ['tasks'], queryFn: api.getTasks, refetchInterval: 4000 })
  useEffect(() => {
    if (taskData) setAll(taskData)
  }, [taskData, setAll])
  const reset = () => queryClient.invalidateQueries({ queryKey: ['tasks'] })
  const [dragId, setDragId] = useState<string | null>(null)
  const [overCol, setOverCol] = useState<TaskStatus | null>(null)
  const [selected, setSelected] = useState<Task | null>(null)
  const [filterProject, setFilterProject] = useState('')
  const [filterUser, setFilterUser] = useState('')
  const [filterDue, setFilterDue] = useState('')
  const [newCardOpen, setNewCardOpen] = useState(false)

  const userOf = (id: string) => users?.find((u) => u.id === id)
  const projectIdOfTask = (t: Task) => deliverables?.find((d) => d.id === t.entregableId)?.projectId

  const visibleTasks = tasks.filter(
    (t) =>
      (!filterProject || projectIdOfTask(t) === filterProject) &&
      (!filterUser || t.assigneeId === filterUser) &&
      (!filterDue || t.dueDate <= filterDue),
  )
  const filtersActive = filterProject || filterUser || filterDue

  const blockingDepOf = (t: Task) =>
    (dependencies ?? []).find((dep) => dep.from === t.id && dep.kind === 'aguarda' && !isEntityDone(dep.to, { projects, deliverables, tasks }))
  const blockedTasks = visibleTasks.filter((t) => blockingDepOf(t))

  return (
    <div>
      <PageHeader
        title="Board"
        subtitle="Arraste os cards entre as colunas — as mudanças são salvas no banco"
        actions={
          <>
            <button
              onClick={() => setNewCardOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-600"
            >
              <Plus size={15} /> Novo card
            </button>
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <RotateCcw size={15} /> Restaurar
            </button>
          </>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <select
          value={filterProject}
          onChange={(e) => setFilterProject(e.target.value)}
          className="rounded-lg border border-slate-200 bg-transparent px-3 py-1.5 text-sm text-slate-900 dark:border-slate-700 dark:text-white"
        >
          <option value="">Projeto: todos</option>
          {(projects ?? []).map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <select
          value={filterUser}
          onChange={(e) => setFilterUser(e.target.value)}
          className="rounded-lg border border-slate-200 bg-transparent px-3 py-1.5 text-sm text-slate-900 dark:border-slate-700 dark:text-white"
        >
          <option value="">Pessoa: todas</option>
          {(users ?? []).map((u) => (
            <option key={u.id} value={u.id}>{u.name}</option>
          ))}
        </select>
        <label className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
          Vencendo até
          <DateInput value={filterDue} onChange={setFilterDue} className="w-36" />
        </label>
        {filtersActive && (
          <button
            onClick={() => { setFilterProject(''); setFilterUser(''); setFilterDue('') }}
            className="text-sm text-indigo-500 hover:underline"
          >
            Limpar filtros
          </button>
        )}
      </div>

      {blockedTasks.length > 0 && (
        <div className="mb-3 flex flex-col rounded-xl border border-amber-300 bg-amber-50/60 p-2 dark:border-amber-500/40 dark:bg-amber-500/5">
          <div className="mb-2 flex items-center justify-between px-1">
            <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
              <Lock size={13} /> Bloqueadas
            </span>
            <span className="rounded-full bg-amber-200 px-2 text-xs text-amber-800 dark:bg-amber-500/20 dark:text-amber-300">
              {blockedTasks.length}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {blockedTasks.map((t) => {
              const u = userOf(t.assigneeId)
              const pr = priorityBadge[t.priority]
              const dep = blockingDepOf(t)
              return (
                <div
                  key={t.id}
                  onClick={() => setSelected(t)}
                  className="cursor-pointer rounded-lg border border-amber-200 bg-white p-3 shadow-sm dark:border-amber-500/30 dark:bg-slate-900"
                >
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{t.title}</p>
                  {dep && (
                    <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
                      Aguardando: {resolveEntityName(dep.to, { projects, deliverables, tasks })}
                    </p>
                  )}
                  <div className="mt-2 flex items-center justify-between">
                    <Badge className={pr.className}>{pr.label}</Badge>
                    {u && <Avatar name={u.name} color={u.color} size={24} />}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {columns.map((col) => {
          const items = visibleTasks.filter((t) => t.status === col && !blockingDepOf(t))
          return (
            <div
              key={col}
              onDragOver={(e) => {
                e.preventDefault()
                setOverCol(col)
              }}
              onDragLeave={() => setOverCol((c) => (c === col ? null : c))}
              onDrop={() => {
                if (dragId) moveTask(dragId, col)
                setDragId(null)
                setOverCol(null)
              }}
              className={cn(
                'flex min-h-[120px] flex-col rounded-xl border bg-slate-50 p-2 transition-colors dark:bg-slate-900/40',
                overCol === col
                  ? 'border-indigo-400 bg-indigo-50/60 dark:border-indigo-500/60 dark:bg-indigo-500/5'
                  : 'border-slate-200 dark:border-slate-800',
              )}
            >
              <div className="mb-2 flex items-center justify-between px-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {taskStatusLabel[col]}
                </span>
                <span className="rounded-full bg-slate-200 px-2 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {items.length}
                </span>
              </div>

              <div className="flex flex-1 flex-col gap-2">
                {items.map((t) => {
                  const u = userOf(t.assigneeId)
                  const pr = priorityBadge[t.priority]
                  return (
                    <div
                      key={t.id}
                      draggable
                      onDragStart={() => setDragId(t.id)}
                      onDragEnd={() => setDragId(null)}
                      onClick={() => setSelected(t)}
                      className={cn(
                        'cursor-grab rounded-lg border border-slate-200 bg-white p-3 shadow-sm active:cursor-grabbing dark:border-slate-800 dark:bg-slate-900',
                        dragId === t.id && 'opacity-50',
                      )}
                    >
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{t.title}</p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {t.tags.map((tag) => (
                          <span key={tag} className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <Badge className={pr.className}>{pr.label}</Badge>
                        {u && <Avatar name={u.name} color={u.color} size={24} />}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      <Modal
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={selected?.title ?? ''}
        footer={null}
      >
        {selected && (() => {
          const u = userOf(selected.assigneeId)
          const pr = priorityBadge[selected.priority]
          return (
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Badge className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">{taskStatusLabel[selected.status]}</Badge>
                <Badge className={pr.className}>{pr.label}</Badge>
              </div>
              <p className="text-slate-500 dark:text-slate-400">Prazo: <span className="font-medium text-slate-900 dark:text-white">{dateBR(selected.dueDate)}</span></p>
              {u && (
                <p className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  Responsável: <Avatar name={u.name} color={u.color} size={22} /> <span className="font-medium text-slate-900 dark:text-white">{u.name}</span>
                </p>
              )}
              {selected.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {selected.tags.map((tag) => (
                    <span key={tag} className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500 dark:bg-slate-800 dark:text-slate-400">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          )
        })()}
      </Modal>

      <NewCardModal
        open={newCardOpen}
        onClose={() => setNewCardOpen(false)}
        projects={projects ?? []}
        deliverables={deliverables ?? []}
        users={users ?? []}
        onCreated={() => {
          queryClient.invalidateQueries({ queryKey: ['tasks'] })
          queryClient.invalidateQueries({ queryKey: ['projects'] })
          queryClient.invalidateQueries({ queryKey: ['deliverables'] })
        }}
      />
    </div>
  )
}
