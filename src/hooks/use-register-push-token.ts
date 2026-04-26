import { useAddPushToken } from '@/src/api/notifications';
import { useAuthStore } from '@/store/auth-store';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

export function useRegisterPushToken(isAuthenticated: boolean) {
  const addPushToken = useAddPushToken();
  const setPushToken = useAuthStore((s) => s.setPushToken);
  const lastRegisteredToken = useRef<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;

    async function register() {
      try {
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'Default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FFD700',
          });
        }

        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== 'granted') return;

        const projectId = Constants.expoConfig?.extra?.eas?.projectId as string | undefined;
        const tokenResult = await Notifications.getExpoPushTokenAsync(
          projectId ? { projectId } : undefined
        );

        const token = typeof tokenResult === 'string' ? tokenResult : tokenResult?.data;
        if (!token || cancelled) return;

        if (lastRegisteredToken.current === token) return;

        await addPushToken.mutateAsync(token);
        setPushToken(token);
        lastRegisteredToken.current = token;
      } catch {
        // Silently ignore push token registration failures
      }
    }

    register();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);
}
