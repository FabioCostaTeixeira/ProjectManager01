# Gestor de Projetos

App web de gestão de projetos — React + Vite + TypeScript, com dados **mockados** (nenhuma chamada a sistema externo). Inspirado em ferramentas de gestão de projetos/PSA; construído do zero como ponto de partida próprio.

## Stack

- **React 19 + Vite 6 + TypeScript**
- **Tailwind CSS v4** (plugin oficial do Vite)
- **React Router 7** — navegação entre módulos
- **TanStack Query** — cache de dados sobre a mock API
- **Zustand** — estado local (auth fake, tema, board)
- **lucide-react** — ícones

## Rodar

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173`. Como o Vite está com `server.host: true`, também fica acessível na rede/Tailscale (ex.: `http://srv1:5173`).

Login: qualquer e-mail/senha (autenticação é apenas local, sem backend).

Outros comandos:

```bash
npm run build      # build de produção em dist/
npm run preview    # serve o build (porta 4173)
npm run typecheck  # checagem de tipos
```

## Módulos (27 rotas)

Estrutura espelhada do mapa do Gestao_Projetos (ver `../reports/REBUILD_PLAN.md`).

| Rota | Módulo | O que mostra |
|------|--------|--------------|
| `/hoje` | Hoje | Dashboard: KPIs, próximas tarefas, projetos em atenção, insights |
| `/alertas` | Alertas | Alertas do sistema e lembretes pessoais (abas) |
| `/board` | Board | Kanban com drag & drop entre colunas (estado local) |
| `/sprint` | Sprint | Ciclos com progresso comprometido/concluído |
| `/projetos` | Projetos | Tabela com filtro; clique abre o detalhe |
| `/projetos/:id` | Projeto (detalhe) | Tarefas, entregáveis e financeiro do projeto |
| `/demandas` | Demandas | Solicitações e andamento |
| `/entregaveis` | Entregáveis | Marcos/produtos por projeto |
| `/planejamento` | Planejamento | Itens a lançar; esforço; sem-demanda |
| `/dependencias` | Dependências | Bloqueios e relações entre entregas |
| `/anotacoes` | Anotações | Kanban pessoal com checklist (DnD) |
| `/solicitacoes` | Solicitações | Pedidos do cliente em levantamento |
| `/chamados` | Chamados | Suporte com SLA (abas: chamados, catálogo, SLA) |
| `/crm` | CRM | Funil de oportunidades (pipeline) |
| `/capacidade` | Capacidade | Alocação, timeline, jornadas, férias e feriados (abas) |
| `/controle-horas` | Controle de Horas | Apontamentos + formulário local |
| `/apontamentos` | Apontamentos | Registro diário (projeto/avulso) |
| `/financeiro` | Financeiro | Receitas, despesas, consumo, ajuste de horas e reclassificação (abas) |
| `/fechamento` | Fechamento | Apuração por competência e recorrência (abas) |
| `/prepago` | Pré-pago | Saldo de horas e consumo por cliente |
| `/portfolio` | Portfólio/Gantt | Linha do tempo dos projetos |
| `/relatorios` | Relatórios | Margem e próximas entregas |
| `/portal` | Portal | Visão do cliente: projetos, chamados, solicitações, relatório, financeiro (abas) |
| `/ia` | IA / Insights | Insights, chat e estimativa simulados (abas) |
| `/arquivos` | Arquivos | Documentos vinculados |
| `/cadastros` | Cadastros | Usuários, clientes, times, expertises, perfis, pessoas (abas) |
| `/admin` | Admin / Tenants | Workspaces multi-tenant e planos |
| `/meus-tokens` | Tokens | Chaves de API (mascaradas) |
| `/configuracoes` | Configurações | Tema, workspace, notificações |
| `/tv` | Painel TV | Modo telão, sem sidebar |

## Estrutura

```
src/
  main.tsx              # bootstrap + QueryClient + tema
  App.tsx               # rotas
  layouts/AppLayout.tsx # sidebar + topbar + guarda de auth
  components/           # ui.tsx, Sidebar, Topbar
  modules/<modulo>/     # uma página por módulo
  services/mockApi.ts   # "API" em memória com latência simulada
  services/queryClient.ts
  stores/               # authStore, uiStore, boardStore, alertsStore (Zustand)
  data/mockData.ts      # todos os dados de exemplo
  types/index.ts        # tipos das entidades
  lib/format.ts         # moeda/data + rótulos e cores de status
  nav.ts                # itens do menu
```

## Trocar mock por backend real (futuro)

Toda leitura passa por `src/services/mockApi.ts`. Para plugar um backend:

1. Criar `src/services/api.ts` com as mesmas assinaturas (`getProjects()`, etc.) usando `fetch`.
2. Trocar o import nas páginas (ou expor um `api` único que escolhe mock/real por env var).
3. As `queryKey` do TanStack Query já estão prontas para cache/invalidação.

Backends sugeridos: FastAPI + Postgres, ou Supabase. As entidades em `types/index.ts` servem de base para o schema.
