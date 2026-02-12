// Chat API Types

import { ApiResponse } from '../onboarding/types';

// User info in conversation
export interface ChatUser {
  _id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
}

// Participant in conversation
export interface ConversationParticipant {
  userId: string;
  role: 'user' | 'rider';
  user: ChatUser;
}

// Conversation
export interface Conversation {
  id: string;
  type: 'order' | 'support';
  orderId: string;
  participants: ConversationParticipant[];
  lastMessage?: {
    id: string;
    content: string;
    senderId: string;
    createdAt: string;
  };
  lastMessageAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Message
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  attachments: MessageAttachment[];
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
  sender: ChatUser;
}

// Message Attachment
export interface MessageAttachment {
  id: string;
  url: string;
  type: 'image' | 'pdf';
  fileName: string;
  fileSize: number;
}

// Get Conversations Response
export interface ConversationsData {
  conversations: Conversation[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export type ConversationsResponse = ApiResponse<ConversationsData>;

// Get Conversation Response
export type ConversationResponse = ApiResponse<Conversation>;

// Get Messages Response
export interface MessagesData {
  messages: Message[];
  cursor?: string;
  hasMore: boolean;
}

export type MessagesResponse = ApiResponse<MessagesData>;

// Send Message Request
export interface SendMessageRequest {
  orderId: string;
  content: string;
  attachments?: File[];
}

// Send Message Response
export type SendMessageResponse = ApiResponse<Message>;

// Mark as Read Response
export interface MarkAsReadData {
  conversationId: string;
  readBy: string;
  readAt: string;
  markedCount: number;
}

export type MarkAsReadResponse = ApiResponse<MarkAsReadData>;

// Error Codes
export enum ChatErrorCode {
  ORDER_NOT_FOUND = 'ORDER_NOT_FOUND',
  NO_RIDER_ASSIGNED = 'NO_RIDER_ASSIGNED',
  CHAT_NOT_AVAILABLE = 'CHAT_NOT_AVAILABLE',
  CONVERSATION_READ_ONLY = 'CONVERSATION_READ_ONLY',
  ACCESS_DENIED = 'ACCESS_DENIED',
  INVALID_CURSOR = 'INVALID_CURSOR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
}
