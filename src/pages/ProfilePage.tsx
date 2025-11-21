import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Sidebar } from "../components/ui/Sidebar";
import { User, MapPin, Users, Lock, Eye, EyeOff, ChevronDown, TrashIcon } from "lucide-react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Listbox } from "@headlessui/react";

const countries = [
  "Colombia", "México", "Argentina", "Estados Unidos", "Canadá", "España",
  "Brasil", "Chile", "Perú", "Alemania", "Francia", "Italia", "Reino Unido", "Japón"
];

const genders = [
  "Masculino", "Femenino", "Otro", "Prefiero no decir"
];

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    nombre_usuario: "",
    pais: "",
    genero: "",
    hours: "",
    minutes: "",
    period: "",
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
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

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

      setFormData({
        nombre_usuario: user.nombre_usuario || "",
        pais: user.pais || "",
        genero: user.genero || "",
        hours,
        minutes,
        period,
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
    setSuccess("");
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (!user?.id_usuario) {
        throw new Error("Usuario no encontrado");
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

      const updateData: Record<string, unknown> = {
        nombre_usuario: formData.nombre_usuario,
        pais: formData.pais,
        genero: formData.genero,
        horario_fav: horarioFav,
      };

      // If password change is requested, validate and include it
      if (showPasswordFields) {
        if (!passwordData.currentPassword || !passwordData.newPassword) {
          throw new Error("Por favor complete todos los campos de contraseña");
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
          throw new Error("Las nuevas contraseñas no coinciden");
        }

        updateData.currentPassword = passwordData.currentPassword;
        updateData.newPassword = passwordData.newPassword;
      }

      const { apiClient } = await import("../utils/apiClient");
      const { API_ENDPOINTS } = await import("../utils/constants");

      await apiClient.put(`${API_ENDPOINTS.USERS}/${user.id_usuario}`, updateData);

      setSuccess("Perfil actualizado exitosamente");

      // Reset password fields
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowPasswordFields(false);

    } catch (err: unknown) {
      let errorMessage = "Error al actualizar perfil";
      if (err && typeof err === 'object' && 'message' in err) {
        errorMessage = (err as { message: string }).message;
      } else if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { error?: string } } };
        errorMessage = axiosError.response?.data?.error || errorMessage;
      }
      setError(errorMessage);
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
      const { apiClient } = await import("../utils/apiClient");
      const { API_ENDPOINTS } = await import("../utils/constants");

      await apiClient.delete(`${API_ENDPOINTS.USERS}/${user.id_usuario}`);

      // Mostrar alerta de éxito
      setShowSuccessAlert(true);
      setShowDeleteModal(false);

      // Cerrar sesión y redirigir después de un breve retraso
      setTimeout(() => {
        const { logout } = useAuth();
        logout();
        window.location.href = "/login";
      }, 2000);

    } catch {
      // ✅ Cerrar sesión y redirigir incluso si falla la API
      setShowDeleteModal(false);
      const { logout } = useAuth();
      logout();
      window.location.href = "/login";
    } finally {
      setDeleteLoading(false);
    }
  };

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

            <div className="bg-gradient-to-br from-[#232323]/95 to-[#1a1a1a]/95 backdrop-blur-md p-8 rounded-xl shadow-2xl border border-[#333]/50">

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

            {/* Horario favorito */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Horario favorito para trabajar
              </label>
              <div className="grid grid-cols-3 gap-4">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Horas
                  </label>
                  {/* Componente Listbox para selección de horas con expansión hacia arriba */}
                  <Listbox value={formData.hours} onChange={(value) => setFormData((prev) => ({ ...prev, hours: value }))} disabled={loading}>
                    <div className="relative">
                      <Listbox.Button className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-left pr-10 disabled:opacity-50 disabled:cursor-not-allowed">
                        <span className="block truncate">
                          {formData.hours || "HH"}
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
                  {/* Componente Listbox para selección de minutos con expansión hacia arriba */}
                  <Listbox value={formData.minutes} onChange={(value) => setFormData((prev) => ({ ...prev, minutes: value }))} disabled={loading}>
                    <div className="relative">
                      <Listbox.Button className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-left pr-10 disabled:opacity-50 disabled:cursor-not-allowed">
                        <span className="block truncate">
                          {formData.minutes || "MM"}
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
                  {/* Componente Listbox para selección de AM/PM con expansión hacia arriba */}
                  <Listbox value={formData.period} onChange={(value) => setFormData((prev) => ({ ...prev, period: value }))} disabled={loading}>
                    <div className="relative">
                      <Listbox.Button className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-left pr-10 disabled:opacity-50 disabled:cursor-not-allowed">
                        <span className="block truncate">
                          {formData.period || "AM/PM"}
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

            {/* Cambiar contraseña */}
            <div className="relative">
              {!showPasswordFields ? (
                <button
                  type="button"
                  onClick={() => setShowPasswordFields(true)}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 cursor-pointer"
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
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10"
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
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10"
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
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10"
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
                    className="w-full bg-gray-600 text-white py-2 rounded-lg font-medium hover:bg-gray-700 transition-all duration-200 cursor-pointer"
                  >
                    Cancelar cambio de contraseña
                  </button>
                </div>
              )}
            </div>

            {/* Eliminar cuenta */}
            <div className="relative">
              <button
                type="button"
                onClick={handleDeleteAccount}
                className="w-full bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
              >
                <TrashIcon className="w-5 h-5" />
                Eliminar cuenta
              </button>
            </div>

            {/* Botones */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#232323] transition-all duration-200 cursor-pointer shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-lg"
              >
                {loading ? "Guardando..." : "Guardar Cambios"}
              </button>
              <button
                type="button"
                onClick={() => window.location.href = "/dashboard"}
                className="w-full sm:w-auto px-6 py-3 ml-20 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-[#232323] transition-all duration-200 cursor-pointer shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
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

  {/* Success Alert */}
  {showSuccessAlert && (
    <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg border border-green-600">
      <div className="flex items-center gap-3">
        <div className="text-2xl">✅</div>
        <div>
          <h4 className="font-semibold">Cuenta eliminada</h4>
          <p className="text-sm opacity-90">Se redirigirá al inicio de sesión...</p>
        </div>
      </div>
    </div>
  )}
</div>
);
};

export default ProfilePage;