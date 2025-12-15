import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { Sidebar } from "../../../components/ui/Sidebar";
import { Card } from "../../../components/ui/Card";
import { API_BASE_URL, API_ENDPOINTS } from "../../../utils/constants";
import { overrideMethodsWithLocalAssets } from "../../../utils/methodAssets";
import { BookOpen } from 'lucide-react';

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
  const navigate = useNavigate();
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
          navigate("/login");
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
            navigate("/login");
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
      navigate(`/pomodoro/intro/${method.id_metodo}`);
    } else if (method.nombre_metodo.toLowerCase().includes('mapa') || method.nombre_metodo.toLowerCase().includes('mentales')) {
      navigate(`/mind-maps/intro/${method.id_metodo}`);
    } else if (method.nombre_metodo.toLowerCase().includes('repaso') && method.nombre_metodo.toLowerCase().includes('espaciado')) {
      navigate(`/spaced-repetition/intro/${method.id_metodo}`);
    } else if (method.nombre_metodo.toLowerCase().includes('práctica') && method.nombre_metodo.toLowerCase().includes('activa')) {
      navigate(`/active-recall/intro/${method.id_metodo}`);
    } else if (method.nombre_metodo.toLowerCase().includes('feynman')) {
      navigate(`/feynman/intro/${method.id_metodo}`);
    } else if (method.nombre_metodo.toLowerCase().includes('cornell')) {
      navigate(`/cornell/intro/${method.id_metodo}`);
    }
    // TODO: Implementar navegación a vista paso a paso para otros métodos
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#171717] via-[#1a1a1a] to-[#171717] relative overflow-hidden font-inter">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-80 h-80 bg-blue-500/8 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/6 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-indigo-500/5 rounded-full blur-3xl"></div>
        </div>

        <Sidebar currentPage="study-methods" />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="relative mb-8">
              <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Cargando métodos de estudio...</h2>
            <p className="text-gray-400">Preparando tu biblioteca de aprendizaje</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#171717] via-[#1a1a1a] to-[#171717] relative overflow-hidden font-inter">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-80 h-80 bg-blue-500/8 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/6 rounded-full blur-3xl"></div>
        </div>

        <Sidebar currentPage="study-methods" />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md mx-auto">
            <div className="relative mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-red-500/20 to-pink-500/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto border border-red-500/30 shadow-2xl">
                <span className="text-4xl">⚠️</span>
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                <span className="text-white text-xs">!</span>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Error al cargar datos</h2>
            <p className="text-gray-400 mb-8 leading-relaxed">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg hover:shadow-red-500/25 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-[#1a1a1a] cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Intentar de nuevo
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#171717] via-[#1a1a1a] to-[#171717] relative overflow-hidden font-inter">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-80 h-80 bg-blue-500/8 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/6 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-indigo-500/5 rounded-full blur-3xl"></div>
      </div>

      <Sidebar currentPage="study-methods" />

      {/* Main content */}
      <div className="relative z-10 flex justify-center items-center min-h-screen py-8">
        <main className="w-full max-w-7xl px-6 transition-all">

          {/* Header */}
          <div className="relative mb-16">
            {/* Header glow effect */}
            <div className="absolute -inset-6 bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-purple-600/20 rounded-3xl blur-2xl opacity-50"></div>

            <div className="relative text-center">

              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent mb-6 leading-tight">
                Biblioteca de Métodos
                <br />
                <span className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent mb-6 leading-tight">
                  de Estudio
                </span>
              </h1>

              <p className="text-gray-300 text-xl leading-relaxed max-w-3xl mx-auto mb-8">
                Descubre técnicas probadas científicamente para potenciar tu concentración,
                mejorar la retención de información y optimizar tu tiempo de estudio
              </p>

              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-300 rounded-full border border-blue-500/20">
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
                  Técnicas Probadas
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 text-purple-300 rounded-full border border-purple-500/20">
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></span>
                  Mejor Concentración
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 text-indigo-300 rounded-full border border-indigo-500/20">
                  <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></span>
                  Resultados Garantizados
                </div>
              </div>
            </div>
          </div>

          {/* Methods Grid */}
          {studyMethods.length === 0 ? (
            <div className="text-center py-20">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl flex items-center justify-center mx-auto shadow-2xl">
                  <BookOpen className="w-12 h-12 text-gray-500" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">📚</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-300 mb-3">No hay métodos disponibles</h3>
              <p className="text-gray-500 text-lg mb-8">Estamos preparando nuevos métodos de estudio para ti</p>
              <div className="flex justify-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {studyMethods.map((method, index) => (
                <div
                  key={method.id_metodo}
                  className="transform transition-all duration-500 hover:scale-105"
                  style={{animationDelay: `${index * 100}ms`}}
                >
                  <Card
                    method={method}
                    onViewStepByStep={handleViewStepByStep}
                  />
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default StudyMethodsLibraryPage;
