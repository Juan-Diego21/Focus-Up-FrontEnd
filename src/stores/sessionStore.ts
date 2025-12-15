// Store de Zustand para gestión de sesiones de concentración
// Reemplaza ConcentrationSessionProvider con mejor performance
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { IConcentrationSession } from '../types/domain/sessions';

interface SessionState {
  // Estado de sesión actual
  currentSession: IConcentrationSession | null;
  isActive: boolean;
  isPaused: boolean;

  // Estadísticas
  totalSessions: number;
  totalTime: number; // en minutos

  // Acciones
  startSession: (sessionData: Omit<IConcentrationSession, 'sessionId' | 'startTime' | 'isRunning' | 'status' | 'serverEstado' | 'elapsedMs'>) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  endSession: () => void;
  updateElapsedTime: (elapsedMs: number) => void;
  loadSession: (session: IConcentrationSession) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      currentSession: null,
      isActive: false,
      isPaused: false,
      totalSessions: 0,
      totalTime: 0,

      // Iniciar nueva sesión
      startSession: (sessionData) => {
        const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const startTime = new Date().toISOString();

        const newSession: IConcentrationSession = {
          ...sessionData,
          sessionId,
          startTime,
          isRunning: true,
          status: 'active',
          serverEstado: 'pending',
          elapsedMs: 0,
          persistedAt: startTime,
        };

        set({
          currentSession: newSession,
          isActive: true,
          isPaused: false,
        });
      },

      // Pausar sesión
      pauseSession: () => {
        set((state) => {
          if (state.currentSession) {
            return {
              currentSession: {
                ...state.currentSession,
                isRunning: false,
                status: 'paused',
                pausedAt: new Date().toISOString(),
              },
              isPaused: true,
            };
          }
          return state;
        });
      },

      // Reanudar sesión
      resumeSession: () => {
        set((state) => {
          if (state.currentSession) {
            return {
              currentSession: {
                ...state.currentSession,
                isRunning: true,
                status: 'active',
                pausedAt: undefined,
              },
              isPaused: false,
            };
          }
          return state;
        });
      },

      // Finalizar sesión
      endSession: () => {
        set((state) => {
          if (state.currentSession) {
            const sessionTime = Math.floor(state.currentSession.elapsedMs / (1000 * 60)); // minutos
            return {
              currentSession: {
                ...state.currentSession,
                isRunning: false,
                status: 'completed',
                serverEstado: 'completed',
              },
              isActive: false,
              isPaused: false,
              totalSessions: state.totalSessions + 1,
              totalTime: state.totalTime + sessionTime,
            };
          }
          return state;
        });
      },

      // Actualizar tiempo transcurrido
      updateElapsedTime: (elapsedMs) => {
        set((state) => {
          if (state.currentSession) {
            return {
              currentSession: {
                ...state.currentSession,
                elapsedMs,
                persistedAt: new Date().toISOString(),
              },
            };
          }
          return state;
        });
      },

      // Cargar sesión existente
      loadSession: (session) => {
        set({
          currentSession: session,
          isActive: session.isRunning,
          isPaused: session.status === 'paused',
        });
      },

      // Limpiar sesión
      clearSession: () => {
        set({
          currentSession: null,
          isActive: false,
          isPaused: false,
        });
      },
    }),
    {
      name: 'session-store',
      partialize: (state) => ({
        totalSessions: state.totalSessions,
        totalTime: state.totalTime,
      }),
    }
  )
);