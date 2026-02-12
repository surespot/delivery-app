import {
  useChatWebSocket,
  useConversationByOrder,
  useMarkAsRead,
  useMessages,
  useSendMessage,
  type Message,
} from '@/src/api/chat';
import { Order } from '@/src/api/orders/types';
import { calculateDistance, formatPrice } from '@/src/api/orders/utils';
import { useAuthStore } from '@/store/auth-store';
import { useOrdersStore } from '@/store/orders-store';
import { Feather } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import Svg, { Path } from 'react-native-svg';

type TabType = 'details' | 'route' | 'chat';

const BowlIcon = () => (
  <Svg width={168} height={168} viewBox="0 0 168 168" fill="none">
    <Path
      opacity="0.2"
      d="M147 73.5C147.004 85.566 143.543 97.3793 137.028 107.535C130.513 117.691 121.219 125.763 110.25 130.791V136.5C110.25 137.892 109.697 139.228 108.712 140.212C107.728 141.197 106.392 141.75 105 141.75H63C61.6076 141.75 60.2723 141.197 59.2877 140.212C58.3031 139.228 57.75 137.892 57.75 136.5V130.791C46.7813 125.763 37.487 117.691 30.9722 107.535C24.4574 97.3793 20.9962 85.566 21 73.5H147Z"
      fill="#F2D69C"
    />
    <Path
      d="M147 68.2499H141.507C140.188 53.91 133.559 40.5803 122.92 30.8752C112.281 21.1702 98.4004 15.79 84 15.79C69.5996 15.79 55.7187 21.1702 45.0799 30.8752C34.441 40.5803 27.812 53.91 26.4928 68.2499H21C19.6076 68.2499 18.2723 68.803 17.2877 69.7876C16.3031 70.7721 15.75 72.1075 15.75 73.4999C15.7731 85.9852 19.209 98.2266 25.6864 108.9C32.1637 119.574 41.4358 128.274 52.5 134.059V136.5C52.5 139.285 53.6063 141.955 55.5754 143.924C57.5445 145.894 60.2152 147 63 147H105C107.785 147 110.455 145.894 112.425 143.924C114.394 141.955 115.5 139.285 115.5 136.5V134.059C126.564 128.274 135.836 119.574 142.314 108.9C148.791 98.2266 152.227 85.9852 152.25 73.4999C152.25 72.1075 151.697 70.7721 150.712 69.7876C149.728 68.803 148.392 68.2499 147 68.2499ZM113.846 36.9008C115.049 37.8852 116.202 38.9242 117.305 40.018C103.329 44.9343 91.7799 55.0383 85.05 68.2367H65.6906C68.9719 59.0389 75.0129 51.0785 82.9883 45.4429C90.9636 39.8072 100.484 36.7713 110.25 36.7499C111.451 36.7499 112.652 36.8089 113.846 36.9008ZM124.287 48.8446C127.913 54.742 130.188 61.369 130.948 68.2499H97.2038C103.569 58.7007 113.198 51.8011 124.287 48.8446ZM84 26.2499C88.2129 26.2527 92.4065 26.8199 96.4688 27.9364C86.5753 30.3906 77.5037 35.4094 70.1681 42.4869C62.8325 49.5645 57.4921 58.4507 54.6853 68.2499H37.0519C38.3542 56.7055 43.8593 46.0441 52.5178 38.2982C61.1762 30.5523 72.3824 26.2637 84 26.2499ZM108.058 126C107.142 126.421 106.367 127.096 105.825 127.946C105.282 128.795 104.996 129.783 105 130.791V136.5H63V130.791C63.0038 129.783 62.7175 128.795 62.1753 127.946C61.633 127.096 60.8577 126.421 59.9419 126C50.7092 121.751 42.7565 115.149 36.8819 106.855C31.0074 98.562 27.4177 88.8692 26.4731 78.7499H141.507C140.564 88.8671 136.978 98.5585 131.107 106.852C125.236 115.145 117.287 121.749 108.058 126Z"
      fill="#E6C384"
    />
  </Svg>
);

const formatTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes.toString().padStart(2, '0');
  return `${displayHours}:${displayMinutes} ${ampm}`;
};

export default function DeliveryDetailsScreen() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const [activeTab, setActiveTab] = useState<TabType>('details');
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');

  const { currentOrders, availableOrders, completedOrders } = useOrdersStore();
  const { user } = useAuthStore();

  // Chat API hooks
  const {
    data: conversationData,
    isLoading: isLoadingConversation,
  } = useConversationByOrder(orderId, !!order && (order.status === 'out-for-delivery' || order.status === 'delivered'));

  const conversationId = conversationData?.data?.id;
  const conversation = conversationData?.data;

  const {
    data: messagesData,
    isLoading: isLoadingMessages,
    refetch: refetchMessages,
  } = useMessages(conversationId, undefined, 50, !!conversationId);

  const sendMessageMutation = useSendMessage();
  const markAsReadMutation = useMarkAsRead();

  // Get customer info from conversation
  const customerParticipant = conversation?.participants.find((p) => p.role === 'user');
  const customer = customerParticipant?.user;
  
  // Get rider info from conversation to identify own messages
  const riderParticipant = conversation?.participants.find((p) => p.role === 'rider');
  const riderId = riderParticipant?.userId;

  const dashAnimations = useRef<Animated.Value[]>(
    Array.from({ length: 15 }, () => new Animated.Value(0))
  ).current;

  const chatScrollViewRef = useRef<ScrollView>(null);
  const dashAnimationRefs = useRef<Animated.CompositeAnimation[]>([]);

  // Format messages from API
  const messages: Message[] = messagesData?.data?.messages || [];
  const sortedMessages = [...messages].reverse(); // Reverse to show oldest first

  // Unread messages: customer messages that are not read
  const hasUnreadMessages =
    !!conversationId &&
    messages.some(
      (msg) => !msg.isRead && msg.sender?._id !== riderId
    );

  // Find order from store
  useEffect(() => {
    if (!orderId) {
      setIsLoading(false);
      return;
    }

    // Search in current orders
    const foundOrder =
      currentOrders.find((o) => o.id === orderId)?.fullOrder ||
      availableOrders.find((o) => o.id === orderId)?.fullOrder ||
      completedOrders.find((o) => o.id === orderId)?.fullOrder;

    if (foundOrder) {
      setOrder(foundOrder);
      setIsLoading(false);
    } else {
      setIsLoading(false);
      Alert.alert('Error', 'Order not found');
    }
  }, [orderId, currentOrders, availableOrders, completedOrders]);

  // Dash animation effect
  useEffect(() => {
    dashAnimationRefs.current = dashAnimations.map((anim) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: false,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: false,
          }),
        ])
      );
    });

    dashAnimationRefs.current.forEach((anim, index) => {
      setTimeout(() => anim.start(), index * 25);
    });

    return () => {
      dashAnimationRefs.current.forEach((anim) => anim.stop());
    };
  }, [dashAnimations]);

  // Stop dash animations when delivery is complete
  useEffect(() => {
    if (order?.status === 'delivered' || order?.status === 'cancelled') {
      dashAnimationRefs.current.forEach((anim) => {
        anim.stop();
      });
      dashAnimations.forEach((anim) => {
        anim.setValue(1);
      });
    }
  }, [order?.status, dashAnimations]);

  const AnimatedDash = ({ index }: { index: number }) => {
    const backgroundColor = dashAnimations[index].interpolate({
      inputRange: [0, 1],
      outputRange: ['#E0E0E0', '#FFFFFF'],
    });

    return (
      <Animated.View
        style={[
          styles.dash,
          {
            backgroundColor,
          },
        ]}
      />
    );
  };

  const handleCallCustomer = () => {
    const phone = order?.deliveryAddress?.contactPhone;
    if (phone) {
      Linking.openURL(`tel:${phone}`).catch((err) => {
        console.error('Failed to start call:', err);
      });
    }
  };

  // Mark conversation as read when opened
  useEffect(() => {
    if (conversationId && activeTab === 'chat') {
      markAsReadMutation.mutate(conversationId);
    }
  }, [conversationId, activeTab]);

  // Chat WebSocket: join conversation room and refetch on new messages
  useChatWebSocket(conversationId, !!conversationId && activeTab === 'chat', {
    onNewMessage: () => {
      refetchMessages();
    },
  });

  // Scroll chat to bottom when opening chat tab or when messages change
  useEffect(() => {
    if (activeTab === 'chat' && sortedMessages.length > 0) {
      setTimeout(() => {
        chatScrollViewRef.current?.scrollToEnd({ animated: false });
      }, 0);
    }
  }, [activeTab, sortedMessages.length]);

  const formatMessageTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    return `${displayHours}:${displayMinutes}${ampm}`;
  };

  const handleOpenMaps = () => {
    if (!order) return;

    const pickup = order.pickupLocation;
    const delivery = order.deliveryAddress.coordinates;

    // Open Google Maps with directions from pickup to delivery
    const url = `https://www.google.com/maps/dir/?api=1&origin=${pickup.latitude},${pickup.longitude}&destination=${delivery.latitude},${delivery.longitude}&travelmode=driving`;

    Linking.openURL(url).catch((err) => {
      console.error('Failed to open maps:', err);
      Alert.alert('Error', 'Failed to open maps. Please try again.');
    });
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !order || order.status !== 'out-for-delivery') return;

    try {
      await sendMessageMutation.mutateAsync({
        orderId: order.id,
        content: message.trim(),
      });
      setMessage('');
      refetchMessages();
      setTimeout(() => {
        chatScrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.error?.message || 'Failed to send message');
    }
  };

  const distance = order
    ? calculateDistance(
        order.pickupLocation.latitude,
        order.pickupLocation.longitude,
        order.deliveryAddress.coordinates.latitude,
        order.deliveryAddress.coordinates.longitude
      )
    : 0;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Feather name="chevron-left" size={20} color="#1f1f1f" />
          </Pressable>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFD700" />
          <Text style={styles.loadingText}>Loading order details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Feather name="chevron-left" size={20} color="#1f1f1f" />
          </Pressable>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={48} color="#FF6B6B" />
          <Text style={styles.errorText}>Order not found</Text>
          <Pressable style={styles.retryButton} onPress={() => router.back()}>
            <Text style={styles.retryButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const isActive = order.status === 'ready' || order.status === 'out-for-delivery';
  const canChat = order.status === 'out-for-delivery' || order.status === 'delivered';
  const isReadOnly = order.status === 'delivered';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={() => {
            if (activeTab === 'chat') {
              setActiveTab('details');
            } else {
              router.back();
            }
          }}
          style={styles.backButton}>
          <Feather name="chevron-left" size={20} color="#1f1f1f" />
        </Pressable>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* SVG Icon - Hide on chat tab */}
        {activeTab !== 'chat' && (
          <View style={styles.iconContainer}>
            <BowlIcon />
          </View>
        )}

        {/* Animated Progress Bar */}
        <View
          style={[
            styles.loaderContainer,
            activeTab === 'chat' && styles.loaderContainerChat,
          ]}>
          <View style={styles.loaderIcon}>
            <Feather name="package" size={20} color="#1f1f1f" />
          </View>
          <View style={styles.dashedLine}>
            {dashAnimations.map((_, index) => (
              <AnimatedDash key={index} index={index} />
            ))}
          </View>
          <View style={styles.loaderIcon}>
            <Feather
              name={order.status === 'cancelled' ? 'x' : 'check'}
              size={20}
              color="#1f1f1f"
            />
          </View>
        </View>

        {/* Order Details Card - Grey Background */}
        <View style={styles.detailsCard}>
          {/* Show details only when details tab is active */}
          {activeTab === 'details' && (
            <>
              <View style={styles.instructionHeader}>
                <Text style={styles.instructionText}>
                  Show order information at pickup site to receive package
                </Text>
                <Text style={styles.instructionSubtext}>
                  Make sure to call customer upon arrival.
                </Text>
              </View>

              <View style={styles.detailsSection}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Order No</Text>
                  <Text style={styles.detailValue}>{order.orderNumber}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Fee</Text>
                  <Text style={styles.detailValue}>{formatPrice(order.deliveryFee)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Distance</Text>
                  <Text style={styles.detailValue}>{distance.toFixed(1)} KM</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Time Ordered</Text>
                  <Text style={styles.detailValue}>{formatTime(order.createdAt)}</Text>
                </View>
                {order.assignedAt && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Time Accepted</Text>
                    <Text style={styles.detailValue}>{formatTime(order.assignedAt)}</Text>
                  </View>
                )}
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Pickup Address</Text>
                  <Text style={styles.detailValue}>{order.pickupLocation.address}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Delivery Address</Text>
                  <Text style={styles.detailValue}>{order.deliveryAddress.address}</Text>
                </View>
                {order.deliveryAddress.contactPhone && (
                  <View style={[styles.detailRow, styles.recipientContactRow]}>
                    <Text style={styles.recipientContactLabel}>Recipient Contact</Text>
                    <View style={styles.phoneRow}>
                      <Text style={styles.detailValue}>
                        {order.deliveryAddress.contactPhone}
                      </Text>
                      <Pressable onPress={handleCallCustomer} style={styles.callButton}>
                        <Feather name="phone" size={20} color="#1F1F1F" />
                      </Pressable>
                    </View>
                  </View>
                )}
              </View>
            </>
          )}

          {/* Chat Section */}
          {activeTab === 'chat' && (
            <KeyboardAvoidingView
              style={styles.chatContainer}
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
              {/* Recipient Info Card */}
              {customer && (
                <View style={styles.recipientCard}>
                  {customer.avatar ? (
                    <Image source={{ uri: customer.avatar }} style={styles.recipientAvatar} />
                  ) : (
                    <View style={styles.recipientAvatarPlaceholder}>
                      <Text style={styles.recipientAvatarText}>
                        {customer.firstName?.[0] || ''}{customer.lastName?.[0] || ''}
                      </Text>
                    </View>
                  )}
                  <View style={styles.recipientInfo}>
                    <Text style={styles.recipientName}>
                      {customer.firstName} {customer.lastName}
                    </Text>
                    <Text style={styles.recipientRole}>Recipient</Text>
                  </View>
                  <Pressable style={styles.infoButton}>
                    <Feather name="info" size={18} color="#1F1F1F" />
                  </Pressable>
                </View>
              )}

              {/* Encryption Message */}
              <Text style={styles.encryptionMessage}>
                Your chat with the customer is fully encrypted and would be cleared once the delivery is completed
              </Text>

              {/* Messages */}
              {isLoadingMessages ? (
                <View style={styles.messagesLoadingContainer}>
                  <ActivityIndicator size="small" color="#7A7A7A" />
                </View>
              ) : (
                <ScrollView
                  ref={chatScrollViewRef}
                  style={styles.messagesContainer}
                  contentContainerStyle={styles.messagesContent}
                  showsVerticalScrollIndicator={false}>
                  {sortedMessages.map((msg) => {
                    const isRider = msg.sender?._id === riderId;
                    return (
                      <View key={msg.id} style={styles.messageWrapper}>
                        <View
                          style={[
                            styles.messageBubble,
                            isRider ? styles.riderBubble : styles.customerBubble,
                          ]}>
                          <Text
                            style={[
                              styles.messageText,
                              isRider ? styles.riderMessageText : styles.customerMessageText,
                            ]}>
                            {msg.content}
                          </Text>
                        </View>
                        <Text
                          style={[
                            styles.messageTime,
                            isRider ? styles.riderMessageTime : styles.customerMessageTime,
                          ]}>
                          {formatMessageTime(msg.createdAt)}
                        </Text>
                      </View>
                    );
                  })}
                </ScrollView>
              )}

              {/* Message Input */}
              {!isReadOnly && (
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.messageInput}
                    placeholder="Type in a message"
                    placeholderTextColor="#9e9e9e"
                    value={message}
                    onChangeText={setMessage}
                    multiline
                    editable={!sendMessageMutation.isPending}
                  />
                  <Pressable
                    style={styles.sendButton}
                    onPress={handleSendMessage}
                    disabled={!message.trim() || sendMessageMutation.isPending}>
                    {sendMessageMutation.isPending ? (
                      <ActivityIndicator size="small" color="#7a7a7a" />
                    ) : (
                      <Feather
                        name="send"
                        size={18}
                        color={message.trim() ? '#1f1f1f' : '#7a7a7a'}
                      />
                    )}
                  </Pressable>
                </View>
              )}
            </KeyboardAvoidingView>
          )}

          {/* Bottom Tab Bar - Inside grey card (hidden on chat tab) */}
          {activeTab !== 'chat' && (
            <View style={styles.bottomTabBar}>
              <Pressable
                style={styles.tabButton}
                onPress={() => setActiveTab('details')}>
                <View
                  style={[
                    styles.tabIconContainer,
                    activeTab === 'details' && styles.tabIconContainerActive,
                  ]}>
                  <Feather
                    name="clock"
                    size={14}
                    color={activeTab === 'details' ? '#1F1F1F' : '#7A7A7A'}
                  />
                </View>
              </Pressable>
              <Pressable style={styles.tabButton} onPress={handleOpenMaps}>
                <View
                  style={[
                    styles.tabIconContainer,
                    activeTab === 'route' && styles.tabIconContainerActive,
                  ]}>
                  <Feather
                    name="map"
                    size={16}
                    color={activeTab === 'route' ? '#1F1F1F' : '#7A7A7A'}
                  />
                </View>
              </Pressable>
              <Pressable
                style={styles.tabButton}
                onPress={() => setActiveTab('chat')}>
                <View
                  style={[
                    styles.tabIconContainer,
                    activeTab === 'chat' && styles.tabIconContainerActive,
                  ]}>
                  <Feather
                    name="message-circle"
                    size={14}
                    color={activeTab === 'chat' ? '#1F1F1F' : '#7A7A7A'}
                  />
                  {hasUnreadMessages && (
                    <View style={styles.chatBadge}>
                      <View style={styles.chatBadgeDot} />
                    </View>
                  )}
                </View>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBEA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#7a7a7a',
    fontWeight: '400',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#FF6B6B',
    fontWeight: '400',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 24,
    backgroundColor: '#FFD700',
    borderRadius: 26,
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f1f1f',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  iconContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 32,
  },
  loaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    paddingHorizontal: 24,
  },
  loaderContainerChat: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 16,
    marginHorizontal: 0,
  },
  loaderIcon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dashedLine: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginHorizontal: 16,
  },
  dash: {
    width: 8,
    height: 2,
    borderRadius: 1,
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  instructionHeader: {
    marginBottom: 20,
  },
  instructionText: {
    fontSize: 12,
    color: '#000000',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  instructionSubtext: {
    fontSize: 12,
    color: '#7A7A7A',
    fontWeight: '400',
    textAlign: 'center',
  },
  detailsSection: {
    gap: 16,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  detailLabel: {
    fontSize: 14,
    color: '#7A7A7A',
    fontWeight: '400',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#1F1F1F',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    justifyContent: 'flex-end',
  },
  copyButton: {
    padding: 4,
  },
  recipientContactRow: {
    marginTop: 24,
  },
  recipientContactLabel: {
    fontSize: 14,
    color: '#7A7A7A',
    fontWeight: '700',
  },
  chatContainer: {
    flex: 0,
  },
  recipientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  recipientAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  recipientAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  recipientAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F1F1F',
  },
  recipientInfo: {
    flex: 1,
  },
  recipientName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F1F1F',
    marginBottom: 2,
  },
  recipientRole: {
    fontSize: 12,
    color: '#7A7A7A',
    fontWeight: '400',
  },
  infoButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  encryptionMessage: {
    fontSize: 12,
    color: '#7A7A7A',
    fontWeight: '400',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  messagesLoadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  messagesContainer: {
    maxHeight: 300,
    flexGrow: 0,
    flexShrink: 0,
    overflow: 'scroll',
  },
  messagesContent: {
    paddingVertical: 16,
    gap: 8,
  },
  messageWrapper: {
    marginBottom: 8,
  },
  messageBubble: {
    borderRadius: 12,
    padding: 12,
    maxWidth: '80%',
  },
  riderBubble: {
    backgroundColor: '#2DBE7E',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  customerBubble: {
    backgroundColor: '#FFE88A',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  riderMessageText: {
    color: '#FFFFFF',
  },
  customerMessageText: {
    color: '#1F1F1F',
  },
  messageTime: {
    fontSize: 11,
    color: '#7a7a7a',
    fontWeight: '400',
    marginTop: 4,
  },
  riderMessageTime: {
    textAlign: 'right',
  },
  customerMessageTime: {
    textAlign: 'left',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 12,
  },
  messageInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1f1f1f',
    fontWeight: '400',
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomTabBar: {
    flexDirection: 'row',
    backgroundColor: '#F9F9F9',
    paddingVertical: 8,
    paddingHorizontal: 12,
    justifyContent: 'center',
    gap: 24,
    alignItems: 'center',
    borderRadius: 999,
    marginTop: 20,
    alignSelf: 'center',
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonActive: {},
  tabIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  tabIconContainerActive: {
    backgroundColor: '#F9D326',
  },
  chatBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatBadgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6B6B',
  },
});
