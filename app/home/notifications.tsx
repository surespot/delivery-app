import {
  useNotifications,
  useUnreadCount,
  useNotificationsWebSocket,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useDeleteAllNotifications,
} from '@/src/api/notifications';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Notification, NotificationType } from '@/src/api/notifications';

function formatNotificationDate(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}

function getNotificationIcon(type: NotificationType): keyof typeof Ionicons.glyphMap {
  switch (type) {
    case 'order_ready':
      return 'bicycle-outline';
    case 'payment_success':
      return 'wallet-outline';
    default:
      return 'notifications-outline';
  }
}

export default function NotificationsScreen() {
  const router = useRouter();

  const {
    data: notificationsData,
    isLoading,
    isRefetching,
    refetch,
  } = useNotifications(1, 20, undefined, undefined, true);
  const { data: unreadData, refetch: refetchUnread } = useUnreadCount(true);
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();
  const deleteAll = useDeleteAllNotifications();

  useNotificationsWebSocket(true, {
    onNotification: () => {
      refetch();
      refetchUnread();
    },
  });

  const notifications = notificationsData?.data?.notifications ?? [];
  const unreadCount = unreadData?.data?.unreadCount ?? 0;

  const handleNotificationPress = (item: Notification) => {
    if (!item.isRead) {
      markAsRead.mutate(item.id);
    }
    if (item.type === 'order_ready' && item.data?.orderId) {
      router.push(`/home/delivery-details?orderId=${item.data.orderId}` as any);
    }
  };

  const handleMarkAllRead = () => {
    if (unreadCount === 0) return;
    markAllAsRead.mutate();
  };

  const handleClearAll = () => {
    if (notifications.length === 0) return;
    Alert.alert(
      'Clear All',
      'Delete all notifications? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => deleteAll.mutate(),
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Notification }) => (
    <Pressable
      style={[styles.notificationRow, !item.isRead && styles.notificationRowUnread]}
      onPress={() => handleNotificationPress(item)}>
      <View style={styles.notificationIcon}>
        <Ionicons name={getNotificationIcon(item.type)} size={24} color="#2DBE7E" />
      </View>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.notificationMessage} numberOfLines={2}>
          {item.message}
        </Text>
        <Text style={styles.notificationTime}>{formatNotificationDate(item.createdAt)}</Text>
      </View>
      {!item.isRead && <View style={styles.unreadDot} />}
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Feather name="chevron-left" size={20} color="#1f1f1f" />
        </Pressable>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.headerSpacer} />
      </View>
      {notifications.length > 0 && (
        <View style={styles.actionsRow}>
          {unreadCount > 0 && (
            <Pressable
              style={styles.actionButton}
              onPress={handleMarkAllRead}
              disabled={markAllAsRead.isPending}>
              <Text style={styles.actionButtonText}>Mark all read</Text>
            </Pressable>
          )}
          <Pressable
            style={styles.actionButton}
            onPress={handleClearAll}
            disabled={deleteAll.isPending}>
            <Text style={styles.actionButtonText}>Clear all</Text>
          </Pressable>
        </View>
      )}

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2DBE7E" />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-off-outline" size={64} color="#E0E0E0" />
          <Text style={styles.emptyTitle}>No notifications</Text>
          <Text style={styles.emptyMessage}>
            Your notifications will appear here when you receive new orders or wallet updates.
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => {
                refetch();
                refetchUnread();
              }}
              tintColor="#2DBE7E"
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFBEA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginTop: 30,
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
  headerSpacer: {
    width: 40,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2DBE7E',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f1f1f',
    marginTop: 16,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#7A7A7A',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  notificationRowUnread: {
    backgroundColor: '#F0FFF4',
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F8EF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationContent: {
    flex: 1,
    marginLeft: 12,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f1f1f',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#4F4F4F',
    marginTop: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: '#7A7A7A',
    marginTop: 6,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2DBE7E',
    marginLeft: 8,
    marginTop: 6,
  },
});
