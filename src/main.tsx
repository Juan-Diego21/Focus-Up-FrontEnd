import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import { MusicPlayerProvider } from './contexts/MusicPlayerContext'
import { AuthProvider } from './contexts/AuthContext'
import { MusicPlayer } from './components/ui/MusicPlayer'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <MusicPlayerProvider>
    <BrowserRouter>
      <StrictMode>
        <AuthProvider>
          <App />
          <MusicPlayer />
        </AuthProvider>
      </StrictMode>
    </BrowserRouter>
  </MusicPlayerProvider>,
)
