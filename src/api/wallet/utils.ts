import { WalletErrorCode } from './types';

/**
 * Format transaction date to relative time (e.g., "2 hours ago", "3 days ago")
 * For older dates, shows formatted date (e.g., "Dec 5, 2024")
 */
export function formatTransactionDate(timestamp: string): string {
  const now = new Date();
  const transactionDate = new Date(timestamp);
  const diffMs = now.getTime() - transactionDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) {
    return 'Just now';
  } else if (diffMins < 60) {
    return `${diffMins}min ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else {
    // Format as date for older transactions
    return transactionDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year:
        transactionDate.getFullYear() !== now.getFullYear()
          ? 'numeric'
          : undefined,
    });
  }
}

/**
 * Get user-friendly error message from wallet error code
 */
export function getWalletErrorMessage(errorCode: string): string {
  const errorMessages: Record<string, string> = {
    [WalletErrorCode.VALIDATION_ERROR]:
      'Please check your input and try again.',
    [WalletErrorCode.INVALID_AMOUNT]:
      'Invalid withdrawal amount. Minimum withdrawal is ₦1.00.',
    [WalletErrorCode.INSUFFICIENT_BALANCE]:
      'Insufficient balance. Please check your wallet balance and try again.',
    [WalletErrorCode.PAYMENT_DETAILS_NOT_SET]:
      'Bank account details not set. Please contact support to add your bank account information.',
    [WalletErrorCode.PAYSTACK_RECIPIENT_CREATION_FAILED]:
      'Failed to verify bank account. Please check your account details and try again.',
    [WalletErrorCode.PAYSTACK_TRANSFER_FAILED]:
      'Withdrawal failed. Please try again or contact support if the problem persists.',
    [WalletErrorCode.RIDER_PROFILE_NOT_FOUND]:
      'Rider profile not found. Please complete your registration.',
    [WalletErrorCode.WALLET_NOT_FOUND]:
      'Wallet not found. Please contact support.',
    [WalletErrorCode.UNAUTHORIZED]:
      'Please log in to continue.',
    [WalletErrorCode.FORBIDDEN]:
      'You do not have permission to perform this action.',
  };

  return (
    errorMessages[errorCode] ||
    'An error occurred. Please try again or contact support if the problem persists.'
  );
}
