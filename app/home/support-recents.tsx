import { useSupportRequests } from '@/src/api/support';
import { getStatusDisplay } from '@/src/api/support/utils';
import type { SupportStatus } from '@/src/api/support/types';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type FilterTab = 'All' | 'Pending' | 'In Progress' | 'Resolved' | 'Closed';

const FILTER_TABS: FilterTab[] = ['All', 'Pending', 'In Progress', 'Resolved', 'Closed'];

const TAB_TO_API_STATUS: Record<FilterTab, string | undefined> = {
  All: undefined,
  Pending: 'pending',
  'In Progress': 'in_progress',
  Resolved: 'resolved',
  Closed: 'closed',
};

export default function SupportRecentsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<FilterTab>('All');
  const apiStatus = TAB_TO_API_STATUS[activeTab];

  const { data, isLoading, isError, error, refetch, isRefetching } = useSupportRequests(
    1,
    50,
    apiStatus,
    true
  );

  const requests = data?.data?.requests ?? [];
  const isRefreshing = isRefetching && !isLoading;

  const getStatusStyle = (status: SupportStatus | string) => {
    const display = getStatusDisplay(status);
    switch (display) {
      case 'Pending':
        return { bg: '#FFF3C4', text: '#FF9800' };
      case 'In Progress':
        return { bg: '#E3F2FD', text: '#1976D2' };
      case 'Resolved':
        return { bg: '#E8F5E9', text: '#2DBE7E' };
      case 'Closed':
        return { bg: '#F5F5F5', text: '#757575' };
      default:
        return { bg: '#F5F5F5', text: '#757575' };
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const day = d.getDate();
      const suffix =
        day === 1 || day === 21 || day === 31
          ? 'st'
          : day === 2 || day === 22
            ? 'nd'
            : day === 3 || day === 23
              ? 'rd'
              : 'th';
      return `${months[d.getMonth()]} ${day}${suffix}, ${d.getFullYear()}`;
    } catch {
      return isoString;
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Feather name="chevron-left" size={20} color="#1f1f1f" />
        </Pressable>
        <Text style={styles.headerTitle}>Recents</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabsContainer}>
        {FILTER_TABS.map((tab) => (
          <Pressable
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}>
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.tabTextActive,
              ]}>
              {tab}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => refetch()}
            colors={['#FFD700']}
            tintColor="#FFD700"
          />
        }>
        {isLoading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator size="large" color="#FFD700" />
            <Text style={styles.loadingText}>Loading requests...</Text>
          </View>
        ) : isError ? (
          <View style={styles.emptyState}>
            <Text style={styles.errorStateText}>
              {error instanceof Error ? error.message : 'Failed to load requests'}
            </Text>
          </View>
        ) : requests.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              No {activeTab === 'All' ? '' : activeTab.toLowerCase()} reports found
            </Text>
          </View>
        ) : (
          requests.map((request) => {
            const statusStyle = getStatusStyle(request.status);
            const title = request.title ?? request.description?.slice(0, 60) ?? 'Support Request';
            return (
              <Pressable
                key={request.id}
                style={styles.reportCard}
                onPress={() => router.push(`/home/support-request-details?id=${request.id}` as any)}>
                <View style={styles.reportInfo}>
                  <Text style={styles.reportTitle}>{title}</Text>
                  <Text style={styles.reportDate}>{formatDate(request.createdAt)}</Text>
                </View>
                <View
                  style={[
                    styles.reportStatusBadge,
                    { backgroundColor: statusStyle.bg },
                  ]}>
                  <Text
                    style={[
                      styles.reportStatusText,
                      { color: statusStyle.text },
                    ]}>
                    {getStatusDisplay(request.status)}
                  </Text>
                </View>
              </Pressable>
            );
          })
        )}
      </ScrollView>
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
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 16,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F2F2F2',
  },
  tabActive: {
    backgroundColor: '#FFE88A',
    borderColor: '#FFE88A',
  },
  tabText: {
    fontSize: 14,
    color: '#7A7A7A',
  },
  tabTextActive: {
    color: '#1f1f1f',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  loadingState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#7A7A7A',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#9e9e9e',
    textAlign: 'center',
  },
  errorStateText: {
    fontSize: 14,
    color: '#D32F2F',
    textAlign: 'center',
  },
  reportCard: {
    backgroundColor: '#FFFDF7',
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FFF3C4',
    position: 'relative',
  },
  reportInfo: {
    gap: 4,
    paddingVertical: 16,
    paddingLeft: 16,
    paddingRight: 100,
  },
  reportTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f1f1f',
  },
  reportDate: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  reportStatusBadge: {
    position: 'absolute',
    right: 0,
    top: 8,
    // bottom: 0,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  reportStatusText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
