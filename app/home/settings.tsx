import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';

interface SettingToggle {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  defaultValue: boolean;
}

const notificationToggles: SettingToggle[] = [
  { id: 'orderAlerts', label: 'Order Alerts', icon: 'newspaper-outline', defaultValue: true },
  { id: 'messageNotifications', label: 'Message Notifications', icon: 'chatbubble-outline', defaultValue: true },
  { id: 'appActivity', label: 'App Activity', icon: 'megaphone-outline', defaultValue: false },
  { id: 'securityAlerts', label: 'Security Alerts', icon: 'shield-outline', defaultValue: true },
];

const channelToggles: SettingToggle[] = [
  { id: 'pushNotifications', label: 'Push Notifications', icon: 'phone-portrait-outline', defaultValue: true },
  { id: 'emailNotifications', label: 'Email Notifications', icon: 'mail-outline', defaultValue: true },
  { id: 'smsNotifications', label: 'SMS Notifications', icon: 'chatbox-outline', defaultValue: true },
];

export default function SettingsScreen() {
  const router = useRouter();

  // Toggle states
  const [toggles, setToggles] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    [...notificationToggles, ...channelToggles].forEach((t) => {
      initial[t.id] = t.defaultValue;
    });
    return initial;
  });

  const handleToggle = (id: string) => {
    setToggles((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderToggleItem = (item: SettingToggle) => (
    <View key={item.id} style={styles.toggleRow}>
      <View style={styles.toggleLeft}>
        <Ionicons name={item.icon} size={20} color="#4F4F4F" />
        <Text style={styles.toggleLabel}>{item.label}</Text>
      </View>
      <Switch
        value={toggles[item.id]}
        onValueChange={() => handleToggle(item.id)}
        trackColor={{ false: '#E0E0E0', true: '#FFD700' }}
        thumbColor="#FFFFFF"
        ios_backgroundColor="#E0E0E0"
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Feather name="chevron-left" size={20} color="#1f1f1f" />
        </Pressable>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Navigation Items */}
        <View style={styles.section}>
          <Pressable
            style={styles.navRow}
            onPress={() => router.push('/home/login-settings' as any)}>
            <View style={styles.navLeft}>
              <Ionicons name="key-outline" size={20} color="#4F4F4F" />
              <Text style={styles.navLabel}>Login Settings</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#7A7A7A" />
          </Pressable>

          <Pressable
            style={styles.navRow}
            onPress={() => router.push('/home/language-settings' as any)}>
            <View style={styles.navLeft}>
              <Ionicons name="globe-outline" size={20} color="#4F4F4F" />
              <Text style={styles.navLabel}>Language Settings</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#7A7A7A" />
          </Pressable>
        </View>

        {/* Notification Toggles */}
        <View style={styles.section}>
          {notificationToggles.map(renderToggleItem)}
        </View>

        {/* Channel Toggles */}
        <View style={styles.section}>
          {channelToggles.map(renderToggleItem)}
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
    paddingTop: 24,
    paddingBottom: 40,
  },
  section: {
    backgroundColor: '#F9F9F9',
    borderRadius: 16,
    padding: 8,
    marginBottom: 24,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  navLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  navLabel: {
    fontSize: 16,
    fontWeight: '400',
    color: '#1f1f1f',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '400',
    color: '#1f1f1f',
  },
});
