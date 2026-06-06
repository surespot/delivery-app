import { useEffect } from 'react';
import { Alert, AppState, Linking, Platform } from 'react-native';
import SpInAppUpdates, { IAUUpdateKind } from 'sp-react-native-in-app-updates';

const IOS_APP_STORE_ID = '6767889551';

const inAppUpdates = new SpInAppUpdates(false);

export function useInAppUpdates() {
  useEffect(() => {
    const checkForUpdate = async () => {
      try {
        const result = await inAppUpdates.checkNeedsUpdate(
          Platform.OS === 'ios' ? { country: 'ng' } : undefined
        );

        if (!result.shouldUpdate) return;

        if (Platform.OS === 'android') {
          await inAppUpdates.startUpdateFlow({
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
                  Linking.openURL(
                    `https://apps.apple.com/app/id${IOS_APP_STORE_ID}`
                  ),
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
