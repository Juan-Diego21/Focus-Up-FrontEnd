import React, { useState, useEffect } from "react";
import { apiClient } from "../utils/apiClient";
import { API_ENDPOINTS } from "../utils/constants";
import { ProgressCircle } from "../components/ui/ProgressCircle";
import { LOCAL_METHOD_ASSETS } from "../utils/methodAssets";
import Swal from 'sweetalert2';

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
  const [sessionData, setSessionData] = useState<{ id: string; methodId: number; id_metodo_realizado: number; startTime: string; progress: number; status: string } | null>(null);
  const [alertQueue, setAlertQueue] = useState<{ type: string; message: string } | null>(null);

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

  // Start session with backend
  const startSession = async () => {
    try {
      console.log('Starting Mind Maps session with id:', id);
      const response = await apiClient.post(API_ENDPOINTS.ACTIVE_METHODS, {
        id_metodo: parseInt(id),
        estado: 'En_proceso',
        progreso: 0
      });
      console.log('Mind Maps session started response:', response.data);
      const session = response.data;
      const id_metodo_realizado = session.id_metodo_realizado || session.data?.id_metodo_realizado;

      if (!id_metodo_realizado) {
        console.error('No id_metodo_realizado received from backend');
        throw new Error('Invalid session response: missing id_metodo_realizado');
      }

      setSessionData({
        id: session.id,
        methodId: parseInt(id),
        id_metodo_realizado: id_metodo_realizado,
        startTime: new Date().toISOString(),
        progress: 0,
        status: 'En_proceso'
      });

      // Store the active method ID separately for progress updates
      localStorage.setItem('activeMethodId', id_metodo_realizado.toString());
      localStorage.setItem('mindmaps-session', JSON.stringify(session));

      // Queue success notification
      setAlertQueue({ type: 'success', message: 'Sesión de Mapas Mentales iniciada correctamente' });

      // Trigger reports refresh
      window.dispatchEvent(new Event('refreshReports'));
    } catch (error) {
      console.error('Error starting Mind Maps session:', error);
      setAlertQueue({ type: 'error', message: 'Error al iniciar la sesión de Mapas Mentales' });
    }
  };

  // Update session progress
  const updateSessionProgress = async (progress: number, status: string = 'En_proceso') => {
    const activeMethodId = localStorage.getItem('activeMethodId');

    if (!activeMethodId) {
      console.error('No active study method found in progress');
      return;
    }

    try {
      console.log('Updating Mind Maps progress for method record ID:', activeMethodId, 'progress:', progress, 'status:', status);
      await apiClient.patch(`${API_ENDPOINTS.METHOD_PROGRESS}/${activeMethodId}/progress`, {
        progreso: progress,
        estado: status
      });
      console.log('Mind Maps progress updated successfully');

      if (sessionData) {
        setSessionData(prev => prev ? { ...prev, progress, status } : null);
        localStorage.setItem('mindmaps-session', JSON.stringify({ ...sessionData, progress, status }));
      }

      // Trigger reports refresh after successful progress update
      window.dispatchEvent(new Event('refreshReports'));
    } catch (error) {
      console.error('Error updating Mind Maps progress:', error);
    }
  };

  // Handle alert queue for instant notifications
  useEffect(() => {
    if (alertQueue) {
      const { type, message } = alertQueue;

      if (type === 'success') {
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: message,
          showConfirmButton: false,
          timer: 3000,
          background: '#232323',
          color: '#ffffff',
          iconColor: '#22C55E',
        });
      } else if (type === 'error') {
        Swal.fire({
          title: 'Error',
          text: message,
          icon: 'error',
          confirmButtonText: 'OK',
          confirmButtonColor: '#EF4444',
          background: '#232323',
          color: '#ffffff',
          iconColor: '#EF4444',
        });
      } else if (type === 'completion') {
        Swal.fire({
          title: 'Sesión guardada',
          text: message,
          icon: 'success',
          confirmButtonText: 'OK',
          confirmButtonColor: '#22C55E',
          background: '#232323',
          color: '#ffffff',
          iconColor: '#22C55E',
        }).then(() => {
          window.location.href = '/dashboard';
        });
      }

      setAlertQueue(null);
    }
  }, [alertQueue]);

  // Navegar al siguiente paso
  const nextStep = () => {
    if (currentStep === 0) {
      // Start session at first step
      startSession();
    }

    if (currentStep < steps.length - 1) {
      const nextStepIndex = currentStep + 1;
      setCurrentStep(nextStepIndex);
      // Fixed percentages: 20%, 40%, 60%, 80%, 100%
      const fixedPercentages = [0, 20, 40, 60, 80, 100];
      const newProgress = fixedPercentages[nextStepIndex];
      setProgressPercentage(newProgress);

      // Update progress with status mapping
      let status = 'En_proceso';
      if (newProgress >= 20 && newProgress < 60) {
        status = 'En_proceso';
      } else if (newProgress >= 60 && newProgress < 100) {
        status = 'Casi_terminando';
      } else if (newProgress === 100) {
        status = 'Terminado';
      }

      updateSessionProgress(newProgress, status);
    }
  };

  // Navegar al paso anterior
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setProgressPercentage(((currentStep - 1) / steps.length) * 100);
    }
  };

  // Finalizar método
  const finishMethod = async () => {
    setProgressPercentage(100);
    await updateSessionProgress(100, 'Terminado');
    localStorage.removeItem('mindmaps-session');
    localStorage.removeItem('activeMethodId');

    // Queue completion notification
    setAlertQueue({
      type: 'completion',
      message: `Sesión de ${method?.titulo || 'Mapas Mentales'} guardada`
    });
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

  // Usar únicamente colores locales del sistema de assets
  const localAssets = LOCAL_METHOD_ASSETS['Mapas Mentales'];
  const methodColor = localAssets?.color || "#10b981";
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
      <section className="flex flex-col items-center mb-10 relative">
        <ProgressCircle
          percentage={progressPercentage}
          size={140}
        />
        <div className="text-center mt-4">
          <span className="text-gray-400 text-sm">
            Paso {currentStep + 1} de {steps.length}
          </span>
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

          {currentStep === steps.length - 1 ? (
            <button
              onClick={finishMethod}
              className="px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:transform hover:scale-105 shadow-lg hover:shadow-xl focus:ring-1 focus:ring-blue-500 focus:outline-none"
              style={{
                backgroundColor: '#22C55E',
                color: 'white',
                boxShadow: `0 10px 15px -3px #22C55E30, 0 4px 6px -2px #22C55E20`,
              }}
            >
              Terminar método
            </button>
          ) : (
            <button
              onClick={nextStep}
              className="px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:transform hover:scale-105 shadow-lg hover:shadow-xl focus:ring-1 focus:ring-blue-500 focus:outline-none"
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
              Siguiente →
            </button>
          )}
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