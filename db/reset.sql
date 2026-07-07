-- Zera todos os dados e cria o baseline real.
-- Restauração do mock: rodar schema.sql + seed.sql.
SET search_path TO gestor_projetos;

TRUNCATE
  profiles, users, clients, teams, expertises, tenants, api_tokens,
  ticket_types, sla_policies, holidays, note_columns, note_cards,
  projects, people, work_schedules, vacations, capacity_rows,
  opportunities, service_requests, files, tasks, deliverables, sprints,
  time_entries, finance_records, planning_items, report_rows,
  consumption_rows, hour_adjustments, reclassifications, worklog_entries,
  reminders, closings, prepaids, recurring_items, demands, tickets,
  insights, dependencies, alerts
CASCADE;

INSERT INTO profiles (id, name, role, permissions, user_count) VALUES
  ('pf-master', 'Master', 'gestor_geral', '["tudo"]', 1);

INSERT INTO tenants (id, name, users, plan, active) VALUES
  ('tn-4nexus', '4nexus', 1, 'enterprise', true);

INSERT INTO users (id, name, email, role, color, profile_id) VALUES
  ('u-fabio', 'Fabio Costa', 'fabio.costa@4nexus.com.br', 'Gestor de Projetos/Processos', '#6366f1', 'pf-master');
