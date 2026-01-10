import { useEffect, useRef } from 'react';
import { useUpdateLocation } from '../api/location/hooks';
import { useGetCurrentRiderProfile } from '../api/onboarding/hooks';
import { reverseGeocode } from '../services/geocoding-service';
import { locationService } from '../services/location-service';

/**
 * Hook to broadcast location once when the app opens
 * This runs regardless of online status to ensure the server knows the rider's location
 */
export function useInitialLocationBroadcast() {
  const updateLocationMutation = useUpdateLocation();
  const { data: riderProfile } = useGetCurrentRiderProfile(true);
  const hasBroadcastRef = useRef(false);

  useEffect(() => {
    // Only broadcast once per app session
    if (hasBroadcastRef.current) {
      return;
    }

    // Don't broadcast until we have the rider profile with regionId
    const regionId = riderProfile?.data?.regionId;
    if (!regionId) {
      return;
    }

    // Mark as started immediately to prevent multiple calls
    hasBroadcastRef.current = true;

    const broadcastLocation = async () => {
      try {
        // Request permissions first
        const hasPermission = await locationService.requestPermissions();
        if (!hasPermission) {
          console.warn('[Location Broadcast] Location permissions not granted');
          hasBroadcastRef.current = false; // Reset so it can retry
          return;
        }

        // Get current location
        console.log('[Location Broadcast] Getting current location...');
        const location = await locationService.getCurrentLocation();

        if (!location) {
          console.warn('[Location Broadcast] Failed to get current location');
          hasBroadcastRef.current = false; // Reset so it can retry
          return;
        }

        // Reverse geocode address
        console.log(`[Location Broadcast] Geocoding location: ${location.latitude}, ${location.longitude}`);
        const geocodedAddress = await reverseGeocode(
          location.latitude,
          location.longitude
        );

        if (!geocodedAddress) {
          console.warn(`[Location Broadcast] Failed to geocode address for coordinates: ${location.latitude}, ${location.longitude}`);
          hasBroadcastRef.current = false; // Reset so it can retry
          return;
        }

        // Broadcast location via REST API
        console.log('[Location Broadcast] Broadcasting location to server...');
        updateLocationMutation.mutate(
          {
            streetAddress: geocodedAddress.streetAddress,
            latitude: location.latitude,
            longitude: location.longitude,
            state: geocodedAddress.state || '',
            country: geocodedAddress.country || '',
            regionId: regionId,
          },
          {
            onSuccess: () => {
              console.log('[Location Broadcast] Location broadcasted successfully');
            },
            onError: (error) => {
              console.error('[Location Broadcast] Error broadcasting location:', error);
              hasBroadcastRef.current = false; // Reset on error so it can retry
            },
          }
        );
      } catch (error) {
        console.error('[Location Broadcast] Error in location broadcast:', error);
        hasBroadcastRef.current = false; // Reset on error so it can retry
      }
    };

    broadcastLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [riderProfile?.data?.regionId]); // regionId won't change, so this will only run once when it's first available
}
