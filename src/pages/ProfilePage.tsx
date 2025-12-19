import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "../components/ui/Sidebar";
import { User, MapPin, Users, Lock, Eye, EyeOff, ChevronDown, TrashIcon, Calendar, AlertTriangle, Target } from "lucide-react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Listbox } from "@headlessui/react";
import Swal from "sweetalert2";
import type { User as UserType } from "../types/user";
import { validatePassword, validateDateOfBirth, validateUsername } from "../utils/validationUtils";
import { apiClient } from "../shared/services/apiClient";
import { API_ENDPOINTS } from "../utils/constants";

const countries = [
  "Colombia", "México", "Argentina", "Estados Unidos", "Canadá", "España",
  "Brasil", "Chile", "Perú", "Alemania", "Francia", "Italia", "Reino Unido", "Japón"
];

const genders = [
  "Masculino", "Femenino", "Otro", "Prefiero no decir"
];

// Opciones de intereses (objetivos) del usuario
const objectives = [
  { value: "1", label: "Estudio y Aprendizaje" },
  { value: "2", label: "Trabajo y Productividad" },
  { value: "3", label: "Tareas Domésticas y Organización Personal" },
  { value: "4", label: "Creatividad y Proyectos Personales" },
  { value: "5", label: "Salud Mental y Bienestar" },
];

// Opciones de distracciones comunes
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


export const ProfilePage: React.FC = () => {
  const { user, loading: authLoading, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre_usuario: "",
    pais: "",
    genero: "",
    fecha_nacimiento: new Date(),
    hours: "",
    minutes: "",
    period: "",
    intereses: [] as number[],
    distraction1: "",
    distraction2: "",
    objective: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Temporary input values for free typing (like CreateEventModal)
  const [tempHours, setTempHours] = useState('01');
  const [tempMinutes, setTempMinutes] = useState('00');

  // Cargar datos del usuario al montar el componente
  useEffect(() => {
    if (user) {
      // Convertir horario_fav de formato HH:MM:SS a componentes separados si existe
      let hours = "", minutes = "", period = "";
      if (user.horario_fav) {
        const [timePart] = user.horario_fav.split(' '); // Remover segundos si existen
        const [hourStr, minuteStr] = timePart.split(':');
        const hour = parseInt(hourStr);
        hours = (hour === 0 ? 12 : hour > 12 ? hour - 12 : hour).toString().padStart(2, '0');
        minutes = minuteStr;
        period = hour >= 12 ? "PM" : "AM";
      }

      // Asegurar que fecha_nacimiento sea un objeto Date válido
      let fechaNacimiento: Date;
      if (user.fecha_nacimiento) {
        if (user.fecha_nacimiento instanceof Date) {
          fechaNacimiento = user.fecha_nacimiento;
        } else if (typeof user.fecha_nacimiento === 'string') {
          // Convertir string de fecha a objeto Date
          const parsedDate = new Date(user.fecha_nacimiento);
          fechaNacimiento = isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
        } else {
          fechaNacimiento = new Date();
        }
      } else {
        fechaNacimiento = new Date();
      }

      // Convertir distracciones array a campos individuales para los dropdowns
      const distracciones = user.distracciones || [];
      const distraction1 = distracciones.length > 0 ? distracciones[0].toString() : "";
      const distraction2 = distracciones.length > 1 ? distracciones[1].toString() : "";

      setFormData({
        nombre_usuario: user.nombre_usuario || "",
        pais: user.pais || "",
        genero: user.genero || "",
        fecha_nacimiento: fechaNacimiento,
        hours,
        minutes,
        period,
        intereses: user.intereses || [],
        distraction1,
        distraction2,
        objective: user.intereses && user.intereses.length > 0 ? user.intereses[0].toString() : "",
      });

      // Inicializar valores temporales para los inputs de tiempo (como en CreateEventModal)
      setTempHours(hours || '01');
      setTempMinutes(minutes || '00');
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!user?.id_usuario) {
        throw new Error("Usuario no encontrado");
      }

      // Validar fecha de nacimiento
      const dateError = validateDateOfBirth(formData.fecha_nacimiento);
      if (dateError) {
        await Swal.fire({
          title: 'Fecha de nacimiento inválida',
          text: dateError,
          icon: 'error',
          confirmButtonText: 'Entendido',
          background: '#232323',
          color: '#ffffff',
          confirmButtonColor: '#EF4444',
        });
        return;
      }

      // Validar nombre de usuario si cambió - Validación solo en frontend ya que no existe endpoint check-username
      if (formData.nombre_usuario !== user.nombre_usuario) {
        const usernameError = validateUsername(formData.nombre_usuario);
        if (usernameError) {
          await Swal.fire({
            title: 'Nombre de usuario inválido',
            text: usernameError,
            icon: 'error',
            confirmButtonText: 'Entendido',
            background: '#232323',
            color: '#ffffff',
            confirmButtonColor: '#EF4444',
          });
          return;
        }
      }

      // Validar contraseña si se está cambiando - Asegurar que la contraseña actual no esté vacía y cumpla con requisitos
      if (showPasswordFields) {
        if (!passwordData.currentPassword || !passwordData.newPassword) {
          await Swal.fire({
            title: 'Campos incompletos',
            text: 'Por favor complete todos los campos de contraseña',
            icon: 'warning',
            confirmButtonText: 'Entendido',
            background: '#232323',
            color: '#ffffff',
            confirmButtonColor: '#F59E0B',
          });
          return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
          await Swal.fire({
            title: 'Contraseñas no coinciden',
            text: 'Las nuevas contraseñas no coinciden',
            icon: 'error',
            confirmButtonText: 'Entendido',
            background: '#232323',
            color: '#ffffff',
            confirmButtonColor: '#EF4444',
          });
          return;
        }

        const passwordError = validatePassword(passwordData.newPassword);
        if (passwordError) {
          await Swal.fire({
            title: 'Contraseña inválida',
            text: passwordError,
            icon: 'error',
            confirmButtonText: 'Entendido',
            background: '#232323',
            color: '#ffffff',
            confirmButtonColor: '#EF4444',
          });
          return;
        }
      }

      // Cambiar contraseña si se solicitó - Nuevo flujo usando PATCH /users/:id/password
      if (showPasswordFields) {
        try {

          await apiClient.patch(`${API_ENDPOINTS.USERS}/${user.id_usuario}/password`, {
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword
          });

          // Mostrar alerta de éxito para cambio de contraseña
          await Swal.fire({
            title: 'Contraseña cambiada',
            text: 'Tu contraseña ha sido actualizada exitosamente.',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
            background: '#232323',
            color: '#ffffff',
            iconColor: '#22C55E',
          });

          // Reset password fields
          setPasswordData({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          });
          setShowPasswordFields(false);

        } catch (passwordError: unknown) {
          let errorMessage = "Error al cambiar contraseña";
          if (passwordError && typeof passwordError === 'object' && 'error' in passwordError) {
            const err = passwordError as { error: string };
            if (err.error.includes('current password') || err.error.includes('incorrect')) {
              errorMessage = "La contraseña actual es incorrecta";
            } else if (err.error.includes('invalid') || err.error.includes('password')) {
              errorMessage = "La nueva contraseña no cumple con los requisitos";
            } else if (err.error.includes('not allowed') || err.error.includes('permission')) {
              errorMessage = "No tienes permisos para cambiar la contraseña de este usuario";
            } else {
              errorMessage = err.error;
            }
          }

          await Swal.fire({
            title: 'Error al cambiar contraseña',
            text: errorMessage,
            icon: 'error',
            confirmButtonText: 'Entendido',
            background: '#232323',
            color: '#ffffff',
            confirmButtonColor: '#EF4444',
          });
          return;
        }
      }

      // Convertir componentes de tiempo a formato HH:MM si están completos
      let horarioFav: string | null = null;
      if (formData.hours && formData.minutes && formData.period) {
        const hours24 = formData.period === "PM" && formData.hours !== "12" ? parseInt(formData.hours) + 12 : formData.period === "AM" && formData.hours === "12" ? 0 : parseInt(formData.hours);
        horarioFav = `${hours24.toString().padStart(2, '0')}:${formData.minutes.padStart(2, '0')}`;
      } else if (user?.horario_fav) {
        // Mantener el horario existente si no se modificó, convirtiendo de HH:MM:SS a HH:MM si es necesario
        horarioFav = user.horario_fav.includes(':') ? user.horario_fav.split(':').slice(0, 2).join(':') : user.horario_fav;
      }

      // Convertir campos de formulario al formato esperado por la API
      const distracciones = [
        formData.distraction1 ? parseInt(formData.distraction1) : null,
        formData.distraction2 ? parseInt(formData.distraction2) : null
      ].filter((id): id is number => id !== null && !isNaN(id));

      // Preparar datos filtrando valores null/undefined/vacíos
      const updateData: Record<string, unknown> = {
        nombre_usuario: formData.nombre_usuario,
        ...(formData.pais && { pais: formData.pais }),
        ...(formData.genero && { genero: formData.genero }),
        fecha_nacimiento: formData.fecha_nacimiento.toISOString().split('T')[0], // YYYY-MM-DD
        ...(horarioFav && { horario_fav: horarioFav }),
        intereses: formData.objective ? [parseInt(formData.objective)] : [],
        distracciones: distracciones,
      };

      // Se eliminó console.log para mantener código limpio en producción

      // Actualizar perfil propio usando el nuevo endpoint seguro
      await apiClient.put(API_ENDPOINTS.USERS, updateData);
      // Se eliminó console.log para mantener código limpio en producción

      // Actualizar los datos del usuario en el contexto de autenticación
      const updatedUserData: Partial<UserType> = {
        nombre_usuario: formData.nombre_usuario,
        pais: formData.pais,
        genero: formData.genero,
        fecha_nacimiento: formData.fecha_nacimiento,
        horario_fav: horarioFav || undefined,
        intereses: formData.objective ? [parseInt(formData.objective)] : [],
        distracciones: distracciones,
      };
      updateUser(updatedUserData);

      // Mostrar alerta de éxito
      await Swal.fire({
        title: '¡Perfil actualizado!',
        text: 'Los cambios en tu perfil han sido guardados correctamente.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        background: '#232323',
        color: '#ffffff',
        iconColor: '#22C55E',
      });

    } catch (err: unknown) {
      let errorMessage = "Error al actualizar perfil";
      if (err && typeof err === 'object' && 'message' in err) {
        errorMessage = (err as { message: string }).message;
      } else if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { error?: string } } };
        errorMessage = axiosError.response?.data?.error || errorMessage;
      }

      // Mostrar error de API con SweetAlert2
      await Swal.fire({
        title: 'Error al actualizar',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'Entendido',
        background: '#232323',
        color: '#ffffff',
        confirmButtonColor: '#EF4444',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    setShowDeleteModal(true);
  };

  // Función para confirmar eliminación de cuenta
  const confirmDeleteAccount = async () => {
    if (!user?.id_usuario) {
      setShowDeleteModal(false);
      return;
    }

    setDeleteLoading(true);
    try {
      // Llamar al endpoint DELETE /api/v1/users/me para eliminar la cuenta
      await apiClient.delete(`${API_ENDPOINTS.USERS}/me`);

      // Mostrar mensaje de éxito
      await Swal.fire({
        title: 'Cuenta eliminada',
        text: 'Tu cuenta ha sido eliminada exitosamente.',
        icon: 'success',
        confirmButtonText: 'Entendido',
        background: '#232323',
        color: '#ffffff',
        confirmButtonColor: '#22C55E',
      });

      // Cerrar modal y hacer logout
      setShowDeleteModal(false);
      logout();
      navigate('/landing');

    } catch (error: unknown) {
      let errorMessage = "Error al eliminar la cuenta";
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { error?: string } } };
        errorMessage = axiosError.response?.data?.error || errorMessage;
      }

      // Mostrar error
      await Swal.fire({
        title: 'Error al eliminar cuenta',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'Entendido',
        background: '#232323',
        color: '#ffffff',
        confirmButtonColor: '#EF4444',
      });

      setShowDeleteModal(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Mostrar loading mientras se carga la información del usuario
  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#171717] via-[#1a1a1a] to-[#171717] font-inter flex items-center justify-center">
        <div className="text-white text-lg">Cargando perfil...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#171717] via-[#1a1a1a] to-[#171717] font-inter">
      <Sidebar currentPage="profile" />

      {/* Main content */}
      <div className="flex justify-center items-center min-h-screen">
        <main className="w-full max-w-lg p-8 transition-all">
          <div className="mb-10">
            {/* Título principal */}
            <h1 className="text-3xl font-bold text-white mb-8 tracking-tight text-center bg-gradient-to-r from-white to-gray-300 bg-clip-text">
              Ajustes de Perfil
            </h1>

            <div className="bg-gradient-to-br from-[#232323]/95 to-[#1a1a1a]/95 backdrop-blur-md p-8 rounded-xl shadow-2xl border border-[#333]/50 hover:shadow-3xl transition-shadow duration-300">

          {/* Formulario */}
          <form className="space-y-6" onSubmit={handleSubmit}>

            {/* Nombre de usuario */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Nombre de usuario
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="nombre_usuario"
                  placeholder="Nombre de usuario"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200"
                  value={formData.nombre_usuario}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>

            {/* País */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                País
              </label>
              {/* Componente Listbox para selección de país con estilo consistente */}
              <Listbox value={formData.pais} onChange={(value) => setFormData((prev) => ({ ...prev, pais: value }))} disabled={loading}>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                  <Listbox.Button className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none focus:border-transparent transition-all duration-200 text-left disabled:opacity-50 disabled:cursor-not-allowed">
                    <span className="block truncate">
                      {formData.pais || "Selecciona un país"}
                    </span>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                  </Listbox.Button>
                  {/* Lista de opciones para país - se expande hacia abajo */}
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
              {/* Componente Listbox para selección de género con expansión hacia arriba */}
              <Listbox value={formData.genero} onChange={(value) => setFormData((prev) => ({ ...prev, genero: value }))} disabled={loading}>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                  <Listbox.Button className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none focus:border-transparent transition-all duration-200 text-left disabled:opacity-50 disabled:cursor-not-allowed">
                    <span className="block truncate">
                      {formData.genero || "Seleccionar género"}
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

            {/* Horario favorito - Implementación como en CreateEventModal */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Horario favorito para trabajar
              </label>
              <div className="grid grid-cols-3 gap-4">
                {/* Hours */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-400 mb-2">Horas</label>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={2}
                      value={tempHours}
                      onChange={(e) => {
                        // Allow completely free typing without restrictions
                        setTempHours(e.target.value);
                      }}
                      onBlur={() => {
                        // Validate and convert on blur
                        const numValue = parseInt(tempHours) || 0;
                        if (numValue < 1 || numValue > 12) {
                          setFormData(prev => ({ ...prev, hours: '1' }));
                          setTempHours('01');
                        } else {
                          setFormData(prev => ({ ...prev, hours: numValue.toString() }));
                          setTempHours(numValue.toString().padStart(2, '0'));
                        }
                      }}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 text-left pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                      placeholder="HH"
                    />
                    <Listbox value={formData.hours} onChange={(value) => {
                      setFormData(prev => ({ ...prev, hours: value }));
                      setTempHours(value.toString().padStart(2, '0'));
                    }}>
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Listbox.Button className="p-1 rounded hover:bg-gray-700">
                          <ChevronDown className="w-5 h-5 text-gray-400 pointer-events-none" />
                        </Listbox.Button>
                        <Listbox.Options className="absolute bottom-full mb-1 -left-6 z-50 w-20 bg-gray-800 border border-gray-600 rounded-lg shadow-lg max-h-40 focus:outline-none">
                          {Array.from({ length: 12 }, (_, i) => i + 1).map(hour => (
                            <Listbox.Option
                              key={hour}
                              value={hour}
                              className={({ active }) =>
                                `cursor-pointer select-none relative py-2 px-3 text-center transition-all duration-150 ${
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
                </div>

                {/* Minutes */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-400 mb-2">Minutos</label>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={2}
                      value={tempMinutes}
                      onChange={(e) => {
                        // Allow completely free typing without restrictions
                        setTempMinutes(e.target.value);
                      }}
                      onBlur={() => {
                        // Validate and convert on blur
                        const numValue = parseInt(tempMinutes) || 0;
                        if (numValue < 0 || numValue > 59) {
                          setFormData(prev => ({ ...prev, minutes: '0' }));
                          setTempMinutes('00');
                        } else {
                          setFormData(prev => ({ ...prev, minutes: numValue.toString() }));
                          setTempMinutes(numValue.toString().padStart(2, '0'));
                        }
                      }}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 text-left pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                      placeholder="MM"
                    />
                    <Listbox value={formData.minutes} onChange={(value) => {
                      setFormData(prev => ({ ...prev, minutes: value }));
                      setTempMinutes(value.toString().padStart(2, '0'));
                    }}>
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Listbox.Button className="p-1 rounded hover:bg-gray-700">
                          <ChevronDown className="w-5 h-5 text-gray-400 pointer-events-none" />
                        </Listbox.Button>
                        <Listbox.Options className="absolute bottom-full mb-1 -left-6 z-50 w-20 bg-gray-800 border border-gray-600 rounded-lg shadow-lg max-h-40 focus:outline-none">
                          {Array.from({ length: 60 }, (_, i) => i).map(minute => (
                            <Listbox.Option
                              key={minute}
                              value={minute}
                              className={({ active }) =>
                                `cursor-pointer select-none relative py-2 px-3 text-center transition-all duration-150 ${
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
                </div>

                {/* AM/PM */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-400 mb-2">AM/PM</label>
                  <Listbox value={formData.period} onChange={(value) => setFormData(prev => ({ ...prev, period: value }))}>
                    <div className="relative">
                      <Listbox.Button className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 text-left pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200">
                        <span className="block truncate">
                          {formData.period || "AM/PM"}
                        </span>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                      </Listbox.Button>
                      <Listbox.Options className="absolute bottom-full mb-1 left-0 z-50 w-full bg-gray-800 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none">
                        {[
                          { value: "AM", label: "AM" },
                          { value: "PM", label: "PM" }
                        ].map((period) => (
                          <Listbox.Option
                            key={period.value}
                            value={period.value}
                            className={({ active }) =>
                              `cursor-pointer select-none relative py-2 px-4 text-center transition-all duration-150 ${
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

            {/* Separador visual */}
            <div className="border-t border-gray-600 my-6"></div>

            {/* Fecha de nacimiento - Campo agregado para completar el perfil del usuario según el nuevo contrato del backend */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Fecha de nacimiento
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="fecha_nacimiento"
                  className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200 cursor-pointer hover:border-blue-400 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:opacity-0"
                  value={formData.fecha_nacimiento instanceof Date && !isNaN(formData.fecha_nacimiento.getTime()) ? formData.fecha_nacimiento.toISOString().split('T')[0] : ""}
                  onChange={(e) => {
                    const date = new Date(e.target.value);
                    if (!isNaN(date.getTime())) {
                      setFormData((prev) => ({
                        ...prev,
                        fecha_nacimiento: date,
                      }));
                    }
                  }}
                  disabled={loading}
                  ref={(input) => {
                    // Store reference to input for calendar icon click
                    if (input) (input as any)._dateInputRef = input;
                  }}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    // Find the input and focus it to open the date picker
                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                    if (input) {
                      input.focus();
                      // Try to open the date picker (works in some browsers)
                      input.showPicker?.();
                    }
                  }}
                  disabled={loading}
                  aria-label="Seleccionar fecha"
                >
                  <Calendar className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Distracciones más comunes - Dos campos de selección como en SurveyPage */}
            <div>
              <h1 className="text-left font-medium text-white text-lg mb-3">
                ¿Cuáles consideras que son tus 2 distracciones más comunes?
              </h1>

              <div className="space-y-4">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Primera distracción
                  </label>
                  <Listbox value={formData.distraction1} onChange={(value) => setFormData((prev) => ({ ...prev, distraction1: value }))} disabled={loading}>
                    <div className="relative">
                      <AlertTriangle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                      <Listbox.Button className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none focus:border-transparent transition-all duration-200 text-left cursor-pointer hover:border-blue-400">
                        <span className="block truncate">
                          {formData.distraction1 ? distractions.find(d => d.value === formData.distraction1)?.label : "Selecciona una distracción"}
                        </span>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                      </Listbox.Button>
                      <Listbox.Options className="absolute z-20 mt-1 w-full bg-gray-800 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none">
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
                  <Listbox value={formData.distraction2} onChange={(value) => setFormData((prev) => ({ ...prev, distraction2: value }))} disabled={loading}>
                    <div className="relative">
                      <AlertTriangle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                      <Listbox.Button className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none focus:border-transparent transition-all duration-200 text-left cursor-pointer hover:border-blue-400">
                        <span className="block truncate">
                          {formData.distraction2 ? distractions.find(d => d.value === formData.distraction2)?.label : "Selecciona una distracción"}
                        </span>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                      </Listbox.Button>
                      <Listbox.Options className="absolute z-20 mt-1 w-full bg-gray-800 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none">
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

            {/* Objetivo principal - Campo agregado para seleccionar el objetivo principal del usuario según el contrato del backend */}
            <div>
              <h1 className="text-left font-medium text-white text-lg mt-6 mb-3">
                ¿Cuál es tu objetivo principal al utilizar Focus Up?
              </h1>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Selecciona una opción
                </label>
                <Listbox value={formData.objective} onChange={(value) => setFormData((prev) => ({ ...prev, objective: value }))} disabled={loading}>
                  <div className="relative">
                    <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                    <Listbox.Button className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none focus:border-transparent transition-all duration-200 text-left cursor-pointer hover:border-blue-400">
                      <span className="block truncate">
                        {formData.objective ? objectives.find(o => o.value === formData.objective)?.label : "Selecciona una opción"}
                      </span>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                    </Listbox.Button>
                    <Listbox.Options className="absolute z-20 mt-1 w-full bg-gray-800 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none">
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

            {/* Separador visual */}
            <div className="border-t border-gray-600 my-6"></div>

            {/* Cambiar contraseña */}
            <div className="relative">
              {!showPasswordFields ? (
                <button
                  type="button"
                  onClick={() => setShowPasswordFields(true)}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#232323] transition-all duration-300 cursor-pointer shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  Cambiar contraseña
                </button>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Cambiar contraseña</h3>

                  {/* Contraseña actual */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Contraseña actual
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        name="currentPassword"
                        placeholder="Contraseña actual"
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        disabled={loading}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10 cursor-pointer"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Nueva contraseña */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Nueva contraseña
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type={showNewPassword ? "text" : "password"}
                        name="newPassword"
                        placeholder="Nueva contraseña"
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        disabled={loading}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10 cursor-pointer"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirmar nueva contraseña */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Confirmar nueva contraseña
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        placeholder="Confirmar nueva contraseña"
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        disabled={loading}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10 cursor-pointer"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordFields(false);
                      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
                    }}
                    className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white py-2 rounded-lg font-medium hover:from-gray-700 hover:to-gray-800 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                  >
                    Cancelar cambio de contraseña
                  </button>
                </div>
              )}
            </div>

            {/* Separador visual */}
            <div className="border-t border-gray-600 my-6"></div>

            {/* Eliminar cuenta */}
            <div className="relative">
              <button
                type="button"
                onClick={handleDeleteAccount}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 rounded-lg font-medium hover:from-red-700 hover:to-red-800 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-[#232323] transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                <TrashIcon className="w-5 h-5" />
                Eliminar cuenta
              </button>
            </div>

            {/* Botones */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#232323] transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-lg"
              >
                {loading ? "Guardando..." : "Guardar Cambios"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg font-medium hover:from-gray-700 hover:to-gray-800 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-[#232323] transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  </div>

  {/* Account Deletion Modal */}
  {showDeleteModal && (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-[#232323] rounded-2xl shadow-2xl p-8 w-full max-w-md border border-[#333]">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-white">Eliminar Cuenta</h3>
          <button
            onClick={() => setShowDeleteModal(false)}
            className="p-1 hover:bg-[#333] rounded-full transition-colors cursor-pointer"
          >
            <XMarkIcon className="w-6 h-6 text-gray-400" />
          </button>
        </div>
        <p className="mb-6 text-gray-300 text-lg">
          ¿Estás seguro de que quieres eliminar tu cuenta y todos tus datos
          asociados a ella?
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setShowDeleteModal(false)}
            disabled={deleteLoading}
            className="px-5 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-200 font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            No
          </button>
          <button
            onClick={confirmDeleteAccount}
            disabled={deleteLoading}
            className="px-5 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {deleteLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Eliminando...
              </>
            ) : (
              "Estoy seguro"
            )}
          </button>
        </div>
      </div>
    </div>
  )}

</div>
);
};

export default ProfilePage;