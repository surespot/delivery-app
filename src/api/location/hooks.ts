import { useMutation } from '@tanstack/react-query';
import { locationApi } from './client';
import { UpdateLocationRequest } from './types';

export const useUpdateLocation = () => {
  return useMutation({
    mutationFn: (data: UpdateLocationRequest) =>
      locationApi.updateLocation(data),
    retry: 2,
    retryDelay: 1000,
  });
};
