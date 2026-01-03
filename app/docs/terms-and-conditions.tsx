import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

export default function TermsAndConditionsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Feather name="chevron-left" size={20} color="#1f1f1f" />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleSection}>
          <Text style={styles.documentTitle}>Terms & Conditions</Text>
          <Text style={styles.lastUpdated}>Last Updated: 22nd November, 2025</Text>
        </View>

        <Text style={styles.introText}>
          Welcome to Surespot. By accessing or using our delivery rider app and services (&quot;Services&quot;), you agree to be bound by these Terms &amp; Conditions (&quot;Terms&quot;). Please read them carefully. If you do not agree, you may not use our Services as a delivery rider.
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
          <Text style={styles.sectionText}>
            By creating a rider account, accessing, or using Surespot as a delivery rider, you confirm that:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletPoint}>• You are at least 18 years old (or the legal age in your jurisdiction).</Text>
            <Text style={styles.bulletPoint}>• You have the legal capacity to enter into this agreement.</Text>
            <Text style={styles.bulletPoint}>• You possess a valid driver&apos;s license or appropriate vehicle registration (if required).</Text>
            <Text style={styles.bulletPoint}>• You have valid insurance coverage for your vehicle (if applicable).</Text>
            <Text style={styles.bulletPoint}>• You agree to comply with these Terms and all applicable laws and regulations.</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Changes to These Terms</Text>
          <Text style={styles.sectionText}>
            We may update or modify these Terms at any time. When we do, we&apos;ll update the &quot;Last Updated&quot; date above. Continued use of the Services as a delivery rider means you accept the updated Terms. We will notify you of significant changes through the app or via email.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Rider Accounts</Text>
          <Text style={styles.sectionText}>
            When creating a rider account:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletPoint}>• You must provide accurate, complete, and up-to-date information.</Text>
            <Text style={styles.bulletPoint}>• You must verify your identity and provide required documentation.</Text>
            <Text style={styles.bulletPoint}>• You are responsible for maintaining the confidentiality of your login details.</Text>
            <Text style={styles.bulletPoint}>• You agree to notify us immediately if you suspect unauthorized use of your account.</Text>
            <Text style={styles.bulletPoint}>• We are not responsible for any loss resulting from someone using your account without your permission.</Text>
            <Text style={styles.bulletPoint}>• You must maintain accurate vehicle and insurance information in your account.</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Independent Contractor Relationship</Text>
          <Text style={styles.sectionText}>
            As a delivery rider on Surespot, you are an independent contractor, not an employee of Surespot. This means:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletPoint}>• You are responsible for your own taxes and insurance.</Text>
            <Text style={styles.bulletPoint}>• You have the freedom to choose when and how often you work.</Text>
            <Text style={styles.bulletPoint}>• You are responsible for all costs associated with your vehicle and delivery operations.</Text>
            <Text style={styles.bulletPoint}>• You are not entitled to employee benefits such as health insurance, paid leave, or retirement benefits.</Text>
            <Text style={styles.bulletPoint}>• You are responsible for complying with all local, state, and federal laws applicable to independent contractors.</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Vehicle and Safety Requirements</Text>
          <Text style={styles.sectionText}>
            As a delivery rider, you agree to:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletPoint}>• Maintain a valid driver&apos;s license and vehicle registration (if applicable).</Text>
            <Text style={styles.bulletPoint}>• Ensure your vehicle is in safe, roadworthy condition at all times.</Text>
            <Text style={styles.bulletPoint}>• Maintain valid insurance coverage for your vehicle (if required by law).</Text>
            <Text style={styles.bulletPoint}>• Comply with all traffic laws and regulations while making deliveries.</Text>
            <Text style={styles.bulletPoint}>• Not operate a vehicle under the influence of drugs or alcohol.</Text>
            <Text style={styles.bulletPoint}>• Report any accidents or incidents to Surespot immediately.</Text>
            <Text style={styles.bulletPoint}>• Update your vehicle information if it changes.</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Delivery Services</Text>
          <Text style={styles.sectionText}>
            When accepting and completing delivery requests:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletPoint}>• You agree to accept delivery requests in good faith and complete them as assigned.</Text>
            <Text style={styles.bulletPoint}>• You must pick up orders from restaurants/merchants in a timely manner.</Text>
            <Text style={styles.bulletPoint}>• You must deliver orders to customers accurately and within estimated timeframes.</Text>
            <Text style={styles.bulletPoint}>• You are responsible for the safe handling and transportation of orders.</Text>
            <Text style={styles.bulletPoint}>• You must maintain professional conduct with customers, restaurant staff, and other riders.</Text>
            <Text style={styles.bulletPoint}>• You agree to use the app&apos;s navigation and tracking features during active deliveries.</Text>
            <Text style={styles.bulletPoint}>• You must report any issues, delays, or problems with deliveries through the app.</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Earnings and Payments</Text>
          <Text style={styles.sectionText}>
            Regarding your earnings as a delivery rider:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletPoint}>• You will receive earnings for each completed delivery as specified in the app.</Text>
            <Text style={styles.bulletPoint}>• Earnings are calculated based on delivery fees, distance, and any applicable bonuses or incentives.</Text>
            <Text style={styles.bulletPoint}>• Weekly payouts will be processed to your registered bank account.</Text>
            <Text style={styles.bulletPoint}>• You are responsible for reporting your earnings and paying applicable taxes.</Text>
            <Text style={styles.bulletPoint}>• We reserve the right to adjust earnings in cases of fraud, policy violations, or customer disputes.</Text>
            <Text style={styles.bulletPoint}>• Payment processing times may vary and are subject to banking procedures.</Text>
            <Text style={styles.bulletPoint}>• You must maintain accurate bank account information for payouts.</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Ratings and Performance</Text>
          <Text style={styles.sectionText}>
            Your performance as a delivery rider:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletPoint}>• Customers may rate your delivery service after each completed order.</Text>
            <Text style={styles.bulletPoint}>• Your overall rating affects your eligibility for certain delivery requests and incentives.</Text>
            <Text style={styles.bulletPoint}>• Consistently low ratings or policy violations may result in account suspension or termination.</Text>
            <Text style={styles.bulletPoint}>• You agree to maintain professional standards and provide quality service.</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. Use of Services</Text>
          <Text style={styles.sectionText}>
            You agree to use our Services only for lawful purposes and in accordance with these Terms. You agree not to:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletPoint}>• Violate any applicable laws or regulations while making deliveries.</Text>
            <Text style={styles.bulletPoint}>• Engage in fraudulent activities, including fake deliveries or manipulation of the system.</Text>
            <Text style={styles.bulletPoint}>• Harass, abuse, or harm customers, restaurant staff, or other riders.</Text>
            <Text style={styles.bulletPoint}>• Tamper with or damage orders during delivery.</Text>
            <Text style={styles.bulletPoint}>• Use the app while operating a vehicle unsafely or illegally.</Text>
            <Text style={styles.bulletPoint}>• Attempt to gain unauthorized access to our systems or other riders&apos; accounts.</Text>
            <Text style={styles.bulletPoint}>• Interfere with or disrupt the Services or other riders&apos; deliveries.</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>10. Intellectual Property</Text>
          <Text style={styles.sectionText}>
            All content, features, and functionality of the Services, including but not limited to text, graphics, logos, and software, are owned by Surespot and are protected by copyright, trademark, and other intellectual property laws. You may not copy, modify, or distribute any content from the app without our written permission.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>11. Limitation of Liability</Text>
          <Text style={styles.sectionText}>
            To the fullest extent permitted by law, Surespot shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Services as a delivery rider, including but not limited to:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletPoint}>• Vehicle accidents or damages during deliveries.</Text>
            <Text style={styles.bulletPoint}>• Loss of earnings or business opportunities.</Text>
            <Text style={styles.bulletPoint}>• Customer disputes or complaints.</Text>
            <Text style={styles.bulletPoint}>• Technical issues or app malfunctions.</Text>
            <Text style={styles.bulletPoint}>• Any loss of data, use, goodwill, or other intangible losses.</Text>
          </View>
          <Text style={styles.sectionText}>
            You are responsible for your own insurance coverage and assume all risks associated with providing delivery services.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>12. Termination</Text>
          <Text style={styles.sectionText}>
            We may terminate or suspend your rider account and access to the Services immediately, without prior notice, for:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletPoint}>• Any breach of these Terms or our policies.</Text>
            <Text style={styles.bulletPoint}>• Fraudulent activity or misrepresentation.</Text>
            <Text style={styles.bulletPoint}>• Repeated policy violations or poor performance.</Text>
            <Text style={styles.bulletPoint}>• Safety concerns or legal violations.</Text>
            <Text style={styles.bulletPoint}>• Any other reason we deem necessary to protect the platform, customers, or other riders.</Text>
          </View>
          <Text style={styles.sectionText}>
            Upon termination, you will receive any outstanding earnings owed to you, subject to deductions for any violations or disputes.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>13. Governing Law</Text>
          <Text style={styles.sectionText}>
            These Terms shall be governed by and construed in accordance with the laws of Nigeria, without regard to its conflict of law provisions. Any disputes arising from these Terms or your use of the Services shall be resolved through appropriate legal channels in Nigeria.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>14. Contact Us</Text>
          <Text style={styles.sectionText}>
            If you have any questions about these Terms or your rights and responsibilities as a delivery rider, please contact us through the app or at support@surespot.com.
          </Text>
        </View>
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
    paddingHorizontal: 24,
    marginTop: 30,
    paddingBottom: 16,
    gap: 16,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 40,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  documentTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f1f1f',
    marginBottom: 4,
    textAlign: 'center',
  },
  lastUpdated: {
    fontSize: 12,
    color: '#4f4f4f',
    textAlign: 'center',
  },
  introText: {
    fontSize: 14,
    color: '#1f1f1f',
    lineHeight: 20,
    marginBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f1f1f',
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 14,
    color: '#1f1f1f',
    lineHeight: 20,
    marginBottom: 8,
  },
  bulletList: {
    marginLeft: 8,
    marginTop: 4,
  },
  bulletPoint: {
    fontSize: 14,
    color: '#1f1f1f',
    lineHeight: 20,
    marginBottom: 8,
  },
});

