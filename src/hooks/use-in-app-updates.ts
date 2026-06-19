import { useEffect } from 'react';
import { Alert, AppState, Linking, NativeModules, Platform } from 'react-native';

const IOS_APP_STORE_ID = '6767889551';

export function useInAppUpdates() {
  useEffect(() => {
    const checkForUpdate = async () => {
      if (!NativeModules.RNDeviceInfo) return;

      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { default: SpInAppUpdates, IAUUpdateKind } = require('sp-react-native-in-app-updates');
        const inAppUpdates = new SpInAppUpdates(false);
        const result = await inAppUpdates.checkNeedsUpdate(
          Platform.OS === 'ios' ? { country: 'ng' } : undefined
        );

        if (!result.shouldUpdate) return;

        if (Platform.OS === 'android') {
          await inAppUpdates.startUpdate({
            updateType: IAUUpdateKind.FLEXIBLE,
          });
        } else {
          Alert.alert(
            'Update Available',
            'A new version of Surespot Riders is available on the App Store.',
            [
              { text: 'Later', style: 'cancel' },
              {
                text: 'Update',
                onPress: () =>
                  Linking.openURL(`https://apps.apple.com/app/id${IOS_APP_STORE_ID}`),
              },
            ]
          );
        }
      } catch {
        // Silent fail — never block the app over an update check
      }
    };

    checkForUpdate();

    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        checkForUpdate();
      }
    });

    return () => subscription.remove();
  }, []);
}
