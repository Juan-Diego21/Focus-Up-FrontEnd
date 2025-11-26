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
    <div className="min-h-screen bg-gradient-to-br from-[#171717] via-[#1a1a1a] to-[#171717] relative overflow-hidden font-inter">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-80 h-80 bg-blue-500/8 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/6 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-cyan-500/5 rounded-full blur-3xl"></div>
      </div>

      <Sidebar currentPage="dashboard" />

      {/* Main content */}
      <div className="relative z-10 flex justify-center items-center min-h-screen py-4">
        <main className="w-full max-w-6xl px-4 transition-all">
          <div className="mb-12">
            {/* Hero Section */}
            <div className="text-center mb-12">
              <div className="relative inline-block">


                {/* Logo with enhanced glow effect */}
                <div className="relative mb-8">
                  <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-cyan-600/20 rounded-3xl blur-2xl opacity-50"></div>
                  <div className="relative">
                    <img
                      src="/img/Logo.png"
                      alt="Focus-Up Logo"
                      className="h-24 md:h-28 mx-auto drop-shadow-2xl relative z-10"
                    />
                    {/* Enhanced glow effect */}
                    <div className="absolute inset-0 w-24 h-24 md:w-28 md:h-28 mx-auto bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-full blur-xl -z-10"></div>
                  </div>
                </div>

                {/* Enhanced decorative elements */}
                <div className="flex justify-center items-center gap-4 mb-8">
                  <div className="w-32 h-px bg-gradient-to-r from-transparent via-blue-400/60 to-transparent"></div>
                  <div className="w-3 h-3 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 rounded-full shadow-lg shadow-purple-500/30"></div>
                  <div className="w-32 h-px bg-gradient-to-l from-transparent via-purple-400/60 to-transparent"></div>
                </div>

                {/* Welcome message */}
                <div className="max-w-2xl mx-auto">
                  <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent mb-4">
                    Potencia tu Aprendizaje
                  </h1>
                  <p className="text-gray-300 text-lg leading-relaxed">
                    Descubre métodos científicos, playlists especializadas y herramientas para maximizar
                    tu concentración y rendimiento académico.
                  </p>
                </div>
              </div>
            </div>

            {/* Overlay difuminado inferior (se desvanece al hacer scroll) */}
            <div className={`fixed bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#171717] to-transparent pointer-events-none z-20 transition-opacity duration-500 ${showScrollIndicator ? 'opacity-100' : 'opacity-0'}`}></div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {/* Music Card */}
              <div className="bg-gradient-to-br from-[#232323]/90 to-[#1a1a1a]/90 backdrop-blur-md rounded-2xl shadow-2xl p-6 md:p-8 flex flex-col h-full border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 relative overflow-hidden hover:transform hover:-translate-y-2 ring-1 ring-white/5 hover:ring-purple-500/20">
                {/* Enhanced decorative background */}
                <div className="absolute top-0 right-0 w-20 h-20 md:w-24 md:h-24 opacity-10">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="url(#purpleGradient)" strokeWidth="1"/>
                    <circle cx="50" cy="50" r="35" fill="none" stroke="url(#purpleGradient)" strokeWidth="1"/>
                    <circle cx="50" cy="50" r="25" fill="none" stroke="url(#purpleGradient)" strokeWidth="1"/>
                    <defs>
                      <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#a855f7"/>
                        <stop offset="100%" stopColor="#ec4899"/>
                      </linearGradient>
                    </defs>
                  </svg>
                </div>

                {/* Icon with glow */}
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-purple-500/30">
                    <Music className="w-8 h-8 text-purple-400" />
                  </div>
                  <div className="absolute -inset-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-lg -z-10"></div>
                </div>

                <h3 className="text-xl md:text-2xl font-bold text-white mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-center">
                  Música
                </h3>

                <div className="flex-1 flex items-center justify-center mb-6">
                  <p className="text-gray-400 text-sm md:text-base text-center leading-relaxed">
                    Explora playlists especializadas para potenciar tu concentración y rendimiento académico
                  </p>
                </div>

                <button
                  onClick={navigateToMusic}
                  className="w-full mt-auto px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-purple-500/25 cursor-pointer hover:transform hover:scale-105 flex items-center justify-center gap-3"
                >
                  <Music className="w-5 h-5" />
                  <span>Explorar Música</span>
                  <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Study Methods Card */}
              <div className="bg-gradient-to-br from-[#232323]/90 to-[#1a1a1a]/90 backdrop-blur-md rounded-2xl shadow-2xl p-6 md:p-8 flex flex-col h-full border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 relative overflow-hidden hover:transform hover:-translate-y-2 ring-1 ring-white/5 hover:ring-blue-500/20">
                {/* Enhanced decorative background */}
                <div className="absolute top-0 right-0 w-20 h-20 md:w-24 md:h-24 opacity-10">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <polygon points="50,10 90,90 10,90" fill="none" stroke="url(#blueGradient)" strokeWidth="1"/>
                    <polygon points="50,20 80,80 20,80" fill="none" stroke="url(#blueGradient)" strokeWidth="1"/>
                    <polygon points="50,30 70,70 30,70" fill="none" stroke="url(#blueGradient)" strokeWidth="1"/>
                    <defs>
                      <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6"/>
                        <stop offset="100%" stopColor="#06b6d4"/>
                      </linearGradient>
                    </defs>
                  </svg>
                </div>

                {/* Icon with glow */}
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-500/30">
                    <BookOpen className="w-8 h-8 text-blue-400" />
                  </div>
                  <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl blur-lg -z-10"></div>
                </div>

                <h3 className="text-xl md:text-2xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-center">
                  Métodos de Estudio
                </h3>

                <div className="flex-1 flex items-center justify-center mb-6">
                  <div className="text-center">
                    <p className="text-gray-400 text-sm md:text-base leading-relaxed">
                      Técnicas científicas probadas para potenciar tu aprendizaje y retención
                    </p>
                  </div>
                </div>

                <button
                  onClick={navigateToStudyMethods}
                  className="w-full mt-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-blue-500/25 cursor-pointer hover:transform hover:scale-105 flex items-center justify-center gap-3"
                >
                  <BookOpen className="w-5 h-5" />
                  <span>Explorar Métodos</span>
                  <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Events Card */}
              <div className="bg-gradient-to-br from-[#232323]/90 to-[#1a1a1a]/90 backdrop-blur-md rounded-2xl shadow-2xl p-6 md:p-8 flex flex-col h-full border border-green-500/20 hover:border-green-500/40 transition-all duration-300 relative overflow-hidden hover:transform hover:-translate-y-2 ring-1 ring-white/5 hover:ring-green-500/20">
                {/* Enhanced decorative background */}
                <div className="absolute top-0 right-0 w-20 h-20 md:w-24 md:h-24 opacity-10">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <rect x="20" y="20" width="60" height="60" rx="8" fill="none" stroke="url(#greenGradient)" strokeWidth="1"/>
                    <rect x="30" y="30" width="40" height="40" rx="4" fill="none" stroke="url(#greenGradient)" strokeWidth="1"/>
                    <rect x="40" y="40" width="20" height="20" rx="2" fill="none" stroke="url(#greenGradient)" strokeWidth="1"/>
                    <defs>
                      <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#10b981"/>
                        <stop offset="100%" stopColor="#059669"/>
                      </linearGradient>
                    </defs>
                  </svg>
                </div>

                {/* Icon with glow */}
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-green-500/30">
                    <Calendar className="w-8 h-8 text-green-400" />
                  </div>
                  <div className="absolute -inset-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl blur-lg -z-10"></div>
                </div>

                <h3 className="text-xl md:text-2xl font-bold text-white mb-4 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-center">
                  Eventos
                </h3>

                <div className="flex-1 flex items-center justify-center mb-6">
                  <p className="text-gray-400 text-sm md:text-base text-center leading-relaxed">
                    Programa sesiones de concentración y mantén organizada tu rutina de estudio
                  </p>
                </div>

                <button
                  onClick={navigateToEvents}
                  className="w-full mt-auto px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-green-500/25 cursor-pointer hover:transform hover:scale-105 flex items-center justify-center gap-3"
                >
                  <Calendar className="w-5 h-5" />
                  <span>Programar Evento</span>
                  <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Session Section */}
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 rounded-3xl blur-xl"></div>
            <div className="relative bg-gradient-to-br from-[#232323]/95 to-[#1a1a1a]/95 backdrop-blur-md rounded-3xl shadow-2xl p-8 md:p-10 flex flex-col items-center border border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-300 overflow-hidden ring-1 ring-white/5">
              {/* Enhanced decorative background */}
              <div className="absolute top-4 right-6 opacity-10">
                <svg width="60" height="60" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="url(#cyanGradient)" strokeWidth="2"/>
                  <circle cx="50" cy="50" r="35" fill="none" stroke="url(#cyanGradient)" strokeWidth="1"/>
                  <circle cx="50" cy="50" r="25" fill="none" stroke="url(#cyanGradient)" strokeWidth="1"/>
                  <defs>
                    <linearGradient id="cyanGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#06b6d4"/>
                      <stop offset="100%" stopColor="#3b82f6"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div className="absolute bottom-4 left-6 opacity-10">
                <svg width="40" height="40" viewBox="0 0 100 100">
                  <polygon points="50,10 85,85 15,85" fill="none" stroke="url(#cyanGradient)" strokeWidth="1"/>
                </svg>
              </div>

              {/* Icon with enhanced glow */}
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-cyan-500/30">
                  <Zap className="w-10 h-10 text-cyan-400" />
                </div>
                <div className="absolute -inset-3 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-3xl blur-xl -z-10"></div>
              </div>

              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-center">
                Sesión de Concentración Rápida
              </h2>

              <p className="text-gray-400 text-center mb-8 max-w-lg leading-relaxed text-base px-4">
                Inicia una sesión completa de estudio con música especializada y métodos científicos
                para maximizar tu productividad y concentración
              </p>

              {/* Feature highlights */}
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 text-cyan-300 rounded-full border border-cyan-500/20">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                  <span className="text-sm">Música</span>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-300 rounded-full border border-blue-500/20">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <span className="text-sm">Métodos</span>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 text-purple-300 rounded-full border border-purple-500/20">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                  <span className="text-sm">Enfoque</span>
                </div>
              </div>

              <button
                onClick={navigateToStartSession}
                className="px-8 py-4 bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 hover:from-cyan-700 hover:via-blue-700 hover:to-purple-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-cyan-500/25 cursor-pointer hover:transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 text-lg"
              >
                <Zap className="w-6 h-6" />
                <span>Empezar Sesión de Concentración</span>
                <svg className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
