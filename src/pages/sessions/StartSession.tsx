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
    <div className="min-h-screen bg-gradient-to-br from-[#171717] via-[#1a1a1a] to-[#171717] relative overflow-hidden font-inter">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-80 h-80 bg-blue-500/8 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/6 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-indigo-500/5 rounded-full blur-3xl"></div>
      </div>

      <PageLayout
        showSidebar={true}
        sidebar={<Sidebar currentPage="sessions" />}
      >
        <div className="relative z-10 w-full max-w-6xl mx-auto px-6">

          {/* Hero Section */}
          <div className="relative mb-12">
            {/* Hero glow effect */}
            <div className="absolute -inset-6 bg-gradient-to-r from-blue-600/20 via-cyan-600/20 to-indigo-600/20 rounded-3xl blur-2xl opacity-50"></div>

            <div className="relative text-center">
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent mb-6 leading-tight">
                {sessionId ? 'Continuar Sesión' : 'Sesiones De Concentración'}
              </h2>

              <p className="text-gray-300 text-xl leading-relaxed max-w-3xl mx-auto mb-8">
                Configura tu sesión de concentración con las herramientas perfectas para maximizar tu productividad
              </p>

              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-300 rounded-full border border-blue-500/20">
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
                  Temporizador Inteligente
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 text-cyan-300 rounded-full border border-cyan-500/20">
                  <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
                  Métodos de Estudio
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 text-indigo-300 rounded-full border border-indigo-500/20">
                  <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></span>
                  Música Ambiental
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Columna izquierda: Formulario */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gradient-to-br from-[#232323]/90 to-[#1a1a1a]/90 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-blue-500/20">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent mb-2">
                  {sessionId ? 'Continuar Sesión' : 'Configurar Sesión'}
                </h1>
                <p className="text-gray-400 text-sm">
                  Personaliza tu experiencia de concentración
                </p>
              </div>

              {/* Badge de llegada tarde */}
              {isLate && (
                <div className="mb-6 inline-flex items-center gap-2 px-4 py-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 w-full justify-center">
                  <span className="text-lg">⚠️</span>
                  <span className="font-medium">Llegaste tarde {minutesLate} minutos</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Título */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-white flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                    Título de la sesión
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Sesión de concentración #1"
                    className="w-full px-4 py-4 bg-[#1a1a1a]/70 border border-[#333]/50 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 text-lg"
                  />
                </div>

                {/* Descripción expandable */}
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => setDescriptionExpanded(!descriptionExpanded)}
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-blue-400 transition-colors cursor-pointer group"
                  >
                    <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${descriptionExpanded ? 'rotate-180' : ''} group-hover:text-blue-400`} />
                    <span className="font-medium">Descripción avanzada</span>
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
                        className="w-full px-4 py-4 bg-[#1a1a1a]/70 border border-[#333]/50 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 resize-none transition-all duration-200 text-lg"
                        rows={3}
                      />
                    )}
                  </AnimatePresence>
                </div>

                {/* Configuración de la sesión */}
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-white mb-2">Configuración de la sesión</h3>
                    <p className="text-gray-400 text-sm">Elige las herramientas que potenciarán tu concentración</p>
                  </div>

                  {/* Botón de selección de método */}
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => setIsMethodModalOpen(true)}
                      className="w-full flex items-center justify-between p-6 bg-gradient-to-r from-[#1a1a1a]/70 to-[#232323]/70 border-2 border-dashed border-[#333]/50 rounded-2xl text-left hover:border-blue-500/60 hover:bg-blue-500/5 transition-all duration-300 cursor-pointer group shadow-lg hover:shadow-blue-500/10"
                      aria-haspopup="dialog"
                      aria-expanded={isMethodModalOpen}
                      aria-label="Seleccionar método de estudio"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600/20 to-blue-700/20 flex items-center justify-center group-hover:from-blue-600/30 group-hover:to-blue-700/30 transition-all duration-200 border border-blue-500/20">
                          <BookOpenIcon className="w-6 h-6 text-blue-400 group-hover:text-blue-300" />
                        </div>
                        <div className="flex-1">
                          <div className="text-base font-semibold text-white mb-1">
                            {selectedMethod ? selectedMethod.nombre_metodo : 'Seleccionar método'}
                          </div>
                          <div className="text-sm text-gray-400">
                            {selectedMethod ? 'Método de estudio seleccionado' : 'Método de estudio (opcional)'}
                          </div>
                        </div>
                      </div>
                      <div className="text-gray-400 group-hover:text-blue-400 transition-colors">
                        <ChevronDownIcon className="w-6 h-6" />
                      </div>
                    </button>
                  </div>

                  {/* Botón de selección de álbum */}
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => setIsAlbumModalOpen(true)}
                      className="w-full flex items-center justify-between p-6 bg-gradient-to-r from-[#1a1a1a]/70 to-[#232323]/70 border-2 border-dashed border-[#333]/50 rounded-2xl text-left hover:border-cyan-500/60 hover:bg-cyan-500/5 transition-all duration-300 cursor-pointer group shadow-lg hover:shadow-cyan-500/10"
                      aria-haspopup="dialog"
                      aria-expanded={isAlbumModalOpen}
                      aria-label="Seleccionar álbum de música"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-600/20 to-cyan-700/20 flex items-center justify-center group-hover:from-cyan-600/30 group-hover:to-cyan-700/30 transition-all duration-200 border border-cyan-500/20">
                          <MusicalNoteIcon className="w-6 h-6 text-cyan-400 group-hover:text-cyan-300" />
                        </div>
                        <div className="flex-1">
                          <div className="text-base font-semibold text-white mb-1">
                            {selectedAlbum ? selectedAlbum.nombre_album : 'Seleccionar álbum'}
                          </div>
                          <div className="text-sm text-gray-400">
                            {selectedAlbum ? 'Álbum de música seleccionado' : 'Música de fondo (opcional)'}
                          </div>
                        </div>
                      </div>
                      <div className="text-gray-400 group-hover:text-cyan-400 transition-colors">
                        <ChevronDownIcon className="w-6 h-6" />
                      </div>
                    </button>
                  </div>
                </div>

                {/* Chips de selección */}
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-3">
                    {selectedMethod && (
                      <div className="inline-flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-xl border border-blue-500/30 backdrop-blur-sm">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-r from-blue-400 to-blue-500 flex items-center justify-center">
                          <BookOpenIcon className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-sm font-medium text-white">{selectedMethod.nombre_metodo}</span>
                        <button
                          type="button"
                          onClick={removeMethod}
                          className="text-gray-400 hover:text-red-400 transition-colors cursor-pointer p-1 hover:bg-red-500/20 rounded-lg"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {selectedAlbum && (
                      <div className="inline-flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-cyan-500/20 to-cyan-600/20 rounded-xl border border-cyan-500/30 backdrop-blur-sm">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-r from-cyan-400 to-cyan-500 flex items-center justify-center">
                          <MusicalNoteIcon className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-sm font-medium text-white">{selectedAlbum.nombre_album}</span>
                        <button
                          type="button"
                          onClick={removeAlbum}
                          className="text-gray-400 hover:text-red-400 transition-colors cursor-pointer p-1 hover:bg-red-500/20 rounded-lg"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Botón de envío */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full px-8 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-blue-500/25 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-[#232323] transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-lg hover:transform hover:-translate-y-1"
                  >
                    {isLoading ? (
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <PlayIcon className="w-6 h-6" />
                    )}
                    {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión de concentración'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Columna derecha: Preview y características */}
          <div className="lg:col-span-3 space-y-6">
            {/* Vista previa de la sesión */}
            <div className="bg-gradient-to-br from-[#232323]/90 to-[#1a1a1a]/90 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-blue-500/20">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent mb-2">
                  Vista Previa
                </h2>
                <p className="text-gray-400 text-sm">Así se verá tu sesión</p>
              </div>

              <div className="bg-gradient-to-br from-[#1a1a1a]/80 to-[#232323]/80 rounded-2xl p-6 border border-[#333]/50">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center border border-blue-500/30">
                    <span className="text-3xl">⏱️</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-lg mb-1">
                      {title || 'Sesión de concentración'}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {selectedMethod ? `Con método: ${selectedMethod.nombre_metodo}` : 'Sesión rápida'}
                      {selectedAlbum && ` • Música: ${selectedAlbum.nombre_album}`}
                    </p>
                  </div>
                </div>

                {description && (
                  <div className="mb-6 p-4 bg-[#1a1a1a]/50 rounded-xl border border-[#333]/30">
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {description}
                    </p>
                  </div>
                )}

                <div className="text-center">
                  <div className="text-4xl font-mono font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-3">
                    00:00:00
                  </div>
                  <p className="text-gray-400 text-sm">
                    El temporizador comenzará cuando inicies la sesión
                  </p>
                </div>
              </div>
            </div>

            {/* Características y beneficios */}
            <div className="bg-gradient-to-br from-[#232323]/90 to-[#1a1a1a]/90 backdrop-blur-md rounded-3xl p-3   shadow-2xl border border-cyan-500/20">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-cyan-100 bg-clip-text text-transparent">
                  ¿Cómo Funciona?
                </h3>
                <p className="text-gray-400 text-sm">Descubre las ventajas de nuestras sesiones</p>
              </div>

              <div className="space-y-2">
                <div className="flex gap-4 p-4 bg-gradient-to-r from-blue-500/10 to-blue-600/10 rounded-2xl border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">Configuración Personalizada</h4>
                    <p className="text-gray-300 text-sm leading-relaxed">Configura tu sesión con título, método de estudio y música opcionales según tus necesidades</p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 bg-gradient-to-r from-cyan-500/10 to-cyan-600/10 rounded-2xl border border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-300">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">Ejecución Automática</h4>
                    <p className="text-gray-300 text-sm leading-relaxed">La sesión se minimiza automáticamente si seleccionas un método, permitiendo enfoque total</p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 bg-gradient-to-r from-indigo-500/10 to-indigo-600/10 rounded-2xl border border-indigo-500/20 hover:border-indigo-500/40 transition-all duration-300">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">Audio Continuo</h4>
                    <p className="text-gray-300 text-sm leading-relaxed">La música continúa reproduciendo sin interrupciones durante toda tu sesión</p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 bg-gradient-to-r from-violet-500/10 to-violet-600/10 rounded-2xl border border-violet-500/20 hover:border-violet-500/40 transition-all duration-300">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                    4
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">Persistencia Automática</h4>
                    <p className="text-gray-300 text-sm leading-relaxed">Tu sesión se guarda automáticamente y puede reanudarse en cualquier momento</p>
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
    </div>
  );
};

export default StartSession;
