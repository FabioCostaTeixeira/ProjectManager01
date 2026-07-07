// Whitelist rota → tabela. Entidade fora daqui = 404 (e nenhum nome de tabela
// vindo da URL chega ao SQL sem passar por este mapa).
export const ENTITIES: Record<string, string> = {
  users: 'users',
  profiles: 'profiles',
  clients: 'clients',
  teams: 'teams',
  expertises: 'expertises',
  tenants: 'tenants',
  'api-tokens': 'api_tokens',
  'ticket-types': 'ticket_types',
  'sla-policies': 'sla_policies',
  holidays: 'holidays',
  'note-columns': 'note_columns',
  'note-cards': 'note_cards',
  projects: 'projects',
  people: 'people',
  'work-schedules': 'work_schedules',
  vacations: 'vacations',
  capacity: 'capacity_rows',
  opportunities: 'opportunities',
  'service-requests': 'service_requests',
  files: 'files',
  tasks: 'tasks',
  deliverables: 'deliverables',
  sprints: 'sprints',
  'time-entries': 'time_entries',
  finance: 'finance_records',
  planning: 'planning_items',
  'report-rows': 'report_rows',
  consumption: 'consumption_rows',
  'hour-adjustments': 'hour_adjustments',
  reclassifications: 'reclassifications',
  worklog: 'worklog_entries',
  reminders: 'reminders',
  closings: 'closings',
  prepaids: 'prepaids',
  'recurring-items': 'recurring_items',
  demands: 'demands',
  tickets: 'tickets',
  insights: 'insights',
  dependencies: 'dependencies',
  alerts: 'alerts',
}

// PK de tabelas que não usam coluna `id`.
export const PK: Record<string, string> = {
  'sla-policies': 'priority',
  capacity: 'user_id',
  consumption: 'project_id',
  'work-schedules': 'user_id',
}
export const pkOf = (entity: string) => PK[entity] ?? 'id'

// Validações de negócio por entidade (rodam antes de INSERT/UPDATE).
// Retornam mensagem de erro ou null.
export const validate: Record<string, (body: Record<string, unknown>) => string | null> = {
  reclassifications: (b) =>
    b.fromProjectId != null && b.fromProjectId === b.toProjectId
      ? 'Projeto de origem e destino devem ser diferentes'
      : null,
}
