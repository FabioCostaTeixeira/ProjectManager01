-- Seed gerado a partir de app/src/data/mockData.ts
SET search_path TO gestor_projetos;

-- ---- profiles (antes de users: FK profile_id) ----
INSERT INTO profiles (id, name, role, permissions, user_count) VALUES
('pf1','Gestor Geral','gestor_geral','["tudo"]'::jsonb,1),
('pf2','Gestor de Projetos','gestor_projetos','["projetos:read","projetos:write","financeiro:read","capacidade:read"]'::jsonb,2),
('pf3','Membro de Time','gestor_time','["tarefas:read","tarefas:write","apontamentos:read","apontamentos:write"]'::jsonb,3);

-- ---- users ----
INSERT INTO users (id, name, email, role, color, profile_id) VALUES
('u1','Ana Ribeiro','ana@empresa.com','Gerente de Projetos','#6366f1','pf1'),
('u2','Bruno Alves','bruno@empresa.com','Tech Lead','#0ea5e9','pf2'),
('u3','Carla Mendes','carla@empresa.com','Designer','#ec4899','pf3'),
('u4','Diego Souza','diego@empresa.com','Desenvolvedor','#22c55e','pf3'),
('u5','Elena Costa','elena@empresa.com','Analista de Negocios','#f59e0b','pf2'),
('u6','Felipe Nunes','felipe@empresa.com','QA','#a855f7','pf3');

-- ---- clients ----
INSERT INTO clients (id, name, key_users, valor_hora, recorrente) VALUES
('c1','Acme Corp',3,280,true),
('c2','Nordeste Varejo',2,260,false),
('c3','Banco Sul',4,320,true),
('c4','Verde Moda',1,220,false),
('c5','Metalurgica RS',2,240,false);

-- ---- teams ----
INSERT INTO teams (id, name, members) VALUES
('tm1','Produto',3),
('tm2','Dados & BI',2),
('tm3','Design',1);

-- ---- expertises ----
INSERT INTO expertises (id, name, valor_hora) VALUES
('e1','Frontend',180),
('e2','Backend',200),
('e3','Dados',220),
('e4','Design',160),
('e5','QA',150);

-- ---- tenants ----
INSERT INTO tenants (id, name, users, plan, active) VALUES
('t1','Minha Agencia',6,'pro',true),
('t2','Acme Corp (portal)',3,'starter',true),
('t3','Banco Sul (portal)',2,'starter',true),
('t4','Demo Sandbox',1,'starter',false);

-- ---- api_tokens ----
INSERT INTO api_tokens (id, name, scope, created_at, last_use) VALUES
('tk1','CI/CD deploy','projetos:read','2026-05-01','2026-07-03'),
('tk2','Integracao ERP','financeiro:write','2026-06-10','2026-07-02'),
('tk3','Zapier','demandas:read','2026-06-15','2026-06-30');

-- ---- ticket_types ----
INSERT INTO ticket_types (id, name, category, default_priority) VALUES
('tt1','Bug','Tecnico','alta'),
('tt2','Duvida','Suporte','baixa'),
('tt3','Acesso','Seguranca','media'),
('tt4','Performance','Tecnico','alta');

-- ---- sla_policies ----
INSERT INTO sla_policies (priority, responder_h, resolver_h) VALUES
('baixa',24,72),
('media',12,48),
('alta',8,24),
('critica',4,8);

-- ---- holidays ----
INSERT INTO holidays (id, date, name, national) VALUES
('ho1','2026-09-07','Independencia',true),
('ho2','2026-11-15','Proclamacao da Republica',true),
('ho3','2026-07-09','Revolucao Constitucionalista (SP)',false);

-- ---- note_columns ----
INSERT INTO note_columns (id, title) VALUES
('nc1','Ideias'),
('nc2','Em estudo'),
('nc3','Decidido');

-- ---- projects ----
INSERT INTO projects (id, name, client, status, health, progress, start_date, end_date, owner_id, budget, spent) VALUES
('p1','Portal do Cliente','Acme Corp','em_andamento','verde',62,'2026-04-01','2026-09-30','u1',180000,98000),
('p2','App Mobile Vendas','Nordeste Varejo','em_risco','vermelho',38,'2026-03-15','2026-08-15','u2',240000,165000),
('p3','Data Lake Financeiro','Banco Sul','em_andamento','amarelo',51,'2026-02-01','2026-12-01','u1',420000,210000),
('p4','Rebranding Site','Verde Moda','concluido','verde',100,'2026-01-10','2026-05-20','u3',90000,87000),
('p5','Integracao ERP','Metalurgica RS','planejado','verde',8,'2026-07-15','2027-01-30','u5',310000,12000),
('p6','Dashboard BI Vendas','Acme Corp','em_andamento','verde',74,'2026-05-01','2026-08-30','u2',130000,71000),
('p7','Migracao Cloud','Log Transportes','pausado','amarelo',45,'2026-03-01','2026-10-15','u2',260000,120000),
('p8','Portal RH','Interno','em_andamento','verde',29,'2026-06-01','2026-11-30','u5',95000,21000);

-- ---- people ----
INSERT INTO people (id, name, expertise_id, valor_hora, carga_semanal, user_id) VALUES
('pe1','Ana Ribeiro','e1',200,40,'u1'),
('pe2','Bruno Alves','e2',220,40,'u2'),
('pe3','Carla Mendes','e4',160,40,'u3'),
('pe4','Diego Souza','e1',180,40,'u4'),
('pe5','Elena Costa','e3',220,40,'u5'),
('pe6','Felipe Nunes','e5',150,40,'u6'),
('pe7','Gabriel Terceirizado','e2',190,20,NULL);

-- ---- work_schedules ----
INSERT INTO work_schedules (user_id, hours_per_week) VALUES
('u1',40),('u2',40),('u3',40),('u4',40),('u5',40),('u6',40);

-- ---- vacations ----
INSERT INTO vacations (id, user_id, start_date, end_date) VALUES
('vac1','u3','2026-07-13','2026-07-24'),
('vac2','u6','2026-08-03','2026-08-14');

-- ---- capacity_rows ----
INSERT INTO capacity_rows (user_id, available_hours, allocated_hours, active_projects) VALUES
('u2',40,46,4),
('u4',40,38,3),
('u3',40,22,2),
('u5',40,34,3),
('u6',40,30,2),
('u1',40,28,5);

-- ---- opportunities ----
INSERT INTO opportunities (id, client, title, value, stage, owner_id, followups) VALUES
('o1','Delta Logistica','Portal de rastreio',180000,'proposta','u1','[{"id":"fu1","date":"2026-07-01","note":"Enviada proposta v1"}]'::jsonb),
('o2','Sigma Saude','App de agendamento',240000,'qualificacao','u5','[]'::jsonb),
('o3','Acme Corp','Fase 2 do Portal',90000,'negociacao','u1','[{"id":"fu2","date":"2026-06-28","note":"Reuniao de escopo"}]'::jsonb),
('o4','Norte Alimentos','BI de vendas',60000,'lead','u2','[]'::jsonb),
('o5','Verde Moda','Manutencao site',24000,'ganho','u3','[]'::jsonb),
('o6','Metal RS','Integracao legada',120000,'perdido','u5','[]'::jsonb);

-- ---- service_requests ----
INSERT INTO service_requests (id, client, title, status, premissas, created_at) VALUES
('sr1','Acme Corp','Novo relatorio de comissoes','levantamento','Depende de acesso ao ERP','2026-07-01'),
('sr2','Banco Sul','Painel executivo','nova','','2026-07-02'),
('sr3','Nordeste Varejo','Cupom fiscal no app','convertida','Escopo fechado, virou demanda #dm3','2026-06-25'),
('sr4','Verde Moda','Loja em outro idioma','recusada','Fora do contrato atual','2026-06-20');

-- ---- files ----
INSERT INTO files (id, name, ext, size_kb, entity, uploaded_by, date) VALUES
('a1','Proposta_Portal_v1','pdf',842,'Projeto: Portal do Cliente','u1','2026-06-20'),
('a2','Wireframes_App','fig',12400,'Projeto: App Mobile','u3','2026-06-22'),
('a3','Modelo_Dados_DataLake','xlsx',356,'Projeto: Data Lake','u5','2026-06-28'),
('a4','Contrato_VerdeModa','pdf',640,'Cliente: Verde Moda','u1','2026-05-10'),
('a5','Export_faturas_junho','csv',88,'Financeiro','u2','2026-07-01');

-- ---- deliverables (antes de tasks: FK entregable_id) ----
INSERT INTO deliverables (id, project_id, name, status, owner_id, due_date) VALUES
('d1','p1','MVP Portal (fase 1)','em_aprovacao','u1','2026-07-12'),
('d2','p2','Build beta Android','em_producao','u2','2026-07-18'),
('d3','p3','Camada bronze do Data Lake','aprovado','u2','2026-06-30'),
('d4','p4','Novo site institucional','entregue','u3','2026-05-18'),
('d5','p6','Dashboard vendas v1','em_aprovacao','u5','2026-07-10'),
('d6','p8','Prototipo Portal RH','pendente','u5','2026-07-28');

-- ---- tasks ----
INSERT INTO tasks (id, entregable_id, title, status, priority, assignee_id, due_date, tags) VALUES
('t1','d1','Tela de login SSO','done','alta','u4','2026-06-20','["frontend","auth"]'::jsonb),
('t2','d1','API de faturas','doing','alta','u2','2026-07-10','["backend"]'::jsonb),
('t3','d1','Design system v2','review','media','u3','2026-07-08','["design"]'::jsonb),
('t4','d2','Fluxo de checkout offline','doing','critica','u4','2026-07-05','["mobile"]'::jsonb),
('t5','d2','Sincronizacao de estoque','todo','alta','u2','2026-07-15','["backend","sync"]'::jsonb),
('t6','d2','Push notifications','backlog','baixa','u4','2026-07-25','["mobile"]'::jsonb),
('t7','d3','Pipeline ingestao diaria','doing','alta','u2','2026-07-12','["data"]'::jsonb),
('t8','d3','Modelagem dimensional','todo','media','u5','2026-07-20','["data","modelagem"]'::jsonb),
('t9','d5','Medidas DAX de metas','review','media','u5','2026-07-06','["bi"]'::jsonb),
('t10','d5','Publicar dashboard','todo','alta','u2','2026-07-18','["bi","deploy"]'::jsonb),
('t11','d6','Cadastro de colaboradores','backlog','media','u4','2026-08-01','["frontend"]'::jsonb),
('t12','d1','Testes E2E do portal','todo','media','u6','2026-07-22','["qa"]'::jsonb),
('t13','d2','Correcao crash Android 14','backlog','critica','u6','2026-07-09','["mobile","bug"]'::jsonb),
('t14','d3','RLS por unidade','backlog','alta','u5','2026-08-05','["seguranca"]'::jsonb);

-- ---- sprints ----
INSERT INTO sprints (id, name, project_id, start_date, end_date, status, committed, done) VALUES
('s1','Portal - Sprint 6','p1','2026-06-23','2026-07-06','ativa',34,21),
('s2','App - Sprint 9','p2','2026-06-23','2026-07-06','ativa',40,15),
('s3','BI - Sprint 4','p6','2026-06-16','2026-06-29','concluida',28,28),
('s4','Data Lake - Sprint 5','p3','2026-07-07','2026-07-20','planejada',32,0);

-- ---- time_entries ----
INSERT INTO time_entries (id, user_id, project_id, date, hours, description, billable) VALUES
('te1','u4','p1','2026-07-02',6,'Ajustes tela login',true),
('te2','u2','p2','2026-07-02',8,'Checkout offline',true),
('te3','u3','p1','2026-07-02',4,'Design system',true),
('te4','u5','p3','2026-07-01',5,'Modelagem',true),
('te5','u2','p6','2026-07-01',3,'Medidas DAX',true),
('te6','u6','p2','2026-07-02',5,'Reproducao crash',false),
('te7','u4','p8','2026-07-03',4,'Cadastro colaboradores',true);

-- ---- finance_records ----
INSERT INTO finance_records (id, project_id, type, description, amount, due_date, status) VALUES
('f1','p1','receita','Parcela 3/6 - Portal',30000,'2026-07-10','previsto'),
('f2','p2','receita','Parcela 2/4 - App',60000,'2026-06-30','atrasado'),
('f3','p3','receita','Marco 1 - Data Lake',105000,'2026-07-05','pago'),
('f4','p1','despesa','Licencas cloud',8200,'2026-07-08','previsto'),
('f5','p2','despesa','Consultoria mobile',15000,'2026-07-01','pago'),
('f6','p6','receita','Parcela final - BI',45000,'2026-08-30','previsto'),
('f7','p4','receita','Fechamento - Rebranding',20000,'2026-05-25','pago');

-- ---- planning_items ----
INSERT INTO planning_items (id, name, project_id, kind, has_demand, esforco) VALUES
('pl1','Relatorio de churn','p6','entregavel',false,16),
('pl2','Exportacao de faturas em lote','p1','entregavel',true,24),
('pl3','Alerta de SLA','p1','demanda',true,8),
('pl4','Modo escuro no portal','p1','entregavel',false,12),
('pl5','RLS por unidade','p3','demanda',true,20);

-- ---- report_rows ----
INSERT INTO report_rows (id, project_id, metric, value, trend) VALUES
('r1','p1','Margem estimada','42%','up'),
('r2','p2','Margem estimada','11%','down'),
('r3','p3','Margem estimada','38%','flat'),
('r4','p6','Margem estimada','46%','up');

-- ---- consumption_rows ----
INSERT INTO consumption_rows (project_id, contracted_hours, consumed_hours) VALUES
('p1',120,98),
('p2',160,165),
('p3',200,140),
('p6',90,71);

-- ---- hour_adjustments ----
INSERT INTO hour_adjustments (id, project_id, hours, reason, date) VALUES
('ha1','p2',8,'Retrabalho de checkout offline nao faturavel','2026-07-02'),
('ha2','p1',-4,'Horas lancadas em duplicidade','2026-06-29');

-- ---- reclassifications ----
INSERT INTO reclassifications (id, from_project_id, to_project_id, hours, reason, date) VALUES
('rc1','p6','p1',6,'Apoio pontual do time de BI ao Portal','2026-07-01');

-- ---- worklog_entries ----
INSERT INTO worklog_entries (id, user_id, project_id, date, hours, kind, description) VALUES
('w1','u4','p1','2026-07-03',6,'projeto','Tela login SSO'),
('w2','u2','p2','2026-07-03',7,'projeto','Checkout offline'),
('w3','u3',NULL,'2026-07-03',2,'avulso','Reuniao interna de design'),
('w4','u5','p3','2026-07-02',5,'projeto','Modelagem'),
('w5','u6',NULL,'2026-07-02',1,'avulso','Treinamento QA');

-- ---- reminders ----
INSERT INTO reminders (id, title, due_date, project_id, deliverable_id, done) VALUES
('rm1','Enviar proposta Fase 2 - Portal','2026-07-08','p1',NULL,false),
('rm2','Validar MVP Portal com Acme','2026-07-12','p1','d1',false),
('rm3','Renovar contrato Verde Moda','2026-07-20',NULL,NULL,false),
('rm4','Follow-up Delta Logistica','2026-07-05',NULL,NULL,true);

-- ---- closings ----
INSERT INTO closings (id, competencia, client_id, hours, amount, status) VALUES
('fc1','2026-06','c1',142,39000,'liberado'),
('fc2','2026-06','c2',180,54000,'aberto'),
('fc3','2026-06','c3',96,33000,'aberto'),
('fc4','2026-05','c1',138,38000,'liberado'),
('fc5','2026-06','c4',20,6000,'cancelado');

-- ---- prepaids ----
INSERT INTO prepaids (id, client_id, saldo, carga_mes, consumo_mes) VALUES
('pp1','c1',48,80,32),
('pp2','c2',6,40,34),
('pp3','c3',120,120,0);

-- ---- recurring_items ----
INSERT INTO recurring_items (id, client_id, description, amount, status, start_competencia, end_competencia) VALUES
('rec1','c1','Mensalidade AMS Acme Corp',12000,'ativo','2026-01',NULL),
('rec2','c3','Sustentacao Data Lake',18000,'ativo','2026-02',NULL),
('rec3','c4','Manutencao site institucional',3500,'pausado','2026-01','2026-05');

-- ---- demands ----
INSERT INTO demands (id, title, requester, area, priority, status, created_at) VALUES
('dm1','Relatorio de churn mensal','Marketing','BI','media','triagem','2026-06-28'),
('dm2','Novo campo CNPJ no cadastro','Comercial','Produto','alta','aprovada','2026-06-30'),
('dm3','Exportar faturas em lote','Financeiro','Backend','alta','em_execucao','2026-07-01'),
('dm4','Modo escuro no portal','Cliente Acme','Frontend','baixa','nova','2026-07-02'),
('dm5','Alerta de SLA por e-mail','Suporte','Backend','media','concluida','2026-06-20');

-- ---- tickets ----
INSERT INTO tickets (id, subject, requester, category, priority, status, sla_hours, created_at) VALUES
('c1','Erro 500 ao emitir fatura','Acme Corp','Bug','critica','em_atendimento',4,'2026-07-03'),
('c2','Lentidao no dashboard','Banco Sul','Performance','alta','aberto',8,'2026-07-03'),
('c3','Duvida sobre permissoes','Verde Moda','Duvida','baixa','aguardando',24,'2026-07-02'),
('c4','Solicita novo usuario admin','Nordeste Varejo','Acesso','media','resolvido',12,'2026-07-01'),
('c5','App fecha ao abrir carrinho','Nordeste Varejo','Bug','critica','aberto',4,'2026-07-03');

-- ---- insights ----
INSERT INTO insights (id, title, description, severity) VALUES
('i1','Projeto App Mobile Vendas em risco','Gasto em 69% do orcamento com apenas 38% de progresso. Reavaliar escopo ou prazo.','critico'),
('i2','Bruno Alves sobrealocado','46h alocadas para 40h disponiveis nesta semana em 4 projetos. Risco de gargalo.','atencao'),
('i3','2 chamados criticos abertos','SLA de 4h para "Erro 500 ao emitir fatura" e "App fecha ao abrir carrinho".','critico'),
('i4','Fatura em atraso','Parcela 2/4 do App Mobile (R$ 60.000) venceu em 30/06 e segue em aberto.','atencao'),
('i5','Portal do Cliente saudavel','Progresso 62% alinhado ao cronograma e orcamento sob controle.','info');

-- ---- dependencies ----
INSERT INTO dependencies (id, "from", "to", kind, status, notified) VALUES
('dep1','API de faturas','Tela de faturas','bloqueia','pendente',true),
('dep2','Modelagem dimensional','Pipeline ingestao','aguarda','atrasada',false),
('dep3','Design system v2','Cadastro colaboradores','relacionada','resolvida',true),
('dep4','Sincronizacao estoque','Checkout offline','bloqueia','pendente',false);

-- ---- alerts ----
INSERT INTO alerts (id, title, origin, severity, date, read, snoozed_until) VALUES
('al1','Chamado critico sem resposta ha 3h','Chamados','critico','2026-07-03',false,NULL),
('al2','Projeto App Mobile Vendas em risco','Projetos','critico','2026-07-02',false,NULL),
('al3','Fatura em atraso - Nordeste Varejo','Financeiro','atencao','2026-06-30',true,NULL),
('al4','Bruno Alves sobrealocado nesta semana','Capacidade','atencao','2026-07-01',false,NULL),
('al5','Pre-pago Nordeste Varejo com saldo baixo','Pre-pago','info','2026-06-29',true,NULL);

-- ---- note_cards ----
INSERT INTO note_cards (id, column_id, title, checklist, tags) VALUES
('ncd1','nc1','Automatizar relatorio semanal','[{"text":"Definir metricas","done":true},{"text":"Escolher canal","done":false}]'::jsonb,'["bi"]'::jsonb),
('ncd2','nc1','Onboarding de novos clientes','[]'::jsonb,'["processo"]'::jsonb),
('ncd3','nc2','Migrar filas para SQS','[{"text":"POC","done":false}]'::jsonb,'["infra"]'::jsonb),
('ncd4','nc3','Padronizar naming de branches','[{"text":"Doc","done":true}]'::jsonb,'["dev"]'::jsonb);
