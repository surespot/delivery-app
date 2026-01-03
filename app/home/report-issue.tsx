import { useAuthStore } from '@/store/auth-store';
import { useSupportStore } from '@/store/support-store';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const ISSUE_TYPES = [
  'Order not delivered',
  'Wrong items received',
  'Payment issue',
  'App crash / Bug',
  'Account problem',
  'Other',
];

const MAX_DESCRIPTION_LENGTH = 600;
const MAX_DOCUMENTS = 3;

export default function ReportIssueScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { addReport } = useSupportStore();

  const [issueType, setIssueType] = useState('');
  const [description, setDescription] = useState('');
  const [documents, setDocuments] = useState<string[]>([]);
  const [phoneNumber, setPhoneNumber] = useState(
    user?.phone?.replace('+234', '') || ''
  );
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddDocument = () => {
    if (documents.length >= MAX_DOCUMENTS) {
      Alert.alert('Limit Reached', `You can only attach up to ${MAX_DOCUMENTS} documents.`);
      return;
    }
    // In a real app, this would open a document/image picker
    Alert.alert('Coming Soon', 'Document upload will be available soon.');
  };

  const handleSubmit = async () => {
    if (!issueType) {
      Alert.alert('Error', 'Please select an issue type');
      return;
    }
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
      
      // Add report to store
      addReport({
        title: issueType,
        category: 'general',
        description: description,
      });
      
      Alert.alert(
        'Issue Reported',
        'Thank you for your report. Our support team will contact you soon.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch {
      Alert.alert('Error', 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = issueType && description.trim() && phoneNumber.trim();

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Feather name="chevron-left" size={20} color="#1f1f1f" />
        </Pressable>
        <Text style={styles.headerTitle}>Report Issue</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        {/* Issue Type */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Issue Type</Text>
          <Pressable
            style={styles.selectButton}
            onPress={() => setShowTypeModal(true)}>
            <Text
              style={[
                styles.selectButtonText,
                !issueType && styles.selectButtonPlaceholder,
              ]}>
              {issueType || 'Select issue type'}
            </Text>
            <Feather name="chevron-right" size={20} color="#7A7A7A" />
          </Pressable>
        </View>

        {/* Issue Description */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Issue Description</Text>
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
          <Text style={styles.label}>
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
          <Text style={styles.label}>Contact Phone Number</Text>
          <View style={styles.phoneInputContainer}>
            <View style={styles.phonePrefix}>
              <Text style={styles.phonePrefixText}>+234</Text>
            </View>
            <TextInput
              style={styles.phoneInput}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="70 4256 8913"
              placeholderTextColor="#9E9E9E"
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Submit Button */}
        <Pressable
          style={[styles.submitButton, isFormValid && styles.submitButtonActive]}
          onPress={handleSubmit}
          disabled={!isFormValid || isSubmitting}>
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Text>
        </Pressable>
      </ScrollView>

      {/* Issue Type Modal */}
      <Modal
        visible={showTypeModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTypeModal(false)}>
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowTypeModal(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Issue Type</Text>
            {ISSUE_TYPES.map((type) => (
              <Pressable
                key={type}
                style={[
                  styles.modalOption,
                  issueType === type && styles.modalOptionSelected,
                ]}
                onPress={() => {
                  setIssueType(type);
                  setShowTypeModal(false);
                }}>
                <Text
                  style={[
                    styles.modalOptionText,
                    issueType === type && styles.modalOptionTextSelected,
                  ]}>
                  {type}
                </Text>
                {issueType === type && (
                  <Feather name="check" size={20} color="#FFD700" />
                )}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
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
  inputGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f1f1f',
    marginBottom: 16,
  },
  optionalText: {
    fontWeight: '400',
    color: '#7A7A7A',
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F2F2F2',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  selectButtonText: {
    fontSize: 16,
    color: '#1f1f1f',
  },
  selectButtonPlaceholder: {
    color: '#9E9E9E',
  },
  textAreaContainer: {
    backgroundColor: '#F2F2F2',
    borderRadius: 12,
    padding: 16,
    minHeight: 160,
  },
  textArea: {
    fontSize: 14,
    color: '#1f1f1f',
    flex: 1,
    minHeight: 120,
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
    backgroundColor: '#BDBDBD',
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
  submitButton: {
    backgroundColor: '#FFEDB5',
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  submitButtonActive: {
    backgroundColor: '#FFD700',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f1f1f',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f1f1f',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalOptionSelected: {
    backgroundColor: '#FFF9C4',
    marginHorizontal: -24,
    paddingHorizontal: 24,
  },
  modalOptionText: {
    fontSize: 16,
    color: '#1f1f1f',
  },
  modalOptionTextSelected: {
    fontWeight: '600',
  },
});
