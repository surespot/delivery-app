import { useAuthStore } from '@/store/auth-store';
import { useSupportStore } from '@/store/support-store';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

type Stage = 'select-complaint' | 'additional-info' | 'success';

const COMPLAINT_TYPES = [
  { id: '1', label: "Didn't receive activation code" },
  { id: '2', label: 'Problems with onboarding verification' },
  { id: '3', label: "Can't log into rider account" },
  { id: '4', label: 'Profile information update issues' },
];

const MAX_DESCRIPTION_LENGTH = 600;
const MAX_DOCUMENTS = 3;

export default function SupportAccountVerificationScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { addReport } = useSupportStore();

  const [stage, setStage] = useState<Stage>('select-complaint');
  const [selectedType, setSelectedType] = useState<string | null>(null);

  // Additional info state
  const [description, setDescription] = useState('');
  const [documents, setDocuments] = useState<string[]>([]);
  const [phoneNumber, setPhoneNumber] = useState(
    user?.phone?.replace('+234', '').replace('+2347', '7') || ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContinueToAdditionalInfo = () => {
    if (selectedType) {
      setStage('additional-info');
    }
  };

  const handleAddDocument = () => {
    if (documents.length >= MAX_DOCUMENTS) {
      Alert.alert('Limit Reached', `You can only attach up to ${MAX_DOCUMENTS} documents.`);
      return;
    }
    Alert.alert('Coming Soon', 'Document upload will be available soon.');
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert('Error', 'Please provide a description of your issue');
      return;
    }
    if (!phoneNumber.trim()) {
      Alert.alert('Error', 'Please provide a contact phone number');
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Get complaint type label
      const complaintTypeLabel = COMPLAINT_TYPES.find(
        (t) => t.id === selectedType
      )?.label || 'Account Issue';

      // Add report to store
      addReport({
        title: complaintTypeLabel,
        category: 'account-verification',
        description: description,
        complaintType: selectedType || undefined,
      });

      setStage('success');
    } catch {
      Alert.alert('Error', 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewProgress = () => {
    router.push('/home/support-recents' as any);
  };

  const handleBrowseOrders = () => {
    router.push('/home/orders' as any);
  };

  const isAdditionalInfoValid = description.trim() && phoneNumber.trim();

  // Get header title based on stage
  const getHeaderTitle = () => {
    switch (stage) {
      case 'additional-info':
        return 'Additional Information';
      case 'success':
        return '';
      default:
        return 'Account and Verification';
    }
  };

  // Render success screen
  if (stage === 'success') {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.successContainer}>
          <View style={styles.successIconContainer}>
            <Ionicons name="checkmark" size={80} color="#FFFFFF" />
          </View>
          <Text style={styles.successText}>
            Your complaint has been successfully reported.{'\n'}
            While you wait, you can
          </Text>
          <Pressable style={styles.viewProgressButton} onPress={handleViewProgress}>
            <Text style={styles.viewProgressButtonText}>View Progress</Text>
          </Pressable>
          <Pressable onPress={handleBrowseOrders}>
            <Text style={styles.browseOrdersText}>Or browse orders</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => {
            if (stage === 'additional-info') {
              setStage('select-complaint');
            } else {
              router.back();
            }
          }}
          style={styles.backButton}>
          <Feather name="chevron-left" size={20} color="#1f1f1f" />
        </Pressable>
        <Text style={styles.headerTitle}>{getHeaderTitle()}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {stage === 'select-complaint' && (
        <>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionLabel}>Select Complaint Type</Text>

            <View style={styles.optionsList}>
              {COMPLAINT_TYPES.map((type, index) => {
                const isSelected = selectedType === type.id;
                const isLast = index === COMPLAINT_TYPES.length - 1;

                return (
                  <Pressable
                    key={type.id}
                    style={[
                      styles.optionItem,
                      !isLast && styles.optionItemBorder,
                      isSelected && styles.optionItemSelected,
                    ]}
                    onPress={() => setSelectedType(type.id)}>
                    <Text
                      style={[
                        styles.optionText,
                        isSelected && styles.optionTextSelected,
                      ]}>
                      {type.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>

          {/* Continue Button */}
          <View style={styles.bottomContainer}>
            <Pressable
              style={[styles.continueButton, selectedType && styles.continueButtonActive]}
              onPress={handleContinueToAdditionalInfo}
              disabled={!selectedType}>
              <Text style={styles.continueButtonText}>Continue</Text>
            </Pressable>
          </View>
        </>
      )}

      {stage === 'additional-info' && (
        <>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
            {/* Issue Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Issue Description</Text>
              <View style={styles.textAreaContainer}>
                <TextInput
                  style={styles.textArea}
                  value={description}
                  onChangeText={(text) =>
                    setDescription(text.slice(0, MAX_DESCRIPTION_LENGTH))
                  }
                  placeholder="Please provide a short description of your issue so the support team can easily find the best way to help you"
                  placeholderTextColor="#9E9E9E"
                  multiline
                  textAlignVertical="top"
                />
                <Text style={styles.charCount}>
                  {description.length}/{MAX_DESCRIPTION_LENGTH}
                </Text>
              </View>
            </View>

            {/* Supporting Documents */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Supporting Documents <Text style={styles.optionalText}>(Optional)</Text>
              </Text>
              <View style={styles.documentsRow}>
                <Pressable style={styles.addDocButton} onPress={handleAddDocument}>
                  <Feather name="plus" size={24} color="#4F4F4F" />
                </Pressable>
                {documents.map((doc, index) => (
                  <View key={index} style={styles.documentThumbnail}>
                    <Feather name="file" size={20} color="#4F4F4F" />
                  </View>
                ))}
              </View>
              <Text style={styles.docCount}>
                {documents.length}/{MAX_DOCUMENTS}
              </Text>
            </View>

            {/* Contact Phone Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Contact Phone Number</Text>
              <View style={styles.phoneInputContainer}>
                <View style={styles.phonePrefix}>
                  <Text style={styles.phonePrefixText}>+234</Text>
                </View>
                <TextInput
                  style={styles.phoneInput}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  placeholder="90 1422 6320"
                  placeholderTextColor="#9E9E9E"
                  keyboardType="phone-pad"
                />
              </View>
            </View>
          </ScrollView>

          {/* Submit Button */}
          <View style={styles.bottomContainer}>
            <Pressable
              style={[
                styles.continueButton,
                isAdditionalInfoValid && styles.continueButtonActive,
              ]}
              onPress={handleSubmit}
              disabled={!isAdditionalInfoValid || isSubmitting}>
              <Text style={styles.continueButtonText}>
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </Text>
            </Pressable>
          </View>
        </>
      )}
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
    fontSize: 18,
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
    paddingBottom: 120,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f1f1f',
    marginBottom: 16,
  },
  optionsList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  optionItem: {
    paddingVertical: 18,
    paddingHorizontal: 16,
  },
  optionItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  optionItemSelected: {
    backgroundColor: '#FFF9E6',
  },
  optionText: {
    fontSize: 14,
    color: '#1f1f1f',
  },
  optionTextSelected: {
    fontWeight: '600',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 16,
    backgroundColor: '#FFFBEA',
  },
  continueButton: {
    backgroundColor: '#FFEDB5',
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonActive: {
    backgroundColor: '#FFD700',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f1f1f',
  },
  // Additional Info styles
  inputGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f1f1f',
    marginBottom: 16,
  },
  optionalText: {
    fontWeight: '400',
    color: '#7A7A7A',
  },
  textAreaContainer: {
    backgroundColor: '#F2F2F2',
    borderRadius: 12,
    padding: 16,
    minHeight: 140,
  },
  textArea: {
    fontSize: 14,
    color: '#1f1f1f',
    flex: 1,
    minHeight: 100,
  },
  charCount: {
    fontSize: 12,
    color: '#7A7A7A',
    textAlign: 'right',
    marginTop: 8,
  },
  documentsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  addDocButton: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#F2F2F2',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#BDBDBD',
    borderStyle: 'dashed',
  },
  documentThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#F2F2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  docCount: {
    fontSize: 12,
    color: '#7A7A7A',
    textAlign: 'right',
  },
  phoneInputContainer: {
    flexDirection: 'row',
    backgroundColor: '#F2F2F2',
    borderRadius: 12,
    overflow: 'hidden',
  },
  phonePrefix: {
    backgroundColor: '#E0E0E0',
    paddingHorizontal: 16,
    paddingVertical: 16,
    justifyContent: 'center',
  },
  phonePrefixText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f1f1f',
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1f1f1f',
  },
  // Success screen styles
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  successIconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  successText: {
    fontSize: 16,
    color: '#7A7A7A',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  viewProgressButton: {
    backgroundColor: '#FFD700',
    borderRadius: 999,
    paddingVertical: 16,
    paddingHorizontal: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  viewProgressButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f1f1f',
  },
  browseOrdersText: {
    fontSize: 14,
    color: '#1f1f1f',
    textDecorationLine: 'underline',
  },
});
