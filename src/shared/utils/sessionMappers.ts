/**
 * Utilidades para mapear estados de sesión entre backend y frontend
 *
 * Este módulo proporciona funciones para convertir los estados de sesión
 * del servidor (que usa 'estado': 'pending' | 'completed') a los estados
 * del cliente ('active' | 'paused' | 'completed'), y viceversa.
 *
 * Esto es crítico porque el backend no maneja estados temporales como
 * 'active' o 'paused', sino que los infiere del campo 'isRunning'.
 */

import type { IConcentrationSession } from '../../types/domain/sessions';

/**
 * Calcula el tiempo visible de la sesión usando la fórmula correcta
 *
 * Fórmula: elapsedMs + (Date.now() - startTime) si está corriendo
 * O solo elapsedMs si está pausada
 *
 * @param session - Sesión activa
 * @returns Tiempo visible en milisegundos
 */
export function getVisibleTime(session: IConcentrationSession): number {
  if (session.isRunning) {
    // Si está corriendo, agregar el tiempo transcurrido desde startTime
    const startTimeMs = new Date(session.startTime).getTime();
    const now = Date.now();
    return session.elapsedMs + (now - startTimeMs);
  } else {
    // Si está pausada, mostrar solo elapsedMs
    return session.elapsedMs;
  }
}

/**
 * Formatea milisegundos a formato HH:MM:SS
 *
 * @param ms - Milisegundos
 * @returns String en formato HH:MM:SS
 */
export function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}