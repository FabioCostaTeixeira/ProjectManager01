export type ID = string

export interface User {
  id: ID
  name: string
  email: string
  role: string
  color: string
  profileId: ID | null
}

export type ProjectStatus =
  | 'planejado'
  | 'em_andamento'
  | 'em_risco'
  | 'pausado'
  | 'concluido'

export type Health = 'verde' | 'amarelo' | 'vermelho'

export interface Project {
  id: ID
  name: string
  client: string
  status: ProjectStatus
  health: Health
  progress: number // 0..100
  startDate: string
  endDate: string
  ownerId: ID
  budget: number
  spent: number
}

export type TaskStatus = 'backlog' | 'todo' | 'doing' | 'review' | 'done'
export type Priority = 'baixa' | 'media' | 'alta' | 'critica'

export interface Task {
  id: ID
  entregableId: ID
  title: string
  status: TaskStatus
  priority: Priority
  assigneeId: ID
  dueDate: string
  tags: string[]
}

export type DeliverableStatus =
  | 'pendente'
  | 'em_producao'
  | 'em_aprovacao'
  | 'aprovado'
  | 'entregue'

export interface Deliverable {
  id: ID
  projectId: ID
  name: string
  status: DeliverableStatus
  ownerId: ID
  dueDate: string
}

export type DemandStatus =
  | 'nova'
  | 'triagem'
  | 'aprovada'
  | 'em_execucao'
  | 'concluida'

export interface Demand {
  id: ID
  title: string
  requester: string
  area: string
  priority: Priority
  status: DemandStatus
  createdAt: string
}

export type TicketStatus =
  | 'aberto'
  | 'em_atendimento'
  | 'aguardando'
  | 'resolvido'
  | 'fechado'

export interface Ticket {
  id: ID
  subject: string
  requester: string
  category: string
  priority: Priority
  status: TicketStatus
  slaHours: number
  createdAt: string
}

export interface CapacityRow {
  userId: ID
  availableHours: number
  allocatedHours: number
  activeProjects: number
}

export interface TimeEntry {
  id: ID
  userId: ID
  projectId: ID
  date: string
  hours: number
  description: string
  billable: boolean
}

export type FinanceType = 'receita' | 'despesa'
export type FinanceStatus = 'previsto' | 'pago' | 'atrasado'

export interface FinanceRecord {
  id: ID
  projectId: ID
  type: FinanceType
  description: string
  amount: number
  dueDate: string
  status: FinanceStatus
}

export type InsightSeverity = 'info' | 'atencao' | 'critico'

export interface Insight {
  id: ID
  title: string
  description: string
  severity: InsightSeverity
}

/* ---- Módulos adicionais (estrutura Gestao_Projetos) ---- */

export interface Sprint {
  id: ID
  name: string
  projectId: ID
  startDate: string
  endDate: string
  status: 'planejada' | 'ativa' | 'concluida'
  committed: number
  done: number
}

export type DependencyKind = 'bloqueia' | 'aguarda' | 'relacionada'
export type DependencyStatus = 'pendente' | 'resolvida' | 'atrasada'

export interface Dependency {
  id: ID
  from: string
  to: string
  kind: DependencyKind
  status: DependencyStatus
  notified: boolean
}

export interface PlanningItem {
  id: ID
  name: string
  projectId: ID
  kind: 'entregavel' | 'demanda'
  hasDemand: boolean
  esforco: number
}

export type ClosingStatus = 'aberto' | 'liberado' | 'cancelado'

export interface Closing {
  id: ID
  competencia: string // YYYY-MM
  clientId: ID
  hours: number
  amount: number
  status: ClosingStatus
}

export interface Prepaid {
  id: ID
  clientId: ID
  saldo: number
  cargaMes: number
  consumoMes: number
}

export interface NoteColumn {
  id: ID
  title: string
}

export interface NoteCard {
  id: ID
  columnId: ID
  title: string
  checklist: { text: string; done: boolean }[]
  tags: string[]
}

export type CrmStage = 'lead' | 'qualificacao' | 'proposta' | 'negociacao' | 'ganho' | 'perdido'

export interface Opportunity {
  id: ID
  client: string
  title: string
  value: number
  stage: CrmStage
  ownerId: ID
  followups: { id: ID; date: string; note: string }[]
}

export type RequestStatus = 'nova' | 'levantamento' | 'convertida' | 'recusada'

export interface ServiceRequest {
  id: ID
  client: string
  title: string
  status: RequestStatus
  premissas: string
  createdAt: string
}

export interface ReportRow {
  id: ID
  projectId: ID
  metric: string
  value: string
  trend: 'up' | 'down' | 'flat'
}

export interface WorklogEntry {
  id: ID
  userId: ID
  projectId: ID | null
  date: string
  hours: number
  kind: 'projeto' | 'avulso'
  description: string
}

export interface Tenant {
  id: ID
  name: string
  users: number
  plan: 'starter' | 'pro' | 'enterprise'
  active: boolean
}

export interface ApiToken {
  id: ID
  name: string
  scope: string
  createdAt: string
  lastUse: string
}

export interface Client {
  id: ID
  name: string
  keyUsers: number
  valorHora: number
  recorrente: boolean
}

export interface Team {
  id: ID
  name: string
  members: number
}

export interface Expertise {
  id: ID
  name: string
  valorHora: number
}

/* ---- Pendências (TASK-001): Alertas, Chamados avançado, Capacidade avançada,
   Financeiro avançado, Fechamento recorrência, Cadastros avançado ---- */

export type AlertSeverity = 'info' | 'atencao' | 'critico'

export interface Alert {
  id: ID
  title: string
  origin: string
  severity: AlertSeverity
  date: string
  read: boolean
  snoozedUntil: string | null
}

export interface Reminder {
  id: ID
  title: string
  dueDate: string
  projectId: ID | null
  deliverableId: ID | null
  done: boolean
}

export interface TicketType {
  id: ID
  name: string
  category: string
  defaultPriority: Priority
}

export interface SlaPolicy {
  priority: Priority
  responderH: number
  resolverH: number
}

export interface WorkSchedule {
  userId: ID
  hoursPerWeek: number
}

export interface Vacation {
  id: ID
  userId: ID
  startDate: string
  endDate: string
}

export interface Holiday {
  id: ID
  date: string
  name: string
  national: boolean
}

export interface ConsumptionRow {
  projectId: ID
  contractedHours: number
  consumedHours: number
}

export interface HourAdjustment {
  id: ID
  projectId: ID
  hours: number
  reason: string
  date: string
}

export interface Reclassification {
  id: ID
  fromProjectId: ID
  toProjectId: ID
  hours: number
  reason: string
  date: string
}

export type RecurringStatus = 'ativo' | 'pausado'

export interface RecurringItem {
  id: ID
  clientId: ID
  description: string
  amount: number
  status: RecurringStatus
  startCompetencia: string // YYYY-MM
  endCompetencia: string | null
}

export interface Profile {
  id: ID
  name: string
  role: 'gestor_geral' | 'gestor_projetos' | 'gestor_time'
  permissions: string[]
  userCount: number
}

export interface Person {
  id: ID
  name: string
  expertiseId: ID
  valorHora: number
  cargaSemanal: number
  userId: ID | null
}
