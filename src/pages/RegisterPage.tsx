import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import type { RegisterRequest } from "../types/user";

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const [formData, setFormData] = useState<RegisterRequest>({
    nombre_usuario: "",
    correo: "",
    password: "",
    fecha_nacimiento: new Date(),
    pais: "",
    genero: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "fecha_nacimiento" ? new Date(value) : value,
    }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await register(formData);
    } catch (err: any) {
      setError(err.message || "Error al registrar usuario");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#171717] min-h-screen flex items-center justify-center font-inter p-5">
      <img
        src="/img/Back.png"
        alt="Volver atrás"
        className="absolute mt-5 ml-5 w-6 h-6 top-2.5 left-2.5 cursor-pointer"
        onClick={() => window.history.back()}
      />

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

            {/* Nombre de usuario */}
            <div>
              <input
                type="text"
                name="nombre_usuario"
                placeholder="Nombre de usuario"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white"
                required
                value={formData.nombre_usuario}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            {/* Email */}
            <div>
              <input
                type="email"
                name="correo"
                placeholder="Correo electrónico"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white"
                required
                value={formData.correo}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            {/* Contraseña */}
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

            {/* Confirmar Contraseña */}
            <div>
              <input
                type="password"
                placeholder="Confirmar Contraseña"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Botón Registro */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0690cf] text-white py-3 rounded-lg font-medium hover:bg-[#068fcf9a] transition cursor-pointer text-center disabled:opacity-50"
            >
              {loading ? "Registrando..." : "Registrarse"}
            </button>

            {/* Separador */}
            <div className="relative flex items-center justify-center text-gray-400">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="mx-4">o</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>

            {/* Botón Google */}
            <button
              type="button"
              className="w-full bg-white text-gray-800 py-3 rounded-lg font-medium border border-gray-300 flex items-center justify-center gap-2 hover:bg-gray-300 transition cursor-pointer"
            >
              <img src="/img/google.png" alt="Logo de Google" className="w-5" />
              Continuar con Google
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
export default RegisterPage;
