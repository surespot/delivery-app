// Orders API Types

import { ApiResponse } from '../onboarding/types';

// Order Item Types
export interface OrderItem {
  id: string;
  foodItemId: string;
  name: string;
  description: string;
  slug: string;
  price: number; // in kobo
  formattedPrice: string;
  currency: string;
  imageUrl?: string;
  quantity: number;
  extras: unknown[];
  lineTotal: number; // in kobo
}

// Coordinates
export interface Coordinates {
  latitude: number;
  longitude: number;
}

// Delivery Address
export interface DeliveryAddress {
  address: string;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  coordinates: Coordinates;
  instructions?: string;
  contactPhone?: string;
}

// Pickup Location
export interface PickupLocation {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

// Order Status
export type OrderStatus = 'ready' | 'out-for-delivery' | 'delivered' | 'cancelled';
export type DeliveryType = 'door-delivery';
export type PaymentStatus = 'paid' | 'pending' | 'failed';
export type PaymentMethod = 'card' | 'cash' | 'wallet' | 'bank-transfer';

// Full Order Object
export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatus;
  deliveryType: DeliveryType;
  items: OrderItem[];
  subtotal: number; // in kobo
  extrasTotal: number; // in kobo
  deliveryFee: number; // in kobo
  discountAmount: number; // in kobo
  total: number; // in kobo
  formattedTotal: string;
  itemCount: number;
  extrasCount: number;
  deliveryAddress: DeliveryAddress;
  pickupLocation: PickupLocation;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  assignedRiderId: string | null;
  assignedAt: string | null;
  assignedBy: string | null;
  deliveredAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

// Pagination Metadata
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Eligible Orders Response
export interface EligibleOrdersData {
  orders: Order[];
  pagination: PaginationMeta;
}

export type EligibleOrdersResponse = ApiResponse<EligibleOrdersData>;

// Assigned Orders Response
export interface AssignedOrdersData {
  orders: Order[];
  pagination: PaginationMeta;
}

export type AssignedOrdersResponse = ApiResponse<AssignedOrdersData>;

// Accept Order Request
export interface AcceptOrderRequest {
  orderId: string;
}

// Accept Order Response
export type AcceptOrderResponse = ApiResponse<Order>;

// Mark Order as Delivered Request
export interface MarkDeliveredRequest {
  confirmationCode: string; // Required: 4 digits
  message?: string; // max 500 chars
  latitude?: number; // -90 to 90
  longitude?: number; // -180 to 180
}

// Mark Order as Delivered Response
export type MarkDeliveredResponse = ApiResponse<Order>;

// Pick Up Order Response
export type PickUpOrderResponse = ApiResponse<Order>;

// WebSocket Connection Response
export interface WebSocketConnectionResponse {
  success: boolean;
  message: string;
  riderProfileId: string;
  regionId: string;
  rooms: string[];
}

// WebSocket Order Ready Event
export interface OrderReadyEvent {
  orderId: string;
  orderNumber: string;
  pickupLocation: PickupLocation;
  deliveryAddress: {
    address: string;
    coordinates: Coordinates;
  };
  total: number; // in kobo
  formattedTotal: string;
  itemCount: number;
  timestamp: string;
}

// WebSocket Order Picked Up Event
export interface OrderPickedUpEvent {
  orderId: string;
  orderNumber: string;
  message: string;
  timestamp: string;
}

// Error Codes
export enum OrdersErrorCode {
  RIDER_PROFILE_NOT_FOUND = 'RIDER_PROFILE_NOT_FOUND',
  RIDER_NOT_ACTIVE = 'RIDER_NOT_ACTIVE',
  ORDER_NOT_FOUND = 'ORDER_NOT_FOUND',
  ORDER_ALREADY_ASSIGNED = 'ORDER_ALREADY_ASSIGNED',
  ORDER_NOT_READY = 'ORDER_NOT_READY',
  INVALID_ORDER_TYPE = 'INVALID_ORDER_TYPE',
  FORBIDDEN = 'FORBIDDEN',
  MAX_ORDERS_REACHED = 'MAX_ORDERS_REACHED',
  INVALID_ORDER_STATUS = 'INVALID_ORDER_STATUS',
  ORDER_NOT_ASSIGNED = 'ORDER_NOT_ASSIGNED',
  ORDER_NOT_ASSIGNED_TO_RIDER = 'ORDER_NOT_ASSIGNED_TO_RIDER',
  CONFIRMATION_CODE_MISSING = 'CONFIRMATION_CODE_MISSING',
  INVALID_CONFIRMATION_CODE = 'INVALID_CONFIRMATION_CODE',
}
