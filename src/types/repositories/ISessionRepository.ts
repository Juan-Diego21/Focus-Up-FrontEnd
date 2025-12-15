// Interfaz para repositorio de sesiones
import type { ISession } from '../domain/sessions';
import type { IBaseRepository } from './IBaseRepository';

export interface ISessionRepository extends IBaseRepository<
  ISession,
  Omit<ISession, 'idSesion' | 'fechaCreacion' | 'fechaActualizacion'>,
  Partial<Omit<ISession, 'idSesion' | 'fechaCreacion'>>
> {
  // Métodos específicos de sesiones
  findByUserId(userId: number): Promise<ISession[]>;
  findActiveByUserId(userId: number): Promise<ISession[]>;
  findByDateRange(userId: number, startDate: Date, endDate: Date): Promise<ISession[]>;
  updateElapsedTime(sessionId: number, elapsedMs: number): Promise<ISession | null>;
}