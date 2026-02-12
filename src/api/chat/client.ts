import { apiRequest } from '../onboarding/client';
import type {
  ConversationResponse,
  ConversationsResponse,
  MarkAsReadResponse,
  MessagesResponse,
  SendMessageRequest,
  SendMessageResponse,
} from './types';

export const chatApi = {
  /**
   * Get user conversations
   * GET /chat/conversations
   */
  getConversations: (
    page: number = 1,
    limit: number = 20,
    type?: 'order' | 'support'
  ): Promise<ConversationsResponse> => {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (type) {
      queryParams.append('type', type);
    }
    return apiRequest<ConversationsResponse['data']>(
      `/chat/conversations?${queryParams.toString()}`,
      {
        method: 'GET',
        requiresAuth: true,
      }
    ) as Promise<ConversationsResponse>;
  },

  /**
   * Get conversation for an order
   * GET /chat/conversations/order/:orderId
   */
  getConversationByOrder: (orderId: string): Promise<ConversationResponse> => {
    return apiRequest<ConversationResponse['data']>(
      `/chat/conversations/order/${orderId}`,
      {
        method: 'GET',
        requiresAuth: true,
      }
    ) as Promise<ConversationResponse>;
  },

  /**
   * Get messages for a conversation
   * GET /chat/conversations/:id/messages
   */
  getMessages: (
    conversationId: string,
    cursor?: string,
    limit: number = 50
  ): Promise<MessagesResponse> => {
    const queryParams = new URLSearchParams({
      limit: limit.toString(),
    });
    if (cursor) {
      queryParams.append('cursor', cursor);
    }
    return apiRequest<MessagesResponse['data']>(
      `/chat/conversations/${conversationId}/messages?${queryParams.toString()}`,
      {
        method: 'GET',
        requiresAuth: true,
      }
    ) as Promise<MessagesResponse>;
  },

  /**
   * Send a message
   * POST /chat/messages
   */
  sendMessage: async (
    data: SendMessageRequest
  ): Promise<SendMessageResponse> => {
    const { getAuthToken } = await import('../onboarding/client');
    const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000';
    
    const token = await getAuthToken();
    const formData = new FormData();
    formData.append('orderId', data.orderId);
    formData.append('content', data.content);
    
    if (data.attachments && data.attachments.length > 0) {
      data.attachments.forEach((file) => {
        formData.append('attachments', file as any);
      });
    }

    const response = await fetch(`${BASE_URL}/chat/messages`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    const result: SendMessageResponse = await response.json();
    return result;
  },

  /**
   * Mark conversation as read
   * POST /chat/conversations/:id/read
   */
  markAsRead: (conversationId: string): Promise<MarkAsReadResponse> => {
    return apiRequest<MarkAsReadResponse['data']>(
      `/chat/conversations/${conversationId}/read`,
      {
        method: 'POST',
        requiresAuth: true,
      }
    ) as Promise<MarkAsReadResponse>;
  },
};
