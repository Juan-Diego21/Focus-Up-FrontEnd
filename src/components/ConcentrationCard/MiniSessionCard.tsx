/**
 * Componente de tarjeta de sesión minimizada
 *
 * Muestra una versión compacta de la sesión activa en la esquina superior derecha,
 * posicionada visualmente debajo del botón flotante "Sesión de concentración".
 * Expande hacia abajo para mantener consistencia visual con el flujo de la UI.
 * Permite acceso rápido a controles básicos y restaurar la vista completa.
 * Se oculta automáticamente cuando no hay sesión activa.
 *
 * Diseño: Posicionamiento fijo top-right, glassmorphism, animaciones suaves hacia abajo.
 */
import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';
import {
  PlayIcon,
  PauseIcon,
  ClockIcon,
  ChevronDownIcon,
  XMarkIcon,
  MusicalNoteIcon,
  BookOpenIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { useConcentrationSession } from '../../providers/ConcentrationSessionProvider';
import { formatTime } from '../../utils/sessionMappers';

export const MiniSessionCard: React.FC = () => {
  const navigate = useNavigate();
  const { getState, pauseSession, resumeSession, finishLater, completeSession, maximize } = useConcentrationSession();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
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
        text: 'Tu sesión de concentración ha sido guardada para continuar más tarde.',
        icon: 'info',
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
        background: '#232323',
        color: '#ffffff',
        iconColor: '#3B82F6',
      }).then(() => {
        // Redirigir a reportes después de que se cierre la alerta
        navigate('/reports/');
      });

    } catch (error) {
      console.error('Error finishing later:', error);
      setIsUpdating(false);
    }
  };

  /**
   * Maneja completar sesión inmediatamente
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
   * Maneja maximizar la tarjeta
   */
  const handleMaximize = () => {
    maximize();
  };

  /**
   * Alterna el estado expandido de la tarjeta
   */
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  if (!session) return null;

  const visibleTime = getVisibleTime();
  const formattedTime = formatTime(visibleTime);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="fixed top-16 right-4 z-20"
      >
        <motion.div
          animate={{ width: isExpanded ? 320 : 280 }}
          transition={{ duration: 0.2 }}
          className="bg-[#232323]/95 backdrop-blur-md rounded-xl shadow-2xl border border-[#333]/50 overflow-hidden"
        >
          {/* Header compacto */}
          <div className="p-4 border-b border-[#333]/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* Indicador de estado */}
                <div className={`w-3 h-3 rounded-full ${
                  session.isRunning ? 'bg-green-500' : 'bg-yellow-500'
                }`} />

                {/* Título truncado */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-white truncate">
                    {session.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <ClockIcon className="w-3 h-3" />
                    <span>{formattedTime}</span>
                  </div>
                </div>
              </div>

              {/* Controles de header */}
              <div className="flex items-center gap-1">
                <button
                  onClick={handleFinishLater}
                  disabled={isUpdating}
                  className="p-1 text-gray-400 hover:text-red-400 transition-colors rounded hover:bg-red-500/20 disabled:opacity-50 cursor-pointer"
                  aria-label="Terminar más tarde"
                  title="Terminar más tarde"
                  type="button"
                >
                  <ClockIcon className="w-4 h-4" />
                </button>

                <button
                  onClick={toggleExpanded}
                  className="p-1 text-gray-400 hover:text-white transition-colors rounded hover:bg-white/10 cursor-pointer"
                  aria-label={isExpanded ? 'Contraer tarjeta' : 'Expandir tarjeta'}
                  type="button"
                >
                  <ChevronDownIcon className={`w-4 h-4 transition-transform ${
                    isExpanded ? 'rotate-180' : ''
                  }`} />
                </button>

                <button
                  onClick={handleMaximize}
                  className="p-1 text-gray-400 hover:text-white transition-colors rounded hover:bg-white/10 cursor-pointer"
                  aria-label="Maximizar sesión"
                  type="button"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Contenido expandible hacia abajo */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0, y: -10 }}
                animate={{ height: 'auto', opacity: 1, y: 0 }}
                exit={{ height: 0, opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="border-t border-[#333]/50"
              >
                {/* Información adicional */}
                <div className="p-4 space-y-3">
                  {/* Estado de la sesión */}
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-400">Estado:</span>
                    <span className={`font-medium ${
                      session.isRunning ? 'text-green-400' : 'text-yellow-400'
                    }`}>
                      {session.isRunning ? 'Activa' : 'Pausada'}
                    </span>
                  </div>

                  {/* Método y álbum activos */}
                  <div className="space-y-2">
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

                  {/* Controles */}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleTogglePause}
                      disabled={isUpdating}
                      className={`flex-1 max-w-[190px] mr-2 px-3 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${
                        session.isRunning
                          ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                      type="button"
                    >
                      <div className="flex items-center gap-1">
                        {session.isRunning ? (
                          <>
                            <PauseIcon className="w-4 h-4" />
                            <span>Pausar</span>
                          </>
                        ) : (
                          <>
                            <PlayIcon className="w-4 h-4" />
                            <span>Reanudar</span>
                          </>
                        )}
                      </div>
                    </button>

                    <button
                      onClick={handleComplete}
                      disabled={isUpdating}
                      className="flex-0 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      type="button"
                    >
                      <div className="flex items-center justify-end gap-2">
                        <CheckIcon className="w-4 h-4" />
                        <span>Finalizar</span>
                      </div>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MiniSessionCard;