import { apiRequest } from '../onboarding/client';
import type {
  AddPaymentDetailsRequest,
  AddPaymentDetailsResponse,
  InitiateWithdrawalRequest,
  InitiateWithdrawalResponse,
  PaymentDetailsResponse,
  WalletBalanceResponse,
  WalletSummaryResponse,
  WalletTransactionsParams,
  WalletTransactionsResponse,
} from './types';

export const walletApi = {
  /**
   * Get wallet balance for the authenticated rider
   * GET /wallets/me/balance
   */
  getWalletBalance: (): Promise<WalletBalanceResponse> => {
    return apiRequest<WalletBalanceResponse['data']>('/wallets/me/balance', {
      method: 'GET',
      requiresAuth: true,
    }) as Promise<WalletBalanceResponse>;
  },

  /**
   * Get wallet transactions with filtering and pagination
   * GET /wallets/me/transactions
   */
  getWalletTransactions: (
    params: WalletTransactionsParams = {}
  ): Promise<WalletTransactionsResponse> => {
    const {
      page = 1,
      limit = 20,
      type = 'all',
      status = 'all',
      period = 'all-time',
    } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (type !== 'all') {
      queryParams.append('type', type);
    }
    if (status !== 'all') {
      queryParams.append('status', status);
    }
    if (period !== 'all-time') {
      queryParams.append('period', period);
    }

    return apiRequest<WalletTransactionsResponse['data']>(
      `/wallets/me/transactions?${queryParams.toString()}`,
      {
        method: 'GET',
        requiresAuth: true,
      }
    ) as Promise<WalletTransactionsResponse>;
  },

  /**
   * Get wallet summary/statistics for a specific period
   * GET /wallets/me/summary
   */
  getWalletSummary: (
    period: 'this-month' | 'last-month' | 'this-year' | 'all-time' = 'all-time'
  ): Promise<WalletSummaryResponse> => {
    const queryParams = new URLSearchParams({ period });
    return apiRequest<WalletSummaryResponse['data']>(
      `/wallets/me/summary?${queryParams.toString()}`,
      {
        method: 'GET',
        requiresAuth: true,
      }
    ) as Promise<WalletSummaryResponse>;
  },

  /**
   * Get payment details (bank account information)
   * GET /wallets/me/payment-details
   */
  getPaymentDetails: (): Promise<PaymentDetailsResponse> => {
    return apiRequest<PaymentDetailsResponse['data']>(
      '/wallets/me/payment-details',
      {
        method: 'GET',
        requiresAuth: true,
      }
    ) as Promise<PaymentDetailsResponse>;
  },

  /**
   * Add or update payment details (bank account information)
   * POST /wallets/me/payment-details
   */
  addPaymentDetails: (
    data: AddPaymentDetailsRequest
  ): Promise<AddPaymentDetailsResponse> => {
    return apiRequest<AddPaymentDetailsResponse['data']>(
      '/wallets/me/payment-details',
      {
        method: 'POST',
        body: data,
        requiresAuth: true,
      }
    ) as Promise<AddPaymentDetailsResponse>;
  },

  /**
   * Initiate withdrawal from wallet to bank account
   * POST /wallets/me/withdraw
   */
  initiateWithdrawal: (
    data: InitiateWithdrawalRequest
  ): Promise<InitiateWithdrawalResponse> => {
    return apiRequest<InitiateWithdrawalResponse['data']>(
      '/wallets/me/withdraw',
      {
        method: 'POST',
        body: data,
        requiresAuth: true,
      }
    ) as Promise<InitiateWithdrawalResponse>;
  },
};
