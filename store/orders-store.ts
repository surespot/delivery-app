import { create } from 'zustand';
import type { Order as ApiOrder } from '@/src/api/orders/types';
import { transformOrderForUI } from '@/src/api/orders/utils';

// UI-friendly order format (maintained for backward compatibility)
export interface Order {
  id: string;
  pickupAddress: string;
  deliveryAddress: string;
  price: string;
  time: string;
  distance: string;
  timestamp?: string;
  fullOrder?: ApiOrder; // Include full API order for detailed operations
}

interface OrdersState {
  // Transformed orders from API
  currentOrders: Order[];
  availableOrders: Order[];
  completedOrders: Order[];
  
  // Loading and error states
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setAvailableOrders: (orders: ApiOrder[]) => void;
  setCurrentOrders: (orders: ApiOrder[]) => void;
  setCompletedOrders: (orders: ApiOrder[]) => void;
  addCurrentOrder: (order: Order) => void;
  removeCurrentOrder: (orderId: string) => void;
  removeAvailableOrder: (orderId: string) => void;
  markAsDelivered: (orderId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useOrdersStore = create<OrdersState>((set) => ({
  currentOrders: [],
  availableOrders: [],
  completedOrders: [],
  isLoading: false,
  error: null,

  // Transform API orders to UI format
  setAvailableOrders: (orders: ApiOrder[]) =>
    set({
      availableOrders: orders.map(transformOrderForUI),
      error: null,
    }),

  setCurrentOrders: (orders: ApiOrder[]) =>
    set({
      currentOrders: orders.map(transformOrderForUI),
      error: null,
    }),

  setCompletedOrders: (orders: ApiOrder[]) =>
    set({
      completedOrders: orders.map(transformOrderForUI),
      error: null,
    }),

  addCurrentOrder: (order) =>
    set((state) => {
      if (state.currentOrders.length >= 3) {
        return { ...state, error: 'You cannot accept more than 3 orders at once' };
      }
      return {
        currentOrders: [...state.currentOrders, order],
        availableOrders: state.availableOrders.filter((o) => o.id !== order.id),
        error: null,
      };
    }),

  removeCurrentOrder: (orderId) =>
    set((state) => ({
      currentOrders: state.currentOrders.filter((o) => o.id !== orderId),
    })),

  removeAvailableOrder: (orderId) =>
    set((state) => ({
      availableOrders: state.availableOrders.filter((o) => o.id !== orderId),
    })),

  markAsDelivered: (orderId) =>
    set((state) => {
      const order = state.currentOrders.find((o) => o.id === orderId);
      if (order) {
        return {
          currentOrders: state.currentOrders.filter((o) => o.id !== orderId),
          completedOrders: [...state.completedOrders, order],
          error: null,
        };
      }
      return state;
    }),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  clearError: () => set({ error: null }),
}));
