import { API_BASE_URL, API_ENDPOINTS } from './constants';
import type { NotificationSettings, UpcomingNotification, NotificationConfigUpdate } from '../types/api';

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
      return responseData.data;
    } else if (typeof responseData === 'object' && responseData !== null) {
      // Assume direct response format
      return responseData as NotificationSettings;
    } else {
      return {
        eventos: false,
        metodosPendientes: false,
        sesionesPendientes: false,
        motivacion: false,
      };
    }
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

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.NOTIFICATIONS_PREFERENCES}/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(config),
    });

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
      return responseData.data;
    } else if (typeof responseData === 'object' && responseData !== null) {
      return responseData as NotificationSettings;
    } else {
      throw new Error('Invalid response format from update API');
    }
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