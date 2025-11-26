/**
 * Pruebas unitarias para las utilidades de mapeo de sesiones
 *
 * Verifica que las funciones de cálculo de tiempo funcionen correctamente
 * y que el mapeo de estados entre backend y frontend sea preciso.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getVisibleTime, formatTime } from './sessionMappers';
import type { ActiveSession } from '../types/api';

describe('Session Mappers - Timer Calculations', () => {
  // Mock Date.now para pruebas consistentes
  const mockNow = 1000000; // 1,000,000 ms desde epoch
  const originalDateNow = Date.now;

  beforeEach(() => {
    Date.now = vi.fn(() => mockNow);
  });

  afterEach(() => {
    Date.now = originalDateNow;
  });

  describe('getVisibleTime', () => {
    it('debe calcular correctamente el tiempo cuando la sesión está corriendo', () => {
      const session: ActiveSession = {
        sessionId: 'test-session',
        title: 'Test Session',
        type: 'rapid',
        isRunning: true,
        elapsedMs: 5000, // 5 segundos ya transcurridos
        startTime: new Date(mockNow - 3000).toISOString(), // Iniciada hace 3 segundos
        accumulatedMs: 5000,
        status: 'active',
        serverEstado: 'pending',
        persistedAt: new Date().toISOString(),
      };

      const visibleTime = getVisibleTime(session);
      // Debe ser: elapsedMs + (now - startTime) = 5000 + 3000 = 8000
      expect(visibleTime).toBe(8000);
    });

    it('debe devolver elapsedMs cuando la sesión está pausada', () => {
      const session: ActiveSession = {
        sessionId: 'test-session',
        title: 'Test Session',
        type: 'rapid',
        isRunning: false,
        elapsedMs: 10000, // 10 segundos
        startTime: new Date(mockNow - 5000).toISOString(),
        accumulatedMs: 10000,
        status: 'paused',
        serverEstado: 'pending',
        persistedAt: new Date().toISOString(),
      };

      const visibleTime = getVisibleTime(session);
      // Debe ser solo elapsedMs = 10000
      expect(visibleTime).toBe(10000);
    });

    it('debe manejar elapsedMs cero correctamente', () => {
      const session: ActiveSession = {
        sessionId: 'test-session',
        title: 'Test Session',
        type: 'rapid',
        isRunning: true,
        elapsedMs: 0,
        startTime: new Date(mockNow - 2000).toISOString(),
        accumulatedMs: 0,
        status: 'active',
        serverEstado: 'pending',
        persistedAt: new Date().toISOString(),
      };

      const visibleTime = getVisibleTime(session);
      // Debe ser: 0 + (now - startTime) = 2000
      expect(visibleTime).toBe(2000);
    });
  });

  describe('formatTime', () => {
    it('debe formatear milisegundos correctamente', () => {
      expect(formatTime(0)).toBe('00:00:00');
      expect(formatTime(1000)).toBe('00:00:01'); // 1 segundo
      expect(formatTime(60000)).toBe('00:01:00'); // 1 minuto
      expect(formatTime(3600000)).toBe('01:00:00'); // 1 hora
      expect(formatTime(3661000)).toBe('01:01:01'); // 1 hora, 1 minuto, 1 segundo
    });

    it('debe manejar números grandes correctamente', () => {
      expect(formatTime(7265000)).toBe('02:01:05'); // 2 horas, 1 minuto, 5 segundos
    });
  });

  describe('Real-time Timer Updates', () => {
    it('debe demostrar que el cálculo de tiempo es consistente', () => {
      const startTime = new Date(mockNow - 10000).toISOString(); // Hace 10 segundos

      // Simular el cálculo que hacen los componentes cada segundo
      const calculateCurrentTime = (elapsedMs: number) => {
        const serverElapsed = elapsedMs;
        const startTimeMs = new Date(startTime).getTime();
        const now = Date.now();
        return serverElapsed + (now - startTimeMs);
      };

      // Después de 5 segundos de ejecución (elapsedMs = 0 inicialmente)
      expect(calculateCurrentTime(0)).toBe(10000);

      // Después de otros 5 segundos (elapsedMs = 5000)
      expect(calculateCurrentTime(5000)).toBe(15000);
    });
  });
});