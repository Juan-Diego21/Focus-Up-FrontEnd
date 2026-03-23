import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import { queryClient } from './lib/queryClient'
import { MusicPlayerProvider } from './shared/contexts/MusicPlayerContext'
import { AuthProvider } from './modules/auth'
import { ConcentrationSessionProvider } from './shared/providers/ConcentrationSessionProvider'
import { MusicPlayer } from './shared/components/ui/MusicPlayer'
import { DevTools } from './shared/components/DevTools'
import { SessionsUI } from './modules/sessions/components'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <MusicPlayerProvider>
      <BrowserRouter>
        <StrictMode>
          <AuthProvider>
            <ConcentrationSessionProvider>
              <App />
              {/* MusicPlayer y SessionsUI ahora tienen acceso completo a AuthProvider y ConcentrationSessionProvider */}
              {/* Esto garantiza que puedan acceder al estado de autenticación y sesiones de concentración */}
              <MusicPlayer />
              <SessionsUI />
            </ConcentrationSessionProvider>
          </AuthProvider>
        </StrictMode>
      </BrowserRouter>
    </MusicPlayerProvider>
    {/* DevTools controladas por F5 */}
    <DevTools />
  </QueryClientProvider>,
)
