import type {
  Alert, ApiToken, CapacityRow, Client, Closing, ConsumptionRow, Deliverable,
  Demand, Dependency, Expertise, FinanceRecord, Holiday, HourAdjustment,
  Insight, NoteCard, NoteColumn, Opportunity, Person, PlanningItem, Prepaid,
  Profile, Project, Reclassification, RecurringItem, Reminder, ReportRow,
  ServiceRequest, SlaPolicy, Sprint, Task, Team, Tenant, Ticket, TicketType,
  TimeEntry, User, Vacation, WorkSchedule, WorklogEntry,
} from '../types'

import { useAuthStore } from '../stores/authStore'

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const token = useAuthStore.getState().token
  const res = await fetch(`/api/${path}`, {
    ...init,
    headers: {
      ...(init?.body ? { 'Content-Type': 'application/json' } : undefined),
      ...(token ? { Authorization: `Bearer ${token}` } : undefined),
    },
  })
  if (res.status === 401) {
    // Token ausente/expirado: derruba a sessão — o guard do AppLayout manda pro /login.
    useAuthStore.getState().logout()
    throw new Error('Sessão expirada')
  }
  if (!res.ok) {
    const msg = await res.json().then((b) => b.error).catch(() => res.statusText)
    throw new Error(msg)
  }
  return res.status === 204 ? (undefined as T) : res.json()
}

const list = <T>(entity: string) => () => http<T[]>(entity)

// Escritas genéricas (usadas pelos stores)
export const createEntity = <T>(entity: string, body: unknown) =>
  http<T>(entity, { method: 'POST', body: JSON.stringify(body) })
export const updateEntity = <T>(entity: string, id: string, body: unknown) =>
  http<T>(`${entity}/${id}`, { method: 'PATCH', body: JSON.stringify(body) })
export const removeEntity = (entity: string, id: string) =>
  http<void>(`${entity}/${id}`, { method: 'DELETE' })

// Mesmas assinaturas do antigo mockApi — os módulos só trocam o import.
export const api = {
  getUsers: list<User>('users'),
  getProjects: list<Project>('projects'),
  getTasks: list<Task>('tasks'),
  getDeliverables: list<Deliverable>('deliverables'),
  getDemands: list<Demand>('demands'),
  getTickets: list<Ticket>('tickets'),
  getCapacity: list<CapacityRow>('capacity'),
  getTimeEntries: list<TimeEntry>('time-entries'),
  getFinance: list<FinanceRecord>('finance'),
  getInsights: list<Insight>('insights'),
  getSprints: list<Sprint>('sprints'),
  getDependencies: list<Dependency>('dependencies'),
  getPlanning: list<PlanningItem>('planning'),
  getClosings: list<Closing>('closings'),
  getPrepaids: list<Prepaid>('prepaids'),
  getNoteColumns: list<NoteColumn>('note-columns'),
  getNoteCards: list<NoteCard>('note-cards'),
  getOpportunities: list<Opportunity>('opportunities'),
  getServiceRequests: list<ServiceRequest>('service-requests'),
  getReportRows: list<ReportRow>('report-rows'),
  getWorklog: list<WorklogEntry>('worklog'),
  getTenants: list<Tenant>('tenants'),
  getApiTokens: list<ApiToken>('api-tokens'),
  getClients: list<Client>('clients'),
  getTeams: list<Team>('teams'),
  getExpertises: list<Expertise>('expertises'),
  getAlerts: list<Alert>('alerts'),
  getReminders: list<Reminder>('reminders'),
  getTicketTypes: list<TicketType>('ticket-types'),
  getSlaPolicies: list<SlaPolicy>('sla-policies'),
  getWorkSchedules: list<WorkSchedule>('work-schedules'),
  getVacations: list<Vacation>('vacations'),
  getHolidays: list<Holiday>('holidays'),
  getConsumption: list<ConsumptionRow>('consumption'),
  getHourAdjustments: list<HourAdjustment>('hour-adjustments'),
  getReclassifications: list<Reclassification>('reclassifications'),
  getRecurringItems: list<RecurringItem>('recurring-items'),
  getProfiles: list<Profile>('profiles'),
  getPeople: list<Person>('people'),
}
