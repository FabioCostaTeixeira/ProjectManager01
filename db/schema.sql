-- Schema Postgres para o Gestor de Projetos, espelhando app/src/types/index.ts
-- Idempotente: recria o schema do zero a cada execucao.

DROP SCHEMA IF EXISTS gestor_projetos CASCADE;
CREATE SCHEMA gestor_projetos;
SET search_path TO gestor_projetos;

-- ---- Enums ----
CREATE TYPE project_status AS ENUM ('planejado','em_andamento','em_risco','pausado','concluido');
CREATE TYPE health AS ENUM ('verde','amarelo','vermelho');
CREATE TYPE task_status AS ENUM ('backlog','todo','doing','review','done');
CREATE TYPE priority AS ENUM ('baixa','media','alta','critica');
CREATE TYPE deliverable_status AS ENUM ('pendente','em_producao','em_aprovacao','aprovado','entregue');
CREATE TYPE demand_status AS ENUM ('nova','triagem','aprovada','em_execucao','concluida');
CREATE TYPE ticket_status AS ENUM ('aberto','em_atendimento','aguardando','resolvido','fechado');
CREATE TYPE finance_type AS ENUM ('receita','despesa');
CREATE TYPE finance_status AS ENUM ('previsto','pago','atrasado');
CREATE TYPE insight_severity AS ENUM ('info','atencao','critico');
CREATE TYPE sprint_status AS ENUM ('planejada','ativa','concluida');
CREATE TYPE dependency_kind AS ENUM ('bloqueia','aguarda','relacionada');
CREATE TYPE dependency_status AS ENUM ('pendente','resolvida','atrasada');
CREATE TYPE planning_kind AS ENUM ('entregavel','demanda');
CREATE TYPE closing_status AS ENUM ('aberto','liberado','cancelado');
CREATE TYPE crm_stage AS ENUM ('lead','qualificacao','proposta','negociacao','ganho','perdido');
CREATE TYPE request_status AS ENUM ('nova','levantamento','convertida','recusada');
CREATE TYPE report_trend AS ENUM ('up','down','flat');
CREATE TYPE worklog_kind AS ENUM ('projeto','avulso');
CREATE TYPE tenant_plan AS ENUM ('starter','pro','enterprise');
CREATE TYPE alert_severity AS ENUM ('info','atencao','critico');
CREATE TYPE recurring_status AS ENUM ('ativo','pausado');
CREATE TYPE profile_role AS ENUM ('gestor_geral','gestor_projetos','gestor_time');

-- ---- Nucleo (sem dependencias entre si) ----

-- profiles antes de users: users.profile_id referencia profiles.
CREATE TABLE profiles (
  id text PRIMARY KEY,
  name text NOT NULL,
  role profile_role NOT NULL,
  permissions jsonb NOT NULL,
  user_count integer NOT NULL
);

CREATE TABLE users (
  id text PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  role text NOT NULL,
  color text NOT NULL,
  profile_id text REFERENCES profiles(id) ON DELETE SET NULL,
  password_hash text
);

CREATE TABLE clients (
  id text PRIMARY KEY,
  name text NOT NULL,
  key_users integer NOT NULL,
  valor_hora numeric(10,2) NOT NULL,
  recorrente boolean NOT NULL
);

CREATE TABLE teams (
  id text PRIMARY KEY,
  name text NOT NULL,
  members integer NOT NULL
);

CREATE TABLE expertises (
  id text PRIMARY KEY,
  name text NOT NULL,
  valor_hora numeric(10,2) NOT NULL
);

CREATE TABLE tenants (
  id text PRIMARY KEY,
  name text NOT NULL,
  users integer NOT NULL,
  plan tenant_plan NOT NULL,
  active boolean NOT NULL
);

CREATE TABLE api_tokens (
  id text PRIMARY KEY,
  name text NOT NULL,
  scope text NOT NULL,
  created_at date NOT NULL,
  last_use date NOT NULL
);

CREATE TABLE ticket_types (
  id text PRIMARY KEY,
  name text NOT NULL,
  category text NOT NULL,
  default_priority priority NOT NULL
);

CREATE TABLE sla_policies (
  priority priority PRIMARY KEY,
  responder_h integer NOT NULL,
  resolver_h integer NOT NULL
);

CREATE TABLE holidays (
  id text PRIMARY KEY,
  date date NOT NULL,
  name text NOT NULL,
  national boolean NOT NULL
);

CREATE TABLE note_columns (
  id text PRIMARY KEY,
  title text NOT NULL
);

-- ---- Dependem de users/clients/expertises ----

CREATE TABLE projects (
  id text PRIMARY KEY,
  name text NOT NULL,
  client text NOT NULL, -- nome livre; mock nao linka por client_id (ver plano)
  status project_status NOT NULL,
  health health NOT NULL,
  progress integer NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  owner_id text NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  budget numeric(14,2) NOT NULL,
  spent numeric(14,2) NOT NULL
);

CREATE TABLE people (
  id text PRIMARY KEY,
  name text NOT NULL,
  expertise_id text NOT NULL REFERENCES expertises(id) ON DELETE RESTRICT,
  valor_hora numeric(10,2) NOT NULL,
  carga_semanal integer NOT NULL,
  user_id text REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE work_schedules (
  user_id text PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  hours_per_week integer NOT NULL
);

CREATE TABLE vacations (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  start_date date NOT NULL,
  end_date date NOT NULL
);

CREATE TABLE capacity_rows (
  user_id text PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  available_hours integer NOT NULL,
  allocated_hours integer NOT NULL,
  active_projects integer NOT NULL
);

CREATE TABLE opportunities (
  id text PRIMARY KEY,
  client text NOT NULL,
  title text NOT NULL,
  value numeric(14,2) NOT NULL,
  stage crm_stage NOT NULL,
  owner_id text NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  followups jsonb NOT NULL DEFAULT '[]'::jsonb
);

CREATE TABLE service_requests (
  id text PRIMARY KEY,
  client text NOT NULL,
  title text NOT NULL,
  status request_status NOT NULL,
  premissas text NOT NULL DEFAULT '',
  created_at date NOT NULL
);

-- ---- Dependem de projects/users ----

CREATE TABLE tasks (
  id text PRIMARY KEY,
  project_id text NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  status task_status NOT NULL,
  priority priority NOT NULL,
  assignee_id text NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  due_date date NOT NULL,
  tags jsonb NOT NULL DEFAULT '[]'::jsonb
);

CREATE TABLE deliverables (
  id text PRIMARY KEY,
  project_id text NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  status deliverable_status NOT NULL,
  owner_id text NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  due_date date NOT NULL
);

CREATE TABLE sprints (
  id text PRIMARY KEY,
  name text NOT NULL,
  project_id text NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  start_date date NOT NULL,
  end_date date NOT NULL,
  status sprint_status NOT NULL,
  committed integer NOT NULL,
  done integer NOT NULL
);

CREATE TABLE time_entries (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id text NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  date date NOT NULL,
  hours numeric(6,2) NOT NULL,
  description text NOT NULL,
  billable boolean NOT NULL
);

CREATE TABLE finance_records (
  id text PRIMARY KEY,
  project_id text NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  type finance_type NOT NULL,
  description text NOT NULL,
  amount numeric(14,2) NOT NULL,
  due_date date NOT NULL,
  status finance_status NOT NULL
);

CREATE TABLE planning_items (
  id text PRIMARY KEY,
  name text NOT NULL,
  project_id text NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  kind planning_kind NOT NULL,
  has_demand boolean NOT NULL,
  esforco integer NOT NULL
);

CREATE TABLE report_rows (
  id text PRIMARY KEY,
  project_id text NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  metric text NOT NULL,
  value text NOT NULL,
  trend report_trend NOT NULL
);

CREATE TABLE consumption_rows (
  project_id text PRIMARY KEY REFERENCES projects(id) ON DELETE CASCADE,
  contracted_hours integer NOT NULL,
  consumed_hours integer NOT NULL
);

CREATE TABLE hour_adjustments (
  id text PRIMARY KEY,
  project_id text NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  hours integer NOT NULL,
  reason text NOT NULL,
  date date NOT NULL
);

CREATE TABLE reclassifications (
  id text PRIMARY KEY,
  from_project_id text NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  to_project_id text NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  hours integer NOT NULL,
  reason text NOT NULL,
  date date NOT NULL
);

CREATE TABLE worklog_entries (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id text REFERENCES projects(id) ON DELETE SET NULL,
  date date NOT NULL,
  hours numeric(6,2) NOT NULL,
  kind worklog_kind NOT NULL,
  description text NOT NULL
);

CREATE TABLE reminders (
  id text PRIMARY KEY,
  title text NOT NULL,
  due_date date NOT NULL,
  project_id text REFERENCES projects(id) ON DELETE SET NULL,
  deliverable_id text REFERENCES deliverables(id) ON DELETE SET NULL,
  done boolean NOT NULL
);

-- ---- Dependem de clients ----

CREATE TABLE closings (
  id text PRIMARY KEY,
  competencia text NOT NULL,
  client_id text NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  hours integer NOT NULL,
  amount numeric(14,2) NOT NULL,
  status closing_status NOT NULL
);

CREATE TABLE prepaids (
  id text PRIMARY KEY,
  client_id text NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  saldo integer NOT NULL,
  carga_mes integer NOT NULL,
  consumo_mes integer NOT NULL
);

CREATE TABLE recurring_items (
  id text PRIMARY KEY,
  client_id text NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  description text NOT NULL,
  amount numeric(14,2) NOT NULL,
  status recurring_status NOT NULL,
  start_competencia text NOT NULL,
  end_competencia text
);

-- ---- Independentes / texto livre (fieis ao mock, ver plano) ----

CREATE TABLE demands (
  id text PRIMARY KEY,
  title text NOT NULL,
  requester text NOT NULL,
  area text NOT NULL,
  priority priority NOT NULL,
  status demand_status NOT NULL,
  created_at date NOT NULL
);

CREATE TABLE tickets (
  id text PRIMARY KEY,
  subject text NOT NULL,
  requester text NOT NULL,
  category text NOT NULL,
  priority priority NOT NULL,
  status ticket_status NOT NULL,
  sla_hours integer NOT NULL,
  created_at date NOT NULL
);

CREATE TABLE insights (
  id text PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  severity insight_severity NOT NULL
);

CREATE TABLE dependencies (
  id text PRIMARY KEY,
  "from" text NOT NULL,
  "to" text NOT NULL,
  kind dependency_kind NOT NULL,
  status dependency_status NOT NULL,
  notified boolean NOT NULL
);

CREATE TABLE alerts (
  id text PRIMARY KEY,
  title text NOT NULL,
  origin text NOT NULL,
  severity alert_severity NOT NULL,
  date date NOT NULL,
  read boolean NOT NULL,
  snoozed_until date
);

-- ---- Dependem de note_columns ----

CREATE TABLE note_cards (
  id text PRIMARY KEY,
  column_id text NOT NULL REFERENCES note_columns(id) ON DELETE CASCADE,
  title text NOT NULL,
  checklist jsonb NOT NULL DEFAULT '[]'::jsonb,
  tags jsonb NOT NULL DEFAULT '[]'::jsonb
);

-- ---- Indices em FKs (Postgres nao cria automaticamente) ----

CREATE INDEX ON users (profile_id);
CREATE INDEX ON projects (owner_id);
CREATE INDEX ON people (expertise_id);
CREATE INDEX ON people (user_id);
CREATE INDEX ON vacations (user_id);
CREATE INDEX ON opportunities (owner_id);
CREATE INDEX ON files (uploaded_by);
CREATE INDEX ON tasks (project_id);
CREATE INDEX ON tasks (assignee_id);
CREATE INDEX ON deliverables (project_id);
CREATE INDEX ON deliverables (owner_id);
CREATE INDEX ON sprints (project_id);
CREATE INDEX ON time_entries (user_id);
CREATE INDEX ON time_entries (project_id);
CREATE INDEX ON finance_records (project_id);
CREATE INDEX ON planning_items (project_id);
CREATE INDEX ON report_rows (project_id);
CREATE INDEX ON hour_adjustments (project_id);
CREATE INDEX ON reclassifications (from_project_id);
CREATE INDEX ON reclassifications (to_project_id);
CREATE INDEX ON worklog_entries (user_id);
CREATE INDEX ON worklog_entries (project_id);
CREATE INDEX ON reminders (project_id);
CREATE INDEX ON reminders (deliverable_id);
CREATE INDEX ON closings (client_id);
CREATE INDEX ON prepaids (client_id);
CREATE INDEX ON recurring_items (client_id);
CREATE INDEX ON note_cards (column_id);
