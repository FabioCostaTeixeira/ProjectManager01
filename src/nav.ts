import {
  LayoutDashboard,
  KanbanSquare,
  Rocket,
  FolderKanban,
  Inbox,
  PackageCheck,
  ClipboardList,
  Link2,
  StickyNote,
  FileQuestion,
  LifeBuoy,
  Briefcase,
  Users,
  Clock,
  Timer,
  Wallet,
  CalendarCheck,
  Coins,
  Network,
  BarChart3,
  Globe,
  Sparkles,
  Files,
  Contact,
  Building2,
  KeyRound,
  Settings,
  Bell,
  type LucideIcon,
} from 'lucide-react'

export type NavGroup = 'principal' | 'operacao' | 'gestao' | 'cliente' | 'sistema'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  group: NavGroup
}

export const navItems: NavItem[] = [
  { to: '/hoje', label: 'Hoje', icon: LayoutDashboard, group: 'principal' },
  { to: '/alertas', label: 'Alertas', icon: Bell, group: 'principal' },
  { to: '/board', label: 'Board', icon: KanbanSquare, group: 'principal' },
  { to: '/sprint', label: 'Sprint', icon: Rocket, group: 'principal' },
  { to: '/projetos', label: 'Projetos', icon: FolderKanban, group: 'principal' },
  { to: '/demandas', label: 'Demandas', icon: Inbox, group: 'principal' },
  { to: '/entregaveis', label: 'Entregáveis', icon: PackageCheck, group: 'principal' },

  { to: '/planejamento', label: 'Planejamento', icon: ClipboardList, group: 'operacao' },
  { to: '/dependencias', label: 'Dependências', icon: Link2, group: 'operacao' },
  { to: '/anotacoes', label: 'Anotações', icon: StickyNote, group: 'operacao' },
  { to: '/solicitacoes', label: 'Solicitações', icon: FileQuestion, group: 'operacao' },
  { to: '/chamados', label: 'Chamados', icon: LifeBuoy, group: 'operacao' },
  { to: '/crm', label: 'CRM', icon: Briefcase, group: 'operacao' },

  { to: '/capacidade', label: 'Capacidade', icon: Users, group: 'gestao' },
  { to: '/controle-horas', label: 'Controle de Horas', icon: Clock, group: 'gestao' },
  { to: '/apontamentos', label: 'Apontamentos', icon: Timer, group: 'gestao' },
  { to: '/financeiro', label: 'Financeiro', icon: Wallet, group: 'gestao' },
  { to: '/fechamento', label: 'Fechamento', icon: CalendarCheck, group: 'gestao' },
  { to: '/prepago', label: 'Pré-pago', icon: Coins, group: 'gestao' },
  { to: '/portfolio', label: 'Portfólio', icon: Network, group: 'gestao' },
  { to: '/relatorios', label: 'Relatórios', icon: BarChart3, group: 'gestao' },

  { to: '/portal', label: 'Portal do Cliente', icon: Globe, group: 'cliente' },

  { to: '/ia', label: 'IA / Insights', icon: Sparkles, group: 'sistema' },
  { to: '/arquivos', label: 'Arquivos', icon: Files, group: 'sistema' },
  { to: '/cadastros', label: 'Cadastros', icon: Contact, group: 'sistema' },
  { to: '/admin', label: 'Admin / Tenants', icon: Building2, group: 'sistema' },
  { to: '/meus-tokens', label: 'Tokens', icon: KeyRound, group: 'sistema' },
  { to: '/configuracoes', label: 'Configurações', icon: Settings, group: 'sistema' },
]

export const groupLabels: Record<NavGroup, string> = {
  principal: 'Principal',
  operacao: 'Operação',
  gestao: 'Gestão',
  cliente: 'Cliente',
  sistema: 'Sistema',
}

export const navGroups: NavGroup[] = ['principal', 'operacao', 'gestao', 'cliente', 'sistema']
