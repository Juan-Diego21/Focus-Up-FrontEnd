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
   * Pausa una sesión activa
   *
   * @param sessionId - ID de la sesión a pausar
   */
  async pauseSession(sessionId: string): Promise<void> {
    try {
      await apiClient.post(`${API_ENDPOINTS.SESSIONS}/${sessionId}/pause`);
    } catch (error) {
      console.error('Error pausando sesión:', error);
      throw error;
    }
  }

  /**
   * Reanuda una sesión pausada
   *
   * @param sessionId - ID de la sesión a reanudar
   */
  async resumeSession(sessionId: string): Promise<void> {
    try {
      await apiClient.post(`${API_ENDPOINTS.SESSIONS}/${sessionId}/resume`);
    } catch (error) {
      console.error('Error reanudando sesión:', error);
      throw error;
    }
  }

  /**
   * Marca una sesión como "terminar más tarde"
   *
   * @param sessionId - ID de la sesión
   */
  async finishLater(sessionId: string): Promise<void> {
    try {
      await apiClient.post(`${API_ENDPOINTS.SESSIONS}/${sessionId}/finish-later`);
    } catch (error) {
      console.error('Error marcando finish-later:', error);
      throw error;
    }
  }

  /**
   * Completa una sesión
   *
   * @param sessionId - ID de la sesión a completar
   */
  async completeSession(sessionId: string): Promise<void> {
    try {
      await apiClient.post(`${API_ENDPOINTS.SESSIONS}/${sessionId}/complete`);
    } catch (error) {
      console.error('Error completando sesión:', error);
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