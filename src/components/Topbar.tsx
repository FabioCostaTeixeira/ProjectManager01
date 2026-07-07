import { useLocation, useNavigate } from 'react-router-dom'
import { Menu, Moon, Sun, Search, LogOut } from 'lucide-react'
import { useUIStore } from '../stores/uiStore'
import { useAuthStore } from '../stores/authStore'
import { navItems } from '../nav'
import { Avatar } from './ui'

export function Topbar() {
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)
  const theme = useUIStore((s) => s.theme)
  const toggleTheme = useUIStore((s) => s.toggleTheme)
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const current = navItems.find((i) => pathname.startsWith(i.to))

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-slate-200 bg-white/80 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
      <button
        onClick={toggleSidebar}
        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
        aria-label="Alternar menu"
      >
        <Menu size={18} />
      </button>

      <div className="hidden items-center text-sm text-slate-500 dark:text-slate-400 sm:flex">
        <span className="font-medium text-slate-900 dark:text-white">{current?.label ?? 'Gestor de Projetos'}</span>
      </div>

      <div className="relative ml-auto hidden md:block">
        <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          placeholder="Buscar…"
          className="w-56 rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-indigo-400 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-200"
        />
      </div>

      <button
        onClick={toggleTheme}
        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 md:ml-0 ml-auto"
        aria-label="Alternar tema"
      >
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <div className="flex items-center gap-2">
        <Avatar name={user?.name ?? 'Usuário'} color="#6366f1" size={30} />
        <div className="hidden text-right leading-tight lg:block">
          <p className="text-sm font-medium text-slate-900 dark:text-white">{user?.name}</p>
          <p className="text-xs text-slate-400">{user?.workspace}</p>
        </div>
        <button
          onClick={() => {
            logout()
            navigate('/login')
          }}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-rose-500 dark:text-slate-400 dark:hover:bg-slate-800"
          aria-label="Sair"
          title="Sair"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  )
}
