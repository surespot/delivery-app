// Location API Types

export interface UpdateLocationRequest {
  streetAddress: string;
  latitude: number;
  longitude: number;
  state: string;
  country: string;
  regionId: string;
}

export interface UpdateLocationResponse {
  success: boolean;
  message: string;
}
