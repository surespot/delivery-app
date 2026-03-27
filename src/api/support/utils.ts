/**
 * Maps UI complaint/issue types to API type strings.
 */

// Report Issue (general) - maps UI label to API category + type
export const REPORT_ISSUE_MAP: Record<string, { category: string; type: string }> = {
  'Order not delivered': { category: 'delivery_problems', type: 'order_not_delivered' },
  'Wrong items received': { category: 'delivery_problems', type: 'wrong_items_received' },
  'Payment issue': { category: 'earnings_payouts', type: 'payment_issue' },
  'App crash / Bug': { category: 'bug', type: 'app_crash' },
  'Account problem': { category: 'account_verification', type: 'account_problem' },
  'Other': { category: 'account_verification', type: 'other' },
};

// Account Verification complaint IDs -> API type
export const ACCOUNT_VERIFICATION_TYPE_MAP: Record<string, string> = {
  '1': 'activation_code',
  '2': 'onboarding_verification',
  '3': 'login_issue',
  '4': 'profile_update',
};

// Delivery Problems complaint IDs -> API type
export const DELIVERY_PROBLEMS_TYPE_MAP: Record<string, string> = {
  '1': 'accept_order',
  '2': 'order_not_showing',
  '3': 'customer_unavailable',
  '4': 'wrong_delivery_address',
  '5': 'mark_delivered_failed',
};

// Earnings Payouts complaint IDs -> API type
export const EARNINGS_PAYOUTS_TYPE_MAP: Record<string, string> = {
  '1': 'earnings_not_updated',
  '2': 'missing_payout',
  '3': 'wrong_payout_amount',
  '4': 'payout_history',
};

// Map API status to display label
export const STATUS_DISPLAY: Record<string, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
};

export function getStatusDisplay(status: string): string {
  return STATUS_DISPLAY[status] ?? status;
}
