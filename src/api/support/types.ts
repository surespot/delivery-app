import { ApiResponse } from '../onboarding/types';

export type SupportCategory = 'account_verification' | 'delivery_problems' | 'earnings_payouts' | 'bug';
export type SupportSource = 'service_issue' | 'bug_report';
export type SupportStatus = 'pending' | 'in_progress' | 'resolved' | 'closed';

export interface SupportRequest {
  id: string;
  source?: SupportSource;
  category: SupportCategory;
  type: string;
  title?: string;
  description: string;
  contactPhone?: string;
  status: SupportStatus;
  createdAt: string;
  stepsToReproduce?: string;
  areaAffected?: string;
  orderId?: string;
  attachments?: string[];
}

export interface SupportRequestListData {
  requests: SupportRequest[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export type SupportRequestListResponse = ApiResponse<SupportRequestListData>;
export type SupportRequestDetailResponse = ApiResponse<SupportRequest>;

export interface UploadAttachmentData {
  url: string;
}

export type UploadAttachmentResponse = ApiResponse<UploadAttachmentData>;
