// Componente de tarjeta de concentración centrada
// Muestra la sesión activa con timer, controles de pausa/reanudar,
// y opciones para terminar más tarde o completar la sesión.
// Se minimiza automáticamente cuando se ejecuta un método de estudio.
//
// Diseño: Overlay centrado con glassmorphism, controles intuitivos y accesibilidad completa.
import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';
import {
  PlayIcon,
  PauseIcon,
  ClockIcon,
  XMarkIcon,
  MusicalNoteIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';
import { useConcentrationSession } from '../../../providers/ConcentrationSessionProvider';
import { formatTime } from '../../../shared/utils/sessionMappers';

interface ConcentrationCardProps {
  /** Indica si la tarjeta está visible (no minimizada) */
  isVisible: boolean;
  /** Callback cuando se solicita minimizar */
  onMinimize?: () => void;
}

/**
 * Componente ConcentrationCard
 *
 * Gestiona la visualización y controles de la sesión de concentración activa.
 */
export const ConcentrationCard: React.FC<ConcentrationCardProps> = ({
  isVisible,
  onMinimize
}) => {
  const navigate = useNavigate();
  const { getState, pauseSession, resumeSession, finishLater, completeSession } = useConcentrationSession();
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const session = getState().activeSession;

  // Update timer every second when session is running
  useEffect(() => {
    if (!session || !session.isRunning) {
      setCurrentTime(session?.elapsedMs || 0);
      return;
    }

    const interval = setInterval(() => {
      const serverElapsed = session.elapsedMs || 0;
      const startTime = new Date(session.startTime).getTime();
      const now = Date.now();
      setCurrentTime(serverElapsed + (now - startTime));
    }, 1000);

    return () => clearInterval(interval);
  }, [session]);

  /**
   * Calcula el tiempo transcurrido visible
   */
  const getVisibleTime = useCallback(() => {
    if (!session) return 0;
    return currentTime;
  }, [session, currentTime]);

  /**
   * Maneja pausa/reanudar de la sesión
   */
  const handleTogglePause = async () => {
    if (!session || isUpdating) return;

    try {
      setIsUpdating(true);
      if (session.isRunning) {
        await pauseSession();
      } else {
        await resumeSession();
      }
    } catch (error) {
      console.error('Error toggling pause:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Maneja terminar más tarde con alerta y redirección automática
   */
  const handleFinishLater = async () => {
    if (!session || isUpdating) return;

    try {
      setIsUpdating(true);
      await finishLater();

      // Mostrar alerta de sesión aplazada y redirigir después de 3 segundos
      Swal.fire({
        title: 'Sesión aplazada',
        text: 'Serás redirigido a Reportes en 3 segundos.',
        icon: 'info',
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
        background: '#232323',
        color: '#ffffff',
        iconColor: '#3B82F6',
      }).then(() => {
        // Redirigir a reportes después de que se cierre la alerta
        navigate('/reports/sessions');
      });

    } catch (error) {
      console.error('Error finishing later:', error);
      setIsUpdating(false);
    }
  };

  /**
   * Maneja completar sesión con alerta y redirección automática
   */
  const handleComplete = async () => {
    if (!session || isUpdating) return;

    try {
      setIsUpdating(true);
      await completeSession();

      // Mostrar alerta de sesión completada y redirigir después de 3 segundos
      Swal.fire({
        title: 'Sesión completada',
        text: 'Serás redirigido a Reportes en 3 segundos.',
        icon: 'success',
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
        background: '#232323',
        color: '#ffffff',
        iconColor: '#10B981',
      }).then(() => {
        // Redirigir a reportes después de que se cierre la alerta
        navigate('/reports');
      });

    } catch (error) {
      console.error('Error completing session:', error);
      setIsUpdating(false);
    }
  };

  /**
   * Maneja minimizar la tarjeta
   */
  const handleMinimize = () => {
    onMinimize?.();
  };

  if (!session) return null;

  const visibleTime = getVisibleTime();
  const formattedTime = formatTime(visibleTime);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="session-title"
          aria-describedby="session-description"
        >
          <motion.div
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            className="w-full max-w-md bg-[#232323]/95 backdrop-blur-md rounded-2xl shadow-2xl border border-[#333]/50 overflow-hidden"
          >
            {/* Header con título y botón minimizar */}
            <div className="p-6 border-b border-[#333]/50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h1
                    id="session-title"
                    className="text-xl font-bold text-white mb-1"
                  >
                    {session.title}
                  </h1>
                  {session.description && (
                    <p
                      id="session-description"
                      className="text-sm text-gray-400"
                    >
                      {session.description}
                    </p>
                  )}
                </div>

                <button
                  onClick={handleMinimize}
                  className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10 cursor-pointer"
                  aria-label="Minimizar sesión"
                  type="button"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Información del método/álbum si existen */}
              <div className="flex items-center gap-4 mt-4">
                {session.methodId && (
                  <div className="flex items-center gap-2 text-sm text-blue-400">
                    <BookOpenIcon className="w-4 h-4" />
                    <span>Método activo</span>
                  </div>
                )}
                {session.albumId && (
                  <div className="flex items-center gap-2 text-sm text-purple-400">
                    <MusicalNoteIcon className="w-4 h-4" />
                    <span>Música activa</span>
                  </div>
                )}
              </div>
            </div>

            {/* Timer principal */}
            <div className="p-8 text-center">
              <div className="mb-6">
                <div
                  className="text-6xl font-mono font-bold text-white mb-2 select-none"
                  aria-live="polite"
                  aria-atomic="true"
                  role="timer"
                  aria-label={`Tiempo transcurrido: ${formattedTime}`}
                >
                  {formattedTime}
                </div>
                <p className="text-gray-400 text-sm">
                  {session.isRunning ? 'Sesión activa' : 'Sesión pausada'}
                </p>
              </div>

              {/* Controles principales */}
              <div className="flex items-center justify-center gap-4 mb-6">
                <button
                  onClick={handleTogglePause}
                  disabled={isUpdating}
                  className={`p-4 rounded-full transition-all duration-200 cursor-pointer ${
                    session.isRunning
                      ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  } disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-white/50`}
                  aria-label={session.isRunning ? 'Pausar sesión' : 'Reanudar sesión'}
                  type="button"
                >
                  {session.isRunning ? (
                    <PauseIcon className="w-6 h-6" />
                  ) : (
                    <PlayIcon className="w-6 h-6" />
                  )}
                </button>
              </div>

              {/* Estado de pausa */}
              <AnimatePresence>
                {!session.isRunning && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6 p-3 bg-yellow-600/20 border border-yellow-600/30 rounded-lg"
                  >
                    <div className="flex items-center gap-2 text-yellow-400 text-sm">
                      <ClockIcon className="w-4 h-4" />
                      <span>Sesión pausada - El tiempo se mantiene</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Botones de acción */}
              <div className="flex gap-3">
                <button
                  onClick={handleFinishLater}
                  disabled={isUpdating}
                  className="flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-500 cursor-pointer"
                  type="button"
                >
                  Terminar más tarde
                </button>

                <button
                  onClick={handleComplete}
                  disabled={isUpdating}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  type="button"
                >
                  {isUpdating ? 'Finalizando...' : 'Finalizar sesión'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConcentrationCard;