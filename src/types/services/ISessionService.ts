// Interfaz para servicio de sesiones
import type { ISession } from '../domain/sessions';

export interface ISessionService {
  // Operaciones CRUD
  createSession(sessionData: Omit<ISession, 'idSesion' | 'fechaCreacion' | 'fechaActualizacion'>): Promise<ISession>;
  getSessionById(sessionId: number): Promise<ISession | null>;
  getUserSessions(userId: number): Promise<ISession[]>;
  updateSession(sessionId: number, updates: Partial<ISession>): Promise<ISession | null>;
  deleteSession(sessionId: number): Promise<boolean>;

  // Operaciones específicas de sesiones
  startSession(sessionId: number): Promise<ISession>;
  pauseSession(sessionId: number, elapsedMs: number): Promise<ISession>;
  resumeSession(sessionId: number): Promise<ISession>;
  completeSession(sessionId: number, finalElapsedMs: number): Promise<ISession>;
  finishLater(sessionId: number, elapsedMs: number): Promise<ISession>;

  // Consultas avanzadas
  getActiveSessions(userId: number): Promise<ISession[]>;
  getSessionsByDateRange(userId: number, startDate: Date, endDate: Date): Promise<ISession[]>;
  getTotalSessionTime(userId: number): Promise<number>;
}