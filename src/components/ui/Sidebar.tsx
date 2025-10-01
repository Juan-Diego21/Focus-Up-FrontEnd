import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { apiClient } from "../../utils/apiClient";
import { API_ENDPOINTS } from "../../utils/constants";
import {
  Bars3Icon,
  HomeIcon,
  Cog6ToothIcon,
  AdjustmentsHorizontalIcon,
  BellIcon,
  ChartBarIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
  UserIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

interface SidebarProps {
  currentPage?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage = "dashboard" }) => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);


  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  const handleDeleteAccount = () => {
    setShowDeleteModal(true);
  };

  const confirmDeleteAccount = async () => {
    if (!user?.id_usuario) {
      console.error("❌ No user ID available for deletion");
      setShowDeleteModal(false);
      return;
    }

    setDeleteLoading(true);
    try {
      console.log("🗑️ Deleting account for user ID:", user.id_usuario);
      await apiClient.delete(`${API_ENDPOINTS.USERS}/${user.id_usuario}`);
      console.log("✅ Account deleted successfully");

      // Show success alert
      setShowSuccessAlert(true);
      setShowDeleteModal(false);

      // Logout and redirect after a short delay
      setTimeout(() => {
        logout();
        window.location.href = "/login";
      }, 2000);

    } catch (error: any) {
      console.error("❌ Account deletion failed:", error);
      // Still logout and redirect even if API fails
      setShowDeleteModal(false);
      logout();
      window.location.href = "/login";
    } finally {
      setDeleteLoading(false);
    }
  };

  const navigateTo = (path: string) => {
    window.location.href = path;
  };

  return (
    <>
      {/* Sidebar Toggle Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-none rounded-lg hover:bg-[#2a2a2a] transition-all duration-200 cursor-pointer"
        aria-label="Mostrar/Ocultar menú"
      >
        <Bars3Icon className="w-6 h-6 text-white" />
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-gradient-to-b from-[#232323] to-[#1a1a1a] shadow-2xl flex flex-col p-6 z-40 border-r border-[#333] transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col items-center mb-10">
          <img
            src="/img/user.png"
            alt="Foto de usuario"
            className="w-16 h-16 rounded-full mb-3 border-4 border-[#333] shadow-lg"
          />
          <div className="text-center">
            <h3 className="text-white text-lg font-semibold tracking-tight">
              {user?.nombre_usuario || "Cargando..."}
            </h3>
            <p className="text-gray-400 text-xs">
              #{user?.id_usuario ? user.id_usuario.toString().padStart(6, '0') : "000000"}
            </p>
          </div>
        </div>

        <nav className="flex-1">
          <ul className="space-y-1">
            <li>
              <button
                onClick={() => navigateTo("/dashboard")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-white hover:bg-[#2a2a2a] hover:text-[#ffa200] group cursor-pointer ${
                  currentPage === "dashboard" ? "bg-[#2a2a2a] text-[#ffa200]" : ""
                }`}
              >
                <HomeIcon className="w-5 h-5 text-gray-400 group-hover:text-[#ffa200]" />
                <span className="font-medium">Inicio</span>
              </button>
            </li>
            <li>
              {/* Account Settings Button */}
              <div className="relative">
                <button
                  onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all text-white hover:bg-[#2a2a2a] group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Cog6ToothIcon className="w-5 h-5 text-gray-400 group-hover:text-[#ffa200]" />
                    <span className="font-medium text-left hover:text-[#ffa200]">Configuración de cuenta</span>
                  </div>
                  <ChevronDownIcon
                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                      accountMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Submenu */}
                {accountMenuOpen && (
                  <div className="ml-8 mt-2 space-y-1">
                    <button
                      onClick={() => navigateTo("/profile")}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#2a2a2a] transition-all text-gray-400 hover:text-[#ffa200] cursor-pointer"
                    >
                      <UserIcon className="w-4 h-4" />
                      <span className="text-sm">Editar perfil</span>
                    </button>
                    <button
                      onClick={handleDeleteAccount}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#2a2a2a] transition-all text-gray-400 hover:text-red-400 cursor-pointer"
                    >
                      <TrashIcon className="w-4 h-4" />
                      <span className="text-sm">Eliminar cuenta</span>
                    </button>
                  </div>
                )}
              </div>
            </li>
            <li>
              <button
                onClick={() => navigateTo("/preferences")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-white hover:bg-[#2a2a2a] hover:text-[#ffa200] group cursor-pointer"
              >
                <AdjustmentsHorizontalIcon className="w-5 h-5 text-gray-400 group-hover:text-[#ffa200]" />
                <span className="font-medium">Preferencias</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => navigateTo("/notifications")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-white hover:bg-[#2a2a2a] hover:text-[#ffa200] group cursor-pointer"
              >
                <BellIcon className="w-5 h-5 text-gray-400 group-hover:text-[#ffa200]" />
                <span className="font-medium">Notificaciones</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => navigateTo("/reports")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-white hover:bg-[#2a2a2a] hover:text-[#ffa200] group cursor-pointer"
              >
                <ChartBarIcon className="w-5 h-5 text-gray-400 group-hover:text-[#ffa200]" />
                <span className="font-medium">Reportes</span>
              </button>
            </li>
          </ul>
        </nav>

        <button
          onClick={handleLogout}
          className="mt-8 flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-all font-medium shadow-lg cursor-pointer"
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5" />
          Cerrar Sesión
        </button>
      </aside>

      {/* Account Deletion Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-opacity-40 backdrop-blur-md flex items-center justify-center z-50 p-4">
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
    </>
  );
};

export default Sidebar;