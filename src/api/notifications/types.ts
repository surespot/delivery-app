// Notifications API Types

import { ApiResponse } from '../onboarding/types';

export type NotificationType = 'order_ready' | 'payment_success' | 'general';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface PickupLocationRef {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

export interface NotificationData {
  orderId?: string;
  orderNumber?: string;
  pickupLocation?: PickupLocationRef;
  deliveryAddress?: {
    address: string;
    coordinates: Coordinates;
  };
  total?: number;
  formattedTotal?: string;
  itemCount?: number;
  amount?: number;
  source?: string;
  [key: string]: unknown;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: NotificationData;
  channels: string[];
  isRead: boolean;
  createdAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface NotificationsData {
  notifications: Notification[];
  pagination: PaginationMeta;
}

export type NotificationsResponse = ApiResponse<NotificationsData>;

export interface UnreadCountData {
  unreadCount: number;
}

export type UnreadCountResponse = ApiResponse<UnreadCountData>;

export interface MarkReadData {
  id: string;
  isRead: boolean;
  readAt?: string;
}

export type MarkReadResponse = ApiResponse<MarkReadData>;

export interface MarkAllReadData {
  markedCount: number;
}

export type MarkAllReadResponse = ApiResponse<MarkAllReadData>;

export interface DeleteAllData {
  deletedCount: number;
}

export type DeleteAllResponse = ApiResponse<DeleteAllData>;

export interface AddPushTokenResponse = ApiResponse<Record<string, never>>;
