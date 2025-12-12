import React, { useState } from "react";
import { Mail } from "lucide-react";
import { apiClient } from "../utils/apiClient";
import { API_ENDPOINTS } from "../utils/constants";

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Llamada a la API para solicitar el código de restablecimiento
      await apiClient.post(API_ENDPOINTS.REQUEST_PASSWORD_RESET, {
        emailOrUsername: email,
      });

      // Guardar el email en localStorage para usarlo en el siguiente paso
      localStorage.setItem("resetEmail", email);

      // Redirigir al siguiente paso
      window.location.href = "/forgot-password-code";
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setError(apiError.message || "Error al enviar el código de verificación");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#171717] via-[#1a1a1a] to-[#171717] min-h-screen flex items-center justify-center p-5">
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
          <img
            src="/img/Logo.png"
            alt="Logo de Focus Up"
            className="w-48 mx-auto pb-6"
          />

          <h2 className="text-2xl font-bold text-gray-100">Restablecer contraseña</h2>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <p className="text-gray-400 text-center mb-6 text-sm font-medium">
              Ingresa el correo electrónico asociado a tu cuenta
            </p>

            <div className="relative">
              <label className="flex text-sm font-medium text-gray-200 mb-2">
                Correo electrónico <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  placeholder="Correo electrónico"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-sm mt-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all duration-200 cursor-pointer text-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {loading ? "Enviando..." : "Continuar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
export default ForgotPasswordPage;