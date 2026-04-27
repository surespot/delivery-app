import type { Order } from '@/src/api/orders/types';
import type { WalletBalanceResponse, WalletSummaryResponse, WalletTransactionsResponse, PaymentDetailsResponse } from '@/src/api/wallet/types';
import {
  DEMO_CUSTOMER_ID,
  DEMO_RIDER_ID,
  DEMO_PICKUP_NAMES,
  DEMO_STREET_NAMES,
} from './constants';

function offsetCoords(lat: number, lon: number, kmNorth: number, kmEast: number) {
  const latOffset = kmNorth / 111;
  const lonOffset = kmEast / (111 * Math.cos((lat * Math.PI) / 180));
  return { latitude: lat + latOffset, longitude: lon + lonOffset };
}

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

let orderCounter = 1;

export function generateDemoOrder(riderLat: number, riderLon: number): Order {
  const pickupOffsetKm = randomBetween(0.3, 1.5);
  const deliveryOffsetKm = randomBetween(1.5, 5);
  const pickupAngle = randomBetween(0, Math.PI * 2);
  const deliveryAngle = randomBetween(0, Math.PI * 2);

  const pickupCoords = offsetCoords(
    riderLat,
    riderLon,
    Math.sin(pickupAngle) * pickupOffsetKm,
    Math.cos(pickupAngle) * pickupOffsetKm
  );
  const deliveryCoords = offsetCoords(
    riderLat,
    riderLon,
    Math.sin(deliveryAngle) * deliveryOffsetKm,
    Math.cos(deliveryAngle) * deliveryOffsetKm
  );

  const feeKobo = Math.round(randomBetween(50000, 200000) / 100) * 100;
  const id = `demo-order-${Date.now()}-${orderCounter++}`;
  const pickupName = pick(DEMO_PICKUP_NAMES);
  const deliveryStreet = pick(DEMO_STREET_NAMES);

  return {
    id,
    orderNumber: `SS-DEMO-${String(orderCounter).padStart(4, '0')}`,
    userId: DEMO_CUSTOMER_ID,
    status: 'ready',
    deliveryType: 'door-delivery',
    items: [
      {
        id: `item-${id}`,
        foodItemId: `food-${id}`,
        name: 'Food Order',
        description: 'Demo food item',
        slug: 'demo-food',
        price: feeKobo * 3,
        formattedPrice: `₦${((feeKobo * 3) / 100).toLocaleString()}`,
        currency: 'NGN',
        quantity: 1,
        extras: [],
        lineTotal: feeKobo * 3,
      },
    ],
    subtotal: feeKobo * 3,
    extrasTotal: 0,
    deliveryFee: feeKobo,
    discountAmount: 0,
    total: feeKobo * 4,
    formattedTotal: `₦${((feeKobo * 4) / 100).toLocaleString()}`,
    itemCount: 1,
    extrasCount: 0,
    deliveryAddress: {
      address: deliveryStreet,
      coordinates: deliveryCoords,
      contactPhone: '+2349087654321',
    },
    pickupLocation: {
      id: `pickup-${id}`,
      name: pickupName,
      address: `${pickupName}, ${pick(DEMO_STREET_NAMES)}`,
      latitude: pickupCoords.latitude,
      longitude: pickupCoords.longitude,
    },
    paymentStatus: 'paid',
    paymentMethod: 'card',
    assignedRiderId: null,
    assignedAt: null,
    assignedBy: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export const DEMO_WALLET_BALANCE: WalletBalanceResponse = {
  success: true,
  message: 'Wallet balance retrieved',
  data: {
    walletBalance: 2450000,
    formattedBalance: '₦24,500.00',
    currency: 'NGN',
    isVerified: true,
  },
};

export const DEMO_WALLET_SUMMARY: WalletSummaryResponse = {
  success: true,
  message: 'Wallet summary retrieved',
  data: {
    totalEarnings: 8750000,
    formattedTotalEarnings: '₦87,500.00',
    totalWithdrawals: 6300000,
    formattedTotalWithdrawals: '₦63,000.00',
    availableBalance: 2450000,
    formattedAvailableBalance: '₦24,500.00',
    period: 'all-time',
  },
};

export const DEMO_WALLET_TRANSACTIONS: WalletTransactionsResponse = {
  success: true,
  message: 'Transactions retrieved',
  data: {
    transactions: [
      {
        id: 'demo-txn-1',
        type: 'earned',
        amount: 150000,
        formattedAmount: '₦1,500.00',
        status: 'completed',
        reference: 'EARN-DEMO-001',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        description: 'Delivery earnings — Order SS-DEMO-0003',
        orderId: 'demo-order-prev-3',
      },
      {
        id: 'demo-txn-2',
        type: 'earned',
        amount: 120000,
        formattedAmount: '₦1,200.00',
        status: 'completed',
        reference: 'EARN-DEMO-002',
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        description: 'Delivery earnings — Order SS-DEMO-0002',
        orderId: 'demo-order-prev-2',
      },
      {
        id: 'demo-txn-3',
        type: 'withdrew',
        amount: 500000,
        formattedAmount: '₦5,000.00',
        status: 'completed',
        reference: 'WTH-DEMO-001',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        description: 'Withdrawal to GTBank ••••1234',
      },
      {
        id: 'demo-txn-4',
        type: 'earned',
        amount: 180000,
        formattedAmount: '₦1,800.00',
        status: 'completed',
        reference: 'EARN-DEMO-003',
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        description: 'Delivery earnings — Order SS-DEMO-0001',
        orderId: 'demo-order-prev-1',
      },
    ],
    pagination: {
      page: 1,
      limit: 20,
      total: 4,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    },
  },
};

export const DEMO_PAYMENT_DETAILS: PaymentDetailsResponse = {
  success: true,
  message: 'Payment details retrieved',
  data: {
    recipientCode: 'RCP_demo123456',
    accountNumber: '0123456789',
    bankCode: '058',
    bankName: 'GTBank',
    accountName: 'Demo Rider',
    isVerified: true,
  },
};
