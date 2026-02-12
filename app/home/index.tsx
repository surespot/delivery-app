import { useGetCurrentRiderProfile } from '@/src/api/onboarding/hooks';
import {
  useAcceptOrder,
  useAssignedOrders,
  useEligibleOrders,
  useMarkOrderAsDelivered,
  useOrdersWebSocket,
} from '@/src/api/orders/hooks';
import { getErrorMessage } from '@/src/api/orders/utils';
import { useRiderLocationTracking } from '@/src/hooks/use-rider-location';
import { useAuthStore } from '@/store/auth-store';
import { useOrdersStore } from '@/store/orders-store';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
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

const CODE_LENGTH = 4;

export default function HomeScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const { isOnline, setIsOnline } = useAuthStore();
  const [activeNav, setActiveNav] = useState('home');
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [confirmationCode, setConfirmationCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const codeInputRef = useRef<TextInput>(null);
  const {
    currentOrders,
    availableOrders,
    setCurrentOrders,
    setAvailableOrders,
    markAsPickedUp,
  } = useOrdersStore();

  // API hooks
  const { data: activeOrdersData, isLoading: isLoadingActive, refetch: refetchActive } = useAssignedOrders(
    1,
    20,
    undefined, // Get all assigned orders (ready + out-for-delivery)
    isOnline
  );

  const { data: eligibleOrdersData, isLoading: isLoadingAvailable, refetch: refetchAvailable } = useEligibleOrders(
    1,
    20,
    'ready',
    isOnline
  );

  const acceptOrderMutation = useAcceptOrder();
  const markDeliveredMutation = useMarkOrderAsDelivered();

  // Get current rider profile for name and avatar
  const { data: riderProfileData } = useGetCurrentRiderProfile(isOnline);
  const riderName = riderProfileData?.data?.firstName || 'Rider';
  const { user } = useAuthStore();
  const avatarUrl = user?.avatar || riderProfileData?.data?.avatar || null;
  const initials = user
    ? `${(user.firstName?.[0] ?? '').toUpperCase()}${(user.lastName?.[0] ?? '').toUpperCase()}`
    : riderProfileData?.data
    ? `${(riderProfileData.data.firstName?.[0] ?? '').toUpperCase()}${(riderProfileData.data.lastName?.[0] ?? '').toUpperCase()}`
    : 'R';

  // WebSocket connection for real-time updates
  useOrdersWebSocket(isOnline, {
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
      // Filter to only show ready and out-for-delivery orders
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

  // Start location tracking when user is online
  useRiderLocationTracking();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000); // Reduced loading time since we're fetching real data

    return () => clearTimeout(timer);
  }, []);

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

  const handleNavPress = (key: string) => {
    setActiveNav(key);
    if (key === 'orders') {
      router.push('/home/orders' as any);
    } else if (key === 'wallet') {
      router.push('/home/wallet' as any);
    } else if (key === 'profile') {
      router.push('/home/profile' as any);
    }
    // Other navigation will be added when pages are created
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        {/* Header/Profile Section */}
        <View style={styles.header}>
          <View style={styles.avatarPlaceholder} />
          <View style={styles.headerTextContainer}>
            <View style={styles.headerLine1} />
            <View style={styles.headerLine2} />
          </View>
          <View style={styles.headerRightContainer}>
            <View style={styles.headerSmallLine} />
            <View style={styles.headerSmallSquare} />
          </View>
        </View>

        {/* First Content Block */}
        <View style={styles.contentSection}>
          <View style={styles.subtitleLine} />
          <View style={styles.largeBlock} />
        </View>

        {/* Second Content Block */}
        <View style={styles.contentSection}>
          <View style={styles.subtitleLine} />
          <View style={styles.contentRow}>
            <View style={styles.largeBlock} />
            <View style={styles.dotsContainer}>
              <View style={styles.dot} />
              <View style={styles.dot} />
              <View style={styles.dot} />
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.profileSection}>
            <View style={styles.avatar}>
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>{initials}</Text>
              )}
            </View>
            <Text style={styles.greeting}>Hello 👋, {riderName}</Text>
          </View>
          <Pressable style={styles.notificationButton}>
            <Feather name="bell" size={22} color="#1F1F1F" />
            <View style={styles.badge}>
              <Text style={styles.badgeText}>3</Text>
            </View>
          </Pressable>
        </View>

        {/* Online Toggle */}
        <View style={styles.toggleContainer}>
          <Pressable
            style={styles.toggle}
            onPress={() => setIsOnline(!isOnline)}>
            <View
              style={[
                styles.toggleTrack,
                !isOnline && styles.toggleTrackOffline,
              ]}>
              {!isOnline && (
                <View style={styles.toggleThumb} />
              )}
              <Text
                style={[
                  styles.toggleLabel,
                  !isOnline && styles.toggleLabelOffline,
                ]}>
                {isOnline ? 'Online' : 'Offline'}
              </Text>
              {isOnline && (
                <View style={styles.toggleThumb} />
              )}
            </View>
          </Pressable>
        </View>

        {/* Offline State */}
        {!isOnline && (
          <View style={styles.offlineContainer}>
            <View style={styles.offlineIconContainer}>
              <View style={styles.wifiIcon}>
                <Feather name="wifi" size={80} color="#E0E0E0" />
                <View style={styles.wifiCancelLine} />
              </View>
            </View>
            <Text style={styles.offlineText}>
              Go back online to see available orders and receive alerts.
            </Text>
          </View>
        )}

        {/* Current Orders */}
        {isOnline && (
          <View style={styles.section}>
          <View style={styles.sectionHeaderWithTabs}>
            <Text style={styles.sectionTitle}>Current Orders</Text>
            <View style={styles.tabsContainer}>
              {[1, 2, 3].map((index) => {
                const isActive = index <= currentOrders.length;
                return (
                  <View
                    key={index}
                    style={[
                      styles.tab,
                      isActive && styles.tabActive,
                    ]}
                  />
                );
              })}
            </View>
          </View>
          {isLoadingActive ? (
            <View style={styles.ordersContainer}>
              <ActivityIndicator size="large" color="#2DBE7E" />
              <Text style={styles.loadingText}>Loading active orders...</Text>
            </View>
          ) : currentOrders.length === 0 ? (
            <View style={styles.ordersContainer}>
              <Text style={styles.emptyStateText}>
                You do not have any current active orders. Accept any available orders(up to 3) to see them here.
              </Text>
            </View>
          ) : (
            <View style={styles.ordersContainer}>
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
          )}
        </View>
        )}

        {/* Available Orders */}
        {isOnline && (
          <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Available Orders</Text>
            {availableOrders.length > 0 && (
              <Pressable onPress={() => router.push('/home/available-orders' as any)}>
                <Text style={styles.seeAllLink}>see all</Text>
              </Pressable>
            )}
          </View>
          {isLoadingAvailable ? (
            <View style={styles.ordersContainer}>
              <ActivityIndicator size="large" color="#2DBE7E" />
              <Text style={styles.loadingText}>Loading available orders...</Text>
            </View>
          ) : availableOrders.length === 0 ? (
            <View style={styles.ordersContainer}>
              <Text style={styles.emptyStateText}>
                No available orders at the moment. Check back later!
              </Text>
            </View>
          ) : (
            <View style={styles.ordersContainer}>
              {availableOrders.slice(0, 3).map((order, index, array) => (
                <Pressable
                  key={order.id}
                  style={[
                    styles.orderDetailsBox,
                    index === array.length - 1 && styles.orderDetailsBoxLast,
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
          )}
        </View>
        )}
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
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 100, // Space for bottom navigation
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  // Loading skeleton styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    gap: 12,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#E0E0E0',
  },
  headerTextContainer: {
    flex: 1,
    gap: 8,
  },
  headerLine1: {
    height: 16,
    width: '60%',
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
  },
  headerLine2: {
    height: 14,
    width: '40%',
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
  },
  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerSmallLine: {
    height: 12,
    width: 24,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
  },
  headerSmallSquare: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#E0E0E0',
  },
  contentSection: {
    marginBottom: 24,
  },
  subtitleLine: {
    height: 14,
    width: '50%',
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 12,
  },
  largeBlock: {
    width: '100%',
    height: 180,
    backgroundColor: '#E0E0E0',
    borderRadius: 12,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dotsContainer: {
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
  },
  // Main content styles
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F1F1F',
  },
  greeting: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F1F1F',
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#D32F2F',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFBEA',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  toggleContainer: {
    marginBottom: 32,
  },
  toggle: {
    alignItems: 'center',
  },
  toggleTrack: {
    width: 100,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFD700',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  toggleThumb: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F1F1F',
  },
  toggleTrackOffline: {
    backgroundColor: '#E0E0E0',
  },
  toggleLabelOffline: {
    color: '#4F4F4F',
  },
  offlineContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 24,
  },
  offlineIconContainer: {
    marginBottom: 32,
  },
  wifiIcon: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wifiCancelLine: {
    position: 'absolute',
    width: 100,
    height: 4,
    backgroundColor: '#E0E0E0',
    transform: [{ rotate: '45deg' }],
  },
  offlineText: {
    fontSize: 14,
    color: '#7A7A7A',
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F1F1F',
  },
  seeAllLink: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F1F1F',
    textDecorationLine: 'underline',
  },
  ordersContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
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
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#2E2E2E',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
    elevation: 3,
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
  emptyStateText: {
    fontSize: 14,
    color: '#7A7A7A',
    textAlign: 'center',
    lineHeight: 20,
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#7A7A7A',
    textAlign: 'center',
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
  sectionHeaderWithTabs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  tab: {
    width: 32,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E0E0E0',
  },
  tabActive: {
    backgroundColor: '#4F4F4F',
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

