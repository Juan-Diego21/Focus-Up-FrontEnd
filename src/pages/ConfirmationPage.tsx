import React, { useState } from "react";
import type { RegisterRequest } from "../types/user";
import Swal from "sweetalert2";

export const ConfirmationPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const handleYes = () => {
    window.location.href = "/survey";
  };

  const handleNo = async () => {
    setLoading(true);
    setError("");
    try {
      const storedData = localStorage.getItem("registrationData");
      if (storedData) {
        const formData: RegisterRequest = JSON.parse(storedData);

        // Ensure fecha_nacimiento is a string in YYYY-MM-DD format
        let fechaNacimiento: string | null = null;
        if (formData.fecha_nacimiento) {
          if (typeof formData.fecha_nacimiento === 'string') {
            fechaNacimiento = formData.fecha_nacimiento;
          } else if (formData.fecha_nacimiento instanceof Date && !isNaN(formData.fecha_nacimiento.getTime())) {
            fechaNacimiento = formData.fecha_nacimiento.toISOString().split('T')[0];
          }
        }

        const payload = {
          nombre_usuario: formData.nombre_usuario,
          correo: formData.correo,
          contrasena: formData.password,
          fecha_nacimiento: fechaNacimiento,
          pais: formData.pais || "",
          genero: formData.genero || "",
        };

        // Enviar solicitud de registro con datos básicos
        const { apiClient } = await import("../utils/apiClient");
        const { API_ENDPOINTS } = await import("../utils/constants");

        await apiClient.post(API_ENDPOINTS.USERS, payload);

        // Show SweetAlert2 success modal with custom styling
        await Swal.fire({
          title: '✅ Registro exitoso',
          text: 'Se redirigirá al iniciar sesión.',
          icon: 'success',
          confirmButtonText: 'Aceptar',
          background: '#232323',
          color: '#ffffff',
          customClass: {
            popup: 'rounded-xl shadow-2xl',
            confirmButton: 'bg-[#0690cf] hover:bg-[#068fcf9a] text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200',
          },
          backdrop: 'rgba(0, 0, 0, 0.3)',
          allowOutsideClick: false,
          allowEscapeKey: false,
        });

        // Redirect to login after modal is closed
        window.location.href = "/login";
      }
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { error?: string } }; message?: string };
      const errorMessage = apiError?.response?.data?.error || apiError?.message || "Error al registrar usuario";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#171717] via-[#1a1a1a] to-[#171717] min-h-screen flex items-center justify-center font-inter p-5">
      <button
        onClick={() => window.history.back()}
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
          {/* Logo */}
          <img
            src="/img/Logo.png"
            alt="Logo de Focus Up"
            className="w-72 mx-auto pb-6"
          />

          <h1 className="text-xl font-semibold text-white mb-8 leading-relaxed">
            ¡Para mejorar tu experiencia nos gustaría que nos ayudaras llenando
            la siguiente encuesta!
          </h1>

          {error && (
            <div className="bg-red-500 text-white text-sm p-2 rounded mt-2 mb-4">
              {error}
            </div>
          )}

          {/* Botones */}
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {/* Botón Continuar */}
            <button
              onClick={handleYes}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#232323] transition-all duration-200 cursor-pointer shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Continuar
            </button>

            {/* Botón Saltar */}
            <button
              onClick={handleNo}
              disabled={loading}
              className="px-6 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-[#232323] transition-all duration-200 cursor-pointer shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-lg"
            >
              {loading ? "Registrando..." : "No, gracias"}
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ConfirmationPage;