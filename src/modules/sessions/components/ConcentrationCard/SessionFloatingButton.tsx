/**
 * BotÃ³n flotante persistente para sesiones de concentraciÃ³n
 *
 * Este botÃ³n se muestra siempre en la esquina superior derecha cuando hay
 * una sesiÃ³n activa. Sirve como punto de acceso rÃ¡pido a la mini-card
 * y proporciona feedback visual sobre el estado de la sesiÃ³n.
 *
 * DiseÃ±o: Pill redondeada con gradiente sutil, icono de estado animado.
 */

import React from 'react';
import { useConcentrationSession } from '@shared/hooks/useConcentrationSession';

/**
 * BotÃ³n flotante de sesiÃ³n
 */
export const SessionFloatingButton: React.FC = () => {
  const { getState, minimize } = useConcentrationSession();
  const state = getState();

  const { activeSession, isMinimized } = state;

  if (!activeSession) return null;

  /**
   * Maneja click en el botÃ³n flotante
   */
  const handleClick = () => {
    // Si la sesiÃ³n estÃ¡ minimizada, mostrar mini-card
    // Si no estÃ¡ minimizada, minimizar y mostrar mini-card
    minimize();
  };

  return (
    <button
      onClick={handleClick}
      className="fixed top-4 right-4 z-30 bg-[#111827]/80 backdrop-blur-sm text-white px-4 py-2 rounded-full shadow-lg border border-[#333]/50 flex items-center gap-2 hover:bg-[#111827]/90 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-transparent"
      aria-haspopup="true"
      aria-expanded={isMinimized}
      aria-label="SesiÃ³n de concentraciÃ³n activa"
      title="SesiÃ³n de concentraciÃ³n"
    >
      <span className="text-sm font-medium">SesiÃ³n de concentraciÃ³n</span>

      {/* Indicador de estado */}
      <div className={`w-2 h-2 rounded-full ${activeSession.isRunning ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'}`} />
    </button>
  );
};

export default SessionFloatingButton;

