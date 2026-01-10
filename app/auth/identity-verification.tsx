import {
  useCompleteRegistration,
  useCreatePassword,
  useInitiateRegistration,
  useResendEmailOtp,
  useResendPhoneOtp,
  useSendEmailOtp,
  useSendPhoneOtp,
  useVerifyEmailOtp,
  useVerifyPhoneOtp,
} from '@/src/api/onboarding';
import { getAuthToken } from '@/src/api/onboarding/client';
import { useAuthStore } from '@/store/auth-store';
import { useOnboardingStore } from '@/store/onboarding-store';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

type VerificationStep = 'email' | 'phone';

// Helper function to format date from ISO string to readable format
const formatDateOfBirth = (isoDateString: string): string => {
  try {
    const date = new Date(isoDateString);
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    // Add ordinal suffix (1st, 2nd, 3rd, 4th, etc.)
    const getOrdinalSuffix = (n: number): string => {
      if (n > 3 && n < 21) return 'th';
      switch (n % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
      }
    };
    
    return `${day}${getOrdinalSuffix(day)} of ${month}, ${year}`;
  } catch {
    // If parsing fails, return the original string
    return isoDateString;
  }
};

export default function IdentityVerificationScreen() {
  const [fullName, setFullName] = useState('');
  const [registrationCode, setRegistrationCode] = useState('');
  const [riderData, setRiderData] = useState<{
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    email: string;
    phoneNumber: string;
    address: string;
    workArea?: string;
    nin: string;
  } | null>(null);
  const [verificationStep, setVerificationStep] = useState<VerificationStep | null>(null);
  const [emailCode, setEmailCode] = useState(['', '', '', '', '', '']);
  const [phoneCode, setPhoneCode] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [activeOtpIndex, setActiveOtpIndex] = useState(0);
  const [showPasswordCreation, setShowPasswordCreation] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showWorkSchedule, setShowWorkSchedule] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const emailInputRefs = useRef<(TextInput | null)[]>([]);
  const phoneInputRefs = useRef<(TextInput | null)[]>([]);

  // Zustand stores
  const onboardingStore = useOnboardingStore();
  const { setUser, setAccessToken, setAuthenticated } = useAuthStore();

  // API hooks
  const initiateRegistration = useInitiateRegistration();
  const sendEmailOtp = useSendEmailOtp();
  const verifyEmailOtp = useVerifyEmailOtp();
  const resendEmailOtp = useResendEmailOtp();
  const sendPhoneOtp = useSendPhoneOtp();
  const verifyPhoneOtp = useVerifyPhoneOtp();
  const resendPhoneOtp = useResendPhoneOtp();
  const createPassword = useCreatePassword();
  const completeRegistration = useCompleteRegistration();

  const selectedSchedule = onboardingStore.selectedSchedule;
  const setSelectedSchedule = onboardingStore.setSelectedSchedule;

  const handleBack = () => {
    router.back();
  };

  const handleNext = async () => {
    if (!fullName || !registrationCode || registrationCode.length !== 16) return;

    const nameParts = fullName.trim().split(/\s+/);
    if (nameParts.length < 2) {
      Alert.alert('Error', 'Please enter both first and last name');
      return;
    }

    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');

    try {
      const response = await initiateRegistration.mutateAsync({
        registrationCode,
        firstName,
        lastName,
      });

      if (response.data) {
        onboardingStore.setRegistrationCode(registrationCode);
        onboardingStore.setRiderProfile(response.data);
        setRiderData({
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          dateOfBirth: response.data.dateOfBirth,
          email: response.data.email,
          phoneNumber: response.data.phone,
          address: response.data.address,
          nin: response.data.nin,
        });
      }
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to initiate registration'
      );
    }
  };

  const handleProceedToVerification = async () => {
    if (!riderData) return;

    setVerificationStep('email');
    setResendTimer(30);
    setActiveOtpIndex(0);

    try {
      await sendEmailOtp.mutateAsync({ email: riderData.email });
      setTimeout(() => {
        emailInputRefs.current[0]?.focus();
      }, 100);
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to send OTP'
      );
      setVerificationStep(null);
    }
  };

  // Resend timer effect
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => {
        setResendTimer(resendTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const maskEmail = (email: string) => {
    const [localPart, domain] = email.split('@');
    if (localPart.length <= 4) return email;
    const visible = localPart.substring(0, 4);
    const masked = '*'.repeat(localPart.length - 4);
    return `${visible}${masked}@${domain}`;
  };

  const maskPhone = (phone: string) => {
    if (phone.length <= 7) return phone;
    const visible = phone.substring(0, 7);
    const masked = '*'.repeat(phone.length - 10);
    const lastThree = phone.substring(phone.length - 3);
    return `${visible}${masked}${lastThree}`;
  };

  const handleEmailCodeChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;

    const newCode = [...emailCode];
    newCode[index] = value;
    setEmailCode(newCode);
    setOtpError(null);

    if (value && index < 5) {
      setActiveOtpIndex(index + 1);
      emailInputRefs.current[index + 1]?.focus();
    } else if (value) {
      setActiveOtpIndex(-1);
    }
  };

  const handlePhoneCodeChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;

    const newCode = [...phoneCode];
    newCode[index] = value;
    setPhoneCode(newCode);
    setOtpError(null);

    if (value && index < 5) {
      setActiveOtpIndex(index + 1);
      phoneInputRefs.current[index + 1]?.focus();
    } else if (value) {
      setActiveOtpIndex(-1);
    }
  };

  const handleEmailCodeKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !emailCode[index] && index > 0) {
      setActiveOtpIndex(index - 1);
      emailInputRefs.current[index - 1]?.focus();
    }
  };

  const handlePhoneCodeKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !phoneCode[index] && index > 0) {
      setActiveOtpIndex(index - 1);
      phoneInputRefs.current[index - 1]?.focus();
    }
  };

  const handleResendCode = async () => {
    if (resendTimer > 0 || !riderData) return;

    setResendTimer(30);
    setOtpError(null);

    try {
      if (verificationStep === 'email') {
        await resendEmailOtp.mutateAsync({ email: riderData.email });
        setEmailCode(['', '', '', '', '', '']);
        setActiveOtpIndex(0);
        emailInputRefs.current[0]?.focus();
      } else if (verificationStep === 'phone') {
        await resendPhoneOtp.mutateAsync({ phone: riderData.phoneNumber });
        setPhoneCode(['', '', '', '', '', '']);
        setActiveOtpIndex(0);
        phoneInputRefs.current[0]?.focus();
      }
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to resend OTP'
      );
    }
  };

  const handleVerifyCode = async () => {
    const code = verificationStep === 'email' ? emailCode.join('') : phoneCode.join('');
    if (code.length !== 6 || !riderData) return;

    setIsVerifying(true);
    setOtpError(null);

    try {
      if (verificationStep === 'email') {
        const response = await verifyEmailOtp.mutateAsync({
          email: riderData.email,
          otp: code,
        });
        if (response.data?.verificationToken) {
          onboardingStore.setEmailVerificationToken(response.data.verificationToken);
          setVerificationStep('phone');
          setResendTimer(30);
          setEmailCode(['', '', '', '', '', '']);
          setActiveOtpIndex(0);
          setOtpError(null);
          // Send phone OTP
          await sendPhoneOtp.mutateAsync({ phone: riderData.phoneNumber });
          setTimeout(() => {
            phoneInputRefs.current[0]?.focus();
          }, 100);
        }
      } else if (verificationStep === 'phone') {
        const response = await verifyPhoneOtp.mutateAsync({
          phone: riderData.phoneNumber,
          otp: code,
        });
        if (response.data?.verificationToken) {
          onboardingStore.setPhoneVerificationToken(response.data.verificationToken);
          setVerificationStep(null);
          setShowPasswordCreation(true);
          setOtpError(null);
        }
      }
    } catch (error) {
      setOtpError(error instanceof Error ? error.message : 'Invalid code. Please try again.');
      if (verificationStep === 'email') {
        setEmailCode(['', '', '', '', '', '']);
        setActiveOtpIndex(0);
        setTimeout(() => {
          emailInputRefs.current[0]?.focus();
        }, 100);
      } else {
        setPhoneCode(['', '', '', '', '', '']);
        setActiveOtpIndex(0);
        setTimeout(() => {
          phoneInputRefs.current[0]?.focus();
        }, 100);
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerificationBack = () => {
    if (verificationStep === 'phone') {
      setVerificationStep('email');
      setPhoneCode(['', '', '', '', '', '']);
      setResendTimer(30);
      setActiveOtpIndex(0);
    } else {
      setVerificationStep(null);
      setEmailCode(['', '', '', '', '', '']);
      setResendTimer(0);
      setActiveOtpIndex(0);
    }
  };

  const isCodeComplete = (verificationStep === 'email' ? emailCode : phoneCode).every(
    (digit) => digit !== ''
  );

  const handlePasswordNext = async () => {
    if (!password || !confirmPassword || password !== confirmPassword) return;
    if (!validatePassword(password)) return;

    try {
      const response = await createPassword.mutateAsync({
        password,
        confirmPassword,
      });

      if (response.data?.userId) {
        onboardingStore.setUserId(response.data.userId);
        
        // Tokens are automatically saved by the hook's onSuccess callback
        // Don't set auth state yet - wait until registration is complete
        
        setShowPasswordCreation(false);
        setShowWorkSchedule(true);
      }
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to create password'
      );
    }
  };

  const handleFinish = async () => {
    if (!onboardingStore.registrationCode || !onboardingStore.scheduleDays) return;

    setIsCompleting(true);

    try {
      // Token should already be saved from password creation
      // Complete registration using the saved token
      const completeResponse = await completeRegistration.mutateAsync({
        registrationCode: onboardingStore.registrationCode,
        schedule: onboardingStore.scheduleDays,
      });

      if (completeResponse.data) {
        // Set user info from rider data if available
        if (riderData) {
          setUser({
            id: onboardingStore.userId || '',
            firstName: riderData.firstName,
            lastName: riderData.lastName,
            phone: riderData.phoneNumber,
            email: riderData.email,
            avatar: null,
          });
        }
        
        // Get the saved access token and set it in auth store
        // This will also set isAuthenticated to true
        const token = await getAuthToken();
        if (token) {
          setAccessToken(token);
        } else {
          // Fallback: just set authenticated if token retrieval fails
          setAuthenticated(true);
        }
        
        router.replace('/home');
      }
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to complete registration'
      );
    } finally {
      setIsCompleting(false);
    }
  };

  const validatePassword = (pwd: string) => {
    if (pwd.length < 8) return false;
    if (!/[A-Z]/.test(pwd)) return false;
    if (!/[a-z]/.test(pwd)) return false;
    if (!/[0-9]/.test(pwd)) return false;
    if (!/[^A-Za-z0-9]/.test(pwd)) return false;
    return true;
  };

  const isPasswordValid =
    password.length > 0 &&
    confirmPassword.length > 0 &&
    password === confirmPassword &&
    validatePassword(password);

  const handleTermsLink = () => {
    router.push('/docs/terms-and-conditions');
  };

  const handlePrivacyLink = () => {
    router.push('/docs/privacy-policy');
  };

  const isFormValid = fullName.trim().length > 0 && registrationCode.trim().length === 16;

  const handleLearnMore = () => {
    router.push('/docs/registration-code');
  };

  const handleCodeLink = () => {
    router.push('/docs/registration-code');
  };

  // Show work schedule selection screen
  if (showWorkSchedule) {
    const scheduleOptions = [
      {
        id: 'full-time',
        title: 'Full Time',
        description: 'Mon-Sat • 7 days a week',
      },
      {
        id: 'part-time-weekdays',
        title: 'Part Time (weekdays)',
        description: 'Mon-Fri • 5 days a week',
      },
      {
        id: 'part-time-weekends',
        title: 'Part Time (weekends)',
        description: 'Sat & Sun • 2 days a week',
      },
      {
        id: 'custom',
        title: 'Custom',
        description: 'Flexible',
      },
    ];

    return (
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.title}>One more thing,</Text>
            <Text style={styles.workScheduleQuestion}>
              What work schedule do you prefer?
            </Text>
          </View>

          <View style={styles.scheduleOptionsContainer}>
            {scheduleOptions.map((option) => {
              const isSelected = selectedSchedule === option.id;
              return (
                <Pressable
                  key={option.id}
                  style={[
                    styles.scheduleOption,
                    isSelected && styles.scheduleOptionSelected,
                  ]}
                  onPress={() => setSelectedSchedule(option.id as any)}>
                  <View style={styles.scheduleOptionContent}>
                    <Text
                      style={[
                        styles.scheduleOptionTitle,
                        isSelected && styles.scheduleOptionTitleSelected,
                      ]}>
                      {option.title}
                    </Text>
                    <Text
                      style={[
                        styles.scheduleOptionDescription,
                        isSelected && styles.scheduleOptionDescriptionSelected,
                      ]}>
                      {option.description}
                    </Text>
                  </View>
                  <Ionicons
                    name="arrow-forward"
                    size={20}
                    color={isSelected ? '#FFFFFF' : '#1C1C1C'}
                  />
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        <View style={styles.bottomButtons}>
          <Pressable
            style={styles.backButton}
            onPress={() => {
              setShowWorkSchedule(false);
              setShowPasswordCreation(true);
            }}>
            <Ionicons name="chevron-back" size={24} color="#1F1F1F" />
          </Pressable>
          <Pressable
            style={styles.finishButton}
            onPress={handleFinish}
            disabled={isCompleting}>
            {isCompleting ? (
              <ActivityIndicator size="small" color="#1F1F1F" />
            ) : (
              <Text style={styles.finishButtonText}>Finish</Text>
            )}
          </Pressable>
        </View>
      </View>
    );
  }

  // Show password creation screen
  if (showPasswordCreation) {
    return (
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.title}>Create your password</Text>
            <Text style={styles.passwordHint}>
              Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Password <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter password"
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

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Confirm password <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Confirm password"
                  placeholderTextColor="#9E9E9E"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                />
                <Pressable
                  style={styles.eyeIcon}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color="#7A7A7A"
                  />
                </Pressable>
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.bottomButtons}>
          <Pressable
            style={styles.backButton}
            onPress={() => {
              setShowPasswordCreation(false);
              setVerificationStep('phone');
              setResendTimer(30);
            }}>
            <Ionicons name="chevron-back" size={24} color="#1F1F1F" />
          </Pressable>
          <Pressable
            style={[styles.nextButton, isPasswordValid && styles.nextButtonActive]}
            onPress={handlePasswordNext}
            disabled={!isPasswordValid || createPassword.isPending}>
            {createPassword.isPending ? (
              <ActivityIndicator size="small" color="#1F1F1F" />
            ) : (
              <Text style={styles.nextButtonText}>Next</Text>
            )}
          </Pressable>
        </View>
      </View>
    );
  }

  // Show verification views if verification step is active
  if (verificationStep) {
    const isEmail = verificationStep === 'email';
    const code = isEmail ? emailCode : phoneCode;
    const inputRefs = isEmail ? emailInputRefs : phoneInputRefs;
    const maskedValue = isEmail
      ? maskEmail(riderData?.email || '')
      : maskPhone(riderData?.phoneNumber || '');
    const handleCodeChange = isEmail ? handleEmailCodeChange : handlePhoneCodeChange;
    const handleKeyPress = isEmail ? handleEmailCodeKeyPress : handlePhoneCodeKeyPress;

    return (
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.verificationInstruction}>
              Enter 6-digit code sent to {maskedValue}
            </Text>
          </View>

          <View style={styles.otpContainer}>
            {code.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  inputRefs.current[index] = ref;
                }}
                style={[
                  styles.otpInput,
                  digit && styles.otpInputFilled,
                  activeOtpIndex === index && styles.otpInputActive,
                ]}
                value={digit}
                onChangeText={(value) => handleCodeChange(index, value)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
                onFocus={() => setActiveOtpIndex(index)}
                keyboardType="numeric"
                maxLength={1}
                selectTextOnFocus
              />
            ))}
          </View>

          {otpError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{otpError}</Text>
            </View>
          )}

          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>
              didn&apos;t get a code?{' '}
              <Text
                style={[styles.resendLink, resendTimer > 0 && styles.resendLinkDisabled]}
                onPress={handleResendCode}>
                Resend
              </Text>
              {resendTimer > 0 && (
                <Text style={styles.resendTimer}> ({resendTimer}s)</Text>
              )}
            </Text>
          </View>
        </ScrollView>

        <View style={styles.bottomButtons}>
          <Pressable style={styles.backButton} onPress={handleVerificationBack}>
            <Ionicons name="chevron-back" size={24} color="#1F1F1F" />
          </Pressable>
          <Pressable
            style={[
              styles.nextButton,
              isCodeComplete && !isVerifying && styles.nextButtonActive,
            ]}
            onPress={handleVerifyCode}
            disabled={!isCodeComplete || isVerifying}>
            {isVerifying ? (
              <ActivityIndicator size="small" color="#1F1F1F" />
            ) : (
              <Text style={styles.nextButtonText}>Next</Text>
            )}
          </Pressable>
        </View>
      </View>
    );
  }

  // Show confirmation view if rider data is loaded
  if (riderData) {
    return (
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.title}>Hi There!</Text>
            <Text style={styles.instruction}>
              Please confirm that the following information that you provided is accurate
            </Text>
          </View>

          <View style={styles.riderDetailsCard}>
            <Text style={styles.riderDetailsTitle}>Rider Details</Text>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>First Name:</Text>
              <Text style={styles.detailValue}>{riderData.firstName}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Last Name:</Text>
              <Text style={styles.detailValue}>{riderData.lastName}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Date of Birth:</Text>
              <Text style={styles.detailValue}>{formatDateOfBirth(riderData.dateOfBirth)}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Email:</Text>
              <Text style={styles.detailValue}>{riderData.email}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Phone Number:</Text>
              <Text style={styles.detailValue}>{riderData.phoneNumber}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Address:</Text>
              <Text style={styles.detailValue}>{riderData.address}</Text>
            </View>
            
            {riderData.workArea && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Work Area:</Text>
                <Text style={styles.detailValue}>{riderData.workArea}</Text>
              </View>
            )}
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>NIN:</Text>
              <Text style={styles.detailValue}>{riderData.nin}</Text>
            </View>
          </View>

          <View style={styles.legalContainer}>
            <Text style={styles.legalText}>
              by proceeding, you agree to Surespot&apos;s{' '}
              <Text style={styles.legalLink} onPress={handleTermsLink}>
                terms & conditions
              </Text>{' '}
              and{' '}
              <Text style={styles.legalLink} onPress={handlePrivacyLink}>
                privacy policy
              </Text>
            </Text>
          </View>
        </ScrollView>

        <View style={styles.bottomButtonContainer}>
          <Pressable
            style={styles.proceedButton}
            onPress={handleProceedToVerification}
            disabled={sendEmailOtp.isPending}>
            {sendEmailOtp.isPending ? (
              <ActivityIndicator size="small" color="#1F1F1F" />
            ) : (
              <Text style={styles.proceedButtonText}>Proceed to Verification</Text>
            )}
          </Pressable>
        </View>
      </View>
    );
  }

  // Show loading state
  if (initiateRegistration.isPending) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFD700" />
          <Text style={styles.loadingText}>Loading rider information...</Text>
        </View>
      </View>
    );
  }

  // Show initial form
  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Hi There!</Text>
          <Text style={styles.instruction}>
            Please provide your full name(first + last) and the{' '}
            <Text style={styles.link} onPress={handleCodeLink}>
              16-digit code given to you at registration
            </Text>
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Full name <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="e.g Jane Doe"
              placeholderTextColor="#9E9E9E"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Registration Code <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Enter 16-digit code"
              placeholderTextColor="#9E9E9E"
              value={registrationCode}
              onChangeText={setRegistrationCode}
              maxLength={16}
              keyboardType="numeric"
              secureTextEntry
            />
          </View>
        </View>

        <View style={styles.helpContainer}>
          <Text style={styles.helpText}>
            don&apos;t have a code?{' '}
            <Text style={styles.helpLink} onPress={handleLearnMore}>
              Learn how to get one
            </Text>
          </Text>
        </View>
      </ScrollView>

      <View style={styles.bottomButtons}>
        <Pressable style={styles.backButton} onPress={handleBack}>
          <Ionicons name="chevron-back" size={24} color="#1F1F1F" />
        </Pressable>
        <Pressable
          style={[styles.nextButton, isFormValid && styles.nextButtonActive]}
          onPress={handleNext}
          disabled={!isFormValid || initiateRegistration.isPending}>
          {initiateRegistration.isPending ? (
            <ActivityIndicator size="small" color="#1F1F1F" />
          ) : (
            <Text style={styles.nextButtonText}>Next</Text>
          )}
        </Pressable>
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
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    lineHeight: 36,
    fontWeight: 'bold',
    color: '#1F1F1F',
    marginBottom: 16,
  },
  instruction: {
    fontSize: 16,
    lineHeight: 24,
    color: '#757575',
    fontWeight: '400',
  },
  link: {
    color: '#0A7EA4',
    textDecorationLine: 'underline',
  },
  form: {
    gap: 24,
    marginBottom: 32,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F1F1F',
  },
  required: {
    color: '#D32F2F',
  },
  input: {
    height: 52,
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1F1F1F',
  },
  helpContainer: {
    marginTop: 24,
    marginBottom: 32,
  },
  helpText: {
    fontSize: 14,
    color: '#1F1F1F',
    textAlign: 'center',
  },
  helpLink: {
    color: '#FFD700',
    fontWeight: '500',
  },
  bottomButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 70,
    backgroundColor: '#FFFBEA',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButton: {
    backgroundColor: '#BDBDBD',
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  nextButtonActive: {
    backgroundColor: '#E0E0E0',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F1F1F',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#7A7A7A',
    fontWeight: '400',
  },
  riderDetailsCard: {
    backgroundColor: '#F2F2F2',
    borderRadius: 6,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#2E2E2E',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
    elevation: 3,
  },
  riderDetailsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F1F1F',
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 16,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '400',
    color: '#4F4F4F',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '400',
    color: '#1F1F1F',
    flex: 1,
    textAlign: 'right',
  },
  legalContainer: {
    marginTop: 24,
    marginBottom: 32,
    alignItems: 'center',
  },
  legalText: {
    fontSize: 12,
    color: '#7A7A7A',
    textAlign: 'center',
    lineHeight: 18,
  },
  legalLink: {
    color: '#FFD700',
    fontWeight: '500',
  },
  bottomButtonContainer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#FFFBEA',
  },
  proceedButton: {
    backgroundColor: '#FFD700',
    height: 54,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  proceedButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F1F1F',
  },
  verificationInstruction: {
    fontSize: 20,
    lineHeight: 28,
    color: '#1F1F1F',
    fontWeight: 'bold',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  otpInput: {
    width: 48,
    height: 56,
    backgroundColor: '#F2F2F2',
    borderRadius: 6,
    borderWidth: 0,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
    color: '#1F1F1F',
  },
  otpInputFilled: {
    backgroundColor: '#F2F2F2',
  },
  otpInputActive: {
    borderColor: '#FFD700',
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  resendContainer: {
    alignItems: 'flex-start',
    marginTop: 8,
  },
  resendText: {
    fontSize: 14,
    color: '#7A7A7A',
  },
  resendLink: {
    color: '#FFD700',
    fontWeight: '500',
  },
  resendLinkDisabled: {
    color: '#FFDD55',
  },
  resendTimer: {
    color: '#FFDD55',
    fontWeight: '500',
  },
  errorContainer: {
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#D32F2F',
    fontWeight: '400',
  },
  passwordHint: {
    fontSize: 14,
    color: '#7A7A7A',
    marginTop: 8,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
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
  workScheduleQuestion: {
    fontSize: 16,
    lineHeight: 24,
    color: '#7A7A7A',
    fontWeight: '400',
    marginTop: 8,
  },
  scheduleOptionsContainer: {
    gap: 12,
    marginTop: 24,
  },
  scheduleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F2F2F2',
    borderRadius: 6,
    padding: 16,
    minHeight: 72,
  },
  scheduleOptionSelected: {
    backgroundColor: '#1C1C1C',
  },
  scheduleOptionContent: {
    flex: 1,
  },
  scheduleOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1C',
    marginBottom: 4,
  },
  scheduleOptionTitleSelected: {
    color: '#FFFFFF',
  },
  scheduleOptionDescription: {
    fontSize: 14,
    fontWeight: '400',
    color: '#1C1C1C',
  },
  scheduleOptionDescriptionSelected: {
    color: '#FFFFFF',
  },
  finishButton: {
    backgroundColor: '#FFD700',
    height: 54,
    borderRadius: 999,
    paddingHorizontal: 32,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 120,
  },
  finishButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F1F1F',
  },
});
