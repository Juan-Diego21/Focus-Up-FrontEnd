/**
 * Componente principal de la card de sesión de concentración
 *
 * Esta card se muestra en pantalla completa cuando la sesión está activa
 * y no minimizada. Contiene todos los controles para gestionar la sesión,
 * el timer principal, y la información del método/álbum asociados.
 *
 * Diseño: Glassmorphism con gradiente oscuro, controles prominentes,
 * timer grande y legible, estados visuales claros.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlayIcon,
  PauseIcon,
  ClockIcon,
  CheckIcon,
  ChevronDownIcon,
  MinusIcon,
  EllipsisVerticalIcon,
} from '@heroicons/react/24/outline';
import { useConcentrationSession } from '../../hooks/useConcentrationSession';
import { getVisibleTime, formatTime } from '../../utils/sessionMappers';

/**
 * Card principal de sesión de concentración
 */
export const ConcentrationCard: React.FC = () => {
  const {
    getState,
    pauseSession,
    resumeSession,
    finishLater,
    completeSession,
    minimize,
  } = useConcentrationSession();

  const state = getState();
  const { activeSession, isSyncing } = state;

  // Estado local
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState('');
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  // Actualizar título cuando cambia la sesión
  useEffect(() => {
    if (activeSession) {
      setTitle(activeSession.title);
    }
  }, [activeSession]);

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
  const canComplete = !activeSession.methodId || activeSession.status === 'completed';

  /**
   * Guarda el título editado
   */
  const handleTitleSave = () => {
    // Aquí iría la lógica para guardar el título
    // Por ahora, solo local
    setIsEditingTitle(false);
  };

  /**
   * Maneja pausa/reanudar
   */
  const handlePauseResume = async () => {
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
   * Maneja terminar más tarde
   */
  const handleFinishLater = async () => {
    try {
      await finishLater();
    } catch (error) {
      console.error('Error terminando más tarde:', error);
    }
  };

  /**
   * Maneja completar sesión
   */
  const handleComplete = async () => {
    try {
      await completeSession();
    } catch (error) {
      console.error('Error completando sesión:', error);
    }
  };

  /**
   * Maneja minimizar
   */
  const handleMinimize = () => {
    minimize();
  };

  /**
   * Maneja acción extra (placeholder)
   */
  const handleExtraAction = () => {
    // Placeholder para acciones adicionales
    console.log('Acción extra');
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.18, ease: [0.22, 0.9, 0.32, 1] }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="w-full max-w-3xl mx-auto"
      >
        <div className="bg-[#232323]/70 backdrop-blur-md rounded-xl shadow-2xl border border-[#333]/50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[#333]/50">
            {/* Izquierda: Método/Álbum */}
            <div className="flex items-center gap-3">
              {activeSession.methodId && (
                <>
                  <div
                    className="w-8 h-8 rounded-full border-2 border-white/20 flex items-center justify-center text-xs font-bold text-white"
                    style={{ backgroundColor: '#6366f1' }} // Color por defecto
                  >
                    M
                  </div>
                  <span className="text-white font-medium">Método</span>
                </>
              )}
              {activeSession.albumId && !activeSession.methodId && (
                <>
                  <div className="w-8 h-8 rounded-lg bg-gray-600 flex items-center justify-center">
                    <span className="text-white text-xs">🎵</span>
                  </div>
                  <span className="text-white font-medium">Álbum</span>
                </>
              )}
            </div>

            {/* Centro: Título editable */}
            <div className="flex-1 max-w-md mx-4">
              {isEditingTitle ? (
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={handleTitleSave}
                  onKeyDown={(e) => e.key === 'Enter' && handleTitleSave()}
                  className="w-full bg-transparent text-white text-xl font-semibold text-center focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
                  autoFocus
                />
              ) : (
                <h1
                  className="text-white text-xl font-semibold text-center cursor-pointer hover:bg-white/10 rounded px-2 py-1 transition-colors"
                  onClick={() => setIsEditingTitle(true)}
                  title="Click para editar título"
                >
                  {title}
                </h1>
              )}
            </div>

            {/* Derecha: Botones de acción */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleMinimize}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Minimizar sesión"
                title="Minimizar"
              >
                <MinusIcon className="w-5 h-5" />
              </button>

              <button
                onClick={handleExtraAction}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Acciones adicionales"
                title="Más opciones"
              >
                <EllipsisVerticalIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Descripción collapsible */}
          {activeSession.description && (
            <div className="px-6 py-4 border-b border-[#333]/50">
              <button
                onClick={() => setDescriptionExpanded(!descriptionExpanded)}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors w-full text-left"
              >
                <ChevronDownIcon className={`w-4 h-4 transition-transform ${descriptionExpanded ? 'rotate-180' : ''}`} />
                <span className="text-sm">Descripción</span>
              </button>

              <AnimatePresence>
                {descriptionExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="mt-2 text-gray-300 text-sm leading-relaxed"
                  >
                    {activeSession.description}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Cuerpo principal */}
          <div className="px-6 py-8 text-center">
            {/* Indicador de syncing */}
            {isSyncing && (
              <div className="mb-4 text-blue-400 text-sm font-medium">
                Sincronizando...
              </div>
            )}

            {/* Timer principal */}
            <div className="mb-4">
              <div
                className="text-4xl md:text-6xl font-mono font-bold text-white mb-2"
                aria-live="polite"
                aria-label={`Tiempo transcurrido: ${formattedTime}`}
              >
                {formattedTime}
              </div>
              <div className="text-sm text-gray-400">
                Tiempo total
              </div>
            </div>

            {/* Controles */}
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              <button
                onClick={handlePauseResume}
                disabled={isSyncing}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg hover:shadow-blue-500/25 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#232323] transition-all duration-200 flex items-center gap-2"
                aria-pressed={activeSession.isRunning}
                aria-label={activeSession.isRunning ? 'Pausar sesión' : 'Reanudar sesión'}
              >
                {activeSession.isRunning ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
                {activeSession.isRunning ? 'Pausar' : 'Reanudar'}
              </button>

              <button
                onClick={handleFinishLater}
                disabled={isSyncing}
                className="px-6 py-3 bg-transparent border border-gray-600 hover:border-gray-500 disabled:border-gray-700 disabled:cursor-not-allowed text-gray-300 hover:text-white disabled:text-gray-500 font-semibold rounded-xl transition-all duration-200 flex items-center gap-2"
                aria-label="Terminar más tarde"
              >
                <ClockIcon className="w-5 h-5" />
                Terminar más tarde
              </button>

              <button
                onClick={handleComplete}
                disabled={!canComplete || isSyncing}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg hover:shadow-green-500/25 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-[#232323] transition-all duration-200 flex items-center gap-2"
                aria-disabled={!canComplete}
                aria-label="Terminar sesión"
              >
                <CheckIcon className="w-5 h-5" />
                Terminar sesión
              </button>
            </div>

            {/* Enlaces contextuales */}
            <div className="flex justify-center gap-4 text-sm">
              {activeSession.methodId && (
                <button className="text-blue-400 hover:text-blue-300 transition-colors">
                  Abrir método
                </button>
              )}
              {activeSession.albumId && (
                <button className="text-purple-400 hover:text-purple-300 transition-colors">
                  Ver álbum
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ConcentrationCard;