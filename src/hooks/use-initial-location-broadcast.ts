import { useAuthStore } from '@/store/auth-store';
import { useEffect, useRef } from 'react';
import { useUpdateLocation } from '../api/location/hooks';
import { useGetCurrentRiderProfile } from '../api/onboarding/hooks';
import { locationService } from '../services/location-service';

/**
 * Hook to broadcast location once when the app opens.
 * Runs regardless of online status so the server always has a fresh position.
 * Geocode fields are omitted — the backend treats them as optional.
 */
export function useInitialLocationBroadcast() {
  const { isDemoMode } = useAuthStore();
  const updateLocationMutation = useUpdateLocation();
  const { data: riderProfile } = useGetCurrentRiderProfile(!isDemoMode);
  const hasBroadcastRef = useRef(false);

  useEffect(() => {
    if (isDemoMode) return;
    // Only broadcast once per app session
    if (hasBroadcastRef.current) {
      return;
    }

    // Don't broadcast until we have the rider profile with regionId
    const regionId = riderProfile?.data?.regionId;
    if (!regionId) {
      return;
    }

    // Mark as started immediately to prevent concurrent calls
    hasBroadcastRef.current = true;

    const broadcastLocation = async () => {
      try {
        const hasPermission = await locationService.requestPermissions();
        if (!hasPermission) {
          hasBroadcastRef.current = false;
          return;
        }

        const location = await locationService.getCurrentLocation();
        if (!location) {
          hasBroadcastRef.current = false;
          return;
        }

        updateLocationMutation.mutate(
          {
            latitude: location.latitude,
            longitude: location.longitude,
            regionId,
          },
          {
            onError: () => {
              hasBroadcastRef.current = false;
            },
          }
        );
      } catch {
        hasBroadcastRef.current = false;
      }
    };

    broadcastLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [riderProfile?.data?.regionId]);
}
