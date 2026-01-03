import { useAuthStore } from '@/store/auth-store';
import { useSupportStore } from '@/store/support-store';
import { Feather, Ionicons } from '@expo/vector-icons';
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

type Stage = 'select-order' | 'additional-info' | 'success';

interface Order {
  id: string;
  orderNo: string;
  itemsSummary: string;
  items: string[];
  extras: string[];
  date: string;
  fullDate: string;
  status: 'Pending' | 'Delivered';
  amount: string;
}

const MOCK_ORDERS: Order[] = [
  {
    id: '1',
    orderNo: '1738GF9J106K',
    itemsSummary: '4 items and 2 extras',
    items: ['Bread and Beans x2', 'Roasted Plantain', 'Onion Ringalingos', 'Declan wine'],
    extras: ['Fried Fish', 'Moin Moin'],
    date: 'Nov 23rd, 16:25',
    fullDate: 'Nov 22nd, 2025    10:05',
    status: 'Pending',
    amount: '₦8,300',
  },
  {
    id: '2',
    orderNo: '7F2K9J18Q4LM',
    itemsSummary: '5 items and 2 extras',
    items: ['Bread and Beans x2', 'Roasted Plantain', 'Onion Ringalingos', 'Declan wine'],
    extras: ['Fried Fish', 'Moin Moin'],
    date: 'Nov 22nd, 10:05',
    fullDate: 'Nov 22nd, 2025    10:05',
    status: 'Delivered',
    amount: '₦6,500',
  },
  {
    id: '3',
    orderNo: 'Q1F8L27K9J3S',
    itemsSummary: '2 items and 1 extra',
    items: ['Jollof Rice', 'Fried Rice'],
    extras: ['Chicken'],
    date: 'Nov 15th, 11:22',
    fullDate: 'Nov 15th, 2025    11:22',
    status: 'Delivered',
    amount: '₦4,000',
  },
  {
    id: '4',
    orderNo: '3L9QK72FJ8HM',
    itemsSummary: '4 items',
    items: ['Amala', 'Ewedu', 'Gbegiri', 'Assorted Meat'],
    extras: [],
    date: 'Nov 10th, 09:15',
    fullDate: 'Nov 10th, 2025    09:15',
    status: 'Delivered',
    amount: '₦5,200',
  },
];

const COMPLAINT_TYPES = [
  { id: '1', label: 'Earnings not updated' },
  { id: '2', label: 'Missing payout' },
  { id: '3', label: 'Wrong payout amount' },
  { id: '4', label: 'Requesting payout history' },
];

const MAX_DESCRIPTION_LENGTH = 600;
const MAX_DOCUMENTS = 3;

export default function SupportEarningsPayoutsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { addReport } = useSupportStore();
  
  const [stage, setStage] = useState<Stage>('select-order');
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [tempSelectedOrder, setTempSelectedOrder] = useState<Order | null>(null);
  const [selectedComplaintType, setSelectedComplaintType] = useState<string | null>(null);
  const [selectedMonth] = useState('Nov, 2025');
  
  // Additional info state
  const [description, setDescription] = useState('');
  const [documents, setDocuments] = useState<string[]>([]);
  const [phoneNumber, setPhoneNumber] = useState(
    user?.phone?.replace('+234', '').replace('+2347', '7') || ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenModal = () => {
    setTempSelectedOrder(selectedOrder);
    setShowOrderModal(true);
  };

  const handleConfirmOrder = () => {
    setSelectedOrder(tempSelectedOrder);
    setShowOrderModal(false);
  };

  const handleClearOrder = () => {
    setSelectedOrder(null);
    setSelectedComplaintType(null);
  };

  const handleContinueToAdditionalInfo = () => {
    if (selectedOrder && selectedComplaintType) {
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
        (t) => t.id === selectedComplaintType
      )?.label || 'Earnings Issue';
      
      // Add report to store
      addReport({
        title: complaintTypeLabel,
        category: 'earnings-payouts',
        description: description,
        orderId: selectedOrder?.id,
        complaintType: selectedComplaintType || undefined,
      });
      
      setStage('success');
    } catch {
      Alert.alert('Error', 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewProgress = () => {
    // Navigate to progress/complaints tracking page
    router.back();
  };

  const handleBrowseOrders = () => {
    router.push('/home/orders' as any);
  };

  const isFormValid = selectedOrder && selectedComplaintType;
  const isAdditionalInfoValid = description.trim() && phoneNumber.trim();

  // Get header title based on stage
  const getHeaderTitle = () => {
    switch (stage) {
      case 'additional-info':
        return 'Additional Information';
      case 'success':
        return '';
      default:
        return 'Earnings and Payouts';
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
              setStage('select-order');
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

      {stage === 'select-order' && (
        <>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionLabel}>Select Concerned Order</Text>

            {!selectedOrder ? (
              <Pressable style={styles.orderSelect} onPress={handleOpenModal}>
                <Text style={styles.orderSelectPlaceholder}>
                  Please choose an order
                </Text>
                <Feather name="chevron-right" size={20} color="#7A7A7A" />
              </Pressable>
            ) : (
              <View style={styles.selectedOrderCard}>
                <View style={styles.selectedOrderHeader}>
                  <Text style={styles.selectedOrderNo}>
                    Order No {selectedOrder.orderNo}
                  </Text>
                  <Pressable onPress={handleClearOrder}>
                    <Feather name="x" size={18} color="#7A7A7A" />
                  </Pressable>
                </View>

                <View style={styles.orderDetailRow}>
                  <Text style={styles.orderDetailLabel}>Items</Text>
                  <View style={styles.orderDetailValues}>
                    {selectedOrder.items.map((item, index) => (
                      <Text key={index} style={styles.orderDetailValue}>
                        {item}
                      </Text>
                    ))}
                  </View>
                </View>

                {selectedOrder.extras.length > 0 && (
                  <View style={styles.orderDetailRow}>
                    <Text style={styles.orderDetailLabel}>Extras</Text>
                    <View style={styles.orderDetailValues}>
                      {selectedOrder.extras.map((extra, index) => (
                        <Text key={index} style={styles.orderDetailValue}>
                          {extra}
                        </Text>
                      ))}
                    </View>
                  </View>
                )}

                <View style={styles.orderDetailRow}>
                  <Text style={styles.orderDetailLabel}>Total</Text>
                  <Text style={styles.orderDetailValueBold}>{selectedOrder.amount}</Text>
                </View>

                <View style={styles.orderDetailRow}>
                  <Text style={styles.orderDetailLabel}>Date</Text>
                  <Text style={styles.orderDetailValue}>{selectedOrder.fullDate}</Text>
                </View>
              </View>
            )}

            {selectedOrder && (
              <>
                <Text style={[styles.sectionLabel, styles.sectionLabelMargin]}>
                  Select Complaint Type
                </Text>

                <View style={styles.complaintTypesList}>
                  {COMPLAINT_TYPES.map((type, index) => {
                    const isSelected = selectedComplaintType === type.id;
                    const isLast = index === COMPLAINT_TYPES.length - 1;

                    return (
                      <Pressable
                        key={type.id}
                        style={[
                          styles.complaintTypeItem,
                          !isLast && styles.complaintTypeItemBorder,
                          isSelected && styles.complaintTypeItemSelected,
                        ]}
                        onPress={() => setSelectedComplaintType(type.id)}>
                        <Text
                          style={[
                            styles.complaintTypeText,
                            isSelected && styles.complaintTypeTextSelected,
                          ]}>
                          {type.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </>
            )}
          </ScrollView>

          {/* Continue Button */}
          <View style={styles.bottomContainer}>
            <Pressable
              style={[
                styles.continueButton,
                isFormValid && styles.continueButtonActive,
              ]}
              onPress={handleContinueToAdditionalInfo}
              disabled={!isFormValid}>
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

      {/* Order Selection Modal */}
      <Modal
        visible={showOrderModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowOrderModal(false)}>
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowOrderModal(false)}>
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Which order are you having an issue with?
              </Text>
              <Pressable
                style={styles.modalCloseButton}
                onPress={() => setShowOrderModal(false)}>
                <Feather name="x" size={20} color="#1f1f1f" />
              </Pressable>
            </View>

            {/* Month Filter */}
            <Pressable style={styles.monthFilter}>
              <Text style={styles.monthFilterText}>{selectedMonth}</Text>
              <Feather name="chevron-down" size={16} color="#1f1f1f" />
            </Pressable>

            {/* Orders List */}
            <ScrollView
              style={styles.ordersList}
              showsVerticalScrollIndicator={false}>
              {MOCK_ORDERS.map((order) => {
                const isSelected = tempSelectedOrder?.id === order.id;
                return (
                  <Pressable
                    key={order.id}
                    style={[
                      styles.orderItem,
                      isSelected && styles.orderItemSelected,
                    ]}
                    onPress={() => setTempSelectedOrder(order)}>
                    <View style={styles.orderItemLeft}>
                      <View style={styles.orderItemHeader}>
                        <Text style={styles.orderNo}>Order No {order.orderNo}</Text>
                        <View
                          style={[
                            styles.statusBadge,
                            order.status === 'Pending'
                              ? styles.statusPending
                              : styles.statusDelivered,
                          ]}>
                          <View
                            style={[
                              styles.statusDot,
                              order.status === 'Pending'
                                ? styles.statusDotPending
                                : styles.statusDotDelivered,
                            ]}
                          />
                          <Text
                            style={[
                              styles.statusText,
                              order.status === 'Pending'
                                ? styles.statusTextPending
                                : styles.statusTextDelivered,
                            ]}>
                            {order.status}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.orderItemsSummary}>{order.itemsSummary}</Text>
                      <View style={styles.orderFooter}>
                        <Text style={styles.orderDate}>{order.date}</Text>
                        <Text style={styles.orderAmount}>{order.amount}</Text>
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Confirm Button */}
            <Pressable
              style={[
                styles.confirmButton,
                tempSelectedOrder && styles.confirmButtonActive,
              ]}
              onPress={handleConfirmOrder}
              disabled={!tempSelectedOrder}>
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </Pressable>
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
  sectionLabelMargin: {
    marginTop: 24,
  },
  orderSelect: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F2F2F2',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  orderSelectPlaceholder: {
    fontSize: 14,
    color: '#9E9E9E',
  },
  selectedOrderCard: {
    backgroundColor: '#F2F2F2',
    borderRadius: 12,
    padding: 16,
  },
  selectedOrderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  selectedOrderNo: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1f1f1f',
  },
  orderDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  orderDetailLabel: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  orderDetailValues: {
    alignItems: 'flex-end',
    flex: 1,
    marginLeft: 16,
  },
  orderDetailValue: {
    fontSize: 12,
    color: '#1f1f1f',
    textAlign: 'right',
  },
  orderDetailValueBold: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1f1f1f',
  },
  complaintTypesList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  complaintTypeItem: {
    paddingVertical: 18,
    paddingHorizontal: 16,
  },
  complaintTypeItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  complaintTypeItemSelected: {
    backgroundColor: '#FFF9E6',
  },
  complaintTypeText: {
    fontSize: 14,
    color: '#1f1f1f',
  },
  complaintTypeTextSelected: {
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
  // Modal styles
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
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f1f1f',
    flex: 1,
    marginRight: 16,
  },
  modalCloseButton: {
    padding: 4,
  },
  monthFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 16,
  },
  monthFilterText: {
    fontSize: 14,
    color: '#1f1f1f',
  },
  ordersList: {
    maxHeight: 350,
  },
  orderItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  orderItemSelected: {
    backgroundColor: '#E8F5E9',
    borderColor: '#81C784',
  },
  orderItemLeft: {
    flex: 1,
  },
  orderItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  orderNo: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1f1f1f',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusPending: {
    backgroundColor: '#FFF9C4',
  },
  statusDelivered: {
    backgroundColor: '#E8F5E9',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusDotPending: {
    backgroundColor: '#FFC107',
  },
  statusDotDelivered: {
    backgroundColor: '#4CAF50',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  statusTextPending: {
    color: '#F57F17',
  },
  statusTextDelivered: {
    color: '#2E7D32',
  },
  orderItemsSummary: {
    fontSize: 12,
    color: '#7A7A7A',
    marginBottom: 8,
  },
  orderFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  orderDate: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  orderAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1f1f1f',
  },
  confirmButton: {
    backgroundColor: '#FFEDB5',
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  confirmButtonActive: {
    backgroundColor: '#FFD700',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f1f1f',
  },
});
