import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    id: '1',
    question: 'How do I become a Surespot rider?',
    answer: 'To become a Surespot rider, download the app, register with your details, complete the verification process, and attend the onboarding session at a physical store.',
  },
  {
    id: '2',
    question: 'What are the requirements to register as a rider?',
    answer: 'You need a valid government ID, a smartphone, a vehicle (bike or car), and you must be at least 18 years old. You will also need to pass a background check.',
  },
  {
    id: '3',
    question: 'Where can I get the registration code?',
    answer: 'You can get the registration code at any Surespot physical store or partner location. Present your ID and they will provide you with a unique registration code.',
  },
  {
    id: '4',
    question: "I didn't receive my code. What should I do?",
    answer: 'If you did not receive your code, please visit the nearest Surespot store with your ID or contact support through the app for assistance.',
  },
  {
    id: '5',
    question: 'Can I register online without going to a physical store?',
    answer: 'Currently, all riders must complete their registration at a physical store for identity verification. Online-only registration is not available at this time.',
  },
  {
    id: '6',
    question: 'What documents do I need during the physical onboarding?',
    answer: 'Bring your valid government-issued ID, proof of address, vehicle registration (if applicable), and any other documents requested during online registration.',
  },
  {
    id: '7',
    question: 'How do I go online or offline in the app?',
    answer: 'You can toggle your online/offline status using the switch on the Home screen or in your Profile. When offline, you will not receive new order notifications.',
  },
];

export default function FAQScreen() {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Feather name="chevron-left" size={20} color="#1f1f1f" />
        </Pressable>
        <Text style={styles.headerTitle}>FAQ</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {FAQ_ITEMS.map((item) => {
          const isExpanded = expandedId === item.id;

          return (
            <Pressable
              key={item.id}
              style={styles.faqItem}
              onPress={() => toggleExpand(item.id)}>
              <View style={styles.faqHeader}>
                <Text style={styles.question}>{item.question}</Text>
                <Feather
                  name={isExpanded ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color="#7A7A7A"
                />
              </View>

              {isExpanded && (
                <View style={styles.answerContainer}>
                  <Text style={styles.answer}>{item.answer}</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>
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
    paddingTop: 16,
    paddingBottom: 40,
  },
  faqItem: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  question: {
    fontSize: 14,
    fontWeight: '400',
    color: '#1f1f1f',
    flex: 1,
    marginRight: 12,
  },
  answerContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  answer: {
    fontSize: 14,
    color: '#4F4F4F',
    lineHeight: 22,
  },
});
