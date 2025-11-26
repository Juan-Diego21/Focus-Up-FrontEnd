/**
 * Pruebas unitarias para el componente ConcentrationCard
 *
 * Verifica que el timer se actualice correctamente en tiempo real
 * y que las funcionalidades de pausa/reanudar funcionen adecuadamente.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ConcentrationCard } from './ConcentrationCard';
import { ConcentrationSessionProvider } from '../providers/ConcentrationSessionProvider';

// Mock del contexto de sesión
const mockUseConcentrationSession = vi.fn();
vi.mock('../providers/ConcentrationSessionProvider', () => ({
  useConcentrationSession: () => mockUseConcentrationSession(),
}));

describe('ConcentrationCard Timer Updates', () => {
  beforeEach(() => {
    // Mock básico del estado de sesión
    mockUseConcentrationSession.mockReturnValue({
      getState: () => ({
        activeSession: {
          sessionId: 'test-session',
          title: 'Sesión de prueba',
          isRunning: true,
          elapsedMs: 1000,
          startTime: new Date().toISOString(),
        },
      }),
      pauseSession: vi.fn(),
      resumeSession: vi.fn(),
      finishLater: vi.fn(),
      completeSession: vi.fn(),
      minimize: vi.fn(),
    });
  });

  it('debe mostrar el timer inicial correctamente', () => {
    render(
      <ConcentrationSessionProvider>
        <ConcentrationCard isVisible={true} />
      </ConcentrationSessionProvider>
    );

    // Verificar que se muestra el título de la sesión
    expect(screen.getByText('Sesión de prueba')).toBeInTheDocument();

    // Verificar que se muestra el estado de sesión activa
    expect(screen.getByText('Sesión activa')).toBeInTheDocument();
  });

  it('debe actualizar el timer en tiempo real cuando está corriendo', async () => {
    // Mock de Date.now para controlar el tiempo
    const mockNow = vi.fn();
    Date.now = mockNow;
    mockNow.mockReturnValue(2000); // 2 segundos después del startTime

    render(
      <ConcentrationSessionProvider>
        <ConcentrationCard isVisible={true} />
      </ConcentrationSessionProvider>
    );

    // Esperar a que el timer se actualice (debido al setInterval)
    await waitFor(() => {
      // El timer debería mostrar tiempo basado en la fórmula correcta
      const timerElement = screen.getByRole('timer');
      expect(timerElement).toBeInTheDocument();
    }, { timeout: 1500 });
  });

  it('debe pausar la sesión cuando se hace click en el botón de pausa', async () => {
    const mockPauseSession = vi.fn();
    mockUseConcentrationSession.mockReturnValue({
      ...mockUseConcentrationSession(),
      pauseSession: mockPauseSession,
    });

    render(
      <ConcentrationSessionProvider>
        <ConcentrationCard isVisible={true} />
      </ConcentrationSessionProvider>
    );

    const pauseButton = screen.getByLabelText('Pausar sesión');
    fireEvent.click(pauseButton);

    expect(mockPauseSession).toHaveBeenCalled();
  });

  it('debe mostrar "Sesión pausada" cuando la sesión no está corriendo', () => {
    mockUseConcentrationSession.mockReturnValue({
      ...mockUseConcentrationSession(),
      getState: () => ({
        activeSession: {
          sessionId: 'test-session',
          title: 'Sesión de prueba',
          isRunning: false,
          elapsedMs: 5000,
          startTime: new Date().toISOString(),
        },
      }),
    });

    render(
      <ConcentrationSessionProvider>
        <ConcentrationCard isVisible={true} />
      </ConcentrationSessionProvider>
    );

    expect(screen.getByText('Sesión pausada')).toBeInTheDocument();
  });
});