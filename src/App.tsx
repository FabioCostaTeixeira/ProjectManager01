import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from './layouts/AppLayout'
import { Login } from './pages/Login'
import { TvPage } from './pages/Tv'
import { HojePage } from './modules/hoje/HojePage'
import { AlertasPage } from './modules/alertas/AlertasPage'
import { BoardPage } from './modules/board/BoardPage'
import { SprintPage } from './modules/sprint/SprintPage'
import { ProjetosPage } from './modules/projetos/ProjetosPage'
import { ProjetoDetalhePage } from './modules/projetos/ProjetoDetalhePage'
import { EntregaveisPage } from './modules/entregaveis/EntregaveisPage'
import { DemandasPage } from './modules/demandas/DemandasPage'
import { ChamadosPage } from './modules/chamados/ChamadosPage'
import { CapacidadePage } from './modules/capacidade/CapacidadePage'
import { ControleHorasPage } from './modules/controle-horas/ControleHorasPage'
import { FinanceiroPage } from './modules/financeiro/FinanceiroPage'
import { PortalPage } from './modules/portal/PortalPage'
import { IAPage } from './modules/ia/IAPage'
import { ConfiguracoesPage } from './modules/configuracoes/ConfiguracoesPage'
import { PlanejamentoPage } from './modules/planejamento/PlanejamentoPage'
import { DependenciasPage } from './modules/dependencias/DependenciasPage'
import { AnotacoesPage } from './modules/anotacoes/AnotacoesPage'
import { SolicitacoesPage } from './modules/solicitacoes/SolicitacoesPage'
import { CrmPage } from './modules/crm/CrmPage'
import { ApontamentosPage } from './modules/apontamentos/ApontamentosPage'
import { FechamentoPage } from './modules/fechamento/FechamentoPage'
import { PrepagoPage } from './modules/prepago/PrepagoPage'
import { PortfolioPage } from './modules/portfolio/PortfolioPage'
import { RelatoriosPage } from './modules/relatorios/RelatoriosPage'
import { CadastrosPage } from './modules/cadastros/CadastrosPage'
import { AdminPage } from './modules/admin/AdminPage'
import { TokensPage } from './modules/tokens/TokensPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/tv" element={<TvPage />} />
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/hoje" replace />} />
          <Route path="/hoje" element={<HojePage />} />
          <Route path="/alertas" element={<AlertasPage />} />
          <Route path="/board" element={<BoardPage />} />
          <Route path="/sprint" element={<SprintPage />} />
          <Route path="/projetos" element={<ProjetosPage />} />
          <Route path="/projetos/:id" element={<ProjetoDetalhePage />} />
          <Route path="/demandas" element={<DemandasPage />} />
          <Route path="/entregaveis" element={<EntregaveisPage />} />
          <Route path="/planejamento" element={<PlanejamentoPage />} />
          <Route path="/dependencias" element={<DependenciasPage />} />
          <Route path="/anotacoes" element={<AnotacoesPage />} />
          <Route path="/solicitacoes" element={<SolicitacoesPage />} />
          <Route path="/chamados" element={<ChamadosPage />} />
          <Route path="/crm" element={<CrmPage />} />
          <Route path="/capacidade" element={<CapacidadePage />} />
          <Route path="/controle-horas" element={<ControleHorasPage />} />
          <Route path="/apontamentos" element={<ApontamentosPage />} />
          <Route path="/financeiro" element={<FinanceiroPage />} />
          <Route path="/fechamento" element={<FechamentoPage />} />
          <Route path="/prepago" element={<PrepagoPage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/relatorios" element={<RelatoriosPage />} />
          <Route path="/portal" element={<PortalPage />} />
          <Route path="/ia" element={<IAPage />} />
          <Route path="/cadastros" element={<CadastrosPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/meus-tokens" element={<TokensPage />} />
          <Route path="/configuracoes" element={<ConfiguracoesPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/hoje" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
