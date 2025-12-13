/**
 * Utilidades para detectar suspensión/hibernación del sistema
 *
 * Este módulo implementa un detector de sueño del sistema operativo
 * que corrige automáticamente el temporizador de sesiones cuando el
 * computador se suspende. Es crítico para mantener la precisión del
 * timer en sesiones de concentración que pueden durar horas.
 *
 * El detector usa requestAnimationFrame para verificar continuamente
 * si ha habido saltos temporales que indiquen suspensión del sistema.
 */

import type { ActiveSession } from '../types/api';

// Callbacks registrados para corrección de timer
type SleepCallback = (sleptMs: number) => void;

// Estado del detector
interface SleepDetectorState {
  lastTimestamp: number;
  isRunning: boolean;
  callbacks: Map<string, SleepCallback>;
  animationFrameId: number | null;
}

/**
 * Clase principal para detectar suspensión del sistema
 */
class SleepDetector {
  private state: SleepDetectorState = {
    lastTimestamp: Date.now(),
    isRunning: false,
    callbacks: new Map(),
    animationFrameId: null,
  };

  /**
   * Inicia la detección de suspensión
   */
  start(): void {
    if (this.state.isRunning) {
      return;
    }

    this.state.isRunning = true;
    this.state.lastTimestamp = Date.now();
    this.checkForSleep();
  }

  /**
   * Detiene la detección de suspensión
   */
  stop(): void {
    this.state.isRunning = false;
    if (this.state.animationFrameId) {
      cancelAnimationFrame(this.state.animationFrameId);
      this.state.animationFrameId = null;
    }
  }

  /**
   * Función recursiva que verifica suspensión usando requestAnimationFrame
   */
  private checkForSleep = (): void => {
    if (!this.state.isRunning) {
      return;
    }

    const now = Date.now();
    const delta = now - this.state.lastTimestamp;

    // Si el delta es mayor a 1 segundo, probablemente el sistema se suspendió
    // Se eliminó console.log para mantener código limpio en producción
    if (delta > 1000) {
      // Notificar a todos los callbacks registrados
      this.state.callbacks.forEach((callback) => {
        try {
          callback(delta);
        } catch (error) {
          // Se eliminó console.error para mantener código limpio en producción
          // El error se maneja silenciosamente para evitar interrupciones
        }
      });
    }

    // Actualizar timestamp para la próxima verificación
    this.state.lastTimestamp = now;

    // Continuar el loop
    this.state.animationFrameId = requestAnimationFrame(this.checkForSleep);
  };

  /**
   * Registra un callback para corrección de timer
   *
   * @param id - Identificador único del callback
   * @param callback - Función a ejecutar cuando se detecta suspensión
   */
  addCallback(id: string, callback: SleepCallback): void {
    this.state.callbacks.set(id, callback);
  }

  /**
   * Remueve un callback
   *
   * @param id - Identificador del callback a remover
   */
  removeCallback(id: string): void {
    this.state.callbacks.delete(id);
  }

  /**
   * Verifica si el detector está ejecutándose
   */
  isRunning(): boolean {
    return this.state.isRunning;
  }

  /**
   * Obtiene el último timestamp registrado
   */
  getLastTimestamp(): number {
    return this.state.lastTimestamp;
  }
}

// Instancia singleton
let sleepDetectorInstance: SleepDetector | null = null;

/**
 * Obtiene la instancia singleton del detector de suspensión
 */
export function getSleepDetector(): SleepDetector {
  if (!sleepDetectorInstance) {
    sleepDetectorInstance = new SleepDetector();
  }
  return sleepDetectorInstance;
}

/**
 * Hook personalizado para usar el detector de suspensión en componentes
 */
export function useSleepDetector() {
  return getSleepDetector();
}

/**
 * Utilidad para corregir el timer de una sesión después de suspensión
 *
 * @param session - Sesión a corregir
 * @param sleptMs - Milisegundos que el sistema estuvo suspendido
 * @returns Sesión corregida
 */
export function correctSessionAfterSleep(session: ActiveSession, _sleptMs: number): ActiveSession {
  // Si la sesión está corriendo, el timer ya se está actualizando correctamente
  // No necesitamos corrección adicional aquí porque getVisibleTime() usa Date.now()
  // La corrección real ocurre en el cálculo del tiempo visible
  // Se eliminó console.log para mantener código limpio en producción

  return {
    ...session,
    // El elapsedMs permanece igual, la corrección ocurre en getVisibleTime()
  };
}

/**
 * Función de utilidad para calcular tiempo visible con corrección de suspensión
 *
 * Esta es la fórmula principal que debe usarse para mostrar el timer:
 * visible = elapsedMs + (Date.now() - startTime)
 *
 * @param session - Sesión activa
 * @returns Tiempo visible en milisegundos
 */
export function getCorrectedVisibleTime(session: ActiveSession): number {
  if (session.isRunning) {
    const startTimeMs = new Date(session.startTime).getTime();
    const now = Date.now();
    return session.elapsedMs + (now - startTimeMs);
  } else {
    return session.elapsedMs;
  }
}