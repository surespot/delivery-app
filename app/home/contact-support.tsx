import { useAuthStore } from '@/store/auth-store';
import { useSupportStore } from '@/store/support-store';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type SupportCategory = {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const SUPPORT_CATEGORIES: SupportCategory[] = [
  { id: 'account', label: 'Account and\nVerification', icon: 'person-circle-outline' },
  { id: 'delivery', label: 'Delivery\nProblems', icon: 'bicycle-outline' },
  { id: 'earnings', label: 'Earnings and\nPayouts', icon: 'card-outline' },
];

export default function ContactSupportScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { reports } = useSupportStore();

  const userName = user?.firstName || 'User';

  const getStatusStyle = (status: string) => {
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

  const handleCategoryPress = (categoryId: string) => {
    if (categoryId === 'account') {
      router.push('/home/support-account-verification' as any);
    } else if (categoryId === 'delivery') {
      router.push('/home/support-delivery-problems' as any);
    } else if (categoryId === 'earnings') {
      router.push('/home/support-earnings-payouts' as any);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Feather name="chevron-left" size={20} color="#1f1f1f" />
        </Pressable>
        <Text style={styles.headerTitle}>Contact Support</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Greeting Section */}
        <View style={styles.greetingSection}>
          <View style={styles.greetingContent}>
            <Image
              source={require('@/assets/app/support-icon.png')}
              style={styles.supportIcon}
              resizeMode="contain"
            />
            <View style={styles.greetingText}>
              <Text style={styles.greetingTitle}>
                Hi There, {userName} 👋
              </Text>
              <Text style={styles.greetingSubtitle}>
                What can we help you with?
              </Text>
            </View>
          </View>
        </View>

        {/* Support Categories Card */}
        <View style={styles.categoriesCard}>
          <View style={styles.categoriesContainer}>
            {SUPPORT_CATEGORIES.map((category) => (
              <Pressable
                key={category.id}
                style={styles.categoryItem}
                onPress={() => handleCategoryPress(category.id)}>
                <View style={styles.categoryIconContainer}>
                  <Ionicons name={category.icon} size={24} color="#FFD700" />
                </View>
                <Text style={styles.categoryLabel}>{category.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Recents Section */}
        <View style={styles.recentsSection}>
          <View style={styles.recentsHeader}>
            <Text style={styles.recentsTitle}>Recents</Text>
            <Pressable onPress={() => router.push('/home/support-recents' as any)}>
              <Text style={styles.seeAllText}>See all</Text>
            </Pressable>
          </View>
          {reports.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                You have currently not made any complaints
              </Text>
            </View>
          ) : (
            reports.slice(0, 3).map((report) => {
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
        </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 40,
  },
  greetingSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  greetingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  supportIcon: {
    width: 80,
    height: 80,
  },
  greetingText: {
    flex: 1,
    gap: 4,
  },
  greetingTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f1f1f',
  },
  greetingSubtitle: {
    fontSize: 14,
    color: '#4f4f4f',
  },
  categoriesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  categoriesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  categoryItem: {
    alignItems: 'center',
    width: '30%',
    gap: 8,
  },
  categoryIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#FFF9C4',
    borderWidth: 1,
    borderColor: '#FFD700',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryLabel: {
    fontSize: 12,
    color: '#1f1f1f',
    textAlign: 'center',
    lineHeight: 16,
  },
  recentsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  recentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  recentsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f1f1f',
  },
  seeAllText: {
    fontSize: 14,
    color: '#4f4f4f',
    textDecorationLine: 'underline',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
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
    top: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    justifyContent: 'center',
  },
  reportStatusText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
