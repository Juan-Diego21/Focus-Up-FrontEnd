/**
 * Modal para continuar una sesión de concentración anterior
 *
 * Este modal aparece cuando se detecta una sesión persistida al cargar la app.
 * Permite al usuario elegir entre continuar la sesión anterior o descartarla.
 *
 * Es crítico para la experiencia de usuario, permitiendo recuperar sesiones
 * después de cerrar el navegador o recargar la página.
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayIcon, XMarkIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useConcentrationSession } from '../../hooks/useConcentrationSession';
import { getVisibleTime, formatTime } from '../../utils/sessionMappers';

/**
 * Modal para continuar sesión anterior
 */
export const ContinueSessionModal: React.FC = () => {
  const { getState, minimize } = useConcentrationSession();
  const state = getState();

  const { activeSession } = state;

  if (!activeSession) return null;

  // Calcular tiempo visible
  const visibleTime = getVisibleTime(activeSession);
  const formattedTime = formatTime(visibleTime);

  /**
   * Continúa la sesión anterior
   */
  const handleContinue = async () => {
    try {
      // La sesión ya está cargada, solo ocultar el modal
      // El provider ya tiene la sesión activa
      console.log('Continuando sesión anterior');

      // Minimizar inicialmente para no interrumpir
      minimize();
    } catch (error) {
      console.error('Error continuando sesión:', error);
    }
  };

  /**
   * Descarta la sesión anterior
   */
  const handleDiscard = () => {
    try {
      // Aquí iría la lógica para descartar la sesión
      // Por ahora, simplemente limpiar el estado local
      console.log('Descartando sesión anterior');

      // El provider debería manejar esto limpiando el estado
      window.location.reload(); // Recargar para limpiar estado
    } catch (error) {
      console.error('Error descartando sesión:', error);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="bg-[#232323]/95 backdrop-blur-md rounded-xl shadow-2xl border border-[#333]/50 p-6 max-w-md w-full mx-4"
        >
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <ClockIcon className="w-8 h-8 text-blue-400" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">
              Sesión pendiente
            </h2>
            <p className="text-gray-300 text-sm">
              Tienes una sesión de concentración sin terminar
            </p>
          </div>

          {/* Detalles de la sesión */}
          <div className="bg-[#1a1a1a]/50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Sesión:</span>
              <span className="text-white font-medium">{activeSession.title}</span>
            </div>

            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Tiempo acumulado:</span>
              <span className="text-white font-mono font-medium">{formattedTime}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Estado:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                activeSession.status === 'active'
                  ? 'bg-green-600 text-white'
                  : 'bg-yellow-600 text-white'
              }`}>
                {activeSession.status === 'active' ? 'Activa' : 'Pausada'}
              </span>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex gap-3">
            <button
              onClick={handleContinue}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-blue-500/25 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#232323] transition-all duration-200 flex items-center justify-center gap-2"
            >
              <PlayIcon className="w-5 h-5" />
              Continuar
            </button>

            <button
              onClick={handleDiscard}
              className="px-4 py-3 bg-transparent border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
            >
              <XMarkIcon className="w-5 h-5" />
              Descartar
            </button>
          </div>

          {/* Nota informativa */}
          <p className="text-gray-400 text-xs text-center mt-4">
            Las sesiones se guardan automáticamente para continuarlas más tarde
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ContinueSessionModal;