import type {
  User,
  Project,
  Task,
  Deliverable,
  Demand,
  Ticket,
  CapacityRow,
  TimeEntry,
  FinanceRecord,
  Insight,
} from '../types'

export const users: User[] = [
  { id: 'u1', name: 'Ana Ribeiro', email: 'ana@empresa.com', role: 'Gerente de Projetos', color: '#6366f1', profileId: 'pf1' },
  { id: 'u2', name: 'Bruno Alves', email: 'bruno@empresa.com', role: 'Tech Lead', color: '#0ea5e9', profileId: 'pf2' },
  { id: 'u3', name: 'Carla Mendes', email: 'carla@empresa.com', role: 'Designer', color: '#ec4899', profileId: 'pf3' },
  { id: 'u4', name: 'Diego Souza', email: 'diego@empresa.com', role: 'Desenvolvedor', color: '#22c55e', profileId: 'pf3' },
  { id: 'u5', name: 'Elena Costa', email: 'elena@empresa.com', role: 'Analista de Negócios', color: '#f59e0b', profileId: 'pf2' },
  { id: 'u6', name: 'Felipe Nunes', email: 'felipe@empresa.com', role: 'QA', color: '#a855f7', profileId: 'pf3' },
]

export const projects: Project[] = [
  { id: 'p1', name: 'Portal do Cliente', client: 'Acme Corp', status: 'em_andamento', health: 'verde', progress: 62, startDate: '2026-04-01', endDate: '2026-09-30', ownerId: 'u1', budget: 180000, spent: 98000 },
  { id: 'p2', name: 'App Mobile Vendas', client: 'Nordeste Varejo', status: 'em_risco', health: 'vermelho', progress: 38, startDate: '2026-03-15', endDate: '2026-08-15', ownerId: 'u2', budget: 240000, spent: 165000 },
  { id: 'p3', name: 'Data Lake Financeiro', client: 'Banco Sul', status: 'em_andamento', health: 'amarelo', progress: 51, startDate: '2026-02-01', endDate: '2026-12-01', ownerId: 'u1', budget: 420000, spent: 210000 },
  { id: 'p4', name: 'Rebranding Site', client: 'Verde Moda', status: 'concluido', health: 'verde', progress: 100, startDate: '2026-01-10', endDate: '2026-05-20', ownerId: 'u3', budget: 90000, spent: 87000 },
  { id: 'p5', name: 'Integração ERP', client: 'Metalúrgica RS', status: 'planejado', health: 'verde', progress: 8, startDate: '2026-07-15', endDate: '2027-01-30', ownerId: 'u5', budget: 310000, spent: 12000 },
  { id: 'p6', name: 'Dashboard BI Vendas', client: 'Acme Corp', status: 'em_andamento', health: 'verde', progress: 74, startDate: '2026-05-01', endDate: '2026-08-30', ownerId: 'u2', budget: 130000, spent: 71000 },
  { id: 'p7', name: 'Migração Cloud', client: 'Log Transportes', status: 'pausado', health: 'amarelo', progress: 45, startDate: '2026-03-01', endDate: '2026-10-15', ownerId: 'u2', budget: 260000, spent: 120000 },
  { id: 'p8', name: 'Portal RH', client: 'Interno', status: 'em_andamento', health: 'verde', progress: 29, startDate: '2026-06-01', endDate: '2026-11-30', ownerId: 'u5', budget: 95000, spent: 21000 },
]

export const tasks: Task[] = [
  { id: 't1', entregableId: 'd1', title: 'Tela de login SSO', status: 'done', priority: 'alta', assigneeId: 'u4', dueDate: '2026-06-20', tags: ['frontend', 'auth'] },
  { id: 't2', entregableId: 'd1', title: 'API de faturas', status: 'doing', priority: 'alta', assigneeId: 'u2', dueDate: '2026-07-10', tags: ['backend'] },
  { id: 't3', entregableId: 'd1', title: 'Design system v2', status: 'review', priority: 'media', assigneeId: 'u3', dueDate: '2026-07-08', tags: ['design'] },
  { id: 't4', entregableId: 'd2', title: 'Fluxo de checkout offline', status: 'doing', priority: 'critica', assigneeId: 'u4', dueDate: '2026-07-05', tags: ['mobile'] },
  { id: 't5', entregableId: 'd2', title: 'Sincronização de estoque', status: 'todo', priority: 'alta', assigneeId: 'u2', dueDate: '2026-07-15', tags: ['backend', 'sync'] },
  { id: 't6', entregableId: 'd2', title: 'Push notifications', status: 'backlog', priority: 'baixa', assigneeId: 'u4', dueDate: '2026-07-25', tags: ['mobile'] },
  { id: 't7', entregableId: 'd3', title: 'Pipeline ingestão diária', status: 'doing', priority: 'alta', assigneeId: 'u2', dueDate: '2026-07-12', tags: ['data'] },
  { id: 't8', entregableId: 'd3', title: 'Modelagem dimensional', status: 'todo', priority: 'media', assigneeId: 'u5', dueDate: '2026-07-20', tags: ['data', 'modelagem'] },
  { id: 't9', entregableId: 'd5', title: 'Medidas DAX de metas', status: 'review', priority: 'media', assigneeId: 'u5', dueDate: '2026-07-06', tags: ['bi'] },
  { id: 't10', entregableId: 'd5', title: 'Publicar dashboard', status: 'todo', priority: 'alta', assigneeId: 'u2', dueDate: '2026-07-18', tags: ['bi', 'deploy'] },
  { id: 't11', entregableId: 'd6', title: 'Cadastro de colaboradores', status: 'backlog', priority: 'media', assigneeId: 'u4', dueDate: '2026-08-01', tags: ['frontend'] },
  { id: 't12', entregableId: 'd1', title: 'Testes E2E do portal', status: 'todo', priority: 'media', assigneeId: 'u6', dueDate: '2026-07-22', tags: ['qa'] },
  { id: 't13', entregableId: 'd2', title: 'Correção crash Android 14', status: 'backlog', priority: 'critica', assigneeId: 'u6', dueDate: '2026-07-09', tags: ['mobile', 'bug'] },
  { id: 't14', entregableId: 'd3', title: 'RLS por unidade', status: 'backlog', priority: 'alta', assigneeId: 'u5', dueDate: '2026-08-05', tags: ['seguranca'] },
]

export const deliverables: Deliverable[] = [
  { id: 'd1', projectId: 'p1', name: 'MVP Portal (fase 1)', status: 'em_aprovacao', ownerId: 'u1', dueDate: '2026-07-12' },
  { id: 'd2', projectId: 'p2', name: 'Build beta Android', status: 'em_producao', ownerId: 'u2', dueDate: '2026-07-18' },
  { id: 'd3', projectId: 'p3', name: 'Camada bronze do Data Lake', status: 'aprovado', ownerId: 'u2', dueDate: '2026-06-30' },
  { id: 'd4', projectId: 'p4', name: 'Novo site institucional', status: 'entregue', ownerId: 'u3', dueDate: '2026-05-18' },
  { id: 'd5', projectId: 'p6', name: 'Dashboard vendas v1', status: 'em_aprovacao', ownerId: 'u5', dueDate: '2026-07-10' },
  { id: 'd6', projectId: 'p8', name: 'Protótipo Portal RH', status: 'pendente', ownerId: 'u5', dueDate: '2026-07-28' },
]

export const demands: Demand[] = [
  { id: 'dm1', title: 'Relatório de churn mensal', requester: 'Marketing', area: 'BI', priority: 'media', status: 'triagem', createdAt: '2026-06-28' },
  { id: 'dm2', title: 'Novo campo CNPJ no cadastro', requester: 'Comercial', area: 'Produto', priority: 'alta', status: 'aprovada', createdAt: '2026-06-30' },
  { id: 'dm3', title: 'Exportar faturas em lote', requester: 'Financeiro', area: 'Backend', priority: 'alta', status: 'em_execucao', createdAt: '2026-07-01' },
  { id: 'dm4', title: 'Modo escuro no portal', requester: 'Cliente Acme', area: 'Frontend', priority: 'baixa', status: 'nova', createdAt: '2026-07-02' },
  { id: 'dm5', title: 'Alerta de SLA por e-mail', requester: 'Suporte', area: 'Backend', priority: 'media', status: 'concluida', createdAt: '2026-06-20' },
]

export const tickets: Ticket[] = [
  { id: 'c1', subject: 'Erro 500 ao emitir fatura', requester: 'Acme Corp', category: 'Bug', priority: 'critica', status: 'em_atendimento', slaHours: 4, createdAt: '2026-07-03' },
  { id: 'c2', subject: 'Lentidão no dashboard', requester: 'Banco Sul', category: 'Performance', priority: 'alta', status: 'aberto', slaHours: 8, createdAt: '2026-07-03' },
  { id: 'c3', subject: 'Dúvida sobre permissões', requester: 'Verde Moda', category: 'Dúvida', priority: 'baixa', status: 'aguardando', slaHours: 24, createdAt: '2026-07-02' },
  { id: 'c4', subject: 'Solicita novo usuário admin', requester: 'Nordeste Varejo', category: 'Acesso', priority: 'media', status: 'resolvido', slaHours: 12, createdAt: '2026-07-01' },
  { id: 'c5', subject: 'App fecha ao abrir carrinho', requester: 'Nordeste Varejo', category: 'Bug', priority: 'critica', status: 'aberto', slaHours: 4, createdAt: '2026-07-03' },
]

export const capacity: CapacityRow[] = [
  { userId: 'u2', availableHours: 40, allocatedHours: 46, activeProjects: 4 },
  { userId: 'u4', availableHours: 40, allocatedHours: 38, activeProjects: 3 },
  { userId: 'u3', availableHours: 40, allocatedHours: 22, activeProjects: 2 },
  { userId: 'u5', availableHours: 40, allocatedHours: 34, activeProjects: 3 },
  { userId: 'u6', availableHours: 40, allocatedHours: 30, activeProjects: 2 },
  { userId: 'u1', availableHours: 40, allocatedHours: 28, activeProjects: 5 },
]

export const timeEntries: TimeEntry[] = [
  { id: 'te1', userId: 'u4', projectId: 'p1', date: '2026-07-02', hours: 6, description: 'Ajustes tela login', billable: true },
  { id: 'te2', userId: 'u2', projectId: 'p2', date: '2026-07-02', hours: 8, description: 'Checkout offline', billable: true },
  { id: 'te3', userId: 'u3', projectId: 'p1', date: '2026-07-02', hours: 4, description: 'Design system', billable: true },
  { id: 'te4', userId: 'u5', projectId: 'p3', date: '2026-07-01', hours: 5, description: 'Modelagem', billable: true },
  { id: 'te5', userId: 'u2', projectId: 'p6', date: '2026-07-01', hours: 3, description: 'Medidas DAX', billable: true },
  { id: 'te6', userId: 'u6', projectId: 'p2', date: '2026-07-02', hours: 5, description: 'Reprodução crash', billable: false },
  { id: 'te7', userId: 'u4', projectId: 'p8', date: '2026-07-03', hours: 4, description: 'Cadastro colaboradores', billable: true },
]

export const finance: FinanceRecord[] = [
  { id: 'f1', projectId: 'p1', type: 'receita', description: 'Parcela 3/6 - Portal', amount: 30000, dueDate: '2026-07-10', status: 'previsto' },
  { id: 'f2', projectId: 'p2', type: 'receita', description: 'Parcela 2/4 - App', amount: 60000, dueDate: '2026-06-30', status: 'atrasado' },
  { id: 'f3', projectId: 'p3', type: 'receita', description: 'Marco 1 - Data Lake', amount: 105000, dueDate: '2026-07-05', status: 'pago' },
  { id: 'f4', projectId: 'p1', type: 'despesa', description: 'Licenças cloud', amount: 8200, dueDate: '2026-07-08', status: 'previsto' },
  { id: 'f5', projectId: 'p2', type: 'despesa', description: 'Consultoria mobile', amount: 15000, dueDate: '2026-07-01', status: 'pago' },
  { id: 'f6', projectId: 'p6', type: 'receita', description: 'Parcela final - BI', amount: 45000, dueDate: '2026-08-30', status: 'previsto' },
  { id: 'f7', projectId: 'p4', type: 'receita', description: 'Fechamento - Rebranding', amount: 20000, dueDate: '2026-05-25', status: 'pago' },
]

export const insights: Insight[] = [
  { id: 'i1', title: 'Projeto App Mobile Vendas em risco', description: 'Gasto em 69% do orçamento com apenas 38% de progresso. Reavaliar escopo ou prazo.', severity: 'critico' },
  { id: 'i2', title: 'Bruno Alves sobrealocado', description: '46h alocadas para 40h disponíveis nesta semana em 4 projetos. Risco de gargalo.', severity: 'atencao' },
  { id: 'i3', title: '2 chamados críticos abertos', description: 'SLA de 4h para "Erro 500 ao emitir fatura" e "App fecha ao abrir carrinho".', severity: 'critico' },
  { id: 'i4', title: 'Fatura em atraso', description: 'Parcela 2/4 do App Mobile (R$ 60.000) venceu em 30/06 e segue em aberto.', severity: 'atencao' },
  { id: 'i5', title: 'Portal do Cliente saudável', description: 'Progresso 62% alinhado ao cronograma e orçamento sob controle.', severity: 'info' },
]

/* ---- Módulos adicionais ---- */
import type {
  Sprint,
  Dependency,
  PlanningItem,
  Closing,
  Prepaid,
  NoteColumn,
  NoteCard,
  Opportunity,
  ServiceRequest,
  ReportRow,
  WorklogEntry,
  Tenant,
  ApiToken,
  Client,
  Team,
  Expertise,
} from '../types'

export const sprints: Sprint[] = [
  { id: 's1', name: 'Portal — Sprint 6', projectId: 'p1', startDate: '2026-06-23', endDate: '2026-07-06', status: 'ativa', committed: 34, done: 21 },
  { id: 's2', name: 'App — Sprint 9', projectId: 'p2', startDate: '2026-06-23', endDate: '2026-07-06', status: 'ativa', committed: 40, done: 15 },
  { id: 's3', name: 'BI — Sprint 4', projectId: 'p6', startDate: '2026-06-16', endDate: '2026-06-29', status: 'concluida', committed: 28, done: 28 },
  { id: 's4', name: 'Data Lake — Sprint 5', projectId: 'p3', startDate: '2026-07-07', endDate: '2026-07-20', status: 'planejada', committed: 32, done: 0 },
]

export const dependencies: Dependency[] = [
  { id: 'dep1', from: 'API de faturas', to: 'Tela de faturas', kind: 'bloqueia', status: 'pendente', notified: true },
  { id: 'dep2', from: 'Modelagem dimensional', to: 'Pipeline ingestão', kind: 'aguarda', status: 'atrasada', notified: false },
  { id: 'dep3', from: 'Design system v2', to: 'Cadastro colaboradores', kind: 'relacionada', status: 'resolvida', notified: true },
  { id: 'dep4', from: 'Sincronização estoque', to: 'Checkout offline', kind: 'bloqueia', status: 'pendente', notified: false },
]

export const planningItems: PlanningItem[] = [
  { id: 'pl1', name: 'Relatório de churn', projectId: 'p6', kind: 'entregavel', hasDemand: false, esforco: 16 },
  { id: 'pl2', name: 'Exportação de faturas em lote', projectId: 'p1', kind: 'entregavel', hasDemand: true, esforco: 24 },
  { id: 'pl3', name: 'Alerta de SLA', projectId: 'p1', kind: 'demanda', hasDemand: true, esforco: 8 },
  { id: 'pl4', name: 'Modo escuro no portal', projectId: 'p1', kind: 'entregavel', hasDemand: false, esforco: 12 },
  { id: 'pl5', name: 'RLS por unidade', projectId: 'p3', kind: 'demanda', hasDemand: true, esforco: 20 },
]

export const closings: Closing[] = [
  { id: 'fc1', competencia: '2026-06', clientId: 'c1', hours: 142, amount: 39000, status: 'liberado' },
  { id: 'fc2', competencia: '2026-06', clientId: 'c2', hours: 180, amount: 54000, status: 'aberto' },
  { id: 'fc3', competencia: '2026-06', clientId: 'c3', hours: 96, amount: 33000, status: 'aberto' },
  { id: 'fc4', competencia: '2026-05', clientId: 'c1', hours: 138, amount: 38000, status: 'liberado' },
  { id: 'fc5', competencia: '2026-06', clientId: 'c4', hours: 20, amount: 6000, status: 'cancelado' },
]

export const prepaids: Prepaid[] = [
  { id: 'pp1', clientId: 'c1', saldo: 48, cargaMes: 80, consumoMes: 32 },
  { id: 'pp2', clientId: 'c2', saldo: 6, cargaMes: 40, consumoMes: 34 },
  { id: 'pp3', clientId: 'c3', saldo: 120, cargaMes: 120, consumoMes: 0 },
]

export const noteColumns: NoteColumn[] = [
  { id: 'nc1', title: 'Ideias' },
  { id: 'nc2', title: 'Em estudo' },
  { id: 'nc3', title: 'Decidido' },
]

export const noteCards: NoteCard[] = [
  { id: 'ncd1', columnId: 'nc1', title: 'Automatizar relatório semanal', checklist: [{ text: 'Definir métricas', done: true }, { text: 'Escolher canal', done: false }], tags: ['bi'] },
  { id: 'ncd2', columnId: 'nc1', title: 'Onboarding de novos clientes', checklist: [], tags: ['processo'] },
  { id: 'ncd3', columnId: 'nc2', title: 'Migrar filas para SQS', checklist: [{ text: 'POC', done: false }], tags: ['infra'] },
  { id: 'ncd4', columnId: 'nc3', title: 'Padronizar naming de branches', checklist: [{ text: 'Doc', done: true }], tags: ['dev'] },
]

export const opportunities: Opportunity[] = [
  { id: 'o1', client: 'Delta Logística', title: 'Portal de rastreio', value: 180000, stage: 'proposta', ownerId: 'u1', followups: [{ id: 'fu1', date: '2026-07-01', note: 'Enviada proposta v1' }] },
  { id: 'o2', client: 'Sigma Saúde', title: 'App de agendamento', value: 240000, stage: 'qualificacao', ownerId: 'u5', followups: [] },
  { id: 'o3', client: 'Acme Corp', title: 'Fase 2 do Portal', value: 90000, stage: 'negociacao', ownerId: 'u1', followups: [{ id: 'fu2', date: '2026-06-28', note: 'Reunião de escopo' }] },
  { id: 'o4', client: 'Norte Alimentos', title: 'BI de vendas', value: 60000, stage: 'lead', ownerId: 'u2', followups: [] },
  { id: 'o5', client: 'Verde Moda', title: 'Manutenção site', value: 24000, stage: 'ganho', ownerId: 'u3', followups: [] },
  { id: 'o6', client: 'Metal RS', title: 'Integração legada', value: 120000, stage: 'perdido', ownerId: 'u5', followups: [] },
]

export const serviceRequests: ServiceRequest[] = [
  { id: 'sr1', client: 'Acme Corp', title: 'Novo relatório de comissões', status: 'levantamento', premissas: 'Depende de acesso ao ERP', createdAt: '2026-07-01' },
  { id: 'sr2', client: 'Banco Sul', title: 'Painel executivo', status: 'nova', premissas: '', createdAt: '2026-07-02' },
  { id: 'sr3', client: 'Nordeste Varejo', title: 'Cupom fiscal no app', status: 'convertida', premissas: 'Escopo fechado, virou demanda #dm3', createdAt: '2026-06-25' },
  { id: 'sr4', client: 'Verde Moda', title: 'Loja em outro idioma', status: 'recusada', premissas: 'Fora do contrato atual', createdAt: '2026-06-20' },
]

export const reportRows: ReportRow[] = [
  { id: 'r1', projectId: 'p1', metric: 'Margem estimada', value: '42%', trend: 'up' },
  { id: 'r2', projectId: 'p2', metric: 'Margem estimada', value: '11%', trend: 'down' },
  { id: 'r3', projectId: 'p3', metric: 'Margem estimada', value: '38%', trend: 'flat' },
  { id: 'r4', projectId: 'p6', metric: 'Margem estimada', value: '46%', trend: 'up' },
]

export const worklog: WorklogEntry[] = [
  { id: 'w1', userId: 'u4', projectId: 'p1', date: '2026-07-03', hours: 6, kind: 'projeto', description: 'Tela login SSO' },
  { id: 'w2', userId: 'u2', projectId: 'p2', date: '2026-07-03', hours: 7, kind: 'projeto', description: 'Checkout offline' },
  { id: 'w3', userId: 'u3', projectId: null, date: '2026-07-03', hours: 2, kind: 'avulso', description: 'Reunião interna de design' },
  { id: 'w4', userId: 'u5', projectId: 'p3', date: '2026-07-02', hours: 5, kind: 'projeto', description: 'Modelagem' },
  { id: 'w5', userId: 'u6', projectId: null, date: '2026-07-02', hours: 1, kind: 'avulso', description: 'Treinamento QA' },
]

export const tenants: Tenant[] = [
  { id: 't1', name: 'Minha Agência', users: 6, plan: 'pro', active: true },
  { id: 't2', name: 'Acme Corp (portal)', users: 3, plan: 'starter', active: true },
  { id: 't3', name: 'Banco Sul (portal)', users: 2, plan: 'starter', active: true },
  { id: 't4', name: 'Demo Sandbox', users: 1, plan: 'starter', active: false },
]

export const apiTokens: ApiToken[] = [
  { id: 'tk1', name: 'CI/CD deploy', scope: 'projetos:read', createdAt: '2026-05-01', lastUse: '2026-07-03' },
  { id: 'tk2', name: 'Integração ERP', scope: 'financeiro:write', createdAt: '2026-06-10', lastUse: '2026-07-02' },
  { id: 'tk3', name: 'Zapier', scope: 'demandas:read', createdAt: '2026-06-15', lastUse: '2026-06-30' },
]

export const clients: Client[] = [
  { id: 'c1', name: 'Acme Corp', keyUsers: 3, valorHora: 280, recorrente: true },
  { id: 'c2', name: 'Nordeste Varejo', keyUsers: 2, valorHora: 260, recorrente: false },
  { id: 'c3', name: 'Banco Sul', keyUsers: 4, valorHora: 320, recorrente: true },
  { id: 'c4', name: 'Verde Moda', keyUsers: 1, valorHora: 220, recorrente: false },
  { id: 'c5', name: 'Metalúrgica RS', keyUsers: 2, valorHora: 240, recorrente: false },
]

export const teams: Team[] = [
  { id: 'tm1', name: 'Produto', members: 3 },
  { id: 'tm2', name: 'Dados & BI', members: 2 },
  { id: 'tm3', name: 'Design', members: 1 },
]

export const expertises: Expertise[] = [
  { id: 'e1', name: 'Frontend', valorHora: 180 },
  { id: 'e2', name: 'Backend', valorHora: 200 },
  { id: 'e3', name: 'Dados', valorHora: 220 },
  { id: 'e4', name: 'Design', valorHora: 160 },
  { id: 'e5', name: 'QA', valorHora: 150 },
]

/* ---- Pendências (TASK-001) ---- */
import type {
  Alert,
  Reminder,
  TicketType,
  SlaPolicy,
  WorkSchedule,
  Vacation,
  Holiday,
  ConsumptionRow,
  HourAdjustment,
  Reclassification,
  RecurringItem,
  Profile,
  Person,
} from '../types'

export const alerts: Alert[] = [
  { id: 'al1', title: 'Chamado crítico sem resposta há 3h', origin: 'Chamados', severity: 'critico', date: '2026-07-03', read: false, snoozedUntil: null },
  { id: 'al2', title: 'Projeto App Mobile Vendas em risco', origin: 'Projetos', severity: 'critico', date: '2026-07-02', read: false, snoozedUntil: null },
  { id: 'al3', title: 'Fatura em atraso — Nordeste Varejo', origin: 'Financeiro', severity: 'atencao', date: '2026-06-30', read: true, snoozedUntil: null },
  { id: 'al4', title: 'Bruno Alves sobrealocado nesta semana', origin: 'Capacidade', severity: 'atencao', date: '2026-07-01', read: false, snoozedUntil: null },
  { id: 'al5', title: 'Pré-pago Nordeste Varejo com saldo baixo', origin: 'Pré-pago', severity: 'info', date: '2026-06-29', read: true, snoozedUntil: null },
]

export const reminders: Reminder[] = [
  { id: 'rm1', title: 'Enviar proposta Fase 2 — Portal', dueDate: '2026-07-08', projectId: 'p1', deliverableId: null, done: false },
  { id: 'rm2', title: 'Validar MVP Portal com Acme', dueDate: '2026-07-12', projectId: 'p1', deliverableId: 'd1', done: false },
  { id: 'rm3', title: 'Renovar contrato Verde Moda', dueDate: '2026-07-20', projectId: null, deliverableId: null, done: false },
  { id: 'rm4', title: 'Follow-up Delta Logística', dueDate: '2026-07-05', projectId: null, deliverableId: null, done: true },
]

export const ticketTypes: TicketType[] = [
  { id: 'tt1', name: 'Bug', category: 'Técnico', defaultPriority: 'alta' },
  { id: 'tt2', name: 'Dúvida', category: 'Suporte', defaultPriority: 'baixa' },
  { id: 'tt3', name: 'Acesso', category: 'Segurança', defaultPriority: 'media' },
  { id: 'tt4', name: 'Performance', category: 'Técnico', defaultPriority: 'alta' },
]

export const slaPolicies: SlaPolicy[] = [
  { priority: 'baixa', responderH: 24, resolverH: 72 },
  { priority: 'media', responderH: 12, resolverH: 48 },
  { priority: 'alta', responderH: 8, resolverH: 24 },
  { priority: 'critica', responderH: 4, resolverH: 8 },
]

export const workSchedules: WorkSchedule[] = [
  { userId: 'u1', hoursPerWeek: 40 },
  { userId: 'u2', hoursPerWeek: 40 },
  { userId: 'u3', hoursPerWeek: 40 },
  { userId: 'u4', hoursPerWeek: 40 },
  { userId: 'u5', hoursPerWeek: 40 },
  { userId: 'u6', hoursPerWeek: 40 },
]

export const vacations: Vacation[] = [
  { id: 'vac1', userId: 'u3', startDate: '2026-07-13', endDate: '2026-07-24' },
  { id: 'vac2', userId: 'u6', startDate: '2026-08-03', endDate: '2026-08-14' },
]

export const holidays: Holiday[] = [
  { id: 'ho1', date: '2026-09-07', name: 'Independência', national: true },
  { id: 'ho2', date: '2026-11-15', name: 'Proclamação da República', national: true },
  { id: 'ho3', date: '2026-07-09', name: 'Revolução Constitucionalista (SP)', national: false },
]

export const consumption: ConsumptionRow[] = [
  { projectId: 'p1', contractedHours: 120, consumedHours: 98 },
  { projectId: 'p2', contractedHours: 160, consumedHours: 165 },
  { projectId: 'p3', contractedHours: 200, consumedHours: 140 },
  { projectId: 'p6', contractedHours: 90, consumedHours: 71 },
]

export const hourAdjustments: HourAdjustment[] = [
  { id: 'ha1', projectId: 'p2', hours: 8, reason: 'Retrabalho de checkout offline não faturável', date: '2026-07-02' },
  { id: 'ha2', projectId: 'p1', hours: -4, reason: 'Horas lançadas em duplicidade', date: '2026-06-29' },
]

export const reclassifications: Reclassification[] = [
  { id: 'rc1', fromProjectId: 'p6', toProjectId: 'p1', hours: 6, reason: 'Apoio pontual do time de BI ao Portal', date: '2026-07-01' },
]

export const recurringItems: RecurringItem[] = [
  { id: 'rec1', clientId: 'c1', description: 'Mensalidade AMS Acme Corp', amount: 12000, status: 'ativo', startCompetencia: '2026-01', endCompetencia: null },
  { id: 'rec2', clientId: 'c3', description: 'Sustentação Data Lake', amount: 18000, status: 'ativo', startCompetencia: '2026-02', endCompetencia: null },
  { id: 'rec3', clientId: 'c4', description: 'Manutenção site institucional', amount: 3500, status: 'pausado', startCompetencia: '2026-01', endCompetencia: '2026-05' },
]

export const profiles: Profile[] = [
  { id: 'pf1', name: 'Gestor Geral', role: 'gestor_geral', permissions: ['tudo'], userCount: 1 },
  { id: 'pf2', name: 'Gestor de Projetos', role: 'gestor_projetos', permissions: ['projetos:read', 'projetos:write', 'financeiro:read', 'capacidade:read'], userCount: 2 },
  { id: 'pf3', name: 'Membro de Time', role: 'gestor_time', permissions: ['tarefas:read', 'tarefas:write', 'apontamentos:read', 'apontamentos:write'], userCount: 3 },
]

export const people: Person[] = [
  { id: 'pe1', name: 'Ana Ribeiro', expertiseId: 'e1', valorHora: 200, cargaSemanal: 40, userId: 'u1' },
  { id: 'pe2', name: 'Bruno Alves', expertiseId: 'e2', valorHora: 220, cargaSemanal: 40, userId: 'u2' },
  { id: 'pe3', name: 'Carla Mendes', expertiseId: 'e4', valorHora: 160, cargaSemanal: 40, userId: 'u3' },
  { id: 'pe4', name: 'Diego Souza', expertiseId: 'e1', valorHora: 180, cargaSemanal: 40, userId: 'u4' },
  { id: 'pe5', name: 'Elena Costa', expertiseId: 'e3', valorHora: 220, cargaSemanal: 40, userId: 'u5' },
  { id: 'pe6', name: 'Felipe Nunes', expertiseId: 'e5', valorHora: 150, cargaSemanal: 40, userId: 'u6' },
  { id: 'pe7', name: 'Gabriel Terceirizado', expertiseId: 'e2', valorHora: 190, cargaSemanal: 20, userId: null },
]
