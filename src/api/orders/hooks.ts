import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { ordersApi } from './client';
import type {
  MarkDeliveredRequest,
  OrderReadyEvent,
  OrderPickedUpEvent,
  OrderStatus,
} from './types';
import {
  createOrdersSocket,
  disconnectOrdersSocket,
  isOrdersSocketConnected,
  registerOrdersSocketCallbacks,
  type OrdersSocketCallbacks,
} from './websocket';

// Query Keys
export const ordersKeys = {
  all: ['orders'] as const,
  eligible: (page?: number, limit?: number, status?: string) =>
    ['orders', 'eligible', page, limit, status] as const,
  assigned: (page?: number, limit?: number, status?: OrderStatus) =>
    ['orders', 'assigned', page, limit, status] as const,
};

/**
 * Get eligible orders (available for acceptance)
 */
export const useEligibleOrders = (
  page: number = 1,
  limit: number = 20,
  status: 'ready' = 'ready',
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ordersKeys.eligible(page, limit, status),
    queryFn: () => ordersApi.getEligibleOrders(page, limit, status),
    enabled,
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

/**
 * Get assigned orders (accepted by rider)
 */
export const useAssignedOrders = (
  page: number = 1,
  limit: number = 20,
  status?: 'ready' | 'out-for-delivery' | 'delivered',
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ordersKeys.assigned(page, limit, status),
    queryFn: () => ordersApi.getAssignedOrders(page, limit, status),
    enabled,
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

/**
 * Accept an order
 */
export const useAcceptOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => ordersApi.acceptOrder(orderId),
    onSuccess: () => {
      // Invalidate all eligible orders to remove accepted order
      queryClient.invalidateQueries({ 
        queryKey: ['orders', 'eligible'],
        exact: false 
      });
      // Invalidate all assigned orders to show newly accepted order
      queryClient.invalidateQueries({ 
        queryKey: ['orders', 'assigned'],
        exact: false 
      });
    },
  });
};

/**
 * Mark order as delivered
 */
export const useMarkOrderAsDelivered = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      orderId,
      data,
    }: {
      orderId: string;
      data?: MarkDeliveredRequest;
    }) => ordersApi.markOrderAsDelivered(orderId, data),
    onSuccess: () => {
      // Invalidate all assigned orders to update order status
      queryClient.invalidateQueries({ 
        queryKey: ['orders', 'assigned'],
        exact: false 
      });
    },
  });
};

/**
 * Pick up an order (change status from ready -> out-for-delivery)
 */
export const usePickUpOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => ordersApi.pickUpOrder(orderId),
    onSuccess: () => {
      // Invalidate all assigned orders to update order status
      queryClient.invalidateQueries({ 
        queryKey: ['orders', 'assigned'],
        exact: false 
      });
    },
  });
};

/**
 * Hook for registering WebSocket callbacks for orders.
 * The underlying socket is managed as a shared singleton.
 */
export const useOrdersWebSocket = (
  enabled: boolean = true,
  callbacks?: OrdersSocketCallbacks
) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled || !callbacks) {
      return;
    }

    // Enhanced callbacks with query invalidation
    const enhancedCallbacks: OrdersSocketCallbacks = {
      ...callbacks,
      onOrderReady: (data: OrderReadyEvent) => {
        // Invalidate all eligible orders queries to refresh list
        queryClient.invalidateQueries({ 
          queryKey: ['orders', 'eligible'],
          exact: false 
        });
        callbacks.onOrderReady?.(data);
      },
      onOrderPickedUp: (data: OrderPickedUpEvent) => {
        // Invalidate assigned orders to update status
        queryClient.invalidateQueries({ 
          queryKey: ['orders', 'assigned'],
          exact: false 
        });
        callbacks.onOrderPickedUp?.(data);
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

    // Register callbacks with shared socket
    const unregister = registerOrdersSocketCallbacks(enhancedCallbacks);

    // Ensure socket exists; if not, create it
    if (!isOrdersSocketConnected()) {
      createOrdersSocket().catch((error) => {
        console.error('Error creating orders WebSocket from hook:', error);
      });
    }

    // Cleanup: just unregister callbacks, do NOT disconnect socket
    return () => {
      unregister();
    };
  }, [enabled, queryClient, callbacks]);

  return {
    isConnected: isOrdersSocketConnected(),
  };
};
