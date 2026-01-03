import { ReportStatus, useSupportStore } from '@/store/support-store';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type FilterTab = 'All' | 'Pending' | 'Resolved';

const FILTER_TABS: FilterTab[] = ['All', 'Pending', 'Resolved'];

export default function SupportRecentsScreen() {
  const router = useRouter();
  const { reports } = useSupportStore();
  const [activeTab, setActiveTab] = useState<FilterTab>('All');

  const filteredReports = reports.filter((report) => {
    if (activeTab === 'All') return true;
    return report.status === activeTab;
  });

  const getStatusStyle = (status: ReportStatus) => {
    switch (status) {
      case 'Pending':
        return { bg: '#FFF3C4', text: '#FF9800' };
      case 'In Progress':
        return { bg: '#E3F2FD', text: '#1976D2' };
      case 'Resolved':
        return { bg: '#E8F5E9', text: '#2DBE7E' };
      default:
        return { bg: '#F5F5F5', text: '#757575' };
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
        showsVerticalScrollIndicator={false}>
        {filteredReports.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              No {activeTab === 'All' ? '' : activeTab.toLowerCase()} reports found
            </Text>
          </View>
        ) : (
          filteredReports.map((report) => {
            const statusStyle = getStatusStyle(report.status);
            return (
              <View key={report.id} style={styles.reportCard}>
                <View style={styles.reportInfo}>
                  <Text style={styles.reportTitle}>{report.title}</Text>
                  <Text style={styles.reportDate}>{report.date}</Text>
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
                    {report.status}
                  </Text>
                </View>
              </View>
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#9e9e9e',
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
