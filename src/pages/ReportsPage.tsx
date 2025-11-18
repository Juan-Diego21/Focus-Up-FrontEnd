/**
 * Componente principal que muestra los reportes de sesiones de estudio
 * Permite visualizar métodos completados y sesiones de concentración
 * Incluye filtros y opciones para reanudar métodos no terminados
 */
import React, { useState, useEffect, useCallback } from "react";
import { apiClient } from "../utils/apiClient";
import { API_ENDPOINTS } from "../utils/constants";
import { Sidebar } from "../components/ui/Sidebar";
import { PageLayout } from "../components/ui/PageLayout";
import { useAuth } from "../contexts/AuthContext";
import Swal from 'sweetalert2';
import {
  TrashIcon,
  ExclamationTriangleIcon,
  MusicalNoteIcon,
  CheckIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { LOCAL_METHOD_ASSETS } from '../utils/methodAssets';
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
  getMethodType,
  isValidProgressForResume
} from '../utils/methodStatus';

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

// Interfaz para los reportes de la API
interface ApiReport {
  id_reporte: number;
  id_usuario: number;
  nombre_metodo: string;
  progreso: number;
  estado: string;
  fecha_creacion: string;
}

// Interfaz para los reportes de métodos de estudio
interface StudyMethodReport {
  id: number;
  metodo: {
    id: number;
    nombre: string;
    descripcion: string;
    color: string;
    imagen: string;
  };
  progreso: number;
  estado: string;
  fechaInicio: string | null;
  fechaFin: string | null;
  fechaCreacion: string;
}

// Interfaz para las sesiones de concentración
interface ConcentrationSession {
  id: number;
  musica: {
    id: number;
    nombre: string;
    artista: string;
    genero: string;
  };
  estado: string;
  fechaProgramada: string;
  fechaCreacion: string;
}

// Interfaz para los beneficios de los métodos de estudio
interface StudyMethodBenefit {
  id_beneficio: number;
  descripcion_beneficio: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

// Interfaz para los métodos de estudio desde la API
interface StudyMethod {
  id_metodo: number;
  nombre_metodo: string;
  descripcion: string;
  url_imagen: string;
  color_hexa: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
  beneficios: StudyMethodBenefit[];
}

// Interfaz para los datos de reportes
interface ReportsData {
  metodos: StudyMethodReport[];
  sesiones: ConcentrationSession[];
}

/**
 * Componente que muestra los reportes de progreso del usuario
 * Incluye métodos de estudio completados y sesiones de concentración
 */
export const ReportsPage: React.FC = () => {
  // Hook de autenticación para acceder a la información del usuario actual
  const { user } = useAuth();

  // Estado para almacenar todos los datos de reportes obtenidos del backend
  const [reportsData, setReportsData] = useState<ReportsData>({ metodos: [], sesiones: [] });
  // Estado de carga mientras se obtienen datos del servidor
  const [loading, setLoading] = useState(true);
  // Estado para manejar errores de carga o API
  const [error, setError] = useState<string>("");
  // Estado para controlar qué pestaña está activa (métodos o sesiones)
  const [activeTab, setActiveTab] = useState<'methods' | 'sessions'>('methods');
  // Estado para el filtro de estado de los métodos (todos, pendiente, terminado)
  const [statusFilter, setStatusFilter] = useState<'todos' | 'pendiente' | 'terminado'>('todos');
  // Estado para controlar la carga de imágenes de métodos
  const [imageLoaded, setImageLoaded] = useState(false);

  // Estado para almacenar los métodos de estudio con sus imágenes y colores
  const [studyMethods, setStudyMethods] = useState<StudyMethod[]>([]);
  const [studyMethodsLoaded, setStudyMethodsLoaded] = useState(false);

  /**
   * Obtiene la lista de métodos de estudio disponibles desde el backend
   * Se ejecuta una vez al montar el componente y actualiza la lista de métodos
   */
  const fetchStudyMethods = useCallback(async () => {
    try {
      console.log('Obteniendo métodos de estudio...');
      const response = await apiClient.get(API_ENDPOINTS.STUDY_METHODS);
      console.log('Respuesta completa de métodos de estudio:', response);
      console.log('Tipo de respuesta:', typeof response);
      console.log('Keys de respuesta:', Object.keys(response));

      // La respuesta ya viene procesada por el interceptor de axios
      // response.data ya es el objeto {success, message, data}
      console.log('Contenido de response.data:', response.data);

      // Verificar diferentes estructuras posibles de respuesta
      let methodsData = null;

      if (response.data?.data && Array.isArray(response.data.data)) {
        // Estructura: {success: true, data: [...]}
        methodsData = response.data.data;
        console.log('Encontrados métodos usando response.data.data:', methodsData.length);
      } else if (response.data && Array.isArray(response.data)) {
        // Estructura: [...] (array directo)
        methodsData = response.data;
        console.log('Encontrados métodos usando response.data directo:', methodsData.length);
      }

      if (methodsData && methodsData.length > 0) {
        setStudyMethods(methodsData);
        console.log('Métodos de estudio cargados exitosamente:', methodsData.length);
      } else {
        console.warn('No se encontraron métodos de estudio en la respuesta. Estructura de respuesta:', response.data);
        // Usar datos mock con activos locales si no hay datos reales
        console.log('Usando datos mock para métodos de estudio con activos locales');
        const mockMethods = Object.entries(LOCAL_METHOD_ASSETS).map(([name, assets], index) => ({
          id_metodo: index + 1,
          nombre_metodo: name,
          descripcion: `Descripción del ${name}`,
          url_imagen: assets.image,
          color_hexa: assets.color,
          fecha_creacion: new Date().toISOString(),
          fecha_actualizacion: new Date().toISOString(),
          beneficios: []
        }));

        setStudyMethods(mockMethods);
      }
    } catch (error) {
      console.error('Error al obtener métodos de estudio:', error);
      // En desarrollo, usar datos mock si la API no está disponible
      console.log('Usando datos mock para métodos de estudio por error');
      const mockMethods = Object.entries(LOCAL_METHOD_ASSETS).slice(0, 2).map(([name, assets], index) => ({
        id_metodo: index + 1,
        nombre_metodo: name,
        descripcion: `Descripción del ${name}`,
        url_imagen: assets.image,
        color_hexa: assets.color,
        fecha_creacion: new Date().toISOString(),
        fecha_actualizacion: new Date().toISOString(),
        beneficios: []
      }));

      setStudyMethods(mockMethods);
    } finally {
      setStudyMethodsLoaded(true);
    }
  }, []);

  /**
   * Obtiene los reportes de progreso del usuario desde el backend
   * Convierte los datos del API al formato esperado por el componente
   */
  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      if (!user?.id_usuario) {
        setError("Usuario no autenticado");
        return;
      }

      console.log('Obteniendo reportes para el usuario:', user);
      console.log('ID del usuario:', user?.id_usuario);
      console.log('Token del usuario existe:', !!localStorage.getItem('token'));

      const apiUrl = `${API_ENDPOINTS.REPORTS}?userId=${user.id_usuario}`;
      console.log('URL de la API:', apiUrl);

      const response = await apiClient.get(apiUrl);
      console.log('Estado de respuesta de la API:', response.status);
      console.log('Respuesta de la API:', response);
      console.log('Datos de respuesta:', response.data);

      // Parsear la respuesta de la API - devuelve un array de reportes
      let reportsData: ReportsData = { metodos: [], sesiones: [] };

      try {
        if (response.data?.data && Array.isArray(response.data.data)) {
          // La API devuelve: { success: true, data: [reports...] }
          const reports: ApiReport[] = response.data.data;

          // Convertir reportes de la API a nuestro formato esperado con datos reales del método
          reportsData.metodos = reports.map(report => {
            // Encontrar los datos correspondientes del método
            const methodData = studyMethods.find(method => method.nombre_metodo === report.nombre_metodo);

            // Usar únicamente activos locales
            const localAssets = LOCAL_METHOD_ASSETS[report.nombre_metodo];
            return {
              id: report.id_reporte,
              metodo: {
                id: methodData?.id_metodo || 1,
                nombre: report.nombre_metodo,
                descripcion: methodData?.descripcion || '',
                color: localAssets?.color || '#6366f1',
                imagen: localAssets?.image || ''
              },
              progreso: report.progreso,
              estado: report.estado === 'completado' ? 'completed' : 'in_process',
              fechaInicio: null,
              fechaFin: report.estado === 'completed' ? report.fecha_creacion : null,
              fechaCreacion: report.fecha_creacion
            };
          });

          reportsData.sesiones = [];
        } else if (Array.isArray(response.data)) {
          // La API devuelve: [reports...] directamente
          const reports: ApiReport[] = response.data;

          if (reports.length > 0) {
            // Convertir reportes de la API a nuestro formato esperado con datos reales del método
            reportsData.metodos = reports.map(report => {
              // Encontrar los datos correspondientes del método
              const methodData = studyMethods.find(method => method.nombre_metodo === report.nombre_metodo);

              // Usar únicamente activos locales
              const localAssets = LOCAL_METHOD_ASSETS[report.nombre_metodo];
              return {
                id: report.id_reporte,
                metodo: {
                  id: methodData?.id_metodo || 1,
                  nombre: report.nombre_metodo,
                  descripcion: methodData?.descripcion || '',
                  color: localAssets?.color || '#6366f1',
                  imagen: localAssets?.image || ''
                },
                progreso: report.progreso,
                estado: report.estado === 'completado' || report.estado === 'completed' ? 'completed' :
                       report.estado === 'almost_done' ? 'almost_done' : 'in_process',
                fechaInicio: null,
                fechaFin: report.estado === 'completed' ? report.fecha_creacion : null,
                fechaCreacion: report.fecha_creacion
              };
            });
          } else {
            // Array vacío - no hay reportes
            reportsData.metodos = [];
          }

          reportsData.sesiones = [];
        } else {
          console.warn('Formato de respuesta de API inesperado:', response.data);
          // Fallback: datos vacíos
          reportsData = { metodos: [], sesiones: [] };
        }

        console.log('Datos de reportes parseados:', reportsData);
        setReportsData(reportsData);
      } catch (parseError) {
        console.error('Error al parsear datos de reportes:', parseError);
        console.log('Datos de respuesta crudos:', response.data);
        setReportsData({ metodos: [], sesiones: [] });
      }
    } catch (err) {
      console.error("Error al obtener reportes:", err);
      // En desarrollo, usar datos mock si la API no está disponible
      console.log('Usando datos mock para reportes');
      setReportsData({
        metodos: [
          {
            id: 1,
            metodo: {
              id: 1,
              nombre: 'Método Pomodoro',
              descripcion: 'Técnica de gestión de tiempo',
              color: LOCAL_METHOD_ASSETS['Método Pomodoro'].color,
              imagen: LOCAL_METHOD_ASSETS['Método Pomodoro'].image
            },
            progreso: 100,
            estado: 'completed',
            fechaInicio: new Date().toISOString(),
            fechaFin: new Date().toISOString(),
            fechaCreacion: new Date().toISOString()
          },
          {
            id: 2,
            metodo: {
              id: 2,
              nombre: 'Mapas Mentales',
              descripcion: 'Organización visual de ideas',
              color: LOCAL_METHOD_ASSETS['Mapas Mentales'].color,
              imagen: LOCAL_METHOD_ASSETS['Mapas Mentales'].image
            },
            progreso: 50,
            estado: 'in_process',
            fechaInicio: new Date().toISOString(),
            fechaFin: null,
            fechaCreacion: new Date().toISOString()
          }
        ],
        sesiones: []
      });
      setError(""); // No mostrar error si tenemos datos mock
    } finally {
      setLoading(false);
    }
  }, [user, studyMethods]);

  // Obtener métodos de estudio al montar el componente
  useEffect(() => {
    fetchStudyMethods();
  }, [fetchStudyMethods]);

  // Obtener reportes cuando los métodos de estudio estén cargados
  useEffect(() => {
    if (studyMethodsLoaded) {
      console.log('Métodos de estudio cargados, obteniendo reportes...');
      fetchReports();
    }
  }, [fetchReports, studyMethodsLoaded]);


  // Timeout de seguridad para evitar loading infinito
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn('Timeout alcanzado, forzando fin de loading');
        setLoading(false);
        setError('Tiempo de espera agotado. Verifica tu conexión a internet.');
      }
    }, 15000); // 15 segundos timeout

    return () => clearTimeout(timeout);
  }, [loading]);


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
        fetchReports();
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

  // Escuchar eventos de actualización de reportes
  useEffect(() => {
    const handleRefreshReports = () => {
      fetchReports();
    };

    window.addEventListener('refreshReports', handleRefreshReports);
    return () => window.removeEventListener('refreshReports', handleRefreshReports);
  }, [fetchReports]);



  if (loading) {
    console.log('ReportsPage: Mostrando loading spinner');
    return (
      <div className="bg-gradient-to-br from-[#171717] via-[#1a1a1a] to-[#171717] min-h-screen flex items-center justify-center p-5">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Cargando reportes...</p>
        </div>
      </div>
    );
  }

  console.log('ReportsPage: Loading completado, mostrando contenido');

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
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all duration-200"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  try {
    // Filtrar métodos según el estado seleccionado por el usuario
    const filteredMethods = reportsData.metodos.filter(method => {
      if (statusFilter === 'todos') return true;
      if (statusFilter === 'pendiente') return method.estado === 'in_process' || method.estado === 'almost_done';
      if (statusFilter === 'terminado') return method.estado === 'completed';
      return true;
    });

    return (
      <PageLayout
        showSidebar={true}
        sidebar={<Sidebar currentPage="reports" />}
      >
        <div className="w-full max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-8 text-center">Reportes de Sesiones</h1>

            {/* Pestañas */}
            <div className="flex justify-center mb-8">
              <div className="bg-[#232323] p-1 rounded-2xl shadow-lg">
                <button
                  onClick={() => setActiveTab('methods')}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 cursor-pointer ${
                    activeTab === 'methods'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-[#2a2a2a]'
                  }`}
                >
                  Métodos de Estudio
                </button>
                <button
                  onClick={() => setActiveTab('sessions')}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 cursor-pointer ${
                    activeTab === 'sessions'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-[#2a2a2a]'
                  }`}
                >
                  Sesiones de Concentración
                </button>
              </div>
            </div>

            {/* Filtro de estado */}
            {activeTab === 'methods' && (
              <div className="flex justify-center mb-8">
                <div className="bg-[#232323] p-1 rounded-2xl shadow-lg">
                  <button
                    onClick={() => setStatusFilter('todos')}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 cursor-pointer ${
                      statusFilter === 'todos'
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white hover:bg-[#2a2a2a]'
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => setStatusFilter('pendiente')}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 cursor-pointer ${
                      statusFilter === 'pendiente'
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white hover:bg-[#2a2a2a]'
                    }`}
                  >
                    Pendiente
                  </button>
                  <button
                    onClick={() => setStatusFilter('terminado')}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 cursor-pointer ${
                      statusFilter === 'terminado'
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white hover:bg-[#2a2a2a]'
                    }`}
                  >
                    Terminado
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Contenido */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4 py-6">
            {activeTab === 'methods' && (
              <>
                {filteredMethods.map((method) => {
                  const methodColor = getMethodColor(method.metodo?.nombre || '');
                  const methodImage = getMethodImage(method.metodo?.nombre || '');
                  const isCompleted = method.estado === 'completed';
                  const methodType = getMethodType(method.metodo);

                  return (
                    <div
                      key={`method-${method.id}`}
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
                                alt={method.metodo?.nombre || 'Método de Estudio'}
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
                                {method.metodo?.nombre || 'Método de Estudio'}
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
                                  backgroundColor: getMethodType(method.metodo) === 'mindmaps'
                                    ? getMindMapsColorByProgress(method.progreso)
                                    : getMethodType(method.metodo) === 'spacedrepetition'
                                    ? getSpacedRepetitionColorByProgress(method.progreso)
                                    : getMethodType(method.metodo) === 'activerecall'
                                    ? getActiveRecallColorByProgress(method.progreso)
                                    : getMethodType(method.metodo) === 'feynman'
                                    ? getFeynmanColorByProgress(method.progreso)
                                    : getMethodType(method.metodo) === 'cornell'
                                    ? getCornellColorByProgress(method.progreso)
                                    : getMethodType(method.metodo) === 'pomodoro'
                                    ? getPomodoroColorByProgress(method.progreso)
                                    : (isCompleted ? '#22C55E' : '#FACC15') // Green for completed, Yellow for in progress
                                }}
                              />
                            </div>
                          </div>

                          {/* Etiqueta de estado */}
                          <div className="mb-2">
                            <span className="text-xs text-gray-400 font-medium">
                              {getMethodType(method.metodo) === 'mindmaps'
                                ? getMindMapsLabelByProgress(method.progreso)
                                : getMethodType(method.metodo) === 'spacedrepetition'
                                ? getSpacedRepetitionLabelByProgress(method.progreso)
                                : getMethodType(method.metodo) === 'activerecall'
                                ? getActiveRecallLabelByProgress(method.progreso)
                                : getMethodType(method.metodo) === 'feynman'
                                ? getFeynmanLabelByProgress(method.progreso)
                                : getMethodType(method.metodo) === 'cornell'
                                ? getCornellLabelByProgress(method.progreso)
                                : (isCompleted ? 'Terminado' : 'En proceso')}
                            </span>
                          </div>

                          {/* Pie de página */}
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400 font-medium">
                              ID: {method.id}
                            </span>
                            <div className="flex items-center gap-1.25">
                              {!isCompleted && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteReport(method.id);
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
                                    deleteReport(method.id);
                                  } else {
                                    const methodType = getMethodType(method.metodo);

                                    // Validar tipo de método y progreso antes de redirigir para reanudar
                                    if (methodType === 'unknown' || !isValidProgressForResume(method.progreso, methodType as 'mindmaps' | 'pomodoro')) {
                                      Swal.fire({
                                        title: 'Error',
                                        text: 'Valor de progreso inválido para reanudar sesión',
                                        icon: 'error',
                                        confirmButtonText: 'OK',
                                        confirmButtonColor: '#EF4444',
                                        background: '#232323',
                                        color: '#ffffff',
                                        iconColor: '#EF4444',
                                      });
                                      return;
                                    }

                                    // Store fallback data in localStorage
                                    localStorage.setItem('resume-session-id', method.id.toString());
                                    localStorage.setItem('resume-progress', method.progreso.toString());
                                    localStorage.setItem('resume-method-type', methodType);

                                    if (methodType === 'mindmaps') {
                                      // Pass sessionId and progress in URL
                                      window.location.href = `/mind-maps/steps/${method.metodo?.id}?progreso=${method.progreso}&sessionId=${method.id}`;
                                    } else if (methodType === 'spacedrepetition') {
                                      // Pass sessionId and progress in URL for Spaced Repetition
                                      window.location.href = `/spaced-repetition/steps/${method.metodo?.id}?progreso=${method.progreso}&sessionId=${method.id}`;
                                    } else if (methodType === 'activerecall') {
                                      // Pass sessionId and progress in URL for Active Recall
                                      window.location.href = `/active-recall/steps/${method.metodo?.id}?progreso=${method.progreso}&sessionId=${method.id}`;
                                    } else if (methodType === 'feynman') {
                                      // Pass sessionId and progress in URL for Feynman
                                      window.location.href = `/feynman/steps/${method.metodo?.id}?progreso=${method.progreso}&sessionId=${method.id}`;
                                    } else if (methodType === 'cornell') {
                                      // Pass sessionId and progress in URL for Cornell
                                      window.location.href = `/cornell/steps/${method.metodo?.id}?progreso=${method.progreso}&sessionId=${method.id}`;
                                    } else {
                                      // Pass sessionId and progress in URL for Pomodoro
                                      window.location.href = `/pomodoro/execute/${method.metodo?.id || 1}?progreso=${method.progreso}&sessionId=${method.id}`;
                                    }

                                    // Show success alert for method resumption
                                    setTimeout(() => {
                                      import('sweetalert2').then(Swal => {
                                        Swal.default.fire({
                                          toast: true,
                                          position: 'top-end',
                                          icon: 'success',
                                          title: `Sesión de ${method.metodo.nombre} retomada correctamente`,
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
                {reportsData?.sesiones?.map((session) => (
                  <div
                    key={`session-${session.id}`}
                    className="bg-[#232323] p-6 rounded-2xl shadow-lg border hover:scale-[1.02] transition-all duration-200 cursor-pointer"
                    style={{ borderColor: '#3B82F633' }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center border-2 border-blue-400">
                          <MusicalNoteIcon className="w-8 h-8 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-xl font-bold text-white truncate">{session.musica?.nombre || 'Sesión'}</h3>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteReport(session.id);
                            }}
                            className="p-2 text-gray-400 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
                            title="Eliminar reporte"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                        <p className="text-gray-400 mb-3 truncate">por {session.musica?.artista || 'Artista desconocido'}</p>
                        <div className="flex items-center justify-between text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            session.estado === 'completed'
                              ? 'bg-green-600 text-white'
                              : 'bg-yellow-600 text-white'
                          }`}>
                            {session.estado === 'completed' ? 'Completada' : 'Programada'}
                          </span>
                          <span className="text-gray-500">
                            {session.fechaCreacion ? new Date(session.fechaCreacion).toLocaleDateString() : 'Fecha desconocida'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {(!reportsData?.sesiones || reportsData.sesiones.length === 0) && (
                  <div className="col-span-full text-center py-12">
                    <p className="text-gray-400 text-lg">No hay sesiones de concentración registradas.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

      </PageLayout>
    );
  } catch (renderError) {
    console.error('Error rendering ReportsPage:', renderError);
    return (
      <div className="bg-gradient-to-br from-[#171717] via-[#1a1a1a] to-[#171717] min-h-screen flex items-center justify-center p-5">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">
            <ExclamationTriangleIcon className="w-16 h-16 mx-auto" />
          </div>
          <h2 className="text-white text-xl font-semibold mb-4">Error al cargar la página</h2>
          <p className="text-gray-400 mb-6">Ha ocurrido un error al renderizar los reportes.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all duration-200"
          >
            Recargar página
          </button>
        </div>
      </div>
    );
  }
};

export default ReportsPage;