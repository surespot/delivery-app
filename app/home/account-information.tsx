import { useAuthStore } from '@/store/auth-store';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Image,
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

type Stage =
  | 'overview'
  | 'editInfo'
  | 'changePhone'
  | 'changeEmail'
  | 'verifyPhone'
  | 'verifyEmail';

const CODE_LENGTH = 6;
const DEFAULT_RESEND_SECONDS = 30;

// Helper: Mask email for display (e.g., "aade*****72@gmail.com")
const maskEmail = (email: string): string => {
  if (!email) return 'Not set';
  const [localPart, domain] = email.split('@');
  if (!domain) return email;
  if (localPart.length <= 4) {
    return `${localPart.slice(0, 2)}${'*'.repeat(Math.max(0, localPart.length - 2))}@${domain}`;
  }
  const prefix = localPart.slice(0, 4);
  const suffix = localPart.slice(-2);
  return `${prefix}${'*'.repeat(Math.max(0, localPart.length - 6))}${suffix}@${domain}`;
};

// Helper: Mask phone for display (e.g., "+23470*****913")
const maskPhone = (phone: string): string => {
  if (!phone) return 'Not set';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length < 6) return phone;
  const prefix = cleaned.slice(0, 5);
  const suffix = cleaned.slice(-3);
  return `+${prefix}${'*'.repeat(Math.max(0, cleaned.length - 8))}${suffix}`;
};

// Helper: Format phone for display
const formatPhone = (phone: string | null): string => {
  if (!phone) return 'Not set';
  return phone.startsWith('+') ? phone : `+${phone}`;
};

// Helper: Validate email
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Stage config for headers and back navigation
const stageConfig: Record<Stage, { title: string; backTo: Stage | null }> = {
  overview: { title: 'Personal Information', backTo: null },
  editInfo: { title: 'Edit Information', backTo: 'overview' },
  changePhone: { title: 'Change Phone Number', backTo: 'editInfo' },
  changeEmail: { title: 'Change Email Address', backTo: 'editInfo' },
  verifyPhone: { title: 'Verify Phone Number', backTo: 'changePhone' },
  verifyEmail: { title: 'Verify Email Address', backTo: 'changeEmail' },
};

export default function AccountInformationScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();

  // Stage management
  const [stage, setStage] = useState<Stage>('overview');

  // Edit info state
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [isSaving, setIsSaving] = useState(false);

  // Change phone state
  const [newPhone, setNewPhone] = useState('');

  // Change email state
  const [newEmail, setNewEmail] = useState('');

  // OTP state
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [seconds, setSeconds] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const otpInputRef = useRef<TextInput>(null);

  // Pending values for verification
  const [pendingPhone, setPendingPhone] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');

  // Reset OTP state when stage changes
  useEffect(() => {
    if (stage === 'verifyPhone' || stage === 'verifyEmail') {
      setOtp('');
      setOtpError('');
      setSeconds(DEFAULT_RESEND_SECONDS);
      setTimeout(() => otpInputRef.current?.focus(), 100);
    }
  }, [stage]);

  // Countdown timer
  useEffect(() => {
    if (seconds === 0) return;
    const timer = setInterval(() => {
      setSeconds((v) => Math.max(0, v - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [seconds]);

  // Sync form state when user changes
  useEffect(() => {
    setFirstName(user.firstName);
    setLastName(user.lastName);
  }, [user]);

  const hasInfoChanges =
    firstName !== user.firstName || lastName !== user.lastName;
  const isValidEmail = newEmail.trim() ? validateEmail(newEmail) : false;
  const isValidPhone = newPhone.trim().length >= 10;
  const isOtpReady = otp.length === CODE_LENGTH && !isSubmitting;

  const handleBack = () => {
    const config = stageConfig[stage];
    if (config.backTo) {
      setStage(config.backTo);
    } else {
      router.back();
    }
  };

  // Edit info handlers
  const handleSaveInfo = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Error', 'First name and last name are required');
      return;
    }
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      updateUser({ firstName: firstName.trim(), lastName: lastName.trim() });
      Alert.alert('Success', 'Your information has been updated', [
        { text: 'OK', onPress: () => setStage('overview') },
      ]);
    } catch {
      Alert.alert('Error', 'Failed to update information. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Change phone handlers
  const handleSubmitPhone = async () => {
    if (!newPhone.trim()) {
      Alert.alert('Error', 'New phone number is required');
      return;
    }
    setIsSaving(true);
    try {
      // Simulate API call to send OTP
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const formatted = newPhone.startsWith('+') ? newPhone : `+${newPhone}`;
      setPendingPhone(formatted);
      setStage('verifyPhone');
    } catch {
      Alert.alert('Error', 'Failed to send OTP. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Change email handlers
  const handleSubmitEmail = async () => {
    if (!newEmail.trim()) {
      Alert.alert('Error', 'New email is required');
      return;
    }
    if (!validateEmail(newEmail)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    setIsSaving(true);
    try {
      // Simulate API call to send OTP
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setPendingEmail(newEmail.trim());
      setStage('verifyEmail');
    } catch {
      Alert.alert('Error', 'Failed to send OTP. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // OTP handlers
  const handleOtpChange = (value: string) => {
    const sanitized = value.replace(/[^\d]/g, '').slice(0, CODE_LENGTH);
    setOtp(sanitized);
    setOtpError('');
  };

  const handleVerifyPhone = async () => {
    if (otp.length !== CODE_LENGTH || isSubmitting) return;
    setIsSubmitting(true);
    setOtpError('');
    try {
      // Simulate API verification
      await new Promise((resolve) => setTimeout(resolve, 1500));
      // For demo, accept any 6-digit code
      updateUser({ phone: pendingPhone });
      Alert.alert('Success', 'Your phone number has been verified and updated', [
        {
          text: 'OK',
          onPress: () => {
            setNewPhone('');
            setPendingPhone('');
            setStage('overview');
          },
        },
      ]);
    } catch {
      setOtpError('Verification failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (otp.length !== CODE_LENGTH || isSubmitting) return;
    setIsSubmitting(true);
    setOtpError('');
    try {
      // Simulate API verification
      await new Promise((resolve) => setTimeout(resolve, 1500));
      updateUser({ email: pendingEmail });
      Alert.alert('Success', 'Your email has been verified and updated', [
        {
          text: 'OK',
          onPress: () => {
            setNewEmail('');
            setPendingEmail('');
            setStage('overview');
          },
        },
      ]);
    } catch {
      setOtpError('Verification failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (seconds > 0 || isResending) return;
    setIsResending(true);
    try {
      // Simulate API resend
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setOtp('');
      setSeconds(DEFAULT_RESEND_SECONDS);
      setOtpError('');
    } catch {
      setOtpError('Unable to resend code. Try again.');
    } finally {
      setIsResending(false);
    }
  };

  const initials = `${(user.firstName?.[0] ?? '').toUpperCase()}${(user.lastName?.[0] ?? '').toUpperCase()}`;

  // Render OTP boxes
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

  // Render content based on stage
  const renderContent = () => {
    switch (stage) {
      case 'overview':
        return (
          <>
            {/* Avatar */}
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                {user.avatar ? (
                  <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
                ) : (
                  <Text style={styles.avatarText}>{initials || 'SS'}</Text>
                )}
                <View style={styles.avatarOverlay}>
                  <Feather name="camera" size={20} color="#FFFFFF" />
                </View>
              </View>
            </View>

            {/* Details Section */}
            <View style={styles.detailsSection}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>First name</Text>
                <Text style={styles.detailValue}>{user.firstName || 'Not set'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Last name</Text>
                <Text style={styles.detailValue}>{user.lastName || 'Not set'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Phone number</Text>
                <Text style={styles.detailValue}>{formatPhone(user.phone)}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Email</Text>
                <Text style={styles.detailValue}>{user.email || 'Not set'}</Text>
              </View>
            </View>

            {/* Edit Link */}
            <Pressable
              style={styles.editLink}
              onPress={() => setStage('editInfo')}>
              <Text style={styles.editLinkText}>Edit information...</Text>
            </Pressable>

            {/* Forgot Password */}
            <View style={styles.forgotPasswordContainer}>
              <Pressable style={styles.forgotPasswordLink}>
                <Text style={styles.forgotPasswordText}>forgot password?</Text>
              </Pressable>
            </View>
          </>
        );

      case 'editInfo':
        return (
          <>
            {/* First Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>First name</Text>
              <TextInput
                style={styles.input}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Enter first name"
                placeholderTextColor="#9E9E9E"
                autoCapitalize="words"
              />
            </View>

            {/* Last Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Last name</Text>
              <TextInput
                style={styles.input}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Enter last name"
                placeholderTextColor="#9E9E9E"
                autoCapitalize="words"
              />
            </View>

            {/* Save Button */}
            <Pressable
              style={[styles.primaryButton, hasInfoChanges && styles.primaryButtonActive]}
              onPress={handleSaveInfo}
              disabled={!hasInfoChanges || isSaving}>
              <Text style={styles.primaryButtonText}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Text>
            </Pressable>

            {/* Action Buttons */}
            <View style={styles.actionButtonsContainer}>
              <Pressable
                style={styles.actionButton}
                onPress={() => {
                  setNewPhone('');
                  setStage('changePhone');
                }}>
                <Text style={styles.actionButtonText}>Change Phone number</Text>
              </Pressable>
              <Pressable
                style={styles.actionButton}
                onPress={() => {
                  setNewEmail('');
                  setStage('changeEmail');
                }}>
                <Text style={styles.actionButtonText}>Change Email Address</Text>
              </Pressable>
            </View>
          </>
        );

      case 'changePhone':
        return (
          <>
            {/* Old Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Old number</Text>
              <TextInput
                style={styles.input}
                value={user.phone?.replace('+', '') || ''}
                editable={false}
                placeholderTextColor="#9E9E9E"
              />
            </View>

            {/* New Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>New number</Text>
              <TextInput
                style={styles.input}
                value={newPhone}
                onChangeText={setNewPhone}
                placeholder="Enter new number..."
                placeholderTextColor="#9E9E9E"
                keyboardType="phone-pad"
                autoFocus
              />
            </View>

            {/* Save Button */}
            <Pressable
              style={[styles.primaryButton, isValidPhone && styles.primaryButtonActive]}
              onPress={handleSubmitPhone}
              disabled={!isValidPhone || isSaving}>
              <Text style={styles.primaryButtonText}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Text>
            </Pressable>
          </>
        );

      case 'changeEmail':
        return (
          <>
            {/* Old Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Old email</Text>
              <TextInput
                style={styles.input}
                value={user.email || ''}
                editable={false}
                placeholderTextColor="#9E9E9E"
              />
            </View>

            {/* New Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>New email</Text>
              <TextInput
                style={styles.input}
                value={newEmail}
                onChangeText={setNewEmail}
                placeholder="Enter new email address..."
                placeholderTextColor="#9E9E9E"
                keyboardType="email-address"
                autoCapitalize="none"
                autoFocus
              />
            </View>

            {/* Save Button */}
            <Pressable
              style={[styles.primaryButton, isValidEmail && styles.primaryButtonActive]}
              onPress={handleSubmitEmail}
              disabled={!isValidEmail || isSaving}>
              <Text style={styles.primaryButtonText}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Text>
            </Pressable>
          </>
        );

      case 'verifyPhone':
        return (
          <>
            {/* Instruction */}
            <Text style={styles.instructionText}>
              Enter 6-digit code sent to your new number at {maskPhone(pendingPhone)}
            </Text>

            {/* OTP Boxes */}
            {renderOtpBoxes()}

            {otpError ? <Text style={styles.errorText}>{otpError}</Text> : null}

            {/* Resend Link */}
            <Text style={styles.resendText}>
              didn&apos;t get a code?{' '}
              <Text
                style={[styles.resendLink, (seconds > 0 || isResending) && styles.resendDisabled]}
                onPress={handleResend}>
                {isResending ? 'Resending...' : 'Resend'}
              </Text>
            </Text>

            {/* Verify Button */}
            <Pressable
              style={[styles.primaryButton, isOtpReady && styles.primaryButtonActive]}
              onPress={handleVerifyPhone}
              disabled={!isOtpReady}>
              <Text style={[styles.primaryButtonText, !isOtpReady && styles.primaryButtonTextDisabled]}>
                {isSubmitting ? 'Verifying...' : 'Verify Number'}
              </Text>
            </Pressable>

            {/* Hidden Input */}
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
        );

      case 'verifyEmail':
        return (
          <>
            {/* Instruction */}
            <Text style={styles.instructionText}>
              Enter 6-digit code sent to your new email at {maskEmail(pendingEmail)}
            </Text>

            {/* OTP Boxes */}
            {renderOtpBoxes()}

            {otpError ? <Text style={styles.errorText}>{otpError}</Text> : null}

            {/* Resend Link */}
            <Text style={styles.resendText}>
              didn&apos;t get a code?{' '}
              <Text
                style={[styles.resendLink, (seconds > 0 || isResending) && styles.resendDisabled]}
                onPress={handleResend}>
                {isResending ? 'Resending...' : 'Resend'}
              </Text>
            </Text>

            {/* Verify Button */}
            <Pressable
              style={[styles.primaryButton, isOtpReady && styles.primaryButtonActive]}
              onPress={handleVerifyEmail}
              disabled={!isOtpReady}>
              <Text style={[styles.primaryButtonText, !isOtpReady && styles.primaryButtonTextDisabled]}>
                {isSubmitting ? 'Verifying...' : 'Verify Email'}
              </Text>
            </Pressable>

            {/* Hidden Input */}
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
        );
    }
  };

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
          <Text style={styles.headerTitle}>{stageConfig[stage].title}</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {renderContent()}
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

  // Avatar styles (overview)
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFD700',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  avatarText: {
    fontSize: 48,
    fontWeight: '700',
    color: '#1f1f1f',
  },
  avatarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Details section (overview)
  detailsSection: {
    backgroundColor: '#F2F2F2',
    borderRadius: 16,
    padding: 16,
    gap: 24,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 16,
    color: '#4F4F4F',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1C',
  },
  editLink: {
    marginTop: 8,
    marginBottom: 24,
  },
  editLinkText: {
    fontSize: 14,
    color: '#FFD700',
    fontWeight: '600',
  },
  forgotPasswordContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 24,
  },
  forgotPasswordLink: {
    marginTop: 8,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },

  // Input styles (editInfo, changePhone, changeEmail)
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
  primaryButtonTextDisabled: {
    color: '#7d7d7d',
  },

  // Action buttons (editInfo)
  actionButtonsContainer: {
    marginTop: 80,
  },
  actionButton: {
    backgroundColor: '#BDBDBD',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#1f1f1f',
  },

  // OTP styles (verifyPhone, verifyEmail)
  instructionText: {
    fontSize: 16,
    color: '#1f1f1f',
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 24,
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
