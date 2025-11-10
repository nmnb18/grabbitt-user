import { Button } from '@/components/ui/paper-button';
import { useTheme } from '@/hooks/use-theme-color';
import { AppStyles, Colors } from '@/utils/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  Share,
  StyleSheet,
  View,
} from 'react-native';
import {
  Card,
  Chip,
  Divider,
  IconButton,
  SegmentedButtons,
  Text,
  TextInput
} from 'react-native-paper';
import { useAuthStore } from '../../store/authStore';

const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL;

type QRMode = 'dynamic' | 'static' | 'static_with_code';

export default function SellerGenerateQR() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [qrMode, setQRMode] = useState<QRMode>('dynamic');
  const [hiddenCode, setHiddenCode] = useState('');
  const [expiryMinutes, setExpiryMinutes] = useState('60');
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [qrData, setQrData] = useState<any>(null);
  const theme = useTheme();

  const handleGenerateQR = async () => {
    if (qrMode === 'static_with_code' && !hiddenCode) {
      Alert.alert('Error', 'Please enter a hidden code');
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        qr_type: qrMode,
      };

      if (qrMode === 'dynamic') {
        payload.expires_in = parseInt(expiryMinutes);
      } else if (qrMode === 'static_with_code') {
        payload.hidden_code = hiddenCode;
      }

      const response = await axios.post(
        `${API_URL}/generate-qr`,
        payload,
        {
          headers: { Authorization: `Bearer ${user?.idToken}` }
        }
      );
      const resData = response.data.data;
      setQrImage(resData.qr_code_base64);
      setQrData(resData);

      Alert.alert('Success', 'QR code generated successfully!');
    } catch (error: any) {
      console.log(error)
      Alert.alert('Error', error.response?.data?.detail || 'Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!qrImage) return;

    try {
      await Share.share({
        message: `Scan this QR code to earn loyalty points!`,
        title: 'Loyalty QR Code',
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleMenuPress = () => {
    // Handle hamburger menu press
    console.log('Menu pressed');
  };

  const handleNotificationPress = () => {
    // Handle notification icon press
    console.log('Notifications pressed');
  };

  const getModeDescription = () => {
    switch (qrMode) {
      case 'dynamic':
        return 'Expires after set time. Best for temporary use.';
      case 'static':
        return 'Never expires. Can be scanned unlimited times.';
      case 'static_with_code':
        return 'Never expires. Requires hidden code from customer.';
      default:
        return '';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Fixed Header */}
      <View style={styles.header}>
        <IconButton
          icon="menu"
          iconColor={Colors.light.text}
          size={24}
          onPress={handleMenuPress}
          style={styles.headerIcon}
        />

        <View style={styles.logoContainer}>
          <Image
            source={require('@/assets/images/logo.png')}
            style={styles.logo}
          />
        </View>

        <IconButton
          icon="bell-outline"
          iconColor={Colors.light.text}
          size={24}
          onPress={handleNotificationPress}
          style={styles.headerIcon}
        />
      </View>

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
                setQrImage(null);
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
                  value: 'static_with_code',
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
              <TextInput
                label="Expiry Time (minutes)"
                value={expiryMinutes}
                onChangeText={setExpiryMinutes}
                mode="outlined"
                keyboardType="numeric"
                style={styles.input}
                left={<TextInput.Icon icon="timer" />}
                outlineColor={Colors.light.outline}
                activeOutlineColor={theme.colors.accent}
              />
            )}

            {qrMode === 'static_with_code' && (
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

        {/* Generated QR Code */}
        {qrImage && (
          <Card style={styles.qrCard}>
            <View style={[styles.qrCardContent]}>
              <View style={styles.qrContainer}>
                <Image
                  source={{ uri: qrImage }}
                  style={styles.qrImage}
                  resizeMode="contain"
                />
              </View>

              <View style={styles.qrInfo}>
                <Chip
                  icon="check-circle"
                  style={styles.qrChip}
                >
                  Active
                </Chip>
                <Text variant="bodySmall" >
                  QR Code ID: {qrData?.qr_id?.substring(0, 8)}...
                </Text>
                {qrMode === 'dynamic' && qrData?.expires_at && (
                  <Text variant="bodySmall">
                    Expires: {new Date(qrData.expires_at).toLocaleString()}
                  </Text>
                )}
                {qrMode === 'static_with_code' && (
                  <View style={styles.codeContainer}>
                    <MaterialCommunityIcons name="key" size={16} color={Colors.light.onPrimary} />
                    <Text variant="bodySmall">
                      Code: {hiddenCode}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <Card.Actions style={styles.cardActions}>
              <Button
                onPress={handleShare}
                icon="share-variant"
              >
                Share
              </Button>
              <Button
                onPress={() => {
                  setQrImage(null);
                  setQrData(null);
                }}
                icon="refresh"
              >
                New QR
              </Button>
            </Card.Actions>
          </Card>
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
              <View style={[styles.instructionNumber, { backgroundColor: Colors.light.secondary }]}>
                <Text variant="labelLarge" style={styles.instructionNumberText}>2</Text>
              </View>
              <Text variant="bodyMedium" style={styles.instructionText}>
                Customer scans the QR code with their app
              </Text>
            </View>

            {qrMode === 'static_with_code' && (
              <View style={styles.instructionItem}>
                <View style={[styles.instructionNumber, { backgroundColor: Colors.light.accent }]}>
                  <Text variant="labelLarge" style={styles.instructionNumberText}>3</Text>
                </View>
                <Text variant="bodyMedium" style={styles.instructionText}>
                  Customer enters the hidden code you shared
                </Text>
              </View>
            )}

            <View style={styles.instructionItem}>
              <View style={[styles.instructionNumber, { backgroundColor: Colors.light.success }]}>
                <Text variant="labelLarge" style={styles.instructionNumberText}>
                  {qrMode === 'static_with_code' ? '4' : '3'}
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
    marginBottom: AppStyles.spacing.md,
    backgroundColor: Colors.light.surface,
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