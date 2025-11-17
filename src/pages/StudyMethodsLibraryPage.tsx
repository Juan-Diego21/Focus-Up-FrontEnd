import React, { useState, useEffect } from "react";
import { Sidebar } from "../components/ui/Sidebar";
import { Card } from "../components/ui/Card";
import { API_BASE_URL, API_ENDPOINTS } from "../utils/constants";
import { overrideMethodsWithLocalAssets } from "../utils/methodAssets";

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


// Página que muestra la biblioteca de métodos de estudio
export const StudyMethodsLibraryPage: React.FC = () => {
  const [studyMethods, setStudyMethods] = useState<StudyMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  // Obtener métodos de estudio y sus beneficios desde la API
  useEffect(() => {
    const fetchStudyMethods = async () => {
      try {
        setLoading(true);
        setError("");

        // Obtener token del localStorage para autenticación
        const token = localStorage.getItem("token");
        if (!token) {
          // ✅ Redirigir al login si no hay token
          window.location.href = "/login";
          return;
        }

        // Obtener todos los métodos de estudio con token de autorización
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
            return;
          }
          throw new Error("Error al cargar métodos de estudio");
        }

        const apiResponse = await methodsResponse.json();
        // Extraer el array de datos de la respuesta de manera robusta
        const methods: StudyMethod[] = apiResponse?.data || [];
        // Override with local assets for consistent images and colors
        const methodsWithLocalAssets = overrideMethodsWithLocalAssets(methods);
        setStudyMethods(methodsWithLocalAssets);
      } catch {
        setError("Error al cargar los métodos de estudio. Por favor, intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    };

    fetchStudyMethods();
  }, []);

  // Manejar navegación a vista paso a paso del método
  const handleViewStepByStep = (method: StudyMethod) => {
    if (method.nombre_metodo.toLowerCase().includes('pomodoro')) {
      window.location.href = `/pomodoro/intro/${method.id_metodo}`;
    } else if (method.nombre_metodo.toLowerCase().includes('mapa') || method.nombre_metodo.toLowerCase().includes('mentales')) {
      window.location.href = `/mind-maps/intro/${method.id_metodo}`;
    } else if (method.nombre_metodo.toLowerCase().includes('repaso') && method.nombre_metodo.toLowerCase().includes('espaciado')) {
      window.location.href = `/spaced-repetition/intro/${method.id_metodo}`;
    }
    // TODO: Implementar navegación a vista paso a paso para otros métodos
  };

  // Manejar agregar método a sesión de concentración
  const handleAddToSession = () => {
    // TODO: Implementar funcionalidad de agregar a sesión
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
};

export default StudyMethodsLibraryPage;