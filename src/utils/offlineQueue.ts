/**
 * Utilidades para manejar acciones offline en sesiones de concentración
 *
 * Este módulo implementa una cola de acciones que se ejecutan cuando
 * la conexión a internet no está disponible. Las acciones se almacenan
 * en localStorage y se reenvían automáticamente cuando la conexión
 * vuelve.
 *
 * Es crítico para mantener la funcionalidad cuando el usuario está
 * offline, especialmente en sesiones de concentración que no deben
 * interrumpirse por problemas de conectividad.
 */


// Claves para localStorage
const OFFLINE_QUEUE_KEY = 'focusup-offline-queue';
const OFFLINE_SYNC_STATUS_KEY = 'focusup-offline-sync-status';

// Tipos de acciones que pueden encolarse
export type OfflineActionType =
  | 'pause'
  | 'resume'
  | 'finish-later'
  | 'complete';

// Estructura de una acción offline
export interface OfflineAction {
  id: string;
  type: OfflineActionType;
  sessionId: string;
  timestamp: string;
  payload?: any; // Datos adicionales si son necesarios
  retryCount: number;
  maxRetries: number;
}

// Estado de sincronización offline
export interface OfflineSyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncAttempt: string | null;
  pendingActions: number;
}

// Cola de acciones offline
class OfflineActionQueue {
  private actions: OfflineAction[] = [];
  private isProcessing = false;
  private syncStatus: OfflineSyncStatus = {
    isOnline: navigator.onLine,
    isSyncing: false,
    lastSyncAttempt: null,
    pendingActions: 0,
  };

  /**
   * Constructor - carga acciones desde localStorage
   */
  constructor() {
    this.loadFromStorage();
    this.loadSyncStatus();
    this.setupNetworkListeners();
  }

  /**
   * Configura listeners para detectar cambios en la conectividad
   */
  private setupNetworkListeners(): void {
    window.addEventListener('online', () => {
      this.syncStatus.isOnline = true;
      this.saveSyncStatus();
      this.processQueue();
    });

    window.addEventListener('offline', () => {
      this.syncStatus.isOnline = false;
      this.saveSyncStatus();
    });
  }

  /**
   * Carga acciones desde localStorage
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(OFFLINE_QUEUE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.actions = parsed.map((action: any) => ({
          ...action,
          retryCount: action.retryCount || 0,
          maxRetries: action.maxRetries || 3,
        }));
      }
    } catch (error) {
      console.error('Error cargando cola offline:', error);
      this.actions = [];
    }
  }

  /**
   * Guarda acciones en localStorage
   */
  private saveToStorage(): void {
    try {
      localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(this.actions));
    } catch (error) {
      console.error('Error guardando cola offline:', error);
    }
  }

  /**
   * Carga estado de sincronización desde localStorage
   */
  private loadSyncStatus(): void {
    try {
      const stored = localStorage.getItem(OFFLINE_SYNC_STATUS_KEY);
      if (stored) {
        this.syncStatus = { ...this.syncStatus, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Error cargando estado de sync:', error);
    }
  }

  /**
   * Guarda estado de sincronización en localStorage
   */
  private saveSyncStatus(): void {
    try {
      this.syncStatus.pendingActions = this.actions.length;
      localStorage.setItem(OFFLINE_SYNC_STATUS_KEY, JSON.stringify(this.syncStatus));
    } catch (error) {
      console.error('Error guardando estado de sync:', error);
    }
  }

  /**
   * Agrega una acción a la cola
   *
   * @param type - Tipo de acción
   * @param sessionId - ID de la sesión
   * @param payload - Datos adicionales
   */
  enqueue(type: OfflineActionType, sessionId: string, payload?: any): void {
    const action: OfflineAction = {
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      sessionId,
      timestamp: new Date().toISOString(),
      payload,
      retryCount: 0,
      maxRetries: 3,
    };

    this.actions.push(action);
    this.saveToStorage();
    this.saveSyncStatus();

    // Intentar procesar inmediatamente si estamos online
    if (this.syncStatus.isOnline) {
      this.processQueue();
    }
  }

  /**
   * Procesa la cola de acciones pendientes
   */
  async processQueue(): Promise<void> {
    if (this.isProcessing || !this.syncStatus.isOnline || this.actions.length === 0) {
      return;
    }

    this.isProcessing = true;
    this.syncStatus.isSyncing = true;
    this.syncStatus.lastSyncAttempt = new Date().toISOString();
    this.saveSyncStatus();

    try {
      // Procesar acciones una por una
      const actionsToProcess = [...this.actions];

      for (const action of actionsToProcess) {
        if (action.retryCount >= action.maxRetries) {
          console.warn(`Acción ${action.id} excedió máximo de reintentos, descartando`);
          this.removeAction(action.id);
          continue;
        }

        try {
          await this.executeAction(action);
          this.removeAction(action.id);
        } catch (error) {
          console.error(`Error ejecutando acción ${action.type}:`, error);
          action.retryCount++;

          // Si es un error de red, esperar antes de reintentar
          if (!navigator.onLine) {
            break;
          }

          // Esperar un tiempo exponencial antes del siguiente reintento
          const delay = Math.min(1000 * Math.pow(2, action.retryCount), 30000);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    } finally {
      this.isProcessing = false;
      this.syncStatus.isSyncing = false;
      this.saveSyncStatus();
    }
  }

  /**
   * Ejecuta una acción específica
   *
   * @param action - Acción a ejecutar
   */
  private async executeAction(action: OfflineAction): Promise<void> {
    // Importar sessionService dinámicamente para evitar dependencias circulares
    const { sessionService } = await import('../services/sessionService');

    switch (action.type) {
      case 'pause':
        await sessionService.pauseSession(action.sessionId);
        break;
      case 'resume':
        await sessionService.resumeSession(action.sessionId);
        break;
      case 'finish-later':
        await sessionService.finishLater(action.sessionId);
        break;
      case 'complete':
        await sessionService.completeSession(action.sessionId);
        break;
      default:
        throw new Error(`Tipo de acción desconocido: ${action.type}`);
    }
  }

  /**
   * Remueve una acción de la cola
   *
   * @param actionId - ID de la acción a remover
   */
  private removeAction(actionId: string): void {
    this.actions = this.actions.filter(action => action.id !== actionId);
    this.saveToStorage();
    this.saveSyncStatus();
  }

  /**
   * Obtiene el estado actual de sincronización
   */
  getSyncStatus(): OfflineSyncStatus {
    return { ...this.syncStatus };
  }

  /**
   * Verifica si hay acciones pendientes
   */
  hasPendingActions(): boolean {
    return this.actions.length > 0;
  }

  /**
   * Fuerza el procesamiento de la cola (útil para testing)
   */
  forceProcessQueue(): void {
    if (this.syncStatus.isOnline) {
      this.processQueue();
    }
  }

  /**
   * Limpia todas las acciones (útil para reset)
   */
  clearQueue(): void {
    this.actions = [];
    this.saveToStorage();
    this.saveSyncStatus();
  }
}

// Instancia singleton
let offlineQueueInstance: OfflineActionQueue | null = null;

/**
 * Obtiene la instancia singleton de la cola offline
 */
export function getOfflineQueue(): OfflineActionQueue {
  if (!offlineQueueInstance) {
    offlineQueueInstance = new OfflineActionQueue();
  }
  return offlineQueueInstance;
}

/**
 * Hook personalizado para usar la cola offline en componentes
 */
export function useOfflineQueue() {
  return getOfflineQueue();
}