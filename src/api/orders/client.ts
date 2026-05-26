import { apiRequest } from '../onboarding/client';
import type {
    AcceptOrderRequest,
    AcceptOrderResponse,
    AssignedOrdersResponse,
    DropOrderResponse,
    EligibleOrdersResponse,
    MarkDeliveredRequest,
    MarkDeliveredResponse,
    PickUpOrderResponse,
} from './types';

export const ordersApi = {
  /**
   * Get eligible orders (available for acceptance)
   * GET /orders/rider/eligible
   */
  getEligibleOrders: (
    page: number = 1,
    limit: number = 20,
    status: 'ready' = 'ready'
  ): Promise<EligibleOrdersResponse> => {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      status,
    });
    return apiRequest<EligibleOrdersResponse['data']>(
      `/orders/rider/eligible?${queryParams.toString()}`,
      {
        method: 'GET',
        requiresAuth: true,
      }
    ) as Promise<EligibleOrdersResponse>;
  },

  /**
   * Accept an order
   * POST /orders/rider/accept
   *
   * Logs both the request payload and the full response for debugging.
   */
  acceptOrder: async (orderId: string): Promise<AcceptOrderResponse> => {
    const payload = { orderId } as AcceptOrderRequest;
    return (await apiRequest<AcceptOrderResponse['data']>(
      '/orders/rider/accept',
      {
        method: 'POST',
        body: payload,
        requiresAuth: true,
      }
    )) as AcceptOrderResponse;
  },

  /**
   * Get assigned orders (accepted by rider)
   * GET /orders/rider/assigned
   */
  getAssignedOrders: (
    page: number = 1,
    limit: number = 20,
    status?: 'ready' | 'out-for-delivery' | 'delivered'
  ): Promise<AssignedOrdersResponse> => {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (status) {
      queryParams.append('status', status);
    }
    return apiRequest<AssignedOrdersResponse['data']>(
      `/orders/rider/assigned?${queryParams.toString()}`,
      {
        method: 'GET',
        requiresAuth: true,
      }
    ) as Promise<AssignedOrdersResponse>;
  },

  /**
   * Mark order as delivered
   * POST /orders/rider/:orderId/delivered
   */
  markOrderAsDelivered: async (
    orderId: string,
    data?: MarkDeliveredRequest
  ): Promise<MarkDeliveredResponse> => {
    const payload = data || {};
    return (await apiRequest<MarkDeliveredResponse['data']>(
      `/orders/rider/${orderId}/delivered`,
      {
        method: 'POST',
        body: payload,
        requiresAuth: true,
      }
    )) as unknown as MarkDeliveredResponse;
  },

  /**
   * Pick up order
   * POST /orders/rider/:orderId/picked-up
   */
  pickUpOrder: (orderId: string): Promise<PickUpOrderResponse> => {
    return apiRequest<PickUpOrderResponse['data']>(
      `/orders/rider/${orderId}/picked-up`,
      {
        method: 'POST',
        requiresAuth: true,
      }
    ) as Promise<PickUpOrderResponse>;
  },

  /**
   * Drop an accepted order before pickup
   * POST /orders/rider/:orderId/drop
   */
  dropOrder: (orderId: string): Promise<DropOrderResponse> => {
    return apiRequest<DropOrderResponse['data']>(
      `/orders/rider/${orderId}/drop`,
      {
        method: 'POST',
        requiresAuth: true,
      }
    ) as Promise<DropOrderResponse>;
  },
};
