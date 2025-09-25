import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import type { LoginRequest } from "../types/user";

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [formData, setFormData] = useState<LoginRequest>({
    correo: "",
    password: "",
  });
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
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#171717] min-h-screen flex items-center justify-center font-inter p-5">
      <div className="w-full max-w-md px-5">
        <div className="bg-[#232323] p-8 rounded-xl shadow-lg text-center">
          {/* Logo */}
          <img
            src="/img/Logo.png"
            alt="Logo de Focus Up"
            className="w-72 mx-auto pb-10"
          />

          {/* Formulario */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-500 text-white px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Campo para correo electrónico */}
            <div>
              <input
                type="email"
                name="correo"
                placeholder="Correo electrónico"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-white bg-gray-800"
                required
                value={formData.correo}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            {/* Campo para contraseña */}
            <div>
              <input
                type="password"
                name="password"
                placeholder="Contraseña"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white"
                required
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            {/* Botón para enviar el formulario */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0690cf] hover:bg-[#068fcf9a] text-white py-3 rounded-lg font-medium transition cursor-pointer flex items-center justify-center disabled:opacity-50"
            >
              {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </button>

            {/* Separador visual */}
            <div className="relative flex items-center justify-center text-gray-400">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="mx-4">o</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>

            {/* Botón para continuar con Google */}
            <button
              type="button"
              className="w-full bg-white text-gray-800 py-3 rounded-lg font-medium border border-gray-300 flex items-center justify-center gap-2 hover:bg-gray-300 transition cursor-pointer"
            >
              <img src="/img/google.png" alt="Logo de Google" className="w-5" />
              Continuar con Google
            </button>

            {/* Enlaces para registrarse y recuperar contraseña */}
            <div className="flex justify-between mt-5">
              <a
                href="/register"
                className="text-[#0690cf] hover:text-white text-sm transition"
              >
                Registrarse
              </a>
              <a
                href="/forgot-password"
                className="text-[#0690cf] hover:text-white text-sm transition"
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
