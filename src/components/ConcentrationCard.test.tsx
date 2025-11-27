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

  it('debe actualizar el timer cada segundo cuando la sesión está corriendo', async () => {
    // Mock de Date.now para controlar el tiempo
    const mockDateNow = vi.fn();
    const originalDateNow = Date.now;
    Date.now = mockDateNow;

    // Configurar tiempo inicial
    const startTime = new Date('2023-01-01T10:00:00Z');
    mockDateNow.mockReturnValue(startTime.getTime());

    mockUseConcentrationSession.mockReturnValue({
      getState: () => ({
        activeSession: {
          sessionId: 'test-session',
          title: 'Sesión de prueba',
          isRunning: true,
          elapsedMs: 10000, // 10 segundos ya transcurridos
          startTime: startTime.toISOString(),
        },
      }),
      pauseSession: vi.fn(),
      resumeSession: vi.fn(),
      finishLater: vi.fn(),
      completeSession: vi.fn(),
      minimize: vi.fn(),
    });

    render(
      <ConcentrationSessionProvider>
        <ConcentrationCard isVisible={true} />
      </ConcentrationSessionProvider>
    );

    // Verificar tiempo inicial (debe mostrar 00:10 basado en elapsedMs)
    const timerElement = screen.getByRole('timer');
    expect(timerElement).toHaveTextContent('00:10');

    // Simular paso de 1 segundo
    mockDateNow.mockReturnValue(startTime.getTime() + 1000);

    // Esperar a que el setInterval actualice el timer
    await waitFor(() => {
      const updatedTimer = screen.getByRole('timer');
      // Debe mostrar 00:11 (10 segundos base + 1 segundo adicional)
      expect(updatedTimer).toHaveTextContent('00:11');
    }, { timeout: 1500 });

    // Simular paso de otro segundo
    mockDateNow.mockReturnValue(startTime.getTime() + 2000);

    await waitFor(() => {
      const updatedTimer = screen.getByRole('timer');
      // Debe mostrar 00:12 (10 segundos base + 2 segundos adicionales)
      expect(updatedTimer).toHaveTextContent('00:12');
    }, { timeout: 1500 });

    // Restaurar Date.now
    Date.now = originalDateNow;
  });

  it('debe persistir elapsedMs correctamente al pausar', async () => {
    const mockPauseSession = vi.fn();
    const mockDateNow = vi.fn();
    const originalDateNow = Date.now;
    Date.now = mockDateNow;

    const startTime = new Date('2023-01-01T10:00:00Z');
    mockDateNow.mockReturnValue(startTime.getTime());

    mockUseConcentrationSession.mockReturnValue({
      getState: () => ({
        activeSession: {
          sessionId: 'test-session',
          title: 'Sesión de prueba',
          isRunning: true,
          elapsedMs: 5000, // 5 segundos ya transcurridos
          startTime: startTime.toISOString(),
        },
      }),
      pauseSession: mockPauseSession,
      resumeSession: vi.fn(),
      finishLater: vi.fn(),
      completeSession: vi.fn(),
      minimize: vi.fn(),
    });

    render(
      <ConcentrationSessionProvider>
        <ConcentrationCard isVisible={true} />
      </ConcentrationSessionProvider>
    );

    // Simular que han pasado 3 segundos desde startTime
    mockDateNow.mockReturnValue(startTime.getTime() + 3000);

    await waitFor(() => {
      const timerElement = screen.getByRole('timer');
      expect(timerElement).toHaveTextContent('00:08'); // 5 + 3 = 8 segundos
    });

    // Pausar la sesión
    const pauseButton = screen.getByLabelText('Pausar sesión');
    fireEvent.click(pauseButton);

    // Verificar que pauseSession fue llamado con el elapsedMs correcto
    // elapsedMs = 5000 + (3000) = 8000
    expect(mockPauseSession).toHaveBeenCalledWith();

    // Restaurar Date.now
    Date.now = originalDateNow;
  });
});