/**
 * Utilidades de mapeo y tiempo para sesiones.
 * Este archivo es la fuente canónica en arquitectura modules + shared.
 */
import type { SessionDto, ActiveSession } from '../../types/api';
import type { IConcentrationSession } from '../../types/domain/sessions';

type SessionTimerShape = Pick<ActiveSession, 'isRunning' | 'startTime' | 'elapsedMs'>;

export function mapServerSession(
  dto: SessionDto,
  persistedAt: string = new Date().toISOString(),
): ActiveSession {
  let clientStatus: 'active' | 'paused' | 'completed';

  if (dto.estado === 'completed') {
    clientStatus = 'completed';
  } else if (dto.estado === 'pending') {
    clientStatus = dto.isRunning ? 'active' : 'paused';
  } else {
    clientStatus = 'paused';
  }

  return {
    sessionId: dto.sessionId,
    title: dto.title,
    description: dto.description,
    type: dto.type,
    eventId: dto.eventId,
    methodId: dto.methodId,
    albumId: dto.albumId,
    startTime: dto.startTime,
    pausedAt: dto.pausedAt,
    accumulatedMs: dto.accumulatedMs,
    isRunning: dto.isRunning,
    status: clientStatus,
    serverEstado: dto.estado,
    elapsedMs: dto.elapsedMs,
    persistedAt,
  };
}

export function mapClientToServerStatus(
  clientStatus: 'active' | 'paused' | 'completed',
): 'pending' | 'completed' {
  if (clientStatus === 'completed') {
    return 'completed';
  }
  return 'pending';
}

export function getVisibleTime(session: SessionTimerShape | IConcentrationSession): number {
  if (session.isRunning) {
    const startTimeMs = new Date(session.startTime).getTime();
    const now = Date.now();
    return session.elapsedMs + (now - startTimeMs);
  }
  return session.elapsedMs;
}

export function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export function isSessionExpired(persistedAt: string): boolean {
  const persistedDate = new Date(persistedAt);
  const now = new Date();
  const daysDiff = (now.getTime() - persistedDate.getTime()) / (1000 * 60 * 60 * 24);
  return daysDiff > 7;
}
