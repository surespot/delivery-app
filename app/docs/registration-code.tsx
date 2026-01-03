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

export default function RegistrationCodeScreen() {
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
          <Text style={styles.documentTitle}>How to Become a Surespot Rider</Text>
          <Text style={styles.eligibilityText}>Eligibility: You must be 18 years or older to apply.</Text>
        </View>

        <View style={styles.contactSection}>
          <Text style={styles.contactText}>
            If you have questions, contact Surespot Rider Support:
          </Text>
          <Text style={styles.contactDetail}>
            <Text style={styles.contactLabel}>Email:</Text> support@surespot.com
          </Text>
          <Text style={styles.contactDetail}>
            <Text style={styles.contactLabel}>Phone:</Text> +2349120897829
          </Text>
          <Text style={styles.contactDetail}>
            <Text style={styles.contactLabel}>In-app Help:</Text> Open the Riders app → Help → Contact Support
          </Text>
          <Text style={styles.contactDetail}>
            (Or visit any Surespot store location for in-person assistance.)
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Step 1 — Visit a Surespot Recruitment Location (In-Person)</Text>
          <View style={styles.numberedList}>
            <Text style={styles.numberedPoint}>1. Go to any Surespot store that accepts rider applications.</Text>
            <Text style={styles.numberedPoint}>2. Tell the staff you want to register as a rider. They will provide the application form and confirm your identity.</Text>
            <Text style={styles.numberedPoint}>3. What to bring:</Text>
          </View>
          <View style={styles.bulletList}>
            <Text style={styles.bulletPoint}>• Valid government ID (national ID, driver&apos;s license, or passport)</Text>
            <Text style={styles.bulletPoint}>• Proof of address (utility bill, bank statement, or official letter)</Text>
            <Text style={styles.bulletPoint}>• Recent passport-style photo</Text>
            <Text style={styles.bulletPoint}>• Bank account details or mobile money details for payouts (account number, bank name)</Text>
            <Text style={styles.bulletPoint}>• Any vehicle documentation (if you&apos;ll use a motorcycle/vehicle)</Text>
            <Text style={styles.bulletPoint}>• Emergency contact name &amp; phone number</Text>
          </View>
          <View style={styles.numberedList}>
            <Text style={styles.numberedPoint}>4. Staff will review your documents and complete a short verification check on the spot.</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Step 2 — Vetting &amp; Brief Screening</Text>
          <View style={styles.numberedList}>
            <Text style={styles.numberedPoint}>1. The recruitment team will perform a quick vetting process: identity verification, eligibility checks, and a short interview about availability and experience.</Text>
            <Text style={styles.numberedPoint}>2. They may run a basic background check depending on local rules and Surespot policy.</Text>
            <Text style={styles.numberedPoint}>3. If everything looks good, they&apos;ll confirm next steps and collect contact details (phone and email).</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Step 3 — Receive Your Activation Link or Code</Text>
          <View style={styles.numberedList}>
            <Text style={styles.numberedPoint}>1. After successful vetting, Surespot will contact you via the phone number or email you provided.</Text>
            <Text style={styles.numberedPoint}>2. You will receive either:</Text>
          </View>
          <View style={styles.bulletList}>
            <Text style={styles.bulletPoint}>• A unique activation link (tap to open), or</Text>
            <Text style={styles.bulletPoint}>• A 12-character activation code to enter in the Riders app.</Text>
          </View>
          <View style={styles.numberedList}>
            <Text style={styles.numberedPoint}>3. Save this message, it&apos;s how you finalize your registration.</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Step 4 — Install &amp; Open the Riders App</Text>
          <View style={styles.numberedList}>
            <Text style={styles.numberedPoint}>1. Download the Surespot Riders app from the App Store / Play Store (search &quot;Surespot Riders&quot;).</Text>
            <Text style={styles.numberedPoint}>2. Open the app and choose Sign Up.</Text>
            <Text style={styles.numberedPoint}>3. Enter your phone number and verify (you may receive an SMS code).</Text>
            <Text style={styles.numberedPoint}>4. When asked for an activation code, either:</Text>
          </View>
          <View style={styles.bulletList}>
            <Text style={styles.bulletPoint}>• Tap the activation link you received (it will open the app and pre-fill your code), or</Text>
            <Text style={styles.bulletPoint}>• Enter the activation code manually in the app.</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Step 5 — Finish Your In-App Profile</Text>
          <View style={styles.numberedList}>
            <Text style={styles.numberedPoint}>1. Complete your profile in the app:</Text>
          </View>
          <View style={styles.bulletList}>
            <Text style={styles.bulletPoint}>• Full name (exactly as on your ID)</Text>
            <Text style={styles.bulletPoint}>• Upload a clear profile photo</Text>
            <Text style={styles.bulletPoint}>• Vehicle type (if applicable)</Text>
            <Text style={styles.bulletPoint}>• Bank or mobile money payout details</Text>
            <Text style={styles.bulletPoint}>• Emergency contact info</Text>
          </View>
          <View style={styles.numberedList}>
            <Text style={styles.numberedPoint}>2. Agree to Surespot&apos;s Rider Terms &amp; Conditions and Safety Guidelines.</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Step 6 — Activate Availability &amp; Start Accepting Orders</Text>
          <View style={styles.numberedList}>
            <Text style={styles.numberedPoint}>1. Once verified, your account status will be set to Active. You&apos;ll see the &quot;Available Orders Near Me&quot; screen in the Riders app.</Text>
            <Text style={styles.numberedPoint}>2. Toggle your availability (On/Off) depending on when you want to work.</Text>
            <Text style={styles.numberedPoint}>3. You&apos;ll start seeing available delivery requests nearby. You can choose which orders to accept. (Surespot may also mark some orders as &quot;assigned&quot;; you still confirm acceptance.)</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Step 7 — Payments &amp; Ratings</Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletPoint}>• Payment schedule: Withdrawals are processed weekly (every Saturday). Make sure your payout details are correct.</Text>
            <Text style={styles.bulletPoint}>• Earnings: You get paid per successful delivery. The app shows order earnings and totals.</Text>
            <Text style={styles.bulletPoint}>• Ratings: Customers can rate you after deliveries. Keep good service for higher ratings and bonuses.</Text>
          </View>
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
    marginBottom: 0,
    textAlign: 'center',
  },
  contactSection: {
    marginBottom: 32,
  },
  contactText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f1f1f',
    marginBottom: 8,
  },
  contactDetail: {
    fontSize: 14,
    color: '#1f1f1f',
    lineHeight: 20,
    marginBottom: 4,
  },
  contactLabel: {
    fontWeight: '700',
  },
  eligibilityText: {
    fontSize: 14,
    color: '#1f1f1f',
    marginTop: 0,
    textAlign: 'center',
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
  subsectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f1f1f',
    marginTop: 8,
    marginBottom: 4,
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
  numberedList: {
    marginLeft: 0,
    marginTop: 4,
    marginBottom: 8,
  },
  numberedPoint: {
    fontSize: 14,
    color: '#1f1f1f',
    lineHeight: 20,
    marginBottom: 8,
  },
});

