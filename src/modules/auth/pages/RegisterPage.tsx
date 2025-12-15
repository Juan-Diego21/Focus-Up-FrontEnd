import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { validateUsername, validateEmail, validatePassword } from "../../../utils/validationUtils";
import { API_ENDPOINTS } from "../../../utils/constants";

// Componente para el primer paso del registro: recopilar datos básicos
export const RegisterPage: React.FC = () => {
  // Estado del formulario simplificado para el primer paso
  const [formData, setFormData] = useState({
    nombre_usuario: "",
    correo: "",
    password: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [usernameError, setUsernameError] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");
  const [showPasswordHint, setShowPasswordHint] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    let newFormData = { ...formData };

    if (name === "nombre_usuario") {
      // Validación del nombre de usuario
      const error = value !== "" ? validateUsername(value) : null;
      setUsernameError(error || "");
      newFormData = {
        ...newFormData,
        [name]: value,
      };
    } else if (name === "correo") {
      // Validación del correo electrónico
      const error = value !== "" ? validateEmail(value) : null;
      setEmailError(error || "");
      newFormData = {
        ...newFormData,
        [name]: value,
      };
    } else if (name === "password") {
      // Validación de la contraseña
      const error = value !== "" ? validatePassword(value) : null;
      setPasswordError(error || "");
      newFormData = {
        ...newFormData,
        [name]: value,
      };
    }

    setFormData(newFormData);
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Validación completa del formulario antes de enviar
      if (usernameError || emailError || passwordError) {
        setError("Corrige los errores en el formulario antes de continuar.");
        return;
      }

      if (!formData.nombre_usuario || !formData.correo || !formData.password) {
        setError("Todos los campos obligatorios deben estar completos.");
        return;
      }

      if (formData.password !== confirmPassword) {
        setError("Las contraseñas no coinciden");
        return;
      }

      // Persistir nombre de usuario y correo en localStorage con claves namespaced
      // Se utiliza namespacing para evitar conflictos con otras claves del sistema
      localStorage.setItem("focusup:register:username", formData.nombre_usuario);
      localStorage.setItem("focusup:register:email", formData.correo);

      // Solicitar código de verificación al backend
      const { apiClient } = await import("../../../shared/services/apiClient");

      await apiClient.post(API_ENDPOINTS.REQUEST_VERIFICATION_CODE, {
        email: formData.correo,
        password: formData.password,
      });

      // Navegar al segundo paso pasando la contraseña por estado de ruta (no en localStorage por seguridad)
      navigate("/register/step2", {
        state: { password: formData.password }
      });

    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { error?: string } }; message?: string };
      const errorMessage = apiError?.response?.data?.error || apiError?.message || "Error al solicitar código de verificación";
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
            className="w-48 mx-auto pb-6"
          />

          {/* Formulario */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-500 text-white px-4 py-3 rounded-lg text-sm font-medium">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-500 text-white px-4 py-3 rounded-lg text-sm font-medium">
                {success}
              </div>
            )}

            {/* Nombre de usuario */}
            <div className="relative">
              <label className="flex text-sm font-medium text-gray-200 mb-2">
                Nombre de usuario <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="nombre_usuario"
                  placeholder="Nombre de usuario"
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg text-gray-900 bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200 ${usernameError ? 'border-red-500' : 'border-gray-300'}`}
                  required
                  value={formData.nombre_usuario}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
              {usernameError && (
                <p className="text-red-500 text-sm mt-1">{usernameError}</p>
              )}
            </div>

            {/* Email */}
            <div className="relative">
              <label className="flex text-sm font-medium text-gray-200 mb-2">
                Correo electrónico <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  name="correo"
                  placeholder="Correo electrónico"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200"
                  required
                  value={formData.correo}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
              {emailError && (
                <p className="text-red-500 text-sm mt-1">{emailError}</p>
              )}
            </div>

            {/* Contraseña */}
            <div className="relative">
              <label className="flex text-sm font-medium text-gray-200 mb-2">
                Contraseña <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Contraseña"
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setShowPasswordHint(true)}
                  onBlur={() => setShowPasswordHint(false)}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {/* Sugerencia de contraseña que aparece solo al enfocar el campo */}
              {showPasswordHint && (
                <div className="mt-2 text-sm text-gray-500 transition-all duration-200 ease-in-out animate-fade-in">
                  La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas y números.
                </div>
              )}
              {passwordError && (
                <p className="text-red-500 text-sm mt-1">{passwordError}</p>
              )}
            </div>

            {/* Confirmar Contraseña */}
            <div className="relative">
              <label className="flex text-sm font-medium text-gray-200 mb-2">
                Confirmar Contraseña <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirmar Contraseña"
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>


            {/* Botón Siguiente */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 cursor-pointer text-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-lg"
            >
              {loading ? "Solicitando código..." : "Siguiente"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
export default RegisterPage;

