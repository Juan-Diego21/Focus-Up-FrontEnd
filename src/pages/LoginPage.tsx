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
            className="w-72 mx-auto pb-10"
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
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Correo electrónico o nombre de usuario
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="correo"
                  placeholder="Correo electrónico o nombre de usuario"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  required
                  value={formData.correo}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Campo para contraseña */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Contraseña"
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Botón para enviar el formulario */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 cursor-pointer text-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </button>

            {/* Separador visual */}
            <div className="relative flex items-center justify-center text-gray-400">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="mx-4 bg-none px-2">o</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>

            {/* Botón para continuar con Google */}
            <button
              type="button"
              className="w-full bg-white text-gray-800 py-3 rounded-lg font-medium border border-gray-300 flex items-center justify-center gap-2 hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 cursor-pointer shadow-md"
            >
              <img src="/img/google.png" alt="Logo de Google" className="w-5 h-5" />
              Continuar con Google
            </button>

            {/* Enlaces para registrarse y recuperar contraseña */}
            <div className="flex justify-between mt-6">
              <a
                href="/register"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-200"
              >
                Registrarse
              </a>
              <a
                href="/forgot-password"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-200"
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
export default LoginPage;
