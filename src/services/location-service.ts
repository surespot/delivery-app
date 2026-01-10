import * as Location from 'expo-location';
import { Platform } from 'react-native';

export interface RiderLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  heading?: number;
  speed?: number;
  timestamp: number;
  address?: string; // Reverse geocoded address
}

class LocationService {
  private watchSubscription: Location.LocationSubscription | null = null;
  private updateInterval: NodeJS.Timeout | null = null;
  private lastLocation: RiderLocation | null = null;
  private isTracking = false;

  /**
   * Request location permissions
   */
  async requestPermissions(): Promise<boolean> {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return false;
    }

    // For background location (when app is in background)
    if (Platform.OS !== 'web') {
      const backgroundStatus = await Location.requestBackgroundPermissionsAsync();
      return backgroundStatus.status === 'granted';
    }

    return true;
  }

  /**
   * Get current location with high accuracy
   */
  async getCurrentLocation(): Promise<RiderLocation | null> {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation, // Highest accuracy
        timeInterval: 5000,
        distanceInterval: 10, // Update if moved 10 meters
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || undefined,
        heading: location.coords.heading || undefined,
        speed: location.coords.speed || undefined,
        timestamp: location.timestamp,
      };
    } catch (error) {
      console.error('Error getting location:', error);
      return null;
    }
  }

  /**
   * Start watching location changes
   */
  async startLocationTracking(
    onLocationUpdate: (location: RiderLocation) => void,
    updateIntervalMs: number = 5 * 60 * 1000 // 5 minutes default
  ) {
    if (this.isTracking) {
      return;
    }

    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      throw new Error('Location permissions not granted');
    }

    this.isTracking = true;

    // Watch for location changes
    this.watchSubscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: updateIntervalMs,
        distanceInterval: 50, // Update if moved 50 meters
        mayShowUserSettingsDialog: true,
      },
      async (location) => {
        const riderLocation: RiderLocation = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracy: location.coords.accuracy || undefined,
          heading: location.coords.heading || undefined,
          speed: location.coords.speed || undefined,
          timestamp: location.timestamp,
        };

        // Only update if location has changed significantly
        if (this.shouldUpdateLocation(riderLocation)) {
          this.lastLocation = riderLocation;
          onLocationUpdate(riderLocation);
        }
      }
    );
  }

  /**
   * Check if location has changed significantly
   */
  private shouldUpdateLocation(newLocation: RiderLocation): boolean {
    if (!this.lastLocation) return true;

    // Update if moved more than 50 meters
    const distance = this.calculateDistance(
      this.lastLocation.latitude,
      this.lastLocation.longitude,
      newLocation.latitude,
      newLocation.longitude
    );

    return distance > 50; // 50 meters threshold
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371e3; // Earth radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  /**
   * Stop location tracking
   */
  stopLocationTracking() {
    if (this.watchSubscription) {
      this.watchSubscription.remove();
      this.watchSubscription = null;
    }

    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }

    this.isTracking = false;
    this.lastLocation = null;
  }

  /**
   * Check if currently tracking
   */
  getIsTracking(): boolean {
    return this.isTracking;
  }
}

export const locationService = new LocationService();
