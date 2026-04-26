import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { notificationsApi } from './client';
import type { Notification } from './types';
import {
  createNotificationsSocket,
  disconnectNotificationsSocket,
  isNotificationsSocketConnected,
  registerNotificationsSocketCallbacks,
  type NotificationsSocketCallbacks,
} from './websocket';

export const notificationsKeys = {
  all: ['notifications'] as const,
  list: (page?: number, limit?: number, isRead?: boolean, type?: string) =>
    ['notifications', 'list', page, limit, isRead, type] as const,
  unreadCount: ['notifications', 'unread-count'] as const,
};

export const useNotifications = (
  page: number = 1,
  limit: number = 20,
  isRead?: boolean,
  type?: string,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: notificationsKeys.list(page, limit, isRead, type),
    queryFn: () =>
      notificationsApi.getNotifications(page, limit, isRead, type),
    enabled,
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

export const useUnreadCount = (enabled: boolean = true) => {
  return useQuery({
    queryKey: notificationsKeys.unreadCount,
    queryFn: () => notificationsApi.getUnreadCount(),
    enabled,
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

export const useAddPushToken = () => {
  return useMutation({
    mutationFn: (token: string) => notificationsApi.addPushToken(token),
  });
};

export const useRemovePushToken = () => {
  return useMutation({
    mutationFn: (token: string) => notificationsApi.removePushToken(token),
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) =>
      notificationsApi.markAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['notifications'],
        exact: false,
      });
    },
  });
};

export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['notifications'],
        exact: false,
      });
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) =>
      notificationsApi.deleteNotification(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['notifications'],
        exact: false,
      });
    },
  });
};

export const useDeleteAllNotifications = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsApi.deleteAllNotifications(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['notifications'],
        exact: false,
      });
    },
  });
};

export const useNotificationsWebSocket = (
  enabled: boolean = true,
  callbacks?: NotificationsSocketCallbacks
) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled || !callbacks) {
      return;
    }

    const enhancedCallbacks: NotificationsSocketCallbacks = {
      ...callbacks,
      onNotification: (data: Notification) => {
        queryClient.invalidateQueries({
          queryKey: ['notifications'],
          exact: false,
        });
        callbacks.onNotification?.(data);
      },
      onConnected: (data) => {
        callbacks.onConnected?.(data);
      },
      onDisconnected: () => {
        callbacks.onDisconnected?.();
      },
      onError: (error) => {
        callbacks.onError?.(error);
      },
    };

    const unregister = registerNotificationsSocketCallbacks(enhancedCallbacks);

    if (!isNotificationsSocketConnected()) {
      createNotificationsSocket().catch(() => {
        // Socket will retry automatically via reconnection settings
      });
    }

    return () => {
      unregister();
    };
  }, [enabled, queryClient, callbacks]);

  return {
    isConnected: isNotificationsSocketConnected(),
  };
};
