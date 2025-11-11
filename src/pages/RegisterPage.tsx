import React, { useState, useEffect } from "react";
import type { RegisterRequest } from "../types/user";
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react";


const usernameRegex = /^[a-zA-Z0-9_-]+$/;

export const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState<RegisterRequest>({
    nombre_usuario: "",
    correo: "",
    password: "",
    fecha_nacimiento: new Date(),
    pais: "",
    genero: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [usernameError, setUsernameError] = useState<string>("");

  // Load saved form data on component mount
  useEffect(() => {
    const savedData = localStorage.getItem("registrationFormData");
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        // Convert fecha_nacimiento back to Date object
        if (parsedData.fecha_nacimiento) {
          parsedData.fecha_nacimiento = new Date(parsedData.fecha_nacimiento);
        }
        setFormData(parsedData);
      } catch (error) {
        console.error("Error loading saved form data:", error);
      }
    }
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    let newFormData = { ...formData };

    if (name === "fecha_nacimiento") {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        newFormData = {
          ...newFormData,
          [name]: date,
        };
      }
    } else if (name === "nombre_usuario") {
      if (!usernameRegex.test(value) && value !== "") {
        setUsernameError("El nombre de usuario solo puede contener letras, números, guion bajo y guion.");
      } else {
        setUsernameError("");
      }
      newFormData = {
        ...newFormData,
        [name]: value,
      };
    } else {
      newFormData = {
        ...newFormData,
        [name]: value,
      };
    }

    setFormData(newFormData);
    // Save to localStorage for persistence
    localStorage.setItem("registrationFormData", JSON.stringify(newFormData));
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (usernameError) {
      setError("Corrige los errores en el formulario antes de continuar.");
      return;
    }

    if (formData.password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    // Store form data in localStorage for later use
    localStorage.setItem("registrationData", JSON.stringify(formData));

    // Redirect to confirmation page
    window.location.href = "/confirmation";
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
            className="w-72 mx-auto pb-10"
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
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Nombre de usuario <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="nombre_usuario"
                  placeholder="Nombre de usuario"
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${usernameError ? 'border-red-500' : 'border-gray-300'}`}
                  required
                  value={formData.nombre_usuario}
                  onChange={handleChange}
                  disabled={false}
                />
              </div>
              {usernameError && (
                <p className="text-red-500 text-sm mt-1">{usernameError}</p>
              )}
            </div>

            {/* Email */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Correo electrónico <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  name="correo"
                  placeholder="Correo electrónico"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  required
                  value={formData.correo}
                  onChange={handleChange}
                  disabled={false}
                />
              </div>
            </div>

            {/* Contraseña */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Contraseña <span className="text-red-500">*</span>
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
                  disabled={false}
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

            {/* Confirmar Contraseña */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Confirmar Contraseña <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirmar Contraseña"
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={false}
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
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 cursor-pointer text-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Siguiente
            </button>

            {/* Separador */}
            <div className="relative flex items-center justify-center text-gray-400">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="mx-4 bg-none px-2">o</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>

            {/* Botón Google */}
            <button
              type="button"
              className="w-full bg-white text-gray-800 py-3 rounded-lg font-medium border border-gray-300 flex items-center justify-center gap-2 hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 cursor-pointer shadow-md"
            >
              <img src="/img/google.png" alt="Logo de Google" className="w-5 h-5" />
              Continuar con Google
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
export default RegisterPage;
