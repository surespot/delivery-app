import { Stack } from 'expo-router';

export default function HomeLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="available-orders"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="orders"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="wallet"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="profile"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="account-information"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="settings"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="login-settings"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="language-settings"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="support-legal"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="faq"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="contact-support"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="report-issue"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="support-account-verification"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="support-delivery-problems"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="support-earnings-payouts"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="support-recents"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}

