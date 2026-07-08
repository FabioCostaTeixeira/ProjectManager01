import { NavLink } from 'react-router-dom'
import { LayoutGrid } from 'lucide-react'
import { navItems, groupLabels, navGroups } from '../nav'
import { useUIStore } from '../stores/uiStore'
import { useAccess } from '../lib/useAccess'
import { cn } from './ui'

const groups = navGroups

export function Sidebar() {
  const collapsed = useUIStore((s) => s.sidebarCollapsed)
  const allowed = useAccess()

  return (
    <aside
      className={cn(
        'hidden shrink-0 border-r border-slate-200 bg-white/80 backdrop-blur transition-all dark:border-slate-800 dark:bg-slate-900/60 md:flex md:flex-col',
        collapsed ? 'w-16' : 'w-60',
      )}
    >
      <div className="flex h-14 items-center gap-2 px-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500 text-white">
          <LayoutGrid size={18} />
        </div>
        {!collapsed && (
          <span className="text-sm font-semibold text-slate-900 dark:text-white">Gestor de Projetos</span>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-2 pb-4">
        {groups.map((g) => {
          const visible = navItems.filter((i) => i.group === g && allowed(i.to))
          if (visible.length === 0) return null
          return (
          <div key={g} className="mt-4">
            {!collapsed && (
              <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {groupLabels[g]}
              </p>
            )}
            {visible
              .map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    title={item.label}
                    className={({ isActive }) =>
                      cn(
                        'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        collapsed && 'justify-center',
                        isActive
                          ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white',
                      )
                    }
                  >
                    <Icon size={18} className="shrink-0" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </NavLink>
                )
              })}
          </div>
          )
        })}
      </nav>
    </aside>
  )
}
