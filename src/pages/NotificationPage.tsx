import React from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import { Sidebar } from '../components/ui/Sidebar';
import { NotificationToggle } from '../components/ui/NotificationToggle';
import { useNotifications } from '../hooks/useNotifications';

/**
 * Componente principal de la página de notificaciones
 * Muestra configuraciones de notificaciones y notificaciones próximas
 */
export const NotificationPage: React.FC = () => {
  const {
    settings,
    loading,
    error,
    updateSetting,
  } = useNotifications();

  const handleToggle = async (tipo: keyof typeof settings) => {
    try {
      await updateSetting({
        tipo,
        enabled: !settings[tipo],
      });
    } catch (err) {
      // Error is handled in the hook
      console.error('Failed to update notification setting:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#171717] via-[#1a1a1a] to-[#171717] font-inter">
      <Sidebar currentPage="notifications" />

      <div className="flex justify-center items-start min-h-screen py-8 pt-16">
        <main className="w-full max-w-7xl px-4 md:px-6 lg:px-8 transition-all">
          {/* Header Section */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="flex items-center text-4xl font-bold text-white mb-4 tracking-tight">
                  <BellIcon className="w-8 h-8 md:w-10 md:h-10 mr-4 text-blue-400" />
                  Notificaciones
                </h1>
                <p className="text-gray-400 text-lg max-w-2xl">
                  Controla qué notificaciones deseas recibir para mantenerte al día con tus actividades de estudio.
                </p>
              </div>
            </div>
          </div>

          {/* Estado de carga */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-white text-lg">Cargando notificaciones...</p>
              </div>
            </div>
          )}

          {/* Estado de error */}
          {error && !loading && (
            <div className="text-center py-12">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h3 className="text-white text-xl font-semibold mb-2">Error al cargar notificaciones</h3>
              <p className="text-gray-400 mb-6">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 cursor-pointer"
              >
                Intentar de nuevo
              </button>
            </div>
          )}

          {/* Contenido principal */}
          {!loading && !error && (
            <>
              {/* Sección de configuraciones */}
              <div className="mb-12">
                <h2 className="text-2xl font-semibold text-white mb-6">Configuraciones</h2>
                <div className="space-y-4">
                  <NotificationToggle
                    title="Notificaciones de eventos"
                    description="Recibe recordatorios sobre tus eventos programados de estudio y concentración."
                    enabled={settings.eventos}
                    onToggle={() => handleToggle('eventos')}
                  />
                  <NotificationToggle
                    title="Métodos de estudio no terminados"
                    description="Te recordamos completar los métodos de estudio que has iniciado pero no finalizado."
                    enabled={settings.metodosPendientes}
                    onToggle={() => handleToggle('metodosPendientes')}
                  />
                  <NotificationToggle
                    title="Sesiones de concentración no terminadas"
                    description="Recibe alertas sobre sesiones de concentración que has pausado o abandonado."
                    enabled={settings.sesionesPendientes}
                    onToggle={() => handleToggle('sesionesPendientes')}
                  />
                  <NotificationToggle
                    title="Motivación semanal"
                    description="Mensajes inspiradores y consejos para mantener tu motivación en el estudio."
                    enabled={settings.motivacion}
                    onToggle={() => handleToggle('motivacion')}
                  />
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default NotificationPage;