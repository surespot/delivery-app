import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'Surespot Riders',
  slug: 'surespot-riders-app',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/splash-icon.jpg',
  scheme: 'surespotriders',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.surespot.riders',
    infoPlist: {
      UIBackgroundModes: ['location', 'remote-notification'],
    },
  },
  android: {
    package: 'com.surespot.riders',
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/images/android-icon-foreground.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    permissions: [
      'android.permission.ACCESS_COARSE_LOCATION',
      'android.permission.ACCESS_FINE_LOCATION',
      'android.permission.ACCESS_BACKGROUND_LOCATION',
      'android.permission.FOREGROUND_SERVICE',
      'android.permission.FOREGROUND_SERVICE_LOCATION',
    ],
  },
  web: {
    output: 'static',
    favicon: './assets/images/splash-icon-favicon.jpg',
  },
  plugins: [
    'expo-router',
    "expo-secure-store",
    [
      'expo-splash-screen',
      {
        image: './assets/images/splash-icon.jpg',
        imageWidth: 200,
        resizeMode: 'contain',
        backgroundColor: '#FFFBF2',
        dark: {
          backgroundColor: '#FFFBF2',
        },
      },
    ],
    [
      'expo-image-picker',
      {
        photosPermission:
          'Allow Surespot Riders to access your photos to attach images to support tickets.',
      },
    ],
    [
      'expo-location',
      {
        locationAlwaysAndWhenInUsePermission:
          'Allow Surespot Riders to use your location to match you with nearby delivery requests and provide real-time tracking.',
        locationAlwaysPermission:
          "Allow Surespot Riders to use your location in the background to keep your position updated while you're on a delivery.",
      },
    ],
    'expo-updates',
    [
      'expo-notifications',
      {
        icon: './assets/images/icon.png',
        color: '#FFD700',
        defaultChannel: 'default',
      },
    ],
  ],
  updates: {
    url: 'https://u.expo.dev/95760113-fb70-4d67-b904-76df4faad074',
    enabled: true,
    checkAutomatically: 'ON_LOAD',
    fallbackToCacheTimeout: 0,
  },
  runtimeVersion: {
    policy: 'appVersion',
  },
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    router: {},
    eas: {
      projectId: '95760113-fb70-4d67-b904-76df4faad074',
    },
  },
  owner: 'surespot-eatery',
};

export default config;
