// Componente para gestionar las DevTools de React Query
// Solo muestra las DevTools cuando se presiona F5 en desarrollo
import React, { useState, useEffect } from 'react';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

export const DevTools: React.FC = () => {
  const [showDevTools, setShowDevTools] = useState(false);

  useEffect(() => {
    // Solo activar en desarrollo
    if (!import.meta.env.DEV) return;

    const handleKeyPress = (event: KeyboardEvent) => {
      // F5 para mostrar/ocultar DevTools
      if (event.key === 'F5') {
        event.preventDefault(); // Prevenir refresh de página
        setShowDevTools(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  // No renderizar nada en producción
  if (!import.meta.env.DEV) return null;

  return (
    <>
      {showDevTools && (
        <ReactQueryDevtools
          initialIsOpen={true}
        />
      )}

      {/* Indicador visual discreto */}
      {showDevTools && (
        <div className="fixed bottom-4 right-4 z-50 bg-gray-800 text-white px-3 py-1 rounded-full text-xs font-mono shadow-lg border border-gray-600">
          DevTools: ON (F5 para ocultar)
        </div>
      )}
    </>
  );
};