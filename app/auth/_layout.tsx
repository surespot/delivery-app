import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="login"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="identity-verification"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="forgot-password"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}

