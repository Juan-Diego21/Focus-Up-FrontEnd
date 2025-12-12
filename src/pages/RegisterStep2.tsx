import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

// Componente para el segundo paso del registro: verificación del código y registro final
// Este componente maneja la verificación del código enviado por email y el registro completo del usuario
// según el nuevo flujo de dos pasos implementado para mejorar la seguridad del registro
// Ahora usa SweetAlert para todas las notificaciones en lugar de alert nativo para consistencia visual
export const RegisterStep2: React.FC = () => {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const location = useLocation();
  const navigate = useNavigate();

  // Obtener la contraseña del estado de la ruta (pasada desde RegisterStep1)
  // La contraseña no se almacena en localStorage por razones de seguridad
  const password = location.state?.password;

  // Redirigir si no hay contraseña (seguridad) - previene acceso directo a este paso
  useEffect(() => {
    if (!password) {
      navigate("/register");
    }
  }, [password, navigate]);

  // Manejar cambios en los inputs del código
  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) return; // Solo permitir un dígito por input

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Mover al siguiente input automáticamente
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Manejar teclas de navegación
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Función para reenviar código
  const handleResendCode = async () => {
    setResendLoading(true);

    try {
      const email = localStorage.getItem("focusup:register:email");
      if (!email) {
        throw new Error("Correo electrónico no encontrado");
      }

      const { apiClient } = await import("../utils/apiClient");
      const { API_ENDPOINTS } = await import("../utils/constants");

      await apiClient.post(API_ENDPOINTS.REQUEST_VERIFICATION_CODE, {
        email,
        password,
      });

      // Mostrar mensaje de éxito con SweetAlert - Nuevo flujo usando SweetAlert en lugar de alert nativo
      await Swal.fire({
        title: 'Código reenviado',
        text: 'Se ha enviado un nuevo código de verificación a tu correo electrónico.',
        icon: 'success',
        timer: 3000,
        showConfirmButton: false,
        background: '#232323',
        color: '#ffffff',
        iconColor: '#22C55E',
      });
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { error?: string } }; message?: string };
      const errorMessage = apiError?.response?.data?.error || apiError?.message || "Error al reenviar código";
      await Swal.fire({
        title: 'Error al reenviar código',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'Entendido',
        background: '#232323',
        color: '#ffffff',
        confirmButtonColor: '#EF4444',
      });
    } finally {
      setResendLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join("");

    if (fullCode.length !== 6) {
      await Swal.fire({
        title: 'Código incompleto',
        text: 'Por favor ingresa el código completo de 6 dígitos',
        icon: 'warning',
        confirmButtonText: 'Entendido',
        background: '#232323',
        color: '#ffffff',
        confirmButtonColor: '#F59E0B',
      });
      return;
    }

    setLoading(true);

    try {
      // Recuperar datos almacenados de forma segura en localStorage durante el registro
      const email = localStorage.getItem("focusup:register:email");
      const username = localStorage.getItem("focusup:register:username");

      if (!email || !username) {
        throw new Error("Datos de registro incompletos");
      }

      const { apiClient } = await import("../utils/apiClient");
      const { API_ENDPOINTS } = await import("../utils/constants");

      // Paso 1: Verificar código de verificación enviado por email
      await apiClient.post(API_ENDPOINTS.VERIFY_CODE, {
        email,
        codigo: fullCode,
      });

      // Paso 2: Registrar usuario completo solo si la verificación fue exitosa
      await apiClient.post(API_ENDPOINTS.REGISTER, {
        email,
        username,
        password, // Contraseña obtenida de forma segura desde el estado de la ruta
      });

      // Limpiar datos temporales del proceso de registro
      localStorage.removeItem("focusup:register:email");
      localStorage.removeItem("focusup:register:username");

      // Marcar que es el primer login para mostrar el modal de encuesta en el próximo inicio de sesión
      localStorage.setItem("focusup:firstLogin", "true");

      // Mostrar alerta de éxito con SweetAlert y redirigir al login - Nuevo flujo usando SweetAlert para consistencia visual
      await Swal.fire({
        title: 'Registro completado',
        text: 'Tu cuenta ha sido creada exitosamente. Redirigiendo al inicio de sesión...',
        icon: 'success',
        timer: 3000,
        showConfirmButton: false,
        background: '#232323',
        color: '#ffffff',
        iconColor: '#22C55E',
      });
      navigate("/login");

    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { error?: string } }; message?: string };
      const errorMessage = apiError?.response?.data?.error || apiError?.message || "Error en el proceso de registro";
      // Mostrar error con SweetAlert en lugar de setError para consistencia
      await Swal.fire({
        title: 'Error en el registro',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'Entendido',
        background: '#232323',
        color: '#ffffff',
        confirmButtonColor: '#EF4444',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#171717] via-[#1a1a1a] to-[#171717] min-h-screen flex items-center justify-center p-5">
      <button
        onClick={() => navigate("/register")}
        className="absolute top-5 left-5 p-2 bg-none cursor-pointer"
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

      <div className="w-full max-w-md px-5">
        <div className="bg-gradient-to-br from-[#232323]/95 to-[#1a1a1a]/95 backdrop-blur-md p-8 rounded-xl shadow-2xl text-center border border-[#333]/50">
          <img
            src="/img/Logo.png"
            alt="Logo de Focus Up"
            className="w-48 mx-auto pb-6"
          />

          <form className="space-y-6" onSubmit={handleSubmit}>
            <p className="text-gray-100 text-center mb-8 text-lg font-medium">
              Hemos enviado un código de verificación a tu correo para completar el registro
            </p>

            <div className="flex justify-center gap-2 mb-8">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value.replace(/[^0-9]/g, ""))}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-2xl border-2 border-blue-500 rounded-lg bg-[#232323] text-white focus:outline-none focus:border-white"
                  maxLength={1}
                  required
                  aria-label={`Dígito ${index + 1}`}
                  disabled={loading}
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 cursor-pointer text-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {loading ? "Verificando y Registrando..." : "Verificar y Registrarme"}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={resendLoading}
                className="text-blue-400 hover:text-blue-300 text-sm underline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resendLoading ? "Reenviando..." : "Reenviar código"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterStep2;