import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import { queryClient } from './services/queryClient'
import { useUIStore, applyTheme } from './stores/uiStore'
import './styles/index.css'

// Aplica o tema salvo antes de montar (evita flash).
applyTheme(useUIStore.getState().theme)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
