import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CheckSquare, Square } from 'lucide-react'
import { api } from '../../services/api'
import { useNotesStore } from '../../stores/notesStore'
import { PageHeader, Loading, cn } from '../../components/ui'

export function AnotacoesPage() {
  const { data: columns, isLoading } = useQuery({ queryKey: ['noteColumns'], queryFn: api.getNoteColumns })
  const { data: cardData } = useQuery({ queryKey: ['noteCards'], queryFn: api.getNoteCards })
  const cards = useNotesStore((s) => s.cards)
  const move = useNotesStore((s) => s.move)
  const toggleCheck = useNotesStore((s) => s.toggleCheck)
  const setAll = useNotesStore((s) => s.setAll)
  useEffect(() => {
    if (cardData) setAll(cardData)
  }, [cardData, setAll])
  const [dragId, setDragId] = useState<string | null>(null)
  const [overCol, setOverCol] = useState<string | null>(null)

  if (isLoading) return <Loading />

  return (
    <div>
      <PageHeader title="Anotações" subtitle="Kanban pessoal — arraste cartões e marque itens do checklist" />
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {(columns ?? []).map((col) => {
          const items = cards.filter((c) => c.columnId === col.id)
          return (
            <div
              key={col.id}
              onDragOver={(e) => { e.preventDefault(); setOverCol(col.id) }}
              onDragLeave={() => setOverCol((c) => (c === col.id ? null : c))}
              onDrop={() => { if (dragId) move(dragId, col.id); setDragId(null); setOverCol(null) }}
              className={cn(
                'flex min-h-[160px] flex-col rounded-xl border bg-slate-50 p-2 transition-colors dark:bg-slate-900/40',
                overCol === col.id ? 'border-indigo-400 dark:border-indigo-500/60' : 'border-slate-200 dark:border-slate-800',
              )}
            >
              <div className="mb-2 flex items-center justify-between px-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{col.title}</span>
                <span className="rounded-full bg-slate-200 px-2 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">{items.length}</span>
              </div>
              <div className="flex flex-1 flex-col gap-2">
                {items.map((c) => (
                  <div
                    key={c.id}
                    draggable
                    onDragStart={() => setDragId(c.id)}
                    onDragEnd={() => setDragId(null)}
                    className={cn(
                      'cursor-grab rounded-lg border border-slate-200 bg-white p-3 shadow-sm active:cursor-grabbing dark:border-slate-800 dark:bg-slate-900',
                      dragId === c.id && 'opacity-50',
                    )}
                  >
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{c.title}</p>
                    {c.checklist.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {c.checklist.map((it, i) => (
                          <li key={i}>
                            <button
                              onClick={() => toggleCheck(c.id, i)}
                              className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300"
                            >
                              {it.done ? <CheckSquare size={14} className="text-emerald-500" /> : <Square size={14} className="text-slate-400" />}
                              <span className={cn(it.done && 'text-slate-400 line-through')}>{it.text}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                    {c.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {c.tags.map((t) => (
                          <span key={t} className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500 dark:bg-slate-800 dark:text-slate-400">{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
