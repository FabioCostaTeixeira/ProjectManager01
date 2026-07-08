import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from '../components/Sidebar'
import { Topbar } from '../components/Topbar'
import { useAuthStore } from '../stores/authStore'
import { useAccess } from '../lib/useAccess'
import { navItems } from '../nav'

export function AppLayout() {
  const user = useAuthStore((s) => s.user)
  const allowed = useAccess()
  const { pathname } = useLocation()
  if (!user) return <Navigate to="/login" replace />

  // Guarda de rota: bloqueia página fora das permissões do perfil
  // (sub-rotas como /projetos/:id herdam da página base).
  const base = `/${pathname.split('/')[1]}`
  if (!allowed(base)) {
    const first = navItems.find((i) => allowed(i.to))
    if (first) return <Navigate to={first.to} replace />
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 text-sm text-slate-500 dark:bg-slate-950 dark:text-slate-400">
        Seu perfil não tem acesso a nenhuma página. Fale com o administrador.
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
