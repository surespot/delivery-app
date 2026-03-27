import { io, Socket } from 'socket.io-client';
import { getAuthToken } from '../onboarding/client';
import type { Notification } from './types';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000';
const WS_NAMESPACE = '/notifications';

let socket: Socket | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 3000;

let registeredCallbacks: Set<NotificationsSocketCallbacks> = new Set();

export interface NotificationsSocketConnectionResponse {
  success: boolean;
  message: string;
  userId: string;
}

export interface NotificationsSocketCallbacks {
  onConnected?: (data: NotificationsSocketConnectionResponse) => void;
  onNotification?: (data: Notification) => void;
  onDisconnected?: () => void;
  onError?: (error: Error) => void;
}

function notifyCallbacks<E extends keyof NotificationsSocketCallbacks>(
  event: E,
  ...args: Parameters<NonNullable<NotificationsSocketCallbacks[E]>>
) {
  registeredCallbacks.forEach((cb) => {
    const handler = cb[event];
    if (typeof handler === 'function') {
      (handler as (...a: unknown[]) => void)(...args);
    }
  });
}

export function registerNotificationsSocketCallbacks(
  callbacks: NotificationsSocketCallbacks
): () => void {
  registeredCallbacks.add(callbacks);
  return () => {
    registeredCallbacks.delete(callbacks);
  };
}

export async function createNotificationsSocket(): Promise<Socket | null> {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    if (socket?.connected) {
      return socket;
    }

    if (socket && !socket.connected) {
      socket.disconnect();
    }

    socket = io(`${BASE_URL}${WS_NAMESPACE}`, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: RECONNECT_DELAY,
      reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
    });

    socket.on('connect', () => {
      reconnectAttempts = 0;
    });

    socket.on('connected', (data: NotificationsSocketConnectionResponse) => {
      reconnectAttempts = 0;
      notifyCallbacks('onConnected', data);
    });

    socket.on('notification', (data: Notification) => {
      notifyCallbacks('onNotification', data);
    });

    socket.on('disconnect', () => {
      notifyCallbacks('onDisconnected');
    });

    socket.on('connect_error', (error) => {
      reconnectAttempts++;
      if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
        notifyCallbacks(
          'onError',
          new Error('Failed to connect to notifications WebSocket after multiple attempts')
        );
      }
    });

    socket.on('error', (error) => {
      notifyCallbacks(
        'onError',
        error instanceof Error ? error : new Error(String(error))
      );
    });

    return socket;
  } catch (error) {
    notifyCallbacks(
      'onError',
      error instanceof Error
        ? error
        : new Error('Failed to create notifications WebSocket connection')
    );
    return null;
  }
}

export function disconnectNotificationsSocket(): void {
  if (socket?.connected) {
    socket.disconnect();
  }
  socket = null;
  reconnectAttempts = 0;
}

export function isNotificationsSocketConnected(): boolean {
  return socket?.connected ?? false;
}
