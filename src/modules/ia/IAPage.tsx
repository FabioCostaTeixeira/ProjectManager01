import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Sparkles, Send } from 'lucide-react'
import { api } from '../../services/api'
import { Card, PageHeader, Badge, Loading, Tabs } from '../../components/ui'
import type { InsightSeverity } from '../../types'

const sevStyle: Record<InsightSeverity, { dot: string; badge: string; label: string }> = {
  info: { dot: 'bg-sky-500', badge: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400', label: 'Info' },
  atencao: { dot: 'bg-amber-500', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400', label: 'Atenção' },
  critico: { dot: 'bg-rose-500', badge: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400', label: 'Crítico' },
}

type ViewTab = 'insights' | 'chat' | 'estimar'
type ChatMessage = { id: string; role: 'user' | 'ia'; text: string }

// Respostas simuladas por palavra-chave (DEC-005: determinístico, sem chamada de rede).
function simulateReply(input: string): string {
  const q = input.toLowerCase()
  if (q.includes('risco')) return 'Encontrei 1 projeto em risco: "App Mobile Vendas" (69% do orçamento gasto, 38% de progresso).'
  if (q.includes('sla') || q.includes('chamado')) return 'Há 2 chamados críticos abertos, com SLA de resposta de 4h cada.'
  if (q.includes('capacidade') || q.includes('sobrealoc')) return 'Bruno Alves está sobrealocado nesta semana: 46h alocadas para 40h disponíveis.'
  return 'Não tenho um insight específico para isso ainda — esta é uma simulação local, sem IA real conectada.'
}

// Faixa de horas estimada de forma determinística (mesma entrada -> mesma saída).
function estimateHours(description: string, complexity: 'baixa' | 'media' | 'alta'): { min: number; max: number } {
  const base = Math.max(4, description.trim().length / 2)
  const factor = complexity === 'alta' ? 3 : complexity === 'media' ? 1.8 : 1
  const min = Math.round(base * factor)
  const max = Math.round(min * 1.4)
  return { min, max }
}

export function IAPage() {
  const [view, setView] = useState<ViewTab>('insights')
  const { data, isLoading } = useQuery({ queryKey: ['insights'], queryFn: api.getInsights })

  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'm1', role: 'ia', text: 'Olá! Pergunte sobre riscos, SLA ou capacidade da operação.' },
  ])
  const [chatInput, setChatInput] = useState('')

  const [estimateForm, setEstimateForm] = useState({ description: '', complexity: 'media' as 'baixa' | 'media' | 'alta' })
  const [estimateResult, setEstimateResult] = useState<{ min: number; max: number } | null>(null)
  const [estimateError, setEstimateError] = useState('')

  if (isLoading) return <Loading />

  const sendMessage = () => {
    if (!chatInput.trim()) return
    const userMsg: ChatMessage = { id: `u-${messages.length}`, role: 'user', text: chatInput.trim() }
    const reply: ChatMessage = { id: `ia-${messages.length}`, role: 'ia', text: simulateReply(chatInput) }
    setMessages((m) => [...m, userMsg, reply])
    setChatInput('')
  }

  const submitEstimate = () => {
    if (!estimateForm.description.trim()) {
      setEstimateError('Descreva o escopo antes de estimar.')
      setEstimateResult(null)
      return
    }
    setEstimateError('')
    setEstimateResult(estimateHours(estimateForm.description, estimateForm.complexity))
  }

  return (
    <div>
      <PageHeader title="IA / Insights" subtitle="Análises automáticas, chat e estimativa (simulação local)" />

      <Tabs
        tabs={[
          { id: 'insights', label: 'Insights' },
          { id: 'chat', label: 'Chat' },
          { id: 'estimar', label: 'Estimar' },
        ]}
        active={view}
        onChange={setView}
      />

      {view === 'insights' && (
        <>
          <Card className="mb-6 flex items-center gap-4 bg-gradient-to-r from-indigo-500 to-violet-500 p-5 text-white">
            <Sparkles size={28} />
            <div>
              <p className="text-sm font-semibold">Resumo gerado por IA</p>
              <p className="text-sm text-white/80">
                {data?.length ?? 0} sinais detectados. {data?.filter((i) => i.severity === 'critico').length ?? 0} críticos exigem ação hoje.
              </p>
            </div>
          </Card>

          <div className="space-y-3">
            {(data ?? []).map((i) => {
              const s = sevStyle[i.severity]
              return (
                <Card key={i.id} className="flex items-start gap-3 p-4">
                  <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${s.dot}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{i.title}</p>
                      <Badge className={s.badge}>{s.label}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{i.description}</p>
                  </div>
                </Card>
              )
            })}
          </div>
        </>
      )}

      {view === 'chat' && (
        <Card className="flex h-[420px] flex-col">
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={
                  m.role === 'user'
                    ? 'ml-auto max-w-[75%] rounded-lg bg-indigo-500 px-3 py-2 text-sm text-white'
                    : 'mr-auto max-w-[75%] rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200'
                }
              >
                {m.text}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 border-t border-slate-100 p-3 dark:border-slate-800">
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Pergunte sobre riscos, SLA, capacidade…"
              className="flex-1 rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
            />
            <button onClick={sendMessage} className="rounded-lg bg-indigo-500 p-2 text-white hover:bg-indigo-600">
              <Send size={16} />
            </button>
          </div>
        </Card>
      )}

      {view === 'estimar' && (
        <div>
          <Card className="mb-4 space-y-3 p-4">
            <textarea
              value={estimateForm.description}
              onChange={(e) => setEstimateForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Descreva o escopo a estimar…"
              rows={3}
              className="w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
            />
            <select
              value={estimateForm.complexity}
              onChange={(e) => setEstimateForm((f) => ({ ...f, complexity: e.target.value as typeof f.complexity }))}
              className="rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
            >
              <option value="baixa">Complexidade baixa</option>
              <option value="media">Complexidade média</option>
              <option value="alta">Complexidade alta</option>
            </select>
            <button onClick={submitEstimate} className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600">
              Estimar
            </button>
          </Card>
          {estimateError && <p className="mb-3 text-sm text-rose-500">{estimateError}</p>}
          {estimateResult && (
            <Card className="p-4">
              <p className="text-sm text-slate-500 dark:text-slate-400">Estimativa simulada</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">
                {estimateResult.min}h – {estimateResult.max}h
              </p>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
