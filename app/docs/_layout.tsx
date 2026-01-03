import { Stack } from 'expo-router';

export default function DocsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="privacy-policy"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="terms-and-conditions"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="registration-code"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}

