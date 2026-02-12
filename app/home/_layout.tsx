import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useInitialLocationBroadcast } from '@/src/hooks/use-initial-location-broadcast';
import { useAuthStore } from '@/store/auth-store';
import { createOrdersSocket, disconnectOrdersSocket } from '@/src/api/orders/websocket';

export default function HomeLayout() {
  const { isAuthenticated, isOnline } = useAuthStore();

  // Broadcast location when app opens
  useInitialLocationBroadcast();

  // Manage a single shared orders WebSocket connection for the home stack
  useEffect(() => {
    if (!isAuthenticated || !isOnline) {
      // Disconnect when user logs out or goes offline
      disconnectOrdersSocket();
      return;
    }

    // Ensure socket is created/connected
    createOrdersSocket().catch((error) => {
      console.error('Error creating orders WebSocket from HomeLayout:', error);
    });

    // Don't disconnect on unmount here; this layout persists for the home stack.
  }, [isAuthenticated, isOnline]);

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="available-orders"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="orders"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="wallet"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="profile"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="account-information"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="settings"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="login-settings"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="language-settings"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="support-legal"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="faq"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="contact-support"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="report-issue"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="support-account-verification"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="support-delivery-problems"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="support-earnings-payouts"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="support-recents"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="delivery-details"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}

