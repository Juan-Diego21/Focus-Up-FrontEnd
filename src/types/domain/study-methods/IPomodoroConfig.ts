// Interfaz que representa la configuración del método Pomodoro
export interface IPomodoroConfig {
  /** Duración del período de trabajo en minutos */
  workDuration: number;
  /** Duración del descanso corto en minutos */
  shortBreakDuration: number;
  /** Duración del descanso largo en minutos */
  longBreakDuration: number;
  /** Número de ciclos antes del descanso largo */
  cyclesBeforeLongBreak: number;
  /** Indica si está activo */
  isActive: boolean;
}