import * as Location from 'expo-location';

export interface GeocodedAddress {
  streetAddress: string;
  address: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<GeocodedAddress | null> {
  try {
    const results = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (!results.length) return null;

    const addr = results[0];
    const parts = [
      addr.streetNumber,
      addr.street,
      addr.district,
      addr.city,
      addr.region,
      addr.country,
    ].filter(Boolean);

    const streetAddress = [addr.streetNumber, addr.street]
      .filter(Boolean)
      .join(' ');

    return {
      streetAddress: streetAddress || addr.name || '',
      address: parts.join(', ') || addr.name || '',
      city: addr.city ?? undefined,
      state: addr.region ?? undefined,
      country: addr.country ?? undefined,
      postalCode: addr.postalCode ?? undefined,
    };
  } catch {
    return null;
  }
}
