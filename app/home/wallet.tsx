import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

const NAV_ITEMS = [
  { key: 'home', label: 'Home', icon: 'home' },
  { key: 'orders', label: 'Orders', icon: 'package' },
  { key: 'wallet', label: 'Wallet', icon: 'credit-card' },
  { key: 'profile', label: 'Profile', icon: 'user' },
];

interface Transaction {
  id: string;
  type: 'earned' | 'withdrew';
  amount: string;
  date: string;
}

export default function WalletScreen() {
  const router = useRouter();
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('this month');
  const [activeNav, setActiveNav] = useState('wallet');

  // Sample transaction data
  const transactions: Transaction[] = [
    { id: '1', type: 'withdrew', amount: '₦5,000', date: '5 Dec' },
    { id: '2', type: 'earned', amount: '₦1,000', date: '5 Dec' },
    { id: '3', type: 'earned', amount: '₦700', date: '5 Dec' },
    { id: '4', type: 'earned', amount: '₦700', date: '4 Dec' },
    { id: '5', type: 'earned', amount: '₦700', date: '4 Dec' },
  ];

  const totalEarnings = '₦57,300';
  const totalWithdrawals = '₦32,500';

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
            <Text style={styles.balanceAmount}>
              {isBalanceVisible ? '₦52,000' : '••••••'}
            </Text>
            <Pressable style={styles.withdrawButton}>
              <Text style={styles.withdrawButtonText}>Withdraw ↓</Text>
            </Pressable>
          </View>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryCardsContainer}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryCardLabel}>Total Earnings</Text>
            <View style={styles.summaryCardAmountRow}>
              <Text style={styles.summaryCardAmount}>{totalEarnings}</Text>
              <View style={[styles.summaryCardIcon, styles.earningsIcon]}>
                <Ionicons name="arrow-down" size={16} color="#2DBE7E" />
              </View>
            </View>
          </View>

          <View style={[styles.summaryCard, styles.withdrawalsCard]}>
            <Text style={styles.summaryCardLabel}>Total Withdrawals</Text>
            <View style={styles.summaryCardAmountRow}>
              <Text style={styles.summaryCardAmount}>{totalWithdrawals}</Text>
              <View style={[styles.summaryCardIcon, styles.withdrawalsIcon]}>
                <Ionicons name="arrow-up" size={16} color="#FF6B9D" />
              </View>
            </View>
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.transactionsSection}>
          <View style={styles.transactionsHeader}>
            <Text style={styles.transactionsTitle}>Recent Transactions</Text>
            <Pressable style={styles.periodDropdown}>
              <Text style={styles.periodDropdownText}>{selectedPeriod}</Text>
              <Feather name="chevron-down" size={16} color="#1F1F1F" />
            </Pressable>
          </View>

          <View style={styles.transactionsList}>
            {transactions.map((transaction, index) => (
              <View
                key={transaction.id}
                style={[
                  styles.transactionItem,
                  index === transactions.length - 1 && styles.transactionItemLast,
                ]}>
                <View style={styles.transactionLeft}>
                  <View
                    style={[
                      styles.transactionIcon,
                      transaction.type === 'withdrew'
                        ? styles.transactionIconWithdraw
                        : styles.transactionIconEarn,
                    ]}>
                    <Ionicons
                      name={
                        transaction.type === 'withdrew'
                          ? 'arrow-up'
                          : 'arrow-down'
                      }
                      size={16}
                      color={
                        transaction.type === 'withdrew' ? '#FFFFFF' : '#FFFFFF'
                      }
                    />
                  </View>
                  <View style={styles.transactionTextContainer}>
                    <Text style={styles.transactionType}>{transaction.type}</Text>
                    <Text style={styles.transactionAmount}>
                      {transaction.amount}
                    </Text>
                  </View>
                </View>
                <Text style={styles.transactionDate}>{transaction.date}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

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
