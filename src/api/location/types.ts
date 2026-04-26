// Location API Types

export interface UpdateLocationRequest {
  latitude: number;
  longitude: number;
  regionId: string;
  streetAddress?: string;
  state?: string;
  country?: string;
}

export interface UpdateLocationResponse {
  success: boolean;
  message: string;
}

