// Interfaz que representa la ejecución de un método de estudio
export interface IMethodExecution {
  /** ID del método */
  methodId: number;
  /** Estado actual de ejecución */
  status: 'idle' | 'running' | 'paused' | 'completed';
  /** Tiempo transcurrido en ms */
  elapsedTime: number;
  /** Ciclo actual (para Pomodoro) */
  currentCycle?: number;
  /** Fase actual (work, shortBreak, longBreak) */
  currentPhase?: 'work' | 'shortBreak' | 'longBreak';
  /** Timestamp de inicio */
  startTime?: string;
  /** Timestamp de pausa */
  pausedAt?: string;
}