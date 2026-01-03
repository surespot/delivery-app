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

export default function PrivacyPolicyScreen() {
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
          <Text style={styles.documentTitle}>Privacy Policy</Text>
          <Text style={styles.lastUpdated}>Last Updated: 22nd November, 2025</Text>
        </View>

        <Text style={styles.introText}>
          Surespot (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, store, and protect your information when you use our delivery rider app and related services (&quot;Services&quot;). By accessing or using Surespot as a delivery rider, you agree to the terms described in this Privacy Policy.
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Information We Collect</Text>
          
          <View style={styles.subsection}>
            <Text style={styles.subsectionTitle}>1.1 Information You Provide to Us</Text>
            <Text style={styles.sectionText}>
              We may collect personal information that you voluntarily provide when creating a rider account or using Surespot, including:
            </Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletPoint}>• Full name and identification documents</Text>
              <Text style={styles.bulletPoint}>• Email address and phone number</Text>
              <Text style={styles.bulletPoint}>• Profile photo and verification documents</Text>
              <Text style={styles.bulletPoint}>• Vehicle information (type, registration, insurance)</Text>
              <Text style={styles.bulletPoint}>• Bank account details for earnings payouts</Text>
              <Text style={styles.bulletPoint}>• Work schedule preferences and availability</Text>
              <Text style={styles.bulletPoint}>• Emergency contact information</Text>
              <Text style={styles.bulletPoint}>• Any content you submit within the app</Text>
            </View>
          </View>

          <View style={styles.subsection}>
            <Text style={styles.subsectionTitle}>1.2 Automatically Collected Information</Text>
            <Text style={styles.sectionText}>
              When using Surespot as a delivery rider, we automatically collect:
            </Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletPoint}>• Real-time location data during active deliveries</Text>
              <Text style={styles.bulletPoint}>• Delivery route history and navigation data</Text>
              <Text style={styles.bulletPoint}>• Device information (model, OS version, device ID)</Text>
              <Text style={styles.bulletPoint}>• Delivery performance metrics (completion times, ratings received)</Text>
              <Text style={styles.bulletPoint}>• Earnings and transaction data</Text>
              <Text style={styles.bulletPoint}>• Log data (IP address, app activity, timestamps)</Text>
              <Text style={styles.bulletPoint}>• Crash reports and performance analytics</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
          <Text style={styles.sectionText}>
            We use the information we collect to:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletPoint}>• Match you with delivery requests and optimize route assignments</Text>
            <Text style={styles.bulletPoint}>• Process and distribute your earnings and payments</Text>
            <Text style={styles.bulletPoint}>• Track delivery progress and provide real-time updates to customers</Text>
            <Text style={styles.bulletPoint}>• Communicate with you about deliveries, account updates, and platform changes</Text>
            <Text style={styles.bulletPoint}>• Calculate and display your ratings and performance metrics</Text>
            <Text style={styles.bulletPoint}>• Send you promotional materials, incentives, and updates (with your consent)</Text>
            <Text style={styles.bulletPoint}>• Verify your identity and ensure platform safety</Text>
            <Text style={styles.bulletPoint}>• Detect and prevent fraud, abuse, or safety violations</Text>
            <Text style={styles.bulletPoint}>• Comply with legal obligations and regulatory requirements</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Information Sharing and Disclosure</Text>
          <Text style={styles.sectionText}>
            We do not sell your personal information. We may share your information only in the following circumstances:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletPoint}>• With customers: Your name, photo, vehicle type, and real-time location during active deliveries</Text>
            <Text style={styles.bulletPoint}>• With service providers who assist us in operating our Services (payment processors, mapping services)</Text>
            <Text style={styles.bulletPoint}>• With restaurants and merchants to coordinate delivery pickups</Text>
            <Text style={styles.bulletPoint}>• When required by law, legal process, or to protect our rights and safety</Text>
            <Text style={styles.bulletPoint}>• In connection with a business transfer or merger</Text>
            <Text style={styles.bulletPoint}>• With your explicit consent</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Location Data</Text>
          <Text style={styles.sectionText}>
            As a delivery rider, we collect your location data to:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletPoint}>• Match you with nearby delivery requests</Text>
            <Text style={styles.bulletPoint}>• Provide real-time tracking to customers during deliveries</Text>
            <Text style={styles.bulletPoint}>• Optimize delivery routes and estimate arrival times</Text>
            <Text style={styles.bulletPoint}>• Ensure delivery completion and verify service quality</Text>
          </View>
          <Text style={styles.sectionText}>
            Location data is collected only when you are actively using the app for deliveries. You can control location permissions through your device settings, though disabling location services will limit your ability to receive delivery requests.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Earnings and Payment Information</Text>
          <Text style={styles.sectionText}>
            We collect and process your earnings and payment information to:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletPoint}>• Calculate delivery fees and earnings</Text>
            <Text style={styles.bulletPoint}>• Process weekly payouts to your registered bank account</Text>
            <Text style={styles.bulletPoint}>• Generate earnings statements and tax documentation</Text>
            <Text style={styles.bulletPoint}>• Handle payment disputes or adjustments</Text>
          </View>
          <Text style={styles.sectionText}>
            Your bank account details are encrypted and stored securely. We share payment information only with authorized payment processors necessary to complete transactions.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Data Security</Text>
          <Text style={styles.sectionText}>
            We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes encryption of sensitive data, secure payment processing, and regular security audits. However, no method of transmission over the internet or electronic storage is 100% secure.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Data Retention</Text>
          <Text style={styles.sectionText}>
            We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, including maintaining your rider account, processing payments, and complying with legal obligations. Delivery history and earnings records are retained for tax and accounting purposes as required by law. You may request deletion of your account and associated data, subject to legal retention requirements.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Your Rights</Text>
          <Text style={styles.sectionText}>
            As a delivery rider, you have the right to:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletPoint}>• Access and receive a copy of your personal information and delivery history</Text>
            <Text style={styles.bulletPoint}>• Request correction of inaccurate information (profile, vehicle details, etc.)</Text>
            <Text style={styles.bulletPoint}>• Request deletion of your personal information (subject to legal requirements)</Text>
            <Text style={styles.bulletPoint}>• Object to or restrict processing of your information</Text>
            <Text style={styles.bulletPoint}>• Withdraw consent for location tracking (may affect service availability)</Text>
            <Text style={styles.bulletPoint}>• Request a copy of your earnings statements and tax documents</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Changes to This Privacy Policy</Text>
          <Text style={styles.sectionText}>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last Updated&quot; date. You are advised to review this Privacy Policy periodically.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. Contact Us</Text>
          <Text style={styles.sectionText}>
            If you have any questions about this Privacy Policy or our data practices, please contact us at support@surespot.com or through the app.
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
  subsection: {
    marginTop: 16,
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: '600',
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

