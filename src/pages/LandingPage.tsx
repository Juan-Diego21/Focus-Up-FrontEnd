import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Timer, Headphones, Bell, TrendingUp, Settings, ChevronDown, Play, Pause, SkipBack, SkipForward, CheckCircle, Target, Zap, Brain, Sparkles, Users, Award } from 'lucide-react';

const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState(0);
  const [headerVisible, setHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isNavVisible, setIsNavVisible] = useState(false);
  const sectionsRef = useRef<(HTMLElement | null)[]>([]);

  // Redirigir a dashboard si el usuario ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Scroll listener para ocultar header
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setHeaderVisible(false);
      } else {
        setHeaderVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Configuración inicial de las secciones
  useEffect(() => {
    sectionsRef.current = [
      document.getElementById('hero'),
      document.getElementById('modulos'),
      ...['sesiones', 'metodos', 'musica', 'eventos', 'reportes', 'perfil', 'cta']
        .map(id => document.getElementById(id))
    ].filter(Boolean);
  }, []);

  // Scroll snapping personalizado
  useEffect(() => {
    const handleScroll = () => {
      if (isScrolling) return;

      const scrollPosition = window.scrollY + window.innerHeight / 3;
      const currentSection = sectionsRef.current.findIndex(section => {
        if (!section) return false;
        const sectionTop = section.offsetTop;
        const sectionBottom = sectionTop + section.offsetHeight;
        return scrollPosition >= sectionTop && scrollPosition < sectionBottom;
      });

      if (currentSection !== -1 && currentSection !== activeSection) {
        setActiveSection(currentSection);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isScrolling, activeSection]);

  // Navegación suave por teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const direction = e.key === 'ArrowDown' ? 1 : -1;
        const nextSection = Math.max(0, Math.min(sectionsRef.current.length - 1, activeSection + direction));
        
        if (sectionsRef.current[nextSection]) {
          setIsScrolling(true);
          sectionsRef.current[nextSection]?.scrollIntoView({ behavior: 'smooth' });
          setActiveSection(nextSection);
          setTimeout(() => setIsScrolling(false), 1000);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeSection]);

  // Función para scroll snapping controlado
  const scrollToSection = (sectionId: string) => {
    setIsScrolling(true);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'center'
      });
      
      // Actualizar sección activa
      const index = sectionsRef.current.findIndex(ref => ref?.id === sectionId);
      if (index !== -1) setActiveSection(index);
    }
    setTimeout(() => setIsScrolling(false), 1000);
  };

  // Función para manejar el contacto por email
  const handleContact = () => {
    window.location.href = 'mailto:focusupteam7@gmail.com';
  };

  return (
    <div
      className="h-screen overflow-y-scroll snap-y snap-mandatory scroll-smooth bg-gradient-to-br from-[#0a0a0a] via-[#0c0c0c] to-[#0a0a0a] text-white"
      style={{ 
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        scrollBehavior: 'smooth'
      }}
    >
      {/* Navegación oculta con línea vertical */}
      <div
        className="fixed right-0 top-0 bottom-0 w-16 z-40"
        onPointerEnter={() => setIsNavVisible(true)}
        onPointerLeave={() => setIsNavVisible(false)}
      >
        {/* Línea vertical sutil */}
        <div className="absolute right-6 top-1/2 transform -translate-y-1/2 h-40 w-1 bg-white/30 rounded-full"></div>

        {/* Navegación por puntos */}
        <nav className={`absolute top-1/2 transform -translate-y-1/2 z-50 transition-all duration-300 ${
          isNavVisible ? 'right-8' : 'right-[-200px]'
        }`}>
          <div className="flex flex-col gap-4">
            {['Hero', 'Módulos', 'Sesiones', 'Métodos', 'Música', 'Eventos', 'Reportes', 'Perfil', 'CTA'].map((label, index) => (
              <button
                key={label}
                onClick={() => scrollToSection(index === 0 ? 'hero' : index === 1 ? 'modulos' :
                  ['sesiones', 'metodos', 'musica', 'eventos', 'reportes', 'perfil', 'cta'][index - 2])}
                className={`group flex items-center gap-3 transition-all duration-300 ${
                  activeSection === index ? 'opacity-100' : 'opacity-40 hover:opacity-70'
                }`}
              >
                <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  activeSection === index
                    ? 'bg-gradient-to-r from-blue-400 to-purple-400 scale-125'
                    : 'bg-white/30 group-hover:bg-white/50'
                }`} />
                <span className={`text-xs font-medium tracking-wider uppercase transition-all duration-300 transform ${
                  activeSection === index
                    ? 'translate-x-0 opacity-100 text-white'
                    : '-translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-60'
                }`}>
                  {label}
                </span>
              </button>
            ))}
          </div>
        </nav>
      </div>

      {/* Header que se oculta al hacer scroll */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        headerVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}>
        <div className="relative max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <img
            src="/img/Logo.png"
            alt="Focus-Up Logo"
            className="w-20 h-20 md:w-30 md:h-30 object-contain"
          />
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/login')}
              className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
            >
              Iniciar sesión
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/register')}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg"
            >
              Registrarse
            </Button>
          </div>
        </div>
      </header>

      {/* Sección Hero - Fullscreen */}
      <section
        id="hero"
        className="min-h-screen snap-start relative flex items-start justify-center px-6 overflow-hidden pt-24"
        style={{ scrollSnapAlign: 'start' }}
      >
        {/* Fondo dinámico */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-purple-900/5 to-cyan-900/10"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/3 right-1/3 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        {/* Contenido principal */}
        <div className="relative max-w-6xl mx-auto text-center z-10">
          {/* Título principal */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 leading-none tracking-tight">
            <span className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
              ENFOQUE
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              ABSOLUTO
            </span>
          </h1>

          {/* Subtítulo */}
          <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed font-light tracking-wide">
            Un ecosistema completo que combina{' '}
            <span className="text-blue-300 font-medium">música funcional</span>,{' '}
            <span className="text-purple-300 font-medium">métodos científicos</span> y{' '}
            <span className="text-cyan-300 font-medium">sesiones inteligentes</span>
            {' '}para potenciar tu productividad
          </p>

          {/* CTA Principal */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/register')}
              className="px-12 py-5 bg-gradient-to-r from-blue-500 to-purple-600 text-lg font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 flex items-center gap-3 group transform hover:scale-105"
            >
              <Sparkles className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
              COMENZAR GRATIS
              <ChevronDown className="w-5 h-5 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => scrollToSection('modulos')}
              className="px-12 py-5 border-2 border-white/20 text-lg font-semibold rounded-xl hover:bg-white/10 transition-all duration-300 flex items-center gap-3 group"
            >
              <ChevronDown className="w-5 h-5 mr-2 group-hover:translate-y-1 transition-transform" />
              EXPLORAR PLATAFORMA
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-8">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
              <CheckCircle className="w-8 h-8 text-green-400 mb-3 mx-auto" />
              <div className="font-semibold text-white mb-1">Sin tarjetas</div>
              <div className="text-sm text-gray-400">Comienza gratis hoy</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
              <Zap className="w-8 h-8 text-yellow-400 mb-3 mx-auto" />
              <div className="font-semibold text-white mb-1">Configuración rápida</div>
              <div className="text-sm text-gray-400">Listo en 2 minutos</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
              <Target className="w-8 h-8 text-red-400 mb-3 mx-auto" />
              <div className="font-semibold text-white mb-1">Resultados medibles</div>
              <div className="text-sm text-gray-400">Comprobado científicamente</div>
            </div>
          </div>
        </div>
      </section>

      {/* Módulos - Grid minimalista */}
      <section 
        id="modulos" 
        className="min-h-screen snap-start relative py-32 px-6 bg-gradient-to-b from-[#0a0a0a] via-[#0c0c0c] to-[#0a0a0a]"
        style={{ scrollSnapAlign: 'start' }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-block px-6 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full mb-6">
              <span className="text-sm font-semibold text-blue-400 tracking-wider">SISTEMA INTEGRADO</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Arquitectura de Productividad
              </span>
            </h2>
            <p className="text-lg text-gray-200 max-w-3xl mx-auto font-light">
              Cada módulo está diseñado para trabajar en conjunto, creando una experiencia de concentración completa
            </p>
          </div>

          {/* Grid de módulos */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-20">
            {[
              { id: 'sesiones', icon: Timer, title: 'Sesiones', color: 'blue', desc: 'Tiempo enfocado' },
              { id: 'metodos', icon: Brain, title: 'Métodos', color: 'green', desc: 'Técnicas probadas' },
              { id: 'musica', icon: Headphones, title: 'Música', color: 'purple', desc: 'Enfoque auditivo' },
              { id: 'eventos', icon: Bell, title: 'Eventos', color: 'orange', desc: 'Recordatorios' },
              { id: 'reportes', icon: TrendingUp, title: 'Reportes', color: 'red', desc: 'Progreso' },
              { id: 'perfil', icon: Settings, title: 'Personalizar', color: 'cyan', desc: 'A tu medida' }
            ].map((module) => (
              <button
                key={module.id}
                onClick={() => scrollToSection(module.id)}
                className={`group p-5 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-${module.color}-500/50 transition-all duration-300 hover:transform hover:-translate-y-1 flex flex-col items-center text-center`}
              >
                <div className={`mb-3 p-3 bg-gradient-to-br from-${module.color}-500/20 to-${module.color}-600/10 rounded-lg border border-${module.color}-500/30`}>
                  <module.icon className={`w-6 h-6 text-${module.color}-400`} />
                </div>
                <div className={`text-base font-semibold text-${module.color}-300 mb-1`}>{module.title}</div>
                <div className="text-xs text-gray-400">{module.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Secciones de módulos con scroll-snap */}
      <main className="space-y-0" style={{ scrollSnapType: 'y mandatory' }}>
        {/* Sesiones de Concentración */}
        <section id="sesiones" className="scroll-mt-20 min-h-screen flex items-center py-32 px-6" style={{ scrollSnapAlign: 'start' }}>
          <div className="max-w-7xl mx-auto w-full">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="mb-8">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 rounded-full text-blue-400 font-semibold mb-4">
                    <Timer className="w-4 h-4" />
                    <span>Módulo 1</span>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    Temporizadores Inteligentes
                  </h2>
                </div>

                <div className="space-y-4 text-gray-300 leading-relaxed">
                  <p className="text-lg">
                    Bloquea tiempo exclusivo para trabajo profundo con temporizadores inteligentes
                    que optimizan tus ritmos naturales de atención y descanso.
                  </p>
                  <div className="bg-gradient-to-r from-blue-500/10 to-transparent p-6 rounded-2xl border-l-4 border-blue-500">
                    <h3 className="text-lg font-semibold text-blue-300 mb-3">Características clave</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Metas específicas y medibles para cada sesión</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Recordatorios inteligentes basados en patrones</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Adaptación automática a tu capacidad de atención</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="bg-gradient-to-br from-white/5 to-white/[0.02] rounded-3xl p-8 border border-white/10 backdrop-blur-sm">
                  <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 rounded-full mb-4">
                      <Timer className="w-4 h-4 text-blue-400" />
                      <span className="text-sm font-semibold text-blue-400">DEMO INTERACTIVA</span>
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-4">Experiencia Focus-Up</h3>
                    <p className="text-gray-400">Simula una sesión de concentración</p>
                  </div>

                  {/* Timer visual */}
                  <div className="relative mb-8">
                    <div className="w-48 h-48 mx-auto relative">
                      <div className="absolute inset-0 border-8 border-white/10 rounded-full"></div>
                      <div className="absolute inset-0 border-8 border-transparent rounded-full border-t-blue-500 border-r-purple-500 animate-spin-slow"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-5xl font-bold font-mono text-white mb-2">25:00</div>
                          <div className="text-sm text-gray-400">TIEMPO RESTANTE</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Controles */}
                  <div className="flex justify-center gap-4 mb-8">
                    <button className="p-4 bg-blue-600 hover:bg-blue-700 rounded-xl transition-all duration-300 hover:scale-105">
                      <Play className="w-6 h-6" />
                    </button>
                    <button className="p-4 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-300 hover:scale-105">
                      <Pause className="w-6 h-6" />
                    </button>
                    <button className="p-4 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-300 hover:scale-105">
                      <SkipForward className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="text-center text-gray-400 text-sm">
                    Sesión simulada • Método Pomodoro • Música: Deep Focus
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Métodos de Estudio */}
        <section id="metodos" className="scroll-mt-20 min-h-screen flex items-center py-32 px-6" style={{ scrollSnapAlign: 'start' }}>
          <div className="max-w-7xl mx-auto w-full">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="mb-8">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 rounded-full text-green-400 font-semibold mb-4">
                    <Brain className="w-4 h-4" />
                    <span>Módulo 2</span>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                    Técnicas de Aprendizaje
                  </h2>
                </div>

                <div className="space-y-4 text-gray-300 leading-relaxed">
                  <p className="text-lg">
                    Técnicas de estudio probadas científicamente, desde Pomodoro hasta Active Recall,
                    adaptadas para maximizar tu retención y comprensión.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-6 mt-8">
                  {[
                    { icon: 'Pomodoro', name: 'Pomodoro', desc: '25/5 min ciclos' },
                    { icon: 'Feynman', name: 'Feynman', desc: 'Simplifica conceptos' },
                    { icon: 'Cornell', name: 'Cornell', desc: 'Notas estructuradas' },
                    { icon: 'Active Recall', name: 'Active Recall', desc: 'Recuperación activa' }
                  ].map((method) => (
                    <div key={method.name} className="bg-white/5 p-6 rounded-xl border border-white/10 hover:border-green-500/30 transition-all duration-300 hover:transform hover:scale-105">
                      <div className="text-2xl font-bold text-green-300 mb-3">{method.icon.charAt(0)}</div>
                      <div className="font-semibold text-green-300 text-lg mb-1">{method.name}</div>
                      <div className="text-sm text-gray-400">{method.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-3xl p-1">
                  <div className="bg-[#0a0a0a] rounded-2xl p-8 border border-white/10">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mb-6">
                        <Brain className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-green-300 mb-6">Biblioteca de Métodos</h3>
                      <div className="space-y-4">
                        <div className="bg-white/5 p-4 rounded-xl">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold">Pomodoro</span>
                            <span className="text-green-400 text-sm">75% uso</span>
                          </div>
                          <div className="w-full bg-gray-800 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full w-3/4"></div>
                          </div>
                        </div>
                        <div className="bg-white/5 p-4 rounded-xl">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold">Active Recall</span>
                            <span className="text-blue-400 text-sm">+23% efectividad</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Música Funcional */}
        <section id="musica" className="scroll-mt-20 min-h-screen flex items-center py-32 px-6" style={{ scrollSnapAlign: 'start' }}>
          <div className="max-w-7xl mx-auto w-full">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="mb-8">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 rounded-full text-purple-400 font-semibold mb-4">
                    <Headphones className="w-4 h-4" />
                    <span>Módulo 3</span>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Música para Concentración
                  </h2>
                </div>

                <div className="space-y-4 text-gray-300 leading-relaxed">
                  <p className="text-lg">
                    Colección curada de música funcional diseñada para sincronizar con tus ondas cerebrales
                    y mantener estados de flujo prolongados.
                  </p>
                  <div className="bg-gradient-to-r from-purple-500/10 to-transparent p-6 rounded-2xl border-l-4 border-purple-500">
                    <h3 className="text-lg font-semibold text-purple-300 mb-3">Géneros disponibles</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                          <span>Instrumental</span>
                        </div>
                        <span className="text-sm text-gray-400">Concentración profunda</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                          <span>Lo-fi</span>
                        </div>
                        <span className="text-sm text-gray-400">Creatividad</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                          <span>Sonidos naturales</span>
                        </div>
                        <span className="text-sm text-gray-400">Relajación</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-3xl p-1">
                  <div className="bg-[#0a0a0a] rounded-2xl p-8 border border-white/10">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl mb-6">
                        <Headphones className="w-8 h-8 text-white" />
                      </div>
                      <div className="mb-6">
                        <div className="text-lg font-semibold text-purple-300 mb-1">Reproduciendo</div>
                        <div className="text-xl">Deep Focus #7</div>
                        <div className="text-sm text-gray-400">Concentration Waves</div>
                      </div>
                      <div className="flex justify-center items-center gap-4 mb-6">
                        <button className="p-3 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors">
                          <SkipBack className="w-5 h-5" />
                        </button>
                        <button className="p-4 bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors">
                          <Play className="w-6 h-6" />
                        </button>
                        <button className="p-3 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors">
                          <SkipForward className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="text-sm text-gray-500">
                        Optimizado para trabajo profundo
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Eventos y Recordatorios */}
        <section id="eventos" className="scroll-mt-20 min-h-screen flex items-center py-32 px-6" style={{ scrollSnapAlign: 'start' }}>
          <div className="max-w-7xl mx-auto w-full">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="mb-8">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/20 rounded-full text-orange-400 font-semibold mb-4">
                    <Bell className="w-4 h-4" />
                    <span>Módulo 4</span>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                    Eventos y Recordatorios
                  </h2>
                </div>

                <div className="space-y-4 text-gray-300 leading-relaxed">
                  <p className="text-lg">
                    Programa tus sesiones de estudio y recibe recordatorios inteligentes que se adaptan
                    a tus patrones de productividad. El sistema aprende cuándo eres más productivo.
                  </p>
                  <div className="bg-gradient-to-r from-orange-500/10 to-transparent p-6 rounded-2xl border-l-4 border-orange-500">
                    <h3 className="text-lg font-semibold text-orange-300 mb-3">Características inteligentes</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Recordatorios personalizados por email</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Sincronización con calendarios externos</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Análisis de patrones de productividad</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-3xl p-1">
                  <div className="bg-[#0a0a0a] rounded-2xl p-8 border border-white/10">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl mb-6">
                        <Bell className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-orange-300 mb-6">Próximas Sesiones</h3>
                      <div className="space-y-4">
                        <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 p-4 rounded-xl">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold">Estudio de Matemáticas</span>
                            <span className="text-orange-400 text-sm">Hoy</span>
                          </div>
                          <div className="text-sm text-gray-400 mb-2">3:00 PM - 4:30 PM</div>
                          <div className="flex gap-2">
                            <button className="px-3 py-1 bg-orange-600 hover:bg-orange-700 rounded-lg text-sm transition-colors">
                              Iniciar
                            </button>
                            <button className="px-3 py-1 bg-gray-600 hover:bg-gray-700 rounded-lg text-sm transition-colors">
                              Editar
                            </button>
                          </div>
                        </div>
                        <div className="bg-white/5 p-4 rounded-xl">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold">Lectura Técnica</span>
                            <span className="text-gray-400 text-sm">Mañana</span>
                          </div>
                          <div className="text-sm text-gray-400">10:00 AM - 11:00 AM</div>
                        </div>
                      </div>
                      <div className="mt-6 text-sm text-gray-500">
                        Próximo recordatorio en 2 horas
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Reportes y Analytics */}
        <section id="reportes" className="scroll-mt-20 min-h-screen flex items-center py-32 px-6" style={{ scrollSnapAlign: 'start' }}>
          <div className="max-w-7xl mx-auto w-full">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="mb-8">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 rounded-full text-red-400 font-semibold mb-4">
                    <TrendingUp className="w-4 h-4" />
                    <span>Módulo 5</span>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
                    Reportes y Analytics
                  </h2>
                </div>

                <div className="space-y-4 text-gray-300 leading-relaxed">
                  <p className="text-lg">
                    Rastrea tu progreso con reportes detallados que muestran tiempo dedicado,
                    sesiones completadas y evolución de tus hábitos de estudio.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="bg-gradient-to-br from-red-500/10 to-pink-500/10 rounded-3xl p-1">
                  <div className="bg-[#0a0a0a] rounded-2xl p-8 border border-white/10">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl mb-6">
                        <TrendingUp className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-red-300 mb-6">Tu Progreso</h3>
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-gradient-to-br from-red-500/20 to-pink-500/20 p-4 rounded-xl">
                          <div className="text-3xl font-bold text-red-400">28h</div>
                          <div className="text-sm text-gray-400">Esta semana</div>
                        </div>
                        <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 p-4 rounded-xl">
                          <div className="text-3xl font-bold text-green-400">87%</div>
                          <div className="text-sm text-gray-400">Sesiones completadas</div>
                        </div>
                      </div>
                      <div className="bg-white/5 p-4 rounded-xl mb-4">
                        <div className="text-sm text-gray-300 mb-2">Método más efectivo</div>
                        <div className="text-lg font-semibold text-red-400">Pomodoro + Música</div>
                        <div className="text-xs text-gray-400">+23% de productividad</div>
                      </div>
                      <div className="text-sm text-gray-500">
                        Tendencia: Mejorando 12% semanalmente
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Perfil y Personalización */}
        <section id="perfil" className="scroll-mt-20 min-h-screen flex items-center py-32 px-6" style={{ scrollSnapAlign: 'start' }}>
          <div className="max-w-7xl mx-auto w-full">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="mb-8">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/20 rounded-full text-cyan-400 font-semibold mb-4">
                    <Settings className="w-4 h-4" />
                    <span>Módulo 6</span>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    Perfil y Personalización
                  </h2>
                </div>

                <div className="space-y-4 text-gray-300 leading-relaxed">
                  <p className="text-lg">
                    Focus-Up se adapta completamente a ti. El sistema aprende de tus preferencias,
                    hábitos y respuestas para crear una experiencia totalmente personalizada.
                  </p>
                  <div className="bg-gradient-to-r from-cyan-500/10 to-transparent p-6 rounded-2xl border-l-4 border-cyan-500">
                    <h3 className="text-lg font-semibold text-cyan-300 mb-3">Personalización inteligente</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Preferencias musicales adaptadas a tu gusto</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Detección automática de distracciones</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Duraciones de sesión optimizadas para ti</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Recomendaciones basadas en tu historial</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-3xl p-1">
                  <div className="bg-[#0a0a0a] rounded-2xl p-8 border border-white/10">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl mb-6">
                        <Settings className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-cyan-300 mb-6">Tu Perfil Personalizado</h3>
                      <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 p-6 rounded-2xl mb-6">
                        <div className="text-lg font-semibold text-cyan-400 mb-1">Estudiante de Ingeniería</div>
                        <div className="text-sm text-gray-400">Perfil actualizado automáticamente</div>
                      </div>
                      <div className="space-y-3 mb-6">
                        <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg">
                          <span className="text-sm">Música preferida</span>
                          <span className="text-cyan-400 font-semibold">Instrumental</span>
                        </div>
                        <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg">
                          <span className="text-sm">Duración óptima</span>
                          <span className="text-cyan-400 font-semibold">25 min</span>
                        </div>
                        <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg">
                          <span className="text-sm">Método favorito</span>
                          <span className="text-cyan-400 font-semibold">Pomodoro</span>
                        </div>
                      </div>
                      <button className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 rounded-xl font-semibold transition-colors">
                        Editar Preferencias
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer CTA - Estilo premium */}
        <section 
          id="cta" 
          className="min-h-screen snap-start relative flex items-center justify-center px-6"
          style={{ scrollSnapAlign: 'start' }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-purple-900/10 to-cyan-900/10"></div>
          
          <div className="relative max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full border border-blue-500/20 mb-8 backdrop-blur-sm">
              <Award className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-semibold text-blue-300">HERRAMIENTAS DE ESTUDIO • GRATIS</span>
            </div>

            {/* Título final */}
            <h2 className="text-4xl md:text-6xl font-bold mb-8 leading-tight">
              <span className="text-white">Transforma tu</span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Capacidad Cognitiva
              </span>
            </h2>

            {/* Descripción */}
            <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
              Únete a miles de estudiantes y profesionales que ya han transformado su enfoque con Focus-Up
            </p>

            {/* CTA final */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/register')}
                className="group px-14 py-6 bg-gradient-to-r from-blue-500 to-purple-600 text-xl font-semibold rounded-2xl hover:from-blue-600 hover:to-purple-700 transition-all duration-500 shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 flex items-center gap-4 hover:scale-105"
              >
                <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                COMENZAR GRATIS
                <ChevronDown className="w-6 h-6 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all" />
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                onClick={handleContact}
                className="px-14 py-6 border-2 border-white/20 text-xl font-semibold rounded-2xl hover:bg-white/10 transition-all duration-500 hover:scale-105"
              >
                Contactar equipo
              </Button>
            </div>

            {/* Garantías */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-4" />
                <div className="font-semibold text-white mb-2">Sin riesgos</div>
                <div className="text-sm text-gray-400">Cancelación en cualquier momento</div>
              </div>
              <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                <Users className="w-8 h-8 text-blue-400 mx-auto mb-4" />
                <div className="font-semibold text-white mb-2">Comunidad activa</div>
                <div className="text-sm text-gray-400">Soporte 24/7 y grupos de estudio</div>
              </div>
              <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                <Award className="w-8 h-8 text-purple-400 mx-auto mb-4" />
                <div className="font-semibold text-white mb-2">Calidad garantizada</div>
                <div className="text-sm text-gray-400">Basado en investigación científica</div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-20 pt-8 border-t border-white/10">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                  <img
                    src="/img/Logo.png"
                    alt="Focus-Up"
                    className="w-10 h-10 object-contain"
                  />
                </div>
                
                <div className="flex items-center gap-6">
                  <button
                    onClick={() => navigate('/login')}
                    className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
                  >
                    Iniciar sesión
                  </button>
                  <button
                    onClick={handleContact}
                    className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
                  >
                    Contacto
                  </button>
                  <button
                    onClick={() => {}}
                    className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
                  >
                    Términos
                  </button>
                </div>
              </div>
              
              <p className="text-gray-500 text-sm mt-8">
                © {new Date().getFullYear()} Focus-Up. Sistema de productividad cognitiva.
                <br className="hidden sm:block" />
                Todos los derechos reservados.
              </p>
            </div>
          </div>
        </section>
      </main>

      <style>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        
        .overflow-y-scroll {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        
        .overflow-y-scroll::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;