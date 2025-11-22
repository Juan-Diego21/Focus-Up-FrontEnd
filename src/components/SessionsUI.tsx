/**
 * Componente contenedor para la UI de sesiones de concentración
 *
 * Este componente decide qué elementos de UI mostrar basándose en el estado
 * actual de la sesión. Nunca debe desmontar el audio o el estado global.
 *
 * Lógica de renderizado:
 * - Si hay sesión activa Y no está minimizada → mostrar ConcentrationCard
 * - Si hay sesión activa Y está minimizada → mostrar MiniSessionCard
 * - Siempre mostrar SessionFloatingButton si hay sesión activa
 * - Mostrar modal de continuar si es necesario
 */

import React from 'react';
import { useConcentrationSession } from '../hooks/useConcentrationSession';
import { ConcentrationCard } from './ConcentrationCard/ConcentrationCard';
import { MiniSessionCard } from './ConcentrationCard/MiniSessionCard';
import { SessionFloatingButton } from './ConcentrationCard/SessionFloatingButton';
import { ContinueSessionModal } from './ConcentrationCard/ContinueSessionModal';

/**
 * Componente principal que renderiza la UI de sesiones
 */
export const SessionsUI: React.FC = () => {
  const { getState } = useConcentrationSession();
  const state = getState();

  const { activeSession, isMinimized, showContinueModal } = state;

  return (
    <>
      {/* Modal para continuar sesión anterior */}
      {showContinueModal && <ContinueSessionModal />}

      {/* UI de sesión activa */}
      {activeSession && (
        <>
          {/* Card principal (pantalla completa) */}
          {!isMinimized && <ConcentrationCard />}

          {/* Card minimizada (esquina) */}
          {isMinimized && <MiniSessionCard />}

          {/* Botón flotante (siempre visible) */}
          <SessionFloatingButton />
        </>
      )}
    </>
  );
};

export default SessionsUI;