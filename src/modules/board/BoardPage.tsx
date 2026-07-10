import { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { RotateCcw, ExternalLink } from 'lucide-react'
import { api } from '../../services/api'
import { useBoardStore } from '../../stores/boardStore'
import { Badge, PageHeader, Avatar, Modal, cn } from '../../components/ui'
import { priorityBadge, taskStatusLabel, dateBR } from '../../lib/format'
import type { Task, TaskStatus } from '../../types'

const columns: TaskStatus[] = ['backlog', 'todo', 'doing', 'review', 'done']

export function BoardPage() {
  const tasks = useBoardStore((s) => s.tasks)
  const moveTask = useBoardStore((s) => s.moveTask)
  const setAll = useBoardStore((s) => s.setAll)
  const queryClient = useQueryClient()
  const { data: users } = useQuery({ queryKey: ['users'], queryFn: api.getUsers })
  const { data: projects } = useQuery({ queryKey: ['projects'], queryFn: api.getProjects })
  const { data: taskData } = useQuery({ queryKey: ['tasks'], queryFn: api.getTasks })
  useEffect(() => {
    if (taskData) setAll(taskData)
  }, [taskData, setAll])
  const reset = () => queryClient.invalidateQueries({ queryKey: ['tasks'] })
  const [dragId, setDragId] = useState<string | null>(null)
  const [overCol, setOverCol] = useState<TaskStatus | null>(null)
  const [selected, setSelected] = useState<Task | null>(null)

  const userOf = (id: string) => users?.find((u) => u.id === id)
  const projectOf = (id: string) => projects?.find((p) => p.id === id)

  return (
    <div>
      <PageHeader
        title="Board"
        subtitle="Arraste os cards entre as colunas — as mudanças são salvas no banco"
        actions={
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <RotateCcw size={15} /> Restaurar
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {columns.map((col) => {
          const items = tasks.filter((t) => t.status === col)
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
    </div>
  )
}
