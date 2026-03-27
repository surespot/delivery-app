import { apiRequest, apiRequestMultipart } from '../onboarding/client';
import type {
  SupportRequestListResponse,
  SupportRequestDetailResponse,
  UploadAttachmentResponse,
} from './types';

export const supportApi = {
  /**
   * Submit a support request (multipart/form-data)
   * POST /support/requests
   */
  submitSupportRequest: (formData: FormData): Promise<SupportRequestListResponse> => {
    return apiRequestMultipart<SupportRequestListResponse['data']>(
      '/support/requests',
      { formData, requiresAuth: true }
    ) as Promise<SupportRequestListResponse>;
  },

  /**
   * List own support requests
   * GET /support/requests
   */
  listSupportRequests: (
    page: number = 1,
    limit: number = 20,
    status?: string
  ): Promise<SupportRequestListResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (status && status !== 'all') {
      params.append('status', status);
    }
    return apiRequest<SupportRequestListResponse['data']>(
      `/support/requests?${params.toString()}`,
      { method: 'GET', requiresAuth: true }
    ) as Promise<SupportRequestListResponse>;
  },

  /**
   * Get support request details
   * GET /support/requests/:id
   */
  getSupportRequest: (id: string): Promise<SupportRequestDetailResponse> => {
    return apiRequest<SupportRequestDetailResponse['data']>(
      `/support/requests/${id}`,
      { method: 'GET', requiresAuth: true }
    ) as Promise<SupportRequestDetailResponse>;
  },

  /**
   * Upload attachment (standalone)
   * POST /support/upload
   */
  uploadAttachment: (formData: FormData): Promise<UploadAttachmentResponse> => {
    return apiRequestMultipart<UploadAttachmentResponse['data']>(
      '/support/upload',
      { formData, requiresAuth: true }
    ) as Promise<UploadAttachmentResponse>;
  },
};
