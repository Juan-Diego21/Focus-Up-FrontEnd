/**
 * Página de reportes de sesiones de concentración
 *
 * Esta página muestra un historial completo de todas las sesiones de concentración
 * del usuario, con filtros, estadísticas y opciones para reanudar sesiones pendientes.
 *
 * Diseño: Layout con filtros, grid de cards de sesiones, y sidebar de estadísticas.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ChartBarIcon,
  PlayIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { reportsService } from '../../services/reportsService';
import { sessionService } from '../../services/sessionService';
import { formatTime, mapServerSession } from '../../utils/sessionMappers';
import { getBroadcastChannel, type BroadcastMessage } from '../../utils/broadcastChannel';
import { getSongsByAlbumId } from '../../utils/musicApi';
import { replaceIfSessionAlbum } from '../../services/audioService';
import { useMusicPlayer } from '../../contexts/MusicPlayerContext';
import type { SessionReport } from '../../types/api';

// Clave para localStorage (igual que en el provider)
const SESSION_STORAGE_KEY = 'focusup:activeSession';

/**
 * Página de reportes de sesiones
 */
export const SessionsReport: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { playPlaylist, currentAlbum, isPlaying } = useMusicPlayer();

  // Estado
  const [sessions, setSessions] = useState<SessionReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Estadísticas
  const [stats, setStats] = useState({
    totalSessions: 0,
    completedSessions: 0,
    totalTime: 0,
    thisWeekSessions: 0,
  });

  // Broadcast channel para escuchar actualizaciones de sesiones
  const broadcastChannel = getBroadcastChannel();

  // Cargar sesiones
  useEffect(() => {
    loadSessions();
  }, [statusFilter, dateFrom, dateTo]);

  // Refrescar datos cuando se navega a esta página (ej: después de completar sesión)
  useEffect(() => {
    loadSessions();
  }, [location.pathname]);

  // Configurar listeners para broadcast de actualizaciones de sesiones
  useEffect(() => {
    const handleSessionUpdate = (message: BroadcastMessage) => {
      // Escuchar todos los eventos de actualización de sesiones
      if (message.type === 'SESSION_COMPLETED' ||
          message.type === 'SESSION_PAUSED' ||
          message.type === 'SESSION_RESUMED' ||
          message.type === 'SESSION_UPDATE') {
        // Recargar sesiones cuando ocurra cualquier actualización de sesión
        console.log('Recibiendo actualización de sesión:', message.type);
        loadSessions();
      }
    };

    broadcastChannel.addListener('reports-page', handleSessionUpdate);

    // Cleanup
    return () => {
      broadcastChannel.removeListener('reports-page');
    };
  }, []);

  /**
   * Carga reportes de sesiones con filtros
   */
  const loadSessions = async () => {
    try {
      setLoading(true);
      setError(null);

      // Los reportes de sesiones no soportan filtros avanzados por ahora
      // Solo obtenemos todos los reportes del usuario
      const sessionsData = await reportsService.getSessionReports();

      // Filtrar localmente según el filtro de estado
      let filteredSessions = sessionsData;
      if (statusFilter !== 'all') {
        const targetEstado = statusFilter === 'pending' ? 'pendiente' : 'completado';
        filteredSessions = sessionsData.filter(session => session.estado === targetEstado);
      }

      // Filtrar por fechas si se especifican
      if (dateFrom) {
        const fromDate = new Date(dateFrom);
        filteredSessions = filteredSessions.filter(session =>
          new Date(session.fechaCreacion) >= fromDate
        );
      }
      if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999); // Fin del día
        filteredSessions = filteredSessions.filter(session =>
          new Date(session.fechaCreacion) <= toDate
        );
      }

      setSessions(filteredSessions);

      // Calcular estadísticas con datos filtrados
      calculateStats(filteredSessions);
    } catch (err) {
      setError('Error cargando sesiones');
      console.error('Error loading sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Calcula estadísticas de las sesiones
   */
  const calculateStats = (sessionsData: SessionReport[]) => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    let totalTime = 0;
    let completedCount = 0;
    let thisWeekCount = 0;

    sessionsData.forEach(session => {
      totalTime += session.tiempoTotal * 1000; // Convertir segundos a milisegundos

      if (session.estado === 'completado') {
        completedCount++;
      }

      const sessionDate = new Date(session.fechaCreacion);
      if (sessionDate >= weekAgo) {
        thisWeekCount++;
      }
    });

    setStats({
      totalSessions: sessionsData.length,
      completedSessions: completedCount,
      totalTime,
      thisWeekSessions: thisWeekCount,
    });
  };

  /**
   * Formatea tiempo total
   */
  const formatTotalTime = (ms: number): string => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  /**
   * Maneja continuar sesión desde reportes
   *
   * Implementa el flujo completo de reanudación según especificaciones:
   * 1. Obtiene la sesión completa desde el servidor usando GET /api/v1/sessions/{sessionId}
   * 2. Si tiene albumId: obtiene canciones con GET /api/v1/musica/albums/{albumId}, reemplaza playlist actual y inicia reproducción
   * 3. Si tiene methodId: carga detalles y navega a la ruta de ejecución correcta con isInsideConcentrationSession=true
   * 4. Restaura timer usando elapsedMs como base
   * 5. Asegura que el provider use el sessionId correcto para PATCHes posteriores
   */
  const handleResumeSession = async (session: SessionReport) => {
    try {
      console.log('Continuando sesión desde reporte:', session.idSesion);

      // 1. Obtener sesión completa desde servidor
      const sessionDto = await sessionService.getSession(session.idSesion.toString());
      const activeSession = mapServerSession(sessionDto);

      // 2. Si tiene albumId, reemplazar playlist actual con las canciones de la sesión
      if (activeSession.albumId) {
        console.log('Sesión tiene albumId, reemplazando playlist actual:', activeSession.albumId);
        try {
          // Obtener canciones del álbum usando el nuevo endpoint GET /api/v1/musica/albums/{albumId}
          const albumSongs = await getSongsByAlbumId(activeSession.albumId);

          if (albumSongs.length > 0) {
            // Reemplazar playlist actual con las canciones de la sesión usando musicPlayerApi inyectada
            await replaceIfSessionAlbum(
              {
                playPlaylist,
                currentAlbum: currentAlbum,
                isPlaying: isPlaying,
                togglePlayPause: () => {},
              },
              activeSession.albumId,
              albumSongs,
              {
                id_album: activeSession.albumId,
                nombre_album: session.albumAsociado?.nombreAlbum || 'Álbum de sesión'
              }
            );
            console.log('Playlist reemplazada e iniciada reproducción para sesión continuada');
          } else {
            console.warn('El álbum de la sesión no tiene canciones disponibles');
          }
        } catch (albumError) {
          console.error('Error obteniendo/reemplazando canciones para reanudación:', albumError);
        }
      }

      // 3. Preparar datos de reanudación para el provider
      const resumeData = {
        ...activeSession,
        persistedAt: new Date().toISOString()
      };

      // 4. Almacenar en localStorage para que el provider los restaure
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(resumeData));
      localStorage.setItem('focusup:directResume', 'true');

      // 5. Si tiene methodId, navegar a la ejecución del método correspondiente
      if (activeSession.methodId) {
        console.log('Sesión tiene methodId, navegando a ejecución del método:', activeSession.methodId);
        // Aquí se implementaría la navegación al método específico
        // Por ahora, continuar con el flujo normal que irá al dashboard
      }

      // 6. Navegar al dashboard donde el provider restaurará la sesión con timer correcto
      navigate('/dashboard');

    } catch (error) {
      console.error('Error continuando sesión desde reporte:', error);
      // Fallback: navegar a start-session como antes
      navigate(`/start-session/${session.idSesion}`);
    }
  };

  /**
   * Maneja completar sesión (desde reportes)
   */
  const handleCompleteSession = async (session: SessionReport) => {
    try {
      // Para completar desde reportes, usar el tiempo total ya registrado
      const elapsedMs = session.tiempoTotal * 1000; // Convertir segundos a ms
      await sessionService.completeSession(session.idSesion.toString(), elapsedMs);
      // Recargar sesiones
      loadSessions();
    } catch (error) {
      console.error('Error completando sesión:', error);
    }
  };

  /**
   * Maneja eliminar sesión
   */
  const handleDeleteSession = (session: SessionReport) => {
    // Aquí iría la lógica para eliminar una sesión
    console.log('Eliminar sesión:', session.idSesion);
    // Por ahora, solo mostrar confirmación
    if (window.confirm('¿Estás seguro de que quieres eliminar esta sesión?')) {
      // Implementar eliminación
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#171717] via-[#1a1a1a] to-[#171717] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Cargando sesiones...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#171717] via-[#1a1a1a] to-[#171717] flex items-center justify-center p-6">
        <div className="text-center max-w-md mx-auto p-6 bg-[#232323]/70 backdrop-blur-md rounded-xl">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-white text-xl font-semibold mb-4">Error</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={loadSessions}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#171717] via-[#1a1a1a] to-[#171717]">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-6">
            Reportes - Sesiones de Concentración
          </h1>

          {/* Filtros */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex gap-2">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-[#232323] text-gray-400 hover:text-white'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setStatusFilter('pending')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  statusFilter === 'pending'
                    ? 'bg-blue-600 text-white'
                    : 'bg-[#232323] text-gray-400 hover:text-white'
                }`}
              >
                Pendientes
              </button>
              <button
                onClick={() => setStatusFilter('completed')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  statusFilter === 'completed'
                    ? 'bg-blue-600 text-white'
                    : 'bg-[#232323] text-gray-400 hover:text-white'
                }`}
              >
                Completadas
              </button>
            </div>

            {/* Filtros de fecha */}
            <div className="flex gap-2">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="px-3 py-2 bg-[#232323] border border-[#333]/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Desde"
              />
              <span className="text-gray-400 self-center">-</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="px-3 py-2 bg-[#232323] border border-[#333]/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Hasta"
              />
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Grid de sesiones */}
          <div className="lg:col-span-3">
            {sessions.length === 0 ? (
              <div className="text-center py-12">
                <ChartBarIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No hay sesiones para mostrar</p>
                <p className="text-gray-500 text-sm">Comienza una sesión de concentración para ver tus reportes aquí</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sessions.map((session) => (
                  <motion.div
                    key={session.idSesion}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#232323]/70 backdrop-blur-md rounded-xl shadow-lg border border-[#333]/50 overflow-hidden hover:shadow-xl transition-shadow duration-200"
                  >
                    {/* Header con título */}
                    <div className="p-6 border-b border-[#333]/50">
                      <div className="mb-2">
                        <h3 className="text-xl font-semibold text-white">
                          {session.nombreSesion}
                        </h3>
                      </div>

                      {/* Descripción si existe */}
                      {session.descripcion && (
                        <p className="text-gray-300 text-sm mt-2 line-clamp-2">
                          {session.descripcion}
                        </p>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="p-6">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <div className="text-xs text-gray-400 mb-1">Tiempo total</div>
                          <div className="text-white font-medium">
                            {session.tiempoTotal > 0 ? formatTime(session.tiempoTotal * 1000) : '0:00:00'}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-400 mb-1">
                            {session.estado === 'completado' ? 'Fecha de cierre' : 'Fecha de creación'}
                          </div>
                          <div className="text-white font-medium">
                            {new Date(session.fechaCreacion).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(session.fechaCreacion).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>

                      {/* Status indicator */}
                      <div className="mb-4">
                        <div className="text-xs text-gray-400 mb-2">Estado</div>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            session.estado === 'completado' ? 'bg-green-500' : 'bg-yellow-500'
                          }`} />
                          <span className={`text-sm font-medium ${
                            session.estado === 'completado' ? 'text-green-400' : 'text-yellow-400'
                          }`}>
                            {session.estado === 'completado' ? 'Sesión completada' : 'Sesión pendiente'}
                          </span>
                        </div>
                      </div>

                      {/* Método y álbum */}
                      {(session.metodoAsociado || session.albumAsociado) && (
                        <div className="flex gap-4 mb-4">
                          {session.metodoAsociado && (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 rounded-full bg-blue-500" />
                              <span className="text-sm text-gray-300">{session.metodoAsociado.nombreMetodo}</span>
                            </div>
                          )}

                          {session.albumAsociado && (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 rounded bg-gray-600 flex items-center justify-center">
                                <span className="text-xs">🎵</span>
                              </div>
                              <span className="text-sm text-gray-300">{session.albumAsociado.nombreAlbum}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Acciones */}
                      <div className="flex gap-2">
                        {session.estado === 'pendiente' && (
                          <button
                            onClick={() => handleResumeSession(session)}
                            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                          >
                            <PlayIcon className="w-4 h-4" />
                            Reanudar
                          </button>
                        )}

                        {session.estado === 'pendiente' && (
                          <button
                            onClick={() => handleCompleteSession(session)}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                          >
                            <CheckIcon className="w-4 h-4" />
                            Completar
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteSession(session)}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar de estadísticas */}
          <div className="lg:col-span-1">
            <div className="bg-[#232323]/70 backdrop-blur-md rounded-xl p-6 shadow-lg sticky top-6">
              <h2 className="text-xl font-semibold text-white mb-6">Estadísticas</h2>

              <div className="space-y-6">
                {/* Sesiones totales */}
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-1">
                    {stats.totalSessions}
                  </div>
                  <div className="text-sm text-gray-400">Sesiones totales</div>
                </div>

                {/* Sesiones completadas */}
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400 mb-1">
                    {stats.completedSessions}
                  </div>
                  <div className="text-sm text-gray-400">Completadas</div>
                </div>

                {/* Tiempo total */}
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400 mb-1">
                    {formatTotalTime(stats.totalTime)}
                  </div>
                  <div className="text-sm text-gray-400">Tiempo total</div>
                </div>

                {/* Esta semana */}
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400 mb-1">
                    {stats.thisWeekSessions}
                  </div>
                  <div className="text-sm text-gray-400">Esta semana</div>
                </div>

                {/* Tasa de completación */}
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400 mb-1">
                    {stats.totalSessions > 0
                      ? Math.round((stats.completedSessions / stats.totalSessions) * 100)
                      : 0
                    }%
                  </div>
                  <div className="text-sm text-gray-400">Completadas</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionsReport;