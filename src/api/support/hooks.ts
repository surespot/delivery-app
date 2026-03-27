import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supportApi } from './client';

export const supportKeys = {
  all: ['support'] as const,
  requests: (page?: number, limit?: number, status?: string) =>
    ['support', 'requests', page, limit, status] as const,
  request: (id: string) => ['support', 'request', id] as const,
};

export const useSubmitSupportRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => supportApi.submitSupportRequest(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support'], exact: false });
    },
  });
};

export const useSupportRequests = (
  page: number = 1,
  limit: number = 20,
  status?: string,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: supportKeys.requests(page, limit, status),
    queryFn: () => supportApi.listSupportRequests(page, limit, status),
    enabled,
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

export const useSupportRequest = (id: string | null, enabled: boolean = true) => {
  return useQuery({
    queryKey: supportKeys.request(id ?? ''),
    queryFn: () => supportApi.getSupportRequest(id!),
    enabled: !!id && enabled,
    retry: 2,
    refetchOnWindowFocus: false,
  });
};
