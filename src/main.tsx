import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import { MusicPlayerProvider } from './contexts/MusicPlayerContext'
import { AuthProvider } from './contexts/AuthContext'
import { ConcentrationSessionProvider } from './providers/ConcentrationSessionProvider'
import { MusicPlayer } from './components/ui/MusicPlayer'
import { SessionsUI } from './components/SessionsUI'
import App from './App'

createRoot(document.getElementById('root')!).render(
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
  </MusicPlayerProvider>,
)
