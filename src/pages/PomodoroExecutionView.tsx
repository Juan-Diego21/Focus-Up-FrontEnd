import React, { useState, useEffect } from "react";
import { Timer } from "../components/ui/Timer";
import { ProgressCircle } from "../components/ui/ProgressCircle";
import { apiClient } from "../utils/apiClient";
import { API_ENDPOINTS } from "../utils/constants";
import Swal from 'sweetalert2';
import { CheckCircle, Clock, Coffee, SkipForward } from 'lucide-react';

// Preload SweetAlert2 for instant alerts
Swal.mixin({
  timerProgressBar: true,
  background: '#232323',
  color: '#ffffff',
});

interface PomodoroConfig {
  workTime: number;
  breakTime: number;
}

interface SessionData {
  id: string;
  methodId: number;
  id_metodo_realizado: number;
  startTime: string;
  progress: number;
  status: 'in_process' | 'completed';
}

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
  const [config, setConfig] = useState<PomodoroConfig>({ workTime: 25, breakTime: 5 });
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [timerCompleted, setTimerCompleted] = useState(false);
  const [canFinishMethod, setCanFinishMethod] = useState(false);
  const [alertQueue, setAlertQueue] = useState<{ type: string; message: string } | null>(null);

  // Load config and session from localStorage
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

    const savedSession = localStorage.getItem('pomodoro-session');
    const resumeMethodId = localStorage.getItem('resume-method');

    if (resumeMethodId) {
      // Resuming a specific unfinished method
      console.log('Resuming method with ID:', resumeMethodId);
      // Load the method data and set it to break phase (50% progress)
      setCurrentStep(2);
      setProgressPercentage(50);
      setCanFinishMethod(true);
      // Clear the resume flag
      localStorage.removeItem('resume-method');
    } else if (savedSession) {
      try {
        const parsedSession = JSON.parse(savedSession);
        setSessionData(parsedSession);
        // Resume at appropriate step based on progress
        if (parsedSession.progress === 0) {
          setCurrentStep(0);
        } else if (parsedSession.progress === 50) {
          setCurrentStep(2); // Break phase
          setProgressPercentage(50);
          setCanFinishMethod(true);
        }
      } catch (e) {
        console.error('Error parsing saved session:', e);
      }
    }
  }, []);

  // Pasos del método Pomodoro
  const steps = [
    {
      id: 0,
      title: "1. Elige una tarea",
      icon: CheckCircle,
      description: "Escoge una actividad específica que quieras completar en esta sesión de concentración.",
      instruction: "Selecciona una tarea concreta y específica que puedas completar.",
      hasTimer: false,
    },
    {
      id: 1,
      title: `2. Trabaja durante ${config.workTime} minutos`,
      icon: Clock,
      description: "Evita distracciones y concéntrate completamente hasta que el temporizador acabe.",
      instruction: `Trabaja sin interrupciones durante ${config.workTime} minutos.`,
      hasTimer: true,
      timerMinutes: config.workTime,
    },
    {
      id: 2,
      title: `3. Toma un descanso de ${config.breakTime} minutos`,
      icon: Coffee,
      description: "Descansa, levántate, estírate o haz algo que te relaje.",
      instruction: `Toma un descanso de ${config.breakTime} minutos para recargar energías.`,
      hasTimer: true,
      timerMinutes: config.breakTime,
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
      console.log('Starting session with id:', id, 'parsed:', parseInt(id));
      const response = await apiClient.post(API_ENDPOINTS.ACTIVE_METHODS, {
        id_metodo: parseInt(id),
        estado: 'in_process',
        progreso: 0
      });
      console.log('Session started response:', response.data);
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
        status: 'in_process'
      });

      // Store the active method ID separately for progress updates
      localStorage.setItem('activeMethodId', id_metodo_realizado.toString());
      localStorage.setItem('pomodoro-session', JSON.stringify(session));

      // Queue success notification
      setAlertQueue({ type: 'success', message: 'Sesión iniciada correctamente' });

      // Trigger reports refresh
      window.dispatchEvent(new Event('refreshReports'));
    } catch (error) {
      console.error('Error starting session:', error);
      setAlertQueue({ type: 'error', message: 'Error al iniciar la sesión' });
    }
  };

  // Update session progress
  const updateSessionProgress = async (progress: number, status: 'in_process' | 'completed' = 'in_process') => {
    const activeMethodId = localStorage.getItem('activeMethodId');

    if (!activeMethodId) {
      console.error('No active study method found in progress');
      return;
    }

    try {
      console.log('Updating progress for method record ID:', activeMethodId, 'progress:', progress, 'status:', status);
      await apiClient.patch(`${API_ENDPOINTS.METHOD_PROGRESS}/${activeMethodId}/progress`, {
        progreso: progress,
        estado: status
      });
      console.log('Progress updated successfully');

      if (sessionData) {
        setSessionData(prev => prev ? { ...prev, progress, status } : null);
        localStorage.setItem('pomodoro-session', JSON.stringify({ ...sessionData, progress, status }));
      }

      // Trigger reports refresh after successful progress update
      window.dispatchEvent(new Event('refreshReports'));
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  // Manejar completación del temporizador
  const handleTimerComplete = () => {
    setTimerCompleted(true);

    // Habilitar botón de finalizar después de que termine el primer descanso
    if (currentStep === 2) {
      setCanFinishMethod(true);
    }

    // Nota: Las actualizaciones de progreso ahora se manejan solo cuando el usuario avanza manualmente
    // La completación del temporizador solo habilita el botón "Siguiente Paso"
  };

  // Navegar al siguiente paso
  const nextStep = () => {
    if (!timerCompleted && currentStep > 0) return; // No permitir avanzar si el timer no completó

    if (currentStep === 0) {
      // De elegir tarea a trabajar
      setCurrentStep(1);
      setTimerCompleted(false);
      startSession();
    } else if (currentStep === 1) {
      // De trabajar a descanso - update progress to 50%
      setCurrentStep(2);
      setTimerCompleted(false);
      setProgressPercentage(50);
      updateSessionProgress(50);
    } else if (currentStep === 2) {
      // De descanso a trabajar - allow infinite cycles, keep progress at 50%
      setCurrentStep(1);
      setTimerCompleted(false);
      // Enable finish button after first complete cycle (work + break)
      setCanFinishMethod(true);
      // Progress stays at 50% until user manually finishes
    }
  };

  // Skip step (only during work phase)
  const skipStep = () => {
    if (currentStep === 1) {
      // Skip work, go to break
      setCurrentStep(2);
      setTimerCompleted(false);
      setProgressPercentage(50);
      updateSessionProgress(50);
    } else if (currentStep === 2) {
      // Skip break, go back to work
      setCurrentStep(1);
      setTimerCompleted(false);
    }
  };

  // Finalizar método
  const finishMethod = async () => {
    setProgressPercentage(100);
    await updateSessionProgress(100, 'completed');
    localStorage.removeItem('pomodoro-session');
    localStorage.removeItem('activeMethodId');

    // Queue completion notification
    setAlertQueue({
      type: 'completion',
      message: `Sesión de ${method?.titulo || 'Método Pomodoro'} guardada`
    });
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
        });
      } else if (type === 'error') {
        Swal.fire({
          title: 'Error',
          text: message,
          icon: 'error',
          confirmButtonText: 'OK',
          confirmButtonColor: '#EF4444',
        });
      } else if (type === 'completion') {
        Swal.fire({
          title: 'Sesión guardada',
          text: message,
          icon: 'success',
          confirmButtonText: 'OK',
          confirmButtonColor: '#22C55E',
        }).then(() => {
          window.location.href = '/dashboard';
        });
      }

      setAlertQueue(null);
    }
  }, [alertQueue]);

  // Handle leaving without finishing
  useEffect(() => {
    const handleBeforeUnload = () => {
      const activeMethodId = localStorage.getItem('activeMethodId');
      if (activeMethodId && sessionData && sessionData.status === 'in_process') {
        // Update progress synchronously before page unload
        navigator.sendBeacon(`${apiClient.defaults.baseURL}${API_ENDPOINTS.METHOD_PROGRESS}/${activeMethodId}/progress`,
          JSON.stringify({
            progreso: 50,
            estado: 'in_process'
          })
        );
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [sessionData]);

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
          <Clock className="w-7 h-7" />
          {method.titulo}
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
          <div className="flex items-center gap-2 mb-2">
            {currentStepData.icon && <currentStepData.icon className="w-6 h-6" style={{ color: 'white' }} />}
            <h2
              className="text-xl font-semibold"
              style={{ color: methodColor }}
            >
              {currentStepData.title}
            </h2>
          </div>
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

        {/* Botones de control */}
        <div className="text-center space-y-4">
          {currentStep === 0 && (
            <button
              onClick={nextStep}
              className="px-8 py-3 rounded-xl font-semibold text-lg transition-all duration-200 hover:transform hover:scale-105 shadow-lg hover:shadow-xl"
              style={{
                backgroundColor: methodColor,
                color: 'white',
                boxShadow: `0 10px 15px -3px ${methodColor}30, 0 4px 6px -2px ${methodColor}20`,
              }}
            >
              Comenzar trabajo
            </button>
          )}

          {currentStep === 1 && (
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={skipStep}
                className="flex flex-row items-center justify-center space-x-2 px-4 py-2 rounded-2xl text-white font-semibold text-base transition-all duration-200 hover:transform hover:scale-105 shadow-lg hover:shadow-xl whitespace-nowrap"
                style={{
                  backgroundColor: '#9CA3AF',
                  boxShadow: `0 10px 15px -3px #9CA3AF30, 0 4px 6px -2px #9CA3AF20`,
                }}
              >
                <SkipForward className="w-5 h-5" style={{ color: 'white' }} />
                <span>Saltar Paso</span>
              </button>
              <button
                onClick={nextStep}
                disabled={!timerCompleted}
                className="flex flex-row items-center justify-center space-x-2 px-6 py-2 rounded-2xl text-white font-semibold text-base transition-all duration-200 hover:transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                style={{
                  backgroundColor: timerCompleted ? '#22C55E' : '#6B7280',
                  boxShadow: timerCompleted ? `0 10px 15px -3px #22C55E30, 0 4px 6px -2px #22C55E20` : 'none',
                }}
              >
                <span>Siguiente Paso</span>
              </button>
              <button
                onClick={finishMethod}
                disabled={!canFinishMethod}
                className="flex flex-row items-center justify-center space-x-2 px-4 py-2 rounded-2xl text-white font-semibold text-base transition-all duration-200 hover:transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                style={{
                  backgroundColor: canFinishMethod ? '#EF4444' : '#6B7280',
                  boxShadow: canFinishMethod ? `0 10px 15px -3px #EF444430, 0 4px 6px -2px #EF444420` : 'none',
                }}
              >
                <CheckCircle className="w-5 h-5" style={{ color: canFinishMethod ? '#22C55E' : '#6B7280' }} />
                <span>Finalizar Método</span>
              </button>
            </div>
          )}

          {currentStep === 2 && (
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={skipStep}
                className="flex flex-row items-center justify-center space-x-2 px-4 py-2 rounded-2xl text-white font-semibold text-base transition-all duration-200 hover:transform hover:scale-105 shadow-lg hover:shadow-xl whitespace-nowrap"
                style={{
                  backgroundColor: '#9CA3AF',
                  boxShadow: `0 10px 15px -3px #9CA3AF30, 0 4px 6px -2px #9CA3AF20`,
                }}
              >
                <SkipForward className="w-5 h-5" style={{ color: 'white' }} />
                <span>Saltar Paso</span>
              </button>
              <button
                onClick={nextStep}
                disabled={!timerCompleted}
                className="flex flex-row items-center justify-center space-x-2 px-6 py-2 rounded-2xl text-white font-semibold text-base transition-all duration-200 hover:transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                style={{
                  backgroundColor: timerCompleted ? '#22C55E' : '#6B7280',
                  boxShadow: timerCompleted ? `0 10px 15px -3px #22C55E30, 0 4px 6px -2px #22C55E20` : 'none',
                }}
              >
                <span>Siguiente Paso</span>
              </button>
              <button
                onClick={finishMethod}
                disabled={!canFinishMethod}
                className="flex flex-row items-center justify-center space-x-2 px-4 py-2 rounded-2xl text-white font-semibold text-base transition-all duration-200 hover:transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                style={{
                  backgroundColor: canFinishMethod ? '#EF4444' : '#6B7280',
                  boxShadow: canFinishMethod ? `0 10px 15px -3px #EF444430, 0 4px 6px -2px #EF444420` : 'none',
                }}
              >
                <CheckCircle className="w-5 h-5" style={{ color: canFinishMethod ? '#22C55E' : '#6B7280' }} />
                <span>Finalizar Método</span>
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default PomodoroExecutionView;