import React, { useState, useEffect } from "react";
import { apiClient } from "../utils/apiClient";
import { API_ENDPOINTS } from "../utils/constants";

interface StudyMethod {
  id_metodo: number;
  titulo: string;
  descripcion: string;
  url_imagen?: string;
  color_hexa?: string;
}

export const MindMapsStepsPage: React.FC = () => {
  // Obtener ID del método desde la URL
  const urlParts = window.location.pathname.split('/');
  const id = urlParts[urlParts.length - 1];

  const [method, setMethod] = useState<StudyMethod | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  // Pasos del método Mapas Mentales
  const steps = [
    {
      id: 0,
      title: "1. Elige un tema central 🗺️",
      description: "Selecciona el tema principal que quieres estudiar y escríbelo en el centro de tu hoja o lienzo digital.",
      instruction: "Elige un tema específico y escribe la palabra o frase principal en el centro de tu mapa.",
      hasTimer: false,
    },
    {
      id: 1,
      title: "2. Crea ramas principales 🌿",
      description: "Dibuja líneas desde el centro hacia afuera para las ideas principales relacionadas con el tema.",
      instruction: "Identifica 3-5 ideas principales y dibuja ramas desde el centro hacia afuera.",
      hasTimer: false,
    },
    {
      id: 2,
      title: "3. Añade colores y símbolos 🎨",
      description: "Utiliza colores, símbolos, dibujos e imágenes para conectar conceptos y hacer el mapa más memorable.",
      instruction: "Asigna colores diferentes a cada rama y añade símbolos o dibujos relacionados con cada idea.",
      hasTimer: false,
    },
    {
      id: 3,
      title: "4. Revisa y conecta conceptos 🔗",
      description: "Revisa tu mapa, añade conexiones entre ideas relacionadas y completa cualquier rama faltante.",
      instruction: "Busca conexiones entre diferentes ramas y añade líneas o flechas para mostrar relaciones.",
      hasTimer: false,
    },
    {
      id: 4,
      title: "5. Herramientas digitales 💻",
      description: "Si prefieres trabajar digitalmente, prueba aplicaciones especializadas en mapas mentales.",
      instruction: "Considera usar MindMeister, Coggle, Miro o XMind para crear mapas mentales digitales.",
      hasTimer: false,
    },
  ];

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
        setMethod(methodData);
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

  // Navegar al siguiente paso
  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setProgressPercentage(((currentStep + 1) / steps.length) * 100);
    } else {
      // Completó todos los pasos, volver al inicio
      setCurrentStep(0);
      setProgressPercentage(0);
    }
  };

  // Navegar al paso anterior
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setProgressPercentage(((currentStep - 1) / steps.length) * 100);
    }
  };

  // Reiniciar método
  const resetMethod = () => {
    setCurrentStep(0);
    setProgressPercentage(0);
  };

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
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          >
            Volver a métodos
          </button>
        </div>
      </div>
    );
  }

  const methodColor = method.color_hexa || "#10b981";
  const currentStepData = steps[currentStep];

  return (
    <div className="bg-gradient-to-br from-[#171717] via-[#1a1a1a] to-[#171717] min-h-screen flex flex-col items-center justify-start p-5">
      {/* Header */}
      <header className="w-full max-w-4xl flex items-center justify-between mb-6">
        <button
          onClick={() => window.location.href = `/mind-maps/intro/${id}`}
          className="p-2 bg-none cursor-pointer hover:scale-110 transition-transform focus:outline-none"
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
        <h1
          className="text-2xl font-semibold flex items-center gap-2"
          style={{ color: methodColor }}
        >
          🗺️ {method.titulo}
        </h1>
        <div className="w-8"></div>
      </header>

      {/* Indicador de progreso */}
      <section className="w-full max-w-4xl mb-8">
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-400 text-sm">
            Paso {currentStep + 1} de {steps.length}
          </span>
          <span className="text-gray-400 text-sm">
            {Math.round(progressPercentage)}% completado
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="h-2 rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${progressPercentage}%`,
              backgroundColor: methodColor
            }}
          ></div>
        </div>
      </section>

      {/* Pasos */}
      <section className="w-full max-w-xl space-y-6">
        {/* Paso actual */}
        <div
          className="bg-[#232323]/90 p-5 rounded-2xl shadow-lg border transition-all duration-500 ease-in-out"
          style={{ borderColor: `${methodColor}33` }}
        >
          <h2
            className="text-xl font-semibold mb-2"
            style={{ color: methodColor }}
          >
            {currentStepData.title}
          </h2>
          <p className="text-gray-300 mb-3">{currentStepData.description}</p>

          {/* Instrucción específica */}
          <div className="bg-[#1a1a1a]/50 p-3 rounded-lg mb-4">
            <p className="text-gray-400 text-sm italic">{currentStepData.instruction}</p>
          </div>

          {/* Consejos adicionales para algunos pasos */}
          {currentStep === 2 && (
            <div className="bg-[#1a1a1a]/30 p-3 rounded-lg mb-4 border-l-4" style={{ borderColor: methodColor }}>
              <p className="text-gray-300 text-sm">
                💡 <strong>Tip:</strong> Usa colores para categorizar información. Por ejemplo: azul para conceptos, verde para ejemplos, rojo para ideas importantes.
              </p>
            </div>
          )}

          {currentStep === 4 && (
            <div className="bg-[#1a1a1a]/30 p-3 rounded-lg mb-4 border-l-4" style={{ borderColor: methodColor }}>
              <p className="text-gray-300 text-sm">
                💡 <strong>Herramientas recomendadas:</strong> MindMeister, Coggle, Miro, XMind, FreeMind
              </p>
            </div>
          )}
        </div>

        {/* Navegación entre pasos */}
        <div className="flex justify-between items-center">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-1 focus:ring-blue-500 focus:outline-none"
          >
            ← Anterior
          </button>

          <div className="flex gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  index === currentStep
                    ? 'bg-current'
                    : index < currentStep
                      ? 'bg-gray-500'
                      : 'bg-gray-700'
                }`}
                style={{
                  backgroundColor: index === currentStep ? methodColor : undefined
                }}
              />
            ))}
          </div>

          <button
            onClick={currentStep === steps.length - 1 ? resetMethod : nextStep}
            className="px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:transform hover:scale-105 shadow-lg hover:shadow-xl focus:ring-1 focus:ring-blue-500 focus:outline-none"
            style={{
              backgroundColor: methodColor,
              color: 'white',
              boxShadow: `0 10px 15px -3px ${methodColor}30, 0 4px 6px -2px ${methodColor}20`,
            }}
          >
            {currentStep === steps.length - 1 ? "Reiniciar" : "Siguiente →"}
          </button>
        </div>

        {/* Recordatorio final */}
        <div className="text-center mt-8">
          <div className="bg-[#232323]/90 p-4 rounded-xl border" style={{ borderColor: `${methodColor}20` }}>
            <p className="text-gray-300 text-sm leading-relaxed">
              ✏️ <strong>Recuerda:</strong> Crear el mapa mental manualmente mejora significativamente la retención de información.
              El proceso de dibujar y organizar ideas fortalece las conexiones neuronales en tu cerebro.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MindMapsStepsPage;