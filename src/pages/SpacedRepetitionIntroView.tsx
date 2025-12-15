import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import { apiClient } from "../utils/apiClient";
import { API_ENDPOINTS } from "../utils/constants";
import { LOCAL_METHOD_ASSETS } from "../utils/methodAssets";
import { CheckCircle, Clock, RotateCcw } from 'lucide-react';

interface StudyMethod {
  id_metodo: number;
  nombre_metodo: string;
  descripcion: string;
  url_imagen?: string;
  color_hexa?: string;
  beneficios?: Array<{
    id_beneficio: number;
    descripcion_beneficio: string;
  }>;
}

export const SpacedRepetitionIntroView: React.FC = () => {
  const navigate = useNavigate();
  const { methodId } = useParams<{ methodId: string }>();
  const [method, setMethod] = useState<StudyMethod | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [imageLoaded, setImageLoaded] = useState(false);

  // Obtener datos del método de estudio desde la API
  useEffect(() => {
    const fetchMethodData = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await fetch(`${apiClient.defaults.baseURL}${API_ENDPOINTS.STUDY_METHODS}/${methodId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("token");
            navigate("/login");
            return;
          }
          throw new Error("Error al cargar datos del método");
        }

        const methodData = await response.json();
        const method = methodData.data || methodData;
        setMethod(method);
      } catch {
        setError("Error al cargar los datos del método");
      } finally {
        setLoading(false);
      }
    };

    if (methodId) {
      fetchMethodData();
    }
  }, [methodId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#171717] via-[#1a1a1a] to-[#171717] relative overflow-hidden font-inter">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-80 h-80 bg-purple-500/8 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-500/6 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-violet-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="relative mb-8">
              <div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Cargando método...</h2>
            <p className="text-gray-400">Preparando el repaso espaciado</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !method) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#171717] via-[#1a1a1a] to-[#171717] relative overflow-hidden font-inter">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-80 h-80 bg-purple-500/8 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-500/6 rounded-full blur-3xl"></div>
        </div>

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
              onClick={() => navigate("/study-methods")}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg hover:shadow-red-500/25 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-[#1a1a1a] cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver a métodos
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Usar únicamente colores locales del sistema de assets
  const localAssets = LOCAL_METHOD_ASSETS[method.nombre_metodo];
  const methodColor = localAssets?.color || "#7E57C2";
  const methodImage = localAssets?.image;

  // Manejar inicio del método
  const handleStartMethod = () => {
    navigate(`/spaced-repetition/steps/${methodId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#171717] via-[#1a1a1a] to-[#171717] relative overflow-hidden font-inter">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-80 h-80 bg-purple-500/8 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-500/6 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-violet-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 w-full max-w-6xl mx-auto flex items-center justify-between p-6 mb-8">
        <button
          onClick={() => navigate("/study-methods")}
          className="p-3 bg-gradient-to-br from-[#232323]/80 to-[#1a1a1a]/80 backdrop-blur-md rounded-xl border border-[#333]/60 hover:border-purple-500/50 transition-all duration-300 cursor-pointer hover:scale-105 shadow-lg hover:shadow-purple-500/25"
          aria-label="Volver atrás"
        >
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <div className="flex-1 text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-purple-100 to-indigo-100 bg-clip-text text-transparent">
            Repaso Espaciado
          </h1>
        </div>
        <div className="w-12"></div>
      </header>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 space-y-12">
        {/* Hero Section */}
        <div className="relative mb-16">
          {/* Hero glow effect */}
          <div className="absolute -inset-8 bg-gradient-to-r from-purple-600/20 via-indigo-600/20 to-violet-600/20 rounded-3xl blur-2xl opacity-50"></div>

          <div className="relative text-center">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 backdrop-blur-md rounded-full border border-purple-500/30 mb-8">
              <RotateCcw className="w-6 h-6 text-purple-400" />
              <span className="text-purple-300 text-sm font-medium">Repaso Espaciado</span>
            </div>

            <div className="mb-8 flex justify-center">
              {methodImage ? (
                <>
                  {!imageLoaded && (
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gray-700 animate-pulse"></div>
                  )}
                  <div className={`w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden shadow-2xl ring-4 ring-purple-500/20 ${imageLoaded ? 'block' : 'hidden'}`}>
                    <img
                      src={methodImage}
                      alt={`Imagen de ${method.nombre_metodo}`}
                      className="w-full h-full object-cover"
                      onLoad={() => setImageLoaded(true)}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                        const parent = target.parentElement;
                        if (parent && !parent.querySelector(".fallback-emoji")) {
                          const emoji = document.createElement("span");
                          emoji.className = "fallback-emoji text-6xl md:text-8xl";
                          emoji.textContent = "🔄";
                          parent.appendChild(emoji);
                        }
                      }}
                    />
                  </div>
                </>
              ) : (
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 backdrop-blur-md flex items-center justify-center border border-purple-500/30 shadow-2xl">
                  <span className="text-6xl md:text-8xl">🔄</span>
                </div>
              )}
            </div>

            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-purple-100 to-indigo-100 bg-clip-text text-transparent mb-6 leading-tight">
              Refuerza tu Memoria
            </h2>

            <p className="text-gray-300 text-xl leading-relaxed max-w-3xl mx-auto mb-8">
              Refuerza la información a través de intervalos espaciados para mejorar
              la retención a largo plazo de manera efectiva.
            </p>

            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 text-purple-300 rounded-full border border-purple-500/20">
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></span>{""}
                Retención Duradera
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 text-indigo-300 rounded-full border border-indigo-500/20">
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></span>{""}
                Intervalos Óptimos
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500/10 text-violet-300 rounded-full border border-violet-500/20">
                <span className="w-2 h-2 bg-violet-400 rounded-full animate-pulse"></span>{""}
                Memoria Mejorada
              </div>
            </div>
          </div>
        </div>

        {/* How it works section */}
        <div className="space-y-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              ¿Cómo Funciona el Repaso?
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Un sistema científico para consolidar el aprendizaje a largo plazo
            </p>
          </div>

          <div className="grid gap-6 md:gap-8">
            <div className="bg-gradient-to-br from-[#232323]/90 to-[#1a1a1a]/90 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 hover:transform hover:-translate-y-1">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-3">
                    <span className="bg-gradient-to-r from-purple-400 to-purple-500 bg-clip-text text-transparent">
                      1. Revisión inmediata
                    </span>
                  </h3>
                  <p className="text-gray-300 leading-relaxed text-lg">
                    Revisa el material justo ahora para establecer el primer rastro
                    de memoria y crear la base del aprendizaje.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#232323]/90 to-[#1a1a1a]/90 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-indigo-500/20 hover:border-indigo-500/40 transition-all duration-300 hover:transform hover:-translate-y-1">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-3">
                    <span className="bg-gradient-to-r from-indigo-400 to-indigo-500 bg-clip-text text-transparent">
                      2. Después de unas horas
                    </span>
                  </h3>
                  <p className="text-gray-300 leading-relaxed text-lg">
                    Revisa el material más tarde hoy para reforzar las conexiones
                    neuronales mientras la información aún está fresca.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#232323]/90 to-[#1a1a1a]/90 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-violet-500/20 hover:border-violet-500/40 transition-all duration-300 hover:transform hover:-translate-y-1">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-violet-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <RotateCcw className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-3">
                    <span className="bg-gradient-to-r from-violet-400 to-violet-500 bg-clip-text text-transparent">
                      3. Al día siguiente
                    </span>
                  </h3>
                  <p className="text-gray-300 leading-relaxed text-lg">
                    Revisa el contenido mañana para fortalecer la codificación
                    a largo plazo y combatir el olvido natural.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#232323]/90 to-[#1a1a1a]/90 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-pink-500/20 hover:border-pink-500/40 transition-all duration-300 hover:transform hover:-translate-y-1">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-3">
                    <span className="bg-gradient-to-r from-pink-400 to-pink-500 bg-clip-text text-transparent">
                      4. Revisión final
                    </span>
                  </h3>
                  <p className="text-gray-300 leading-relaxed text-lg">
                    Realiza la revisión final espaciada para consolidar la información
                    y asegurar la retención permanente.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits section */}
        {method.beneficios && method.beneficios.length > 0 && (
          <div className="space-y-8">
            <div className="text-center">
              <h3 className="text-3xl font-bold text-white mb-4">
                Beneficios del Repaso
              </h3>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Descubre cómo esta técnica probada revoluciona tu capacidad de recordar
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {method.beneficios.map((beneficio, index) => (
                <div
                  key={beneficio.id_beneficio}
                  className="bg-gradient-to-br from-[#232323]/90 to-[#1a1a1a]/90 backdrop-blur-md p-6 rounded-2xl border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 hover:transform hover:-translate-y-1 shadow-xl"
                  style={{animationDelay: `${index * 100}ms`}}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white font-bold text-sm">{index + 1}</span>
                    </div>
                    <p className="text-gray-300 leading-relaxed">
                      {beneficio.descripcion_beneficio}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action button */}
        <div className="text-center space-y-6 mb-6">
          <button
            onClick={handleStartMethod}
            className="inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-purple-500/25 cursor-pointer hover:transform hover:-translate-y-1"
            style={{
              boxShadow: `0 10px 15px -3px ${methodColor}30, 0 4px 6px -2px ${methodColor}20`,
            }}
          >
            <span>Comenzar Repaso Espaciado</span>
            <svg className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpacedRepetitionIntroView;