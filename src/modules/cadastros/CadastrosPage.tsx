import { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Trash2, Plus } from 'lucide-react'
import { api, createEntity, updateEntity, removeEntity } from '../../services/api'
import { PageHeader, Badge, Avatar, TableWrap, Th, Td, Loading, Tabs, Modal } from '../../components/ui'
import { brl } from '../../lib/format'
import { PERMISSIONS_CATALOG, PERMISSION_GROUPS, ALL_ACCESS } from '../../lib/permissions'
import { usePermissionsStore } from '../../stores/permissionsStore'
import type { Client, Profile, User } from '../../types'

const emptyProfile = (): Profile => ({
  id: `pf-${Date.now()}`,
  name: '',
  role: 'gestor_time',
  permissions: [],
  userCount: 0,
})

const AVATAR_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#0ea5e9']

const emptyUser = (): User => ({
  id: `u-${Date.now()}`,
  name: '',
  email: '',
  role: '',
  color: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
  profileId: null,
})

const emptyClient = (): Client => ({
  id: `cl-${Date.now()}`,
  name: '',
  keyUsers: 1,
  valorHora: 0,
  recorrente: false,
})

type Tab = 'usuarios' | 'clientes' | 'times' | 'expertises' | 'perfis' | 'pessoas'
const tabs: { id: Tab; label: string }[] = [
  { id: 'usuarios', label: 'Usuários' },
  { id: 'clientes', label: 'Clientes' },
  { id: 'times', label: 'Times' },
  { id: 'expertises', label: 'Expertises' },
  { id: 'perfis', label: 'Perfis' },
  { id: 'pessoas', label: 'Pessoas' },
]

export function CadastrosPage() {
  const [tab, setTab] = useState<Tab>('usuarios')
  const users = useQuery({ queryKey: ['users'], queryFn: api.getUsers })
  const clients = useQuery({ queryKey: ['clients'], queryFn: api.getClients })
  const teams = useQuery({ queryKey: ['teams'], queryFn: api.getTeams })
  const expertises = useQuery({ queryKey: ['expertises'], queryFn: api.getExpertises })
  const people = useQuery({ queryKey: ['people'], queryFn: api.getPeople })
  const profilesQ = useQuery({ queryKey: ['profiles'], queryFn: api.getProfiles })
  const { profiles, assignments, setAll, saveProfile, deleteProfile, assignProfile } = usePermissionsStore()
  useEffect(() => {
    if (profilesQ.data) setAll(profilesQ.data)
  }, [profilesQ.data, setAll])
  const [editing, setEditing] = useState<Profile | null>(null)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [userPassword, setUserPassword] = useState('')
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const queryClient = useQueryClient()
  if (users.isLoading) return <Loading />

  const isNew = (list: { id: string }[] | undefined, id: string) => !(list ?? []).some((x) => x.id === id)

  const saveUser = async () => {
    if (!editingUser?.name.trim() || !editingUser.email.trim()) return
    // Senha opcional: se preenchida, o backend faz o hash (bcrypt) antes de gravar.
    const body = userPassword ? { ...editingUser, password: userPassword } : editingUser
    if (isNew(users.data, editingUser.id)) await createEntity('users', body)
    else await updateEntity('users', editingUser.id, body)
    await queryClient.invalidateQueries({ queryKey: ['users'] })
    setEditingUser(null)
    setUserPassword('')
  }
  const deleteUser = async (id: string) => {
    await removeEntity('users', id)
    await queryClient.invalidateQueries({ queryKey: ['users'] })
  }
  const saveClient = async () => {
    if (!editingClient?.name.trim()) return
    if (isNew(clients.data, editingClient.id)) await createEntity('clients', editingClient)
    else await updateEntity('clients', editingClient.id, editingClient)
    await queryClient.invalidateQueries({ queryKey: ['clients'] })
    setEditingClient(null)
  }
  const deleteClient = async (id: string) => {
    await removeEntity('clients', id)
    await queryClient.invalidateQueries({ queryKey: ['clients'] })
  }

  const expertiseOf = (id: string) => expertises.data?.find((e) => e.id === id)?.name ?? '—'
  const userOf = (id: string | null) => users.data?.find((u) => u.id === id)
  // Perfil efetivo do usuário: atribuição de sessão sobrepõe o seed.
  const profileIdOf = (u: { id: string; profileId: string | null }) =>
    u.id in assignments ? assignments[u.id] : u.profileId
  const usersWithProfile = (profileId: string) =>
    (users.data ?? []).filter((u) => profileIdOf(u) === profileId).length

  const togglePermission = (key: string) => {
    if (!editing) return
    const has = editing.permissions.includes(key)
    setEditing({ ...editing, permissions: has ? editing.permissions.filter((p) => p !== key) : [...editing.permissions, key] })
  }
  const allAccess = editing?.permissions.includes(ALL_ACCESS) ?? false

  return (
    <div>
      <PageHeader title="Cadastros" subtitle="Base de usuários, clientes, times, expertises, perfis e pessoas" />

      <Tabs tabs={tabs} active={tab} onChange={setTab} />

      {tab === 'usuarios' && (
        <div>
          <div className="mb-3 flex justify-end">
            <button
              onClick={() => setEditingUser(emptyUser())}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-600"
            >
              <Plus size={15} /> Novo usuário
            </button>
          </div>
          <TableWrap>
            <thead><tr><Th>Nome</Th><Th>E-mail</Th><Th>Papel</Th><Th>Perfil</Th><Th>Ações</Th></tr></thead>
            <tbody>
              {(users.data ?? []).map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <Td><span className="flex items-center gap-2 font-medium text-slate-900 dark:text-white"><Avatar name={u.name} color={u.color} size={26} /> {u.name}</span></Td>
                  <Td className="text-slate-500">{u.email}</Td>
                  <Td>{u.role}</Td>
                  <Td>
                    <select
                      value={profileIdOf(u) ?? ''}
                      onChange={(e) => assignProfile(u.id, e.target.value || null)}
                      className="rounded-lg border border-slate-200 bg-transparent px-2 py-1 text-sm dark:border-slate-700"
                    >
                      <option value="">Sem perfil</option>
                      {profiles.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </Td>
                  <Td>
                    <div className="flex gap-1">
                      <button onClick={() => setEditingUser({ ...u })} title="Editar" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-500 dark:hover:bg-slate-800">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => deleteUser(u.id)} title="Excluir" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-rose-500 dark:hover:bg-slate-800">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>

          <Modal
            open={editingUser !== null}
            onClose={() => setEditingUser(null)}
            title={editingUser && !isNew(users.data, editingUser.id) ? 'Editar usuário' : 'Novo usuário'}
            footer={
              <>
                <button onClick={() => setEditingUser(null)} className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
                  Cancelar
                </button>
                <button onClick={saveUser} className="rounded-lg bg-indigo-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-600">
                  Salvar
                </button>
              </>
            }
          >
            {editingUser && (
              <div className="space-y-3">
                <input
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  placeholder="Nome completo"
                  className="w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
                />
                <input
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  placeholder="E-mail"
                  type="email"
                  className="w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
                />
                <input
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                  placeholder="Papel (ex. Gestor de Projetos)"
                  className="w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
                />
                <select
                  value={editingUser.profileId ?? ''}
                  onChange={(e) => setEditingUser({ ...editingUser, profileId: e.target.value || null })}
                  className="w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
                >
                  <option value="">Sem perfil</option>
                  {profiles.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <input
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                  placeholder={isNew(users.data, editingUser.id) ? 'Senha de acesso' : 'Nova senha (deixe vazio para manter)'}
                  type="password"
                  className="w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
                />
              </div>
            )}
          </Modal>
        </div>
      )}

      {tab === 'clientes' && (
        <div>
          <div className="mb-3 flex justify-end">
            <button
              onClick={() => setEditingClient(emptyClient())}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-600"
            >
              <Plus size={15} /> Novo cliente
            </button>
          </div>
          <TableWrap>
            <thead><tr><Th>Cliente</Th><Th>Key users</Th><Th>Valor/hora</Th><Th>Recorrente</Th><Th>Ações</Th></tr></thead>
            <tbody>
              {(clients.data ?? []).map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <Td className="font-medium text-slate-900 dark:text-white">{c.name}</Td>
                  <Td>{c.keyUsers}</Td>
                  <Td>{brl(c.valorHora)}</Td>
                  <Td>
                    {c.recorrente ? (
                      <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">Sim</Badge>
                    ) : (
                      <Badge className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">Não</Badge>
                    )}
                  </Td>
                  <Td>
                    <div className="flex gap-1">
                      <button onClick={() => setEditingClient({ ...c })} title="Editar" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-500 dark:hover:bg-slate-800">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => deleteClient(c.id)} title="Excluir" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-rose-500 dark:hover:bg-slate-800">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>

          <Modal
            open={editingClient !== null}
            onClose={() => setEditingClient(null)}
            title={editingClient && !isNew(clients.data, editingClient.id) ? 'Editar cliente' : 'Novo cliente'}
            footer={
              <>
                <button onClick={() => setEditingClient(null)} className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
                  Cancelar
                </button>
                <button onClick={saveClient} className="rounded-lg bg-indigo-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-600">
                  Salvar
                </button>
              </>
            }
          >
            {editingClient && (
              <div className="space-y-3">
                <input
                  value={editingClient.name}
                  onChange={(e) => setEditingClient({ ...editingClient, name: e.target.value })}
                  placeholder="Nome do cliente"
                  className="w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
                />
                <div className="flex gap-3">
                  <label className="flex-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                    Key users
                    <input
                      type="number"
                      min="0"
                      value={editingClient.keyUsers}
                      onChange={(e) => setEditingClient({ ...editingClient, keyUsers: Number(e.target.value) })}
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
                    />
                  </label>
                  <label className="flex-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                    Valor/hora (R$)
                    <input
                      type="number"
                      min="0"
                      value={editingClient.valorHora}
                      onChange={(e) => setEditingClient({ ...editingClient, valorHora: Number(e.target.value) })}
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
                    />
                  </label>
                </div>
                <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={editingClient.recorrente}
                    onChange={(e) => setEditingClient({ ...editingClient, recorrente: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  Contrato recorrente
                </label>
              </div>
            )}
          </Modal>
        </div>
      )}

      {tab === 'times' && (
        <TableWrap>
          <thead><tr><Th>Time</Th><Th>Membros</Th></tr></thead>
          <tbody>
            {(teams.data ?? []).map((t) => (
              <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <Td className="font-medium text-slate-900 dark:text-white">{t.name}</Td>
                <Td>{t.members}</Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      )}

      {tab === 'expertises' && (
        <TableWrap>
          <thead><tr><Th>Expertise</Th><Th>Valor/hora</Th></tr></thead>
          <tbody>
            {(expertises.data ?? []).map((e) => (
              <tr key={e.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <Td className="font-medium text-slate-900 dark:text-white">{e.name}</Td>
                <Td>{brl(e.valorHora)}</Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      )}

      {tab === 'perfis' && (
        <div>
          <div className="mb-3 flex justify-end">
            <button
              onClick={() => setEditing(emptyProfile())}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-600"
            >
              <Plus size={15} /> Novo perfil
            </button>
          </div>
          <TableWrap>
            <thead><tr><Th>Perfil</Th><Th>Papel</Th><Th>Permissões</Th><Th>Usuários</Th><Th>Ações</Th></tr></thead>
            <tbody>
              {profiles.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <Td className="font-medium text-slate-900 dark:text-white">{p.name}</Td>
                  <Td className="text-slate-500">{p.role}</Td>
                  <Td>
                    <div className="flex flex-wrap gap-1">
                      {p.permissions.map((perm) => (
                        <Badge key={perm} className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">{perm}</Badge>
                      ))}
                    </div>
                  </Td>
                  <Td>{usersWithProfile(p.id)}</Td>
                  <Td>
                    <div className="flex gap-1">
                      <button onClick={() => setEditing({ ...p })} title="Editar" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-500 dark:hover:bg-slate-800">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => deleteProfile(p.id)} title="Excluir" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-rose-500 dark:hover:bg-slate-800">
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
            title={editing && profiles.some((p) => p.id === editing.id) ? 'Editar perfil' : 'Novo perfil'}
            footer={
              <>
                <button onClick={() => setEditing(null)} className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    if (!editing?.name.trim()) return
                    saveProfile(editing)
                    setEditing(null)
                  }}
                  className="rounded-lg bg-indigo-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-600"
                >
                  Salvar
                </button>
              </>
            }
          >
            {editing && (
              <div className="space-y-4">
                <input
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  placeholder="Nome do perfil"
                  className="w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
                />
                <select
                  value={editing.role}
                  onChange={(e) => setEditing({ ...editing, role: e.target.value as Profile['role'] })}
                  className="w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
                >
                  <option value="gestor_geral">Gestor Geral</option>
                  <option value="gestor_projetos">Gestor de Projetos</option>
                  <option value="gestor_time">Membro de Time</option>
                </select>

                <label className="flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-white">
                  <input
                    type="checkbox"
                    checked={allAccess}
                    onChange={(e) => setEditing({ ...editing, permissions: e.target.checked ? [ALL_ACCESS] : [] })}
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  Acesso total
                </label>

                {PERMISSION_GROUPS.map((group) => (
                  <div key={group}>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">{group}</p>
                    <div className="grid grid-cols-2 gap-1">
                      {PERMISSIONS_CATALOG.filter((p) => p.group === group).map((p) => (
                        <label key={p.key} className={allAccess ? 'flex items-center gap-2 text-sm text-slate-300 dark:text-slate-600' : 'flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300'}>
                          <input
                            type="checkbox"
                            disabled={allAccess}
                            checked={allAccess || editing.permissions.includes(p.key)}
                            onChange={() => togglePermission(p.key)}
                            className="h-4 w-4 rounded border-slate-300"
                          />
                          {p.label}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Modal>
        </div>
      )}

      {tab === 'pessoas' && (
        <TableWrap>
          <thead><tr><Th>Nome</Th><Th>Expertise</Th><Th>Valor/hora</Th><Th>Carga semanal</Th><Th>Usuário vinculado</Th></tr></thead>
          <tbody>
            {(people.data ?? []).map((p) => {
              const u = userOf(p.userId)
              return (
                <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <Td className="font-medium text-slate-900 dark:text-white">{p.name}</Td>
                  <Td>{expertiseOf(p.expertiseId)}</Td>
                  <Td>{brl(p.valorHora)}</Td>
                  <Td>{p.cargaSemanal}h</Td>
                  <Td>
                    {u ? (
                      <span className="flex items-center gap-2"><Avatar name={u.name} color={u.color} size={22} /> {u.name}</span>
                    ) : (
                      <span className="text-xs text-slate-400">Sem usuário (terceiro)</span>
                    )}
                  </Td>
                </tr>
              )
            })}
          </tbody>
        </TableWrap>
      )}
    </div>
  )
}
