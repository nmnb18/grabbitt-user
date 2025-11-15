import { QrCode } from '@/components/shared/qr-code';
import { Button } from '@/components/ui/paper-button';
import { QRMode, useSellerQR } from '@/hooks/use-qr';
import { useTheme } from '@/hooks/use-theme-color';
import api from '@/services/axiosInstance';
import { useAuthStore } from '@/store/authStore';
import { AppStyles, Colors } from '@/utils/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  Card,
  Divider,
  HelperText,
  SegmentedButtons,
  Text,
  TextInput,
} from 'react-native-paper';

export default function SellerGenerateQR() {
  const theme = useTheme();
  const { user } = useAuthStore();
  const sellerProfile = user?.user?.seller_profile;

  // ✅ shared QR state (same as dashboard)
  const { activeQR, generateQR } = useSellerQR({
    autoLoad: true,
    pollIntervalMs: 60000
  });

  const [loading, setLoading] = useState(false);

  const registeredQrType: QRMode =
    (sellerProfile?.qr_settings?.qr_code_type as QRMode) ?? 'dynamic';
  const tier = sellerProfile?.subscription?.tier ?? 'free';

  const [qrMode, setQRMode] = useState<QRMode>(registeredQrType);
  const [hiddenCode, setHiddenCode] = useState('');
  const [expiryHours, setExpiryHours] = useState('24');
  const [pointValue, setPointsValue] = useState(
    sellerProfile?.rewards?.default_points_value?.toString() ?? '50'
  );

  const isFree = tier === 'free';

  const handleGenerateQR = async () => {
    // basic validation
    if (qrMode === 'static_hidden' && !hiddenCode) {
      Alert.alert('Error', 'Please enter a hidden code');
      return;
    }

    // 🔐 plan rules
    const qrTypeFromProfile: QRMode = registeredQrType;

    // Free: only registered QR type + monthly limit + single active QR
    if (isFree) {
      if (qrMode !== qrTypeFromProfile) {
        Alert.alert(
          'Plan Restriction',
          `You can only generate your registered QR type (${qrTypeFromProfile.toUpperCase()}) on the Free tier.`
        );
        return;
      }

      // Monthly limit (10)
      try {
        setLoading(true);
        const qrStats = await api.get('/countMonthlyQRCodes');
        const total = qrStats.data?.count || 0;
        if (total >= 10) {
          Alert.alert(
            'Limit Reached',
            'You have reached your 10 QR/month limit. Upgrade to Pro or Premium for unlimited QR generation.'
          );
          setLoading(false);
          return;
        }
      } catch (e) {
        console.warn('QR count check failed:', e);
        setLoading(false);
        Alert.alert(
          'Error',
          'Unable to verify your monthly QR limit. Please try again.'
        );
        return;
      }

      // Free + already active QR => block
      if (activeQR) {
        Alert.alert(
          'Plan Restriction',
          'You already have an active QR code. Upgrade your plan to generate multiple QR codes.'
        );
        return;
      }
    }

    // Pro: only registered QR type
    if (tier === 'pro' && qrMode !== qrTypeFromProfile) {
      Alert.alert(
        'Plan Restriction',
        `You can only generate ${qrTypeFromProfile.toUpperCase()} QRs in your current Pro plan.`
      );
      return;
    }

    const proceedGenerate = async () => {
      try {
        setLoading(true);

        const payload: any = {
          qr_code_type: qrMode,
          points_value: parseInt(pointValue, 10) || 0,
        };

        if (qrMode === 'dynamic') {
          // label is "Expiry Time (hours)" so convert to minutes for backend
          const hours = parseInt(expiryHours, 10) || 24;
          payload.expires_in_minutes = hours * 60;
        } else if (qrMode === 'static_hidden') {
          // optional: send hidden_code (backend currently auto-generates its own, but this won't hurt)
          payload.hidden_code = hiddenCode;
        }

        await generateQR(payload);

        Alert.alert('Success', 'QR code generated successfully!');
      } catch (error: any) {
        console.error('Generate QR error:', error);
        Alert.alert(
          'Error',
          error?.response?.data?.detail ||
          error?.response?.data?.error ||
          'Failed to generate QR code'
        );
      } finally {
        setLoading(false);
      }
    };

    // Pro/Premium: if there is already an active QR, confirm overwrite
    if (activeQR && (tier === 'pro' || tier === 'premium')) {
      Alert.alert(
        'Replace Active QR?',
        'You already have an active QR. Creating a new one will deactivate the previous QR. Do you want to proceed?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Continue', onPress: proceedGenerate },
        ]
      );
    } else {
      proceedGenerate();
    }
  };

  const getModeDescription = () => {
    switch (qrMode) {
      case 'dynamic':
        return 'Expires after the set time. Best for temporary campaigns.';
      case 'static':
        return 'Never expires. Can be scanned multiple times (once per day per user).';
      case 'static_hidden':
        return 'Never expires. Requires a hidden code for extra security.';
      default:
        return '';
    }
  };

  return (
    <View style={[styles.container]}>
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* QR Mode Selection */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              QR Code Type
            </Text>
            <Divider style={styles.divider} />

            <SegmentedButtons
              value={qrMode}
              onValueChange={(value) => setQRMode(value as QRMode)}
              buttons={[
                {
                  value: 'dynamic',
                  label: 'Dynamic',
                  icon: 'clock-outline',
                },
                {
                  value: 'static',
                  label: 'Static',
                  icon: 'qrcode',
                },
              ]}
              theme={{
                colors: {
                  secondaryContainer: Colors.light.surface,
                  onSecondaryContainer: Colors.light.secondary,
                  primary: Colors.light.secondary,
                },
              }}
              style={styles.segmentedButtons}
            />

            <Card style={styles.infoCard}>
              <Card.Content style={styles.infoContent}>
                <MaterialCommunityIcons
                  name="information"
                  size={20}
                  color={theme.colors.primary}
                />
                <Text variant="bodySmall" style={styles.infoText}>
                  {getModeDescription()}
                </Text>
              </Card.Content>
            </Card>
          </Card.Content>
        </Card>

        {/* QR Settings */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Settings
            </Text>
            <Divider style={styles.divider} />

            {qrMode === 'dynamic' && (
              <>
                <TextInput
                  label="Expiry Time (hours)"
                  value={expiryHours}
                  onChangeText={setExpiryHours}
                  mode="outlined"
                  keyboardType="numeric"
                  style={styles.input}
                  disabled={isFree}
                  left={<TextInput.Icon icon="timer" />}
                  outlineColor={Colors.light.outline}
                  activeOutlineColor={theme.colors.accent}
                />
                <HelperText type="info" style={styles.helperText}>
                  {isFree
                    ? 'For free tier, QR codes expire automatically in 24 hours.'
                    : 'Set how long your dynamic QR remains active before expiring.'}
                </HelperText>
              </>
            )}

            <TextInput
              label="Points Value"
              value={pointValue}
              onChangeText={setPointsValue}
              mode="outlined"
              keyboardType="numeric"
              style={styles.input}
              disabled={isFree}
              left={<TextInput.Icon icon="star-circle" />}
              outlineColor={Colors.light.outline}
              activeOutlineColor={theme.colors.accent}
            />
            <HelperText type="info" style={styles.helperText}>
              This defines how many loyalty points a customer earns for scanning
              this QR.
            </HelperText>

            {qrMode === 'static_hidden' && (
              <>
                <TextInput
                  label="Hidden Code"
                  value={hiddenCode}
                  onChangeText={setHiddenCode}
                  mode="outlined"
                  style={styles.input}
                  left={<TextInput.Icon icon="key" />}
                  placeholder="Enter a secret code..."
                  outlineColor={Colors.light.outline}
                  activeOutlineColor={theme.colors.accent}
                />
                <HelperText type="info" style={styles.helperText}>
                  Customers must enter this secret code after scanning the QR.
                </HelperText>
              </>
            )}

            <Button
              variant="contained"
              onPress={handleGenerateQR}
              loading={loading}
              disabled={loading}
              icon="qrcode-plus"
            >
              Generate QR Code
            </Button>
          </Card.Content>
        </Card>

        {/* Active QR Preview (from shared hook) */}
        {activeQR && (
          <QrCode qrMode={activeQR.qr_type} qrData={activeQR} />
        )}

        {/* Usage Instructions */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              How to Use
            </Text>
            <Divider style={styles.divider} />

            <View style={styles.instructionItem}>
              <View
                style={[
                  styles.instructionNumber,
                  { backgroundColor: Colors.light.primary },
                ]}
              >
                <Text variant="labelLarge" style={styles.instructionNumberText}>
                  1
                </Text>
              </View>
              <Text variant="bodyMedium" style={styles.instructionText}>
                Display the QR code to your customer.
              </Text>
            </View>

            <View style={styles.instructionItem}>
              <View
                style={[
                  styles.instructionNumber,
                  { backgroundColor: Colors.light.primary },
                ]}
              >
                <Text variant="labelLarge" style={styles.instructionNumberText}>
                  2
                </Text>
              </View>
              <Text variant="bodyMedium" style={styles.instructionText}>
                Customer scans the QR code with their app.
              </Text>
            </View>

            {qrMode === 'static_hidden' && (
              <View style={styles.instructionItem}>
                <View
                  style={[
                    styles.instructionNumber,
                    { backgroundColor: Colors.light.primary },
                  ]}
                >
                  <Text
                    variant="labelLarge"
                    style={styles.instructionNumberText}
                  >
                    3
                  </Text>
                </View>
                <Text variant="bodyMedium" style={styles.instructionText}>
                  Customer enters the hidden code you shared.
                </Text>
              </View>
            )}

            <View style={styles.instructionItem}>
              <View
                style={[
                  styles.instructionNumber,
                  { backgroundColor: Colors.light.primary },
                ]}
              >
                <Text variant="labelLarge" style={styles.instructionNumberText}>
                  {qrMode === 'static_hidden' ? '4' : '3'}
                </Text>
              </View>
              <Text variant="bodyMedium" style={styles.instructionText}>
                Points are automatically added to their wallet!
              </Text>
            </View>
          </Card.Content>
        </Card>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: AppStyles.spacing.md,
    paddingTop: AppStyles.spacing.md,
  },
  card: {
    marginBottom: AppStyles.spacing.md,
    borderRadius: AppStyles.card.borderRadius,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.outline,
  },
  cardTitle: {
    fontWeight: '600',
    marginBottom: AppStyles.spacing.sm,
    color: Colors.light.text,
  },
  divider: {
    marginBottom: AppStyles.spacing.md,
    backgroundColor: Colors.light.outline,
  },
  segmentedButtons: {
    marginBottom: AppStyles.spacing.md,
    backgroundColor: 'white',
  },
  infoCard: {
    elevation: 0,
    backgroundColor: Colors.light.surfaceVariant,
  },
  infoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: AppStyles.spacing.sm,
  },
  infoText: {
    flex: 1,
    color: Colors.light.text,
  },
  input: {
    backgroundColor: Colors.light.surface,
  },
  helperText: {
    marginBottom: AppStyles.spacing.md,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: AppStyles.spacing.md,
  },
  instructionNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: AppStyles.spacing.md,
  },
  instructionNumberText: {
    color: Colors.light.onPrimary,
    fontWeight: '600',
  },
  instructionText: {
    flex: 1,
    color: Colors.light.text,
  },
  bottomSpacer: {
    height: AppStyles.spacing.lg,
  },
});
