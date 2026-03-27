import { useSupportRequest } from '@/src/api/support';
import { getStatusDisplay } from '@/src/api/support/utils';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function SupportRequestDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isLoading, isError, error } = useSupportRequest(id ?? null, !!id);

  const request = data?.data;

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

  const getStatusStyle = (status: string) => {
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

  if (!id) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Feather name="chevron-left" size={20} color="#1f1f1f" />
          </Pressable>
          <Text style={styles.headerTitle}>Request Details</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>Invalid request ID</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Feather name="chevron-left" size={20} color="#1f1f1f" />
        </Pressable>
        <Text style={styles.headerTitle}>Request Details</Text>
        <View style={styles.headerSpacer} />
      </View>

      {isLoading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color="#FFD700" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : isError || !request ? (
        <View style={styles.emptyState}>
          <Text style={styles.errorStateText}>
            {error instanceof Error ? error.message : 'Failed to load request'}
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusStyle(request.status).bg },
              ]}>
              <Text
                style={[
                  styles.statusText,
                  { color: getStatusStyle(request.status).text },
                ]}>
                {getStatusDisplay(request.status)}
              </Text>
            </View>
            <Text style={styles.dateText}>{formatDate(request.createdAt)}</Text>
          </View>

          {(request.title || request.description) && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Description</Text>
              <Text style={styles.bodyText}>
                {request.title ? `${request.title}\n\n` : ''}
                {request.description}
              </Text>
            </View>
          )}

          {request.stepsToReproduce && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Steps to Reproduce</Text>
              <Text style={styles.bodyText}>{request.stepsToReproduce}</Text>
            </View>
          )}

          {request.areaAffected && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Area Affected</Text>
              <Text style={styles.bodyText}>{request.areaAffected}</Text>
            </View>
          )}

          {request.orderId && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Related Order</Text>
              <Text style={styles.bodyText}>{request.orderId}</Text>
            </View>
          )}

          {request.attachments && request.attachments.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Attachments</Text>
              {request.attachments.map((url, i) => (
                <Text key={i} style={styles.bodyText}>
                  {url}
                </Text>
              ))}
            </View>
          )}
        </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#7A7A7A',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#9E9E9E',
    textAlign: 'center',
  },
  errorStateText: {
    fontSize: 14,
    color: '#D32F2F',
    textAlign: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  dateText: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7A7A7A',
    marginBottom: 8,
  },
  bodyText: {
    fontSize: 14,
    color: '#1f1f1f',
    lineHeight: 22,
  },
});
