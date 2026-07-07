import { useState } from 'react'
import { Moon, Sun, Check } from 'lucide-react'
import { PageHeader, Card, cn } from '../../components/ui'
import { useUIStore } from '../../stores/uiStore'
import { useAuthStore } from '../../stores/authStore'

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn('relative h-6 w-11 rounded-full transition-colors', on ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-700')}
    >
      <span className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all', on ? 'left-[22px]' : 'left-0.5')} />
    </button>
  )
}

export function ConfiguracoesPage() {
  const theme = useUIStore((s) => s.theme)
  const setTheme = useUIStore((s) => s.setTheme)
  const user = useAuthStore((s) => s.user)
  const [workspace, setWorkspace] = useState(user?.workspace ?? '')
  const [notif, setNotif] = useState({ email: true, chamados: true, prazos: false })
  const [saved, setSaved] = useState(false)

  const save = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 1800)
  }

  return (
    <div>
      <PageHeader title="Configurações" subtitle="Preferências locais do workspace" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">Aparência</h2>
          <div className="flex gap-3">
            <button
              onClick={() => setTheme('light')}
              className={cn(
                'flex flex-1 items-center gap-2 rounded-lg border p-3 text-sm font-medium',
                theme === 'light' ? 'border-indigo-500 bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10' : 'border-slate-200 dark:border-slate-700',
              )}
            >
              <Sun size={18} /> Claro
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={cn(
                'flex flex-1 items-center gap-2 rounded-lg border p-3 text-sm font-medium',
                theme === 'dark' ? 'border-indigo-500 bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400' : 'border-slate-200 dark:border-slate-700',
              )}
            >
              <Moon size={18} /> Escuro
            </button>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">Workspace</h2>
          <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Nome</label>
          <input
            value={workspace}
            onChange={(e) => setWorkspace(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
          />
          <label className="mb-1 mt-3 block text-xs font-medium text-slate-500 dark:text-slate-400">E-mail</label>
          <input
            disabled
            value={user?.email ?? ''}
            className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/50"
          />
        </Card>

        <Card className="p-5 lg:col-span-2">
          <h2 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">Notificações</h2>
          <div className="space-y-3">
            {[
              { key: 'email' as const, label: 'Resumo diário por e-mail' },
              { key: 'chamados' as const, label: 'Alertas de chamados críticos' },
              { key: 'prazos' as const, label: 'Lembretes de prazos de entregáveis' },
            ].map((row) => (
              <div key={row.key} className="flex items-center justify-between">
                <span className="text-sm text-slate-700 dark:text-slate-300">{row.label}</span>
                <Toggle on={notif[row.key]} onClick={() => setNotif({ ...notif, [row.key]: !notif[row.key] })} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={save}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-400"
        >
          Salvar preferências
        </button>
        {saved && (
          <span className="inline-flex items-center gap-1 text-sm text-emerald-600 dark:text-emerald-400">
            <Check size={15} /> Salvo localmente
          </span>
        )}
      </div>
    </div>
  )
}
