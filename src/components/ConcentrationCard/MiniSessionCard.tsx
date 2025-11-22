/**
 * Componente de card minimizada de sesión de concentración
 *
 * Esta card compacta se muestra en la esquina superior derecha cuando
 * la sesión está minimizada. Contiene información esencial y controles
 * básicos para gestionar la sesión sin ocupar toda la pantalla.
 *
 * Diseño: Compacto, con avatar, título, timer y acciones principales.
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  PlayIcon,
  PauseIcon,
  ArrowsPointingOutIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useConcentrationSession } from '../../hooks/useConcentrationSession';
import { getVisibleTime, formatTime } from '../../utils/sessionMappers';

/**
 * Card minimizada de sesión
 */
export const MiniSessionCard: React.FC = () => {
  const {
    getState,
    pauseSession,
    resumeSession,
    maximize,
  } = useConcentrationSession();

  const state = getState();
  const { activeSession } = state;

  const [currentTime, setCurrentTime] = useState(0);

  // Actualizar timer cada segundo
  useEffect(() => {
    if (!activeSession) return;

    const interval = setInterval(() => {
      const visibleTime = getVisibleTime(activeSession);
      setCurrentTime(visibleTime);
    }, 1000);

    // Actualización inicial
    setCurrentTime(getVisibleTime(activeSession));

    return () => clearInterval(interval);
  }, [activeSession]);

  if (!activeSession) return null;

  const formattedTime = formatTime(currentTime);

  /**
   * Maneja play/pause
   */
  const handlePlayPause = async () => {
    try {
      if (activeSession.isRunning) {
        await pauseSession();
      } else {
        await resumeSession();
      }
    } catch (error) {
      console.error('Error cambiando estado de sesión:', error);
    }
  };

  /**
   * Maneja maximizar
   */
  const handleMaximize = () => {
    maximize();
  };

  /**
   * Maneja cerrar (placeholder - volver al floating button)
   */
  const handleClose = () => {
    // Por ahora, solo maximizar. En una implementación completa,
    // esto debería ocultar la mini-card y mostrar solo el floating button
    console.log('Cerrar mini-card - volver a floating button');
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed top-20 right-4 z-40"
    >
      <div className="w-64 bg-[#232323]/85 backdrop-blur-sm rounded-xl shadow-lg border border-[#333]/50 p-3">
        <div className="flex items-center gap-3">
          {/* Avatar izquierdo */}
          <div className="flex-shrink-0">
            {activeSession.methodId ? (
              <div
                className="w-10 h-10 rounded-full border-2 border-white/20 flex items-center justify-center text-xs font-bold text-white"
                style={{ backgroundColor: '#6366f1' }} // Color por defecto
              >
                M
              </div>
            ) : activeSession.albumId ? (
              <div className="w-10 h-10 rounded-lg bg-gray-600 flex items-center justify-center">
                <span className="text-white text-xs">🎵</span>
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                <span className="text-white text-xs">⏱️</span>
              </div>
            )}
          </div>

          {/* Contenido central */}
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-medium text-sm truncate">
              {activeSession.title}
            </h3>
            <div className="text-gray-400 text-xs font-mono">
              {formattedTime}
            </div>
          </div>

          {/* Acciones derecha */}
          <div className="flex items-center gap-1">
            <button
              onClick={handlePlayPause}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              aria-label={activeSession.isRunning ? 'Pausar sesión' : 'Reanudar sesión'}
              aria-pressed={activeSession.isRunning}
              title={activeSession.isRunning ? 'Pausar' : 'Reanudar'}
            >
              {activeSession.isRunning ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
            </button>

            <button
              onClick={handleMaximize}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Maximizar sesión"
              title="Maximizar"
            >
              <ArrowsPointingOutIcon className="w-4 h-4" />
            </button>

            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Cerrar mini card"
              title="Cerrar"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MiniSessionCard;