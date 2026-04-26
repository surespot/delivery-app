import * as Location from 'expo-location';
import { Platform } from 'react-native';
import { BACKGROUND_LOCATION_TASK } from '../tasks/location-task';

export interface RiderLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  heading?: number;
  speed?: number;
  timestamp: number;
}

const LOCATION_UPDATE_INTERVAL = 5 * 60 * 1000; // 5 minutes

class LocationService {
  /**
   * Request foreground + background location permissions.
   * Called before starting the tracking service.
   */
  async requestPermissions(): Promise<boolean> {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return false;

    if (Platform.OS !== 'web') {
      const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();
      return bgStatus === 'granted';
    }

    return true;
  }

  /**
   * One-shot current position. Used by useInitialLocationBroadcast.
   */
  async getCurrentLocation(): Promise<RiderLocation | null> {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 5000,
        distanceInterval: 10,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || undefined,
        heading: location.coords.heading || undefined,
        speed: location.coords.speed || undefined,
        timestamp: location.timestamp,
      };
    } catch {
      return null;
    }
  }

  /**
   * Start the background location service via TaskManager.
   *
   * On Android this creates a persistent foreground-service notification
   * satisfying the FOREGROUND_SERVICE_LOCATION requirement.
   * On iOS this runs silently using the UIBackgroundModes: ["location"] entitlement.
   *
   * All location callbacks are handled inside the TaskManager task defined in
   * src/tasks/location-task.ts — this method just starts the OS service.
   */
  async startLocationTracking(): Promise<void> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) throw new Error('Location permissions not granted');

    const alreadyRunning = await Location.hasStartedLocationUpdatesAsync(
      BACKGROUND_LOCATION_TASK
    ).catch(() => false);

    if (alreadyRunning) return;

    await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
      accuracy: Location.Accuracy.BestForNavigation,
      timeInterval: LOCATION_UPDATE_INTERVAL,
      distanceInterval: 50,
      foregroundService: {
        notificationTitle: 'Surespot Riders',
        notificationBody: 'Tracking your location for active deliveries.',
        notificationColor: '#2DBE7E',
      },
      pausesUpdatesAutomatically: false,
    });
  }

  /**
   * Stop the background location service.
   * Safe to call even if the service is not running.
   */
  async stopLocationTracking(): Promise<void> {
    const isRunning = await Location.hasStartedLocationUpdatesAsync(
      BACKGROUND_LOCATION_TASK
    ).catch(() => false);

    if (isRunning) {
      await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
    }
  }
}

export const locationService = new LocationService();
