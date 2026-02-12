import {
  useSendPasswordResetEmailOtp,
  useSendPasswordResetOtp,
  useUpdatePassword,
  useVerifyPasswordResetEmailOtp,
  useVerifyPasswordResetOtp,
} from '@/src/api/onboarding';
import { useAuthStore } from '@/store/auth-store';
import { Feather, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

type Step = 'enter-identifier' | 'verify-otp' | 'new-password';

const CODE_LENGTH = 6;
const DEFAULT_RESEND_SECONDS = 30;

// Helper: Validate email
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Helper: Check if identifier is email or phone
const isEmail = (identifier: string): boolean => {
  return validateEmail(identifier);
};

// Helper: Mask email
const maskEmail = (email: string): string => {
  const [localPart, domain] = email.split('@');
  if (!domain) return email;
  if (localPart.length <= 4) {
    return `${localPart.slice(0, 2)}${'*'.repeat(Math.max(0, localPart.length - 2))}@${domain}`;
  }
  const prefix = localPart.slice(0, 4);
  const suffix = localPart.slice(-2);
  return `${prefix}${'*'.repeat(Math.max(0, localPart.length - 6))}${suffix}@${domain}`;
};

// Helper: Mask phone
const maskPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length < 6) return phone;
  const prefix = cleaned.slice(0, 5);
  const suffix = cleaned.slice(-3);
  return `+${prefix}${'*'.repeat(Math.max(0, cleaned.length - 8))}${suffix}`;
};

export default function ForgotPasswordScreen() {
  const { user } = useAuthStore();
  const [step, setStep] = useState<Step>('enter-identifier');
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [seconds, setSeconds] = useState(0);
  const [resetToken, setResetToken] = useState('');
  const [isResending, setIsResending] = useState(false);
  const otpInputRef = useRef<TextInput>(null);

  const defaultIdentifier = user?.email || user?.phone || '';
  const usingEmail = user?.email ? true : false;

  // API hooks
  const sendPhoneOtp = useSendPasswordResetOtp();
  const sendEmailOtp = useSendPasswordResetEmailOtp();
  const verifyPhoneOtp = useVerifyPasswordResetOtp();
  const verifyEmailOtp = useVerifyPasswordResetEmailOtp();
  const updatePassword = useUpdatePassword();

  // Reset OTP state when step changes
  useEffect(() => {
    if (step === 'verify-otp') {
      setOtp('');
      setOtpError('');
      setSeconds(DEFAULT_RESEND_SECONDS);
      setTimeout(() => otpInputRef.current?.focus(), 100);
    }
  }, [step]);

  // Countdown timer
  useEffect(() => {
    if (seconds === 0) return;
    const timer = setInterval(() => {
      setSeconds((v) => Math.max(0, v - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [seconds]);

  const handleBack = () => {
    if (step === 'enter-identifier') {
      router.back();
    } else if (step === 'verify-otp') {
      setStep('enter-identifier');
    } else {
      setStep('verify-otp');
    }
  };

  const handleSendOtp = async () => {
    const identifierValue = identifier.trim() || defaultIdentifier;
    if (!identifierValue) {
      Alert.alert('Error', 'Please enter your email or phone number');
      return;
    }

    const isEmailAddress = isEmail(identifierValue);
    setOtpError('');

    try {
      if (isEmailAddress) {
        await sendEmailOtp.mutateAsync({ email: identifierValue });
      } else {
        const phone = identifierValue.startsWith('+')
          ? identifierValue
          : `+${identifierValue}`;
        await sendPhoneOtp.mutateAsync({ phone });
      }
      setIdentifier(identifierValue);
      setStep('verify-otp');
      setSeconds(DEFAULT_RESEND_SECONDS);
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to send OTP'
      );
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== CODE_LENGTH) {
      setOtpError('Please enter the complete 6-digit code');
      return;
    }

    setOtpError('');

    try {
      const identifierValue = identifier || defaultIdentifier;
      const isEmailAddress = isEmail(identifierValue);

      let response;
      if (isEmailAddress) {
        response = await verifyEmailOtp.mutateAsync({
          email: identifierValue,
          otp,
        });
      } else {
        const phone = identifierValue.startsWith('+')
          ? identifierValue
          : `+${identifierValue}`;
        response = await verifyPhoneOtp.mutateAsync({ phone, otp });
      }

      if (response.data?.resetToken) {
        setResetToken(response.data.resetToken);
        setStep('new-password');
      }
    } catch (error) {
      setOtpError(
        error instanceof Error ? error.message : 'Invalid or expired OTP'
      );
    }
  };

  const handleResendOtp = async () => {
    if (seconds > 0 || isResending) return;

    setIsResending(true);
    try {
      await handleSendOtp();
      setOtp('');
      setOtpError('');
    } catch (error) {
      setOtpError('Unable to resend code. Try again.');
    } finally {
      setIsResending(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please enter both password fields');
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      const response = await updatePassword.mutateAsync({
        data: {
          newPassword,
          confirmPassword,
        },
        resetToken,
      });

      if (response.data?.tokens) {
        Alert.alert('Success', 'Password updated successfully!', [
          {
            text: 'OK',
            onPress: () => {
              router.replace('/home' as any);
            },
          },
        ]);
      }
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to update password'
      );
    }
  };

  const handleOtpChange = (value: string) => {
    const sanitized = value.replace(/[^\d]/g, '').slice(0, CODE_LENGTH);
    setOtp(sanitized);
    setOtpError('');
  };

  const renderOtpBoxes = () => {
    const boxes = Array.from({ length: CODE_LENGTH }, (_, i) => i);
    return (
      <Pressable
        style={styles.boxRow}
        onPress={() => otpInputRef.current?.focus()}>
        {boxes.map((_, index) => {
          const char = otp[index] ?? '';
          const isActive = index === otp.length;
          const isFilled = !!char;
          return (
            <View
              key={index}
              style={[
                styles.otpBox,
                isFilled && styles.otpBoxFilled,
                isActive && styles.otpBoxActive,
              ]}>
              <Text style={styles.otpBoxText}>{char}</Text>
            </View>
          );
        })}
      </Pressable>
    );
  };

  const identifierValue = identifier || defaultIdentifier;
  const isEmailAddress = identifierValue ? isEmail(identifierValue) : usingEmail;
  const isValidIdentifier =
    identifierValue &&
    (isEmailAddress
      ? validateEmail(identifierValue)
      : identifierValue.length >= 10);
  const isOtpReady = otp.length === CODE_LENGTH;
  const isPasswordValid =
    newPassword.length >= 8 && confirmPassword === newPassword;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={handleBack} style={styles.backButton}>
            <Feather name="chevron-left" size={20} color="#1f1f1f" />
          </Pressable>
          <Text style={styles.headerTitle}>
            {step === 'enter-identifier'
              ? 'Forgot Password'
              : step === 'verify-otp'
              ? 'Verify Code'
              : 'New Password'}
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {step === 'enter-identifier' && (
            <>
              <Text style={styles.instructionText}>
                Enter your{' '}
                {user?.email
                  ? 'email'
                  : user?.phone
                  ? 'phone number'
                  : 'email or phone number'}{' '}
                to receive a verification code
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  {isEmailAddress ? 'Email' : 'Phone Number'}
                </Text>
                <TextInput
                  style={styles.input}
                  value={identifier || defaultIdentifier}
                  onChangeText={setIdentifier}
                  placeholder={
                    isEmailAddress
                      ? 'Enter your email'
                      : 'Enter your phone number'
                  }
                  placeholderTextColor="#9E9E9E"
                  keyboardType={isEmailAddress ? 'email-address' : 'phone-pad'}
                  autoCapitalize="none"
                  autoFocus
                />
              </View>

              <Pressable
                style={[
                  styles.primaryButton,
                  isValidIdentifier && styles.primaryButtonActive,
                ]}
                onPress={handleSendOtp}
                disabled={
                  !isValidIdentifier ||
                  sendEmailOtp.isPending ||
                  sendPhoneOtp.isPending
                }>
                {sendEmailOtp.isPending || sendPhoneOtp.isPending ? (
                  <ActivityIndicator size="small" color="#1F1F1F" />
                ) : (
                  <Text style={styles.primaryButtonText}>Send Code</Text>
                )}
              </Pressable>
            </>
          )}

          {step === 'verify-otp' && (
            <>
              <Text style={styles.instructionText}>
                Enter 6-digit code sent to{' '}
                {isEmailAddress
                  ? maskEmail(identifierValue)
                  : maskPhone(identifierValue)}
              </Text>

              {renderOtpBoxes()}

              {otpError ? (
                <Text style={styles.errorText}>{otpError}</Text>
              ) : null}

              <Text style={styles.resendText}>
                didn&apos;t get a code?{' '}
                <Text
                  style={[
                    styles.resendLink,
                    (seconds > 0 || isResending) && styles.resendDisabled,
                  ]}
                  onPress={handleResendOtp}>
                  {isResending
                    ? 'Resending...'
                    : seconds > 0
                    ? `Resend (${seconds}s)`
                    : 'Resend'}
                </Text>
              </Text>

              <Pressable
                style={[
                  styles.primaryButton,
                  isOtpReady && styles.primaryButtonActive,
                ]}
                onPress={handleVerifyOtp}
                disabled={
                  !isOtpReady ||
                  verifyEmailOtp.isPending ||
                  verifyPhoneOtp.isPending
                }>
                {verifyEmailOtp.isPending || verifyPhoneOtp.isPending ? (
                  <ActivityIndicator size="small" color="#1F1F1F" />
                ) : (
                  <Text style={styles.primaryButtonText}>Verify Code</Text>
                )}
              </Pressable>

              <TextInput
                ref={otpInputRef}
                value={otp}
                onChangeText={handleOtpChange}
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                style={styles.hiddenInput}
                autoFocus
              />
            </>
          )}

          {step === 'new-password' && (
            <>
              <Text style={styles.instructionText}>
                Create a new password for your account
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>New Password</Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="Enter new password"
                    placeholderTextColor="#9E9E9E"
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

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm Password</Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirm new password"
                    placeholderTextColor="#9E9E9E"
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                  />
                  <Pressable
                    style={styles.eyeIcon}
                    onPress={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }>
                    <Ionicons
                      name={showConfirmPassword ? 'eye-off' : 'eye'}
                      size={20}
                      color="#7A7A7A"
                    />
                  </Pressable>
                </View>
              </View>

              {newPassword &&
                confirmPassword &&
                newPassword !== confirmPassword && (
                  <Text style={styles.errorText}>Passwords do not match</Text>
                )}

              <Pressable
                style={[
                  styles.primaryButton,
                  isPasswordValid && styles.primaryButtonActive,
                ]}
                onPress={handleUpdatePassword}
                disabled={!isPasswordValid || updatePassword.isPending}>
                {updatePassword.isPending ? (
                  <ActivityIndicator size="small" color="#1F1F1F" />
                ) : (
                  <Text style={styles.primaryButtonText}>Update Password</Text>
                )}
              </Pressable>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
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
  instructionText: {
    fontSize: 16,
    color: '#1f1f1f',
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: '#2C2C2C',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#2C2C2C',
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    color: '#2C2C2C',
  },
  eyeIcon: {
    padding: 4,
  },
  primaryButton: {
    backgroundColor: '#FFEDB5',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  primaryButtonActive: {
    backgroundColor: '#FFD700',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f1f1f',
  },
  boxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  otpBox: {
    width: 48,
    height: 58,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d9d9d9',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpBoxFilled: {
    borderColor: '#bfbfbf',
  },
  otpBoxActive: {
    borderColor: '#FFD700',
  },
  otpBoxText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1f1f1f',
  },
  errorText: {
    color: '#d94c00',
    marginTop: 8,
    marginBottom: 16,
    textAlign: 'center',
    fontSize: 14,
  },
  resendText: {
    color: '#7b7b7b',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 32,
  },
  resendLink: {
    color: '#D99400',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  resendDisabled: {
    color: '#b6b6b6',
    textDecorationLine: 'none',
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
  },
});
