import { useAuthStore } from '@/store/auth-store';
import { useEffect, useRef } from 'react';
import { useUpdateLocation } from '../api/location/hooks';
import { useGetCurrentRiderProfile } from '../api/onboarding/hooks';
import { reverseGeocode } from '../services/geocoding-service';
import { locationService } from '../services/location-service';

const LOCATION_UPDATE_INTERVAL = 5 * 60 * 1000; // 5 minutes

export function useRiderLocationTracking() {
  const { isOnline } = useAuthStore();
  const updateLocationMutation = useUpdateLocation();
  const { data: riderProfile } = useGetCurrentRiderProfile(isOnline);
  const isTrackingRef = useRef(false);
  const lastUpdateTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!isOnline) {
      // Stop tracking when offline
      if (isTrackingRef.current) {
        locationService.stopLocationTracking();
        isTrackingRef.current = false;
        lastUpdateTimeRef.current = 0;
      }
      return;
    }

    // Don't start tracking until we have the rider profile with regionId
    const regionId = riderProfile?.data?.regionId;
    if (!regionId) {
      return;
    }

    // Prevent starting tracking multiple times
    if (isTrackingRef.current) {
      return; // Already tracking, don't restart
    }

    // Start tracking when online
    const startTracking = async () => {
      try {
        // Mark as tracking immediately to prevent multiple starts
        isTrackingRef.current = true;
        
        // Start location tracking - this will call onLocationUpdate every 5 minutes
        await locationService.startLocationTracking(
          async (location) => {
            const now = Date.now();
            // Ensure we don't update more frequently than every 5 minutes
            if (now - lastUpdateTimeRef.current < LOCATION_UPDATE_INTERVAL) {
              return;
            }

            try {
              // Reverse geocode address
              console.log(`[Location] Processing location update: ${location.latitude}, ${location.longitude}`);
              const geocodedAddress = await reverseGeocode(
                location.latitude,
                location.longitude
              );

              if (!geocodedAddress) {
                console.warn(`[Location] Failed to geocode address for coordinates: ${location.latitude}, ${location.longitude}`);
                return;
              }

              // Update location via REST API
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
                    lastUpdateTimeRef.current = now;
                    console.log(`[Location] Location updated successfully at ${new Date(now).toISOString()}`);
                  },
                  onError: (error) => {
                    console.error('Error updating location:', error);
                  },
                }
              );
            } catch (error) {
              console.error('Error processing location update:', error);
            }
          },
          LOCATION_UPDATE_INTERVAL
        );

      } catch (error) {
        console.error('Error starting location tracking:', error);
        isTrackingRef.current = false; // Reset on error so it can retry
      }
    };

    startTracking();

    // Only cleanup when going offline or component unmounts
    return () => {
      // Don't stop tracking on every render - only when actually going offline or unmounting
      // The isOnline check above handles stopping when offline
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline, riderProfile?.data?.regionId]); // regionId won't change, so this will only run when going online/offline or when regionId first becomes available

  return {
    isTracking: isTrackingRef.current,
  };
}
