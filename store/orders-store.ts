import { create } from 'zustand';

export interface Order {
  id: string;
  pickupAddress: string;
  deliveryAddress: string;
  price: string;
  time: string;
  distance: string;
  timestamp?: string;
}

interface OrdersState {
  currentOrders: Order[];
  availableOrders: Order[];
  completedOrders: Order[];
  addCurrentOrder: (order: Order) => void;
  removeCurrentOrder: (orderId: string) => void;
  removeAvailableOrder: (orderId: string) => void;
  markAsDelivered: (orderId: string) => void;
}

export const useOrdersStore = create<OrdersState>((set) => ({
  currentOrders: [
    {
      id: '1',
      pickupAddress: '1 Iba Rd, Ojo, Lagos',
      deliveryAddress: "12 Crown's Rd, Ojo",
      price: '₦700',
      time: '12min ago',
      distance: '15.2 KM',
    },
    {
      id: '2',
      pickupAddress: '5 Airport Rd, Ikeja, Lagos',
      deliveryAddress: '22 Victoria Island, Lagos',
      price: '₦950',
      time: '8min ago',
      distance: '22.5 KM',
    },
    {
      id: '3',
      pickupAddress: '10 Allen Ave, Ikeja, Lagos',
      deliveryAddress: '15 Lekki Phase 1, Lagos',
      price: '₦850',
      time: '5min ago',
      distance: '18.3 KM',
    },
  ],
  availableOrders: [
    {
      id: '4',
      pickupAddress: '1 Iba Rd, Ojo, Lagos',
      deliveryAddress: '15 Abijan Rd, Ojo, Lagos',
      price: '₦700',
      time: '3:45 PM',
      distance: '15.2 KM',
    },
    {
      id: '5',
      pickupAddress: '5 Airport Rd, Ikeja, Lagos',
      deliveryAddress: '22 Victoria Island, Lagos',
      price: '₦950',
      time: '4:20 PM',
      distance: '22.5 KM',
    },
    {
      id: '6',
      pickupAddress: '8 Awolowo Rd, Ikoyi, Lagos',
      deliveryAddress: '12 Marina, Lagos Island',
      price: '₦1200',
      time: '4:30 PM',
      distance: '8.5 KM',
    },
    {
      id: '7',
      pickupAddress: '15 Surulere Way, Surulere, Lagos',
      deliveryAddress: '30 Yaba Main St, Yaba, Lagos',
      price: '₦650',
      time: '4:45 PM',
      distance: '12.3 KM',
    },
    {
      id: '8',
      pickupAddress: '22 Lekki Expressway, Lekki, Lagos',
      deliveryAddress: '5 Ajah Market, Ajah, Lagos',
      price: '₦850',
      time: '5:00 PM',
      distance: '18.7 KM',
    },
    {
      id: '9',
      pickupAddress: '10 Oshodi Rd, Oshodi, Lagos',
      deliveryAddress: '18 Mushin Market, Mushin, Lagos',
      price: '₦550',
      time: '5:15 PM',
      distance: '9.8 KM',
    },
    {
      id: '10',
      pickupAddress: '25 Agege Motor Rd, Agege, Lagos',
      deliveryAddress: '7 Ikeja City Mall, Ikeja, Lagos',
      price: '₦1100',
      time: '5:30 PM',
      distance: '14.2 KM',
    },
  ],
  addCurrentOrder: (order) =>
    set((state) => {
      if (state.currentOrders.length >= 3) {
        return state; // Max 3 orders
      }
      return {
        currentOrders: [...state.currentOrders, order],
        availableOrders: state.availableOrders.filter((o) => o.id !== order.id),
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
  completedOrders: [
    {
      id: '11',
      pickupAddress: '1 Iba Rd, Ojo, Lagos',
      deliveryAddress: '15 Abijan Rd, Ojo, Lagos',
      price: '₦700',
      time: '3:45 PM',
      distance: '15.2 KM',
    },
    {
      id: '12',
      pickupAddress: '5 Airport Rd, Ikeja, Lagos',
      deliveryAddress: '22 Victoria Island, Lagos',
      price: '₦950',
      time: '4:20 PM',
      distance: '22.5 KM',
    },
  ],
  markAsDelivered: (orderId) =>
    set((state) => {
      const order = state.currentOrders.find((o) => o.id === orderId);
      if (order) {
        return {
          currentOrders: state.currentOrders.filter((o) => o.id !== orderId),
          completedOrders: [...state.completedOrders, order],
        };
      }
      return state;
    }),
}));

