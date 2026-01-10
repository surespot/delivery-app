import { io, Socket } from 'socket.io-client';
import { getAuthToken } from '../onboarding/client';
import type { OrderReadyEvent, WebSocketConnectionResponse } from './types';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000';
const WS_NAMESPACE = '/orders';

let socket: Socket | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 3000; // 3 seconds

// Registered callbacks across the app
let registeredCallbacks: Set<OrdersSocketCallbacks> = new Set();

export interface OrdersSocketCallbacks {
  onConnected?: (data: WebSocketConnectionResponse) => void;
  onOrderReady?: (data: OrderReadyEvent) => void;
  onDisconnected?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Internal helper to notify all registered callbacks for a given event
 */
function notifyCallbacks<E extends keyof OrdersSocketCallbacks>(
  event: E,
  ...args: Parameters<NonNullable<OrdersSocketCallbacks[E]>>
) {
  registeredCallbacks.forEach((cb) => {
    const handler = cb[event];
    if (typeof handler === 'function') {
      // @ts-expect-error - we ensured handler matches event signature
      handler(...args);
    }
  });
}

/**
 * Register callbacks for the shared orders WebSocket.
 * Returns an unsubscribe function.
 */
export function registerOrdersSocketCallbacks(
  callbacks: OrdersSocketCallbacks
): () => void {
  registeredCallbacks.add(callbacks);
  return () => {
    registeredCallbacks.delete(callbacks);
  };
}

/**
 * Create and connect to the orders WebSocket namespace.
 * If a socket already exists and is connected, it will be reused.
 */
export async function createOrdersSocket(): Promise<Socket | null> {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Reuse existing connected socket
    if (socket?.connected) {
      return socket;
    }

    // If socket exists but is not connected, disconnect it first
    if (socket && !socket.connected) {
      socket.disconnect();
    }

    // Create new socket connection
    socket = io(`${BASE_URL}${WS_NAMESPACE}`, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: RECONNECT_DELAY,
      reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
    });

    // Connection event
    socket.on('connect', () => {
      reconnectAttempts = 0;
      console.log('Orders WebSocket connected');
    });

    // Connection success event (from server)
    socket.on('connected', (data: WebSocketConnectionResponse) => {
      reconnectAttempts = 0;
      console.log('Orders WebSocket authenticated:', data);
      notifyCallbacks('onConnected', data);
    });

    // Order ready event
    socket.on('order:ready', (data: OrderReadyEvent) => {
      console.log('New order ready:', data);
      notifyCallbacks('onOrderReady', data);
    });

    // Disconnect event
    socket.on('disconnect', (reason) => {
      console.log('Orders WebSocket disconnected:', reason);
      notifyCallbacks('onDisconnected');
    });

    // Connection error
    socket.on('connect_error', (error) => {
      console.error('Orders WebSocket connection error:', error);
      reconnectAttempts++;
      if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
        notifyCallbacks(
          'onError',
          new Error('Failed to connect to orders WebSocket after multiple attempts')
        );
      }
    });

    // General error
    socket.on('error', (error) => {
      console.error('Orders WebSocket error:', error);
      notifyCallbacks(
        'onError',
        error instanceof Error ? error : new Error(String(error))
      );
    });

    return socket;
  } catch (error) {
    console.error('Error creating orders socket:', error);
    notifyCallbacks(
      'onError',
      error instanceof Error
        ? error
        : new Error('Failed to create WebSocket connection')
    );
    return null;
  }
}

/**
 * Disconnect the orders WebSocket completely.
 * Typically used on logout or when going offline.
 */
export function disconnectOrdersSocket(): void {
  if (socket?.connected) {
    socket.disconnect();
  }
  socket = null;
  reconnectAttempts = 0;
}

/**
 * Check if socket is connected
 */
export function isOrdersSocketConnected(): boolean {
  return socket?.connected ?? false;
}

/**
 * Get the current socket instance
 */
export function getOrdersSocket(): Socket | null {
  return socket;
}

/**
 * Reconnect the socket with a new token (useful after token refresh)
 */
export async function reconnectOrdersSocket(): Promise<Socket | null> {
  disconnectOrdersSocket();
  return createOrdersSocket();
}
