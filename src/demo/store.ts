import type { Order } from '@/src/api/orders/types';
import { calculateDistance } from '@/src/api/orders/utils';
import { create } from 'zustand';
import { BOT_REPLIES, DEMO_CUSTOMER_ID, DEMO_RIDER_ID } from './constants';
import { generateDemoOrder } from './data';

export interface DemoMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  sender: { _id: string; firstName: string; lastName: string };
  createdAt: string;
}

interface DemoState {
  isActive: boolean;
  riderLat: number;
  riderLon: number;
  sessionStartMs: number;
  availableOrders: Order[];
  currentOrders: Order[];
  chatMessages: Record<string, DemoMessage[]>;
  completedOrdersCount: number;
  totalEarningsKobo: number;
  totalDistanceKm: number;

  activate: (lat: number, lon: number) => void;
  deactivate: () => void;
  addAvailableOrder: () => void;
  acceptOrder: (orderId: string) => void;
  advanceToOutForDelivery: (orderId: string) => void;
  completeOrder: (orderId: string) => void;
  addChatMessage: (orderId: string, content: string, fromCustomer: boolean) => void;
  scheduleBotReply: (orderId: string) => void;
}

export const useDemoStore = create<DemoState>((set, get) => ({
  isActive: false,
  riderLat: 0,
  riderLon: 0,
  sessionStartMs: 0,
  availableOrders: [],
  currentOrders: [],
  chatMessages: {},
  completedOrdersCount: 0,
  totalEarningsKobo: 0,
  totalDistanceKm: 0,

  activate: (lat, lon) => {
    const orders = [
      generateDemoOrder(lat, lon),
      generateDemoOrder(lat, lon),
      generateDemoOrder(lat, lon),
    ];
    set({
      isActive: true,
      riderLat: lat,
      riderLon: lon,
      sessionStartMs: Date.now(),
      availableOrders: orders,
      currentOrders: [],
      chatMessages: {},
      completedOrdersCount: 0,
      totalEarningsKobo: 0,
      totalDistanceKm: 0,
    });
  },

  deactivate: () => {
    set({ isActive: false, availableOrders: [], currentOrders: [], chatMessages: {}, completedOrdersCount: 0, totalEarningsKobo: 0, totalDistanceKm: 0 });
  },

  addAvailableOrder: () => {
    const { riderLat, riderLon, availableOrders } = get();
    const newOrder = generateDemoOrder(riderLat, riderLon);
    set({ availableOrders: [...availableOrders, newOrder] });
  },

  acceptOrder: (orderId) => {
    const { availableOrders, currentOrders } = get();
    const order = availableOrders.find((o) => o.id === orderId);
    if (!order) return;
    const accepted: Order = { ...order, status: 'ready', assignedRiderId: DEMO_RIDER_ID, assignedAt: new Date().toISOString() };
    set({
      availableOrders: availableOrders.filter((o) => o.id !== orderId),
      currentOrders: [...currentOrders, accepted],
    });
    // Auto-advance to out-for-delivery after 8 seconds (simulates admin pickup confirmation)
    setTimeout(() => {
      get().advanceToOutForDelivery(orderId);
    }, 8000);
  },

  advanceToOutForDelivery: (orderId) => {
    const { currentOrders } = get();
    set({
      currentOrders: currentOrders.map((o) =>
        o.id === orderId ? { ...o, status: 'out-for-delivery' } : o
      ),
    });
  },

  completeOrder: (orderId) => {
    const { currentOrders, completedOrdersCount, totalEarningsKobo, totalDistanceKm } = get();
    const order = currentOrders.find((o) => o.id === orderId);
    const distanceKm = order
      ? calculateDistance(
          order.pickupLocation.latitude,
          order.pickupLocation.longitude,
          order.deliveryAddress.coordinates.latitude,
          order.deliveryAddress.coordinates.longitude
        )
      : 0;
    set({
      currentOrders: currentOrders.filter((o) => o.id !== orderId),
      completedOrdersCount: completedOrdersCount + 1,
      totalEarningsKobo: totalEarningsKobo + (order?.deliveryFee ?? 0),
      totalDistanceKm: Math.round((totalDistanceKm + distanceKm) * 10) / 10,
    });
  },

  addChatMessage: (orderId, content, fromCustomer) => {
    const { chatMessages } = get();
    const existing = chatMessages[orderId] ?? [];
    const msg: DemoMessage = {
      id: `demo-msg-${Date.now()}-${Math.random()}`,
      conversationId: `demo-conv-${orderId}`,
      senderId: fromCustomer ? DEMO_CUSTOMER_ID : DEMO_RIDER_ID,
      content,
      sender: fromCustomer
        ? { _id: DEMO_CUSTOMER_ID, firstName: 'Customer', lastName: '' }
        : { _id: DEMO_RIDER_ID, firstName: 'You', lastName: '' },
      createdAt: new Date().toISOString(),
    };
    set({ chatMessages: { ...chatMessages, [orderId]: [...existing, msg] } });
  },

  scheduleBotReply: (orderId) => {
    const delay = Math.floor(Math.random() * 3000) + 1500;
    setTimeout(() => {
      const reply = BOT_REPLIES[Math.floor(Math.random() * BOT_REPLIES.length)];
      get().addChatMessage(orderId, reply, true);
    }, delay);
  },
}));
