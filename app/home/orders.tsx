import { useOrdersStore } from '@/store/orders-store';
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

const NAV_ITEMS = [
  { key: 'home', label: 'Home', icon: 'home' },
  { key: 'orders', label: 'Orders', icon: 'package' },
  { key: 'wallet', label: 'Wallet', icon: 'credit-card' },
  { key: 'profile', label: 'Profile', icon: 'user' },
];

type TabType = 'active' | 'available' | 'completed';

export default function OrdersScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [activeNav, setActiveNav] = useState('orders');
  const {
    currentOrders,
    availableOrders,
    completedOrders,
    markAsDelivered,
    addCurrentOrder,
  } = useOrdersStore();

  const handleNavPress = (key: string) => {
    setActiveNav(key);
    if (key === 'home') {
      router.push('/home' as any);
    } else if (key === 'wallet') {
      router.push('/home/wallet' as any);
    } else if (key === 'profile') {
      router.push('/home/profile' as any);
    }
  };

  const renderActiveOrders = () => {
    if (currentOrders.length === 0) {
      return (
        <View>
          <Text style={styles.emptyStateText}>
            You do not have any current active orders. Accept any available orders(up to 3) to see them here.
          </Text>
        </View>
      );
    }

    return (
      <View>
        {currentOrders.map((order, index) => (
          <View
            key={order.id}
            style={[
              styles.orderDetailsBox,
              index === currentOrders.length - 1 && styles.orderDetailsBoxLast,
            ]}>
            <View style={styles.routeContainer}>
              <View style={styles.routeItem}>
                <View style={styles.routeIcon}>
                  <Ionicons name="location" size={16} color="#FFFFFF" />
                </View>
                <Text style={styles.routeAddress}>{order.pickupAddress}</Text>
              </View>
              <View style={styles.routeLine} />
              <View style={styles.routeItem}>
                <View style={styles.routeIcon}>
                  <Ionicons name="star" size={16} color="#FFFFFF" />
                </View>
                <Text style={styles.routeAddress}>{order.deliveryAddress}</Text>
              </View>
            </View>
            <View style={styles.orderActions}>
              <View style={styles.timeButton}>
                <Text style={styles.timeButtonText}>{order.time}</Text>
              </View>
              <Pressable
                style={styles.deliveredButton}
                onPress={() => markAsDelivered(order.id)}>
                <Text style={styles.deliveredButtonText}>Mark as delivered</Text>
                <Ionicons name="checkmark" size={18} color="#1F1F1F" />
              </Pressable>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderAvailableOrders = () => {
    if (availableOrders.length === 0) {
      return (
        <View>
          <Text style={styles.emptyStateText}>
            No available orders at the moment. Check back later!
          </Text>
        </View>
      );
    }

    return (
      <View>
        {availableOrders.map((order, index) => (
          <View
            key={order.id}
            style={[
              styles.orderDetailsBox,
              index === availableOrders.length - 1 && styles.orderDetailsBoxLast,
            ]}>
            <View style={styles.routeContainer}>
              <View style={styles.routeItem}>
                <View style={styles.routeIcon}>
                  <Ionicons name="location" size={16} color="#FFFFFF" />
                </View>
                <Text style={styles.routeAddress}>{order.pickupAddress}</Text>
              </View>
              <View style={styles.routeLine} />
              <View style={styles.routeItem}>
                <View style={styles.routeIcon}>
                  <Ionicons name="star" size={16} color="#FFFFFF" />
                </View>
                <Text style={styles.routeAddress}>{order.deliveryAddress}</Text>
              </View>
            </View>
            <View style={styles.orderInfo}>
              <View style={styles.infoItem}>
                <View style={styles.currencyIconContainer}>
                  <Feather name="dollar-sign" size={14} color="#7A7A7A" />
                </View>
                <Text style={styles.price}>{order.price}</Text>
              </View>
              <View style={styles.infoItem}>
                <Feather name="clock" size={14} color="#7A7A7A" />
                <Text style={styles.infoText}>{order.time}</Text>
              </View>
              <View style={styles.infoItem}>
                <Feather name="maximize-2" size={14} color="#7A7A7A" />
                <Text style={styles.infoText}>{order.distance}</Text>
              </View>
            </View>
            <Pressable
              style={[
                styles.pickOrderButton,
                currentOrders.length >= 3 && styles.pickOrderButtonDisabled,
              ]}
              onPress={() => {
                if (currentOrders.length < 3) {
                  addCurrentOrder(order);
                }
              }}
              disabled={currentOrders.length >= 3}>
              <Text style={styles.pickOrderButtonText}>Pick Order</Text>
            </Pressable>
          </View>
        ))}
      </View>
    );
  };

  const renderCompletedOrders = () => {
    if (completedOrders.length === 0) {
      return (
        <View>
          <Text style={styles.emptyStateText}>
            No completed orders yet. Complete your active orders to see them here.
          </Text>
        </View>
      );
    }

    return (
      <View>
        {completedOrders.map((order, index) => (
          <View
            key={order.id}
            style={[
              styles.orderDetailsBox,
              index === completedOrders.length - 1 && styles.orderDetailsBoxLast,
            ]}>
            <View style={styles.routeContainer}>
              <View style={styles.routeItem}>
                <View style={styles.routeIcon}>
                  <Ionicons name="location" size={16} color="#FFFFFF" />
                </View>
                <Text style={styles.routeAddress}>{order.pickupAddress}</Text>
              </View>
              <View style={styles.routeLine} />
              <View style={styles.routeItem}>
                <View style={styles.routeIcon}>
                  <Ionicons name="star" size={16} color="#FFFFFF" />
                </View>
                <Text style={styles.routeAddress}>{order.deliveryAddress}</Text>
              </View>
            </View>
            <View style={styles.orderInfo}>
              <View style={styles.infoItem}>
                <View style={styles.currencyIconContainer}>
                  <Feather name="dollar-sign" size={14} color="#7A7A7A" />
                </View>
                <Text style={styles.price}>{order.price}</Text>
              </View>
              <View style={styles.infoItem}>
                <Feather name="clock" size={14} color="#7A7A7A" />
                <Text style={styles.infoText}>{order.time}</Text>
              </View>
              <View style={styles.infoItem}>
                <Feather name="maximize-2" size={14} color="#7A7A7A" />
                <Text style={styles.infoText}>{order.distance}</Text>
              </View>
            </View>
            <View style={styles.deliveredStatusButton}>
              <Text style={styles.deliveredStatusButtonText}>Delivered</Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Orders</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <Pressable
          style={[styles.tab, activeTab === 'active' && styles.tabActive]}
          onPress={() => setActiveTab('active')}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'active' && styles.tabTextActive,
            ]}>
            Active
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'available' && styles.tabActive]}
          onPress={() => setActiveTab('available')}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'available' && styles.tabTextActive,
            ]}>
            Available
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'completed' && styles.tabActive]}
          onPress={() => setActiveTab('completed')}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'completed' && styles.tabTextActive,
            ]}>
            Completed
          </Text>
        </Pressable>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {activeTab === 'active' && renderActiveOrders()}
        {activeTab === 'available' && renderAvailableOrders()}
        {activeTab === 'completed' && renderCompletedOrders()}
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
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F1F1F',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: '#FFD700',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4F4F4F',
  },
  tabTextActive: {
    color: '#1F1F1F',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  orderDetailsBox: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  orderDetailsBoxLast: {
    marginBottom: 0,
  },
  routeContainer: {
    marginBottom: 16,
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  routeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2DBE7E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: '#E0E0E0',
    marginLeft: 15,
    marginBottom: 8,
    borderStyle: 'dashed',
  },
  routeAddress: {
    fontSize: 14,
    fontWeight: '400',
    color: '#1F1F1F',
    flex: 1,
  },
  orderActions: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  timeButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#4F4F4F',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },
  timeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4F4F4F',
  },
  deliveredButton: {
    flex: 1,
    backgroundColor: '#2DBE7E',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  deliveredButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F1F1F',
  },
  orderInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  currencyIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F2F2F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#7A7A7A',
  },
  infoText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#7A7A7A',
  },
  pickOrderButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickOrderButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F1F1F',
  },
  pickOrderButtonDisabled: {
    backgroundColor: '#E0E0E0',
    opacity: 0.6,
  },
  deliveredStatusButton: {
    backgroundColor: '#A5D6A7',
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deliveredStatusButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#7A7A7A',
    textAlign: 'center',
    lineHeight: 20,
    paddingVertical: 40,
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
