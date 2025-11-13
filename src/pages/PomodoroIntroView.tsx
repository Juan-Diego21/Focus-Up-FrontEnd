import React, { useState, useEffect } from "react";
import { apiClient } from "../utils/apiClient";
import { API_ENDPOINTS } from "../utils/constants";
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
  // Obtener ID del método desde la URL (usando window.location ya que no hay router)
  const urlParts = window.location.pathname.split('/');
  const id = urlParts[urlParts.length - 1];
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
          window.location.href = "/login";
          return;
        }

        const response = await fetch(`${apiClient.defaults.baseURL}${API_ENDPOINTS.STUDY_METHODS}/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("token");
            window.location.href = "/login";
            return;
          }
          throw new Error("Error al cargar datos del método");
        }

        const methodData = await response.json();
        setMethod(methodData.data || methodData);
      } catch {
        setError("Error al cargar los datos del método");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMethodData();
    }
  }, [id]);

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
      <div className="bg-gradient-to-br from-[#171717] via-[#1a1a1a] to-[#171717] min-h-screen flex items-center justify-center p-5">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Cargando método...</p>
        </div>
      </div>
    );
  }

  if (error || !method) {
    return (
      <div className="bg-gradient-to-br from-[#171717] via-[#1a1a1a] to-[#171717] min-h-screen flex items-center justify-center p-5">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-white text-xl font-semibold mb-4">Error al cargar datos</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => window.location.href = "/study-methods"}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all duration-200"
          >
            Volver a métodos
          </button>
        </div>
      </div>
    );
  }

  const methodColor = method.color_hexa || "#ef4444";

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

  return (
    <div className="bg-gradient-to-br from-[#171717] via-[#1a1a1a] to-[#171717] min-h-screen flex flex-col items-center justify-start p-5">
      {/* Header */}
      <header className="w-full max-w-4xl flex items-center justify-between mb-8">
        <button
          onClick={() => window.location.href = "/study-methods"}
          className="p-2 bg-none cursor-pointer hover:scale-110 transition-transform"
          aria-label="Volver atrás"
        >
          <svg
            className="w-7 h-7 text-white"
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
        <h1 className="text-2xl font-semibold" style={{ color: methodColor }}>
          {method.nombre_metodo}
        </h1>
        <div className="w-8"></div>
      </header>

      {/* Contenido principal */}
      <div className="w-full max-w-4xl space-y-8">
        {/* Imagen y descripción principal */}
        <div className="text-center">
          <div className="mb-6 flex justify-center">
            {method?.url_imagen ? (
              <>
                {!imageLoaded && (
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gray-700 animate-pulse"></div>
                )}
                <img
                  src={method.url_imagen}
                  alt={`Imagen de ${method.nombre_metodo}`}
                  className={`w-12 h-12 md:w-16 md:h-16 object-contain rounded-full shadow-md shadow-black/40 ${imageLoaded ? 'block' : 'hidden'}`}
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
          </div>
          <p className="text-gray-300 text-lg leading-relaxed max-w-2xl mx-auto">
            {method.descripcion}
          </p>
        </div>

        {/* Explicación paso a paso */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-white text-center mb-8">
            ¿Cómo funciona la Técnica Pomodoro?
          </h2>

          <div className="grid gap-6">
            <div
              className="bg-[#232323]/90 p-6 rounded-2xl shadow-lg border"
              style={{ borderColor: `${methodColor}33` }}
            >
              <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <CheckCircle className="w-6 h-6" style={{ color: methodColor }} />
                <span style={{ color: methodColor }}>
                  1. Elige una tarea específica
                </span>
              </h3>
              <p className="text-gray-300 leading-relaxed">
                Selecciona una actividad concreta que quieras completar. Es importante que sea específica
                y alcanzable dentro del tiempo establecido.
              </p>
            </div>

            <div
              className="bg-[#232323]/90 p-6 rounded-2xl shadow-lg border"
              style={{ borderColor: `${methodColor}33` }}
            >
              <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <Clock className="w-6 h-6" style={{ color: methodColor }} />
                <span style={{ color: methodColor }}>
                  2. Trabaja durante 25 minutos
                </span>
              </h3>
              <p className="text-gray-300 leading-relaxed">
                Configura un temporizador por 25 minutos y concéntrate completamente en tu tarea.
                Evita todas las distracciones posibles durante este período.
              </p>
            </div>

            <div
              className="bg-[#232323]/90 p-6 rounded-2xl shadow-lg border"
              style={{ borderColor: `${methodColor}33` }}
            >
              <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <Coffee className="w-6 h-6" style={{ color: methodColor }} />
                <span style={{ color: methodColor }}>
                  3. Toma un descanso corto
                </span>
              </h3>
              <p className="text-gray-300 leading-relaxed">
                Cuando suene el temporizador, toma un descanso de 5 minutos. Levántate, estírate,
                toma agua o haz algo que te relaje. Después de 4 pomodoros, toma un descanso más largo.
              </p>
            </div>
          </div>
        </div>

        {/* Beneficios */}
        {method.beneficios && method.beneficios.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-white text-center mb-6">
              Beneficios de la Técnica Pomodoro
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {method.beneficios.map((beneficio) => (
                <div
                  key={beneficio.id_beneficio}
                  className="bg-[#232323]/90 p-4 rounded-xl border"
                  style={{ borderColor: `${methodColor}20` }}
                >
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {beneficio.descripcion_beneficio}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Botones para configurar e iniciar */}
        <div className="text-center mt-10 space-y-4">
          <div className="flex justify-center gap-4">
            <button
              onClick={handleOpenConfig}
              className="px-6 py-3 rounded-xl font-semibold text-lg transition-all duration-200 hover:transform hover:scale-105 shadow-lg hover:shadow-xl border-2 flex items-center gap-2"
              style={{
                borderColor: methodColor,
                color: methodColor,
                backgroundColor: 'transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = `${methodColor}20`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <Settings className="w-5 h-5" />
              Configurar
            </button>
            <button
              onClick={() => {
                // Save current config for the execution page
                localStorage.setItem('pomodoro-config', JSON.stringify(config));
                window.location.href = `/pomodoro/execute/${id}`;
              }}
              className="px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 hover:transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2"
              style={{
                backgroundColor: methodColor,
                color: 'white',
                boxShadow: `0 10px 15px -3px ${methodColor}30, 0 4px 6px -2px ${methodColor}20`,
              }}
              onMouseEnter={(e) => {
                const darkerColor = methodColor.replace('#', '');
                const r = parseInt(darkerColor.substr(0, 2), 16);
                const g = parseInt(darkerColor.substr(2, 2), 16);
                const b = parseInt(darkerColor.substr(4, 2), 16);
                const darker = `rgb(${Math.max(0, r - 20)}, ${Math.max(0, g - 20)}, ${Math.max(0, b - 20)})`;
                e.currentTarget.style.backgroundColor = darker;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = methodColor;
              }}
            >
              Hacer {method.nombre_metodo}
            </button>
          </div>
        </div>
      </div>

      {/* Configuration Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#232323] rounded-2xl p-6 w-full max-w-md shadow-2xl border" style={{ borderColor: `${methodColor}33` }}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">Configurar Pomodoro</h2>
              <button
                onClick={handleCloseConfig}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tiempo de trabajo (minutos)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={config.workTime}
                  onChange={(e) => handleConfigChange('workTime', parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tiempo de descanso (minutos)
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={config.breakTime}
                  onChange={(e) => handleConfigChange('breakTime', parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCloseConfig}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveConfig}
                className="flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:transform hover:scale-105"
                style={{
                  backgroundColor: methodColor,
                  color: 'white',
                }}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PomodoroIntroView;