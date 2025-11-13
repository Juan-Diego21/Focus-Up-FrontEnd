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

export const ReportsPage: React.FC = () => {
  // Hook de autenticación para obtener datos del usuario
  const { user } = useAuth();

  // Estados para manejar los datos de reportes
  const [reportsData, setReportsData] = useState<ReportsData>({ metodos: [], sesiones: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [activeTab, setActiveTab] = useState<'methods' | 'sessions'>('methods');

  // Estado para almacenar los métodos de estudio con sus imágenes y colores
  const [studyMethods, setStudyMethods] = useState<StudyMethod[]>([]);
  const [studyMethodsLoaded, setStudyMethodsLoaded] = useState(false);

  // Función para obtener los métodos de estudio desde la API
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

  // Función para obtener los reportes desde la API
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
                estado: report.estado === 'completado' ? 'completed' : 'in_process',
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

  // Función para eliminar un reporte
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
          <p className="text-gray-400 text-sm mt-2">
            studyMethodsLoaded: {studyMethodsLoaded ? 'true' : 'false'} |
            studyMethods: {studyMethods.length}
          </p>
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
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                    activeTab === 'methods'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-[#2a2a2a]'
                  }`}
                >
                  Métodos de Estudio
                </button>
                <button
                  onClick={() => setActiveTab('sessions')}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                    activeTab === 'sessions'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-[#2a2a2a]'
                  }`}
                >
                  Sesiones de Concentración
                </button>
              </div>
            </div>
          </div>

          {/* Contenido */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4 py-6">
            {activeTab === 'methods' && (
              <>
                {reportsData?.metodos?.map((method) => {
                  const methodColor = method.metodo?.color || '#6366f1';
                  const isCompleted = method.estado === 'completed';

                  return (
                    <div
                      key={`method-${method.id}`}
                      className="group relative bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl border border-white/20"
                      style={{
                        background: `linear-gradient(135deg, ${methodColor}08 0%, ${methodColor}05 100%)`,
                      }}
                    >
                      {/* Background Pattern */}
                      <div
                        className="absolute inset-0 opacity-5"
                        style={{
                          background: `radial-gradient(circle at 20% 80%, ${methodColor} 0%, transparent 50%), radial-gradient(circle at 80% 20%, ${methodColor} 0%, transparent 50%)`
                        }}
                      />

                      {/* Diseño compacto: Imagen + Contenido lado a lado */}
                      <div className="flex h-32">
                        {/* Sección de imagen */}
                        <div className="relative w-32 overflow-hidden flex-shrink-0">
                          {method.metodo?.imagen && (
                            <>
                              <img
                                src={method.metodo.imagen}
                                alt={method.metodo.nombre || 'Método de Estudio'}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                              />
                              {/* Color Overlay */}
                              <div
                                className="absolute inset-0 opacity-20 transition-opacity duration-300 group-hover:opacity-10"
                                style={{
                                  background: `linear-gradient(45deg, ${methodColor}60 0%, ${methodColor}20 100%)`
                                }}
                              />
                            </>
                          )}

                          {/* Insignia de estado - Compacta */}
                          <div className="absolute top-2 right-2">
                            <div
                              className={`px-2 py-0.5 rounded text-xs font-semibold text-white shadow flex items-center gap-1 ${
                                isCompleted
                                  ? 'bg-green-500 shadow-green-500/30'
                                  : 'bg-yellow-500 shadow-yellow-500/30'
                              }`}
                            >
                              {isCompleted ? (
                                <CheckIcon className="w-3 h-3" />
                              ) : (
                                <ClockIcon className="w-3 h-3" />
                              )}
                            </div>
                          </div>

                          {/* Botón de eliminar */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteReport(method.id);
                            }}
                            className="absolute top-2 left-2 p-1 bg-black/20 backdrop-blur-sm rounded-full text-white hover:bg-red-500/80 transition-all duration-200 opacity-0 group-hover:opacity-100"
                            title="Eliminar reporte"
                          >
                            <TrashIcon className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Sección de contenido - Compacta */}
                        <div className="flex-1 p-4 flex flex-col justify-between">
                          {/* Encabezado */}
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-2 h-2 rounded-full shadow-sm flex-shrink-0"
                                style={{ backgroundColor: methodColor }}
                              />
                              <h3 className="text-sm font-bold text-gray-900 leading-tight truncate">
                                {method.metodo?.nombre || 'Método de Estudio'}
                              </h3>
                            </div>
                            <span className="text-xs text-gray-500 font-medium">
                              {method.progreso || 0}%
                            </span>
                          </div>

                          {/* Barra de progreso - Compacta */}
                          <div className="mb-2">
                            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                              <div
                                className={`h-full rounded-full transition-all duration-1000 ease-out ${
                                  isCompleted ? 'bg-gradient-to-r from-green-400 to-green-500' : 'bg-gradient-to-r from-yellow-400 to-yellow-500'
                                }`}
                                style={{
                                  width: isCompleted ? '100%' : `${method.progreso || 0}%`,
                                }}
                              />
                            </div>
                          </div>

                          {/* Pie de página */}
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              ID: {method.id}
                            </span>
                            <button
                              onClick={() => {
                                window.location.href = `/pomodoro/execute/${method.metodo?.id || 1}`;
                              }}
                              className="px-3 py-1.5 rounded-lg font-medium text-white text-xs transition-all duration-200 hover:scale-105"
                              style={{
                                background: `linear-gradient(135deg, ${methodColor} 0%, ${methodColor}dd 100%)`,
                                boxShadow: `0 2px 8px ${methodColor}40`,
                              }}
                            >
                              {isCompleted ? 'Repetir' : 'Continuar'}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Efecto de borde al pasar el mouse */}
                      <div
                        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                        style={{
                          background: `linear-gradient(135deg, ${methodColor}20 0%, transparent 50%, ${methodColor}20 100%)`,
                          padding: '1px'
                        }}
                      >
                        <div className="w-full h-full bg-transparent rounded-2xl" />
                      </div>
                    </div>
                  );
                })}
                {(!reportsData?.metodos || reportsData.metodos.length === 0) && (
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