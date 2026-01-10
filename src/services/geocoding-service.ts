const GOOGLE_PLACES_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY;

export interface GeocodedAddress {
  streetAddress: string;
  address: string; // Full formatted address
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

/**
 * Reverse geocode coordinates to get address using Google Places API
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<GeocodedAddress | null> {
  if (!GOOGLE_PLACES_API_KEY) {
    console.warn('[Geocoding] Google Places API key not found');
    return null;
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_PLACES_API_KEY}`;
    console.log(`[Geocoding] Attempting reverse geocode for: ${latitude}, ${longitude}`);
    
    const response = await fetch(url);

    if (!response.ok) {
      console.error(`[Geocoding] HTTP error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();

    if (data.status === 'OK' && data.results.length > 0) {
      console.log(`[Geocoding] Success: ${data.results[0].formatted_address}`);
      const result = data.results[0];
      const addressComponents = result.address_components;

      // Extract street address (street number + route)
      const streetNumber = addressComponents.find((c: any) =>
        c.types.includes('street_number')
      )?.long_name;
      const route = addressComponents.find((c: any) =>
        c.types.includes('route')
      )?.long_name;
      const streetAddress = [streetNumber, route]
        .filter(Boolean)
        .join(' ')
        .trim() || result.formatted_address.split(',')[0]; // Fallback to first part of address

      return {
        streetAddress,
        address: result.formatted_address,
        city: addressComponents.find((c: any) =>
          c.types.includes('locality')
        )?.long_name,
        state: addressComponents.find((c: any) =>
          c.types.includes('administrative_area_level_1')
        )?.long_name,
        country: addressComponents.find((c: any) =>
          c.types.includes('country')
        )?.long_name,
        postalCode: addressComponents.find((c: any) =>
          c.types.includes('postal_code')
        )?.long_name,
      };
    }

    console.warn(`[Geocoding] API returned status: ${data.status}`, data.error_message || '');
    return null;
  } catch (error) {
    console.error('[Geocoding] Network/parsing error:', error);
    if (error instanceof Error) {
      console.error('[Geocoding] Error details:', error.message, error.stack);
    }
    return null;
  }
}
