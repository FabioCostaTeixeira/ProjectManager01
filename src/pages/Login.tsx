import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LayoutGrid } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'

export function Login() {
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()
  const [email, setEmail] = useState('ana@empresa.com')
  const [workspace, setWorkspace] = useState('Minha Agência')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    login(email, workspace) // fake, só local
    navigate('/hoje')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4 text-slate-100">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500">
            <LayoutGrid size={24} />
          </div>
          <h1 className="text-xl font-semibold">Gestor de Projetos</h1>
          <p className="mt-1 text-sm text-slate-400">Entre no seu workspace (login local de demonstração)</p>
        </div>

        <form
          onSubmit={submit}
          className="space-y-4 rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-xl"
        >
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">Workspace</label>
            <input
              value={workspace}
              onChange={(e) => setWorkspace(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">Senha</label>
            <input
              type="password"
              defaultValue="demo"
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-indigo-500 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-400"
          >
            Entrar
          </button>
          <p className="text-center text-xs text-slate-500">
            Qualquer e-mail/senha funciona — autenticação é apenas local.
          </p>
        </form>
      </div>
    </div>
  )
}
