import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.code}>404</Text>
      <Text style={styles.title}>Page not found</Text>
      <Text style={styles.subtitle}>This screen doesn't exist.</Text>
      <Pressable style={styles.button} onPress={() => router.replace('/home' as any)}>
        <Text style={styles.buttonText}>Go home</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBEA',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  code: {
    fontSize: 72,
    fontWeight: '800',
    color: '#FFD700',
    lineHeight: 80,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f1f1f',
    marginTop: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7b7b7b',
    marginTop: 8,
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 25,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f1f1f',
  },
});
