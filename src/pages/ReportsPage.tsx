import React, { useState, useEffect, useCallback } from "react";
import { apiClient } from "../utils/apiClient";
import { API_ENDPOINTS } from "../utils/constants";
import { Sidebar } from "../components/ui/Sidebar";
import { PageLayout } from "../components/ui/PageLayout";
import { useAuth } from "../contexts/AuthContext";
import Swal from 'sweetalert2';
import { TrashIcon } from '@heroicons/react/24/outline';

interface ApiReport {
  id_reporte: number;
  id_usuario: number;
  nombre_metodo: string;
  progreso: number;
  estado: string;
  fecha_creacion: string;
}

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

interface ReportsData {
  metodos: StudyMethodReport[];
  sesiones: ConcentrationSession[];
}

export const ReportsPage: React.FC = () => {
  const { user } = useAuth();
  const [reportsData, setReportsData] = useState<ReportsData>({ metodos: [], sesiones: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [activeTab, setActiveTab] = useState<'methods' | 'sessions'>('methods');

  // Fetch reports from API
  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      if (!user?.id_usuario) {
        setError("Usuario no autenticado");
        return;
      }

      console.log('Fetching reports for user:', user);
      console.log('User ID:', user?.id_usuario);
      console.log('User token exists:', !!localStorage.getItem('token'));

      if (!user?.id_usuario) {
        console.error('No user ID available');
        setError("Usuario no autenticado");
        return;
      }

      const apiUrl = `${API_ENDPOINTS.REPORTS}?userId=${user.id_usuario}`;
      console.log('API URL:', apiUrl);

      const response = await apiClient.get(apiUrl);
      console.log('API Response status:', response.status);
      console.log('API Response:', response);
      console.log('Response data:', response.data);
      console.log('Response data type:', typeof response.data);
      console.log('Response data keys:', response.data ? Object.keys(response.data) : 'No data');

      // Parse the API response - it returns an array of reports
      let reportsData: ReportsData = { metodos: [], sesiones: [] };

      try {
        if (response.data?.data && Array.isArray(response.data.data)) {
          // API returns: { success: true, data: [reports...] }
          const reports: ApiReport[] = response.data.data;

          // Convert API reports to our expected format
          reportsData.metodos = reports.map(report => ({
            id: report.id_reporte,
            metodo: {
              id: 1, // Default ID since API doesn't provide it
              nombre: report.nombre_metodo,
              descripcion: '', // API doesn't provide description
              color: '#ef4444', // Default color for Pomodoro
              imagen: '/img/Pomodoro.png' // Default image
            },
            progreso: report.progreso,
            estado: report.estado === 'completado' ? 'completed' : 'in_process',
            fechaInicio: null,
            fechaFin: report.estado === 'completed' ? report.fecha_creacion : null,
            fechaCreacion: report.fecha_creacion
          }));

          // For now, assume no concentration sessions
          reportsData.sesiones = [];
        } else if (Array.isArray(response.data)) {
          // API returns: [reports...] directly
          const reports: ApiReport[] = response.data;

          if (reports.length > 0) {
            // Convert API reports to our expected format
            reportsData.metodos = reports.map(report => ({
              id: report.id_reporte,
              metodo: {
                id: 1, // Default ID since API doesn't provide it
                nombre: report.nombre_metodo,
                descripcion: '', // API doesn't provide description
                color: '#ef4444', // Default color for Pomodoro
                imagen: '/img/Pomodoro.png' // Default image
              },
              progreso: report.progreso,
              estado: report.estado === 'completado' ? 'completed' : 'in_process',
              fechaInicio: null,
              fechaFin: report.estado === 'completed' ? report.fecha_creacion : null,
              fechaCreacion: report.fecha_creacion
            }));
          } else {
            // Empty array - no reports
            reportsData.metodos = [];
          }

          // For now, assume no concentration sessions
          reportsData.sesiones = [];
        } else {
          console.warn('Unexpected API response format:', response.data);
          // Fallback: create mock data to test UI
          console.log('Creating mock data for testing...');
          reportsData = {
            metodos: [
              {
                id: 1,
                metodo: {
                  id: 1,
                  nombre: 'Método Pomodoro',
                  descripcion: 'Técnica de estudio con temporizador',
                  color: '#ef4444',
                  imagen: '/img/Pomodoro.png'
                },
                progreso: 100,
                estado: 'completed',
                fechaInicio: '2025-11-13T10:00:00.000Z',
                fechaFin: '2025-11-13T11:00:00.000Z',
                fechaCreacion: '2025-11-13T10:00:00.000Z'
              },
              {
                id: 2,
                metodo: {
                  id: 1,
                  nombre: 'Método Pomodoro',
                  descripcion: 'Técnica de estudio con temporizador',
                  color: '#ef4444',
                  imagen: '/img/Pomodoro.png'
                },
                progreso: 50,
                estado: 'in_process',
                fechaInicio: '2025-11-13T12:00:00.000Z',
                fechaFin: null,
                fechaCreacion: '2025-11-13T12:00:00.000Z'
              }
            ],
            sesiones: []
          };
        }

        console.log('Parsed reports data:', reportsData);
        setReportsData(reportsData);
      } catch (parseError) {
        console.error('Error parsing reports data:', parseError);
        console.log('Raw response data:', response.data);
        // Keep default empty data on parse error
        setReportsData({ metodos: [], sesiones: [] });
      }
    } catch (err) {
      setError("Error al cargar los reportes");
      console.error("Error fetching reports:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Delete report function
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

  // Listen for refresh events
  useEffect(() => {
    const handleRefreshReports = () => {
      fetchReports();
    };

    window.addEventListener('refreshReports', handleRefreshReports);
    return () => window.removeEventListener('refreshReports', handleRefreshReports);
  }, [fetchReports]);


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
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
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

            {/* Tabs */}
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

          {/* Content */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 px-4 py-6">
            {activeTab === 'methods' && (
              <>
                {reportsData?.metodos?.map((method) => (
                  <div
                    key={`method-${method.id}`}
                    className="bg-[#232323] p-6 rounded-2xl shadow-lg border hover:scale-[1.02] transition-all duration-200 cursor-pointer"
                    style={{ borderColor: `${method.metodo?.color || '#ef4444'}33` }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        {method.metodo?.imagen ? (
                          <img
                            src={method.metodo.imagen}
                            alt={`Imagen de ${method.metodo.nombre || 'Método'}`}
                            className="w-16 h-16 object-contain rounded-full border-2"
                            style={{ borderColor: method.metodo.color || '#ef4444' }}
                          />
                        ) : (
                          <div
                            className="w-16 h-16 rounded-full flex items-center justify-center border-2"
                            style={{ borderColor: method.metodo?.color || '#ef4444', backgroundColor: `${method.metodo?.color || '#ef4444'}20` }}
                          >
                            <span className="text-2xl">📚</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-xl font-bold text-white truncate">{method.metodo?.nombre || 'Método de Estudio'}</h3>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteReport(method.id);
                            }}
                            className="p-2 text-gray-400 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
                            title="Eliminar reporte"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2.5 mb-3">
                          <div
                            className="h-2.5 rounded-full transition-all duration-300"
                            style={{
                              width: `${method.progreso || 0}%`,
                              backgroundColor: method.metodo?.color || '#ef4444'
                            }}
                          ></div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">
                            {method.estado === 'completed' ? 'Completado' : 'En proceso'}
                          </span>
                          <span className="text-gray-500">
                            {method.fechaCreacion ? new Date(method.fechaCreacion).toLocaleDateString() : 'Fecha desconocida'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
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
                          <span className="text-2xl">🎵</span>
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
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
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