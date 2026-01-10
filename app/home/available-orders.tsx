import { useOrdersStore } from '@/store/orders-store';
import { useEligibleOrders, useAcceptOrder, useOrdersWebSocket } from '@/src/api/orders/hooks';
import { getErrorMessage } from '@/src/api/orders/utils';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Modal,
    PanResponder,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SLIDER_WIDTH = SCREEN_WIDTH - 96; // Accounting for padding
const MIN_PRICE = 0;
const MAX_PRICE = 50000;

export default function AvailableOrdersScreen() {
  const router = useRouter();
  const { 
    availableOrders, 
    addCurrentOrder, 
    currentOrders, 
    setAvailableOrders,
    setError,
    clearError 
  } = useOrdersStore();
  
  // API hooks
  const { data: eligibleOrdersData, isLoading, error, refetch } = useEligibleOrders(1, 20, 'ready');
  const acceptOrderMutation = useAcceptOrder();
  
  // WebSocket connection for real-time updates
  useOrdersWebSocket(true, {
    onOrderReady: () => {
      // Refresh eligible orders when new order becomes ready
      refetch();
    },
    onError: (err) => {
      console.error('WebSocket error:', err);
    },
  });

  // Update store when API data changes
  useEffect(() => {
    if (eligibleOrdersData?.data?.orders) {
      setAvailableOrders(eligibleOrdersData.data.orders);
      clearError();
    }
  }, [eligibleOrdersData, setAvailableOrders, clearError]);

  // Handle API errors
  useEffect(() => {
    if (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to load available orders';
      setError(errorMessage);
    }
  }, [error, setError]);

  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedDistance, setSelectedDistance] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [minPriceValue, setMinPriceValue] = useState(700);
  const [maxPriceValue, setMaxPriceValue] = useState(1500);
  const [leftThumbPosition, setLeftThumbPosition] = useState(
    (700 / MAX_PRICE) * SLIDER_WIDTH
  );
  const [rightThumbPosition, setRightThumbPosition] = useState(
    (1500 / MAX_PRICE) * SLIDER_WIDTH
  );
  const [activeThumb, setActiveThumb] = useState<'left' | 'right' | null>(null);
  const sliderRef = useRef<View>(null);

  // Format price with currency symbol and commas
  const formatPrice = (value: number): string => {
    return `₦${value.toLocaleString('en-US')}`;
  };

  // Parse price from formatted string
  const parsePrice = (formatted: string): number => {
    const numeric = formatted.replace(/[₦,]/g, '');
    return parseInt(numeric) || 0;
  };

  // Convert price to slider position
  const priceToPosition = (price: number): number => {
    return (price / MAX_PRICE) * SLIDER_WIDTH;
  };

  // Convert slider position to price
  const positionToPrice = (position: number): number => {
    return Math.round((position / SLIDER_WIDTH) * MAX_PRICE);
  };

  // Update price values from slider positions
  const updatePricesFromSlider = useCallback((leftPos: number, rightPos: number) => {
    const newMin = Math.max(MIN_PRICE, Math.min(positionToPrice(leftPos), maxPriceValue - 100));
    const newMax = Math.min(MAX_PRICE, Math.max(positionToPrice(rightPos), minPriceValue + 100));
    
    setMinPriceValue(newMin);
    setMaxPriceValue(newMax);
  }, [minPriceValue, maxPriceValue]);

  // PanResponder for left thumb
  const leftThumbPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setActiveThumb('left');
      },
      onPanResponderMove: (evt, gestureState) => {
        const newPosition = leftThumbPosition + gestureState.dx;
        const clampedPosition = Math.max(0, Math.min(newPosition, rightThumbPosition - 24));
        setLeftThumbPosition(clampedPosition);
        const newPrice = positionToPrice(clampedPosition);
        setMinPriceValue(Math.max(MIN_PRICE, Math.min(newPrice, maxPriceValue - 100)));
      },
      onPanResponderRelease: () => {
        setActiveThumb(null);
      },
    })
  ).current;

  // PanResponder for right thumb
  const rightThumbPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setActiveThumb('right');
      },
      onPanResponderMove: (evt, gestureState) => {
        const newPosition = rightThumbPosition + gestureState.dx;
        const clampedPosition = Math.max(leftThumbPosition + 24, Math.min(newPosition, SLIDER_WIDTH));
        setRightThumbPosition(clampedPosition);
        const newPrice = positionToPrice(clampedPosition);
        setMaxPriceValue(Math.min(MAX_PRICE, Math.max(newPrice, minPriceValue + 100)));
      },
      onPanResponderRelease: () => {
        setActiveThumb(null);
      },
    })
  ).current;

  // Handle price input changes
  const handleMinPriceChange = (text: string) => {
    const parsed = parsePrice(text);
    const clamped = Math.max(MIN_PRICE, Math.min(parsed, maxPriceValue - 100));
    setMinPriceValue(clamped);
    setLeftThumbPosition(priceToPosition(clamped));
  };

  const handleMaxPriceChange = (text: string) => {
    const parsed = parsePrice(text);
    const clamped = Math.min(MAX_PRICE, Math.max(parsed, minPriceValue + 100));
    setMaxPriceValue(clamped);
    setRightThumbPosition(priceToPosition(clamped));
  };

  const handleApply = () => {
    // TODO: Apply filters to orders
    setShowFilterModal(false);
  };

  const handleAcceptOrder = async (orderId: string) => {
    if (currentOrders.length >= 3) {
      Alert.alert('Order Limit', 'You cannot accept more than 3 orders at once. Please deliver some orders first.');
      return;
    }

    try {
      clearError();
      await acceptOrderMutation.mutateAsync(orderId);
      // Success - the mutation will invalidate queries and update the store
      Alert.alert('Success', 'Order accepted successfully!');
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to accept order';
      const errorCode = err?.response?.data?.error?.code || '';
      
      if (errorCode === 'ORDER_ALREADY_ASSIGNED' || errorCode === 'MAX_ORDERS_REACHED') {
        // Refresh the list to get updated data
        refetch();
        Alert.alert('Order Unavailable', getErrorMessage(errorCode) || errorMessage);
      } else {
        Alert.alert('Error', getErrorMessage(errorCode) || errorMessage);
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Feather name="chevron-left" size={20} color="#1f1f1f" />
        </Pressable>
        <Text style={styles.headerTitle}>Available Orders</Text>
        <Pressable
          style={styles.filterButton}
          onPress={() => setShowFilterModal(true)}>
          <Feather name="filter" size={20} color="#1f1f1f" />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
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
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}>
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalOverlayPressable}
            onPress={() => setShowFilterModal(false)}
          />
          <View style={styles.modalContent}>
            <ScrollView
              style={styles.modalScrollView}
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator={false}>
              {/* Distance Section */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Distance</Text>
                <View style={styles.filterButtonsContainer}>
                  {['< 1KM', '< 2KM', '< 3KM', '< 5KM', '> 1KM', '> 2KM', '> 3KM', '> 5KM'].map(
                    (option) => (
                      <Pressable
                        key={option}
                        style={[
                          styles.filterButtonOption,
                          selectedDistance === option && styles.filterButtonOptionSelected,
                        ]}
                        onPress={() =>
                          setSelectedDistance(selectedDistance === option ? null : option)
                        }>
                        <Text
                          style={[
                            styles.filterButtonText,
                            selectedDistance === option && styles.filterButtonTextSelected,
                          ]}>
                          {option}
                        </Text>
                      </Pressable>
                    ),
                  )}
                </View>
              </View>

              {/* Time Ordered Section */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Time Ordered</Text>
                <View style={styles.filterButtonsContainer}>
                  {['< 5min', '< 10min', '< 15min', '> 5min', '> 10min'].map((option) => (
                    <Pressable
                      key={option}
                      style={[
                        styles.filterButtonOption,
                        selectedTime === option && styles.filterButtonOptionSelected,
                      ]}
                      onPress={() => setSelectedTime(selectedTime === option ? null : option)}>
                      <Text
                        style={[
                          styles.filterButtonText,
                          selectedTime === option && styles.filterButtonTextSelected,
                        ]}>
                        {option}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Price Range Section */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Price Range</Text>
                <View style={styles.sliderContainer}>
                  <View ref={sliderRef} style={styles.sliderTrack}>
                    <View
                      style={[
                        styles.sliderActiveTrack,
                        {
                          left: leftThumbPosition,
                          width: rightThumbPosition - leftThumbPosition,
                        },
                      ]}
                    />
                    <View
                      style={[
                        styles.sliderThumb,
                        { left: leftThumbPosition - 12 },
                        activeThumb === 'left' && styles.sliderThumbActive,
                      ]}
                      {...leftThumbPanResponder.panHandlers}>
                      <View style={styles.sliderThumbInner} />
                    </View>
                    <View
                      style={[
                        styles.sliderThumb,
                        { left: rightThumbPosition - 12 },
                        activeThumb === 'right' && styles.sliderThumbActive,
                      ]}
                      {...rightThumbPanResponder.panHandlers}>
                      <View style={styles.sliderThumbInner} />
                    </View>
                  </View>
                </View>
                <View style={styles.priceInputsContainer}>
                  <View style={styles.priceInputWrapper}>
                    <Text style={styles.priceInputLabel}>MIN</Text>
                    <TextInput
                      style={styles.priceInput}
                      value={formatPrice(minPriceValue)}
                      onChangeText={handleMinPriceChange}
                      placeholder="₦700"
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.priceInputWrapper}>
                    <Text style={styles.priceInputLabel}>MAX</Text>
                    <TextInput
                      style={styles.priceInput}
                      value={formatPrice(maxPriceValue)}
                      onChangeText={handleMaxPriceChange}
                      placeholder="₦1,500"
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              </View>
            </ScrollView>

            {/* Apply Button */}
            <View style={styles.modalFooter}>
              <Pressable style={styles.applyButton} onPress={handleApply}>
                <Text style={styles.applyButtonText}>Apply</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f1f1f',
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  ordersContainer: {
    gap: 16,
  },
  orderDetailsBox: {
    backgroundColor: '#F9F9F9',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
  },
  orderDetailsBoxLast: {
    marginBottom: 0,
  },
  routeContainer: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  routeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2DBE7E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: '#2DBE7E',
    marginLeft: 16,
    marginVertical: 4,
    borderStyle: 'dashed',
  },
  routeAddress: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F1F1F',
    flex: 1,
  },
  orderInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    alignItems: 'center',
    justifyContent: 'center',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalOverlayPressable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    minHeight: 400,
  },
  modalScrollView: {
    flex: 1,
  },
  modalScrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  filterSection: {
    marginBottom: 32,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F1F1F',
    marginBottom: 16,
  },
  filterButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  filterButtonOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#E0E0E0',
  },
  filterButtonOptionSelected: {
    backgroundColor: '#FFD700',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F1F1F',
  },
  filterButtonTextSelected: {
    color: '#1F1F1F',
  },
  sliderContainer: {
    marginBottom: 24,
  },
  sliderTrack: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    position: 'relative',
    marginVertical: 20,
  },
  sliderActiveTrack: {
    position: 'absolute',
    height: 4,
    backgroundColor: '#FFD700',
    borderRadius: 2,
    top: 0,
  },
  sliderThumb: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFD700',
    top: -10,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  sliderThumbActive: {
    transform: [{ scale: 1.2 }],
  },
  sliderThumbInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
  },
  priceInputsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  priceInputWrapper: {
    flex: 1,
  },
  priceInputLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1F1F1F',
    marginBottom: 8,
  },
  priceInput: {
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1F1F1F',
  },
  modalFooter: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  applyButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F1F1F',
  },
});

