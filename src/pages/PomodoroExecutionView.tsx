import React, { useState, useEffect } from "react";
import { Timer } from "../components/ui/Timer";
import { ProgressCircle } from "../components/ui/ProgressCircle";
import { apiClient } from "../utils/apiClient";
import { API_ENDPOINTS } from "../utils/constants";

interface StudyMethod {
  id_metodo: number;
  titulo: string;
  descripcion: string;
  url_imagen?: string;
  color_hexa?: string;
}

export const PomodoroExecutionView: React.FC = () => {
  // Obtener ID del método desde la URL
  const urlParts = window.location.pathname.split('/');
  const id = urlParts[urlParts.length - 1];

  const [method, setMethod] = useState<StudyMethod | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  // Pasos del método Pomodoro
  const steps = [
    {
      id: 0,
      title: "1. Elige una tarea 🍅",
      description: "Escoge una actividad específica que quieras completar en esta sesión de concentración.",
      instruction: "Selecciona una tarea concreta y específica que puedas completar en 25 minutos.",
      hasTimer: false,
    },
    {
      id: 1,
      title: "2. Trabaja durante 25 minutos ⏱️",
      description: "Evita distracciones y concéntrate completamente hasta que el temporizador acabe.",
      instruction: "Trabaja sin interrupciones durante 25 minutos.",
      hasTimer: true,
      timerMinutes: 25,
    },
    {
      id: 2,
      title: "3. Toma un descanso corto ☕",
      description: "Descansa 5 minutos, levántate, estírate o haz algo que te relaje.",
      instruction: "Toma un descanso de 5 minutos para recargar energías.",
      hasTimer: true,
      timerMinutes: 5,
    },
  ];

  // ✅ Obtener datos del método de estudio desde la API
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

  // Manejar completación del temporizador
  const handleTimerComplete = () => {
    if (currentStep === 1) {
      // Completó el trabajo de 25 minutos
      setProgressPercentage(100);
    } else if (currentStep === 2) {
      // Completó el descanso de 5 minutos
      setProgressPercentage(100);
    }
  };

  // Navegar al siguiente paso
  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setProgressPercentage(50); // En proceso
    } else {
      // Completó todos los pasos, volver al inicio
      setCurrentStep(0);
      setProgressPercentage(0);
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
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all duration-200"
          >
            Volver a métodos
          </button>
        </div>
      </div>
    );
  }

  const methodColor = method.color_hexa || "#ef4444";
  const currentStepData = steps[currentStep];

  return (
    <div className="bg-gradient-to-br from-[#171717] via-[#1a1a1a] to-[#171717] min-h-screen flex flex-col items-center justify-start p-5">
      {/* Header */}
      <header className="w-full max-w-4xl flex items-center justify-between mb-6">
        <button
          onClick={() => window.location.href = `/pomodoro/intro/${id}`}
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
        <h1
          className="text-2xl font-semibold flex items-center gap-2"
          style={{ color: methodColor }}
        >
          🍅 {method.titulo}
        </h1>
        <div className="w-8"></div>
      </header>

      {/* Progreso */}
      <section className="flex flex-col items-center mb-10 relative">
        <ProgressCircle
          percentage={progressPercentage}
          size={140}
        />
      </section>

      {/* Pasos */}
      <section className="w-full max-w-xl space-y-6">
        {/* Paso actual */}
        <div
          className="bg-[#232323]/90 p-5 rounded-2xl shadow-lg border"
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

          {/* Temporizador si aplica */}
          {currentStepData.hasTimer && (
            <Timer
              initialMinutes={currentStepData.timerMinutes!}
              onComplete={handleTimerComplete}
              color={methodColor}
            />
          )}
        </div>

        {/* Botón de progreso */}
        <div className="text-center">
          <button
            onClick={progressPercentage === 100 ? resetMethod : nextStep}
            className="px-8 py-3 rounded-xl font-semibold text-lg transition-all duration-200 hover:transform hover:scale-105 shadow-lg hover:shadow-xl"
            style={{
              backgroundColor: progressPercentage === 100 ? "#22C55E" : methodColor,
              color: 'white',
              boxShadow: `0 10px 15px -3px ${progressPercentage === 100 ? "#22C55E" : methodColor}30, 0 4px 6px -2px ${progressPercentage === 100 ? "#22C55E" : methodColor}20`,
            }}
          >
            {progressPercentage === 100
              ? "Reiniciar método"
              : currentStep === steps.length - 1
                ? "Finalizar método"
                : "Siguiente paso"
            }
          </button>
        </div>
      </section>
    </div>
  );
};

export default PomodoroExecutionView;