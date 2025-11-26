import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import { apiClient } from "../utils/apiClient";
import { API_ENDPOINTS } from "../utils/constants";
import { LOCAL_METHOD_ASSETS } from "../utils/methodAssets";
import { CheckCircle, Clock, Coffee, Settings } from 'lucide-react';

interface PomodoroConfig {
  workTime: number;
  breakTime: number;
}

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


export const PomodoroIntroView: React.FC = () => {
  const navigate = useNavigate();
  const { methodId } = useParams<{ methodId: string }>();
  const [method, setMethod] = useState<StudyMethod | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [config, setConfig] = useState<PomodoroConfig>({
    workTime: 25,
    breakTime: 5,
  });


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

  // Load configuration from localStorage
  useEffect(() => {
    const savedConfig = localStorage.getItem('pomodoro-config');
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        setConfig(parsedConfig);
      } catch (e) {
        console.error('Error parsing saved config:', e);
      }
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#171717] via-[#1a1a1a] to-[#171717] relative overflow-hidden font-inter">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-80 h-80 bg-red-500/8 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-500/6 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-yellow-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="relative mb-8">
              <div className="w-12 h-12 border-4 border-red-400 border-t-transparent rounded-full animate-spin mx-auto"></div>

            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Cargando método...</h2>
            <p className="text-gray-400">Preparando tu técnica Pomodoro</p>
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
          <div className="absolute top-20 left-10 w-80 h-80 bg-red-500/8 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-500/6 rounded-full blur-3xl"></div>
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
  const methodColor = localAssets?.color || "#ef4444";
  const methodImage = localAssets?.image;

  // Handle config modal
  const handleOpenConfig = () => setShowConfigModal(true);
  const handleCloseConfig = () => setShowConfigModal(false);

  const handleSaveConfig = () => {
    localStorage.setItem('pomodoro-config', JSON.stringify(config));
    setShowConfigModal(false);
  };

  const handleConfigChange = (field: keyof PomodoroConfig, value: number) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };


  // Handle starting method
  const handleStartMethod = () => {
    localStorage.setItem('pomodoro-config', JSON.stringify(config));
    navigate(`/pomodoro/execute/${methodId}`);
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-[#171717] via-[#1a1a1a] to-[#171717] relative overflow-hidden font-inter">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-80 h-80 bg-red-500/8 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-500/6 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-yellow-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 w-full max-w-6xl mx-auto flex items-center justify-between p-6 mb-8">
        <button
          onClick={() => navigate("/study-methods")}
          className="p-3 bg-gradient-to-br from-[#232323]/80 to-[#1a1a1a]/80 backdrop-blur-md rounded-xl border border-[#333]/60 hover:border-red-500/50 transition-all duration-300 cursor-pointer hover:scale-105 shadow-lg hover:shadow-red-500/25"
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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-red-100 to-orange-100 bg-clip-text text-transparent">
            Técnica Pomodoro
          </h1>
        </div>
        <div className="w-12"></div>
      </header>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 space-y-12">
        {/* Hero Section */}
        <div className="relative mb-16">
          {/* Hero glow effect */}
          <div className="absolute -inset-8 bg-gradient-to-r from-red-600/20 via-orange-600/20 to-yellow-600/20 rounded-3xl blur-2xl opacity-50"></div>

          <div className="relative text-center">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-red-600/20 to-orange-600/20 backdrop-blur-md rounded-full border border-red-500/30 mb-8">
              <Clock className="w-6 h-6 text-red-400" />
              <span className="text-red-300 text-sm font-medium">Técnica Pomodoro</span>
            </div>

            <div className="mb-8 flex justify-center">
              {methodImage ? (
                <>
                  {!imageLoaded && (
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gray-700 animate-pulse"></div>
                  )}
                  <div className={`w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden shadow-2xl ring-4 ring-red-500/20 ${imageLoaded ? 'block' : 'hidden'}`}>
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
                          emoji.textContent = "🍅";
                          parent.appendChild(emoji);
                        }
                      }}
                    />
                  </div>
                </>
              ) : (
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-500/20 backdrop-blur-md flex items-center justify-center border border-red-500/30 shadow-2xl">
                  <span className="text-6xl md:text-8xl">🍅</span>
                </div>
              )}
            </div>

            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-red-100 to-orange-100 bg-clip-text text-transparent mb-6 leading-tight">
              Domina tu Tiempo de Estudio
            </h2>

            <p className="text-gray-300 text-xl leading-relaxed max-w-3xl mx-auto mb-8">
              {method.descripcion}
            </p>

            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-300 rounded-full border border-red-500/20">
                <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></span>
                Técnica Probada
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 text-orange-300 rounded-full border border-orange-500/20">
                <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></span>
                Mejor Productividad
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/10 text-yellow-300 rounded-full border border-yellow-500/20">
                <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
                Menos Fatiga
              </div>
            </div>
          </div>
        </div>

        {/* How it works section */}
        <div className="space-y-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              ¿Cómo Funciona la Técnica?
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Un método simple pero efectivo para mejorar tu concentración y productividad
            </p>
          </div>

          <div className="grid gap-6 md:gap-8">
            <div className="bg-gradient-to-br from-[#232323]/90 to-[#1a1a1a]/90 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-red-500/20 hover:border-red-500/40 transition-all duration-300 hover:transform hover:-translate-y-1">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-3">
                    <span className="bg-gradient-to-r from-red-400 to-red-500 bg-clip-text text-transparent">
                      1. Elige una tarea específica
                    </span>
                  </h3>
                  <p className="text-gray-300 leading-relaxed text-lg">
                    Selecciona una actividad concreta que quieras completar. Es importante que sea específica
                    y alcanzable dentro del tiempo establecido para mantener la motivación.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#232323]/90 to-[#1a1a1a]/90 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-orange-500/20 hover:border-orange-500/40 transition-all duration-300 hover:transform hover:-translate-y-1">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-3">
                    <span className="bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">
                      2. Trabaja durante 25 minutos
                    </span>
                  </h3>
                  <p className="text-gray-300 leading-relaxed text-lg">
                    Configura un temporizador por 25 minutos y concéntrate completamente en tu tarea.
                    Evita todas las distracciones posibles durante este período sagrado.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#232323]/90 to-[#1a1a1a]/90 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-yellow-500/20 hover:border-yellow-500/40 transition-all duration-300 hover:transform hover:-translate-y-1">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Coffee className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-3">
                    <span className="bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent">
                      3. Toma un descanso corto
                    </span>
                  </h3>
                  <p className="text-gray-300 leading-relaxed text-lg">
                    Cuando suene el temporizador, toma un descanso de 5 minutos. Levántate, estírate,
                    toma agua o haz algo que te relaje. Después de 4 pomodoros, toma un descanso más largo.
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
                Beneficios de la Técnica
              </h3>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Descubre por qué millones de estudiantes confían en este método
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {method.beneficios.map((beneficio, index) => (
                <div
                  key={beneficio.id_beneficio}
                  className="bg-gradient-to-br from-[#232323]/90 to-[#1a1a1a]/90 backdrop-blur-md p-6 rounded-2xl border border-red-500/20 hover:border-red-500/40 transition-all duration-300 hover:transform hover:-translate-y-1 shadow-xl"
                  style={{animationDelay: `${index * 100}ms`}}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
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

        {/* Action buttons */}
        <div className="text-center space-y-6 mb-6">
          <div className="flex justify-center gap-4 flex-wrap">
            <button
              onClick={handleOpenConfig}
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white font-semibold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-gray-500/25 cursor-pointer hover:transform hover:-translate-y-1 border border-gray-600/50"
            >
              <Settings className="w-5 h-5" />
              Configurar Técnica
            </button>
            <button
              onClick={handleStartMethod}
              className="inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-red-500/25 cursor-pointer hover:transform hover:-translate-y-1"
              style={{
                boxShadow: `0 10px 15px -3px ${methodColor}30, 0 4px 6px -2px ${methodColor}20`,
              }}
            >
              <span>Comenzar Técnica Pomodoro</span>
              <svg className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Configuration Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-[#232323]/95 to-[#1a1a1a]/95 backdrop-blur-xl rounded-3xl p-8 w-full max-w-md shadow-2xl border border-red-500/30">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-white via-red-100 to-orange-100 bg-clip-text text-transparent">
                Configurar Técnica
              </h2>
              <button
                onClick={handleCloseConfig}
                className="w-10 h-10 bg-gray-700/50 hover:bg-gray-600/50 rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-300">
                  Tiempo de trabajo (minutos)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={config.workTime}
                  onChange={(e) => handleConfigChange('workTime', parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-600 rounded-xl text-white focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-200"
                />
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-300">
                  Tiempo de descanso (minutos)
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={config.breakTime}
                  onChange={(e) => handleConfigChange('breakTime', parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-600 rounded-xl text-white focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-200"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={handleCloseConfig}
                className="flex-1 px-6 py-3 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white rounded-xl font-medium transition-all duration-200 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveConfig}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-semibold transition-all duration-200 cursor-pointer hover:transform hover:scale-105 shadow-lg hover:shadow-red-500/25"
              >
                Guardar Configuración
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PomodoroIntroView;