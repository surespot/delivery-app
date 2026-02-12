import { io, Socket } from 'socket.io-client';
import { getAuthToken } from '../onboarding/client';
import type { Message } from './types';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000';
const WS_NAMESPACE = '/chat';

let socket: Socket | null = null;

export interface ChatSocketCallbacks {
  onConnected?: (data: unknown) => void;
  onNewMessage?: (message: Message) => void;
  onMessagesRead?: (data: unknown) => void;
  onUserTyping?: (data: unknown) => void;
  onReadOnly?: (data: unknown) => void;
  onDisconnected?: () => void;
  onError?: (error: Error) => void;
}

let registeredCallbacks: Set<ChatSocketCallbacks> = new Set();

function notifyCallbacks<E extends keyof ChatSocketCallbacks>(
  event: E,
  ...args: Parameters<NonNullable<ChatSocketCallbacks[E]>>
) {
  registeredCallbacks.forEach((cb) => {
    const handler = cb[event];
    if (typeof handler === 'function') {
      // @ts-expect-error - we ensured handler matches event signature
      handler(...args);
    }
  });
}

export function registerChatSocketCallbacks(
  callbacks: ChatSocketCallbacks
): () => void {
  registeredCallbacks.add(callbacks);
  return () => {
    registeredCallbacks.delete(callbacks);
  };
}

export async function createChatSocket(): Promise<Socket | null> {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('No authentication token found for chat socket');
    }

    // Reuse existing connected socket
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
      reconnectionDelay: 3000,
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      console.log('Chat WebSocket connected');
    });

    socket.on('connected', (data: unknown) => {
      console.log('Chat WebSocket authenticated:', data);
      notifyCallbacks('onConnected', data as any);
    });

    socket.on('new-message', (message: Message) => {
      console.log('Chat WebSocket new message:', message);
      notifyCallbacks('onNewMessage', message);
    });

    socket.on('messages-read', (data: unknown) => {
      notifyCallbacks('onMessagesRead', data as any);
    });

    socket.on('user-typing', (data: unknown) => {
      notifyCallbacks('onUserTyping', data as any);
    });

    socket.on('conversation-read-only', (data: unknown) => {
      notifyCallbacks('onReadOnly', data as any);
    });

    socket.on('disconnect', () => {
      console.log('Chat WebSocket disconnected');
      notifyCallbacks('onDisconnected');
    });

    socket.on('connect_error', (error) => {
      console.error('Chat WebSocket connection error:', error);
      notifyCallbacks(
        'onError',
        error instanceof Error ? error : new Error(String(error))
      );
    });

    socket.on('error', (error) => {
      console.error('Chat WebSocket error:', error);
      notifyCallbacks(
        'onError',
        error instanceof Error ? error : new Error(String(error))
      );
    });

    return socket;
  } catch (error) {
    console.error('Error creating chat socket:', error);
    notifyCallbacks(
      'onError',
      error instanceof Error ? error : new Error('Failed to create chat socket')
    );
    return null;
  }
}

export function disconnectChatSocket(): void {
  if (socket?.connected) {
    socket.disconnect();
  }
  socket = null;
}

export function isChatSocketConnected(): boolean {
  return socket?.connected ?? false;
}

export function getChatSocket(): Socket | null {
  return socket;
}

// Convenience emitters
export function joinChatConversation(conversationId: string) {
  if (!socket) return;
  socket.emit('join-conversation', { conversationId });
}

export function leaveChatConversation(conversationId: string) {
  if (!socket) return;
  socket.emit('leave-conversation', { conversationId });
}

export function emitChatTyping(conversationId: string, isTyping: boolean) {
  if (!socket) return;
  socket.emit(isTyping ? 'typing' : 'stop-typing', { conversationId });
}

export function emitChatRead(conversationId: string) {
  if (!socket) return;
  socket.emit('read-conversation', { conversationId });
}

