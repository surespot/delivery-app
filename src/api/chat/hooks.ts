// Chat API Hooks

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { chatApi } from './client';
import type { SendMessageRequest } from './types';
import {
    ChatSocketCallbacks,
    createChatSocket,
    emitChatRead,
    joinChatConversation,
    leaveChatConversation,
    registerChatSocketCallbacks,
} from './websocket';

// Query keys
export const chatKeys = {
  all: ['chat'] as const,
  conversations: () => [...chatKeys.all, 'conversations'] as const,
  conversation: (orderId: string) =>
    [...chatKeys.conversations(), orderId] as const,
  messages: (conversationId: string) =>
    [...chatKeys.all, 'messages', conversationId] as const,
};

/**
 * Get user conversations
 */
export function useConversations(
  page: number = 1,
  limit: number = 20,
  type?: 'order' | 'support',
  enabled: boolean = true
) {
  return useQuery({
    queryKey: [...chatKeys.conversations(), page, limit, type],
    queryFn: () => chatApi.getConversations(page, limit, type),
    enabled,
  });
}

/**
 * Get conversation for an order
 */
export function useConversationByOrder(orderId: string | undefined, enabled: boolean = true) {
  return useQuery({
    queryKey: chatKeys.conversation(orderId || ''),
    queryFn: () => {
      if (!orderId) throw new Error('Order ID is required');
      return chatApi.getConversationByOrder(orderId);
    },
    enabled: enabled && !!orderId,
  });
}

/**
 * Get messages for a conversation
 */
export function useMessages(
  conversationId: string | undefined,
  cursor?: string,
  limit: number = 50,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: [...chatKeys.messages(conversationId || ''), cursor, limit],
    queryFn: () => {
      if (!conversationId) throw new Error('Conversation ID is required');
      return chatApi.getMessages(conversationId, cursor, limit);
    },
    enabled: enabled && !!conversationId,
  });
}

/**
 * Send a message
 */
export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SendMessageRequest) => chatApi.sendMessage(data),
    onSuccess: (response, variables) => {
      // Invalidate messages query to refetch
      if (response.data?.conversationId) {
        queryClient.invalidateQueries({
          queryKey: chatKeys.messages(response.data.conversationId),
        });
      }
      // Invalidate conversations to update last message
      queryClient.invalidateQueries({
        queryKey: chatKeys.conversations(),
      });
    },
  });
}

/**
 * Mark conversation as read
 */
export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) => chatApi.markAsRead(conversationId),
    onSuccess: (response) => {
      // Invalidate messages to update read status
      if (response.data?.conversationId) {
        queryClient.invalidateQueries({
          queryKey: chatKeys.messages(response.data.conversationId),
        });
      }
    },
  });
}

/**
 * Hook to manage chat WebSocket connection for a conversation.
 */
export function useChatWebSocket(
  conversationId: string | undefined,
  enabled: boolean,
  callbacks?: ChatSocketCallbacks
) {
  useEffect(() => {
    if (!enabled || !conversationId) return;

    let isMounted = true;
    let unregister: (() => void) | undefined;

    (async () => {
      const socket = await createChatSocket();
      if (!socket || !isMounted) return;

      if (callbacks) {
        unregister = registerChatSocketCallbacks(callbacks);
      }

      joinChatConversation(conversationId);
      emitChatRead(conversationId);
    })();

    return () => {
      isMounted = false;
      leaveChatConversation(conversationId);
      unregister?.();
    };
  }, [conversationId, enabled, callbacks]);
}
