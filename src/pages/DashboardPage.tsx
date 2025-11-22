import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { Sidebar } from "../components/ui/Sidebar";
import { LOCAL_METHOD_ASSETS } from "../utils/methodAssets";
import { BookOpen, Calendar, Music, Zap } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  // Get the number of available study methods
  const studyMethodsCount = Object.keys(LOCAL_METHOD_ASSETS).length;
  const navigate = useNavigate();

  // Estado para controlar la visibilidad del indicador de scroll
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);

  // Efecto para detectar posición de scroll
  useEffect(() => {
    const checkScrollPosition = () => {
      // Verificar si el usuario está cerca del final de la página
      const isNearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 100;
      setShowScrollIndicator(!isNearBottom);
    };

    // Agregar event listener y verificar estado inicial
    window.addEventListener('scroll', checkScrollPosition);
    checkScrollPosition();

    // Cleanup
    return () => window.removeEventListener('scroll', checkScrollPosition);
  }, []);

  const navigateToStudyMethods = () => {
    navigate("/study-methods");
  };

  const navigateToMusic = () => {
    navigate("/music/albums");
  };

  const navigateToEvents = () => {
    navigate("/events");
  };

  const navigateToStartSession = () => {
    navigate("/start-session");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#171717] via-[#1a1a1a] to-[#171717] font-inter">
      <Sidebar currentPage="dashboard" />

      {/* Main content */}
      <div className="flex justify-center items-center min-h-screen py-4">
        <main className="w-full max-w-6xl px-4 transition-all">
          <div className="mb-6">
            {/* Logo Section */}
            <div className="text-center mb-8">
              <div className="relative inline-block">
                {/* Logo with glow effect */}
                <div className="relative">
                  <img
                    src="/img/Logo.png"
                    alt="Focus-Up Logo"
                    className="h-20 md:w-100% md:h-24 mx-auto mb-4 drop-shadow-2xl"
                  />
                  {/* Subtle glow effect */}
                  <div className="absolute inset-0 w-20 h-20 md:w-24 md:h-24 mx-auto bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl -z-10"></div>
                </div>

                {/* Decorative elements */}
                <div className="flex justify-center items-center gap-3 mb-6">
                  <div className="w-24 h-px bg-gradient-to-r from-transparent via-blue-400/80 to-transparent opacity-60"></div>
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></div>
                  <div className="w-24 h-px bg-gradient-to-l from-transparent via-purple-400/80 to-transparent opacity-60"></div>
                </div>
              </div>
            </div>

            {/* Overlay difuminado inferior (se desvanece al hacer scroll) */}
            <div className={`fixed bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#171717] to-transparent pointer-events-none z-20 transition-opacity duration-500 ${showScrollIndicator ? 'opacity-100' : 'opacity-0'}`}></div>

            {/* Cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Card: Música */}
              <div className="bg-gradient-to-br from-[#232323]/90 to-[#1a1a1a]/90 backdrop-blur-md rounded-xl shadow-2xl p-4 md:p-6 flex flex-col h-full border border-[#333]/50 items-center hover:shadow-purple-500/10 hover:border-purple-500/30 transition-all duration-300 relative overflow-hidden">
                {/* Decorative background pattern */}
                <div className="absolute top-0 right-0 w-16 h-16 md:w-20 md:h-20 opacity-5">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="1"/>
                    <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="1"/>
                    <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="1"/>
                  </svg>
                </div>

               <div className="text-3xl md:text-4xl mb-3 text-purple-400">
                 <Music className="w-8 h-8 md:w-10 md:h-10" />
               </div>
               <h2 className="text-lg md:text-xl font-semibold text-white mb-3 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text">
                  Música
                </h2>
                <div className="flex-1 flex items-center justify-center mb-3">
                  <span className="text-gray-400 text-sm md:text-base text-center leading-relaxed px-2">
                    Explora playlists destinadas a mejorar tus sesiones de estudio
                  </span>
                </div>
                <button onClick={navigateToMusic} className="w-full mt-auto px-4 py-2 md:px-5 md:py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-sm md:text-base font-semibold rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg hover:shadow-purple-500/25 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 text-center cursor-pointer flex items-center justify-center gap-2">
                  <Music className="w-4 h-4" />
                  Explorar música
                </button>
              </div>

              {/* Card: Métodos de Estudio */}
              <div className="bg-gradient-to-br from-[#232323]/90 to-[#1a1a1a]/90 backdrop-blur-md rounded-xl shadow-2xl p-4 md:p-6 flex flex-col h-full border border-[#333]/50 items-center hover:shadow-blue-500/10 hover:border-blue-500/30 transition-all duration-300 relative overflow-hidden">
                {/* Decorative background pattern */}
                <div className="absolute top-0 right-0 w-16 h-16 md:w-20 md:h-20 opacity-5">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <polygon points="50,10 90,90 10,90" fill="none" stroke="currentColor" strokeWidth="1"/>
                    <polygon points="50,20 80,80 20,80" fill="none" stroke="currentColor" strokeWidth="1"/>
                  </svg>
                </div>

                <div className="text-3xl md:text-4xl mb-3 text-blue-400">
                  <BookOpen className="w-8 h-8 md:w-10 md:h-10" />
                </div>
                <h2 className="text-lg md:text-xl font-semibold text-white mb-3 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text">
                  Métodos de Estudio
                </h2>
                <div className="flex-1 flex items-center justify-center mb-3">
                  <span className="text-gray-400 text-sm md:text-base text-center leading-relaxed px-2">
                    {studyMethodsCount} métodos científicos disponibles para potenciar tu aprendizaje
                  </span>
                </div>
                <button onClick={navigateToStudyMethods} className="w-full mt-auto px-4 py-2 md:px-5 md:py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm md:text-base font-semibold rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg hover:shadow-blue-500/25 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-center cursor-pointer flex items-center justify-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Explorar métodos
                </button>
              </div>

              {/* Card: Eventos */}
              <div className="bg-gradient-to-br from-[#232323]/90 to-[#1a1a1a]/90 backdrop-blur-md rounded-xl shadow-2xl p-4 md:p-6 flex flex-col h-full border border-[#333]/50 items-center hover:shadow-green-500/10 hover:border-green-500/30 transition-all duration-300 relative overflow-hidden">
                {/* Decorative background pattern */}
                <div className="absolute top-0 right-0 w-16 h-16 md:w-20 md:h-20 opacity-5">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <rect x="20" y="20" width="60" height="60" rx="8" fill="none" stroke="currentColor" strokeWidth="1"/>
                    <rect x="30" y="30" width="40" height="40" rx="4" fill="none" stroke="currentColor" strokeWidth="1"/>
                  </svg>
                </div>

                <div className="text-3xl md:text-4xl mb-3 text-green-400">
                  <Calendar className="w-8 h-8 md:w-10 md:h-10" />
                </div>
                <h2 className="text-lg md:text-xl font-semibold text-white mb-3 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text">
                  Eventos
                </h2>
                <div className="flex-1 flex items-center justify-center mb-3">
                  <span className="text-gray-400 text-sm md:text-base text-center leading-relaxed px-2">
                    Programa sesiones de concentración y mantén tu rutina de estudio
                  </span>
                </div>
                <button onClick={navigateToEvents} className="w-full mt-auto px-4 py-2 md:px-5 md:py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm md:text-base font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-green-500/25 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-center cursor-pointer flex items-center justify-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Programar evento
                </button>
              </div>
            </div>
          </div>

          {/* Card: Sesión de concentración rápida */}
          <div className="quick-session-section bg-gradient-to-br from-[#232323]/95 to-[#1a1a1a]/95 backdrop-blur-md rounded-xl shadow-2xl p-4 md:p-6 flex flex-col items-center border border-[#333]/50 hover:shadow-cyan-500/10 hover:border-cyan-500/30 transition-all duration-300 relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-2 right-4 md:top-4 md:right-6 opacity-10">
              <svg width="40" height="40" viewBox="0 0 100 100" className="md:w-[60px] md:h-[60px]">
                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2"/>
                <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="1"/>
                <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="1"/>
              </svg>
            </div>
            <div className="absolute bottom-2 left-4 md:bottom-4 md:left-6 opacity-10">
              <svg width="30" height="30" viewBox="0 0 100 100" className="md:w-[40px] md:h-[40px]">
                <polygon points="50,10 85,85 15,85" fill="none" stroke="currentColor" strokeWidth="1"/>
              </svg>
            </div>

            <div className="text-3xl md:text-4xl mb-3 text-cyan-400">
              <Zap className="w-8 h-8 md:w-10 md:h-10" />
            </div>
            <h2 className="text-lg md:text-xl font-semibold text-white mb-3 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-center">
              Sesión de Concentración Rápida
            </h2>
            <p className="text-gray-400 text-center mb-4 md:mb-6 max-w-md leading-relaxed text-sm md:text-base px-2">
              Inicia una sesión de estudio con música y métodos de estudio para maximizar tu productividad
            </p>
            <div className="flex flex-col items-center gap-3 md:gap-4 w-full">
              <button onClick={navigateToStartSession} className="w-full md:w-auto px-6 md:px-8 py-2.5 md:py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-sm md:text-base font-semibold rounded-xl shadow-lg hover:from-cyan-700 hover:to-blue-700 hover:shadow-cyan-500/25 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 cursor-pointer transform hover:scale-105 transition-transform flex items-center justify-center gap-2">
                <Zap className="w-4 h-4" />
                Empezar sesión de concentración
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
