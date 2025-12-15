// Interfaz que representa una sesión de concentración activa en el frontend
export interface IConcentrationSession {
  /** ID único de la sesión */
  sessionId: string;
  /** Título de la sesión */
  title: string;
  /** Descripción opcional */
  description?: string;
  /** Tipo de sesión */
  type: 'rapid' | 'scheduled';
  /** ID del evento asociado (opcional) */
  eventId?: number;
  /** ID del método de estudio (opcional) */
  methodId?: number;
  /** ID del álbum de música (opcional) */
  albumId?: number;
  /** Hora de inicio en ISO string */
  startTime: string;
  /** Hora de pausa (opcional) */
  pausedAt?: string;
  /** Tiempo acumulado en ms */
  accumulatedMs: number;
  /** Indica si está corriendo */
  isRunning: boolean;
  /** Estado del cliente */
  status: 'active' | 'paused' | 'completed';
  /** Indica si está atrasada (para programadas) */
  isLate?: boolean;
  /** Estado del servidor */
  serverEstado: 'pending' | 'completed';
  /** Tiempo transcurrido del servidor */
  elapsedMs: number;
  /** Timestamp de persistencia */
  persistedAt: string;
}