import { useAuthStore } from '@/store/auth-store';
import { useEffect, useRef } from 'react';
import { useGetCurrentRiderProfile } from '../api/onboarding/hooks';
import {
  isWithinTrackingHours,
  msUntilHour,
  saveRegionId,
} from '../tasks/location-task';
import { locationService } from '../services/location-service';

const TRACKING_START_HOUR = 7;
const TRACKING_END_HOUR = 21;

export function useRiderLocationTracking() {
  const { isOnline } = useAuthStore();
  const { data: riderProfile } = useGetCurrentRiderProfile(isOnline);
  const isTrackingRef = useRef(false);
  const stopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Persist regionId to AsyncStorage whenever the profile loads so the
  // background task (which has no React context) can read it directly.
  useEffect(() => {
    const regionId = riderProfile?.data?.regionId;
    if (regionId) {
      saveRegionId(regionId);
    }
  }, [riderProfile?.data?.regionId]);

  useEffect(() => {
    // Always clear any pending timers at the top of every run so stale
    // timers from a previous dep-change don't fire unexpectedly.
    if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
    if (startTimerRef.current) clearTimeout(startTimerRef.current);

    // Shared cleanup — returned from every code path.
    const cleanup = () => {
      if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
      if (startTimerRef.current) clearTimeout(startTimerRef.current);
      if (isTrackingRef.current) {
        locationService.stopLocationTracking().catch(() => {});
        isTrackingRef.current = false;
      }
    };

    if (!isOnline) {
      if (isTrackingRef.current) {
        locationService.stopLocationTracking().catch(() => {});
        isTrackingRef.current = false;
      }
      return cleanup;
    }

    const regionId = riderProfile?.data?.regionId;
    if (!regionId) return cleanup;

    // ── Helpers ─────────────────────────────────────────────────────────────

    const startTracking = async () => {
      if (isTrackingRef.current) return;
      try {
        isTrackingRef.current = true;
        await locationService.startLocationTracking();
      } catch {
        isTrackingRef.current = false;
      }
    };

    /**
     * Stop tracking and schedule an automatic restart at 7 am.
     * Uses Zustand's static getState() to read isOnline at timer-fire time,
     * avoiding stale closure issues.
     */
    const stopAndScheduleRestart = () => {
      locationService.stopLocationTracking().catch(() => {});
      isTrackingRef.current = false;

      startTimerRef.current = setTimeout(() => {
        const { isOnline: stillOnline } = useAuthStore.getState();
        if (!stillOnline) return;

        startTracking();

        // Schedule the next 9 pm stop after the 7 am restart.
        stopTimerRef.current = setTimeout(
          stopAndScheduleRestart,
          msUntilHour(TRACKING_END_HOUR)
        );
      }, msUntilHour(TRACKING_START_HOUR));
    };

    // ── Time-window gate ─────────────────────────────────────────────────────

    if (!isWithinTrackingHours()) {
      // Outside 07:00–21:00 — don't start yet; wait for 7 am.
      startTimerRef.current = setTimeout(() => {
        const { isOnline: stillOnline } = useAuthStore.getState();
        if (!stillOnline) return;

        startTracking();
        stopTimerRef.current = setTimeout(
          stopAndScheduleRestart,
          msUntilHour(TRACKING_END_HOUR)
        );
      }, msUntilHour(TRACKING_START_HOUR));

      return cleanup;
    }

    // Within 07:00–21:00 — start immediately and schedule the 9 pm stop.
    startTracking();
    stopTimerRef.current = setTimeout(
      stopAndScheduleRestart,
      msUntilHour(TRACKING_END_HOUR)
    );

    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline, riderProfile?.data?.regionId]);
}
