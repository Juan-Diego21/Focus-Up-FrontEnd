/**
 * Hook personalizado para ejecutar métodos de estudio dentro de sesiones de concentración
 *
 * Este hook proporciona la lógica necesaria para ejecutar métodos de estudio
 * de manera integrada con las sesiones de concentración. Cuando se ejecuta
 * un método dentro de una sesión, automáticamente minimiza la UI de la sesión
 * y notifica al provider cuando el método se completa.
 *
 * Es crítico para la integración entre métodos y sesiones, permitiendo
 * que las sesiones esperen la finalización de métodos antes de permitir
 * completar la sesión.
 */

import { useState, useEffect, useCallback } from 'react';
import { useConcentrationSession } from './useConcentrationSession';

// Estados posibles del método
type MethodExecutionState = 'idle' | 'starting' | 'running' | 'completed' | 'error';

// API del hook
interface UseMethodExecutionReturn {
  startMethod: () => Promise<void>;
  pauseMethod: () => void;
  resumeMethod: () => void;
  completeMethod: () => Promise<void>;
  onMethodCompleted: (callback: () => void) => () => void;
  isRunning: boolean;
  progress: number;
  state: MethodExecutionState;
  error: string | null;
}

// Props del hook
interface UseMethodExecutionOptions {
  methodId: number;
  isInsideConcentrationSession?: boolean;
}

/**
 * Hook para ejecutar métodos de estudio con integración de sesiones
 *
 * @param options - Opciones de configuración del método
 * @returns API para controlar la ejecución del método
 */
export const useMethodExecution = (
  options: UseMethodExecutionOptions
): UseMethodExecutionReturn => {
  const { methodId: _methodId, isInsideConcentrationSession = false } = options;

  // Estado del método
  const [state, setState] = useState<MethodExecutionState>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Callbacks registrados
  const [methodCompletedCallbacks, setMethodCompletedCallbacks] = useState<Map<string, () => void>>(new Map());

  // Contexto de sesión
  const sessionContext = useConcentrationSession();

  /**
   * Inicia la ejecución del método
   */
  const startMethod = useCallback(async () => {
    try {
      setState('starting');
      setError(null);

      // Si estamos dentro de una sesión, notificar al provider
      if (isInsideConcentrationSession) {
        console.log('Iniciando método dentro de sesión de concentración');

        // Minimizar automáticamente la UI de sesión
        sessionContext.minimize();

        // Aquí iría la lógica real para iniciar el método
        // Por ahora, simulamos el inicio
        setTimeout(() => {
          setState('running');
          setProgress(0);
        }, 500);
      } else {
        // Lógica normal para métodos fuera de sesiones
        setState('running');
        setProgress(0);
      }
    } catch (err) {
      setState('error');
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    }
  }, [isInsideConcentrationSession, sessionContext]);

  /**
   * Pausa la ejecución del método
   */
  const pauseMethod = useCallback(() => {
    if (state === 'running') {
      setState('idle');
      // Aquí iría la lógica para pausar el método real
    }
  }, [state]);

  /**
   * Reanuda la ejecución del método
   */
  const resumeMethod = useCallback(() => {
    if (state === 'idle') {
      setState('running');
      // Aquí iría la lógica para reanudar el método real
    }
  }, [state]);

  /**
   * Completa la ejecución del método
   */
  const completeMethod = useCallback(async () => {
    try {
      setState('completed');
      setProgress(100);

      // Notificar a todos los callbacks registrados
      methodCompletedCallbacks.forEach(callback => {
        try {
          callback();
        } catch (err) {
          console.error('Error en callback de completación de método:', err);
        }
      });

      // Si estamos dentro de una sesión, el provider manejará el resto
      if (isInsideConcentrationSession) {
        console.log('Método completado dentro de sesión - notificando al provider');
      }
    } catch (err) {
      setState('error');
      setError(err instanceof Error ? err.message : 'Error completando método');
      throw err;
    }
  }, [methodCompletedCallbacks, isInsideConcentrationSession]);

  /**
   * Registra un callback para cuando el método se complete
   */
  const onMethodCompleted = useCallback((callback: () => void) => {
    const id = `method-callback-${Date.now()}-${Math.random()}`;
    setMethodCompletedCallbacks(prev => new Map(prev).set(id, callback));

    // Retornar función para remover el callback
    return () => {
      setMethodCompletedCallbacks(prev => {
        const newMap = new Map(prev);
        newMap.delete(id);
        return newMap;
      });
    };
  }, []);

  // Simular progreso para demostración
  useEffect(() => {
    if (state === 'running') {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            // Simular completación automática para demo
            setTimeout(() => completeMethod(), 1000);
            return prev;
          }
          return prev + 10;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [state, completeMethod]);

  return {
    startMethod,
    pauseMethod,
    resumeMethod,
    completeMethod,
    onMethodCompleted,
    isRunning: state === 'running',
    progress,
    state,
    error,
  };
};

export default useMethodExecution;