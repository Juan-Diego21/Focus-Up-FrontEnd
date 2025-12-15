import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import { apiClient } from "../../../shared/services/apiClient";
import { API_ENDPOINTS } from "../../../utils/constants";
import { LOCAL_METHOD_ASSETS } from "../../../utils/methodAssets";
import { CheckCircle, RotateCcw, BookOpen, Brain } from 'lucide-react';

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

export const ActiveRecallIntroView: React.FC = () => {
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
          <div className="absolute top-20 left-10 w-80 h-80 bg-green-500/8 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-500/6 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-teal-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="relative mb-8">
              <div className="w-12 h-12 border-4 border-green-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Cargando método...</h2>
            <p className="text-gray-400">Preparando tu técnica de práctica activa</p>
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
          <div className="absolute top-20 left-10 w-80 h-80 bg-green-500/8 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-500/6 rounded-full blur-3xl"></div>
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
  const methodColor = localAssets?.color || "#43A047";
  const methodImage = localAssets?.image;

  // Manejar inicio del método
  const handleStartMethod = () => {
    navigate(`/active-recall/steps/${methodId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#171717] via-[#1a1a1a] to-[#171717] relative overflow-hidden font-inter">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-80 h-80 bg-green-500/8 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-500/6 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-teal-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 w-full max-w-6xl mx-auto flex items-center justify-between p-6 mb-8">
        <button
          onClick={() => navigate("/study-methods")}
          className="p-3 bg-gradient-to-br from-[#232323]/80 to-[#1a1a1a]/80 backdrop-blur-md rounded-xl border border-[#333]/60 hover:border-green-500/50 transition-all duration-300 cursor-pointer hover:scale-105 shadow-lg hover:shadow-green-500/25"
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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-green-100 to-emerald-100 bg-clip-text text-transparent">
            Práctica Activa
          </h1>
        </div>
        <div className="w-12"></div>
      </header>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 space-y-12">
        {/* Hero Section */}
        <div className="relative mb-16">
          {/* Hero glow effect */}
          <div className="absolute -inset-8 bg-gradient-to-r from-green-600/20 via-emerald-600/20 to-teal-600/20 rounded-3xl blur-2xl opacity-50"></div>

          <div className="relative text-center">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-600/20 to-emerald-600/20 backdrop-blur-md rounded-full border border-green-500/30 mb-8">
              <Brain className="w-6 h-6 text-green-400" />
              <span className="text-green-300 text-sm font-medium">Práctica Activa</span>
            </div>

            <div className="mb-8 flex justify-center">
              {methodImage ? (
                <>
                  {!imageLoaded && (
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gray-700 animate-pulse"></div>
                  )}
                  <div className={`w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden shadow-2xl ring-4 ring-green-500/20 ${imageLoaded ? 'block' : 'hidden'}`}>
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
                          emoji.textContent = "🧠";
                          parent.appendChild(emoji);
                        }
                      }}
                    />
                  </div>
                </>
              ) : (
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-md flex items-center justify-center border border-green-500/30 shadow-2xl">
                  <span className="text-6xl md:text-8xl">🧠</span>
                </div>
              )}
            </div>

            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-green-100 to-emerald-100 bg-clip-text text-transparent mb-6 leading-tight">
              Fortalece tu Memoria
            </h2>

            <p className="text-gray-300 text-xl leading-relaxed max-w-3xl mx-auto mb-8">
              Practica la recuperación de información sin mirar tus notas para fortalecer la memoria
              y profundizar la comprensión de manera efectiva.
            </p>

            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-300 rounded-full border border-green-500/20">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                Memoria Mejorada
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-300 rounded-full border border-emerald-500/20">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                Comprensión Profunda
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500/10 text-teal-300 rounded-full border border-teal-500/20">
                <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></span>
                Retención Duradera
              </div>
            </div>
          </div>
        </div>

        {/* How it works section */}
        <div className="space-y-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              ¿Cómo Funciona la Práctica Activa?
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Un proceso sistemático para fortalecer tu memoria y comprensión
            </p>
          </div>

          <div className="grid gap-6 md:gap-8">
            <div className="bg-gradient-to-br from-[#232323]/90 to-[#1a1a1a]/90 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-green-500/20 hover:border-green-500/40 transition-all duration-300 hover:transform hover:-translate-y-1">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-3">
                    <span className="bg-gradient-to-r from-green-400 to-green-500 bg-clip-text text-transparent">
                      1. Intento inicial de recuerdo
                    </span>
                  </h3>
                  <p className="text-gray-300 leading-relaxed text-lg">
                    Intenta recuperar conceptos sin mirar tus notas. Este esfuerzo inicial
                    fortalece las conexiones neuronales en tu cerebro.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#232323]/90 to-[#1a1a1a]/90 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-300 hover:transform hover:-translate-y-1">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-3">
                    <span className="bg-gradient-to-r from-emerald-400 to-emerald-500 bg-clip-text text-transparent">
                      2. Comparar con notas
                    </span>
                  </h3>
                  <p className="text-gray-300 leading-relaxed text-lg">
                    Compara tu recuerdo con las notas. Identifica errores o puntos faltantes
                    para corregir y completar tu comprensión.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#232323]/90 to-[#1a1a1a]/90 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-teal-500/20 hover:border-teal-500/40 transition-all duration-300 hover:transform hover:-translate-y-1">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <RotateCcw className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-3">
                    <span className="bg-gradient-to-r from-teal-400 to-teal-500 bg-clip-text text-transparent">
                      3. Segunda sesión de recuerdo
                    </span>
                  </h3>
                  <p className="text-gray-300 leading-relaxed text-lg">
                    Intenta un segundo recuerdo, idealmente verbalizando o resumiendo.
                    La práctica repetida consolida el aprendizaje.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#232323]/90 to-[#1a1a1a]/90 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-300 hover:transform hover:-translate-y-1">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-3">
                    <span className="bg-gradient-to-r from-cyan-400 to-cyan-500 bg-clip-text text-transparent">
                      4. Sesión final de recuerdo
                    </span>
                  </h3>
                  <p className="text-gray-300 leading-relaxed text-lg">
                    Sesión final de recuerdo para confirmar la retención a largo plazo.
                    Evalúa cuánto has mejorado tu memoria.
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
                Beneficios de la Práctica Activa
              </h3>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Descubre cómo esta técnica transforma tu capacidad de aprendizaje
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {method.beneficios.map((beneficio, index) => (
                <div
                  key={beneficio.id_beneficio}
                  className="bg-gradient-to-br from-[#232323]/90 to-[#1a1a1a]/90 backdrop-blur-md p-6 rounded-2xl border border-green-500/20 hover:border-green-500/40 transition-all duration-300 hover:transform hover:-translate-y-1 shadow-xl"
                  style={{animationDelay: `${index * 100}ms`}}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
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
            className="inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-green-500/25 cursor-pointer hover:transform hover:-translate-y-1"
            style={{
              boxShadow: `0 10px 15px -3px ${methodColor}30, 0 4px 6px -2px ${methodColor}20`,
            }}
          >
            <span>Comenzar Práctica Activa</span>
            <svg className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActiveRecallIntroView;
