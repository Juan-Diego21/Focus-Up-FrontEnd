import React from "react";
import { Sidebar } from "../components/ui/Sidebar";

export const DashboardPage: React.FC = () => {
  const navigateToStudyMethods = () => {
    window.location.href = "/study-methods";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#171717] via-[#1a1a1a] to-[#171717] font-inter">
      <Sidebar currentPage="dashboard" />

      {/* Main content */}
      <div className="flex justify-center items-center min-h-screen">
        <main className="w-full max-w-5xl p-8 transition-all">
          <div className="mb-10">
            {/* Título principal */}
            <h1 className="text-3xl font-bold text-white mb-8 tracking-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text">
              Panel de Usuario
            </h1>

            {/* Cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card: Álbumes */}
              <div className="bg-gradient-to-br from-[#232323]/90 to-[#1a1a1a]/90 backdrop-blur-md rounded-xl shadow-2xl p-6 flex flex-col h-full border border-[#333]/50 items-center hover:shadow-purple-500/10 hover:border-purple-500/30 transition-all duration-300">
                <h2 className="text-xl font-semibold text-white mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text">Álbum</h2>
                <div className="flex-1 flex items-center justify-center mb-4">
                  <span className="text-gray-400 text-base text-center">
                    No tienes álbumes guardados
                  </span>
                </div>
                <button className="w-full mt-auto px-5 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-base font-semibold rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg hover:shadow-purple-500/25 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 text-center cursor-pointer">
                  Explorar álbumes
                </button>
              </div>

              {/* Card: Métodos de Estudio */}
              <div className="bg-gradient-to-br from-[#232323]/90 to-[#1a1a1a]/90 backdrop-blur-md rounded-xl shadow-2xl p-6 flex flex-col h-full border border-[#333]/50 items-center hover:shadow-purple-500/10 hover:border-purple-500/30 transition-all duration-300">
                <h2 className="text-xl font-semibold text-white mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text">
                  Método de Estudio
                </h2>
                <div className="flex-1 flex items-center justify-center mb-4">
                  <span className="text-gray-400 text-base text-center">
                    No tienes métodos de estudio guardados
                  </span>
                </div>
                <button onClick={navigateToStudyMethods} className="w-full mt-auto px-5 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-base font-semibold rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg hover:shadow-purple-500/25 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 text-center cursor-pointer">
                  Explorar métodos
                </button>
              </div>

              {/* Card: Sesiones de Concentración */}
              <div className="bg-gradient-to-br from-[#232323]/90 to-[#1a1a1a]/90 backdrop-blur-md rounded-xl shadow-2xl p-6 flex flex-col h-full border border-[#333]/50 items-center hover:shadow-purple-500/10 hover:border-purple-500/30 transition-all duration-300">
                <h2 className="text-xl font-semibold text-white mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text">
                  Eventos
                </h2>
                <div className="flex-1 flex items-center justify-center mb-4">
                  <span className="text-gray-400 text-base text-center">
                    No tienes eventos programados
                  </span>
                </div>
                <button className="w-full mt-auto px-5 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-base font-semibold rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg hover:shadow-purple-500/25 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 text-center cursor-pointer">
                  Programar evento
                </button>
              </div>
            </div>
          </div>

          {/* Card: Sesión de concentración rápida */}
          <div className="bg-gradient-to-br from-[#232323]/95 to-[#1a1a1a]/95 backdrop-blur-md rounded-xl shadow-2xl p-8 flex flex-col items-center border border-[#333]/50 hover:shadow-cyan-500/10 hover:border-cyan-500/30 transition-all duration-300">
            <h2 className="text-2xl font-semibold text-white mb-4 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text">
              Sesión de concentración rápida
            </h2>
            <div className="flex flex-col items-center gap-4 w-full">
              <button className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-lg font-semibold rounded-xl shadow-lg hover:from-cyan-700 hover:to-blue-700 transition-all hover:shadow-cyan-500/25 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 cursor-pointer">
                Empezar sesión de concentración
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
