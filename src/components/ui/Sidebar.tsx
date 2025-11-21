import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../../contexts/AuthContext";
import {
  Bars3Icon,
  HomeIcon,
  Cog6ToothIcon,
  AdjustmentsHorizontalIcon,
  BellIcon,
  ChartBarIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
  BookOpenIcon,
  CalendarIcon,
  MusicalNoteIcon,
} from "@heroicons/react/24/outline";

interface SidebarProps {
  currentPage?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage = "dashboard" }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [focusToolsMenuOpen, setFocusToolsMenuOpen] = useState(false);


  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navigateTo = (path: string) => {
    navigate(path);
  };

  return (
    <>
      {/* Sidebar Toggle Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg hover:bg-[#2a2a2a] transition-all duration-200 cursor-pointer"
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
              <button
                onClick={() => navigateTo("/profile")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-white hover:bg-[#2a2a2a] hover:text-[#ffa200] group cursor-pointer ${
                  currentPage === "profile" ? "bg-[#2a2a2a] text-[#ffa200]" : ""
                }`}
              >
                <Cog6ToothIcon className="w-5 h-5 text-gray-400 group-hover:text-[#ffa200]" />
                <span className="font-medium">Perfil</span>
              </button>
            </li>
            <li>
              {/* Herramientas de enfoque Button */}
              <div className="relative">
                <button
                  onClick={() => setFocusToolsMenuOpen(!focusToolsMenuOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all text-white hover:bg-[#2a2a2a] group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <AdjustmentsHorizontalIcon className="w-5 h-5 text-gray-400 group-hover:text-[#ffa200]" />
                    <span className="font-medium text-left hover:text-[#ffa200]">Herramientas</span>
                  </div>
                  <ChevronDownIcon
                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                      focusToolsMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Submenu */}
                {focusToolsMenuOpen && (
                  <div className="ml-8 mt-2 space-y-1">
                    <button
                      onClick={() => navigateTo("/study-methods")}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#2a2a2a] transition-all text-gray-400 hover:text-[#ffa200] cursor-pointer"
                    >
                      <BookOpenIcon className="w-4 h-4" />
                      <span className="text-sm">Métodos de estudio</span>
                    </button>
                    <button
                      onClick={() => navigateTo("/music/albums")}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#2a2a2a] transition-all text-gray-400 hover:text-[#ffa200] cursor-pointer"
                    >
                      <MusicalNoteIcon className="w-4 h-4" />
                      <span className="text-sm">Álbum de música</span>
                    </button>
                    <button
                      onClick={() => navigateTo("/events")}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#2a2a2a] transition-all text-gray-400 hover:text-[#ffa200] cursor-pointer"
                    >
                      <CalendarIcon className="w-4 h-4" />
                      <span className="text-sm">Eventos</span>
                    </button>
                  </div>
                )}
              </div>
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

    </>
  );
};

export default Sidebar;