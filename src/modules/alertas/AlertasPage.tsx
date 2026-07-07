import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CheckCheck, Clock } from 'lucide-react'
import { api } from '../../services/api'
import { PageHeader, Card, Badge, StatTile, Loading, Tabs } from '../../components/ui'
import { useAlertsStore } from '../../stores/alertsStore'
import { alertSeverityBadge, dateBR } from '../../lib/format'

type ViewTab = 'alertas' | 'lembretes'

export function AlertasPage() {
  const [view, setView] = useState<ViewTab>('alertas')
  const alertsQ = useQuery({ queryKey: ['alerts'], queryFn: api.getAlerts })
  const remindersQ = useQuery({ queryKey: ['reminders'], queryFn: api.getReminders })
  const { alerts, reminders, hydrated, setAll, markRead, markAllRead, snooze, toggleReminder } = useAlertsStore()
  useEffect(() => {
    if (alertsQ.data && remindersQ.data) setAll(alertsQ.data, remindersQ.data)
  }, [alertsQ.data, remindersQ.data, setAll])

  if (!hydrated) return <Loading />

  const unread = alerts.filter((a) => !a.read).length
  const pendingReminders = reminders.filter((r) => !r.done).length

  return (
    <div>
      <PageHeader
        title="Alertas"
        subtitle="Eventos do sistema e lembretes de prazo"
        actions={
          view === 'alertas' && unread > 0 ? (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
            >
              <CheckCheck className="h-4 w-4" /> Marcar todos como lidos
            </button>
          ) : undefined
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3">
        <StatTile label="Alertas não lidos" value={unread} accent="text-rose-500" />
        <StatTile label="Lembretes pendentes" value={pendingReminders} accent="text-amber-500" />
      </div>

      <Tabs
        tabs={[
          { id: 'alertas', label: 'Alertas' },
          { id: 'lembretes', label: 'Lembretes' },
        ]}
        active={view}
        onChange={setView}
      />

      {view === 'alertas' && (
        <Card className="divide-y divide-slate-100 dark:divide-slate-800">
          {alerts.length === 0 && (
            <p className="p-6 text-center text-sm text-slate-400">Nenhum alerta no momento.</p>
          )}
          {alerts.map((a) => {
            const sev = alertSeverityBadge[a.severity]
            return (
              <div key={a.id} className="flex items-center gap-3 px-5 py-3">
                <div className="min-w-0 flex-1">
                  <p className={a.read ? 'truncate text-sm text-slate-500 dark:text-slate-400' : 'truncate text-sm font-medium text-slate-900 dark:text-white'}>
                    {a.title}
                  </p>
                  <p className="text-xs text-slate-400">
                    {a.origin} · {dateBR(a.date)}
                    {a.snoozedUntil && <> · adiado até {dateBR(a.snoozedUntil)}</>}
                  </p>
                </div>
                <Badge className={sev.className}>{sev.label}</Badge>
                {!a.read && (
                  <button
                    onClick={() => markRead(a.id)}
                    className="rounded-lg px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-500/10"
                  >
                    Marcar como lido
                  </button>
                )}
                <button
                  onClick={() => snooze(a.id)}
                  title="Adiar 7 dias"
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Clock className="h-4 w-4" />
                </button>
              </div>
            )
          })}
        </Card>
      )}

      {view === 'lembretes' && (
        <Card className="divide-y divide-slate-100 dark:divide-slate-800">
          {reminders.length === 0 && (
            <p className="p-6 text-center text-sm text-slate-400">Nenhum lembrete cadastrado.</p>
          )}
          {reminders.map((r) => (
            <div key={r.id} className="flex items-center gap-3 px-5 py-3">
              <input
                type="checkbox"
                checked={r.done}
                onChange={() => toggleReminder(r.id)}
                className="h-4 w-4 rounded border-slate-300"
              />
              <div className="min-w-0 flex-1">
                <p className={r.done ? 'truncate text-sm text-slate-400 line-through' : 'truncate text-sm font-medium text-slate-900 dark:text-white'}>
                  {r.title}
                </p>
                <p className="text-xs text-slate-400">Prazo: {dateBR(r.dueDate)}</p>
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  )
}
