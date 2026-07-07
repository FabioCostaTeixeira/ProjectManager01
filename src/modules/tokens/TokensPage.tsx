import { useQuery, useQueryClient } from '@tanstack/react-query'
import { KeyRound, Copy, Trash2 } from 'lucide-react'
import { api, createEntity, removeEntity } from '../../services/api'
import { PageHeader, Badge, TableWrap, Th, Td, Loading } from '../../components/ui'
import { dateBR } from '../../lib/format'

export function TokensPage() {
  const { data, isLoading } = useQuery({ queryKey: ['apiTokens'], queryFn: api.getApiTokens })
  const queryClient = useQueryClient()
  if (isLoading) return <Loading />

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['apiTokens'] })

  const generate = async () => {
    const today = new Date().toISOString().slice(0, 10)
    await createEntity('api-tokens', {
      id: `tk-${Date.now()}`,
      name: `Token ${dateBR(today)}`,
      scope: 'read',
      createdAt: today,
      lastUse: today,
    })
    await invalidate()
  }

  const revoke = async (id: string) => {
    await removeEntity('api-tokens', id)
    await invalidate()
  }

  return (
    <div>
      <PageHeader
        title="Tokens"
        subtitle="Chaves de API para integrações (valores mascarados)"
        actions={
          <button
            onClick={generate}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-400"
          >
            <KeyRound size={16} /> Gerar token
          </button>
        }
      />
      <TableWrap>
        <thead>
          <tr>
            <Th>Nome</Th>
            <Th>Token</Th>
            <Th>Escopo</Th>
            <Th>Criado</Th>
            <Th>Último uso</Th>
            <Th>Ações</Th>
          </tr>
        </thead>
        <tbody>
          {(data ?? []).map((t) => (
            <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
              <Td className="font-medium text-slate-900 dark:text-white">{t.name}</Td>
              <Td>
                <span className="flex items-center gap-2">
                  <code className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    sk_live_••••••••••••
                  </code>
                  <button className="text-slate-400 hover:text-indigo-500" title="Copiar"><Copy size={14} /></button>
                </span>
              </Td>
              <Td><Badge className="bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400">{t.scope}</Badge></Td>
              <Td className="whitespace-nowrap text-xs text-slate-500">{dateBR(t.createdAt)}</Td>
              <Td className="whitespace-nowrap text-xs text-slate-500">{dateBR(t.lastUse)}</Td>
              <Td>
                <button
                  onClick={() => revoke(t.id)}
                  title="Revogar"
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-500/10"
                >
                  <Trash2 size={15} />
                </button>
              </Td>
            </tr>
          ))}
        </tbody>
      </TableWrap>
    </div>
  )
}
