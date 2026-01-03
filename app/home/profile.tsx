import { useAuthStore } from '@/store/auth-store';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

const NAV_ITEMS = [
  { key: 'home', label: 'Home', icon: 'home' },
  { key: 'orders', label: 'Orders', icon: 'package' },
  { key: 'wallet', label: 'Wallet', icon: 'credit-card' },
  { key: 'profile', label: 'Profile', icon: 'user' },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { isOnline, setIsOnline } = useAuthStore();
  const [activeNav, setActiveNav] = useState('profile');

  const menuItems = [
    {
      id: '1',
      label: 'Account & Personal Information',
      icon: 'person' as const,
    },
    {
      id: '2',
      label: 'Settings',
      icon: 'settings' as const,
    },
    {
      id: '3',
      label: 'Support and Legal',
      icon: 'build' as const,
    },
    {
      id: '4',
      label: 'Rate Us',
      icon: 'star' as const,
    },
  ];

  const handleNavPress = (key: string) => {
    setActiveNav(key);
    if (key === 'home') {
      router.push('/home' as any);
    } else if (key === 'orders') {
      router.push('/home/orders' as any);
    } else if (key === 'wallet') {
      router.push('/home/wallet' as any);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* User Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              {/* Avatar placeholder - you can add an image here */}
            </View>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>Ayo Adedeji</Text>
            <Text style={styles.userRole}>surespot courier</Text>
          </View>
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

        {/* Today's Stats Section */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Today&apos;s Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Completed Orders</Text>
              <Text style={styles.statValue}>4</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Distance Covered</Text>
              <Text style={styles.statValue}>10.4 KM</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Time Online</Text>
              <Text style={styles.statValue}>6hrs</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Earnings</Text>
              <Text style={styles.statValue}>₦6,500</Text>
            </View>
          </View>
        </View>

        {/* Settings and Information List */}
        <View style={styles.menuSection}>
          <View style={styles.menuContainer}>
            {menuItems.map((item) => (
              <Pressable
                key={item.id}
                style={styles.menuItem}
                onPress={() => {
                  if (item.id === '1') {
                    router.push('/home/account-information' as any);
                  } else if (item.id === '2') {
                    router.push('/home/settings' as any);
                  } else if (item.id === '3') {
                    router.push('/home/support-legal' as any);
                  }
                }}>
                <View style={styles.menuItemLeft}>
                  <Ionicons name={item.icon} size={20} color="#4F4F4F" />
                  <Text style={styles.menuItemText}>{item.label}</Text>
                </View>
                <Feather name="chevron-right" size={20} color="#4F4F4F" />
              </Pressable>
            ))}
          </View>
        </View>

        {/* Logout Button */}
        <Pressable style={styles.logoutButton}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </Pressable>
      </ScrollView>

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
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1F1F1F',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    gap: 16,
  },
  avatarContainer: {
    marginRight: 8,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFEDB5',
    // Add image here if needed
  },
  profileInfo: {
    flex: 1,
    gap: 4,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F1F1F',
  },
  userRole: {
    fontSize: 14,
    fontWeight: '400',
    color: '#7A7A7A',
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
  statsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F1F1F',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: '47%',
    backgroundColor: '#F9F9F9',
    borderRadius: 16,
    padding: 16,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#7A7A7A',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F1F1F',
  },
  menuSection: {
    marginBottom: 24,
  },
  menuContainer: {
    backgroundColor: '#F9F9F9',
    borderRadius: 16,
    overflow: 'hidden',
    padding: 16,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4F4F4F',
  },
  logoutButton: {
    backgroundColor: '#FFE5EC',
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF5252',
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
});
