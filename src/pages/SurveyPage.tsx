import React, { useState } from "react";
import type { RegisterRequest } from "../types/user";
import { Clock, Target, AlertTriangle } from "lucide-react";
import Swal from "sweetalert2";

export const SurveyPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [surveyData, setSurveyData] = useState({
    distraction1: "",
    distraction2: "",
    objective: "",
    horario_fav: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSurveyData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

        // Create extended payload with survey data
        const distracciones = [
          surveyData.distraction1 ? parseInt(surveyData.distraction1) : null,
          surveyData.distraction2 ? parseInt(surveyData.distraction2) : null
        ].filter((id): id is number => id !== null && !isNaN(id));

        const extendedPayload = {
          nombre_usuario: formData.nombre_usuario,
          correo: formData.correo,
          contrasena: formData.password,
          fecha_nacimiento: fechaNacimiento,
          pais: formData.pais || "",
          genero: formData.genero || "",
          horario_fav: surveyData.horario_fav || "",
          intereses: [1, 2, 3], // Default interests for now
          distracciones: distracciones,
        };

        // Enviar solicitud de registro con datos extendidos
        const { apiClient } = await import("../utils/apiClient");
        const { API_ENDPOINTS } = await import("../utils/constants");

        await apiClient.post(API_ENDPOINTS.USERS, extendedPayload);

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
      <div className="w-full max-w-lg px-5">
        <div className="bg-gradient-to-br from-[#232323]/95 to-[#1a1a1a]/95 backdrop-blur-md p-8 rounded-xl shadow-2xl border border-[#333]/50">
          {/* Logo */}
          <img
            src="/img/Logo.png"
            alt="Logo de Focus Up"
            className="w-72 mx-auto pb-6"
          />

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Primer Pregunta */}
            <div>
              <h1 className="text-left font-medium text-white text-lg mb-6">
                ¿Cuáles consideras que son tus 2 distracciones más comunes?
              </h1>

              <div className="space-y-4">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primera distracción
                  </label>
                  <div className="relative">
                    <AlertTriangle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="distraction1"
                      placeholder="Selecciona una distracción"
                      list="distractions"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      value={surveyData.distraction1}
                      onChange={handleChange}
                      required
                    />
                    <datalist id="distractions">
                      <option value="1">Redes sociales</option>
                      <option value="2">Mensajería instantánea</option>
                      <option value="3">Notificaciones del teléfono</option>
                      <option value="4">Correo electrónico</option>
                      <option value="5">Plataformas de video</option>
                      <option value="6">Juegos móviles o en línea</option>
                      <option value="7">Scroll infinito</option>
                      <option value="8">Compras online</option>
                      <option value="9">Ruidos externos</option>
                      <option value="10">Interrupciones de otras personas</option>
                      <option value="11">Hambre o sed</option>
                      <option value="12">Falta de comodidad</option>
                      <option value="13">Desorden en el espacio de trabajo</option>
                      <option value="14">Mascotas</option>
                      <option value="15">Pensamientos intrusivos</option>
                      <option value="16">Sueño/fatiga</option>
                      <option value="17">Aburrimiento</option>
                      <option value="18">Multitarea</option>
                      <option value="19">Día soñando despierto</option>
                      <option value="20">Estrés o ansiedad</option>
                    </datalist>
                  </div>
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Segunda distracción
                  </label>
                  <div className="relative">
                    <AlertTriangle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="distraction2"
                      placeholder="Selecciona una distracción"
                      list="distractions"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      value={surveyData.distraction2}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Segunda Pregunta */}
            <div>
              <h1 className="text-left font-medium text-white text-lg mb-6">
                ¿Cuál es tu objetivo principal al utilizar Focus Up?
              </h1>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selecciona una opción
                </label>
                <div className="relative">
                  <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="objective"
                    placeholder="Selecciona una opción"
                    list="objectives"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    value={surveyData.objective}
                    onChange={handleChange}
                    required
                  />
                  <datalist id="objectives">
                    <option value="1">Estudio y Aprendizaje</option>
                    <option value="2">Trabajo y Productividad</option>
                    <option value="3">Tareas Domésticas y Organización Personal</option>
                    <option value="4">Creatividad y Proyectos Personales</option>
                    <option value="5">Salud Mental y Bienestar</option>
                  </datalist>
                </div>
              </div>
            </div>

            {/* Horario Favorito */}
            <div>
              <h1 className="text-left font-medium text-white text-lg mb-6">
                ¿Cuál es tu horario favorito para trabajar?
              </h1>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selecciona un horario
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="time"
                    name="horario_fav"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    value={surveyData.horario_fav}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-500 text-white text-sm p-2 rounded mt-4">
                {error}
              </div>
            )}

            {/* Botón Terminar */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#232323] transition-all duration-200 cursor-pointer text-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {loading ? "Registrando..." : "Registrarse"}
            </button>
          </form>
        </div>
      </div>

    </div>
  );
};

export default SurveyPage;