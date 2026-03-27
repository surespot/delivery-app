import { useSubmitSupportRequest } from '@/src/api/support';
import { useSupportAttachments } from '@/src/hooks/use-support-attachments';
import { useAuthStore } from '@/store/auth-store';
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

const APP_AREAS = [
  { id: 'home', label: 'Home' },
  { id: 'orders', label: 'Orders' },
  { id: 'wallet', label: 'Wallet' },
  { id: 'profile', label: 'Profile' },
  { id: 'delivery-details', label: 'Delivery Details' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'chat', label: 'Chat' },
  { id: 'login', label: 'Login / Authentication' },
  { id: 'account-information', label: 'Account Information' },
  { id: 'settings', label: 'Settings' },
  { id: 'support', label: 'Support' },
  { id: 'other', label: 'Other' },
];

const MAX_NAME_LENGTH = 80;
const MAX_DESCRIPTION_LENGTH = 600;
const MAX_STEPS_LENGTH = 800;
const MAX_ATTACHMENTS = 3;

export default function BugReportScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const submitMutation = useSubmitSupportRequest();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [stepsToReproduce, setStepsToReproduce] = useState('');
  const [areaAffected, setAreaAffected] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(
    user?.phone?.replace(/^\+234/, '').replace(/^234/, '') || ''
  );
  const [showAreaModal, setShowAreaModal] = useState(false);
  const { attachments, pickImage, removeAttachment, appendToFormData, canAddMore } =
    useSupportAttachments();

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please provide a name/title for the bug');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Error', 'Please provide a description of the bug');
      return;
    }
    if (!areaAffected) {
      Alert.alert('Error', 'Please select the area of the app affected');
      return;
    }
    if (!phoneNumber.trim()) {
      Alert.alert('Error', 'Please provide a contact phone number');
      return;
    }

    const areaLabel = APP_AREAS.find((a) => a.id === areaAffected)?.label ?? areaAffected;
    const raw = phoneNumber.replace(/\D/g, '');
    const contactPhone =
      raw.startsWith('234') ? raw : raw.startsWith('0') ? '234' + raw.slice(1) : '234' + raw;

    const formData = new FormData();
    formData.append('source', 'bug_report');
    formData.append('category', 'bug');
    formData.append('type', 'app_crash');
    formData.append('issueType', 'app_crash');
    formData.append('title', name.trim());
    formData.append('description', description.trim());
    formData.append('contactPhone', contactPhone);
    if (stepsToReproduce.trim()) {
      formData.append('stepsToReproduce', stepsToReproduce.trim());
    }
    formData.append('areaAffected', areaLabel);
    appendToFormData(formData);

    try {
      await submitMutation.mutateAsync(formData);
      Alert.alert(
        'Bug Reported',
        'Thank you for your report. Our team will look into it and get back to you.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch {
      Alert.alert('Error', 'Failed to submit bug report. Please try again.');
    }
  };

  const isFormValid =
    name.trim().length > 0 &&
    description.trim().length > 0 &&
    areaAffected.length > 0 &&
    phoneNumber.trim().length > 0;

  const isSubmitting = submitMutation.isPending;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Feather name="chevron-left" size={20} color="#1f1f1f" />
        </Pressable>
        <Text style={styles.headerTitle}>Report a Bug</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <Text style={styles.introText}>
          Use this form to report issues with the app itself (crashes, glitches, incorrect behavior).
          For delivery or account issues, use Report an Issue or Contact Support.
        </Text>

        {/* Bug Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Bug Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={(text) => setName(text.slice(0, MAX_NAME_LENGTH))}
            placeholder="e.g. App crashes when marking order delivered"
            placeholderTextColor="#9E9E9E"
            maxLength={MAX_NAME_LENGTH}
          />
          <Text style={styles.charCount}>{name.length}/{MAX_NAME_LENGTH}</Text>
        </View>

        {/* Description */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <View style={styles.textAreaContainer}>
            <TextInput
              style={styles.textArea}
              value={description}
              onChangeText={(text) =>
                setDescription(text.slice(0, MAX_DESCRIPTION_LENGTH))
              }
              placeholder="Describe what happens and what you expected to happen"
              placeholderTextColor="#9E9E9E"
              multiline
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>
              {description.length}/{MAX_DESCRIPTION_LENGTH}
            </Text>
          </View>
        </View>

        {/* Steps to Reproduce */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Steps to Reproduce</Text>
          <View style={styles.textAreaContainer}>
            <TextInput
              style={styles.textArea}
              value={stepsToReproduce}
              onChangeText={(text) =>
                setStepsToReproduce(text.slice(0, MAX_STEPS_LENGTH))
              }
              placeholder={'1. Go to Orders\n2. Tap an order\n3. Tap Mark as delivered\n4. App crashes'}
              placeholderTextColor="#9E9E9E"
              multiline
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>
              {stepsToReproduce.length}/{MAX_STEPS_LENGTH}
            </Text>
          </View>
        </View>

        {/* Contact Phone */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Contact Phone Number</Text>
          <TextInput
            style={styles.input}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="e.g. 08012345678"
            placeholderTextColor="#9E9E9E"
            keyboardType="phone-pad"
          />
        </View>

        {/* Supporting Documents */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Supporting Documents <Text style={styles.optionalText}>(Optional)</Text>
          </Text>
          <View style={styles.documentsRow}>
            {canAddMore && (
              <Pressable style={styles.addDocButton} onPress={pickImage}>
                <Feather name="plus" size={24} color="#4F4F4F" />
              </Pressable>
            )}
            {attachments.map((att, index) => (
              <Pressable
                key={index}
                style={styles.documentThumbnail}
                onPress={() => removeAttachment(index)}>
                <Feather name="image" size={20} color="#4F4F4F" />
              </Pressable>
            ))}
          </View>
          <Text style={styles.docCount}>
            {attachments.length}/{MAX_ATTACHMENTS}
          </Text>
        </View>

        {/* Area Affected */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Area Affected</Text>
          <Pressable
            style={styles.selectButton}
            onPress={() => setShowAreaModal(true)}>
            <Text
              style={[
                styles.selectButtonText,
                !areaAffected && styles.selectButtonPlaceholder,
              ]}>
              {APP_AREAS.find((a) => a.id === areaAffected)?.label ||
                'Select area'}
            </Text>
            <Feather name="chevron-down" size={20} color="#7A7A7A" />
          </Pressable>
        </View>

        {/* Submit */}
        <Pressable
          style={[styles.submitButton, isFormValid && styles.submitButtonActive]}
          onPress={handleSubmit}
          disabled={!isFormValid || isSubmitting}>
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Submitting...' : 'Submit Bug Report'}
          </Text>
        </Pressable>
      </ScrollView>

      {/* Area Modal */}
      <Modal
        visible={showAreaModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAreaModal(false)}>
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowAreaModal(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Area Affected</Text>
            <ScrollView style={styles.modalScroll}>
              {APP_AREAS.map((area) => (
                <Pressable
                  key={area.id}
                  style={[
                    styles.modalOption,
                    areaAffected === area.id && styles.modalOptionSelected,
                  ]}
                  onPress={() => {
                    setAreaAffected(area.id);
                    setShowAreaModal(false);
                  }}>
                  <Text
                    style={[
                      styles.modalOptionText,
                      areaAffected === area.id && styles.modalOptionTextSelected,
                    ]}>
                    {area.label}
                  </Text>
                  {areaAffected === area.id && (
                    <Feather name="check" size={20} color="#FFD700" />
                  )}
                </Pressable>
              ))}
            </ScrollView>
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
    paddingTop: 8,
    paddingBottom: 40,
  },
  introText: {
    fontSize: 14,
    color: '#4F4F4F',
    lineHeight: 20,
    marginBottom: 24,
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
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F2F2F2',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f1f1f',
  },
  textAreaContainer: {
    backgroundColor: '#F2F2F2',
    borderRadius: 12,
    padding: 16,
    minHeight: 120,
  },
  textArea: {
    fontSize: 14,
    color: '#1f1f1f',
    flex: 1,
    minHeight: 80,
  },
  charCount: {
    fontSize: 12,
    color: '#7A7A7A',
    textAlign: 'right',
    marginTop: 8,
  },
  optionalText: {
    fontWeight: '400',
    color: '#7A7A7A',
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
  submitButton: {
    backgroundColor: '#FFEDB5',
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
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
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f1f1f',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalScroll: {
    maxHeight: 320,
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
