/**
 * Componente principal para la ejecución del método Pomodoro
 * Maneja la lógica de temporización, progreso y navegación entre pasos
 */
import React, { useState, useEffect } from "react";
import { Timer } from "../components/ui/Timer";
import { ProgressCircle } from "../components/ui/ProgressCircle";
import { apiClient } from "../utils/apiClient";
import { API_ENDPOINTS } from "../utils/constants";
import Swal from 'sweetalert2';
import { CheckCircle, Clock, Coffee, SkipForward, Clock as ClockIcon } from 'lucide-react';
import {
  isValidProgressForCreation,
  isValidProgressForUpdate,
  isValidProgressForResume
} from "../utils/methodStatus";
import { FinishLaterModal } from "../components/ui/FinishLaterModal";

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
  status: 'en_progreso' | 'completado';
}

interface StudyMethod {
  id_metodo: number;
  titulo: string;
  descripcion: string;
  url_imagen?: string;
  color_hexa?: string;
}

/**
 * Componente principal que maneja la ejecución completa del método Pomodoro
 * Incluye temporización, navegación de pasos y gestión de sesiones
 */
export const PomodoroExecutionView: React.FC = () => {
  // Extraer el ID del método desde la URL para identificar qué método ejecutar
  const urlParts = window.location.pathname.split('/');
  const id = urlParts[urlParts.length - 1];

  // Leer parámetros de URL para reanudar sesiones existentes
  const urlParams = new URLSearchParams(window.location.search);
  const urlProgress = urlParams.get('progreso');
  const urlSessionId = urlParams.get('sessionId');

  // Estado para almacenar la información del método de estudio cargado
  const [method, setMethod] = useState<StudyMethod | null>(null);
  // Estado para controlar el paso actual en el flujo del método (0, 1, 2)
  const [currentStep, setCurrentStep] = useState(0);
  // Estado para el porcentaje de progreso visual (0, 50, 100)
  const [progressPercentage, setProgressPercentage] = useState(0);
  // Estado de carga mientras se obtienen datos del servidor
  const [loading, setLoading] = useState(true);
  // Estado para manejar errores de carga o API
  const [error, setError] = useState<string>("");
  // Estado para configuración personalizada del usuario (tiempos de trabajo y descanso)
  const [config, setConfig] = useState<PomodoroConfig>({ workTime: 25, breakTime: 5 });
  // Estado para datos de la sesión activa en el backend
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  // Estado para saber si el temporizador actual ha completado su ciclo
  const [timerCompleted, setTimerCompleted] = useState(false);
  // Estado para habilitar el botón de finalizar método después del primer ciclo completo
  const [canFinishMethod, setCanFinishMethod] = useState(false);
  // Estado para cola de notificaciones/alertas que se muestran al usuario
  const [alertQueue, setAlertQueue] = useState<{ type: string; message: string } | null>(null);
  // Estado para saber si se está reanudando una sesión existente
  const [isResuming, setIsResuming] = useState(false);
  // Estado para controlar la visibilidad del modal "Terminar más tarde"
  const [showFinishLaterModal, setShowFinishLaterModal] = useState(false);

  // Load config and session from localStorage or URL params
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

    // Check for URL params first (higher priority)
    if (urlSessionId && urlProgress) {
      const progress = parseInt(urlProgress);

      // Validate progress for resume
      if (!isValidProgressForResume(progress, 'pomodoro')) {
        console.error('Invalid progress value for resume:', progress);
        setAlertQueue({ type: 'error', message: 'Valor de progreso inválido para reanudar sesión' });
        return;
      }

      setIsResuming(true);

      // Set step based on actual progress from report
      if (progress === 20) {
        setCurrentStep(0); // Task selection step
        setProgressPercentage(20);
        setCanFinishMethod(false);
      } else if (progress === 60) {
        setCurrentStep(2); // Break phase
        setProgressPercentage(60);
        setCanFinishMethod(true);
      } else if (progress === 100) {
        setCurrentStep(2); // Completed, show break phase
        setProgressPercentage(100);
        setCanFinishMethod(true);
      }

      // Set session data for existing session
      setSessionData({
        id: urlSessionId,
        methodId: parseInt(id),
        id_metodo_realizado: 0, // Will be set when we have the real session
        startTime: new Date().toISOString(),
        progress: progress,
        status: progress === 100 ? 'completado' : 'en_progreso'
      });

      // Show resumption message
      setAlertQueue({ type: 'resumed', message: `Sesión de Pomodoro retomada correctamente` });
    } else {
      // Fallback to localStorage resumption
      const resumeMethodId = localStorage.getItem('resume-method');
      const resumeProgress = localStorage.getItem('resume-progress');
      const resumeMethodType = localStorage.getItem('resume-method-type');

      if (resumeMethodId && resumeMethodId === id && resumeMethodType === 'pomodoro') {
        // Resuming a specific unfinished Pomodoro method
        console.log('Resuming Pomodoro method with ID:', resumeMethodId, 'at progress:', resumeProgress);
        const progress = parseInt(resumeProgress || '0');

        // Set step based on actual progress from report
        if (progress === 20) {
          setCurrentStep(0); // Task selection step
          setProgressPercentage(20);
          setCanFinishMethod(false);
        } else if (progress === 60) {
          setCurrentStep(2); // Break phase
          setProgressPercentage(60);
          setCanFinishMethod(true);
        } else if (progress === 100) {
          setCurrentStep(2); // Completed, show break phase
          setProgressPercentage(100);
          setCanFinishMethod(true);
        }

        // Clear the resume flags
        localStorage.removeItem('resume-method');
        localStorage.removeItem('resume-progress');
        localStorage.removeItem('resume-method-type');
      }
    }
  }, [id, urlSessionId, urlProgress]);

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
        const method = methodData.data || methodData;
        setMethod(method);
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

  /**
   * Inicia una nueva sesión en el backend para el método Pomodoro
   * Valida el progreso antes de enviar la solicitud y maneja errores
   * Siempre crea una nueva sesión desde el flujo de ejecución paso a paso
   */
  const startSession = async () => {
    // Validate progress for creation
    if (!isValidProgressForCreation(20, 'pomodoro')) {
      console.error('Invalid progress value for session creation');
      setAlertQueue({ type: 'error', message: 'Valor de progreso inválido para este método' });
      return;
    }

    try {
      console.log('Starting new Pomodoro session with id:', id, 'parsed:', parseInt(id));
      const response = await apiClient.post(API_ENDPOINTS.ACTIVE_METHODS, {
        id_metodo: parseInt(id),
        estado: 'en_progreso',
        progreso: 20
      });
      console.log('Pomodoro session started response:', response.data);
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
        progress: 20,
        status: 'en_progreso'
      });

      // Store the active method ID separately for progress updates
      localStorage.setItem('activeMethodId', id_metodo_realizado.toString());
      localStorage.setItem('pomodoro-session', JSON.stringify(session));

      // Update visual progress to match session creation
      setProgressPercentage(20);

      // Queue success notification
      setAlertQueue({ type: 'started', message: 'Sesión de Pomodoro iniciada correctamente' });

      // Trigger reports refresh
      window.dispatchEvent(new Event('refreshReports'));
    } catch (error) {
      console.error('Error starting Pomodoro session:', error);
      setAlertQueue({ type: 'error', message: 'Error al iniciar la sesión de Pomodoro' });
    }
  };

  /**
   * Actualiza el progreso de la sesión en el backend
   * Valida el progreso antes de enviar y maneja sesiones reanudadas
   */
  const updateSessionProgress = async (progress: number, status: 'en_progreso' | 'completado' = 'en_progreso') => {
    // Validate progress for update
    if (!isValidProgressForUpdate(progress, 'pomodoro')) {
      console.error('Invalid progress value for update:', progress);
      setAlertQueue({ type: 'error', message: 'Valor de progreso inválido para este método' });
      return;
    }

    // For resumed sessions, use the sessionId from URL, otherwise use activeMethodId
    const sessionId = isResuming && urlSessionId ? urlSessionId : localStorage.getItem('activeMethodId');

    if (!sessionId) {
      console.error('No session ID found for progress update');
      return;
    }

    try {
      console.log('Updating Pomodoro progress for session ID:', sessionId, 'progress:', progress, 'status:', status);
      await apiClient.patch(`${API_ENDPOINTS.METHOD_PROGRESS}/${sessionId}/progress`, {
        progreso: progress,
        estado: status
      });
      console.log('Pomodoro progress updated successfully');

      if (sessionData) {
        setSessionData(prev => prev ? { ...prev, progress, status } : null);
        localStorage.setItem('pomodoro-session', JSON.stringify({ ...sessionData, progress, status }));
      }

      // Trigger reports refresh after successful progress update
      window.dispatchEvent(new Event('refreshReports'));
    } catch (error) {
      console.error('Error updating Pomodoro progress:', error);
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

  /**
   * Maneja la navegación al siguiente paso del método
   * Controla la lógica de inicio de sesión y actualización de progreso
   * Solo crea una nueva sesión cuando no se está reanudando una existente
   */
  const nextStep = () => {
    if (!timerCompleted && currentStep > 0) return; // No permitir avanzar si el timer no completó

    if (currentStep === 0 && !isResuming) {
      // Crear una nueva sesión solo si no se está reanudando una existente
      setCurrentStep(1);
      setTimerCompleted(false);
      startSession();
    } else if (currentStep === 1) {
      // De trabajar a descanso - update progress to 60%
      setCurrentStep(2);
      setTimerCompleted(false);
      setProgressPercentage(60);
      updateSessionProgress(60);
    } else if (currentStep === 2) {
      // De descanso a trabajar - update progress to 60%
      setCurrentStep(1);
      setTimerCompleted(false);
      setProgressPercentage(60);
      updateSessionProgress(60);
      // Enable finish button after first complete cycle (work + break)
      setCanFinishMethod(true);
    }
  };

  // Skip step (only during work phase)
  const skipStep = () => {
    if (currentStep === 1) {
      // Skip work, go to break
      setCurrentStep(2);
      setTimerCompleted(false);
      setProgressPercentage(20);
      updateSessionProgress(20);
    } else if (currentStep === 2) {
      // Skip break, go back to work
      setCurrentStep(1);
      setTimerCompleted(false);
    }
  };

  // Finalizar método
  const finishMethod = async () => {
    setProgressPercentage(100);
    await updateSessionProgress(100, 'completado');
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

      if (type === 'success' || type === 'started' || type === 'resumed') {
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

  // Handle leaving without finishing - save progress synchronously
  useEffect(() => {
    const handleBeforeUnload = () => {
      const sessionId = isResuming && urlSessionId ? urlSessionId : localStorage.getItem('activeMethodId');
      if (sessionId && sessionData && sessionData.status === 'en_progreso') {
        // Validate progress before sending beacon
        if (isValidProgressForUpdate(progressPercentage, 'pomodoro')) {
          // Update progress synchronously before page unload
          navigator.sendBeacon(`${apiClient.defaults.baseURL}${API_ENDPOINTS.METHOD_PROGRESS}/${sessionId}/progress`,
            JSON.stringify({
              progreso: progressPercentage,
              estado: 'en_progreso'
            })
          );
        } else {
          console.error('Invalid progress value for beforeunload update:', progressPercentage);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [sessionData, progressPercentage, isResuming, urlSessionId]);

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

  // Custom color function for Pomodoro: blue at 60%, green at 100%
  const getPomodoroColorByPercentage = (pct: number): string => {
    if (pct === 0) return "#9CA3AF"; // Gray for not started
    if (pct === 60) return "#3B82F6"; // Blue for break phase
    if (pct === 100) return "#22C55E"; // Green for completed
    return "#FACC15"; // Yellow for work phase (20%)
  };

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
          className="text-2xl font-semibold"
          style={{ color: methodColor }}
        >
          {method.titulo}
        </h1>
        {/* Botón "Terminar más tarde" solo visible después de pasar el paso 2 (pasos seguros para guardar) */}
        {sessionData && currentStep >= 2 && (
          <button
            onClick={() => setShowFinishLaterModal(true)}
            className="px-3 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
            aria-label="Terminar más tarde"
          >
            <ClockIcon className="w-4 h-4" />
            Terminar más tarde
          </button>
        )}
      </header>

      {/* Progreso */}
      <section className="flex flex-col items-center mb-10 relative" style={{ marginTop: '-20px' }}>
        <ProgressCircle
          percentage={progressPercentage}
          size={140}
          getColorByPercentage={getPomodoroColorByPercentage}
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

          {/* Consejos adicionales para algunos pasos */}
          {currentStep === 0 && (
            <div className="bg-[#1a1a1a]/30 p-3 rounded-lg mb-4 border-l-4" style={{ borderColor: methodColor }}>
              <p className="text-gray-300 text-sm">
                💡 <strong>Tip:</strong> Elige una tarea específica y medible. En lugar de "estudiar matemáticas",
                opta por "resolver 10 ejercicios de álgebra lineal".
              </p>
            </div>
          )}

          {currentStep === 1 && (
            <div className="bg-[#1a1a1a]/30 p-3 rounded-lg mb-4 border-l-4" style={{ borderColor: methodColor }}>
              <p className="text-gray-300 text-sm">
                💡 <strong>Recuerda:</strong> Durante el tiempo de trabajo, evita distracciones como redes sociales,
                notificaciones y conversaciones. Tu foco debe ser total.
              </p>
            </div>
          )}

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
              Comenzar trabajo
            </button>
          )}

          {currentStep === 1 && (
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={skipStep}
                className="flex flex-row items-center justify-center space-x-2 px-4 py-2 rounded-xl text-white font-semibold text-base transition-all duration-200 hover:transform hover:scale-105 shadow-lg hover:shadow-xl whitespace-nowrap"
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
                className="flex flex-row items-center justify-center space-x-2 px-6 py-2 rounded-xl text-white font-semibold text-base transition-all duration-200 hover:transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
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
                className="flex flex-row items-center justify-center space-x-2 px-4 py-2 rounded-xl text-white font-semibold text-base transition-all duration-200 hover:transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                style={{
                  backgroundColor: canFinishMethod ? '#EF4444' : '#6B7280',
                  boxShadow: canFinishMethod ? `0 10px 15px -3px #EF444430, 0 4px 6px -2px #EF444420` : 'none',
                }}
              >
                <CheckCircle className="w-5 h-5" style={{ color: 'white' }} />
                <span>Finalizar Método</span>
              </button>
            </div>
          )}

          {currentStep === 2 && (
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={skipStep}
                className="flex flex-row items-center justify-center space-x-2 px-4 py-2 rounded-xl text-white font-semibold text-base transition-all duration-200 hover:transform hover:scale-105 shadow-lg hover:shadow-xl whitespace-nowrap"
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
                className="flex flex-row items-center justify-center space-x-2 px-6 py-2 rounded-xl text-white font-semibold text-base transition-all duration-200 hover:transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
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
                className="flex flex-row items-center justify-center space-x-2 px-4 py-2 rounded-xl text-white font-semibold text-base transition-all duration-200 hover:transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
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

      {/* Finish Later Modal */}
      <FinishLaterModal
        isOpen={showFinishLaterModal}
        methodName={method?.titulo || "Método Pomodoro"}
        onConfirm={() => {
          setShowFinishLaterModal(false);
          window.location.href = "/reports";
        }}
      />
    </div>
  );
};

export default PomodoroExecutionView;