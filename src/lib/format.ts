export const brl = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })

export const dateBR = (iso: string) => {
  const [y, m, d] = iso.split('-')
  if (!y || !m || !d) return iso
  return `${d}/${m}/${y}`
}

export const pct = (v: number) => `${Math.round(v)}%`

// Rótulos e cores (classes Tailwind) por status. Tom claro/escuro incluído.
type BadgeStyle = { label: string; className: string }

const base = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
const green = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400'
const amber = 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400'
const red = 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400'
const blue = 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400'
const violet = 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400'

export const projectStatusBadge: Record<string, BadgeStyle> = {
  planejado: { label: 'Planejado', className: base },
  em_andamento: { label: 'Em andamento', className: blue },
  em_risco: { label: 'Em risco', className: red },
  pausado: { label: 'Pausado', className: amber },
  concluido: { label: 'Concluído', className: green },
}

export const healthDot: Record<string, string> = {
  verde: 'bg-emerald-500',
  amarelo: 'bg-amber-500',
  vermelho: 'bg-rose-500',
}

export const priorityBadge: Record<string, BadgeStyle> = {
  baixa: { label: 'Baixa', className: base },
  media: { label: 'Média', className: blue },
  alta: { label: 'Alta', className: amber },
  critica: { label: 'Crítica', className: red },
}

export const taskStatusLabel: Record<string, string> = {
  backlog: 'Backlog',
  todo: 'A fazer',
  doing: 'Em andamento',
  review: 'Revisão',
  done: 'Concluído',
}

export const deliverableBadge: Record<string, BadgeStyle> = {
  pendente: { label: 'Pendente', className: base },
  em_producao: { label: 'Em produção', className: blue },
  em_aprovacao: { label: 'Em aprovação', className: violet },
  aprovado: { label: 'Aprovado', className: green },
  entregue: { label: 'Entregue', className: green },
}

export const demandBadge: Record<string, BadgeStyle> = {
  nova: { label: 'Nova', className: base },
  triagem: { label: 'Triagem', className: blue },
  aprovada: { label: 'Aprovada', className: violet },
  em_execucao: { label: 'Em execução', className: amber },
  concluida: { label: 'Concluída', className: green },
}

export const ticketBadge: Record<string, BadgeStyle> = {
  aberto: { label: 'Aberto', className: blue },
  em_atendimento: { label: 'Em atendimento', className: amber },
  aguardando: { label: 'Aguardando', className: violet },
  resolvido: { label: 'Resolvido', className: green },
  fechado: { label: 'Fechado', className: base },
}

export const financeBadge: Record<string, BadgeStyle> = {
  previsto: { label: 'Previsto', className: blue },
  pago: { label: 'Pago', className: green },
  atrasado: { label: 'Atrasado', className: red },
}

export const sprintBadge: Record<string, BadgeStyle> = {
  planejada: { label: 'Planejada', className: base },
  ativa: { label: 'Ativa', className: blue },
  concluida: { label: 'Concluída', className: green },
}

export const depStatusBadge: Record<string, BadgeStyle> = {
  pendente: { label: 'Pendente', className: amber },
  resolvida: { label: 'Resolvida', className: green },
  atrasada: { label: 'Atrasada', className: red },
}

export const depKindBadge: Record<string, BadgeStyle> = {
  bloqueia: { label: 'Bloqueia', className: red },
  aguarda: { label: 'Aguarda', className: amber },
  relacionada: { label: 'Relacionada', className: base },
}

export const closingBadge: Record<string, BadgeStyle> = {
  aberto: { label: 'Aberto', className: blue },
  liberado: { label: 'Liberado', className: green },
  cancelado: { label: 'Cancelado', className: base },
}

export const crmStageLabel: Record<string, string> = {
  lead: 'Lead',
  qualificacao: 'Qualificação',
  proposta: 'Proposta',
  negociacao: 'Negociação',
  ganho: 'Ganho',
  perdido: 'Perdido',
}

export const requestBadge: Record<string, BadgeStyle> = {
  nova: { label: 'Nova', className: base },
  levantamento: { label: 'Levantamento', className: blue },
  convertida: { label: 'Convertida', className: green },
  recusada: { label: 'Recusada', className: red },
}

export const alertSeverityBadge: Record<string, BadgeStyle> = {
  info: { label: 'Info', className: base },
  atencao: { label: 'Atenção', className: amber },
  critico: { label: 'Crítico', className: red },
}

export const recurringStatusBadge: Record<string, BadgeStyle> = {
  ativo: { label: 'Ativo', className: green },
  pausado: { label: 'Pausado', className: base },
}

export const monthBR = (comp: string) => {
  const [y, m] = comp.split('-')
  const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
  return `${meses[Number(m) - 1] ?? m}/${y}`
}
