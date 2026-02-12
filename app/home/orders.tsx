import { useOrdersStore } from '@/store/orders-store';
import { 
  useAssignedOrders, 
  useEligibleOrders, 
  useAcceptOrder, 
  useMarkOrderAsDelivered,
  useOrdersWebSocket,
} from '@/src/api/orders/hooks';
import { getErrorMessage } from '@/src/api/orders/utils';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
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

const NAV_ITEMS = [
  { key: 'home', label: 'Home', icon: 'home' },
  { key: 'orders', label: 'Orders', icon: 'package' },
  { key: 'wallet', label: 'Wallet', icon: 'credit-card' },
  { key: 'profile', label: 'Profile', icon: 'user' },
];

type TabType = 'active' | 'available' | 'completed';
const CODE_LENGTH = 4;

export default function OrdersScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [activeNav, setActiveNav] = useState('orders');
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [confirmationCode, setConfirmationCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const codeInputRef = useRef<TextInput>(null);
  
  const {
    currentOrders,
    availableOrders,
    completedOrders,
    setCurrentOrders,
    setAvailableOrders,
    setCompletedOrders,
    markAsPickedUp,
  } = useOrdersStore();

  // API hooks for different tabs
  const { data: activeOrdersData, isLoading: isLoadingActive, refetch: refetchActive } = useAssignedOrders(
    1, 
    20, 
    undefined, // Get all assigned orders (ready + out-for-delivery)
    activeTab === 'active'
  );
  
  const { data: eligibleOrdersData, isLoading: isLoadingAvailable, refetch: refetchAvailable } = useEligibleOrders(
    1, 
    20, 
    'ready',
    activeTab === 'available'
  );
  
  const { data: completedOrdersData, isLoading: isLoadingCompleted, refetch: refetchCompleted } = useAssignedOrders(
    1, 
    20, 
    'delivered',
    activeTab === 'completed'
  );

  const acceptOrderMutation = useAcceptOrder();
  const markDeliveredMutation = useMarkOrderAsDelivered();

  // WebSocket connection for real-time updates
  useOrdersWebSocket(true, {
    onOrderReady: () => {
      // Refresh eligible orders when new order becomes ready
      refetchAvailable();
    },
    onOrderPickedUp: ({ orderId }) => {
      // Update order status when admin marks as picked up
      markAsPickedUp(orderId);
      refetchActive();
    },
    onError: (err) => {
      console.error('WebSocket error:', err);
    },
  });

  // Update store when API data changes
  useEffect(() => {
    if (activeOrdersData?.data?.orders) {
      // Filter to only show ready and out-for-delivery orders in active tab
      const activeOrders = activeOrdersData.data.orders.filter(
        order => order.status === 'ready' || order.status === 'out-for-delivery'
      );
      setCurrentOrders(activeOrders);
    }
  }, [activeOrdersData, setCurrentOrders]);

  useEffect(() => {
    if (eligibleOrdersData?.data?.orders) {
      setAvailableOrders(eligibleOrdersData.data.orders);
    }
  }, [eligibleOrdersData, setAvailableOrders]);

  useEffect(() => {
    if (completedOrdersData?.data?.orders) {
      setCompletedOrders(completedOrdersData.data.orders);
    }
  }, [completedOrdersData, setCompletedOrders]);

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

  const handleAcceptOrder = async (orderId: string) => {
    if (currentOrders.length >= 3) {
      Alert.alert('Order Limit', 'You cannot accept more than 3 orders at once. Please deliver some orders first.');
      return;
    }

    try {
      await acceptOrderMutation.mutateAsync(orderId);
      Alert.alert('Success', 'Order accepted successfully!');
      refetchActive();
      refetchAvailable();
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to accept order';
      const errorCode = err?.response?.data?.error?.code || '';
      
      if (errorCode === 'ORDER_ALREADY_ASSIGNED' || errorCode === 'MAX_ORDERS_REACHED') {
        refetchAvailable();
        Alert.alert('Order Unavailable', getErrorMessage(errorCode) || errorMessage);
      } else {
        Alert.alert('Error', getErrorMessage(errorCode) || errorMessage);
      }
    }
  };

  const handleMarkAsDelivered = (orderId: string) => {
    setSelectedOrderId(orderId);
    setConfirmationCode('');
    setCodeError('');
    setShowConfirmationModal(true);
  };

  const handleConfirmDelivery = async () => {
    if (!selectedOrderId) return;

    // Validate code format
    if (!/^[0-9]{4}$/.test(confirmationCode)) {
      setCodeError('Code must be exactly 4 digits');
      return;
    }

    try {
      await markDeliveredMutation.mutateAsync({
        orderId: selectedOrderId,
        data: { confirmationCode },
      });
      setShowConfirmationModal(false);
      Alert.alert('Success', 'Order marked as delivered!');
      refetchActive();
      refetchCompleted();
    } catch (err: any) {
      const errorCode = err?.response?.data?.error?.code || '';
      
      if (errorCode === 'INVALID_CONFIRMATION_CODE') {
        setCodeError('Invalid code. Please verify with customer.');
        setConfirmationCode('');
      } else {
        const errorMessage = err?.message || 'Failed to mark order as delivered';
        setCodeError(getErrorMessage(errorCode) || errorMessage);
      }
    }
  };

  const handleCodeChange = (value: string) => {
    const sanitized = value.replace(/[^0-9]/g, '').slice(0, CODE_LENGTH);
    setConfirmationCode(sanitized);
    setCodeError('');
  };

  const focusConfirmationInput = () => {
    codeInputRef.current?.focus();
    setTimeout(() => codeInputRef.current?.focus(), 120);
    setTimeout(() => codeInputRef.current?.focus(), 320);
  };

  const renderActiveOrders = () => {
    if (isLoadingActive) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2DBE7E" />
          <Text style={styles.loadingText}>Loading active orders...</Text>
        </View>
      );
    }

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
          <Pressable
            key={order.id}
            style={[
              styles.orderDetailsBox,
              index === currentOrders.length - 1 && styles.orderDetailsBoxLast,
            ]}
            onPress={() => router.push(`/home/delivery-details?orderId=${order.id}` as any)}>
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
              {order.fullOrder?.status === 'ready' && (
                <View style={styles.pickupStatusPill}>
                  <Feather name="clock" size={16} color="#4F4F4F" />
                  <Text style={styles.pickupStatusText}>
                    Waiting for pickup confirmation
                  </Text>
                </View>
              )}
              {order.fullOrder?.status === 'out-for-delivery' && (
                <Pressable
                  style={[
                    styles.deliveredButton,
                    markDeliveredMutation.isPending && styles.deliveredButtonDisabled,
                  ]}
                  onPress={() => handleMarkAsDelivered(order.id)}
                  disabled={markDeliveredMutation.isPending}>
                  {markDeliveredMutation.isPending ? (
                    <ActivityIndicator size="small" color="#1F1F1F" />
                  ) : (
                    <>
                      <Text style={styles.deliveredButtonText}>Mark as delivered</Text>
                      <Ionicons name="checkmark" size={18} color="#1F1F1F" />
                    </>
                  )}
                </Pressable>
              )}
            </View>
          </Pressable>
        ))}
      </View>
    );
  };

  const renderAvailableOrders = () => {
    if (isLoadingAvailable) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2DBE7E" />
          <Text style={styles.loadingText}>Loading available orders...</Text>
        </View>
      );
    }

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
          <Pressable
            key={order.id}
            style={[
              styles.orderDetailsBox,
              index === availableOrders.length - 1 && styles.orderDetailsBoxLast,
            ]}
            onPress={() => router.push(`/home/delivery-details?orderId=${order.id}` as any)}>
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
                (currentOrders.length >= 3 || acceptOrderMutation.isPending) && styles.pickOrderButtonDisabled,
              ]}
              onPress={() => handleAcceptOrder(order.id)}
              disabled={currentOrders.length >= 3 || acceptOrderMutation.isPending}>
              {acceptOrderMutation.isPending ? (
                <ActivityIndicator size="small" color="#1F1F1F" />
              ) : (
                <Text style={styles.pickOrderButtonText}>Pick Order</Text>
              )}
            </Pressable>
          </Pressable>
        ))}
      </View>
    );
  };

  const renderCompletedOrders = () => {
    if (isLoadingCompleted) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2DBE7E" />
          <Text style={styles.loadingText}>Loading completed orders...</Text>
        </View>
      );
    }

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
          <Pressable
            key={order.id}
            style={[
              styles.orderDetailsBox,
              index === completedOrders.length - 1 && styles.orderDetailsBoxLast,
            ]}
            onPress={() => router.push(`/home/delivery-details?orderId=${order.id}` as any)}>
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
          </Pressable>
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

      {/* Confirmation Code Modal */}
      <Modal
        visible={showConfirmationModal}
        transparent
        animationType="fade"
        onShow={focusConfirmationInput}
        onRequestClose={() => setShowConfirmationModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Delivery Confirmation</Text>
            <Text style={styles.modalDescription}>
              Ask customer for their 4-digit confirmation code
            </Text>

            <TextInput
              ref={codeInputRef}
              value={confirmationCode}
              onChangeText={handleCodeChange}
              keyboardType="number-pad"
              showSoftInputOnFocus
              maxLength={CODE_LENGTH}
              style={styles.codeInput}
              autoFocus
            />

            {codeError ? <Text style={styles.codeErrorText}>{codeError}</Text> : null}

            <View style={styles.modalButtons}>
              <Pressable
                style={styles.modalCancelButton}
                onPress={() => setShowConfirmationModal(false)}>
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.modalConfirmButton,
                  (confirmationCode.length !== CODE_LENGTH || markDeliveredMutation.isPending) &&
                    styles.modalConfirmButtonDisabled,
                ]}
                onPress={handleConfirmDelivery}
                disabled={confirmationCode.length !== CODE_LENGTH || markDeliveredMutation.isPending}>
                {markDeliveredMutation.isPending ? (
                  <ActivityIndicator size="small" color="#1F1F1F" />
                ) : (
                  <Text style={styles.modalConfirmButtonText}>Confirm Delivery</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#7A7A7A',
  },
  deliveredButtonDisabled: {
    opacity: 0.6,
  },
  pickupStatusPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#F2F2F2',
    gap: 6,
  },
  pickupStatusText: {
    fontSize: 12,
    color: '#4F4F4F',
    fontWeight: '500',
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
  // Confirmation Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F1F1F',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 14,
    color: '#7A7A7A',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 20,
  },
  codeBoxRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16,
  },
  codeBox: {
    width: 56,
    height: 64,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d9d9d9',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeBoxFilled: {
    borderColor: '#bfbfbf',
  },
  codeBoxActive: {
    borderColor: '#FFD700',
  },
  codeBoxText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1f1f1f',
  },
  codeErrorText: {
    color: '#D32F2F',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 16,
  },
  codeInput: {
    alignSelf: 'center',
    width: 220,
    paddingBottom: 8,
    marginBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#D9D9D9',
    textAlign: 'center',
    fontSize: 28,
    letterSpacing: 12,
    fontFamily: 'monospace',
    color: '#1F1F1F',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 999,
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
  },
  modalCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4F4F4F',
  },
  modalConfirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 999,
    backgroundColor: '#2DBE7E',
    alignItems: 'center',
  },
  modalConfirmButtonDisabled: {
    backgroundColor: '#E0E0E0',
    opacity: 0.6,
  },
  modalConfirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F1F1F',
  },
});
