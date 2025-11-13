import AccountInformation from '@/components/profile/account-information';
import BusinessInformation from '@/components/profile/business-information';
import LocationDetails from '@/components/profile/location-details';
import RewardsSettings from '@/components/profile/reward-settings';
import VerificationDetails from '@/components/profile/verification-details';
import { Button } from '@/components/ui/paper-button';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View
} from 'react-native';
import {
  Card,
  Chip,
  Divider,
  HelperText,
  Text
} from 'react-native-paper';
import { useAuthStore } from '../../../store/authStore';

export default function SellerProfileSetup() {
  const router = useRouter();
  const { user } = useAuthStore();
  const subscription = user?.user.seller_profile?.subscription;
  const expiryText = subscription?.expires_at
    ? `Expires on ${new Date(subscription?.expires_at?._seconds * 1000).toLocaleDateString()}`
    : 'No expiry set';

  return (
    <View style={styles.container}>


      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* ACCOUNT INFORMATION */}
          <AccountInformation />

          {/* BUSINESS INFORMATION */}
          <BusinessInformation />

          {/* LOCATION DETAILS */}
          <LocationDetails />

          {/* VERIFICATION */}
          <VerificationDetails />

          {/* REWARDS SETTINGS */}
          <RewardsSettings />

          {/* SUBSCRIPTION */}
          <Card style={styles.card} elevation={3}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.cardTitle}>💎 Subscription</Text>
              <Divider style={styles.divider} />
              <View style={styles.subRow}>
                <Chip style={styles.planChip} icon="crown">
                  {subscription?.tier?.toUpperCase()}
                </Chip>
                <Chip style={styles.expChip} icon="calendar">
                  {expiryText}
                </Chip>
              </View>

              <HelperText type="info">
                Plan changes are handled on the Subscription page.
              </HelperText>

              <Button
                variant="outlined"
                icon="arrow-right-bold-circle"
                onPress={() => router.push('/(drawer)/subscription')}
              >
                Go to Subscription
              </Button>
            </Card.Content>
          </Card>

          {/* SAVE */}

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },



  keyboardView: { flex: 1 },
  content: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 8 },

  card: {
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: { fontWeight: '600', marginBottom: 12 },
  divider: { marginBottom: 16, height: 1.2, backgroundColor: '#0D737733' },

  input: { marginBottom: 12, backgroundColor: '#FFFFFF' },
  label: { marginBottom: 8 },
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  selectChip: { backgroundColor: '#F3F4F6' },
  disabledChip: { opacity: 0.5 },

  row: { flexDirection: 'row', gap: 12 },
  inline: { flexDirection: 'row', alignItems: 'center', marginTop: 4, marginBottom: 4 },
  half: { flex: 1 },

  subRow: { flexDirection: 'row', gap: 8, marginBottom: 8, flexWrap: 'wrap' },
  planChip: { backgroundColor: '#EEF2FF' },
  expChip: { backgroundColor: '#ECFDF5' },
  bottomSpacer: { height: 80 },
});
