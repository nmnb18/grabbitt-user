import { QrCode } from '@/components/shared/qr-code';
import { Button } from '@/components/ui/paper-button';
import { useTheme } from '@/hooks/use-theme-color';
import api from '@/services/axiosInstance';
import { useAuthStore } from '@/store/authStore';
import { AppStyles, Colors } from '@/utils/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  View
} from 'react-native';
import {
  Card,
  Divider,
  HelperText,
  SegmentedButtons,
  Text,
  TextInput
} from 'react-native-paper';

const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL;

type QRMode = 'dynamic' | 'static' | 'static_hidden';

export default function SellerGenerateQR() {
  const [loading, setLoading] = useState(false);
  const [qrMode, setQRMode] = useState<QRMode>('dynamic');
  const [hiddenCode, setHiddenCode] = useState('');
  const [expiryMinutes, setExpiryMinutes] = useState('24');
  const [pointValue, setPointsValue] = useState('10');
  //const [qrImage, setQrImage] = useState<string | null>(null);
  const [qrData, setQrData] = useState<any>(null);
  const theme = useTheme();
  const { user } = useAuthStore();
  const sellerProfile = user?.user?.seller_profile;

  useEffect(() => {
    loadData()
  }, []);

  const loadData = async () => {
    const qrResponse = await api.get(`${API_URL}/qr-code/get-active-qr`);
    if (qrResponse.data?.success) {
      setQrData(qrResponse.data.data);
    }
  };

  const handleGenerateQR = async () => {
    if (qrMode === 'static_hidden' && !hiddenCode) {
      Alert.alert('Error', 'Please enter a hidden code');
      return;
    }


    const tier = sellerProfile?.subscription.tier ?? 'free';
    const qrType = sellerProfile?.qr_settings.qr_code_type ?? 'dynamic';
    if (tier === 'free') {
      if (qrType !== qrMode) {
        Alert.alert('Error', `You can only generate your registered QR (${qrType.toUpperCase()}) type on the Free tier.`);
      }

      setLoading(true);
      try {
        const qrStats = await api.get(`${API_URL}/qr-code/count-monthly`);
        const total = qrStats.data?.count || 0;
        setLoading(false);
        if (total >= 10) {
          Alert.alert(
            'Limit Reached',
            'You have reached your 10 QR/month limit. Upgrade to Pro or Premium for unlimited QR generation.'
          );
          return;
        }
      } catch (e) {
        setLoading(false);
        console.warn('QR count check failed:', e);
      }
    }

    // Pro Plan: only registered QR type allowed
    if (tier === 'pro' && qrMode !== sellerProfile?.qr_settings.qr_code_type) {
      Alert.alert(
        'Plan Restriction',
        `You can only generate ${sellerProfile?.qr_settings.qr_code_type?.toUpperCase()} QRs in your current Pro plan.`
      );
      return;
    }

    if (qrMode && (tier === 'pro' || tier === 'premium')) {
      Alert.alert('Warning', 'Looks like you already have an active QR code. Creating a new one will overwrite the old one. Do you want to proceed?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: async () => {
            await generateQR();
          },
        },
      ]);
    } else if (qrMode && tier === 'free') {
      Alert.alert(
        'Plan Restriction',
        `You already have an active QR code. Upgrade your plan to generate multiple QR codes simultaneously.`
      );
    } else {
      generateQR()
    }


  }

  const generateQR = async () => {
    setLoading(true);
    try {
      const payload: any = {
        qr_type: qrMode,
      };

      if (qrMode === 'dynamic') {
        payload.expires_in_minutes = parseInt(expiryMinutes) * 60;
      } else if (qrMode === 'static_hidden') {
        payload.hidden_code = hiddenCode;
      }
      payload.points_value = parseInt(pointValue);

      await api.post(
        `${API_URL}/qr-code/generate-qr`,
        payload
      );
      loadData();
      Alert.alert('Success', 'QR code generated successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  };

  const getModeDescription = () => {
    switch (qrMode) {
      case 'dynamic':
        return 'Expires after set time. Best for temporary use.';
      case 'static':
        return 'Never expires. Can be scanned unlimited times.';
      case 'static_hidden':
        return 'Never expires. Requires hidden code from customer.';
      default:
        return '';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
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
              onValueChange={(value) => {
                setQRMode(value as QRMode);
                //setQrImage(null);
                setQrData(null);
              }}
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
                {
                  value: 'static_hidden',
                  label: 'Hidden',
                  icon: 'lock',
                },
              ]}
              theme={{
                colors: {
                  secondaryContainer: Colors.light.surface, // Selected background
                  onSecondaryContainer: Colors.light.secondary, // Selected text color
                  primary: Colors.light.secondary
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
              <><TextInput
                label="Expiry Time (hours)"
                value={expiryMinutes}
                onChangeText={setExpiryMinutes}
                mode="outlined"
                keyboardType="numeric"
                style={styles.input}
                disabled={sellerProfile?.subscription.tier === 'free'}
                left={<TextInput.Icon icon="timer" />}
                outlineColor={Colors.light.outline}
                activeOutlineColor={theme.colors.accent}
              />
                <HelperText type='info' style={styles.helperText}>{sellerProfile?.subscription.tier === 'free'
                  ? 'For free tier, QR codes expire automatically in 24 hours.'
                  : 'Set how long your dynamic QR remains active before expiring.'}</HelperText>
              </>
            )}
            <TextInput
              label="Points Value"
              value={pointValue}
              onChangeText={setPointsValue}
              mode="outlined"
              keyboardType="numeric"
              style={styles.input}
              left={<TextInput.Icon icon="star-circle" />}
              outlineColor={Colors.light.outline}
              activeOutlineColor={theme.colors.accent}
            />
            <HelperText type='info' style={styles.helperText}>This defines how many loyalty points a customer earns for scanning this QR.</HelperText>
            {qrMode === 'static_hidden' && (
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


        {qrData && (
          <QrCode qrMode={qrMode} qrData={qrData} />
        )}
        {/* Usage Instructions */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              How to Use
            </Text>
            <Divider style={styles.divider} />

            <View style={styles.instructionItem}>
              <View style={[styles.instructionNumber, { backgroundColor: Colors.light.primary }]}>
                <Text variant="labelLarge" style={styles.instructionNumberText}>1</Text>
              </View>
              <Text variant="bodyMedium" style={styles.instructionText}>
                Display the QR code to your customer
              </Text>
            </View>

            <View style={styles.instructionItem}>
              <View style={[styles.instructionNumber, { backgroundColor: Colors.light.primary }]}>
                <Text variant="labelLarge" style={styles.instructionNumberText}>2</Text>
              </View>
              <Text variant="bodyMedium" style={styles.instructionText}>
                Customer scans the QR code with their app
              </Text>
            </View>

            {qrMode === 'static_hidden' && (
              <View style={styles.instructionItem}>
                <View style={[styles.instructionNumber, { backgroundColor: Colors.light.primary }]}>
                  <Text variant="labelLarge" style={styles.instructionNumberText}>3</Text>
                </View>
                <Text variant="bodyMedium" style={styles.instructionText}>
                  Customer enters the hidden code you shared
                </Text>
              </View>
            )}

            <View style={styles.instructionItem}>
              <View style={[styles.instructionNumber, { backgroundColor: Colors.light.primary }]}>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerIcon: {
    margin: 0,
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
  },
  logo: {
    height: 60,
    width: 160
  },
  headerTitle: {
    fontWeight: '700',
    color: Colors.light.text,
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
    backgroundColor: 'white'
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
    marginBottom: AppStyles.spacing.md
  },
  generateButton: {
    borderRadius: AppStyles.card.borderRadius,
    backgroundColor: Colors.light.primary,
  },
  generateButtonContent: {
    paddingVertical: 8,
  },
  qrCard: {
    marginBottom: AppStyles.spacing.md,
    borderRadius: AppStyles.card.borderRadius,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.outline,
    overflow: 'hidden',
  },
  qrCardContent: {
    padding: AppStyles.spacing.lg,
    alignItems: 'center',
  },
  qrContainer: {
    backgroundColor: Colors.light.surface,
    padding: AppStyles.spacing.md,
    borderRadius: AppStyles.card.borderRadius,
    marginBottom: AppStyles.spacing.md,
  },
  qrImage: {
    width: 200,
    height: 200,
  },
  qrInfo: {
    alignItems: 'center',
    gap: AppStyles.spacing.sm,
  },
  qrChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: Colors.light.primary
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: AppStyles.spacing.sm,
  },
  cardActions: {
    paddingHorizontal: AppStyles.spacing.md,
    paddingBottom: AppStyles.spacing.md,
    justifyContent: 'space-between'
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