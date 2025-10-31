import React, { useState, useEffect } from "react";
import { Sidebar } from "../components/ui/Sidebar";
import { Card } from "../components/ui/Card";
import { API_BASE_URL, API_ENDPOINTS } from "../utils/constants";

interface Benefit {
  id_beneficio: number;
  descripcion_beneficio: string;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
}

interface StudyMethod {
  id_metodo: number;
  nombre_metodo: string;
  descripcion: string;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
  beneficios: Benefit[];
  url_imagen?: string;
  color_hexa?: string;
}


export const StudyMethodsLibraryPage: React.FC = () => {
  console.log("StudyMethodsLibraryPage component rendered");

  const [studyMethods, setStudyMethods] = useState<StudyMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  // Fetch study methods and their benefits
  useEffect(() => {
    const fetchStudyMethods = async () => {
      try {
        setLoading(true);
        setError("");

        // Obtener token del localStorage para autenticación
        const token = localStorage.getItem("token");
        if (!token) {
          // Redirigir al login si no hay token
          window.location.href = "/login";
          throw new Error("No se encontró token de autenticación. Redirigiendo al login...");
        }

        // Fetch all study methods con token de autorización
        const methodsResponse = await fetch(`${API_BASE_URL}${API_ENDPOINTS.STUDY_METHODS}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!methodsResponse.ok) {
          if (methodsResponse.status === 401) {
            // Token expirado o inválido, limpiar datos y redirigir al login
            localStorage.removeItem("token");
            localStorage.removeItem("userId");
            localStorage.removeItem("userData");
            window.location.href = "/login";
            throw new Error("Sesión expirada. Redirigiendo al login...");
          }
          throw new Error("Error al cargar métodos de estudio");
        }
        const apiResponse = await methodsResponse.json();

        // Extract the data array from the response - more robust approach
        const methods: StudyMethod[] = apiResponse?.data || [];

        if (methods.length === 0) {
          console.warn("No study methods received from API. Full response:", apiResponse);
        }

        setStudyMethods(methods);
      } catch (err) {
        console.error("Error fetching study methods:", err);
        setError("Error al cargar los métodos de estudio. Por favor, intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    };

    fetchStudyMethods();
  }, []);

  const handleViewStepByStep = (method: StudyMethod) => {
    // Navegar a la vista intro del método Pomodoro
    if (method.nombre_metodo.toLowerCase().includes('pomodoro')) {
      window.location.href = `/pomodoro/intro/${method.id_metodo}`;
    } else {
      console.log(`Viewing step by step for ${method.nombre_metodo}`);
      // TODO: Implement step by step view navigation for other methods
    }
  };

  const handleAddToSession = (method: StudyMethod) => {
    console.log(`Adding ${method.nombre_metodo} to concentration session`);
    // TODO: Implement add to session functionality
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#171717] via-[#1a1a1a] to-[#171717] font-inter">
        <Sidebar currentPage="study-methods" />
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white text-lg">Cargando métodos de estudio...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#171717] via-[#1a1a1a] to-[#171717] font-inter">
        <Sidebar currentPage="study-methods" />
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-white text-xl font-semibold mb-4">Error al cargar datos</h2>
            <p className="text-gray-400 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 cursor-pointer"
            >
              Intentar de nuevo
            </button>
          </div>
        </div>
      </div>
    );
  }

  try {
    console.log("Rendering StudyMethodsLibraryPage with:", { loading, error, studyMethodsLength: studyMethods.length });

    return (
      <div className="min-h-screen bg-gradient-to-br from-[#171717] via-[#1a1a1a] to-[#171717] font-inter">
        <Sidebar currentPage="study-methods" />

        <div className="flex justify-center items-center min-h-screen">
          <main className="w-full max-w-7xl p-6 md:p-10 transition-all">
            <div className="mb-10">
              <h1 className="text-4xl font-bold text-white mb-4 tracking-tight text-center bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text">
                Biblioteca de Métodos de Estudio
              </h1>
              <p className="text-gray-400 text-center text-lg max-w-2xl mx-auto">
                Descubre técnicas probadas para mejorar tu concentración y eficiencia en el estudio
              </p>
            </div>

            {studyMethods.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500 text-6xl mb-4">📚</div>
                <h3 className="text-white text-xl font-semibold mb-2">No hay métodos disponibles</h3>
                <p className="text-gray-400">Los métodos de estudio estarán disponibles pronto.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {studyMethods.map((method) => (
                  <Card
                    key={method.id_metodo}
                    method={method}
                    onViewStepByStep={handleViewStepByStep}
                    onAddToSession={handleAddToSession}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    );
  } catch (renderError) {
    console.error("Error rendering StudyMethodsLibraryPage:", renderError);
    return (
      <div className="min-h-screen bg-red-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Error de Renderizado</h1>
          <p>Hubo un error al cargar la página. Revisa la consola para más detalles.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Recargar página
          </button>
        </div>
      </div>
    );
  }
};

export default StudyMethodsLibraryPage;