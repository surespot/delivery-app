// Wallet API Module - Public Exports

// Export API client
export { walletApi } from './client';

// Export hooks
export {
  useWalletBalance,
  useWalletTransactions,
  useWalletSummary,
  usePaymentDetails,
  useInitiateWithdrawal,
  useAddPaymentDetails,
  walletKeys,
} from './hooks';

// Export types
export type {
  Transaction,
  TransactionType,
  TransactionStatus,
  Period,
  WalletBalance,
  WalletBalanceResponse,
  WalletTransactionsData,
  WalletTransactionsResponse,
  WalletSummary,
  WalletSummaryResponse,
  PaymentDetails,
  PaymentDetailsResponse,
  AddPaymentDetailsRequest,
  AddPaymentDetailsResponse,
  InitiateWithdrawalRequest,
  InitiateWithdrawalData,
  InitiateWithdrawalResponse,
  WalletTransactionsParams,
} from './types';

export { WalletErrorCode } from './types';

// Export utils
export { formatTransactionDate, getWalletErrorMessage } from './utils';
