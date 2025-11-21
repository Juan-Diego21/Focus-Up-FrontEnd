/**
 * Componente principal para la ejecución del método Mapas Mentales
 * Gestiona la navegación paso a paso y el progreso del usuario
 */
import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { apiClient } from "../utils/apiClient";
import { API_ENDPOINTS } from "../utils/constants";
import { ProgressCircle } from "../components/ui/ProgressCircle";
import { LOCAL_METHOD_ASSETS } from "../utils/methodAssets";
import { Clock as ClockIcon } from "lucide-react";
import {
  getMindMapsColorByProgress,
  getMindMapsLabelByProgress,
  getMindMapsStatusByProgress,
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
 * Componente que maneja la ejecución paso a paso del método Mapas Mentales
 * Permite al usuario navegar entre los 5 pasos del método con progreso visual
 */
export const MindMapsStepsPage: React.FC = () => {
  const navigate = useNavigate();
  const { methodId } = useParams<{ methodId: string }>();
  const [searchParams] = useSearchParams();
  const urlProgress = searchParams.get('progreso');
  const urlSessionId = searchParams.get('sessionId');

  // Guard against undefined methodId
  if (!methodId) {
    navigate('/study-methods');
    return null;
  }

  // Estado para almacenar la información del método de estudio cargado
  const [method, setMethod] = useState<StudyMethod | null>(null);
  // Estado para controlar el paso actual en el flujo del método (0-4)
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
    // For unexpected values, find closest
    if (progress < 30) return 0;
    if (progress < 50) return 1;
    if (progress < 70) return 2;
    if (progress < 90) return 3;
    return 4;
  };

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

        // After loading method, check for resumption
        if (urlSessionId && urlProgress) {
          const progress = parseInt(urlProgress);

          // Validate progress for resume
          if (!isValidProgressForResume(progress, 'mindmaps')) {
            console.error('Invalid progress value for resume:', progress);
            setAlertQueue({ type: 'error', message: 'Valor de progreso inválido para reanudar sesión' });
            return;
          }

          setIsResuming(true);
          const step = getStepFromProgress(progress);
          setCurrentStep(step);
          setProgressPercentage(progress);

          // Set session data for existing session
          setSessionData({
            id: urlSessionId,
            methodId: parseInt(methodId),
            id_metodo_realizado: 0, // Will be set when we have the real session
            startTime: new Date().toISOString(),
            progress: progress,
            status: getMindMapsStatusByProgress(progress)
          });

          // Show resumption message
          setAlertQueue({ type: 'resumed', message: `Sesión de ${methodData.titulo || 'Mapas Mentales'} retomada correctamente` });
        }
      } catch {
        setError("Error al cargar los datos del método");
      } finally {
        setLoading(false);
      }
    };

    if (methodId) {
      fetchMethodData();
    }
  }, [methodId, urlSessionId, urlProgress]);

  // Load resume data from localStorage
  useEffect(() => {
    const resumeMethodId = localStorage.getItem('resume-method');
    const resumeProgress = localStorage.getItem('resume-progress');
    const resumeMethodType = localStorage.getItem('resume-method-type');

    if (resumeMethodId && resumeMethodId === methodId && resumeMethodType === 'mindmaps') {
      // Resuming a specific unfinished Mind Maps method
      console.log('Resuming Mind Maps method with ID:', resumeMethodId, 'at progress:', resumeProgress);
      const progress = parseInt(resumeProgress || '0');

      // Set step based on actual progress from report
      // Mind Maps steps: 0=20%, 1=40%, 2=60%, 3=80%, 4=100%
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
        // For any other progress value, find the closest valid step
        // This prevents invalid progress values
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

      // Clear the resume flags
      localStorage.removeItem('resume-method');
      localStorage.removeItem('resume-progress');
      localStorage.removeItem('resume-method-type');
    }
  }, [methodId]);

  /**
   * Inicia una nueva sesión en el backend para el método Mapas Mentales
   * Valida el progreso antes de enviar la solicitud y maneja errores
   * Siempre crea una nueva sesión desde el flujo de ejecución paso a paso
   */
  const startSession = async () => {
    // Validate progress for creation
    if (!isValidProgressForCreation(20, 'mindmaps')) {
      console.error('Invalid progress value for session creation');
      setAlertQueue({ type: 'error', message: 'Valor de progreso inválido para este método' });
      return;
    }

    try {
      console.log('Starting new Mind Maps session with id:', methodId);
      const response = await apiClient.post(API_ENDPOINTS.ACTIVE_METHODS, {
        id_metodo: parseInt(methodId),
        estado: 'En_proceso',
        progreso: 20
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
        methodId: parseInt(methodId),
        id_metodo_realizado: id_metodo_realizado,
        startTime: new Date().toISOString(),
        progress: 20,
        status: 'En_proceso'
      });

      // Store the active method ID separately for progress updates
      localStorage.setItem('activeMethodId', id_metodo_realizado.toString());
      localStorage.setItem('mindmaps-session', JSON.stringify(session));

      // Queue success notification
      setAlertQueue({ type: 'started', message: `Sesión de ${method?.titulo || 'Mapas Mentales'} iniciada correctamente` });

      // Trigger reports refresh
      window.dispatchEvent(new Event('refreshReports'));
    } catch (error) {
      console.error('Error starting Mind Maps session:', error);
      setAlertQueue({ type: 'error', message: 'Error al iniciar la sesión de Mapas Mentales' });
    }
  };

  /**
   * Actualiza el progreso de la sesión en el backend
   * Valida el progreso antes de enviar y maneja sesiones reanudadas
   */
  const updateSessionProgress = async (progress: number, status: string = 'En_proceso') => {
    // Validate progress for update
    if (!isValidProgressForUpdate(progress, 'mindmaps')) {
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
      console.log('Updating Mind Maps progress for session ID:', sessionId, 'progress:', progress, 'status:', status);
      await apiClient.patch(`${API_ENDPOINTS.METHOD_PROGRESS}/${sessionId}/progress`, {
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
          navigate('/dashboard');
        });
      }

      setAlertQueue(null);
    }
  }, [alertQueue]);

  // Handle leaving without finishing - save progress synchronously
  useEffect(() => {
    const handleBeforeUnload = () => {
      const sessionId = isResuming && urlSessionId ? urlSessionId : localStorage.getItem('activeMethodId');
      if (sessionId && sessionData && sessionData.status !== 'Terminado') {
        // Validate progress before sending beacon
        if (isValidProgressForUpdate(progressPercentage, 'mindmaps')) {
          // Update progress synchronously before page unload
          navigator.sendBeacon(`${apiClient.defaults.baseURL}${API_ENDPOINTS.METHOD_PROGRESS}/${sessionId}/progress`,
            JSON.stringify({
              progreso: progressPercentage,
              estado: getMindMapsStatusByProgress(progressPercentage)
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

  /**
   * Maneja la navegación al siguiente paso del método
   * Controla la lógica de inicio de sesión y actualización de progreso
   * Solo crea una nueva sesión cuando no se está reanudando una existente
   */
  const nextStep = async () => {
    if (currentStep === 0 && !isResuming && !sessionData) {
      // Crear una nueva sesión solo si no se está reanudando una existente y no hay sesión activa
      await startSession();
    }

    if (currentStep < steps.length - 1) {
      const nextStepIndex = currentStep + 1;
      setCurrentStep(nextStepIndex);
      // Use the mapping function for consistent progress values: 20%, 40%, 60%, 80%, 100%
      const newProgress = (nextStepIndex + 1) * 20; // Step 0 = 20%, Step 1 = 40%, etc.
      setProgressPercentage(newProgress);

      // Update progress with standardized status mapping
      const status = getMindMapsStatusByProgress(newProgress);
      updateSessionProgress(newProgress, status);
    }
  };

  /**
   * Maneja la navegación al paso anterior del método
   * Actualiza el progreso correspondiente al paso anterior
   */
  const prevStep = () => {
    if (currentStep > 0) {
      const prevStepIndex = currentStep - 1;
      setCurrentStep(prevStepIndex);
      // Fixed percentages: 20%, 40%, 60%, 80%, 100%
      const fixedPercentages = [20, 40, 60, 80, 100];
      const newProgress = fixedPercentages[prevStepIndex];
      setProgressPercentage(newProgress);

      // Update progress with standardized status mapping
      const status = getMindMapsStatusByProgress(newProgress);
      updateSessionProgress(newProgress, status);
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
            onClick={() => navigate("/study-methods")}
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
          onClick={() => navigate(`/mind-maps/intro/${methodId}`)}
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
          getTextByPercentage={getMindMapsLabelByProgress}
          getColorByPercentage={getMindMapsColorByProgress}
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
              onClick={() => nextStep()}
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

      {/* Finish Later Modal */}
      <FinishLaterModal
        isOpen={showFinishLaterModal}
        methodName={method?.titulo || "Mapas Mentales"}
        onConfirm={async () => {
          // Save current progress before redirecting
          if (sessionData) {
            await updateSessionProgress(progressPercentage, getMindMapsStatusByProgress(progressPercentage));
          }
          setShowFinishLaterModal(false);
          navigate("/reports");
        }}
      />
    </div>
  );
};

export default MindMapsStepsPage;