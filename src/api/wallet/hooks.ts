import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { walletApi } from './client';
import type {
  AddPaymentDetailsRequest,
  InitiateWithdrawalRequest,
  Period,
  WalletTransactionsParams,
} from './types';

// Query Keys
export const walletKeys = {
  all: ['wallet'] as const,
  balance: () => ['wallet', 'balance'] as const,
  transactions: (params?: WalletTransactionsParams) =>
    ['wallet', 'transactions', params] as const,
  summary: (period?: Period) => ['wallet', 'summary', period] as const,
  paymentDetails: () => ['wallet', 'payment-details'] as const,
};

/**
 * Get wallet balance for the authenticated rider
 */
export const useWalletBalance = (enabled: boolean = true) => {
  return useQuery({
    queryKey: walletKeys.balance(),
    queryFn: () => walletApi.getWalletBalance(),
    enabled,
    retry: 2,
    refetchOnWindowFocus: true,
  });
};

/**
 * Get wallet transactions with filtering and pagination
 */
export const useWalletTransactions = (
  params: WalletTransactionsParams = {},
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: walletKeys.transactions(params),
    queryFn: () => walletApi.getWalletTransactions(params),
    enabled,
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

/**
 * Get wallet summary/statistics for a specific period
 */
export const useWalletSummary = (
  period: Period = 'all-time',
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: walletKeys.summary(period),
    queryFn: () => walletApi.getWalletSummary(period),
    enabled,
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

/**
 * Get payment details (bank account information)
 */
export const usePaymentDetails = (enabled: boolean = true) => {
  return useQuery({
    queryKey: walletKeys.paymentDetails(),
    queryFn: () => walletApi.getPaymentDetails(),
    enabled,
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

/**
 * Initiate withdrawal from wallet to bank account
 */
export const useInitiateWithdrawal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: InitiateWithdrawalRequest) =>
      walletApi.initiateWithdrawal(data),
    onSuccess: () => {
      // Invalidate balance to refresh after withdrawal
      queryClient.invalidateQueries({
        queryKey: walletKeys.balance(),
        exact: false,
      });
      // Invalidate transactions to show new withdrawal transaction
      queryClient.invalidateQueries({
        queryKey: ['wallet', 'transactions'],
        exact: false,
      });
      // Invalidate summary to update statistics
      queryClient.invalidateQueries({
        queryKey: ['wallet', 'summary'],
        exact: false,
      });
    },
  });
};

/**
 * Add or update payment details (bank account information)
 */
export const useAddPaymentDetails = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AddPaymentDetailsRequest) =>
      walletApi.addPaymentDetails(data),
    onSuccess: () => {
      // Invalidate payment details to refresh
      queryClient.invalidateQueries({
        queryKey: walletKeys.paymentDetails(),
        exact: false,
      });
      // Invalidate balance to update isVerified flag
      queryClient.invalidateQueries({
        queryKey: walletKeys.balance(),
        exact: false,
      });
    },
  });
};
