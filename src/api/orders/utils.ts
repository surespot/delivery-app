import type { Order } from './types';

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

/**
 * Format price from kobo to Naira display
 */
export function formatPrice(amountInKobo: number): string {
  const naira = amountInKobo / 100;
  return `₦${naira.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Format timestamp to relative time (e.g., "12min ago", "2 hours ago")
 */
export function formatOrderTime(timestamp: string): string {
  const now = new Date();
  const orderTime = new Date(timestamp);
  const diffMs = now.getTime() - orderTime.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) {
    return 'Just now';
  } else if (diffMins < 60) {
    return `${diffMins}min ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else {
    // Format as date
    return orderTime.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: orderTime.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  }
}

/**
 * Transform API order to UI display format
 * Maps API order structure to the format expected by UI components
 */
export function transformOrderForUI(order: Order) {
  // Calculate distance from pickup to delivery (if we had rider location)
  // For now, we'll use a placeholder or calculate if coordinates are available
  const distance = order.pickupLocation && order.deliveryAddress?.coordinates
    ? `${calculateDistance(
        order.pickupLocation.latitude,
        order.pickupLocation.longitude,
        order.deliveryAddress.coordinates.latitude,
        order.deliveryAddress.coordinates.longitude
      )} KM`
    : 'N/A';

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    pickupAddress: order.pickupLocation.address,
    deliveryAddress: order.deliveryAddress.address,
    price: formatPrice(order.deliveryFee), // Show delivery fee instead of total
    time: formatOrderTime(order.createdAt),
    distance,
    timestamp: order.createdAt,
    // Include full order data for detailed views
    fullOrder: order,
  };
}

/**
 * Get user-friendly error message from error code
 */
export function getErrorMessage(errorCode: string): string {
  const errorMessages: Record<string, string> = {
    RIDER_PROFILE_NOT_FOUND: 'Rider profile not found. Please complete your registration.',
    RIDER_NOT_ACTIVE: 'Your rider account is not active. Please contact support.',
    ORDER_NOT_FOUND: 'Order not found.',
    ORDER_ALREADY_ASSIGNED: 'This order has already been assigned to another rider.',
    ORDER_NOT_READY: 'Order is not ready for assignment.',
    INVALID_ORDER_TYPE: 'Only door delivery orders can be assigned to riders.',
    FORBIDDEN: 'You do not have permission to perform this action.',
    MAX_ORDERS_REACHED: 'You cannot accept more than 3 orders at once. Please deliver some orders first.',
    INVALID_ORDER_STATUS: 'Order status is invalid for this operation.',
    ORDER_NOT_ASSIGNED: 'This order is not assigned to any rider.',
    ORDER_NOT_ASSIGNED_TO_RIDER: 'This order is not assigned to you.',
    CONFIRMATION_CODE_MISSING: 'Delivery confirmation code not found. Please contact support.',
    INVALID_CONFIRMATION_CODE: 'Invalid confirmation code. Please verify with the customer.',
  };

  return errorMessages[errorCode] || 'An error occurred. Please try again.';
}
