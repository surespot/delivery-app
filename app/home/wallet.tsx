import {
  useInitiateWithdrawal,
  usePaymentDetails,
  useWalletBalance,
  useWalletSummary,
  useWalletTransactions,
  formatTransactionDate,
  getWalletErrorMessage,
  type Period,
} from '@/src/api/wallet';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

const NAV_ITEMS = [
  { key: 'home', label: 'Home', icon: 'home' },
  { key: 'orders', label: 'Orders', icon: 'package' },
  { key: 'wallet', label: 'Wallet', icon: 'credit-card' },
  { key: 'profile', label: 'Profile', icon: 'user' },
];

// Period mapping from UI text to API format
const PERIOD_OPTIONS = [
  { label: 'this month', value: 'this-month' as Period },
  { label: 'last month', value: 'last-month' as Period },
  { label: 'this year', value: 'this-year' as Period },
  { label: 'all time', value: 'all-time' as Period },
];

const MIN_WITHDRAWAL_AMOUNT = 100; // 100 kobo = ₦1.00

export default function WalletScreen() {
  const router = useRouter();
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('this-month');
  const [activeNav, setActiveNav] = useState('wallet');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [allTransactions, setAllTransactions] = useState<
    Array<{
      id: string;
      type: 'earned' | 'withdrew';
      amount: string;
      date: string;
      status: 'completed' | 'pending' | 'failed';
    }>
  >([]);

  // Convert UI period label to API period value
  const periodLabel = useMemo(() => {
    return PERIOD_OPTIONS.find((p) => p.value === selectedPeriod)?.label || 'this month';
  }, [selectedPeriod]);

  // API Hooks
  const walletBalance = useWalletBalance();
  const walletSummary = useWalletSummary(selectedPeriod);
  const walletTransactions = useWalletTransactions(
    {
      page: currentPage,
      limit: 20,
      period: selectedPeriod,
    },
    true
  );
  const paymentDetails = usePaymentDetails(false); // Only check when needed
  const initiateWithdrawal = useInitiateWithdrawal();

  // Reset transactions when period changes
  useEffect(() => {
    setCurrentPage(1);
    setAllTransactions([]);
  }, [selectedPeriod]);

  // Accumulate transactions as pages load
  useEffect(() => {
    if (walletTransactions.data?.data?.transactions) {
      const newTransactions = walletTransactions.data.data.transactions.map((tx) => ({
        id: tx.id,
        type: tx.type,
        amount: tx.formattedAmount,
        date: formatTransactionDate(tx.createdAt),
        status: tx.status,
      }));

      if (currentPage === 1) {
        setAllTransactions(newTransactions);
      } else {
        setAllTransactions((prev) => [...prev, ...newTransactions]);
      }
    }
  }, [walletTransactions.data, currentPage]);

  const handleNavPress = (key: string) => {
    setActiveNav(key);
    if (key === 'home') {
      router.push('/home' as any);
    } else if (key === 'orders') {
      router.push('/home/orders' as any);
    } else if (key === 'profile') {
      router.push('/home/profile' as any);
    }
  };

  const handleWithdrawPress = async () => {
    // Check if payment details exist
    try {
      const paymentDetailsResult = await paymentDetails.refetch();
      if (!paymentDetailsResult.data?.data) {
        Alert.alert(
          'Payment Details Not Set',
          'Bank account details are not set. Please contact support to add your bank account information.',
          [{ text: 'OK' }]
        );
        return;
      }
    } catch (error) {
      // 404 means payment details not set
      Alert.alert(
        'Payment Details Not Set',
        'Bank account details are not set. Please contact support to add your bank account information.',
        [{ text: 'OK' }]
      );
      return;
    }

    setShowWithdrawModal(true);
  };

  const handleWithdrawSubmit = () => {
    const amount = parseFloat(withdrawAmount.replace(/[₦,]/g, '')) * 100; // Convert to kobo

    if (!withdrawAmount || isNaN(amount) || amount < MIN_WITHDRAWAL_AMOUNT) {
      Alert.alert('Invalid Amount', 'Minimum withdrawal amount is ₦1.00');
      return;
    }

    const balance = walletBalance.data?.data?.walletBalance || 0;
    if (amount > balance) {
      Alert.alert('Insufficient Balance', 'You do not have enough balance for this withdrawal.');
      return;
    }

    // Confirmation dialog
    Alert.alert(
      'Confirm Withdrawal',
      `Are you sure you want to withdraw ${withdrawAmount}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              await initiateWithdrawal.mutateAsync({ amount });
              Alert.alert('Success', 'Withdrawal initiated successfully!', [
                {
                  text: 'OK',
                  onPress: () => {
                    setShowWithdrawModal(false);
                    setWithdrawAmount('');
                  },
                },
              ]);
            } catch (error: any) {
              const errorCode =
                error?.response?.data?.error?.code || error?.data?.error?.code || 'UNKNOWN_ERROR';
              const errorMessage = getWalletErrorMessage(errorCode);
              Alert.alert('Withdrawal Failed', errorMessage);
            }
          },
        },
      ]
    );
  };

  const handleLoadMore = () => {
    if (
      walletTransactions.data?.data?.pagination.hasNext &&
      !walletTransactions.isFetching
    ) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const formatAmountInput = (text: string) => {
    // Remove all non-numeric characters except decimal point
    const numericText = text.replace(/[^0-9.]/g, '');
    // Only allow one decimal point
    const parts = numericText.split('.');
    let formatted = parts[0];
    if (parts.length > 1) {
      formatted += '.' + parts.slice(1).join('').substring(0, 2);
    }
    // Format as currency
    if (formatted) {
      const num = parseFloat(formatted);
      if (!isNaN(num)) {
        return `₦${num.toLocaleString('en-US', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        })}`;
      }
    }
    return formatted ? `₦${formatted}` : '';
  };

  const balance = walletBalance.data?.data?.formattedBalance || '₦0.00';
  const isLoadingBalance = walletBalance.isLoading;
  const isLoadingSummary = walletSummary.isLoading;
  const isLoadingTransactions = walletTransactions.isLoading && currentPage === 1;
  const isLoadingMore = walletTransactions.isFetching && currentPage > 1;

  const totalEarnings =
    walletSummary.data?.data?.formattedTotalEarnings || '₦0.00';
  const totalWithdrawals =
    walletSummary.data?.data?.formattedTotalWithdrawals || '₦0.00';

  const hasMoreTransactions =
    walletTransactions.data?.data?.pagination.hasNext || false;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Wallet</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          {/* SVG Background */}
          <View style={styles.svgContainer}>
            <Svg width="93" height="71" viewBox="0 0 93 71" fill="none">
              <Path
                opacity="0.6"
                fillRule="evenodd"
                clipRule="evenodd"
                d="M2.80369 25.2604C12.654 17.6163 16.9225 -0.67199 29.3718 0.0180617C42.232 0.730894 43.6526 21.5468 54.7184 28.1379C65.8344 34.7591 86.6666 25.1937 91.6707 37.1255C96.8305 49.4286 73.6524 58.2511 72.9346 71.573C72.1376 86.3661 95.7153 100.173 87.6058 112.571C79.9193 124.322 59.8597 108.466 46.3345 112.24C33.8198 115.732 27.1336 135.047 14.2988 133.027C1.84052 131.066 0.306082 112.863 -8.29784 103.642C-16.9702 94.3479 -32.7192 91.0624 -36.252 78.8512C-39.791 66.6186 -33.374 53.1811 -25.874 42.8898C-19.1285 33.634 -6.24447 32.2819 2.80369 25.2604Z"
                fill="#FFF1CF"
              />
            </Svg>
          </View>

          <View style={styles.balanceContent}>
            <View style={styles.balanceHeader}>
              <Text style={styles.balanceLabel}>Balance</Text>
              <Pressable onPress={() => setIsBalanceVisible(!isBalanceVisible)}>
                <Feather name="eye" size={20} color="#1F1F1F" />
              </Pressable>
            </View>
            {isLoadingBalance ? (
              <ActivityIndicator size="small" color="#1F1F1F" style={styles.loadingIndicator} />
            ) : (
              <Text style={styles.balanceAmount}>
                {isBalanceVisible ? balance : '••••••'}
              </Text>
            )}
            <Pressable
              style={styles.withdrawButton}
              onPress={handleWithdrawPress}
              disabled={isLoadingBalance || initiateWithdrawal.isPending}>
              <Text style={styles.withdrawButtonText}>Withdraw ↓</Text>
            </Pressable>
          </View>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryCardsContainer}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryCardLabel}>Total Earnings</Text>
            {isLoadingSummary ? (
              <ActivityIndicator size="small" color="#1F1F1F" />
            ) : (
              <View style={styles.summaryCardAmountRow}>
                <Text style={styles.summaryCardAmount}>{totalEarnings}</Text>
                <View style={[styles.summaryCardIcon, styles.earningsIcon]}>
                  <Ionicons name="arrow-down" size={16} color="#2DBE7E" />
                </View>
              </View>
            )}
          </View>

          <View style={[styles.summaryCard, styles.withdrawalsCard]}>
            <Text style={styles.summaryCardLabel}>Total Withdrawals</Text>
            {isLoadingSummary ? (
              <ActivityIndicator size="small" color="#1F1F1F" />
            ) : (
              <View style={styles.summaryCardAmountRow}>
                <Text style={styles.summaryCardAmount}>{totalWithdrawals}</Text>
                <View style={[styles.summaryCardIcon, styles.withdrawalsIcon]}>
                  <Ionicons name="arrow-up" size={16} color="#FF6B9D" />
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.transactionsSection}>
          <View style={styles.transactionsHeader}>
            <Text style={styles.transactionsTitle}>Recent Transactions</Text>
            <Pressable
              style={styles.periodDropdown}
              onPress={() => setShowPeriodModal(true)}>
              <Text style={styles.periodDropdownText}>{periodLabel}</Text>
              <Feather name="chevron-down" size={16} color="#1F1F1F" />
            </Pressable>
          </View>

          {isLoadingTransactions ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#1F1F1F" />
            </View>
          ) : allTransactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No transactions found</Text>
            </View>
          ) : (
            <>
              <View style={styles.transactionsList}>
                {allTransactions.map((transaction, index) => (
                  <View
                    key={transaction.id}
                    style={[
                      styles.transactionItem,
                      index === allTransactions.length - 1 &&
                        !hasMoreTransactions &&
                        styles.transactionItemLast,
                    ]}>
                    <View style={styles.transactionLeft}>
                      <View
                        style={[
                          styles.transactionIcon,
                          transaction.type === 'withdrew'
                            ? styles.transactionIconWithdraw
                            : styles.transactionIconEarn,
                          transaction.status === 'pending' &&
                            styles.transactionIconPending,
                          transaction.status === 'failed' &&
                            styles.transactionIconFailed,
                        ]}>
                        <Ionicons
                          name={
                            transaction.type === 'withdrew'
                              ? 'arrow-up'
                              : 'arrow-down'
                          }
                          size={16}
                          color="#FFFFFF"
                        />
                      </View>
                      <View style={styles.transactionTextContainer}>
                        <Text style={styles.transactionType}>
                          {transaction.type}
                          {transaction.status === 'pending' && ' (pending)'}
                          {transaction.status === 'failed' && ' (failed)'}
                        </Text>
                        <Text style={styles.transactionAmount}>
                          {transaction.amount}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.transactionDate}>{transaction.date}</Text>
                  </View>
                ))}
              </View>
              {hasMoreTransactions && (
                <Pressable
                  style={styles.loadMoreButton}
                  onPress={handleLoadMore}
                  disabled={isLoadingMore}>
                  {isLoadingMore ? (
                    <ActivityIndicator size="small" color="#1F1F1F" />
                  ) : (
                    <Text style={styles.loadMoreButtonText}>Load More</Text>
                  )}
                </Pressable>
              )}
            </>
          )}
        </View>
      </ScrollView>

      {/* Period Selection Modal */}
      <Modal
        visible={showPeriodModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPeriodModal(false)}>
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowPeriodModal(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Period</Text>
            {PERIOD_OPTIONS.map((option) => (
              <Pressable
                key={option.value}
                style={[
                  styles.modalOption,
                  selectedPeriod === option.value && styles.modalOptionSelected,
                ]}
                onPress={() => {
                  setSelectedPeriod(option.value);
                  setShowPeriodModal(false);
                }}>
                <Text
                  style={[
                    styles.modalOptionText,
                    selectedPeriod === option.value &&
                      styles.modalOptionTextSelected,
                  ]}>
                  {option.label}
                </Text>
                {selectedPeriod === option.value && (
                  <Feather name="check" size={20} color="#FFD700" />
                )}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* Withdrawal Modal */}
      <Modal
        visible={showWithdrawModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowWithdrawModal(false)}>
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowWithdrawModal(false)}>
          <View style={styles.withdrawModalContent}>
            <Text style={styles.modalTitle}>Withdraw Funds</Text>
            <Text style={styles.modalSubtitle}>
              Current Balance: {walletBalance.data?.data?.formattedBalance || '₦0.00'}
            </Text>
            <Text style={styles.modalSubtitle}>
              Minimum: ₦1.00
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Amount</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="Enter amount"
                placeholderTextColor="#9E9E9E"
                value={withdrawAmount}
                onChangeText={(text) => setWithdrawAmount(formatAmountInput(text))}
                keyboardType="numeric"
                autoFocus
              />
            </View>

            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setShowWithdrawModal(false);
                  setWithdrawAmount('');
                }}>
                <Text style={styles.modalButtonCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.modalButton,
                  styles.modalButtonConfirm,
                  (!withdrawAmount ||
                    initiateWithdrawal.isPending) &&
                    styles.modalButtonDisabled,
                ]}
                onPress={handleWithdrawSubmit}
                disabled={!withdrawAmount || initiateWithdrawal.isPending}>
                {initiateWithdrawal.isPending ? (
                  <ActivityIndicator size="small" color="#1F1F1F" />
                ) : (
                  <Text style={styles.modalButtonConfirmText}>Withdraw</Text>
                )}
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        {NAV_ITEMS.map((item) => {
          const active = item.key === activeNav;
          return (
            <Pressable
              key={item.key}
              style={[styles.navItem, active && styles.navItemActive]}
              onPress={() => handleNavPress(item.key)}>
              <Feather
                name={item.icon as 'home' | 'package' | 'credit-card' | 'user'}
                size={18}
                color={active ? '#1f1f1f' : '#444'}
              />
              {active ? (
                <Text style={[styles.navLabel, styles.navLabelActive]}>
                  {item.label}
                </Text>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBEA',
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1F1F1F',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  balanceCard: {
    backgroundColor: '#F2D69C',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  svgContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    zIndex: -1,
  },
  balanceContent: {
    position: 'relative',
    zIndex: 1,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  balanceLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F1F1F',
    opacity: 0.7,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: '#1F1F1F',
    marginBottom: 24,
  },
  loadingIndicator: {
    marginBottom: 24,
  },
  withdrawButton: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },
  withdrawButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F1F1F',
  },
  summaryCardsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#C8E6C9',
    borderRadius: 16,
    padding: 16,
  },
  withdrawalsCard: {
    backgroundColor: '#FFE5EC',
  },
  summaryCardLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1F1F1F',
    opacity: 0.7,
    marginBottom: 8,
  },
  summaryCardAmountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryCardAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F1F1F',
  },
  summaryCardIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  earningsIcon: {
    backgroundColor: '#A5D6A7',
  },
  withdrawalsIcon: {
    backgroundColor: '#FFB3C6',
  },
  transactionsSection: {
    marginBottom: 24,
  },
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  transactionsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F1F1F',
  },
  periodDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  periodDropdownText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F1F1F',
  },
  transactionsList: {
    gap: 12,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  transactionItemLast: {
    marginBottom: 0,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionIconEarn: {
    backgroundColor: '#2DBE7E',
  },
  transactionIconWithdraw: {
    backgroundColor: '#FF5252',
  },
  transactionIconPending: {
    backgroundColor: '#FFA726',
  },
  transactionIconFailed: {
    backgroundColor: '#B71C1C',
  },
  transactionTextContainer: {
    gap: 2,
  },
  transactionType: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F1F1F',
    textTransform: 'capitalize',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F1F1F',
  },
  transactionDate: {
    fontSize: 14,
    fontWeight: '400',
    color: '#7A7A7A',
  },
  loadingContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#7A7A7A',
  },
  loadMoreButton: {
    marginTop: 16,
    padding: 12,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  loadMoreButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F1F1F',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  withdrawModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F1F1F',
    marginBottom: 16,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#7A7A7A',
    marginBottom: 8,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#F5F5F5',
  },
  modalOptionSelected: {
    backgroundColor: '#FFFBEA',
  },
  modalOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F1F1F',
  },
  modalOptionTextSelected: {
    color: '#1F1F1F',
    fontWeight: '600',
  },
  inputGroup: {
    marginTop: 24,
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F1F1F',
    marginBottom: 8,
  },
  amountInput: {
    backgroundColor: '#EDEDED',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#1F1F1F',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#EDEDED',
  },
  modalButtonConfirm: {
    backgroundColor: '#FFD700',
  },
  modalButtonDisabled: {
    opacity: 0.5,
  },
  modalButtonCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F1F1F',
  },
  modalButtonConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F1F1F',
  },
  bottomNav: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 24,
    backgroundColor: '#FFEDB5',
    borderRadius: 999,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingVertical: 14,
    shadowColor: '#2E2E2E',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 6,
  },
  navItem: {
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 999,
    flexDirection: 'row',
    gap: 6,
  },
  navItemActive: {
    backgroundColor: '#FFD646',
  },
  navLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  navLabelActive: {
    color: '#1f1f1f',
  },
});
