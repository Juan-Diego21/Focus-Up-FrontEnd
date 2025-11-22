/**
 * Proveedor global de estado para sesiones de concentración
 *
 * Este componente maneja todo el estado y lógica de las sesiones de concentración
 * a nivel global de la aplicación. Es crítico que este provider nunca se desmonte
 * durante la navegación SPA para mantener la persistencia del audio y el estado.
 *
 * Características principales:
 * - Estado global de sesión activa
 * - Sincronización multi-pestaña
 * - Cola offline para acciones críticas
 * - Detección de suspensión del sistema
 * - Persistencia automática en localStorage
 * - Integración con servicios de audio y métodos
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import type { ActiveSession, SessionCreateDto } from '../types/api';
import { sessionService } from '../services/sessionService';
import { audioService } from '../services/audioService';
import { getBroadcastChannel, type BroadcastMessage } from '../utils/broadcastChannel';
import { getOfflineQueue } from '../utils/offlineQueue';
import { getSleepDetector } from '../utils/sleepDetector';
import { mapServerSession, isSessionExpired } from '../utils/sessionMappers';

// Claves para localStorage
const SESSION_STORAGE_KEY = 'focusup:activeSession';

// Estado del provider
interface ProviderState {
  activeSession: ActiveSession | null;
  isMinimized: boolean;
  showContinueModal: boolean;
  isSyncing: boolean; // Indicador de sincronización offline
  tabLockToken: string | null; // Token para control multi-pestaña
}

// API del contexto
interface ConcentrationSessionContextType {
  // Gestión de sesiones
  startSession: (payload: SessionCreateDto) => Promise<void>;
  pauseSession: () => Promise<void>;
  resumeSession: () => Promise<void>;
  finishLater: () => Promise<void>;
  completeSession: () => Promise<void>;

  // Control de UI
  minimize: () => void;
  maximize: () => void;

  // Acceso a estado
  getState: () => ProviderState;

  // Eventos
  onMethodCompleted: (callback: () => void) => () => void;
  onStateChange: (callback: (state: ProviderState) => void) => () => void;

  // Multi-pestaña
  broadcastState: () => void;
  acquireTabLock: () => boolean;
  releaseTabLock: () => void;
}

// Contexto
const ConcentrationSessionContext = createContext<ConcentrationSessionContextType | undefined>(undefined);

// Props del provider
interface ConcentrationSessionProviderProps {
  children: ReactNode;
}

/**
 * Proveedor global de sesiones de concentración
 */
export const ConcentrationSessionProvider: React.FC<ConcentrationSessionProviderProps> = ({ children }) => {
  // Estado principal
  const [state, setState] = useState<ProviderState>({
    activeSession: null,
    isMinimized: false,
    showContinueModal: false,
    isSyncing: false,
    tabLockToken: null,
  });

  // Refs para callbacks y estado persistente
  const methodCompletedCallbacks = useRef<Map<string, () => void>>(new Map());
  const stateChangeCallbacks = useRef<Map<string, (state: ProviderState) => void>>(new Map());
  const tabLockToken = useRef<string | null>(null);

  // Servicios
  const broadcastChannel = getBroadcastChannel();
  const offlineQueue = getOfflineQueue();
  const sleepDetector = getSleepDetector();

  /**
   * Inicializa el provider al montar
   */
  useEffect(() => {
    initializeProvider();
    setupBroadcastListeners();
    setupSleepDetection();

    // Cleanup al desmontar
    return () => {
      broadcastChannel.close();
      sleepDetector.stop();
    };
  }, []);

  /**
   * Inicializa el provider cargando estado persistido
   */
  const initializeProvider = useCallback(() => {
    try {
      const stored = localStorage.getItem(SESSION_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);

        // Verificar expiración
        if (isSessionExpired(parsed.persistedAt)) {
          console.log('Sesión expirada, eliminando');
          localStorage.removeItem(SESSION_STORAGE_KEY);
          return;
        }

        // Mapear sesión del servidor al cliente
        const session = mapServerSession(parsed, parsed.persistedAt);

        setState(prev => ({
          ...prev,
          activeSession: session,
          showContinueModal: true, // Mostrar modal de continuar
        }));

        // Si la sesión estaba corriendo, corregir timer
        if (session.isRunning) {
          // El timer se corregirá automáticamente en getVisibleTime()
        }
      }
    } catch (error) {
      console.error('Error inicializando provider:', error);
    }
  }, []);

  /**
   * Configura listeners para broadcast multi-pestaña
   */
  const setupBroadcastListeners = useCallback(() => {
    broadcastChannel.addListener('session-provider', (message: BroadcastMessage) => {
      switch (message.type) {
        case 'SESSION_UPDATE':
          if (message.state) {
            setState(prev => ({
              ...prev,
              activeSession: message.state || null,
            }));
          }
          break;

        case 'SESSION_COMPLETED':
        case 'SESSION_PAUSED':
        case 'SESSION_RESUMED':
          // Recargar estado desde servidor si es necesario
          if (state.activeSession) {
            reloadSessionState(state.activeSession.sessionId);
          }
          break;
      }
    });
  }, [state.activeSession]);

  /**
   * Configura detección de suspensión del sistema
   */
  const setupSleepDetection = useCallback(() => {
    sleepDetector.addCallback('session-timer-correction', (sleptMs: number) => {
      console.log(`Corrigiendo timer después de ${sleptMs}ms de suspensión`);
      // La corrección ocurre automáticamente en getVisibleTime()
      // No necesitamos actualizar estado aquí
    });

    sleepDetector.start();
  }, []);

  /**
   * Recarga el estado de la sesión desde el servidor
   */
  const reloadSessionState = useCallback(async (sessionId: string) => {
    try {
      const sessionDto = await sessionService.getSession(sessionId);
      const session = mapServerSession(sessionDto);

      setState(prev => ({
        ...prev,
        activeSession: session,
      }));
    } catch (error) {
      console.error('Error recargando estado de sesión:', error);
    }
  }, []);

  /**
   * Persiste el estado en localStorage
   */
  const persistState = useCallback((session: ActiveSession | null) => {
    try {
      if (session) {
        const toPersist = {
          ...session,
          persistedAt: new Date().toISOString(),
        };
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(toPersist));
      } else {
        localStorage.removeItem(SESSION_STORAGE_KEY);
      }
    } catch (error) {
      console.error('Error persistiendo estado:', error);
    }
  }, []);

  /**
   * Inicia una nueva sesión
   */
  const startSession = useCallback(async (payload: SessionCreateDto) => {
    try {
      setState(prev => ({ ...prev, isSyncing: true }));

      // Crear sesión en el servidor
      const sessionDto = await sessionService.startSession(payload);
      const session = mapServerSession(sessionDto);

      // Aplicar álbum si fue seleccionado
      if (payload.albumId) {
        await audioService.replaceIfSessionAlbum(payload.albumId);
      }

      // Actualizar estado
      setState(prev => ({
        ...prev,
        activeSession: session,
        isMinimized: false,
        showContinueModal: false,
        isSyncing: false,
      }));

      // Persistir
      persistState(session);

      // Broadcast a otras pestañas
      broadcastChannel.broadcastSessionUpdate(session);

    } catch (error) {
      console.error('Error iniciando sesión:', error);
      setState(prev => ({ ...prev, isSyncing: false }));
      throw error;
    }
  }, [persistState]);

  /**
   * Pausa la sesión actual
   */
  const pauseSession = useCallback(async () => {
    if (!state.activeSession || !state.activeSession.isRunning) return;

    try {
      setState(prev => ({ ...prev, isSyncing: true }));

      // Intentar pausa en servidor, o enqueue si offline
      if (navigator.onLine) {
        await sessionService.pauseSession(state.activeSession.sessionId);
      } else {
        offlineQueue.enqueue('pause', state.activeSession.sessionId);
      }

      // Actualizar estado local
      const updatedSession = {
        ...state.activeSession,
        isRunning: false,
        pausedAt: new Date().toISOString(),
        status: 'paused' as const,
        serverEstado: 'pending' as const,
      };

      setState(prev => ({
        ...prev,
        activeSession: updatedSession,
        isSyncing: false,
      }));

      persistState(updatedSession);
      broadcastChannel.broadcastSessionPaused();

    } catch (error) {
      console.error('Error pausando sesión:', error);
      setState(prev => ({ ...prev, isSyncing: false }));
      throw error;
    }
  }, [state.activeSession]);

  /**
   * Reanuda la sesión pausada
   */
  const resumeSession = useCallback(async () => {
    if (!state.activeSession || state.activeSession.isRunning) return;

    try {
      setState(prev => ({ ...prev, isSyncing: true }));

      // Intentar reanudar en servidor, o enqueue si offline
      if (navigator.onLine) {
        await sessionService.resumeSession(state.activeSession.sessionId);
      } else {
        offlineQueue.enqueue('resume', state.activeSession.sessionId);
      }

      // Actualizar estado local
      const updatedSession = {
        ...state.activeSession,
        isRunning: true,
        pausedAt: undefined,
        status: 'active' as const,
        serverEstado: 'pending' as const,
      };

      setState(prev => ({
        ...prev,
        activeSession: updatedSession,
        isSyncing: false,
      }));

      persistState(updatedSession);
      broadcastChannel.broadcastSessionResumed();

    } catch (error) {
      console.error('Error reanudando sesión:', error);
      setState(prev => ({ ...prev, isSyncing: false }));
      throw error;
    }
  }, [state.activeSession]);

  /**
   * Marca la sesión como "terminar más tarde"
   */
  const finishLater = useCallback(async () => {
    if (!state.activeSession) return;

    try {
      setState(prev => ({ ...prev, isSyncing: true }));

      if (navigator.onLine) {
        await sessionService.finishLater(state.activeSession.sessionId);
      } else {
        offlineQueue.enqueue('finish-later', state.activeSession.sessionId);
      }

      // Limpiar estado
      setState(prev => ({
        ...prev,
        activeSession: null,
        isMinimized: false,
        isSyncing: false,
      }));

      persistState(null);
      broadcastChannel.broadcastSessionUpdate(null);

    } catch (error) {
      console.error('Error en finish later:', error);
      setState(prev => ({ ...prev, isSyncing: false }));
      throw error;
    }
  }, [state.activeSession]);

  /**
   * Completa la sesión
   */
  const completeSession = useCallback(async () => {
    if (!state.activeSession) return;

    try {
      setState(prev => ({ ...prev, isSyncing: true }));

      if (navigator.onLine) {
        await sessionService.completeSession(state.activeSession.sessionId);
      } else {
        offlineQueue.enqueue('complete', state.activeSession.sessionId);
      }

      // Limpiar estado
      setState(prev => ({
        ...prev,
        activeSession: null,
        isMinimized: false,
        isSyncing: false,
      }));

      persistState(null);
      broadcastChannel.broadcastSessionUpdate(null);
      broadcastChannel.broadcastSessionCompleted();

    } catch (error) {
      console.error('Error completando sesión:', error);
      setState(prev => ({ ...prev, isSyncing: false }));
      throw error;
    }
  }, [state.activeSession]);

  /**
   * Minimiza la sesión
   */
  const minimize = useCallback(() => {
    setState(prev => ({ ...prev, isMinimized: true }));
  }, []);

  /**
   * Maximiza la sesión
   */
  const maximize = useCallback(() => {
    setState(prev => ({ ...prev, isMinimized: false }));
  }, []);

  /**
   * Obtiene el estado actual
   */
  const getState = useCallback(() => state, [state]);

  /**
   * Registra callback para completación de método
   */
  const onMethodCompleted = useCallback((callback: () => void) => {
    const id = `method-callback-${Date.now()}-${Math.random()}`;
    methodCompletedCallbacks.current.set(id, callback);

    return () => {
      methodCompletedCallbacks.current.delete(id);
    };
  }, []);

  /**
   * Registra callback para cambios de estado
   */
  const onStateChange = useCallback((callback: (state: ProviderState) => void) => {
    const id = `state-callback-${Date.now()}-${Math.random()}`;
    stateChangeCallbacks.current.set(id, callback);

    return () => {
      stateChangeCallbacks.current.delete(id);
    };
  }, []);

  /**
   * Broadcast estado a otras pestañas
   */
  const broadcastState = useCallback(() => {
    broadcastChannel.broadcastSessionUpdate(state.activeSession);
  }, [state.activeSession]);

  /**
   * Adquiere lock para control del timer
   */
  const acquireTabLock = useCallback((): boolean => {
    if (!tabLockToken.current) {
      tabLockToken.current = `lock-${Date.now()}-${Math.random()}`;
      setState(prev => ({ ...prev, tabLockToken: tabLockToken.current }));
      broadcastChannel.broadcastLockAcquired(tabLockToken.current!);
      return true;
    }
    return false;
  }, []);

  /**
   * Libera lock del timer
   */
  const releaseTabLock = useCallback(() => {
    tabLockToken.current = null;
    setState(prev => ({ ...prev, tabLockToken: null }));
    broadcastChannel.broadcastLockReleased();
  }, []);

  // Notificar cambios de estado
  useEffect(() => {
    stateChangeCallbacks.current.forEach(callback => {
      try {
        callback(state);
      } catch (error) {
        console.error('Error en callback de cambio de estado:', error);
      }
    });
  }, [state]);

  // API del contexto
  const contextValue: ConcentrationSessionContextType = {
    startSession,
    pauseSession,
    resumeSession,
    finishLater,
    completeSession,
    minimize,
    maximize,
    getState,
    onMethodCompleted,
    onStateChange,
    broadcastState,
    acquireTabLock,
    releaseTabLock,
  };

  return (
    <ConcentrationSessionContext.Provider value={contextValue}>
      {children}
    </ConcentrationSessionContext.Provider>
  );
};

/**
 * Hook para usar el contexto de sesiones de concentración
 */
export const useConcentrationSession = () => {
  const context = useContext(ConcentrationSessionContext);
  if (context === undefined) {
    throw new Error('useConcentrationSession must be used within a ConcentrationSessionProvider');
  }
  return context;
};

export default ConcentrationSessionProvider;