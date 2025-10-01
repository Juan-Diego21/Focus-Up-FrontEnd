import React from "react";
import { Sidebar } from "../components/ui/Sidebar";

export const DashboardPage: React.FC = () => {
  const navigateToStudyMethods = () => {
    window.location.href = "/study-methods";
  };

  return (
    <div className="min-h-screen bg-[#171717] font-inter">
      <Sidebar currentPage="dashboard" />

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
              <div className="bg-[#232323]/85 backdrop-blur-md rounded-xl shadow-2xl p-6 flex flex-col h-full border border-[#333] items-center">
                <h2 className="text-xl font-semibold text-white mb-4">Álbum</h2>
                <div className="flex-1 flex items-center justify-center mb-4">
                  <span className="text-gray-400 text-base text-center">
                    No tienes álbumes guardados
                  </span>
                </div>
                <button className="w-full mt-auto px-5 py-2.5 bg-blue-600 text-white text-base font-semibold rounded-lg hover:bg-blue-700 transition-all shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-center cursor-pointer">
                  Explorar álbumes
                </button>
              </div>

              {/* Card: Métodos de Estudio */}
              <div className="bg-[#232323]/85 backdrop-blur-md rounded-xl shadow-2xl p-6 flex flex-col h-full border border-[#333] items-center">
                <h2 className="text-xl font-semibold text-white mb-4">
                  Método de Estudio
                </h2>
                <div className="flex-1 flex items-center justify-center mb-4">
                  <span className="text-gray-400 text-base text-center">
                    No tienes métodos de estudio guardados
                  </span>
                </div>
                <button
                  onClick={navigateToStudyMethods}
                  className="w-full mt-auto px-5 py-2.5 bg-blue-600 text-white text-base font-semibold rounded-lg hover:bg-blue-700 transition-all shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-center cursor-pointer"
                >
                  Explorar métodos
                </button>
              </div>

              {/* Card: Sesiones de Concentración */}
              <div className="bg-[#232323]/85 backdrop-blur-md rounded-xl shadow-2xl p-6 flex flex-col h-full border border-[#333] items-center">
                <h2 className="text-xl font-semibold text-white mb-4">
                  Sesión de Concentración
                </h2>
                <div className="flex-1 flex items-center justify-center mb-4">
                  <span className="text-gray-400 text-base text-center">
                    No tienes sesiones de concentración programadas
                  </span>
                </div>
                <button className="w-full mt-auto px-5 py-2.5 bg-blue-600 text-white text-base font-semibold rounded-lg hover:bg-blue-700 transition-all shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-center cursor-pointer">
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
              <button className="w-full md:w-auto px-8 py-3 bg-blue-600 text-white text-lg font-semibold rounded-xl shadow-lg hover:bg-blue-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer">
                Empezar sesión de concentración
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
