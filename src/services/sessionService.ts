/**
 * Servicio de API para operaciones de sesiones de concentración
 *
 * Este módulo proporciona una interfaz unificada para todas las operaciones
 * relacionadas con sesiones de concentración. Maneja el mapeo entre los
 * formatos del servidor (snake_case) y del cliente (camelCase), así como
 * la gestión de errores y reintentos.
 *
 * Todas las llamadas API incluyen manejo de autenticación JWT automático.
 */

import { apiClient } from '../utils/apiClient';
import { API_ENDPOINTS } from '../utils/constants';
import type {
  SessionDto,
  SessionCreateDto,
  SessionFilters,
  ActiveSession
} from '../types/api';
import { mapServerSession, mapClientToServerStatus } from '../utils/sessionMappers';

/**
 * Servicio principal para operaciones de sesiones
 */
class SessionService {
  /**
   * Crea una nueva sesión de concentración
   *
   * @param payload - Datos para crear la sesión
   * @returns DTO de la sesión creada
   */
  async startSession(payload: SessionCreateDto): Promise<SessionDto> {
    try {
      const response = await apiClient.post(API_ENDPOINTS.SESSIONS, payload);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error creando sesión:', error);
      throw error;
    }
  }

  /**
   * Pausa una sesión activa usando el nuevo endpoint de reportes
   *
   * Actualización crítica: Se reemplaza el endpoint deprecated POST /api/v1/sessions/{id}/pause
   * por el nuevo PATCH /api/v1/reports/sessions/{sessionId}/progress con status "pending".
   *
   * @param sessionId - ID de la sesión a pausar
   * @param elapsedMs - Tiempo transcurrido en milisegundos
   */
  async pauseSession(sessionId: string, elapsedMs: number): Promise<void> {
    try {
      // Se corrige el endpoint deprecated por el nuevo sistema de reportes
      // Anteriormente: POST /api/v1/sessions/{id}/pause
      // Ahora: PATCH /api/v1/reports/sessions/{id}/progress
      await apiClient.patch(`/reports/sessions/${sessionId}/progress`, {
        status: 'pending',
        elapsedMs: elapsedMs
      });
    } catch (error) {
      console.error('Error pausando sesión con nuevo endpoint:', error);
      throw error;
    }
  }

  /**
   * Reanuda una sesión pausada - DEPRECATED
   *
   * Esta función ha sido eliminada ya que la reanudación de sesiones
   * ahora se maneja únicamente del lado del cliente. El backend ya no
   * expone un endpoint para reanudar sesiones.
   *
   * @deprecated Use client-side session resumption instead
   */
  async resumeSession(_sessionId: string): Promise<void> {
    console.warn('resumeSession is deprecated. Session resumption is now handled client-side only.');
    // No longer calls any backend endpoint
    return Promise.resolve();
  }

  /**
   * Marca una sesión como "terminar más tarde" usando el nuevo endpoint de reportes
   *
   * Actualización crítica: Se reemplaza el endpoint deprecated POST /api/v1/sessions/{id}/finish-later
   * por el nuevo PATCH /api/v1/reports/sessions/{sessionId}/progress con status "pending".
   *
   * @param sessionId - ID de la sesión
   * @param elapsedMs - Tiempo transcurrido en milisegundos
   * @param notes - Notas adicionales para marcar como aplazada
   */
  async finishLater(sessionId: string, elapsedMs: number, notes?: string): Promise<void> {
    try {
      // Se corrige el endpoint deprecated por el nuevo sistema de reportes
      // Anteriormente: POST /api/v1/sessions/{id}/finish-later
      // Ahora: PATCH /api/v1/reports/sessions/{id}/progress
      const payload: any = {
        status: 'pending',
        elapsedMs: elapsedMs
      };
      if (notes) {
        payload.notes = notes;
      }
      await apiClient.patch(`/reports/sessions/${sessionId}/progress`, payload);
    } catch (error) {
      console.error('Error marcando finish-later con nuevo endpoint:', error);
      throw error;
    }
  }

  /**
   * Completa una sesión usando el nuevo endpoint de reportes
   *
   * Actualización crítica: Se reemplaza el endpoint deprecated POST /api/v1/sessions/{id}/complete
   * por el nuevo PATCH /api/v1/reports/sessions/{sessionId}/progress con status "completed".
   *
   * @param sessionId - ID de la sesión a completar
   * @param elapsedMs - Tiempo transcurrido en milisegundos
   * @param notes - Notas adicionales para la sesión completada
   */
  async completeSession(sessionId: string, elapsedMs: number, notes?: string): Promise<void> {
    try {
      // Se corrige el endpoint deprecated por el nuevo sistema de reportes
      // Anteriormente: POST /api/v1/sessions/{id}/complete
      // Ahora: PATCH /api/v1/reports/sessions/{id}/progress
      const payload: any = {
        status: 'completed',
        elapsedMs: elapsedMs,
        duracion: Math.round(elapsedMs / 1000) // Convertir a segundos como requiere el backend
      };
      if (notes) {
        payload.notes = notes;
      }
      await apiClient.patch(`/reports/sessions/${sessionId}/progress`, payload);
    } catch (error) {
      console.error('Error completando sesión con nuevo endpoint:', error);
      throw error;
    }
  }

  /**
   * Obtiene los detalles de una sesión específica
   *
   * @param sessionId - ID de la sesión
   * @returns DTO de la sesión con datos expandidos
   */
  async getSession(sessionId: string): Promise<SessionDto> {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.SESSIONS}/${sessionId}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error obteniendo sesión:', error);
      throw error;
    }
  }

  /**
   * Lista sesiones del usuario con filtros opcionales
   *
   * @param filters - Filtros opcionales para la consulta
   * @returns Array de DTOs de sesiones
   */
  async listUserSessions(filters?: SessionFilters): Promise<SessionDto[]> {
    try {
      const params = new URLSearchParams();

      if (filters?.type) params.append('type', filters.type);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters?.dateTo) params.append('dateTo', filters.dateTo);

      const queryString = params.toString();
      const url = queryString
        ? `${API_ENDPOINTS.SESSIONS}?${queryString}`
        : API_ENDPOINTS.SESSIONS;

      const response = await apiClient.get(url);
      return response.data.data || response.data || [];
    } catch (error) {
      console.error('Error listando sesiones:', error);
      throw error;
    }
  }

  /**
   * Obtiene sesiones pendientes que han estado inactivas por X días
   * (para debugging/cron del administrador)
   *
   * @param days - Número de días de inactividad
   * @returns Array de DTOs de sesiones
   */
  async getPendingAged(days: number): Promise<SessionDto[]> {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.SESSIONS}/pending-aged?days=${days}`);
      return response.data.data || response.data || [];
    } catch (error) {
      console.error('Error obteniendo sesiones pendientes antiguas:', error);
      throw error;
    }
  }

  /**
   * Mapea un DTO del servidor a un objeto ActiveSession del cliente
   *
   * @param dto - DTO recibido del servidor
   * @param persistedAt - Timestamp de persistencia local
   * @returns Objeto ActiveSession listo para usar
   */
  mapServerSession(dto: SessionDto, persistedAt?: string): ActiveSession {
    return mapServerSession(dto, persistedAt);
  }

  /**
   * Convierte estado de cliente a estado de servidor
   *
   * @param clientStatus - Estado del cliente
   * @param isRunning - Si está corriendo
   * @returns Estado del servidor
   */
  mapClientToServerStatus(clientStatus: 'active' | 'paused' | 'completed'): 'pending' | 'completed' {
    return mapClientToServerStatus(clientStatus);
  }
}

// Instancia singleton del servicio
const sessionServiceInstance = new SessionService();

export { sessionServiceInstance as sessionService };
export default sessionServiceInstance;