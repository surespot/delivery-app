import { apiRequest } from '../onboarding/client';
import { UpdateLocationRequest, UpdateLocationResponse } from './types';

export const locationApi = {
  updateLocation: (data: UpdateLocationRequest) =>
    apiRequest<UpdateLocationResponse>('/riders/location', {
      method: 'PUT',
      body: data,
      requiresAuth: true,
    }),
};
