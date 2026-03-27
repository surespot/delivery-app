import { useAddPushToken } from '@/src/api/notifications';
import * as Notifications from 'expo-notifications';
import { useEffect, useRef } from 'react';

/**
 * Registers the Expo push token with the backend when the user is authenticated.
 * Call this from components that mount when the user is logged in (e.g. Home layout).
 * Safe to call multiple times; re-registering the same token is idempotent.
 */
export function useRegisterPushToken(isAuthenticated: boolean) {
  const addPushToken = useAddPushToken();
  const lastRegisteredToken = useRef<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    let cancelled = false;

    async function register() {
      try {
        const { status: existingStatus } =
          await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== 'granted') {
          return;
        }

        const tokenResult = await Notifications.getExpoPushTokenAsync();

        const token =
          typeof tokenResult === 'string'
            ? tokenResult
            : tokenResult?.data;
        if (!token || cancelled) {
          return;
        }

        if (lastRegisteredToken.current === token) {
          return;
        }

        await addPushToken.mutateAsync(token);
        lastRegisteredToken.current = token;
      } catch (error) {
        if (__DEV__) {
          console.warn('Push token registration failed:', error);
        }
      }
    }

    register();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, addPushToken]);
}
