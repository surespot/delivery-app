import { useAuthStore } from '@/store/auth-store';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

export default function LoginScreen() {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { setAuthenticated } = useAuthStore();

  // Mock credentials
  const MOCK_PHONE = '+2348181234269';
  const MOCK_PASSWORD = 'Sup3rSecret!';

  const handleLogin = () => {
    if (emailOrPhone && password) {
      // Validate mock credentials
      const normalizedPhone = emailOrPhone.trim().replace(/\s/g, '');
      if (normalizedPhone === MOCK_PHONE && password === MOCK_PASSWORD) {
        setAuthenticated(true);
        // Navigate to home screen
        router.replace('/home' as any);
      } else {
        setError('Invalid phone number or password');
      }
    }
  };

  const handleForgotPassword = () => {
    // TODO: Navigate to forgot password screen
    console.log('Forgot password');
  };

  const handleSignup = () => {
    router.push('/auth/identity-verification');
  };

  const isFormValid = emailOrPhone.trim().length > 0 && password.trim().length > 0;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Login</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              placeholder="enter your email or phone number"
              placeholderTextColor="#9E9E9E"
              value={emailOrPhone}
              onChangeText={setEmailOrPhone}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="enter password"
                placeholderTextColor="#9E9E9E"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <Pressable
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color="#7A7A7A"
                />
              </Pressable>
            </View>
          </View>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <Pressable
          style={[styles.continueButton, !isFormValid && styles.continueButtonDisabled]}
          onPress={handleLogin}
          disabled={!isFormValid}>
          <Text style={styles.continueButtonText}>Continue</Text>
        </Pressable>

        <Pressable style={styles.forgotPasswordContainer} onPress={handleForgotPassword}>
          <Text style={styles.forgotPasswordText}>forgot password?</Text>
        </Pressable>

        <View style={styles.spacer} />
      </ScrollView>

      <View style={styles.signupContainer}>
        <Text style={styles.signupText}>
          don&apos;t have an account?{' '}
          <Text style={styles.signupLink} onPress={handleSignup}>
            Signup
          </Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBEA',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    flexGrow: 1,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    lineHeight: 36,
    fontWeight: 'bold',
    color: '#1F1F1F',
  },
  form: {
    gap: 24,
    marginBottom: 32,
  },
  inputGroup: {
    gap: 8,
  },
  input: {
    height: 52,
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1F1F1F',
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
    height: 52,
    paddingHorizontal: 16,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F1F1F',
  },
  eyeIcon: {
    padding: 4,
  },
  continueButton: {
    backgroundColor: '#FFD700',
    height: 54,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  continueButtonDisabled: {
    backgroundColor: '#E0E0E0',
    opacity: 0.6,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F1F1F',
  },
  forgotPasswordContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#1F1F1F',
    textDecorationLine: 'underline',
  },
  spacer: {
    flex: 1,
  },
  signupContainer: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 120,
    backgroundColor: '#FFFBEA',
  },
  signupText: {
    fontSize: 14,
    color: '#1F1F1F',
  },
  signupLink: {
    color: '#FFD700',
    fontWeight: '500',
  },
  errorContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#D32F2F',
    fontWeight: '400',
  },
});

