import { API_BASE_URL, API_ENDPOINTS } from '../config/constants';
import type { NotificationSettings, UpcomingNotification, NotificationConfigUpdate } from '../../types/api';

const EMPTY_NOTIFICATION_SETTINGS: NotificationSettings = {
  eventos: false,
  metodosPendientes: false,
  sesionesPendientes: false,
  motivacion: false,
};

const normalizeNotificationSettings = (
  payload: unknown,
  fallback: NotificationSettings = EMPTY_NOTIFICATION_SETTINGS
): NotificationSettings => {
  if (!payload || typeof payload !== 'object') {
    return fallback;
  }

  const settingsSource = payload as Partial<NotificationSettings>;

  return {
    eventos: typeof settingsSource.eventos === 'boolean' ? settingsSource.eventos : fallback.eventos,
    metodosPendientes:
      typeof settingsSource.metodosPendientes === 'boolean'
        ? settingsSource.metodosPendientes
        : fallback.metodosPendientes,
    sesionesPendientes:
      typeof settingsSource.sesionesPendientes === 'boolean'
        ? settingsSource.sesionesPendientes
        : fallback.sesionesPendientes,
    motivacion: typeof settingsSource.motivacion === 'boolean' ? settingsSource.motivacion : fallback.motivacion,
  };
};

/**
 * API integration layer for notifications operations
 * Handles all HTTP requests to the notifications endpoints
 */
export const notificationsApi = {
  /**
   * Get current notification settings for the authenticated user
   */
  getNotificationSettings: async (): Promise<NotificationSettings> => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    if (!token || !userId) {
      throw new Error('No authentication token or user ID found');
    }

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.NOTIFICATIONS_PREFERENCES}/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('token');
        throw new Error('Authentication expired');
      }
      throw new Error('Failed to fetch notification settings');
    }

    const responseData = await response.json();

    // Handle both wrapped and direct response formats
    if (responseData.data) {
      return normalizeNotificationSettings(responseData.data);
    }

    return normalizeNotificationSettings(responseData);
  },

  /**
   * Update notification settings
   */
  updateNotificationSetting: async (config: NotificationConfigUpdate): Promise<NotificationSettings> => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    if (!token || !userId) {
      throw new Error('No authentication token or user ID found');
    }

    const url = `${API_BASE_URL}${API_ENDPOINTS.NOTIFICATIONS_PREFERENCES}/${userId}`;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
    const payload = JSON.stringify({
      ...config,
      [config.tipo]: config.enabled,
    });

    const sendUpdate = (method: 'PATCH' | 'PUT') =>
      fetch(url, {
        method,
        headers,
        body: payload,
      });

    let response: Response;

    try {
      response = await sendUpdate('PATCH');
    } catch (error) {
      // In dev, fallback to PUT if PATCH is blocked by CORS/preflight.
      if (import.meta.env.DEV) {
        response = await sendUpdate('PUT');
      } else {
        throw error;
      }
    }

    if (!response.ok && response.status === 405 && import.meta.env.DEV) {
      response = await sendUpdate('PUT');
    }

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('token');
        throw new Error('Authentication expired');
      }
      throw new Error('Failed to update notification settings');
    }

    const responseData = await response.json();

    // Handle both wrapped and direct response formats
    if (responseData.data) {
      return normalizeNotificationSettings(responseData.data);
    }

    return normalizeNotificationSettings(responseData);
  },

  /**
   * Get upcoming scheduled notifications
   */
  getUpcomingNotifications: async (): Promise<UpcomingNotification[]> => {
    const token = localStorage.getItem('token');

    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.NOTIFICATIONS_SCHEDULED}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('token');
        throw new Error('Authentication expired');
      }
      throw new Error('Failed to fetch upcoming notifications');
    }

    const responseData = await response.json();

    // Handle both wrapped and direct response formats
    if (responseData.data && Array.isArray(responseData.data)) {
      return responseData.data;
    } else if (Array.isArray(responseData)) {
      return responseData;
    } else {
      return [];
    }
  },
};
