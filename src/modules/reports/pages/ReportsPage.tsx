/**
 * Página principal que muestra los reportes de sesiones de concentración y métodos de estudio
 * Integra los nuevos endpoints separados para una mejor organización de datos
 * Incluye componentes reutilizables y manejo de errores consistente
 */
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@shared/components/ui/Sidebar";
import { PageLayout } from "@shared/components/ui/PageLayout";
import { reportsService } from "@shared/services/reportsService";
import { sessionService } from "@shared/services/sessionService";
import { apiClient } from "@shared/services/apiClient";
import { LOCAL_METHOD_ASSETS } from '@shared/utils/methodAssets';
import { mapServerSession } from "@shared/utils/sessionMappers";
import { useMusicPlayer } from '@shared/contexts/MusicPlayerContext';
import { replaceIfSessionAlbum } from '@shared/services/audioService';
import { getSongsByAlbumId } from '@shared/services/musicApi';
import { API_ENDPOINTS } from "@shared/config/constants";
import { useConcentrationSession } from '@shared/providers/ConcentrationSessionProvider';
import Swal from 'sweetalert2';
import {
  ExclamationTriangleIcon,
  MusicalNoteIcon,
  CheckIcon,
  ClockIcon,
  TrashIcon,
  BookOpenIcon,
  ChartBarIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import {
  getMindMapsColorByProgress,
  getMindMapsLabelByProgress,
  getSpacedRepetitionColorByProgress,
  getSpacedRepetitionLabelByProgress,
  getActiveRecallColorByProgress,
  getActiveRecallLabelByProgress,
  getFeynmanColorByProgress,
  getFeynmanLabelByProgress,
  getCornellColorByProgress,
  getCornellLabelByProgress,
  getMethodType
} from '@shared/utils/methodStatus';
import type { SessionReport, MethodReport } from '../../../types/api';

/**
 * IMPORTANTE SOBRE UNIDADES:
 * En sesiones el backend expone el tiempo real como `elapsedMs` (milisegundos).
 * El error original venía de mezclar segundos y milisegundos al formatear, lo que distorsionaba estadísticas.
 */
const normalizeDurationToMs = (rawDuration: number | null | undefined): number => {
  if (!Number.isFinite(rawDuration) || !rawDuration || rawDuration < 0) {
    return 0;
  }
  return rawDuration;
};

/**
 * Formatea una duración real en milisegundos (no timestamp) a HH:MM:SS.
 * Se evita usar `Date` porque aquí no hay fechas, solo duración acumulada.
 */
const formatDurationFromMs = (msInput: number): string => {
  const totalSeconds = Math.max(0, Math.floor(msInput / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * Obtiene el color basado en el progreso para métodos Pomodoro
 * @param progress - Valor de progreso
 * @returns Color correspondiente al progreso
 */
const getPomodoroColorByProgress = (progress: number): string => {
  if (progress === 60) return '#3B82F6'; // Azul para fase de descanso
  if (progress === 100) return '#22C55E'; // Verde para completado
  return '#FACC15'; // Amarillo para fase de trabajo
};

const getMethodColor = (methodName: string): string => {
  return LOCAL_METHOD_ASSETS[methodName]?.color || '#6366f1';
};

const getMethodImage = (methodName: string): string => {
  return LOCAL_METHOD_ASSETS[methodName]?.image || '';
};

const COMPLETED_METHOD_STATUSES = new Set([
  'completado',
  'completed',
  'terminado',
  'finalizado',
]);

const shouldResumeMethodExecution = (report?: MethodReport): boolean => {
  if (!report) return false;
  const status = String(report.estado || '').toLowerCase();
  return report.progreso < 100 && !COMPLETED_METHOD_STATUSES.has(status);
};


/**
 * Página principal de reportes
 */
export const ReportsPage: React.FC = () => {
   const navigate = useNavigate();
   const { playPlaylist, currentAlbum, isPlaying } = useMusicPlayer();
   const { checkDirectResume } = useConcentrationSession();

  // Estado para los reportes
  const [sessionReports, setSessionReports] = useState<SessionReport[]>([]);
  const [methodReports, setMethodReports] = useState<MethodReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  // Estado para controlar qué pestaña está activa (métodos o sesiones)
  const [activeTab, setActiveTab] = useState<'methods' | 'sessions'>('methods');
  // Estado para el filtro de estado de los métodos (todos, pendiente, terminado)
  const [statusFilter, setStatusFilter] = useState<'todos' | 'pendiente' | 'terminado'>('todos');
  // Estado para el filtro de estado de las sesiones (todos, pendiente, completado, programado)
  const [sessionFilter, setSessionFilter] = useState<'todos' | 'pendiente' | 'completado'>('todos');
  // Estado para controlar la carga de imágenes de métodos
  const [imageLoaded, setImageLoaded] = useState(false);

  // Estado para el modal de estadísticas
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [statsModalType, setStatsModalType] = useState<'methods' | 'sessions' | null>(null);

  /**
   * Carga los reportes de sesiones y métodos desde los nuevos endpoints
   */
  const loadReports = async () => {
    try {
      setLoading(true);
      setError("");

      // Cargar ambos reportes en paralelo para mejor performance
      const [sessionsData, methodsData] = await Promise.all([
        reportsService.getSessionReports(),
        reportsService.getMethodReports()
      ]);

      setSessionReports(sessionsData);
      setMethodReports(methodsData);
    } catch (err) {
      console.error('Error cargando reportes:', err);
      setError('Error al cargar los reportes. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Elimina un reporte específico del backend
   * Muestra confirmación al usuario antes de proceder con la eliminación
   */
  const deleteReport = async (reportId: number) => {
    const result = await Swal.fire({
      title: '¿Eliminar reporte?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      background: '#232323',
      color: '#ffffff',
    });

    if (result.isConfirmed) {
      try {
        // Producción: usar cliente HTTP centralizado (base URL por entorno + JWT por interceptor).
        await apiClient.delete(`${API_ENDPOINTS.REPORTS}/${reportId}`);

        Swal.fire({
          title: 'Eliminado',
          text: 'El reporte ha sido eliminado correctamente',
          icon: 'success',
          confirmButtonColor: '#22C55E',
          background: '#232323',
          color: '#ffffff',
        });

        // Refresh reports
        loadReports();
      } catch (error) {
        console.error('Error deleting report:', error);
        Swal.fire({
          title: 'Error',
          text: 'No se pudo eliminar el reporte',
          icon: 'error',
          confirmButtonColor: '#EF4444',
          background: '#232323',
          color: '#ffffff',
        });
      }
    }
  };

  /**
   * Muestra estadísticas agregadas de métodos
   */
  const showMethodsStats = () => {
    setStatsModalType('methods');
    setShowStatsModal(true);
  };

  /**
   * Muestra estadísticas agregadas de sesiones
   */
  const showSessionsStats = () => {
    setStatsModalType('sessions');
    setShowStatsModal(true);
  };

  /**
   * Cierra el modal de estadísticas
   */
  const closeStatsModal = () => {
    setShowStatsModal(false);
    setStatsModalType(null);
  };

  // Cargar reportes al montar el componente
  useEffect(() => {
    loadReports();
  }, []);

  // useMemo evita recalcular filtros pesados en cada render cuando las dependencias no cambian.
  const filteredMethods = useMemo(() => {
    return methodReports.filter(method => {
      if (statusFilter === 'todos') return true;
      if (statusFilter === 'pendiente') return method.estado !== 'completed' && method.progreso < 100;
      if (statusFilter === 'terminado') return method.estado === 'completed' || method.progreso === 100;
      return true;
    });
  }, [methodReports, statusFilter]);

  const deduplicatedSessions = useMemo(() => {
    return sessionReports.filter(session => {
      // Si la sesión tiene tiempo 0 y estado pendiente, verificar si existe otra sesión con el mismo nombre pero con tiempo
      if (session.tiempoTotal === 0 && session.estado === 'pendiente') {
        // Buscar si existe otra sesión con el mismo nombre pero con tiempo > 0
        const duplicateWithTime = sessionReports.find(s =>
          s.nombreSesion === session.nombreSesion &&
          s.tiempoTotal > 0 &&
          s.idSesion !== session.idSesion
        );
        // Si existe una versión con tiempo, ocultar esta versión con tiempo 0
        if (duplicateWithTime) {
          return false;
        }
      }
      return true;
    });
  }, [sessionReports]);

  const filteredSessions = useMemo(() => {
    return deduplicatedSessions.filter(session => {
      if (sessionFilter === 'todos') return true;
      if (sessionFilter === 'pendiente') return session.estado === 'pendiente';
      if (sessionFilter === 'completado') return session.estado === 'completado';
      return true;
    });
  }, [deduplicatedSessions, sessionFilter]);



  // Estados de carga y error
  if (loading) {
    return (
      <div className="bg-gradient-to-br from-[#171717] via-[#1a1a1a] to-[#171717] min-h-screen flex items-center justify-center p-5">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Cargando reportes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-[#171717] via-[#1a1a1a] to-[#171717] min-h-screen flex items-center justify-center p-5">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">
            <ExclamationTriangleIcon className="w-16 h-16 mx-auto" />
          </div>
          <h2 className="text-white text-xl font-semibold mb-4">Error al cargar datos</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={loadReports}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 cursor-pointer"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <PageLayout
      showSidebar={true}
      sidebar={<Sidebar currentPage="reports" />}
    >
      <div className="w-full max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-8 text-center">Reportes de Sesiones</h1>

          {/* Pestañas */}
          <div className="flex justify-center mb-8">
            {/* Se usa layout envolvente para evitar barra/línea visual de overflow en móvil */}
            <div className="bg-[#232323] p-1 rounded-2xl shadow-lg flex flex-wrap items-center justify-center gap-1 max-w-full">
              <button
                onClick={() => setActiveTab('methods')}
                className={`px-4 sm:px-6 py-3 min-h-[44px] rounded-xl font-semibold transition-all duration-200 cursor-pointer ${
                  activeTab === 'methods'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-[#2a2a2a]'
                }`}
              >
                Métodos de Estudio
              </button>
              <button
                onClick={() => setActiveTab('sessions')}
                className={`px-4 sm:px-6 py-3 min-h-[44px] rounded-xl font-semibold transition-all duration-200 cursor-pointer ${
                  activeTab === 'sessions'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-[#2a2a2a]'
                }`}
              >
                Sesiones de Concentración
              </button>
            </div>
          </div>

          {/* Filtro de estado y botón de estadísticas */}
          {activeTab === 'methods' && (
            <div className="flex justify-center items-center mb-8 gap-3 sm:gap-6 flex-wrap sm:flex-nowrap">
              <div className="bg-[#232323] p-1 rounded-2xl shadow-lg flex flex-wrap items-center justify-center gap-1 max-w-full">
                <button
                  onClick={() => setStatusFilter('todos')}
                  className={`px-4 sm:px-6 py-3 min-h-[44px] rounded-xl font-semibold transition-all duration-200 cursor-pointer ${
                    statusFilter === 'todos'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-[#2a2a2a]'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setStatusFilter('pendiente')}
                  className={`px-4 sm:px-6 py-3 min-h-[44px] rounded-xl font-semibold transition-all duration-200 cursor-pointer ${
                    statusFilter === 'pendiente'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-[#2a2a2a]'
                  }`}
                >
                  Pendiente
                </button>
                <button
                  onClick={() => setStatusFilter('terminado')}
                  className={`px-4 sm:px-6 py-3 min-h-[44px] rounded-xl font-semibold transition-all duration-200 cursor-pointer ${
                    statusFilter === 'terminado'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-[#2a2a2a]'
                  }`}
                >
                  Terminado
                </button>
              </div>
              <button
                onClick={showMethodsStats}
                className="p-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all duration-200 cursor-pointer"
                title="Ver Estadísticas"
              >
                <ChartBarIcon className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Filtro de sesiones */}
          {activeTab === 'sessions' && (
            <div className="flex justify-center items-center mb-8 gap-3 sm:gap-6 flex-wrap sm:flex-nowrap">
              <div className="bg-[#232323] p-1 rounded-2xl shadow-lg flex flex-wrap items-center justify-center gap-1 max-w-full">
                <button
                  onClick={() => setSessionFilter('todos')}
                  className={`px-4 sm:px-6 py-3 min-h-[44px] rounded-xl font-semibold transition-all duration-200 cursor-pointer ${
                    sessionFilter === 'todos'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-[#2a2a2a]'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setSessionFilter('pendiente')}
                  className={`px-4 sm:px-6 py-3 min-h-[44px] rounded-xl font-semibold transition-all duration-200 cursor-pointer ${
                    sessionFilter === 'pendiente'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-[#2a2a2a]'
                  }`}
                >
                  Pendiente
                </button>
                <button
                  onClick={() => setSessionFilter('completado')}
                  className={`px-4 sm:px-6 py-3 min-h-[44px] rounded-xl font-semibold transition-all duration-200 cursor-pointer ${
                    sessionFilter === 'completado'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-[#2a2a2a]'
                  }`}
                >
                  Completado
                </button>
              </div>
              <button
                onClick={showSessionsStats}
                className="p-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all duration-200 cursor-pointer"
                title="Ver Estadísticas"
              >
                <ChartBarIcon className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Contenido */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4 py-6">
          {activeTab === 'methods' && (
            <>
              {filteredMethods.map((method) => {
                const methodColor = getMethodColor(method.nombreMetodo);
                const methodImage = getMethodImage(method.nombreMetodo);
                const isCompleted = method.estado === 'completado';
                const methodType = getMethodType(method.nombreMetodo);

                return (
                  <div
                    key={`method-${method.idReporte}`}
                    className="group relative bg-gradient-to-br from-[#232323]/95 to-[#1a1a1a]/95 backdrop-blur-md rounded-xl shadow-2xl overflow-hidden transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-2xl border border-[#333]/50"
                    style={{
                      '--method-color': methodColor,
                      boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px ${methodColor}20`,
                    } as React.CSSProperties}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = `0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px ${methodColor}40, 0 0 20px ${methodColor}10`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = `0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px ${methodColor}20`;
                    }}
                  >
                    {/* Diseño rectangular: Imagen a la izquierda, contenido a la derecha */}
                    <div className="flex h-32">
                      {/* Sección de imagen - Izquierda, centrada verticalmente */}
                      <div className="relative w-20 flex items-center justify-center p-3 overflow-hidden">
                        {methodImage ? (
                          <>
                            {!imageLoaded && (
                              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gray-700 animate-pulse"></div>
                            )}
                            <img
                              src={methodImage}
                              alt={method.nombreMetodo}
                              className={`w-12 h-[55%] md:w-16 md:h-[55%] object-contain rounded-full shadow-md shadow-black/40 ${imageLoaded ? 'block' : 'hidden'}`}
                              onLoad={() => setImageLoaded(true)}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = "none";
                                const parent = target.parentElement;
                                if (parent && !parent.querySelector(".fallback-emoji")) {
                                  const emoji = document.createElement("span");
                                  emoji.className = "fallback-emoji text-6xl md:text-8xl";
                                  emoji.textContent = "🍅";
                                  parent.appendChild(emoji);
                                }
                              }}
                            />
                          </>
                        ) : (
                          <span className="text-6xl md:text-8xl">🍅</span>
                        )}

                        {/* Insignia de estado - Compacta */}
                        <div className="absolute top-7 right-2">
                          <div
                            className="px-2 py-0.5 rounded text-xs font-semibold text-white shadow flex items-center gap-1"
                            style={{
                              backgroundColor: methodType === 'mindmaps'
                                ? getMindMapsColorByProgress(method.progreso)
                                : methodType === 'spacedrepetition'
                                ? getSpacedRepetitionColorByProgress(method.progreso)
                                : methodType === 'activerecall'
                                ? getActiveRecallColorByProgress(method.progreso)
                                : methodType === 'feynman'
                                ? getFeynmanColorByProgress(method.progreso)
                                : methodType === 'cornell'
                                ? getCornellColorByProgress(method.progreso)
                                : methodType === 'pomodoro'
                                ? getPomodoroColorByProgress(method.progreso)
                                : (isCompleted ? '#22C55E' : '#FACC15'),
                              boxShadow: `0 0 10px ${methodType === 'mindmaps'
                                ? getMindMapsColorByProgress(method.progreso)
                                : methodType === 'spacedrepetition'
                                ? getSpacedRepetitionColorByProgress(method.progreso)
                                : methodType === 'activerecall'
                                ? getActiveRecallColorByProgress(method.progreso)
                                : methodType === 'feynman'
                                ? getFeynmanColorByProgress(method.progreso)
                                : methodType === 'cornell'
                                ? getCornellColorByProgress(method.progreso)
                                : methodType === 'pomodoro'
                                ? getPomodoroColorByProgress(method.progreso)
                                : (isCompleted ? '#22C55E' : '#FACC15')}30`
                            }}
                          >
                            {isCompleted ? (
                              <CheckIcon className="w-3 h-3" />
                            ) : (
                              <ClockIcon className="w-3 h-3" />
                            )}
                          </div>
                        </div>

                      </div>

                      {/* Sección de contenido - 50% de la altura total */}
                      <div className="flex-1 p-4 flex flex-col justify-between">
                        {/* Encabezado */}
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-2 h-2 rounded-full shadow-sm flex-shrink-0"
                              style={{ backgroundColor: methodColor }}
                            />
                            <h3 className="text-base font-bold text-white leading-tight truncate">
                              {method.nombreMetodo}
                            </h3>
                          </div>
                          <span className="text-sm text-gray-300 font-medium">
                            {method.progreso || 0}%
                          </span>
                        </div>

                        {/* Barra de progreso */}
                        <div className="mb-1">
                          <div className="w-full h-2 bg-gray-300 rounded-full overflow-hidden shadow-inner">
                            <div
                              className="h-full rounded-full transition-all duration-1000 ease-out"
                              style={{
                                width: isCompleted ? '100%' : `${method.progreso || 0}%`,
                                backgroundColor: getMethodType(method.nombreMetodo) === 'mindmaps'
                                  ? getMindMapsColorByProgress(method.progreso)
                                  : getMethodType(method.nombreMetodo) === 'spacedrepetition'
                                  ? getSpacedRepetitionColorByProgress(method.progreso)
                                  : getMethodType(method.nombreMetodo) === 'activerecall'
                                  ? getActiveRecallColorByProgress(method.progreso)
                                  : getMethodType(method.nombreMetodo) === 'feynman'
                                  ? getFeynmanColorByProgress(method.progreso)
                                  : getMethodType(method.nombreMetodo) === 'cornell'
                                  ? getCornellColorByProgress(method.progreso)
                                  : getMethodType(method.nombreMetodo) === 'pomodoro'
                                  ? getPomodoroColorByProgress(method.progreso)
                                  : (isCompleted ? '#22C55E' : '#FACC15') // Green for completed, Yellow for in progress
                              }}
                            />
                          </div>
                        </div>

                        {/* Etiqueta de estado */}
                        <div className="mb-2">
                          <span className="text-xs text-gray-400 font-medium">
                            {getMethodType(method.nombreMetodo) === 'mindmaps'
                              ? getMindMapsLabelByProgress(method.progreso)
                              : getMethodType(method.nombreMetodo) === 'spacedrepetition'
                              ? getSpacedRepetitionLabelByProgress(method.progreso)
                              : getMethodType(method.nombreMetodo) === 'activerecall'
                              ? getActiveRecallLabelByProgress(method.progreso)
                              : getMethodType(method.nombreMetodo) === 'feynman'
                              ? getFeynmanLabelByProgress(method.progreso)
                              : getMethodType(method.nombreMetodo) === 'cornell'
                              ? getCornellLabelByProgress(method.progreso)
                              : (isCompleted ? 'Terminado' : 'En proceso')}
                          </span>
                        </div>

                        {/* Pie de página */}
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-400 font-medium">
                            ID: {method.idReporte}
                          </span>
                          <div className="flex items-center gap-1.25">
                            {!isCompleted && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteReport(method.idReporte);
                                }}
                                className="p-2 bg-red-500/20 backdrop-blur-sm rounded-full text-red-400 hover:bg-red-500/80 hover:text-white transition-all duration-200 cursor-pointer"
                                title="Eliminar reporte"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (isCompleted) {
                                  deleteReport(method.idReporte);
                                } else {
                                  const methodType = getMethodType({ nombre: method.nombreMetodo });

                                  // Store fallback data in localStorage
                                  localStorage.setItem('resume-session-id', method.idReporte.toString());
                                  localStorage.setItem('resume-progress', method.progreso.toString());
                                  localStorage.setItem('resume-method-type', methodType);

                                  if (methodType === 'mindmaps') {
                                    navigate(`/mind-maps/steps/${method.idMetodo}?progreso=${method.progreso}&sessionId=${method.idReporte}`);
                                  } else if (methodType === 'spacedrepetition') {
                                    navigate(`/spaced-repetition/steps/${method.idMetodo}?progreso=${method.progreso}&sessionId=${method.idReporte}`);
                                  } else if (methodType === 'activerecall') {
                                    navigate(`/active-recall/steps/${method.idMetodo}?progreso=${method.progreso}&sessionId=${method.idReporte}`);
                                  } else if (methodType === 'feynman') {
                                    navigate(`/feynman/steps/${method.idMetodo}?progreso=${method.progreso}&sessionId=${method.idReporte}`);
                                  } else if (methodType === 'cornell') {
                                    navigate(`/cornell/steps/${method.idMetodo}?progreso=${method.progreso}&sessionId=${method.idReporte}`);
                                  } else {
                                    navigate(`/pomodoro/execute/${method.idMetodo || 1}?progreso=${method.progreso}&sessionId=${method.idReporte}`);
                                  }

                                  // Show success alert for method resumption
                                  setTimeout(() => {
                                    import('sweetalert2').then(Swal => {
                                      Swal.default.fire({
                                        toast: true,
                                        position: 'top-end',
                                        icon: 'success',
                                        title: `Sesión de ${method.nombreMetodo} retomada correctamente`,
                                        showConfirmButton: false,
                                        timer: 3000,
                                        background: '#232323',
                                        color: '#ffffff',
                                        iconColor: '#22C55E',
                                      });
                                    });
                                  }, 100);
                                }
                              }}
                              className={
                                isCompleted
                                  ? 'p-2 bg-red-500/20 backdrop-blur-sm rounded-full text-red-400 hover:bg-red-500/80 hover:text-white transition-all duration-200 cursor-pointer'
                                  : 'px-3 py-1.5 rounded-lg font-medium text-white text-xs transition-all duration-200 hover:scale-105 cursor-pointer'
                              }
                              style={
                                isCompleted
                                  ? {}
                                  : {
                                      background: `linear-gradient(135deg, ${methodColor} 0%, ${methodColor}dd 100%)`,
                                      boxShadow: `0 2px 8px ${methodColor}40`,
                                    }
                              }
                              title={isCompleted ? "Eliminar reporte" : ""}
                            >
                              {isCompleted ? (
                                <TrashIcon className="w-4 h-4" />
                              ) : (
                                'Continuar'
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                );
              })}
              {(!filteredMethods || filteredMethods.length === 0) && (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-400 text-lg">No hay métodos de estudio registrados.</p>
                </div>
              )}
            </>
          )}

          {activeTab === 'sessions' && (
            <>
              {filteredSessions.map((session) => (
                <div
                  key={`session-${session.idReporte}`}
                  onClick={() => {
                    // Show description in a modal when card is clicked
                    if (session.descripcion) {
                      Swal.fire({
                        title: session.nombreSesion,
                        text: session.descripcion,
                        confirmButtonColor: '#22C55E',
                        background: '#232323',
                        color: '#ffffff',
                      });
                    } else {
                      Swal.fire({
                        title: session.nombreSesion,
                        text: 'Esta sesión no tiene descripción.',
                        confirmButtonColor: '#22C55E',
                        background: '#232323',
                        color: '#ffffff',
                      });
                    }
                  }}
                  className="bg-[#232323]/70 backdrop-blur-md rounded-xl shadow-lg border border-[#333]/50 overflow-hidden hover:shadow-xl hover:border-[#444]/70 transition-all duration-200 p-5 cursor-pointer"
                >
                  {/* Header with title and action buttons */}
                  <div className={`flex items-start justify-between ${(session.metodoAsociado || session.albumAsociado) ? 'mb-3' : 'mb-6'}`}>
                    <h3 className="text-xl font-semibold text-white leading-tight pr-3 flex-1">
                      {session.nombreSesion}
                    </h3>
                    <div className="flex items-center gap-2">
                      {session.estado === 'pendiente' && (
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();

                            try {
                              console.log('[RESUME] Starting session resume for session:', session.idSesion);
                              console.log('[RESUME] Session report data:', session);

                              // Load the session data from backend
                              const sessionDto = await sessionService.getSession(session.idSesion.toString());
                              console.log('[RESUME] Session DTO from backend:', sessionDto);

                              const activeSession = mapServerSession(sessionDto);
                              console.log('[RESUME] Mapped active session:', activeSession);

                              // Store session data in localStorage so provider can pick it up
                              const sessionToStore = {
                                ...activeSession,
                                persistedAt: new Date().toISOString(),
                              };
                              localStorage.setItem('focusup:activeSession', JSON.stringify(sessionToStore));
                              localStorage.setItem('focusup:directResume', 'true');

                              console.log('[RESUME] Stored session in localStorage');

                              // Trigger direct resume in provider and wait for it to complete
                              await new Promise(resolve => {
                                checkDirectResume();
                                // Give provider time to process the direct resume
                                setTimeout(resolve, 100);
                              });

                              console.log('[RESUME] Direct resume triggered');

                              // Handle method execution if session has a method
                              if (session.metodoAsociado) {
                                console.log('[RESUME] Session has method:', session.metodoAsociado);

                                // Get method type and progress
                                const methodTypeInput = { nombre_metodo: session.metodoAsociado.nombreMetodo };
                                console.log('[RESUME] getMethodType input:', methodTypeInput);

                                const methodType = getMethodType(methodTypeInput);
                                console.log('[RESUME] Detected method type:', methodType);

                                const relatedMethodReports = methodReports
                                  .filter(m => m.idMetodo === session.metodoAsociado!.idMetodo)
                                  .sort((a, b) => {
                                    const aTime = new Date(a.fechaCreacion).getTime();
                                    const bTime = new Date(b.fechaCreacion).getTime();
                                    return bTime - aTime;
                                  });
                                const methodReport = relatedMethodReports[0];
                                const progress = methodReport ? methodReport.progreso : 0;
                                console.log('[RESUME] Method report and progress:', methodReport, progress);
                                const resumeMethod = shouldResumeMethodExecution(methodReport);
                                console.log('[RESUME] Should resume method execution:', resumeMethod);

                                // Navigate to method steps only when method is still pending.
                                if (resumeMethod) {
                                  if (methodType === 'mindmaps') {
                                    console.log('[RESUME] Navigating to mindmaps');
                                    navigate(`/mind-maps/steps/${session.metodoAsociado.idMetodo}?progreso=${progress}&sessionId=${session.idSesion}`);
                                  } else if (methodType === 'spacedrepetition') {
                                    console.log('[RESUME] Navigating to spacedrepetition');
                                    navigate(`/spaced-repetition/steps/${session.metodoAsociado.idMetodo}?progreso=${progress}&sessionId=${session.idSesion}`);
                                  } else if (methodType === 'activerecall') {
                                    console.log('[RESUME] Navigating to activerecall');
                                    navigate(`/active-recall/steps/${session.metodoAsociado.idMetodo}?progreso=${progress}&sessionId=${session.idSesion}`);
                                  } else if (methodType === 'feynman') {
                                    console.log('[RESUME] Navigating to feynman');
                                    navigate(`/feynman/steps/${session.metodoAsociado.idMetodo}?progreso=${progress}&sessionId=${session.idSesion}`);
                                  } else if (methodType === 'cornell') {
                                    console.log('[RESUME] Navigating to cornell');
                                    navigate(`/cornell/steps/${session.metodoAsociado.idMetodo}?progreso=${progress}&sessionId=${session.idSesion}`);
                                  } else if (methodType === 'pomodoro') {
                                    console.log('[RESUME] Navigating to pomodoro');
                                    navigate(`/pomodoro/execute/${session.metodoAsociado.idMetodo || 1}?progreso=${progress}&sessionId=${session.idSesion}`);
                                  } else {
                                    console.error('[RESUME] Unknown method type:', methodType, 'for method:', session.metodoAsociado.nombreMetodo);
                                    navigate(`/pomodoro/execute/${session.metodoAsociado.idMetodo || 1}?progreso=${progress}&sessionId=${session.idSesion}`);
                                  }
                                }

                                // Show success alert for method session
                                setTimeout(() => {
                                  import('sweetalert2').then(Swal => {
                                    Swal.default.fire({
                                      toast: true,
                                      position: 'top-end',
                                      icon: 'success',
                                      title: resumeMethod
                                        ? `Sesión de ${session.metodoAsociado!.nombreMetodo} retomada correctamente`
                                        : `Sesión retomada. El método ${session.metodoAsociado!.nombreMetodo} ya estaba finalizado`,
                                      showConfirmButton: false,
                                      timer: 3000,
                                      background: '#232323',
                                      color: '#ffffff',
                                      iconColor: '#22C55E',
                                    });
                                  });
                                }, 100);
                              } else {
                                console.log('[RESUME] Session without method');

                                // Show success alert for timer-only session
                                setTimeout(() => {
                                  import('sweetalert2').then(Swal => {
                                    Swal.default.fire({
                                      toast: true,
                                      position: 'top-end',
                                      icon: 'success',
                                      title: 'Sesión de concentración retomada correctamente',
                                      showConfirmButton: false,
                                      timer: 3000,
                                      background: '#232323',
                                      color: '#ffffff',
                                      iconColor: '#22C55E',
                                    });
                                  });
                                }, 100);
                              }

                              // Handle music restoration for ALL sessions that have albums (regardless of method)
                              // Use setTimeout to ensure session is restored first
                              if (session.albumAsociado) {
                                console.log('[RESUME] Session has album, scheduling music loading:', session.albumAsociado);

                                setTimeout(async () => {
                                  try {
                                    console.log('[RESUME] Loading songs for album:', session.albumAsociado!.idAlbum);

                                    // Cargar canciones del álbum específico desde la API
                                    const albumSongs = await getSongsByAlbumId(session.albumAsociado!.idAlbum);
                                    console.log('[RESUME] Loaded album songs:', albumSongs.length, 'songs');

                                    if (albumSongs.length === 0) {
                                      console.warn(`[RESUME] El álbum ${session.albumAsociado!.nombreAlbum} no tiene canciones disponibles`);
                                    } else {
                                      // Usar función pura para iniciar reproducción del álbum
                                      console.log('[RESUME] Starting music playback for album:', session.albumAsociado!.nombreAlbum);
                                      await replaceIfSessionAlbum(
                                        {
                                          playPlaylist,
                                          currentAlbum: currentAlbum, // Álbum actualmente reproduciendo
                                          isPlaying: isPlaying,       // Estado de reproducción actual
                                          togglePlayPause: () => {}, // No usado en este contexto
                                        },
                                        session.albumAsociado!.idAlbum,
                                        albumSongs, // Ahora pasamos directamente las canciones del álbum
                                        {
                                          id_album: session.albumAsociado!.idAlbum,
                                          nombre_album: session.albumAsociado!.nombreAlbum
                                        }
                                      );

                                      console.log(`[RESUME] Música del álbum ${session.albumAsociado!.nombreAlbum} restaurada correctamente`);
                                    }
                                  } catch (musicError) {
                                    console.error('[RESUME] Error restaurando música del álbum:', musicError);
                                  }
                                }, 200); // Small delay to ensure session is restored
                              } else {
                                console.log('[RESUME] Session has no album');
                              }
                            } catch (error) {
                              console.error('Error resuming session:', error);
                              import('sweetalert2').then(Swal => {
                                Swal.default.fire({
                                  toast: true,
                                  position: 'top-end',
                                  icon: 'error',
                                  title: 'Error al retomar la sesión',
                                  showConfirmButton: false,
                                  timer: 3000,
                                  background: '#232323',
                                  color: '#ffffff',
                                  iconColor: '#EF4444',
                                });
                              });
                            }
                          }}
                          className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-sm font-medium rounded-lg shadow-lg hover:shadow-blue-500/25 transition-all duration-200 cursor-pointer"
                          title="Continuar sesión"
                        >
                          Continuar
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteReport(session.idReporte);
                        }}
                        className="p-2 text-gray-400 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10 flex-shrink-0 cursor-pointer"
                        title="Eliminar reporte"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Method and associated album tags - only show if they exist */}
                  {(session.metodoAsociado || session.albumAsociado) && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {session.metodoAsociado && (
                        <div
                          className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: `${LOCAL_METHOD_ASSETS[session.metodoAsociado.nombreMetodo]?.color}` || '#6366f180',
                            color: '#000000',
                          }}
                        >
                          <BookOpenIcon className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{session.metodoAsociado.nombreMetodo}</span>
                        </div>
                      )}

                      {session.albumAsociado && (
                        <div
                          className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: '#7f22fe', // Purple color for albums with transparency
                            color: '#000000', // Darker text color for contrast
                          }}
                        >
                          <MusicalNoteIcon className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{session.albumAsociado.nombreAlbum}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Footer with time and status */}
                  <div className={`flex items-center justify-between ${!(session.metodoAsociado || session.albumAsociado) ? 'pt-2 border-t border-[#333]/30' : ''}`}>
                    <div className="flex items-center gap-2">
                      <ClockIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-300 font-medium">
                        {formatDurationFromMs(normalizeDurationToMs(session.tiempoTotal))}
                      </span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      session.estado === 'completado'
                        ? 'bg-green-600 text-white'
                        : 'bg-yellow-600 text-white'
                    }`}>
                      {session.estado === 'completado' ? 'Completada' : 'Pendiente'}
                    </span>
                  </div>
                </div>
              ))}
              {(!filteredSessions || filteredSessions.length === 0) && (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-400 text-lg">No hay sesiones de concentración registradas.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal de estadísticas */}
      {showStatsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-4xl bg-[#232323]/95 backdrop-blur-md rounded-2xl shadow-2xl border border-[#333]/50 overflow-hidden max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b border-[#333]/50">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">
                  {statsModalType === 'methods' ? 'Estadísticas de Métodos de Estudio' : 'Estadísticas de Sesiones de Concentración'}
                </h2>
                <button
                  onClick={closeStatsModal}
                  className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10 cursor-pointer"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {statsModalType === 'methods' && (
                <div className="space-y-6">
                  {/* Method Statistics */}
                  {(() => {
                    const totalMethods = methodReports.length;
                    const completedMethods = methodReports.filter(m => m.estado === 'completed' || m.progreso === 100).length;
                    const inProgressMethods = methodReports.filter(m => m.estado !== 'completed' && m.progreso < 100).length;
                    const averageProgress = totalMethods > 0 ? Math.round(methodReports.reduce((sum, m) => sum + m.progreso, 0) / totalMethods) : 0;
                    const methodTypes = [...new Set(methodReports.map(m => m.nombreMetodo))];

                    return (
                      <>
                        {/* Overview Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-[#1a1a1a]/50 rounded-lg p-4 text-center">
                            <div className="text-3xl font-bold text-white">{totalMethods}</div>
                            <div className="text-sm text-gray-400">Total de Métodos</div>
                          </div>
                          <div className="bg-[#1a1a1a]/50 rounded-lg p-4 text-center">
                            <div className="text-3xl font-bold text-green-400">{completedMethods}</div>
                            <div className="text-sm text-gray-400">Completados</div>
                          </div>
                          <div className="bg-[#1a1a1a]/50 rounded-lg p-4 text-center">
                            <div className="text-3xl font-bold text-yellow-400">{inProgressMethods}</div>
                            <div className="text-sm text-gray-400">En Progreso</div>
                          </div>
                          <div className="bg-[#1a1a1a]/50 rounded-lg p-4 text-center">
                            <div className="text-3xl font-bold text-blue-400">{averageProgress}%</div>
                            <div className="text-sm text-gray-400">Progreso Promedio</div>
                          </div>
                        </div>

                        {/* Method Types Breakdown */}
                        <div>
                          <h3 className="text-xl font-semibold text-white mb-4">Tipos de Métodos</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {methodTypes.map(methodType => {
                              const count = methodReports.filter(m => m.nombreMetodo === methodType).length;
                              const completed = methodReports.filter(m => m.nombreMetodo === methodType && (m.estado === 'completed' || m.progreso === 100)).length;
                              return (
                                <div key={methodType} className="bg-[#1a1a1a]/50 rounded-lg p-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-white font-medium">{methodType}</span>
                                    <span className="text-gray-400 text-sm">{count} total</span>
                                  </div>
                                  <div className="flex items-center gap-4 text-sm">
                                    <span className="text-green-400">✓ {completed} completados</span>
                                    <span className="text-yellow-400">⏳ {count - completed} pendientes</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Progress Distribution */}
                        <div>
                          <h3 className="text-xl font-semibold text-white mb-4">Distribución de Progreso</h3>
                          <div className="space-y-3">
                            {[
                              { range: '0-25%', methods: methodReports.filter(m => m.progreso >= 0 && m.progreso <= 25).length },
                              { range: '26-50%', methods: methodReports.filter(m => m.progreso >= 26 && m.progreso <= 50).length },
                              { range: '51-75%', methods: methodReports.filter(m => m.progreso >= 51 && m.progreso <= 75).length },
                              { range: '76-99%', methods: methodReports.filter(m => m.progreso >= 76 && m.progreso <= 99).length },
                              { range: '100%', methods: methodReports.filter(m => m.progreso === 100).length },
                            ].map(({ range, methods }) => (
                              <div key={range} className="flex items-center gap-4">
                                <span className="text-gray-400 w-16">{range}</span>
                                <div className="flex-1 bg-gray-700 rounded-full h-2">
                                  <div
                                    className="bg-blue-500 h-2 rounded-full"
                                    style={{ width: `${totalMethods > 0 ? (methods / totalMethods) * 100 : 0}%` }}
                                  />
                                </div>
                                <span className="text-white w-8 text-right">{methods}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}

              {statsModalType === 'sessions' && (
                <div className="space-y-6">
                  {/* Session Statistics */}
                  {(() => {
                    // CORRECCIÓN:
                    // El modal debe usar el mismo dataset que ve el usuario en la grilla (filtrado + sin duplicados).
                    // Antes usaba `sessionReports` crudo, generando discrepancias en estadísticas.
                    const statsSessions = filteredSessions;
                    const totalSessions = statsSessions.length;
                    const completedSessions = statsSessions.filter(s => s.estado === 'completado').length;
                    const pendingSessions = statsSessions.filter(s => s.estado === 'pendiente').length;
                    const sessionDurationsMs = statsSessions.map(s => normalizeDurationToMs(s.tiempoTotal));
                    const totalDurationMs = sessionDurationsMs.reduce((sum, duration) => sum + duration, 0);

                    // CORRECCIÓN:
                    // Antes se mezclaban conversiones al mostrar/operar tiempos.
                    // Ahora todos los cálculos parten de milisegundos y luego se convierten explícitamente.
                    const totalHours = totalDurationMs / (1000 * 3600);

                    // CORRECCIÓN:
                    // Promedio correcto = duración total / cantidad total de sesiones (en ms).
                    const averageSessionDurationMs = totalSessions > 0
                      ? totalDurationMs / totalSessions
                      : 0;

                    // CORRECCIÓN:
                    // Máximo y mínimo se calculan sobre duraciones reales.
                    // Para mínima se excluyen ceros para evitar que una sesión vacía "gane" como más corta.
                    const longestSessionMs = sessionDurationsMs.length > 0
                      ? Math.max(...sessionDurationsMs)
                      : 0;
                    const nonZeroSessionDurations = sessionDurationsMs.filter(duration => duration > 0);
                    const shortestSessionMs = nonZeroSessionDurations.length > 0
                      ? Math.min(...nonZeroSessionDurations)
                      : 0;
                    const sessionsWithMethods = statsSessions.filter(s => s.metodoAsociado).length;
                    const sessionsWithMusic = statsSessions.filter(s => s.albumAsociado).length;

                    // CORRECCIÓN:
                    // "Sin elementos" no se debe calcular por resta, porque una sesión puede tener método y música
                    // al mismo tiempo y eso duplicaba el descuento (resultado negativo).
                    const sessionsWithoutElements = statsSessions.filter(
                      s => !s.metodoAsociado && !s.albumAsociado
                    ).length;

                    return (
                      <>
                        {/* Overview Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-[#1a1a1a]/50 rounded-lg p-4 text-center">
                            <div className="text-3xl font-bold text-white">{totalSessions}</div>
                            <div className="text-sm text-gray-400">Total de Sesiones</div>
                          </div>
                          <div className="bg-[#1a1a1a]/50 rounded-lg p-4 text-center">
                            <div className="text-3xl font-bold text-green-400">{completedSessions}</div>
                            <div className="text-sm text-gray-400">Completadas</div>
                          </div>
                          <div className="bg-[#1a1a1a]/50 rounded-lg p-4 text-center">
                            <div className="text-3xl font-bold text-yellow-400">{pendingSessions}</div>
                            <div className="text-sm text-gray-400">Pendientes</div>
                          </div>
                          <div className="bg-[#1a1a1a]/50 rounded-lg p-4 text-center">
                            <div className="text-3xl font-bold text-blue-400">{totalHours.toFixed(1)}h</div>
                            <div className="text-sm text-gray-400">Horas Totales</div>
                          </div>
                        </div>

                        {/* Time Statistics */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h3 className="text-xl font-semibold text-white mb-4">Estadísticas de Tiempo</h3>
                            <div className="space-y-3">
                              <div className="flex justify-between">
                                <span className="text-gray-400">Tiempo Promedio por Sesión:</span>
                                <span className="text-white">{formatDurationFromMs(averageSessionDurationMs)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Sesión Más Larga:</span>
                                <span className="text-white">
                                  {formatDurationFromMs(longestSessionMs)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Sesión Más Corta:</span>
                                <span className="text-white">
                                  {formatDurationFromMs(shortestSessionMs)}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h3 className="text-xl font-semibold text-white mb-4">Elementos Asociados</h3>
                            <div className="space-y-3">
                              <div className="flex justify-between">
                                <span className="text-gray-400">Sesiones con Método:</span>
                                <span className="text-blue-400">{sessionsWithMethods} ({totalSessions > 0 ? Math.round((sessionsWithMethods / totalSessions) * 100) : 0}%)</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Sesiones con Música:</span>
                                <span className="text-purple-400">{sessionsWithMusic} ({totalSessions > 0 ? Math.round((sessionsWithMusic / totalSessions) * 100) : 0}%)</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Sesiones Sin Elementos:</span>
                                <span className="text-gray-400">{sessionsWithoutElements}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Completion Rate Over Time */}
                        <div>
                          <h3 className="text-xl font-semibold text-white mb-4">Tasa de Finalización</h3>
                          <div className="bg-[#1a1a1a]/50 rounded-lg p-4">
                            <div className="flex items-center justify-center">
                              <div className="text-center">
                                <div className="text-4xl font-bold text-green-400 mb-2">
                                  {totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0}%
                                </div>
                                <div className="text-gray-400">de sesiones completadas</div>
                              </div>
                            </div>
                            <div className="mt-4 flex justify-center gap-8">
                              <div className="text-center">
                                <div className="text-2xl font-bold text-green-400">{completedSessions}</div>
                                <div className="text-sm text-gray-400">Completadas</div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-yellow-400">{pendingSessions}</div>
                                <div className="text-sm text-gray-400">Pendientes</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default ReportsPage;

