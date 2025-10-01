import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
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

export const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  const handleDeleteAccount = () => {
    setShowDeleteModal(true);
  };

  const confirmDeleteAccount = () => {
    // Here you would implement the account deletion logic
    console.log("Account deletion confirmed");
    setShowDeleteModal(false);
    // After deletion, logout
    logout();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-[#171717] font-inter">
      {/* Sidebar Toggle Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-none border border-none rounded-lg hover:bg-[#2a2a2a] transition-all duration-200 cursor-pointer"
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
              {user?.nombre_usuario || "Usuario"}
            </h3>
            <p className="text-gray-400 text-xs">ID-{user?.id_usuario || "000000"}</p>
          </div>
        </div>

        <nav className="flex-1">
          <ul className="space-y-1">
            <li>
              <a
                href="#"
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-white hover:bg-[#2a2a2a] hover:text-blue-400 group"
              >
                <HomeIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-400" />
                <span className="font-medium">Inicio</span>
              </a>
            </li>
            <li>
              {/* Account Settings Button */}
              <div className="relative">
                <button
                  onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all text-white hover:bg-[#2a2a2a] group"
                >
              <div className="flex-1 flex items-center gap-3">
                <Cog6ToothIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-400" />
                <span className="font-medium text-left">Configuración de cuenta</span>
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
                    <a
                      href="#"
                      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#2a2a2a] transition-all text-gray-400 hover:text-blue-400"
                    >
                      <UserIcon className="w-4 h-4" />
                      <span className="text-sm">Editar perfil</span>
                    </a>
                    <button
                      onClick={handleDeleteAccount}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#2a2a2a] transition-all text-gray-400 hover:text-red-400"
                    >
                      <TrashIcon className="w-4 h-4" />
                      <span className="text-sm">Eliminar cuenta</span>
                    </button>
                  </div>
                )}
              </div>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-white hover:bg-[#2a2a2a] hover:text-blue-400 group"
              >
                <AdjustmentsHorizontalIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-400" />
                <span className="font-medium">Preferencias</span>
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-white hover:bg-[#2a2a2a] hover:text-blue-400 group"
              >
                <BellIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-400" />
                <span className="font-medium">Notificaciones</span>
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-white hover:bg-[#2a2a2a] hover:text-blue-400 group"
              >
                <ChartBarIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-400" />
                <span className="font-medium">Reportes</span>
              </a>
            </li>
          </ul>
        </nav>

        <button
          onClick={handleLogout}
          className="mt-8 flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-all font-medium shadow-lg"
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5" />
          Cerrar Sesión
        </button>
      </aside>

      {/* Main content */}
      <div className="flex justify-center items-center min-h-screen">
        <main className="w-full max-w-5xl p-8 transition-all">
          <div className="mb-10">
            {/* Título principal */}
            <h1 className="text-3xl font-bold text-white mb-8 tracking-tight">
              Panel de Usuario
            </h1>

            {/* Cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card: Álbumes */}
              <div className="bg-[#232323]/85 backdrop-blur-md rounded-xl shadow-2xl p-6 flex flex-col h-full border border-[#333]">
                <h2 className="text-xl font-semibold text-white mb-4">Álbum</h2>
                <div className="flex-1 flex items-center justify-center mb-4">
                  <span className="text-gray-400 text-base text-center">
                    No tienes álbumes guardados
                  </span>
                </div>
                <button className="w-full mt-auto px-5 py-2.5 bg-blue-600 text-white text-base font-semibold rounded-lg hover:bg-blue-700 transition-all shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-center">
                  Explorar álbumes
                </button>
              </div>

              {/* Card: Métodos de Estudio */}
              <div className="bg-[#232323]/85 backdrop-blur-md rounded-xl shadow-2xl p-6 flex flex-col h-full border border-[#333]">
                <h2 className="text-xl font-semibold text-white mb-4">
                  Método de Estudio
                </h2>
                <div className="flex-1 flex items-center justify-center mb-4">
                  <span className="text-gray-400 text-base text-center">
                    No tienes métodos de estudio guardados
                  </span>
                </div>
                <button className="w-full mt-auto px-5 py-2.5 bg-blue-600 text-white text-base font-semibold rounded-lg hover:bg-blue-700 transition-all shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-center">
                  Explorar métodos
                </button>
              </div>

              {/* Card: Sesiones de Concentración */}
              <div className="bg-[#232323]/85 backdrop-blur-md rounded-xl shadow-2xl p-6 flex flex-col h-full border border-[#333]">
                <h2 className="text-xl font-semibold text-white mb-4">
                  Sesión de Concentración
                </h2>
                <div className="flex-1 flex items-center justify-center mb-4">
                  <span className="text-gray-400 text-base text-center">
                    No tienes sesiones de concentración programadas
                  </span>
                </div>
                <button className="w-full mt-auto px-5 py-2.5 bg-blue-600 text-white text-base font-semibold rounded-lg hover:bg-blue-700 transition-all shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-center">
                  Programar sesión
                </button>
              </div>
            </div>
          </div>

          {/* Card: Sesión de concentración rápida */}
          <div className="bg-[#232323]/85 backdrop-blur-md rounded-xl shadow-2xl p-8 flex flex-col items-center border border-[#333]">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Sesión de concentración rápida
            </h2>
            <div className="flex flex-col items-center gap-4 w-full">
              <button className="w-full md:w-auto px-8 py-3 bg-blue-600 text-white text-lg font-semibold rounded-xl shadow-lg hover:bg-blue-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                Empezar sesión de concentración
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* Account Deletion Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#232323] rounded-2xl shadow-2xl p-8 w-full max-w-md border border-[#333]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">Eliminar Cuenta</h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="p-1 hover:bg-[#333] rounded-full transition-colors"
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
                className="px-5 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-200 font-medium transition-colors"
              >
                No
              </button>
              <button
                onClick={confirmDeleteAccount}
                className="px-5 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-colors"
              >
                Estoy seguro
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
