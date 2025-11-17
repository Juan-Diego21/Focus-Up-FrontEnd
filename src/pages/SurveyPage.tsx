import React, { useState, useEffect } from "react";
import type { RegisterRequest } from "../types/user";
import { Target, AlertTriangle, ChevronDown, Calendar, MapPin, Users } from "lucide-react";
import { Listbox } from "@headlessui/react";
import Swal from "sweetalert2";

const countries = [
  "Colombia", "México", "Argentina", "Estados Unidos", "Canadá", "España",
  "Brasil", "Chile", "Perú", "Alemania", "Francia", "Italia", "Reino Unido", "Japón"
];

const genders = [
  "Masculino", "Femenino", "Otro", "Prefiero no decir"
];

const distractions = [
  { value: "1", label: "Redes sociales" },
  { value: "2", label: "Mensajería instantánea" },
  { value: "3", label: "Notificaciones del teléfono" },
  { value: "4", label: "Correo electrónico" },
  { value: "5", label: "Plataformas de video" },
  { value: "6", label: "Juegos móviles o en línea" },
  { value: "7", label: "Scroll infinito" },
  { value: "8", label: "Compras online" },
  { value: "9", label: "Ruidos externos" },
  { value: "10", label: "Interrupciones de otras personas" },
  { value: "11", label: "Hambre o sed" },
  { value: "12", label: "Falta de comodidad" },
  { value: "13", label: "Desorden en el espacio de trabajo" },
  { value: "14", label: "Mascotas" },
  { value: "15", label: "Pensamientos intrusivos" },
  { value: "16", label: "Sueño/fatiga" },
  { value: "17", label: "Aburrimiento" },
  { value: "18", label: "Multitarea" },
  { value: "19", label: "Día soñando despierto" },
  { value: "20", label: "Estrés o ansiedad" },
];

const objectives = [
  { value: "1", label: "Estudio y Aprendizaje" },
  { value: "2", label: "Trabajo y Productividad" },
  { value: "3", label: "Tareas Domésticas y Organización Personal" },
  { value: "4", label: "Creatividad y Proyectos Personales" },
  { value: "5", label: "Salud Mental y Bienestar" },
];

export const SurveyPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [surveyData, setSurveyData] = useState({
    fecha_nacimiento: new Date(),
    pais: "",
    genero: "",
    distraction1: "",
    distraction2: "",
    objective: "",
    hours: "",
    minutes: "",
    period: "",
  });

  const isInitialFieldsComplete = surveyData.fecha_nacimiento && surveyData.pais && surveyData.genero;

  // Scroll lock until initial questions are answered
  useEffect(() => {
    document.body.style.overflow = isInitialFieldsComplete ? 'auto' : 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isInitialFieldsComplete]);

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

        // Aseegurarse que fecha_nacimiento es string en formato YYYY-MM-DD para la encuesta
        let fechaNacimiento: string | null = null;
        if (formData.fecha_nacimiento) {
          if (typeof formData.fecha_nacimiento === 'string') {
            fechaNacimiento = formData.fecha_nacimiento;
          } else if (formData.fecha_nacimiento instanceof Date && !isNaN(formData.fecha_nacimiento.getTime())) {
            fechaNacimiento = formData.fecha_nacimiento.toISOString().split('T')[0];
          }
        }

        // Crear el cuerpo de la petición con la información extentida
        const distracciones = [
          surveyData.distraction1 ? parseInt(surveyData.distraction1) : null,
          surveyData.distraction2 ? parseInt(surveyData.distraction2) : null
        ].filter((id): id is number => id !== null && !isNaN(id));

        // Combinar los componentes de tiempo en formato HH:MM como espera el backend
        let horarioFav: string | null = null;
        if (surveyData.hours && surveyData.minutes && surveyData.period) {
          const hours24 = surveyData.period === "PM" && surveyData.hours !== "12" ? parseInt(surveyData.hours) + 12 : surveyData.period === "AM" && surveyData.hours === "12" ? 0 : parseInt(surveyData.hours);
          horarioFav = `${hours24.toString().padStart(2, '0')}:${surveyData.minutes.padStart(2, '0')}`;
        }

        // Aseegurarse que fecha_nacimiento es string en formato YYYY-MM-DD para la encuesta
        let surveyFechaNacimiento: string | null = null;
        if (surveyData.fecha_nacimiento) {
          if (typeof surveyData.fecha_nacimiento === 'string') {
            surveyFechaNacimiento = surveyData.fecha_nacimiento;
          } else if (surveyData.fecha_nacimiento instanceof Date && !isNaN(surveyData.fecha_nacimiento.getTime())) {
            surveyFechaNacimiento = surveyData.fecha_nacimiento.toISOString().split('T')[0];
          }
        }

        const extendedPayload = {
          nombre_usuario: formData.nombre_usuario,
          correo: formData.correo,
          contrasena: formData.password,
          fecha_nacimiento: surveyFechaNacimiento || fechaNacimiento,
          pais: surveyData.pais || formData.pais || "",
          genero: surveyData.genero || formData.genero || "",
          horario_fav: horarioFav || "",
          intereses: [1, 2, 3], // Default interests for now
          distracciones: distracciones,
          objetivo: surveyData.objective ? parseInt(surveyData.objective) : null,
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
            {/* Información Personal */}
            <div>
              <h1 className="text-left font-medium text-white text-lg mb-3">
                Información personal
              </h1>

              <div className="space-y-4">
                {/* Fecha de nacimiento */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Fecha de nacimiento
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="date"
                      name="fecha_nacimiento"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none focus:border-transparent transition-all duration-200"
                      value={!isNaN(surveyData.fecha_nacimiento.getTime()) ? surveyData.fecha_nacimiento.toISOString().split('T')[0] : ""}
                      onChange={(e) => {
                        const date = new Date(e.target.value);
                        if (!isNaN(date.getTime())) {
                          setSurveyData((prev) => ({
                            ...prev,
                            fecha_nacimiento: date,
                          }));
                        }
                      }}
                    />
                  </div>
                </div>

                {/* País */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    País
                  </label>
                  <Listbox value={surveyData.pais} onChange={(value) => setSurveyData((prev) => ({ ...prev, pais: value }))}>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                      <Listbox.Button className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none focus:border-transparent transition-all duration-200 text-left">
                        <span className="block truncate">
                          {surveyData.pais || "Selecciona un país"}
                        </span>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                      </Listbox.Button>
                      <Listbox.Options className="absolute z-20 mt-1 w-full bg-gray-800 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none">
                        {countries.map((country) => (
                          <Listbox.Option
                            key={country}
                            value={country}
                            className={({ active }) =>
                              `cursor-pointer select-none relative py-2 pl-4 pr-4 text-center transition-all duration-150 ${
                                active ? 'bg-gray-700 text-white' : 'text-gray-200'
                              }`
                            }
                          >
                            {({ selected }) => (
                              <>
                                <span className={`block ${selected ? 'font-medium' : 'font-normal'}`}>
                                  {country}
                                </span>
                              </>
                            )}
                          </Listbox.Option>
                        ))}
                      </Listbox.Options>
                    </div>
                  </Listbox>
                </div>

                {/* Género */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Género
                  </label>
                  <Listbox value={surveyData.genero} onChange={(value) => setSurveyData((prev) => ({ ...prev, genero: value }))}>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                      <Listbox.Button className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-1 focus:ring-blue-500 focus:border-transparent focus:outline-none transition-all duration-200 text-left">
                        <span className="block truncate">
                          {surveyData.genero || "Selecciona un género"}
                        </span>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                      </Listbox.Button>
                      {/* Lista de opciones para género - se expande hacia arriba para evitar cortes */}
                      <Listbox.Options className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 z-30 w-full bg-gray-800 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none">
                        {genders.map((gender) => (
                          <Listbox.Option
                            key={gender}
                            value={gender}
                            className={({ active }) =>
                              `cursor-pointer select-none relative py-2 pl-4 pr-4 text-center transition-all duration-150 ${
                                active ? 'bg-gray-700 text-white' : 'text-gray-200'
                              }`
                            }
                          >
                            {({ selected }) => (
                              <>
                                <span className={`block ${selected ? 'font-medium' : 'font-normal'}`}>
                                  {gender}
                                </span>
                              </>
                            )}
                          </Listbox.Option>
                        ))}
                      </Listbox.Options>
                    </div>
                  </Listbox>
                </div>
              </div>
            </div>

            {/* Otros campos - Revelados después de llenar los anteriores */}
            <div className={`transition-all duration-500 ease-in-out ${isInitialFieldsComplete ? 'opacity-100 max-h-screen' : 'opacity-0 max-h-0'} overflow-visible`}>
            {/* Primer Pregunta */}
            <div>
              <h1 className="text-left font-medium text-white text-lg mb-3">
                ¿Cuáles consideras que son tus 2 distracciones más comunes?
              </h1>

              <div className="space-y-4">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Primera distracción
                  </label>
                  <Listbox value={surveyData.distraction1} onChange={(value) => handleChange({ target: { name: 'distraction1', value } } as React.ChangeEvent<HTMLSelectElement>)}>
                    <div className="relative">
                      <AlertTriangle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                      <Listbox.Button className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-left">
                        <span className="block truncate">
                          {surveyData.distraction1 ? distractions.find(d => d.value === surveyData.distraction1)?.label : "Selecciona una distracción"}
                        </span>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                      </Listbox.Button>
                      <Listbox.Options className="absolute left-1/2 -translate-x-1/2 z-30 mt-1 w-full bg-gray-800 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none">
                        {distractions.map((distraction) => (
                          <Listbox.Option
                            key={distraction.value}
                            value={distraction.value}
                            className={({ active }) =>
                              `cursor-pointer select-none relative py-2 pl-4 pr-4 text-center transition-all duration-150 ${
                                active ? 'bg-gray-700 text-white' : 'text-gray-200'
                              }`
                            }
                          >
                            {({ selected }) => (
                              <>
                                <span className={`block ${selected ? 'font-medium' : 'font-normal'}`}>
                                  {distraction.label}
                                </span>
                              </>
                            )}
                          </Listbox.Option>
                        ))}
                      </Listbox.Options>
                    </div>
                  </Listbox>
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Segunda distracción
                  </label>
                  <Listbox value={surveyData.distraction2} onChange={(value) => handleChange({ target: { name: 'distraction2', value } } as React.ChangeEvent<HTMLSelectElement>)}>
                    <div className="relative">
                      <AlertTriangle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                      <Listbox.Button className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-left">
                        <span className="block truncate">
                          {surveyData.distraction2 ? distractions.find(d => d.value === surveyData.distraction2)?.label : "Selecciona una distracción"}
                        </span>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                      </Listbox.Button>
                      <Listbox.Options className="absolute left-1/2 -translate-x-1/2 z-30 mt-1 w-full bg-gray-800 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none">
                        {distractions.map((distraction) => (
                          <Listbox.Option
                            key={distraction.value}
                            value={distraction.value}
                            className={({ active }) =>
                              `cursor-pointer select-none relative py-2 pl-4 pr-4 text-center transition-all duration-150 ${
                                active ? 'bg-gray-700 text-white' : 'text-gray-200'
                              }`
                            }
                          >
                            {({ selected }) => (
                              <>
                                <span className={`block ${selected ? 'font-medium' : 'font-normal'}`}>
                                  {distraction.label}
                                </span>
                              </>
                            )}
                          </Listbox.Option>
                        ))}
                      </Listbox.Options>
                    </div>
                  </Listbox>
                </div>
              </div>
            </div>

            {/* Segunda Pregunta */}
            <div>
              <h1 className="text-left font-medium text-white text-lg mt-6 mb-3">
                ¿Cuál es tu objetivo principal al utilizar Focus Up?
              </h1>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Selecciona una opción
                </label>
                <Listbox value={surveyData.objective} onChange={(value) => handleChange({ target: { name: 'objective', value } } as React.ChangeEvent<HTMLSelectElement>)}>
                  <div className="relative">
                    <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                    <Listbox.Button className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-left">
                      <span className="block truncate">
                        {surveyData.objective ? objectives.find(o => o.value === surveyData.objective)?.label : "Selecciona una opción"}
                      </span>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                    </Listbox.Button>
                    <Listbox.Options className="absolute left-1/2 -translate-x-1/2 z-30 mt-1 w-full bg-gray-800 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none">
                      {objectives.map((objective) => (
                        <Listbox.Option
                          key={objective.value}
                          value={objective.value}
                          className={({ active }) =>
                            `cursor-pointer select-none relative py-2 pl-4 pr-4 text-center transition-all duration-150 ${
                              active ? 'bg-gray-700 text-white' : 'text-gray-200'
                            }`
                          }
                        >
                          {({ selected }) => (
                            <>
                              <span className={`block ${selected ? 'font-medium' : 'font-normal'}`}>
                                {objective.label}
                              </span>
                            </>
                          )}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </div>
                </Listbox>
              </div>
            </div>

            {/* Horario Favorito */}
            <div>
              <h1 className="text-left font-medium text-white text-lg mt-6 mb-3">
                ¿Cuál es tu horario favorito para trabajar?
              </h1>

              <div className="grid grid-cols-3 gap-4">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Horas
                  </label>
                  <Listbox value={surveyData.hours} onChange={(value) => handleChange({ target: { name: 'hours', value } } as React.ChangeEvent<HTMLSelectElement>)}>
                    <div className="relative">
                      <Listbox.Button className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-left pr-10">
                        <span className="block truncate">
                          {surveyData.hours || "HH"}
                        </span>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                      </Listbox.Button>
                      {/* Lista de opciones para horas - se expande hacia arriba para evitar cortes */}
                      <Listbox.Options className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 z-30 w-full bg-gray-800 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none">
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(hour => (
                          <Listbox.Option
                            key={hour}
                            value={hour.toString().padStart(2, '0')}
                            className={({ active }) =>
                              `cursor-pointer select-none relative py-2 pl-4 pr-4 text-center transition-all duration-150 ${
                                active ? 'bg-gray-700 text-white' : 'text-gray-200'
                              }`
                            }
                          >
                            {({ selected }) => (
                              <>
                                <span className={`block ${selected ? 'font-medium' : 'font-normal'}`}>
                                  {hour.toString().padStart(2, '0')}
                                </span>
                              </>
                            )}
                          </Listbox.Option>
                        ))}
                      </Listbox.Options>
                    </div>
                  </Listbox>
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Minutos
                  </label>
                  <Listbox value={surveyData.minutes} onChange={(value) => handleChange({ target: { name: 'minutes', value } } as React.ChangeEvent<HTMLSelectElement>)}>
                    <div className="relative">
                      <Listbox.Button className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-left pr-10">
                        <span className="block truncate">
                          {surveyData.minutes || "MM"}
                        </span>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                      </Listbox.Button>
                      {/* Lista de opciones para minutos - se expande hacia arriba para evitar cortes */}
                      <Listbox.Options className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 z-30 w-full bg-gray-800 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none">
                        {Array.from({ length: 60 }, (_, i) => i).map(minute => (
                          <Listbox.Option
                            key={minute}
                            value={minute.toString().padStart(2, '0')}
                            className={({ active }) =>
                              `cursor-pointer select-none relative py-2 pl-4 pr-4 text-center transition-all duration-150 ${
                                active ? 'bg-gray-700 text-white' : 'text-gray-200'
                              }`
                            }
                          >
                            {({ selected }) => (
                              <>
                                <span className={`block ${selected ? 'font-medium' : 'font-normal'}`}>
                                  {minute.toString().padStart(2, '0')}
                                </span>
                              </>
                            )}
                          </Listbox.Option>
                        ))}
                      </Listbox.Options>
                    </div>
                  </Listbox>
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    AM/PM
                  </label>
                  <Listbox value={surveyData.period} onChange={(value) => handleChange({ target: { name: 'period', value } } as React.ChangeEvent<HTMLSelectElement>)}>
                    <div className="relative">
                      <Listbox.Button className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-left pr-10">
                        <span className="block truncate">
                          {surveyData.period || "AM/PM"}
                        </span>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                      </Listbox.Button>
                      {/* Lista de opciones para AM/PM - se expande hacia arriba para evitar cortes */}
                      <Listbox.Options className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 z-30 w-full bg-gray-800 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none">
                        {[
                          { value: "AM", label: "AM" },
                          { value: "PM", label: "PM" }
                        ].map((period) => (
                          <Listbox.Option
                            key={period.value}
                            value={period.value}
                            className={({ active }) =>
                              `cursor-pointer select-none relative py-2 pl-4 pr-4 text-center transition-all duration-150 ${
                                active ? 'bg-gray-700 text-white' : 'text-gray-200'
                              }`
                            }
                          >
                            {({ selected }) => (
                              <>
                                <span className={`block ${selected ? 'font-medium' : 'font-normal'}`}>
                                  {period.label}
                                </span>
                              </>
                            )}
                          </Listbox.Option>
                        ))}
                      </Listbox.Options>
                    </div>
                  </Listbox>
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
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 focus:ring-1 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#232323] transition-all duration-200 cursor-pointer text-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 mt-6"
            >
              {loading ? "Registrando..." : "Registrarse"}
            </button>
            </div>
          </form>
        </div>
      </div>

    </div>
  );
};

export default SurveyPage;