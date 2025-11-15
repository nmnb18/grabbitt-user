import { QrCode } from '@/components/shared/qr-code';
import DashboardSkeleton from '@/components/skeletons/dashboard';
import { GradientIcon } from '@/components/ui/gradient-icon';
import { GradientText } from '@/components/ui/gradient-text';
import { Button } from '@/components/ui/paper-button';
import withSkeletonTransition from '@/components/wrappers/withSkeletonTransition';
import { useSellerQR } from '@/hooks/use-qr';
import { useTheme } from '@/hooks/use-theme-color';
import api from '@/services/axiosInstance';
import { SUBSCRIPTION_PLANS } from '@/utils/constant';
import { AppStyles, Colors } from '@/utils/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Card, Chip, Surface, Text } from 'react-native-paper';
import { useAuthStore } from '../../../store/authStore';

const API_URL =
  Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL ||
  process.env.EXPO_PUBLIC_BACKEND_URL;

interface StatCardProps {
  icon: string;
  value: number;
  label: string;
  color: string;
  gradientColors: [string, string];
}

const StatCard = ({ icon, value, label, gradientColors }: StatCardProps) => (
  <Card style={styles.statCard}>
    <View style={styles.statContent}>
      <GradientIcon size={32} name={icon as any} />
      <GradientText colors={gradientColors} style={styles.statValue}>
        {value}
      </GradientText>
      <GradientText colors={gradientColors} style={styles.statLabel}>
        {label}
      </GradientText>
    </View>
  </Card>
);

interface ActionCardProps {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  iconColor: string;
}

const ActionCard = ({
  icon,
  title,
  subtitle,
  onPress,
  iconColor,
}: ActionCardProps) => (
  <Card style={styles.actionCard} elevation={1} onPress={onPress}>
    <Card.Content style={styles.actionCardContent}>
      <Surface
        style={[styles.actionIcon, { backgroundColor: `${iconColor}20` }]}
        elevation={0}
      >
        <MaterialCommunityIcons name={icon as any} size={28} color={iconColor} />
      </Surface>
      <View style={styles.actionTextContainer}>
        <Text variant="titleMedium" style={styles.actionTitle}>
          {title}
        </Text>
        <Text variant="bodySmall" style={styles.actionSubtitle}>
          {subtitle}
        </Text>
      </View>
      <MaterialCommunityIcons
        name="chevron-right"
        size={24}
        color="#9CA3AF"
      />
    </Card.Content>
  </Card>
);

function SellerDashboard() {
  const { user } = useAuthStore();
  const router = useRouter();
  const theme = useTheme();
  const sellerProfile = user?.user.seller_profile;

  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ✅ shared QR hook (auto-load + polling)
  const { activeQR, fetchActiveQR } = useSellerQR({
    autoLoad: true,
    pollIntervalMs: 60000, // re-check every 60s to auto-drop expired QR
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      // Seller stats
      const response = await api.get(`/sellerStats`);
      const { data } = response;

      if (!data?.success) {
        Alert.alert('Error', data?.error || 'Failed to load dashboard stats');
        return;
      }

      const statsData = data.data;
      setStats({
        total_users: statsData.total_users,
        total_qrs: statsData.total_qrs,
        total_scanned: statsData.total_scanned,
        total_points_issued: statsData.total_points_issued,
        total_redemptions: statsData.total_redemptions,
        seller_name: statsData.seller_name,
      });

      // Active QR (this also marks expired ones inactive on backend)
      await fetchActiveQR();
    } catch (error: any) {
      console.error('Error loading dashboard:', error);
      if (error.response) {
        Alert.alert(
          'Server Error',
          error.response.data?.error || 'Failed to load data from server'
        );
      } else {
        Alert.alert(
          'Network Error',
          'Please check your internet connection and try again.'
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [fetchActiveQR]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {/* Welcome Section */}
        <View style={styles.heroContainer}>
          <Image
            source={require('@/assets/images/hero_banner.png')}
            style={styles.heroImage}
          />
          <View style={styles.heroOverlay} />

          <View style={styles.heroContent}>
            <Text variant="headlineSmall" style={styles.heroShopName}>
              Hello, {sellerProfile?.business?.shop_name}
            </Text>

            <Chip
              mode="flat"
              icon="star"
              style={styles.heroChip}
              textStyle={styles.heroChipText}
            >
              {
                SUBSCRIPTION_PLANS[sellerProfile?.subscription?.tier ?? 'free']
                  .name
              }
            </Chip>

            <Text variant="bodySmall" style={styles.heroSubLabel}>
              Manage your loyalty rewards and grow your customers
            </Text>

            {sellerProfile?.subscription?.tier === 'free' && (
              <Button
                variant="contained"
                onPress={() => router.push('/(drawer)/subscription')}
              >
                Upgrade Plan
              </Button>
            )}
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsSection}>
          <View style={styles.statsGrid}>
            <StatCard
              icon="account-group"
              value={stats?.total_users || 0}
              label="Total Users"
              color={Colors.light.secondary}
              gradientColors={AppStyles.gradients.secondary}
            />
            <StatCard
              icon="star-circle"
              value={stats?.total_points_issued || 0}
              label="Points Issued"
              color={Colors.light.secondary}
              gradientColors={AppStyles.gradients.secondary}
            />
          </View>
          <View style={styles.statsGrid}>
            <StatCard
              icon="gift"
              value={stats?.total_redemptions || 0}
              label="Redemptions"
              color={Colors.light.secondary}
              gradientColors={AppStyles.gradients.secondary}
            />
            <StatCard
              icon="qrcode"
              value={stats?.total_qrs || 0}
              label="Total QRs"
              color={Colors.light.secondary}
              gradientColors={[Colors.light.secondary, Colors.light.primary]}
            />
          </View>
        </View>

        {/* Active QR (auto-expires via backend + hook) */}
        <View style={styles.section}>
          {!activeQR && !loading && (
            <Card style={{ padding: 20, borderRadius: 16 }}>
              <Text style={{ textAlign: 'center', fontSize: 16, marginBottom: 12 }}>
                Your QR code has expired. Generate a new one.
              </Text>
              <Button
                variant="contained"
                onPress={() => router.push('/(drawer)/(tabs)/generate-qr')}
              >
                Generate New QR
              </Button>
            </Card>
          )}
          {activeQR && (
            <QrCode qrMode={activeQR.qr_type} qrData={activeQR} />
          )}
        </View>




        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroContainer: {
    position: 'relative',
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: AppStyles.spacing.lg,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  heroContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  heroShopName: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 22,
    marginBottom: 12,
    textAlign: 'center',
  },
  heroChip: {
    backgroundColor: 'rgba(255,255,255,0.4)',
    alignSelf: 'center',
    marginBottom: 8,
  },
  heroChipText: {
    fontWeight: '600',
  },
  heroSubLabel: {
    color: '#FFF',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: AppStyles.spacing.md,
    paddingTop: AppStyles.spacing.md,
  },
  statsSection: {
    marginBottom: AppStyles.spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: AppStyles.spacing.sm,
    marginBottom: AppStyles.spacing.sm,
  },
  statCard: {
    flex: 1,
    borderRadius: AppStyles.card.borderRadius,
    overflow: 'hidden',
    backgroundColor: Colors.light.surface,
  },
  statContent: {
    padding: AppStyles.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
    borderRadius: AppStyles.card.borderRadius,
  },
  statValue: {
    color: Colors.light.onSurface,
    fontWeight: '700',
    marginTop: AppStyles.spacing.xs,
    fontSize: 24,
  },
  statLabel: {
    color: Colors.light.onSurface,
    opacity: 0.9,
    marginTop: AppStyles.spacing.xs,
    textAlign: 'center',
    fontSize: 16,
  },
  section: {
    marginBottom: AppStyles.spacing.lg,
  },
  sectionTitle: {
    fontWeight: '700',
    marginBottom: AppStyles.spacing.md,
    paddingLeft: 4,
  },
  actionCard: {
    marginBottom: AppStyles.spacing.sm,
    borderRadius: AppStyles.card.borderRadius,
    backgroundColor: Colors.light.surface,
  },
  actionCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: AppStyles.spacing.sm,
    paddingHorizontal: AppStyles.spacing.md,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: AppStyles.spacing.md,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontWeight: '600',
    marginBottom: 4,
    color: Colors.light.text,
  },
  actionSubtitle: {
    color: Colors.light.accent,
  },
  bottomSpacer: {
    height: AppStyles.spacing.lg,
  },
});

export default withSkeletonTransition(DashboardSkeleton)(SellerDashboard);
