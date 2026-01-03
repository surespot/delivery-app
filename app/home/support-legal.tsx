import { useAuthStore } from '@/store/auth-store';
import { Feather, Ionicons } from '@expo/vector-icons';
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
import Svg, { Path } from 'react-native-svg';

interface MenuItem {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  target?: string;
}

const menuItems: MenuItem[] = [
  { id: 'faq', label: 'FAQ', icon: 'help-circle-outline', target: '/home/faq' },
  { id: 'report', label: 'Report an Issue', icon: 'warning-outline', target: '/home/report-issue' },
  { id: 'contact', label: 'Contact Support', icon: 'chatbubble-ellipses-outline', target: '/home/contact-support' },
  { id: 'terms', label: 'Terms and Conditions', icon: 'document-text-outline', target: '/docs/terms-and-conditions' },
  { id: 'privacy', label: 'Privacy Policy', icon: 'shield-checkmark-outline', target: '/docs/privacy-policy' },
];

const WarningBadgeIcon = () => (
  <Svg width={160} height={160} viewBox="0 0 266 266" fill="none">
    <Path
      d="M234.683 106.836C230.765 102.742 226.713 98.5239 225.186 94.8145C223.773 91.4167 223.689 85.785 223.606 80.3299C223.45 70.1887 223.284 58.6966 215.294 50.7062C207.303 42.7159 195.811 42.5496 185.67 42.3937C180.215 42.3106 174.583 42.2275 171.186 40.8144C167.486 39.287 163.257 35.2346 159.164 31.3173C151.994 24.4284 143.848 16.625 133 16.625C122.152 16.625 114.016 24.4284 106.836 31.3173C102.742 35.2346 98.5239 39.287 94.8145 40.8144C91.4375 42.2275 85.785 42.3106 80.3299 42.3937C70.1887 42.5496 58.6966 42.7159 50.7062 50.7062C42.7159 58.6966 42.6016 70.1887 42.3937 80.3299C42.3106 85.785 42.2275 91.4167 40.8144 94.8145C39.287 98.5135 35.2346 102.742 31.3173 106.836C24.4284 114.006 16.625 122.152 16.625 133C16.625 143.848 24.4284 151.984 31.3173 159.164C35.2346 163.257 39.287 167.476 40.8144 171.186C42.2275 174.583 42.3106 180.215 42.3937 185.67C42.5496 195.811 42.7159 207.303 50.7062 215.294C58.6966 223.284 70.1887 223.45 80.3299 223.606C85.785 223.689 91.4167 223.773 94.8145 225.186C98.5135 226.713 102.742 230.765 106.836 234.683C114.006 241.572 122.152 249.375 133 249.375C143.848 249.375 151.984 241.572 159.164 234.683C163.257 230.765 167.476 226.713 171.186 225.186C174.583 223.773 180.215 223.689 185.67 223.606C195.811 223.45 207.303 223.284 215.294 215.294C223.284 207.303 223.45 195.811 223.606 185.67C223.689 180.215 223.773 174.583 225.186 171.186C226.713 167.486 230.765 163.257 234.683 159.164C241.572 151.994 249.375 143.848 249.375 133C249.375 122.152 241.572 114.016 234.683 106.836ZM124.688 83.125C124.688 80.9204 125.563 78.8061 127.122 77.2472C128.681 75.6883 130.795 74.8125 133 74.8125C135.205 74.8125 137.319 75.6883 138.878 77.2472C140.437 78.8061 141.312 80.9204 141.312 83.125V141.312C141.312 143.517 140.437 145.631 138.878 147.19C137.319 148.749 135.205 149.625 133 149.625C130.795 149.625 128.681 148.749 127.122 147.19C125.563 145.631 124.688 143.517 124.688 141.312V83.125ZM133 191.188C130.534 191.188 128.123 190.456 126.073 189.086C124.022 187.716 122.424 185.769 121.48 183.49C120.537 181.212 120.29 178.705 120.771 176.286C121.252 173.868 122.439 171.646 124.183 169.902C125.927 168.158 128.149 166.971 130.567 166.49C132.986 166.008 135.493 166.255 137.772 167.199C140.05 168.143 141.997 169.741 143.367 171.791C144.737 173.842 145.469 176.253 145.469 178.719C145.469 182.026 144.155 185.197 141.817 187.535C139.478 189.874 136.307 191.188 133 191.188Z"
      fill="#E63946"
    />
  </Svg>
);

export default function SupportLegalScreen() {
  const router = useRouter();
  const { setAuthenticated } = useAuthStore();
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);

  const handlePress = (item: MenuItem) => {
    if (item.target) {
      router.push(item.target as any);
    }
  };

  const handleDeactivateAccount = () => {
    setShowDeactivateConfirm(true);
  };

  const handleConfirmDeactivate = () => {
    // Log out the user
    setAuthenticated(false);
    // Navigate to home page with carousel
    router.replace('/' as any);
  };

  const handleCancelDeactivate = () => {
    setShowDeactivateConfirm(false);
  };

  const renderMenuItem = (item: MenuItem) => (
    <Pressable
      key={item.id}
      style={styles.menuItem}
      onPress={() => handlePress(item)}>
      <View style={styles.menuItemLeft}>
        <Ionicons name={item.icon} size={20} color="#4F4F4F" />
        <Text style={styles.menuItemText}>{item.label}</Text>
      </View>
      <Feather name="chevron-right" size={20} color="#7A7A7A" />
    </Pressable>
  );

  // Show deactivation confirmation screen
  if (showDeactivateConfirm) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.deactivateContainer}>
          <View style={styles.deactivateIconContainer}>
            <WarningBadgeIcon />
          </View>

          <Text style={styles.deactivateTitle}>
            You are about to request a deactivation of your account.{'\n'}
            Are you sure you want to continue?
          </Text>

          <View style={styles.deactivateInfoSection}>
            <Text style={styles.deactivateInfoTitle}>
              Once your account is deactivated:
            </Text>
            <View style={styles.bulletList}>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>
                  You will no longer be able to receive delivery requests
                </Text>
              </View>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>
                  Your earnings and delivery history will no longer be accessible
                </Text>
              </View>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>
                  You cannot reactivate the account
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.deactivateButtons}>
            <Pressable
              style={styles.confirmDeactivateButton}
              onPress={handleConfirmDeactivate}>
              <Text style={styles.confirmDeactivateButtonText}>
                Yes, Deactivate My Account
              </Text>
            </Pressable>
            <Pressable
              style={styles.cancelDeactivateButton}
              onPress={handleCancelDeactivate}>
              <Text style={styles.cancelDeactivateButtonText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Feather name="chevron-left" size={20} color="#1f1f1f" />
        </Pressable>
        <Text style={styles.headerTitle}>Support and Legal</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* All Options in One Block */}
        <View style={styles.section}>
          {menuItems.map(renderMenuItem)}
        </View>

        {/* Deactivate Account Button */}
        <Pressable style={styles.deactivateButton} onPress={handleDeactivateAccount}>
          <Ionicons name="warning" size={20} color="#FF5252" />
          <Text style={styles.deactivateButtonText}>Deactivate Account</Text>
        </Pressable>
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
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#1f1f1f',
  },
  deactivateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFE5EC',
    borderRadius: 999,
    paddingVertical: 16,
    gap: 8,
  },
  deactivateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF5252',
  },
  // Deactivation confirmation styles
  deactivateContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  deactivateIconContainer: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 40,
  },
  deactivateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f1f1f',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 32,
  },
  deactivateInfoSection: {
    marginBottom: 40,
  },
  deactivateInfoTitle: {
    fontSize: 14,
    color: '#1f1f1f',
    marginBottom: 16,
  },
  bulletList: {
    gap: 12,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bulletDot: {
    fontSize: 14,
    color: '#1f1f1f',
    lineHeight: 20,
  },
  bulletText: {
    fontSize: 14,
    color: '#1f1f1f',
    flex: 1,
    lineHeight: 20,
  },
  deactivateButtons: {
    gap: 12,
    marginTop: 'auto',
    paddingBottom: 40,
  },
  confirmDeactivateButton: {
    backgroundColor: '#E63946',
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmDeactivateButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cancelDeactivateButton: {
    backgroundColor: '#F2F2F2',
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelDeactivateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f1f1f',
  },
});
