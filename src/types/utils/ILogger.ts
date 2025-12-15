// Interfaz para sistema de logging
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface ILogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: Record<string, any>;
  userId?: number;
  sessionId?: string;
  error?: Error;
}

export interface ILogger {
  // Métodos de logging básicos
  debug(message: string, context?: Record<string, any>): void;
  info(message: string, context?: Record<string, any>): void;
  warn(message: string, context?: Record<string, any>): void;
  error(message: string, error?: Error, context?: Record<string, any>): void;

  // Logging con contexto de usuario/sesión
  userLog(userId: number, level: LogLevel, message: string, context?: Record<string, any>): void;
  sessionLog(sessionId: string, level: LogLevel, message: string, context?: Record<string, any>): void;

  // Consultas y gestión
  getLogs(level?: LogLevel, limit?: number): Promise<ILogEntry[]>;
  getUserLogs(userId: number, limit?: number): Promise<ILogEntry[]>;
  getSessionLogs(sessionId: string, limit?: number): Promise<ILogEntry[]>;

  // Configuración
  setLevel(level: LogLevel): void;
  isEnabled(level: LogLevel): boolean;
}