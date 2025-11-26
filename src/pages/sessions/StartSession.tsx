/**
 * Página para iniciar sesiones de concentración
 *
 * Esta página permite crear nuevas sesiones de concentración con opciones
 * para título, descripción, método de estudio y álbum de música. También
 * maneja deep links desde correos electrónicos para sesiones programadas.
 *
 * Diseño: Layout de dos columnas responsive, formulario con glassmorphism.
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PlayIcon, ChevronDownIcon, XMarkIcon, BookOpenIcon, MusicalNoteIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';
import { useConcentrationSession } from '../../providers/ConcentrationSessionProvider';
import { sessionService } from '../../services/sessionService';
import { mapServerSession } from '../../utils/sessionMappers';
import { useMusicPlayer } from '../../contexts/MusicPlayerContext';
import { replaceIfSessionAlbum } from '../../services/audioService';
import { getMethodType } from '../../utils/methodStatus';
import { getSongsByAlbumId } from '../../utils/musicApi';
import { MethodSelectionModal } from '../../components/MethodSelectionModal';
import { AlbumSelectionModal } from '../../components/AlbumSelectionModal';
import { CountdownOverlay } from '../../components/ui/CountdownOverlay';
import { BackButton } from '../../components/ui/BackButton';
import { PageLayout } from '../../components/ui/PageLayout';
import { Sidebar } from '../../components/ui/Sidebar';
import type { SessionCreateDto, SessionDto, Song } from '../../types/api';

/**
 * Página de inicio de sesión
 */
export const StartSession: React.FC = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();
  const { startSession, startSessionWithCountdown, getState, minimize } = useConcentrationSession();
  const { playPlaylist, currentAlbum, isPlaying } = useMusicPlayer();

  // Estado del formulario
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<any>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLate, setIsLate] = useState(false);
  const [minutesLate, setMinutesLate] = useState(0);

  // Estado de los modales de selección
  const [isMethodModalOpen, setIsMethodModalOpen] = useState(false);
  const [isAlbumModalOpen, setIsAlbumModalOpen] = useState(false);


  // Cargar datos para deep link
  useEffect(() => {
    if (sessionId) {
      loadSessionForDeepLink(sessionId);
    }
  }, [sessionId]);

  // Cargar selecciones desde localStorage al montar
  useEffect(() => {
    const savedMethod = localStorage.getItem('start-session-selected-method');
    const savedAlbum = localStorage.getItem('start-session-selected-album');

    if (savedMethod) {
      try {
        setSelectedMethod(JSON.parse(savedMethod));
      } catch (error) {
        console.error('Error cargando método seleccionado:', error);
      }
    }

    if (savedAlbum) {
      try {
        setSelectedAlbum(JSON.parse(savedAlbum));
      } catch (error) {
        console.error('Error cargando álbum seleccionado:', error);
      }
    }
  }, []);

  // Guardar selecciones en localStorage cuando cambien
  useEffect(() => {
    if (selectedMethod) {
      localStorage.setItem('start-session-selected-method', JSON.stringify(selectedMethod));
    } else {
      localStorage.removeItem('start-session-selected-method');
    }
  }, [selectedMethod]);

  useEffect(() => {
    if (selectedAlbum) {
      localStorage.setItem('start-session-selected-album', JSON.stringify(selectedAlbum));
    } else {
      localStorage.removeItem('start-session-selected-album');
    }
  }, [selectedAlbum]);

  /**
   * Carga sesión para deep link
   */
  const loadSessionForDeepLink = async (id: string) => {
    try {
      setIsLoading(true);
      const sessionDto: SessionDto = await sessionService.getSession(id);
      const session = mapServerSession(sessionDto);

      // Prefill formulario
      setTitle(session.title);
      if (session.description) {
        setDescription(session.description);
        setDescriptionExpanded(true);
      }

      // Calcular si es tarde
      if (session.eventId) {
        // Aquí iría la lógica para calcular si la sesión programada está atrasada
        // Por ahora, simulamos
        const now = new Date();
        const eventTime = new Date(session.startTime);
        const diffMinutes = Math.floor((now.getTime() - eventTime.getTime()) / (1000 * 60));

        if (diffMinutes > 10) {
          setIsLate(true);
          setMinutesLate(diffMinutes);
        }
      }
    } catch (error) {
      console.error('Error cargando sesión para deep link:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Maneja envío del formulario e inicia sesión con cuenta regresiva
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setTitle('Sesión de concentración #' + Date.now());
    }

    try {
      setIsLoading(true);

      const payload: SessionCreateDto = {
        title: title.trim() || 'Sesión de concentración',
        description: description.trim() || undefined,
        type: sessionId ? 'scheduled' : 'rapid',
        eventId: sessionId ? parseInt(sessionId) : undefined,
        methodId: selectedMethod?.id_metodo,
        albumId: selectedAlbum?.id_album,
      };

      // Iniciar sesión con cuenta regresiva
      await startSessionWithCountdown(payload);

    } catch (error) {
      console.error('Error iniciando sesión:', error);
      setIsLoading(false);
    }
  };

  /**
   * Maneja la finalización de la cuenta regresiva
   * Se asegura de que la sesión se inicie correctamente incluso si la música falla
   */
  const handleCountdownComplete = async () => {
    try {
      const payload: SessionCreateDto = {
        title: title.trim() || 'Sesión de concentración',
        description: description.trim() || undefined,
        type: sessionId ? 'scheduled' : 'rapid',
        eventId: sessionId ? parseInt(sessionId) : undefined,
        methodId: selectedMethod?.id_metodo,
        albumId: selectedAlbum?.id_album,
      };

      // Iniciar sesión real primero
      await startSession(payload);

      // Si se seleccionó un método, minimizar la sesión y redirigir a la ejecución del método
      if (payload.methodId) {
        minimize();

        // Redirigir a la página de ejecución del método correspondiente
        const methodType = getMethodType(selectedMethod);
        if (methodType === 'pomodoro') {
          navigate(`/pomodoro/execute/${payload.methodId}`);
        } else if (methodType === 'mindmaps') {
          navigate(`/mind-maps/steps/${payload.methodId}`);
        } else if (methodType === 'spacedrepetition') {
          navigate(`/spaced-repetition/steps/${payload.methodId}`);
        } else if (methodType === 'activerecall') {
          navigate(`/active-recall/steps/${payload.methodId}`);
        } else if (methodType === 'feynman') {
          navigate(`/feynman/steps/${payload.methodId}`);
        } else if (methodType === 'cornell') {
          navigate(`/cornell/steps/${payload.methodId}`);
        }
      }

      // Manejar reproducción de música con manejo de errores robusto
      if (selectedAlbum?.id_album) {
        try {
          console.log('Iniciando reproducción del álbum seleccionado:', selectedAlbum.nombre_album);

          // Cargar canciones del álbum específico desde la API
          const albumSongs: Song[] = await getSongsByAlbumId(selectedAlbum.id_album);

          if (albumSongs.length === 0) {
            console.warn(`El álbum ${selectedAlbum.nombre_album} no tiene canciones disponibles`);

            // Mostrar notificación no intrusiva al usuario
            Swal.fire({
              toast: true,
              position: 'top-end',
              icon: 'warning',
              title: 'El álbum seleccionado no tiene canciones disponibles',
              showConfirmButton: false,
              timer: 3000,
              background: '#232323',
              color: '#ffffff',
            });
            return;
          }

          // Usar función pura para iniciar reproducción del álbum
          await replaceIfSessionAlbum(
            {
              playPlaylist,
              currentAlbum: currentAlbum, // Álbum actualmente reproduciendo
              isPlaying: isPlaying,       // Estado de reproducción actual
              togglePlayPause: () => {}, // No usado en este contexto
            },
            selectedAlbum.id_album,
            albumSongs, // Ahora pasamos directamente las canciones del álbum
            {
              id_album: selectedAlbum.id_album,
              nombre_album: selectedAlbum.nombre_album
            }
          );

          console.log(`Reproducción del álbum ${selectedAlbum.nombre_album} iniciada correctamente con ${albumSongs.length} canciones`);
        } catch (musicError) {
          // Se registra el error pero no se interrumpe la sesión
          console.error('Error reproduciendo música del álbum:', musicError);

          // Mostrar notificación no intrusiva al usuario
          try {
            // Mostrar toast de advertencia
            Swal.fire({
              toast: true,
              position: 'top-end',
              icon: 'warning',
              title: 'La música no pudo cargarse, pero la sesión continúa normalmente',
              showConfirmButton: false,
              timer: 3000,
              background: '#232323',
              color: '#ffffff',
            });
          } catch (toastError) {
            console.warn('No se pudo mostrar notificación de error de música');
          }
        }
      } else {
        // Si no se seleccionó álbum, mantener reproducción actual si existe
        console.log('Sesión iniciada sin álbum - manteniendo reproducción actual si existe');
      }
    } catch (error) {
      console.error('Error iniciando sesión después de cuenta regresiva:', error);
      // Mostrar error crítico al usuario
      alert('Error al iniciar la sesión. Por favor, inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Maneja la cancelación de la cuenta regresiva
   */
  const handleCountdownCancel = () => {
    setIsLoading(false);
  };

  /**
   * Remueve método seleccionado
   */
  const removeMethod = () => {
    setSelectedMethod(null);
  };

  /**
   * Remueve álbum seleccionado
   */
  const removeAlbum = () => {
    setSelectedAlbum(null);
  };

  /**
   * Maneja selección de método desde el modal
   * Actualiza el estado y cierra el modal
   */
  const handleMethodSelect = (method: any) => {
    setSelectedMethod(method);
    setIsMethodModalOpen(false);
  };

  /**
   * Maneja selección de álbum desde el modal
   * Actualiza el estado y cierra el modal
   */
  const handleAlbumSelect = (album: any) => {
    setSelectedAlbum(album);
    setIsAlbumModalOpen(false);
  };


  return (
    <PageLayout
      showSidebar={true}
      sidebar={<Sidebar currentPage="sessions" />}
    >
      <div className="w-full max-w-6xl mx-auto">
        {/* Botón atrás en la parte superior */}
        <div className="mb-6">
          <BackButton />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Columna izquierda: Formulario */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#232323]/70 backdrop-blur-md rounded-xl p-6 shadow-lg">
              <h1 className="text-2xl font-bold text-white mb-6">
                {sessionId ? 'Continuar sesión programada' : 'Iniciar sesión de concentración'}
              </h1>

              {/* Badge de llegada tarde */}
              {isLate && (
                <div className="mb-4 inline-flex items-center gap-2 px-3 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400">
                  <span>⚠️</span>
                  <span className="text-sm">Llegaste tarde {minutesLate} minutos</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Título */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white">
                    Título de la sesión
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Sesión de concentración #1"
                    className="w-full px-4 py-3 bg-[#1a1a1a]/50 border border-[#333]/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Descripción expandable */}
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setDescriptionExpanded(!descriptionExpanded)}
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    <ChevronDownIcon className={`w-4 h-4 transition-transform ${descriptionExpanded ? 'rotate-180' : ''}`} />
                    Descripción avanzada
                  </button>

                  <AnimatePresence>
                    {descriptionExpanded && (
                      <motion.textarea
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe el propósito de esta sesión..."
                        className="w-full px-4 py-3 bg-[#1a1a1a]/50 border border-[#333]/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        rows={3}
                      />
                    )}
                  </AnimatePresence>
                </div>

                {/* Botones de selección de método y álbum */}
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-white">
                    Configuración de la sesión
                  </label>

                  {/* Botón de selección de método */}
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => setIsMethodModalOpen(true)}
                      className="w-full flex items-center justify-between p-4 bg-[#1a1a1a]/50 border-2 border-dashed border-[#333]/50 rounded-xl text-left hover:border-blue-500/50 hover:bg-blue-500/10 transition-all duration-200 cursor-pointer group"
                      aria-haspopup="dialog"
                      aria-expanded={isMethodModalOpen}
                      aria-label="Seleccionar método de estudio"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center group-hover:bg-blue-600/30 transition-colors">
                          <BookOpenIcon className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">
                            {selectedMethod ? selectedMethod.nombre_metodo : 'Seleccionar método'}
                          </div>
                          <div className="text-xs text-gray-400">
                            {selectedMethod ? 'Método de estudio seleccionado' : 'Método de estudio (opcional)'}
                          </div>
                        </div>
                      </div>
                      <div className="text-gray-400 group-hover:text-blue-400 transition-colors">
                        <ChevronDownIcon className="w-5 h-5" />
                      </div>
                    </button>
                  </div>

                  {/* Botón de selección de álbum */}
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => setIsAlbumModalOpen(true)}
                      className="w-full flex items-center justify-between p-4 bg-[#1a1a1a]/50 border-2 border-dashed border-[#333]/50 rounded-xl text-left hover:border-purple-500/50 hover:bg-purple-500/10 transition-all duration-200 cursor-pointer group"
                      aria-haspopup="dialog"
                      aria-expanded={isAlbumModalOpen}
                      aria-label="Seleccionar álbum de música"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-600/20 flex items-center justify-center group-hover:bg-purple-600/30 transition-colors">
                          <MusicalNoteIcon className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">
                            {selectedAlbum ? selectedAlbum.nombre_album : 'Seleccionar álbum'}
                          </div>
                          <div className="text-xs text-gray-400">
                            {selectedAlbum ? 'Álbum de música seleccionado' : 'Música de fondo (opcional)'}
                          </div>
                        </div>
                      </div>
                      <div className="text-gray-400 group-hover:text-purple-400 transition-colors">
                        <ChevronDownIcon className="w-5 h-5" />
                      </div>
                    </button>
                  </div>
                </div>

                {/* Chips de selección */}
                <div className="flex flex-wrap gap-2">
                  {selectedMethod && (
                    <div className="inline-flex items-center gap-2 px-3 py-2 bg-[#1a1a1a]/70 rounded-lg border border-[#333]/50">
                      <div className="w-4 h-4 rounded-full bg-blue-500" />
                      <span className="text-sm text-white">{selectedMethod.nombre_metodo}</span>
                      <button
                        type="button"
                        onClick={removeMethod}
                        className="text-gray-400 hover:text-white cursor-pointer"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {selectedAlbum && (
                    <div className="inline-flex items-center gap-2 px-3 py-2 bg-[#1a1a1a]/70 rounded-lg border border-[#333]/50">
                      <div className="w-4 h-4 rounded bg-gray-600" />
                      <span className="text-sm text-white">{selectedAlbum.nombre_album}</span>
                      <button
                        type="button"
                        onClick={removeAlbum}
                        className="text-gray-400 hover:text-white cursor-pointer"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Botón de envío */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-blue-500/25 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#232323] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <PlayIcon className="w-5 h-5" />
                  )}
                  {isLoading ? 'Iniciando...' : 'Iniciar sesión de concentración'}
                </button>
              </form>
            </div>
          </div>

          {/* Columna derecha: Preview/Instrucciones */}
          <div className="lg:col-span-3">
            <div className="bg-[#232323]/70 backdrop-blur-md rounded-xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold text-white mb-4">
                Vista previa
              </h2>

              {/* Preview de la sesión */}
              <div className="bg-[#1a1a1a]/50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center">
                    <span className="text-white">⏱️</span>
                  </div>
                  <div>
                    <h3 className="text-white font-medium">
                      {title || 'Sesión de concentración'}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {selectedMethod ? `Con método: ${selectedMethod.nombre_metodo}` : 'Sesión rápida'}
                      {selectedAlbum && ` • Música: ${selectedAlbum.nombre_album}`}
                    </p>
                  </div>
                </div>

                {description && (
                  <p className="text-gray-300 text-sm mb-4">
                    {description}
                  </p>
                )}

                <div className="text-center">
                  <div className="text-2xl font-mono font-bold text-white mb-2">
                    00:00:00
                  </div>
                  <p className="text-gray-400 text-sm">
                    El timer comenzará cuando inicies la sesión
                  </p>
                </div>
              </div>

              {/* Instrucciones */}
              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-medium text-white">Cómo funciona</h3>

                <div className="space-y-3 text-gray-300 text-sm">
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold">1</div>
                    <p>Configura tu sesión con título, método y música opcionales</p>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold">2</div>
                    <p>La sesión se minimizará automáticamente si seleccionas un método</p>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold">3</div>
                    <p>El audio continúa reproduciendo sin interrupciones</p>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold">4</div>
                    <p>La sesión se guarda automáticamente y puede reanudarse</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modales de selección */}
      <MethodSelectionModal
        isOpen={isMethodModalOpen}
        onClose={() => setIsMethodModalOpen(false)}
        onSelect={handleMethodSelect}
        selectedMethod={selectedMethod}
      />

      <AlbumSelectionModal
        isOpen={isAlbumModalOpen}
        onClose={() => setIsAlbumModalOpen(false)}
        onSelect={handleAlbumSelect}
        selectedAlbum={selectedAlbum}
      />

      {/* Overlay de cuenta regresiva */}
      <CountdownOverlay
        isVisible={getState().showCountdown}
        onCountdownComplete={handleCountdownComplete}
        onCancel={handleCountdownCancel}
      />
    </PageLayout>
  );
};

export default StartSession;
