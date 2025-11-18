/**
 * Componente principal para la ejecución del método Repaso Espaciado
 * Gestiona la navegación paso a paso y el progreso del usuario
 */
import React, { useState, useEffect } from "react";
import { apiClient } from "../utils/apiClient";
import { API_ENDPOINTS } from "../utils/constants";
import { ProgressCircle } from "../components/ui/ProgressCircle";
import { LOCAL_METHOD_ASSETS } from "../utils/methodAssets";
import { Clock as ClockIcon } from 'lucide-react';
import {
  getSpacedRepetitionColorByProgress,
  getSpacedRepetitionLabelByProgress,
  getSpacedRepetitionStatusByProgress,
  isValidProgressForCreation,
  isValidProgressForUpdate,
  isValidProgressForResume
} from "../utils/methodStatus";
import { FinishLaterModal } from "../components/ui/FinishLaterModal";
import Swal from 'sweetalert2';

interface StudyMethod {
  id_metodo: number;
  titulo: string;
  descripcion: string;
  url_imagen?: string;
  color_hexa?: string;
}

/**
 * Componente que maneja la ejecución paso a paso del método Repaso Espaciado
 * Permite al usuario completar 4 pasos de revisión espaciada con progreso visual
 */
export const SpacedRepetitionStepsView: React.FC = () => {
  // Obtener ID del método desde la URL para identificar qué método ejecutar
  const urlParts = window.location.pathname.split('/');
  const id = urlParts[urlParts.length - 1];

  // Leer parámetros de URL para reanudar sesiones existentes
  const urlParams = new URLSearchParams(window.location.search);
  const urlProgress = urlParams.get('progreso');
  const urlSessionId = urlParams.get('sessionId');

  // Estado para almacenar la información del método de estudio cargado
  const [method, setMethod] = useState<StudyMethod | null>(null);
  // Estado para controlar el paso actual en el flujo del método (0-3)
  const [currentStep, setCurrentStep] = useState(0);
  // Estado para el porcentaje de progreso visual (20, 40, 60, 80, 100)
  const [progressPercentage, setProgressPercentage] = useState(0);
  // Estado de carga mientras se obtienen datos del servidor
  const [loading, setLoading] = useState(true);
  // Estado para manejar errores de carga o API
  const [error, setError] = useState<string>("");
  // Estado para datos de la sesión activa en el backend
  const [sessionData, setSessionData] = useState<{ id: string; methodId: number; id_metodo_realizado: number; startTime: string; progress: number; status: string } | null>(null);
  // Estado para cola de notificaciones/alertas que se muestran al usuario
  const [alertQueue, setAlertQueue] = useState<{ type: string; message: string } | null>(null);
  // Estado para saber si se está reanudando una sesión existente
  const [isResuming, setIsResuming] = useState(false);
  // Estado para controlar la visibilidad del modal "Terminar más tarde"
  const [showFinishLaterModal, setShowFinishLaterModal] = useState(false);

  /**
   * Función pura que convierte el porcentaje de progreso al número de paso correspondiente
   * Mapea: 20%→0, 40%→1, 60%→2, 80%→3, 100%→4
   */
  const getStepFromProgress = (progress: number): number => {
    if (progress === 20) return 0;
    if (progress === 40) return 1;
    if (progress === 60) return 2;
    if (progress === 80) return 3;
    if (progress === 100) return 4;
    // Para valores inesperados, encontrar el más cercano
    if (progress < 30) return 0;
    if (progress < 50) return 1;
    if (progress < 70) return 2;
    if (progress < 90) return 3;
    return 4;
  };

  // Pasos del método Repaso Espaciado
  const steps = [
    {
      id: 0,
      title: "1. Revisión inmediata 📖",
      description: "Revisa el material justo ahora para establecer el primer rastro de memoria.",
      instruction: "Toma 10-15 minutos para revisar activamente el material por primera vez.",
      hasTimer: false,
    },
    {
      id: 1,
      title: "2. Después de unas horas ⏰",
      description: "Revisa el material más tarde hoy para reforzar las conexiones.",
      instruction: "Espera al menos 2-3 horas antes de esta segunda revisión. Una vez lo hayas hecho da click al botón Siguiente",
      hasTimer: false,
    },
    {
      id: 2,
      title: "3. Al día siguiente 📅",
      description: "Revisa el contenido mañana para fortalecer la codificación a largo plazo.",
      instruction: "Realiza esta revisión al día siguiente de la primera sesión.",
      hasTimer: false,
    },
    {
      id: 3,
      title: "4. Revisión final ✅",
      description: "Realiza la revisión final espaciada para consolidar la información.",
      instruction: "Esta última revisión asegura la retención a largo plazo del material.",
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
        const method = methodData.data || methodData;
        setMethod(method);

        // Después de cargar el método, verificar si hay reanudación
        if (urlSessionId && urlProgress) {
          const progress = parseInt(urlProgress);

          // Validar progreso para reanudar
          if (!isValidProgressForResume(progress, 'spacedrepetition')) {
            console.error('Valor de progreso inválido para reanudar:', progress);
            setAlertQueue({ type: 'error', message: 'Valor de progreso inválido para reanudar sesión' });
            return;
          }

          setIsResuming(true);
          const step = getStepFromProgress(progress);
          setCurrentStep(step);
          setProgressPercentage(progress);

          // Establecer datos de sesión para sesión existente
          setSessionData({
            id: urlSessionId,
            methodId: parseInt(id),
            id_metodo_realizado: 0, // Se establecerá cuando tengamos la sesión real
            startTime: new Date().toISOString(),
            progress: progress,
            status: getSpacedRepetitionStatusByProgress(progress)
          });

          // Mostrar mensaje de reanudación
          setAlertQueue({ type: 'resumed', message: `Sesión de ${method.titulo || 'Repaso Espaciado'} retomada correctamente` });
        }
      } catch {
        setError("Error al cargar los datos del método");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMethodData();
    }
  }, [id, urlSessionId, urlProgress]);

  // Cargar datos de reanudación desde localStorage
  useEffect(() => {
    const resumeMethodId = localStorage.getItem('resume-method');
    const resumeProgress = localStorage.getItem('resume-progress');
    const resumeMethodType = localStorage.getItem('resume-method-type');

    if (resumeMethodId && resumeMethodId === id && resumeMethodType === 'spacedrepetition') {
      // Reanudando un método específico de Repaso Espaciado sin terminar
      console.log('Reanudando método de Repaso Espaciado con ID:', resumeMethodId, 'en progreso:', resumeProgress);
      const progress = parseInt(resumeProgress || '0');

      // Establecer paso basado en progreso actual del reporte
      // Pasos de Repaso Espaciado: 0=20%, 1=40%, 2=60%, 3=80%, 4=100%
      if (progress === 20) {
        setCurrentStep(0);
        setProgressPercentage(20);
      } else if (progress === 40) {
        setCurrentStep(1);
        setProgressPercentage(40);
      } else if (progress === 60) {
        setCurrentStep(2);
        setProgressPercentage(60);
      } else if (progress === 80) {
        setCurrentStep(3);
        setProgressPercentage(80);
      } else if (progress === 100) {
        setCurrentStep(4);
        setProgressPercentage(100);
      } else {
        // Para cualquier otro valor de progreso, encontrar el paso más cercano
        // Esto previene valores de progreso inválidos
        if (progress < 30) {
          setCurrentStep(0);
          setProgressPercentage(20);
        } else if (progress < 50) {
          setCurrentStep(1);
          setProgressPercentage(40);
        } else if (progress < 70) {
          setCurrentStep(2);
          setProgressPercentage(60);
        } else if (progress < 90) {
          setCurrentStep(3);
          setProgressPercentage(80);
        } else {
          setCurrentStep(4);
          setProgressPercentage(100);
        }
      }

      // Limpiar los flags de reanudación
      localStorage.removeItem('resume-method');
      localStorage.removeItem('resume-progress');
      localStorage.removeItem('resume-method-type');
    }
  }, [id]);

  /**
   * Inicia una nueva sesión en el backend para el método Repaso Espaciado
   * Valida el progreso antes de enviar la solicitud y maneja errores
   * Siempre crea una nueva sesión desde el flujo de ejecución paso a paso
   */
  const startSession = async () => {
    // Validar progreso para creación
    if (!isValidProgressForCreation(20, 'spacedrepetition')) {
      console.error('Valor de progreso inválido para creación de sesión');
      setAlertQueue({ type: 'error', message: 'Valor de progreso inválido para este método' });
      return;
    }

    try {
      console.log('Iniciando nueva sesión de Repaso Espaciado con id:', id);
      const response = await apiClient.post(API_ENDPOINTS.ACTIVE_METHODS, {
        id_metodo: parseInt(id),
        estado: 'En_proceso',
        progreso: 20
      });
      console.log('Sesión de Repaso Espaciado iniciada respuesta:', response.data);
      const session = response.data;
      const id_metodo_realizado = session.id_metodo_realizado || session.data?.id_metodo_realizado;

      if (!id_metodo_realizado) {
        console.error('No se recibió id_metodo_realizado del backend');
        throw new Error('Respuesta de sesión inválida: falta id_metodo_realizado');
      }

      setSessionData({
        id: session.id,
        methodId: parseInt(id),
        id_metodo_realizado: id_metodo_realizado,
        startTime: new Date().toISOString(),
        progress: 20,
        status: 'En_proceso'
      });

      // Almacenar el ID del método activo por separado para actualizaciones de progreso
      localStorage.setItem('activeMethodId', id_metodo_realizado.toString());
      localStorage.setItem('spaced-repetition-session', JSON.stringify(session));

      // Poner en cola notificación de éxito
      setAlertQueue({ type: 'started', message: `Sesión de ${method?.titulo || 'Repaso Espaciado'} iniciada correctamente` });

      // Activar actualización de reportes
      window.dispatchEvent(new Event('refreshReports'));
    } catch (error) {
      console.error('Error al iniciar sesión de Repaso Espaciado:', error);
      setAlertQueue({ type: 'error', message: 'Error al iniciar la sesión de Repaso Espaciado' });
    }
  };

  /**
   * Actualiza el progreso de la sesión en el backend
   * Valida el progreso antes de enviar y maneja sesiones reanudadas
   */
  const updateSessionProgress = async (progress: number, status: string = 'En_proceso') => {
    // Validar progreso para actualización
    if (!isValidProgressForUpdate(progress, 'spacedrepetition')) {
      console.error('Valor de progreso inválido para actualización:', progress);
      setAlertQueue({ type: 'error', message: 'Valor de progreso inválido para este método' });
      return;
    }

    // Para sesiones reanudadas, usar sessionId de URL, de lo contrario usar activeMethodId
    const sessionId = isResuming && urlSessionId ? urlSessionId : localStorage.getItem('activeMethodId');

    if (!sessionId) {
      console.error('No se encontró ID de sesión para actualización de progreso');
      return;
    }

    try {
      console.log('Actualizando progreso de Repaso Espaciado para ID de sesión:', sessionId, 'progreso:', progress, 'estado:', status);
      await apiClient.patch(`${API_ENDPOINTS.METHOD_PROGRESS}/${sessionId}/progress`, {
        progreso: progress,
        estado: status
      });
      console.log('Progreso de Repaso Espaciado actualizado exitosamente');

      if (sessionData) {
        setSessionData(prev => prev ? { ...prev, progress, status } : null);
        localStorage.setItem('spaced-repetition-session', JSON.stringify({ ...sessionData, progress, status }));
      }

      // Activar actualización de reportes después de actualización exitosa de progreso
      window.dispatchEvent(new Event('refreshReports'));
    } catch (error) {
      console.error('Error al actualizar progreso de Repaso Espaciado:', error);
    }
  };

  // Manejar cola de alertas para notificaciones instantáneas
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

  // Manejar salida sin terminar - guardar progreso de forma síncrona
  useEffect(() => {
    const handleBeforeUnload = () => {
      const sessionId = isResuming && urlSessionId ? urlSessionId : localStorage.getItem('activeMethodId');
      if (sessionId && sessionData && sessionData.status !== 'Terminado') {
        // Validar progreso antes de enviar beacon
        if (isValidProgressForUpdate(progressPercentage, 'spacedrepetition')) {
          // Actualizar progreso de forma síncrona antes de salir de la página
          navigator.sendBeacon(`${apiClient.defaults.baseURL}${API_ENDPOINTS.METHOD_PROGRESS}/${sessionId}/progress`,
            JSON.stringify({
              progreso: progressPercentage,
              estado: getSpacedRepetitionStatusByProgress(progressPercentage)
            })
          );
        } else {
          console.error('Valor de progreso inválido para actualización beforeunload:', progressPercentage);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [sessionData, progressPercentage, isResuming, urlSessionId]);

  /**
   * Maneja la finalización de un paso del método
   * Controla la lógica de inicio de sesión y actualización de progreso
   * Solo crea una nueva sesión cuando no se está reanudando una existente
   */
  const completeStep = () => {
    if (currentStep === 0 && !isResuming) {
      // Crear una nueva sesión solo si no se está reanudando una existente
      startSession();
    }

    if (currentStep < steps.length - 1) {
      const nextStepIndex = currentStep + 1;
      setCurrentStep(nextStepIndex);
      // Usar el mapeo de función para valores de progreso consistentes: 20%, 40%, 60%, 80%, 100%
      const newProgress = (nextStepIndex + 1) * 20; // Paso 0 = 20%, Paso 1 = 40%, etc.
      setProgressPercentage(newProgress);

      // Actualizar progreso con mapeo de estado estandarizado
      const status = getSpacedRepetitionStatusByProgress(newProgress);
      updateSessionProgress(newProgress, status);
    }
  };

  // Finalizar método
  const finishMethod = async () => {
    setProgressPercentage(100);
    await updateSessionProgress(100, 'Terminado');
    localStorage.removeItem('spaced-repetition-session');
    localStorage.removeItem('activeMethodId');

    // Poner en cola notificación de finalización
    setAlertQueue({
      type: 'completion',
      message: `Sesión de ${method?.titulo || 'Método Repaso Espaciado'} guardada`
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
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all duration-200"
          >
            Volver a métodos
          </button>
        </div>
      </div>
    );
  }

  // Usar únicamente colores locales del sistema de assets
  const localAssets = LOCAL_METHOD_ASSETS[method.titulo];
  const methodColor = localAssets?.color || "#7E57C2";
  const currentStepData = steps[currentStep];

  return (
    <div className="bg-gradient-to-br from-[#171717] via-[#1a1a1a] to-[#171717] min-h-screen flex flex-col items-center justify-start p-5">
      {/* Header */}
      <header className="w-full max-w-4xl flex items-center justify-between mb-6">
        <button
          onClick={() => window.location.href = `/spaced-repetition/intro/${id}`}
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

      {/* Indicador de progreso */}
      <section className="flex flex-col items-center mb-10 relative" style={{ marginTop: '-20px' }}>
        <ProgressCircle
          percentage={progressPercentage}
          size={140}
          getTextByPercentage={getSpacedRepetitionLabelByProgress}
          getColorByPercentage={getSpacedRepetitionColorByProgress}
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
          {currentStep === 0 && (
            <div className="bg-[#1a1a1a]/30 p-3 rounded-lg mb-4 border-l-4" style={{ borderColor: methodColor }}>
              <p className="text-gray-300 text-sm">
                💡 <strong>Tip:</strong> Enfócate en comprender los conceptos principales. No intentes memorizar todo de una vez.
              </p>
            </div>
          )}

          {currentStep === 2 && (
            <div className="bg-[#1a1a1a]/30 p-3 rounded-lg mb-4 border-l-4" style={{ borderColor: methodColor }}>
              <p className="text-gray-300 text-sm">
                💡 <strong>Recuerda:</strong> El espacio entre revisiones es crucial. Cada repaso espaciado fortalece las conexiones neuronales.
              </p>
            </div>
          )}
        </div>

        {/* Botones de acción */}
        <div className="text-center space-y-4">
          {currentStep === steps.length - 1 ? (
            // Botón para finalizar el método en el último paso
            <button
              onClick={finishMethod}
              className="px-8 py-3 rounded-xl font-semibold transition-all duration-200 hover:transform hover:scale-105 shadow-lg hover:shadow-xl"
              style={{
                backgroundColor: '#22C55E',
                color: 'white',
                boxShadow: `0 10px 15px -3px #22C55E30, 0 4px 6px -2px #22C55E20`,
              }}
            >
              Finalizar Método
            </button>
          ) : (
            // Botón para avanzar al siguiente paso
            <button
              onClick={completeStep}
              className="px-8 py-3 rounded-xl font-semibold transition-all duration-200 hover:transform hover:scale-105 shadow-lg hover:shadow-xl"
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
              {/* Cambiar texto del botón según el paso actual */}
              {currentStep === 0 ? 'Comenzar' : 'Siguiente'}
            </button>
          )}
        </div>
      </section>

      {/* Finish Later Modal */}
      <FinishLaterModal
        isOpen={showFinishLaterModal}
        methodName={method?.titulo || "Repaso Espaciado"}
        onConfirm={async () => {
          // Save current progress before redirecting
          if (sessionData) {
            await updateSessionProgress(progressPercentage, getSpacedRepetitionStatusByProgress(progressPercentage));
          }
          setShowFinishLaterModal(false);
          window.location.href = "/reports";
        }}
      />
    </div>
  );
};

export default SpacedRepetitionStepsView;