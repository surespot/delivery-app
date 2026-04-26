import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { locationApi } from '../api/location';

// ─── Constants ────────────────────────────────────────────────────────────────

export const BACKGROUND_LOCATION_TASK = 'background-location-task';

const REGION_ID_KEY = 'rider_region_id';

/** Tracking is allowed between 07:00 and 21:00 device-local time. */
const TRACKING_START_HOUR = 7;
const TRACKING_END_HOUR = 21;

// ─── AsyncStorage helpers ─────────────────────────────────────────────────────

/** Persist the rider's regionId so the background task can read it. */
export const saveRegionId = async (regionId: string): Promise<void> => {
  await AsyncStorage.setItem(REGION_ID_KEY, regionId);
};

/** Remove regionId on logout. */
export const clearRegionId = async (): Promise<void> => {
  await AsyncStorage.removeItem(REGION_ID_KEY);
};

// ─── Time-window helpers ──────────────────────────────────────────────────────

/** Returns true if the current device-local hour is within the tracking window. */
export const isWithinTrackingHours = (): boolean => {
  const hour = new Date().getHours();
  return hour >= TRACKING_START_HOUR && hour < TRACKING_END_HOUR;
};

/**
 * Returns milliseconds from now until the next occurrence of targetHour:00:00.
 * If that time has already passed today, returns ms until tomorrow.
 */
export const msUntilHour = (targetHour: number): number => {
  const now = new Date();
  const target = new Date();
  target.setHours(targetHour, 0, 0, 0);
  if (target.getTime() <= now.getTime()) {
    target.setDate(target.getDate() + 1);
  }
  return target.getTime() - now.getTime();
};

// ─── Background task ──────────────────────────────────────────────────────────

interface LocationTaskData {
  locations: Location.LocationObject[];
}

/**
 * This task is triggered by the OS on every significant location change
 * (min interval: 5 min, min distance: 50 m).
 *
 * It is defined here at module level so it is always registered before any
 * navigation or component mounts. The root layout imports this file as a
 * side-effect to guarantee that.
 */
TaskManager.defineTask(
  BACKGROUND_LOCATION_TASK,
  async ({ data, error }: TaskManager.TaskManagerTaskBody<LocationTaskData>) => {
    if (error) return;

    // Outside the 07:00–21:00 window — shut the service down from here.
    // This handles the case where the app is backgrounded past 9 pm.
    if (!isWithinTrackingHours()) {
      await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK).catch(() => {});
      return;
    }

    const locations = (data as LocationTaskData)?.locations;
    if (!locations?.length) return;

    const regionId = await AsyncStorage.getItem(REGION_ID_KEY);
    if (!regionId) return;

    const { coords } = locations[0];

    try {
      await locationApi.updateLocation({
        latitude: coords.latitude,
        longitude: coords.longitude,
        regionId,
      });
    } catch {
      // Silent failure — will retry on the next location event.
    }
  }
);
