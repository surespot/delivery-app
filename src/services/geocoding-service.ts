import { locationApi } from '../api/location';

export interface GeocodedAddress {
  streetAddress: string;
  address: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

/**
 * Reverse geocode coordinates to a human-readable address.
 * Delegates to the backend, which holds the mapping API key server-side.
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<GeocodedAddress | null> {
  try {
    const response = await locationApi.reverseGeocode(latitude, longitude);
    if (response.data) {
      return response.data;
    }
    return null;
  } catch {
    return null;
  }
}
