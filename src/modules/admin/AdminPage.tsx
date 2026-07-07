import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Building2, Pencil, Trash2, Plus } from 'lucide-react'
import { api, createEntity, updateEntity, removeEntity } from '../../services/api'
import { PageHeader, StatTile, Badge, TableWrap, Th, Td, Loading, Modal } from '../../components/ui'
import type { Tenant } from '../../types'

const planBadge: Record<string, string> = {
  starter: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  pro: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-400',
  enterprise: 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400',
}

const emptyTenant = (): Tenant => ({
  id: `tn-${Date.now()}`,
  name: '',
  users: 1,
  plan: 'starter',
  active: true,
})

export function AdminPage() {
  const { data, isLoading } = useQuery({ queryKey: ['tenants'], queryFn: api.getTenants })
  const [editing, setEditing] = useState<Tenant | null>(null)
  const queryClient = useQueryClient()
  if (isLoading) return <Loading />

  const rows = data ?? []
  const ativos = rows.filter((t) => t.active).length
  const usuarios = rows.reduce((s, t) => s + t.users, 0)
  const isNew = (id: string) => !rows.some((t) => t.id === id)

  const save = async () => {
    if (!editing?.name.trim()) return
    if (isNew(editing.id)) await createEntity('tenants', editing)
    else await updateEntity('tenants', editing.id, editing)
    await queryClient.invalidateQueries({ queryKey: ['tenants'] })
    setEditing(null)
  }
  const remove = async (id: string) => {
    await removeEntity('tenants', id)
    await queryClient.invalidateQueries({ queryKey: ['tenants'] })
  }

  return (
    <div>
      <PageHeader
        title="Admin / Tenants"
        subtitle="Workspaces (multi-tenant) e planos"
        actions={
          <button
            onClick={() => setEditing(emptyTenant())}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-600"
          >
            <Plus size={15} /> Novo tenant
          </button>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3">
        <StatTile label="Tenants" value={rows.length} icon={<Building2 />} />
        <StatTile label="Ativos" value={ativos} accent="text-emerald-500" />
        <StatTile label="Usuários totais" value={usuarios} accent="text-indigo-500" />
      </div>

      <TableWrap>
        <thead>
          <tr>
            <Th>Tenant</Th>
            <Th>Usuários</Th>
            <Th>Plano</Th>
            <Th>Situação</Th>
            <Th>Ações</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((t) => (
            <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
              <Td className="font-medium text-slate-900 dark:text-white">{t.name}</Td>
              <Td>{t.users}</Td>
              <Td><Badge className={planBadge[t.plan]}>{t.plan}</Badge></Td>
              <Td>
                {t.active ? (
                  <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">Ativo</Badge>
                ) : (
                  <Badge className="bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400">Inativo</Badge>
                )}
              </Td>
              <Td>
                <div className="flex gap-1">
                  <button onClick={() => setEditing({ ...t })} title="Editar" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-500 dark:hover:bg-slate-800">
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => remove(t.id)} title="Excluir" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-rose-500 dark:hover:bg-slate-800">
                    <Trash2 size={15} />
                  </button>
                </div>
              </Td>
            </tr>
          ))}
        </tbody>
      </TableWrap>

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing && !isNew(editing.id) ? 'Editar tenant' : 'Novo tenant'}
        footer={
          <>
            <button onClick={() => setEditing(null)} className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
              Cancelar
            </button>
            <button onClick={save} className="rounded-lg bg-indigo-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-600">
              Salvar
            </button>
          </>
        }
      >
        {editing && (
          <div className="space-y-3">
            <input
              value={editing.name}
              onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              placeholder="Nome do tenant"
              className="w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
            />
            <div className="flex gap-3">
              <label className="flex-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                Usuários
                <input
                  type="number"
                  min="1"
                  value={editing.users}
                  onChange={(e) => setEditing({ ...editing, users: Number(e.target.value) })}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
                />
              </label>
              <label className="flex-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                Plano
                <select
                  value={editing.plan}
                  onChange={(e) => setEditing({ ...editing, plan: e.target.value as Tenant['plan'] })}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
                >
                  <option value="starter">Starter</option>
                  <option value="pro">Pro</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </label>
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <input
                type="checkbox"
                checked={editing.active}
                onChange={(e) => setEditing({ ...editing, active: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300"
              />
              Ativo
            </label>
          </div>
        )}
      </Modal>
    </div>
  )
}
