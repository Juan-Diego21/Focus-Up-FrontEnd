import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import type { LoginRequest } from "../types/user";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [formData, setFormData] = useState<LoginRequest>({
    correo: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(formData);
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { error?: string } }; message?: string };
      const errorMessage = apiError?.response?.data?.error || apiError?.message || "Error al iniciar sesión";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#171717] via-[#1a1a1a] to-[#171717] min-h-screen flex items-center justify-center font-inter p-5">
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

            {/* Campo para correo electrónico o nombre de usuario */}
            <div className="relative">
              <label className="flex text-sm font-medium text-gray-200 mb-2">
                Correo electrónico o nombre de usuario <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="correo"
                  placeholder="Correo electrónico o nombre de usuario"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200"
                  required
                  value={formData.correo}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Campo para contraseña */}
            <div className="relative">
              <label className="flex text-sm font-medium text-gray-200 mb-2">
                Contraseña <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/3 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Contraseña"
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/3 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                
                {/* Recuperar contraseña */}
                <div className="flex mt-2">
                  <a href="/forgot-password"
                    className="text-blue-500 hover:text-blue-600 text-sm font-medium transition-colors duration-200">
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
              </div>
            </div>

            {/* Botón para enviar el formulario */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 cursor-pointer text-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 mb-2"
            >
              {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </button>
            {/* Registro */}
            <div className="flex">
              <p className="text-gray-400 text-sm mr-2">¿Necesitas una cuenta?</p>
                <a
                href="/register"
                className="text-blue-500 hover:text-blue-600 text-sm font-medium transition-colors duration-200"
                >
                Registrarse
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
export default LoginPage;

