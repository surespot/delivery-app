// Wallet API Types

import { ApiResponse } from '../onboarding/types';
import type { PaginationMeta } from '../orders/types';

// Transaction Types
export type TransactionType = 'earned' | 'withdrew';
export type TransactionStatus = 'completed' | 'pending' | 'failed';
export type Period = 'this-month' | 'last-month' | 'this-year' | 'all-time';

// Wallet Balance
export interface WalletBalance {
  walletBalance: number; // Balance in kobo
  formattedBalance: string; // Formatted balance (e.g., "₦5,000.00")
  currency: string; // Currency code (e.g., "NGN")
  isVerified: boolean; // Whether payment details are verified
}

export type WalletBalanceResponse = ApiResponse<WalletBalance>;

// Transaction
export interface Transaction {
  id: string; // Transaction ID (MongoDB ObjectId)
  type: TransactionType; // Transaction type (normalized for frontend)
  amount: number; // Amount in kobo
  formattedAmount: string; // Formatted amount (e.g., "₦1,500.00")
  status: TransactionStatus; // Transaction status (normalized for frontend)
  reference: string; // Transaction reference (e.g., "EARN-1234567890-abc12345")
  createdAt: string; // ISO date string
  orderId?: string; // Order ID if related to an order (for earnings)
  description: string; // Human-readable description
}

// Wallet Transactions
export interface WalletTransactionsData {
  transactions: Transaction[];
  pagination: PaginationMeta;
}

export type WalletTransactionsResponse = ApiResponse<WalletTransactionsData>;

// Wallet Summary
export interface WalletSummary {
  totalEarnings: number; // Total earnings in kobo
  formattedTotalEarnings: string; // Formatted (e.g., "₦15,000.00")
  totalWithdrawals: number; // Total withdrawals in kobo
  formattedTotalWithdrawals: string; // Formatted (e.g., "₦5,000.00")
  availableBalance: number; // Current wallet balance in kobo
  formattedAvailableBalance: string; // Formatted (e.g., "₦10,000.00")
  period: string; // Period used for calculation
}

export type WalletSummaryResponse = ApiResponse<WalletSummary>;

// Payment Details
export interface PaymentDetails {
  recipientCode: string; // Paystack transfer recipient code
  accountNumber: string; // Bank account number
  bankCode: string; // Paystack bank code
  bankName: string; // Bank name (from Paystack)
  accountName: string; // Account holder name
  isVerified?: boolean; // Whether account is verified
}

export type PaymentDetailsResponse = ApiResponse<PaymentDetails>;

// Add Payment Details Request
export interface AddPaymentDetailsRequest {
  accountNumber: string; // Required: 10-digit bank account number
  bankCode: string; // Required: Paystack bank code (e.g., "058" for GTBank)
  accountName: string; // Required: Account holder name
}

export type AddPaymentDetailsResponse = ApiResponse<PaymentDetails>;

// Initiate Withdrawal Request
export interface InitiateWithdrawalRequest {
  amount: number; // Required: Withdrawal amount in kobo (minimum: 100 kobo = ₦1)
}

// Initiate Withdrawal Response
export interface InitiateWithdrawalData {
  transferCode: string; // Paystack transfer code
  reference: string; // Withdrawal reference (e.g., "WTH-1704123456789-abc12345")
  amount: number; // Withdrawal amount in kobo
  status: string; // Transfer status from Paystack
}

export type InitiateWithdrawalResponse = ApiResponse<InitiateWithdrawalData>;

// Wallet Transactions Query Parameters
export interface WalletTransactionsParams {
  page?: number; // Page number (1-indexed)
  limit?: number; // Number of transactions per page (max: 50)
  type?: 'earned' | 'withdrew' | 'all'; // Filter by type
  status?: 'completed' | 'pending' | 'failed' | 'all'; // Filter by status
  period?: Period; // Filter by period
}

// Error Codes
export enum WalletErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_AMOUNT = 'INVALID_AMOUNT',
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  PAYMENT_DETAILS_NOT_SET = 'PAYMENT_DETAILS_NOT_SET',
  PAYSTACK_RECIPIENT_CREATION_FAILED = 'PAYSTACK_RECIPIENT_CREATION_FAILED',
  PAYSTACK_TRANSFER_FAILED = 'PAYSTACK_TRANSFER_FAILED',
  RIDER_PROFILE_NOT_FOUND = 'RIDER_PROFILE_NOT_FOUND',
  WALLET_NOT_FOUND = 'WALLET_NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
}
