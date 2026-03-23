/**
 * Modal para continuar una sesiÃ³n de concentraciÃ³n anterior
 *
 * Este modal aparece cuando se detecta una sesiÃ³n persistida al cargar la app.
 * Permite al usuario elegir entre continuar la sesiÃ³n anterior o descartarla.
 *
 * Es crÃ­tico para la experiencia de usuario, permitiendo recuperar sesiones
 * despuÃ©s de cerrar el navegador o recargar la pÃ¡gina.
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayIcon, XMarkIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useConcentrationSession } from '@shared/hooks/useConcentrationSession';
import { getVisibleTime, formatTime } from '@shared/utils/sessionMappers';
import { useMusicPlayer } from '@shared/contexts/MusicPlayerContext';
import { getSongsByAlbumId } from '@shared/services/musicApi';
import { replaceIfSessionAlbum } from '@shared/services/audioService';

/**
 * Modal para continuar sesiÃ³n anterior
 */
export const ContinueSessionModal: React.FC = () => {
  const { getState, minimize, hideContinueModal, finishLater } = useConcentrationSession();
  const { playPlaylist, currentAlbum, isPlaying } = useMusicPlayer();
  const state = getState();

  const { activeSession } = state;

  if (!activeSession) return null;

  // Calcular tiempo visible
  const visibleTime = getVisibleTime(activeSession);
  const formattedTime = formatTime(visibleTime);

  /**
   * ContinÃºa la sesiÃ³n anterior
   */
  const handleContinue = async () => {
    try {
      console.log('Continuando sesiÃ³n anterior');

      // Verificar que la sesiÃ³n tenga un ID vÃ¡lido antes de continuar
      if (!activeSession?.sessionId) {
        console.error('SesiÃ³n sin ID vÃ¡lido, no se puede continuar');
        // Mostrar error al usuario y descartar la sesiÃ³n
        alert('La sesiÃ³n guardada no es vÃ¡lida. Se descartarÃ¡ automÃ¡ticamente.');
        await handleDiscard();
        return;
      }

      // Ocultar el modal de continuar
      hideContinueModal();

      // Minimizar inicialmente para no interrumpir el flujo del usuario
      minimize();

      // Restaurar reproducciÃ³n de mÃºsica si hay un Ã¡lbum seleccionado
      if (activeSession.albumId) {
        try {
          console.log('Restaurando mÃºsica del Ã¡lbum seleccionado:', activeSession.albumId);

          // Cargar canciones del Ã¡lbum especÃ­fico desde la API
          const albumSongs = await getSongsByAlbumId(activeSession.albumId);

          if (albumSongs.length === 0) {
            console.warn(`El Ã¡lbum ${activeSession.albumId} no tiene canciones disponibles`);
            return;
          }

          // Usar funciÃ³n pura para iniciar reproducciÃ³n del Ã¡lbum
          await replaceIfSessionAlbum(
            {
              playPlaylist,
              currentAlbum: currentAlbum, // Ãlbum actualmente reproduciendo
              isPlaying: isPlaying,       // Estado de reproducciÃ³n actual
              togglePlayPause: () => {}, // No usado en este contexto
            },
            activeSession.albumId,
            albumSongs, // Ahora pasamos directamente las canciones del Ã¡lbum
            {
              id_album: activeSession.albumId,
              nombre_album: `Ãlbum ${activeSession.albumId}` // Nombre genÃ©rico ya que no tenemos el nombre exacto
            }
          );

          console.log(`MÃºsica del Ã¡lbum ${activeSession.albumId} restaurada correctamente`);
        } catch (musicError) {
          // Se registra el error pero no se interrumpe la sesiÃ³n
          console.error('Error restaurando mÃºsica del Ã¡lbum:', musicError);
        }
      } else {
        console.log('SesiÃ³n continuada sin Ã¡lbum - manteniendo reproducciÃ³n actual si existe');
      }
    } catch (error) {
      console.error('Error continuando sesiÃ³n:', error);
      // En caso de error, intentar descartar la sesiÃ³n
      try {
        await handleDiscard();
      } catch (discardError) {
        console.error('Error descartando sesiÃ³n tras fallo en continuar:', discardError);
      }
    }
  };

  /**
   * Descarta la sesiÃ³n anterior
   */
  const handleDiscard = async () => {
    try {
      console.log('Descartando sesiÃ³n anterior');

      // Ocultar el modal primero para feedback inmediato al usuario
      hideContinueModal();

      // Limpiar localStorage inmediatamente para evitar que el modal reaparezca
      // Se hace antes de la llamada API por si esta falla
      localStorage.removeItem('focusup:activeSession');
      localStorage.removeItem('focusup:directResume');

      // Usar finishLater para marcar la sesiÃ³n como terminada mÃ¡s tarde en el servidor
      // Esto es opcional y no deberÃ­a impedir que el usuario continÃºe
      try {
        await finishLater();
      } catch (finishError) {
        console.warn('Error marcando sesiÃ³n como terminada en servidor, pero estado local limpiado:', finishError);
        // No relanzar el error, el estado local ya estÃ¡ limpio
      }
    } catch (error) {
      console.error('Error descartando sesiÃ³n:', error);
      // Fallback: recargar la pÃ¡gina si hay error crÃ­tico
      window.location.reload();
    }
  };

  /**
   * Maneja el clic en el fondo del modal para descartar la sesiÃ³n
   */
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      // Solo descartar si se hace clic directamente en el fondo
      handleDiscard();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleBackdropClick}
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
              SesiÃ³n pendiente
            </h2>
            <p className="text-gray-300 text-sm">
              Tienes una sesiÃ³n de concentraciÃ³n sin terminar
            </p>
          </div>

          {/* Detalles de la sesiÃ³n */}
          <div className="bg-[#1a1a1a]/50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">SesiÃ³n:</span>
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
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-blue-500/25 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#232323] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <PlayIcon className="w-5 h-5" />
              Continuar
            </button>

            <button
              onClick={handleDiscard}
              className="px-4 py-3 bg-transparent border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <XMarkIcon className="w-5 h-5" />
              Descartar
            </button>
          </div>

          {/* Nota informativa */}
          <p className="text-gray-400 text-xs text-center mt-4">
            Las sesiones se guardan automÃ¡ticamente para continuarlas mÃ¡s tarde
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ContinueSessionModal;



