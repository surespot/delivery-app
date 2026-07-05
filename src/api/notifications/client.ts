import { apiRequest } from '../onboarding/client';
import type { ApiResponse } from '../onboarding/types';
import type {
  NotificationsResponse,
  UnreadCountResponse,
  MarkReadResponse,
  MarkAllReadResponse,
  DeleteAllResponse,
  AddPushTokenResponse,
} from './types';

export const notificationsApi = {
  /**
   * Get notifications
   * GET /notifications
   */
  getNotifications: (
    page: number = 1,
    limit: number = 20,
    isRead?: boolean,
    type?: string
  ): Promise<NotificationsResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (isRead !== undefined) {
      params.append('isRead', String(isRead));
    }
    if (type) {
      params.append('type', type);
    }
    return apiRequest<NotificationsResponse['data']>(
      `/notifications?${params.toString()}`,
      {
        method: 'GET',
        requiresAuth: true,
      }
    ) as Promise<NotificationsResponse>;
  },

  /**
   * Get unread count
   * GET /notifications/unread-count
   */
  getUnreadCount: (): Promise<UnreadCountResponse> => {
    return apiRequest<UnreadCountResponse['data']>(
      '/notifications/unread-count',
      {
        method: 'GET',
        requiresAuth: true,
      }
    ) as Promise<UnreadCountResponse>;
  },

  /**
   * Mark notification as read
   * POST /notifications/:notificationId/read
   */
  markAsRead: (notificationId: string): Promise<MarkReadResponse> => {
    return apiRequest<MarkReadResponse['data']>(
      `/notifications/${notificationId}/read`,
      {
        method: 'POST',
        requiresAuth: true,
      }
    ) as Promise<MarkReadResponse>;
  },

  /**
   * Mark all notifications as read
   * POST /notifications/read-all
   */
  markAllAsRead: (): Promise<MarkAllReadResponse> => {
    return apiRequest<MarkAllReadResponse['data']>(
      '/notifications/read-all',
      {
        method: 'POST',
        requiresAuth: true,
      }
    ) as Promise<MarkAllReadResponse>;
  },

  /**
   * Delete a notification
   * DELETE /notifications/:notificationId
   */
  deleteNotification: (notificationId: string): Promise<ApiResponse<Record<string, never>>> => {
    return apiRequest<Record<string, never>>(
      `/notifications/${notificationId}`,
      {
        method: 'DELETE',
        requiresAuth: true,
      }
    ) as Promise<ApiResponse<Record<string, never>>>;
  },

  /**
   * Delete all notifications
   * DELETE /notifications
   */
  deleteAllNotifications: (): Promise<DeleteAllResponse> => {
    return apiRequest<DeleteAllResponse['data']>('/notifications', {
      method: 'DELETE',
      requiresAuth: true,
    }) as Promise<DeleteAllResponse>;
  },

  /**
   * Add push token (raw FCM/APNS device token)
   * POST /notifications/push-token
   */
  addPushToken: (
    token: string,
    platform: 'ios' | 'android'
  ): Promise<AddPushTokenResponse> => {
    return apiRequest<Record<string, never>>('/notifications/push-token', {
      method: 'POST',
      body: { token, platform },
      requiresAuth: true,
    }) as Promise<AddPushTokenResponse>;
  },

  /**
   * Remove push token
   * DELETE /notifications/push-token/:token
   */
  removePushToken: (token: string): Promise<ApiResponse<Record<string, never>>> => {
    const encoded = encodeURIComponent(token);
    return apiRequest<Record<string, never>>(
      `/notifications/push-token/${encoded}`,
      {
        method: 'DELETE',
        requiresAuth: true,
      }
    ) as Promise<ApiResponse<Record<string, never>>>;
  },
};
