import { useTheme } from '@/hooks/use-theme-color';
import { AppStyles, Colors } from '@/utils/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  ActivityIndicator,
  Card,
  Chip,
  IconButton,
  Surface,
  Text
} from 'react-native-paper';
import { useAuthStore } from '../../store/authStore';

const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL;

interface StatCardProps {
  icon: string;
  value: number;
  label: string;
  color: string;
  gradientColors: [string, string];
}

const StatCard = ({ icon, value, label, color, gradientColors }: StatCardProps) => (
  <Card style={styles.statCard}>
    <View style={[styles.statContent]}>
      <MaterialCommunityIcons name={icon as any} size={32} color={color} />
      <Text variant="headlineMedium" style={[styles.statValue, { color }]}>
        {value}
      </Text>
      <Text variant="labelLarge" style={[styles.statLabel, { color }]}>
        {label}
      </Text>
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

const ActionCard = ({ icon, title, subtitle, onPress, iconColor }: ActionCardProps) => (
  <Card style={styles.actionCard} elevation={1} onPress={onPress}>
    <Card.Content style={styles.actionCardContent}>
      <Surface style={[styles.actionIcon, { backgroundColor: `${iconColor}20` }]} elevation={0}>
        <MaterialCommunityIcons name={icon as any} size={28} color={iconColor} />
      </Surface>
      <View style={styles.actionTextContainer}>
        <Text variant="titleMedium" style={styles.actionTitle}>{title}</Text>
        <Text variant="bodySmall" style={styles.actionSubtitle}>{subtitle}</Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={24} color="#9CA3AF" />
    </Card.Content>
  </Card>
);

export default function SellerDashboard() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const theme = useTheme();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setTimeout(() => {
      setLoading(false);
    }, 2000)
    // API calls would go here
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        onPress: async () => {
          await logout(user?.uid ?? '');
          router.replace('/auth/login');
        },
      },
    ]);
  };

  const handleMenuPress = () => {
    // Handle hamburger menu press
    console.log('Menu pressed');
  };

  const handleNotificationPress = () => {
    // Handle notification icon press
    console.log('Notifications pressed');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <View style={styles.welcomeTextContainer}>
            <Text variant="labelLarge" style={styles.greeting}>Welcome back,</Text>
            <Text variant="headlineSmall" style={styles.shopName}>{user?.shopName}</Text>
            <Chip
              mode="flat"
              icon="store"
              style={styles.categoryChip}
              textStyle={styles.chipText}
            >
              {profile?.category || 'General'}
            </Chip>
          </View>
          <IconButton
            icon="logout"
            iconColor={Colors.light.error}
            size={24}
            onPress={handleLogout}
            style={styles.logoutButton}
          />
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
              value={stats?.active_qr_codes || 0}
              label="Active QRs"
              color={Colors.light.secondary}
              gradientColors={[Colors.light.secondary, Colors.light.primary]}
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text variant="titleLarge" style={[styles.sectionTitle]}>
            Quick Actions
          </Text>

          <ActionCard
            icon="qrcode-plus"
            title="Generate QR Code"
            subtitle="Create a new loyalty QR code"
            onPress={() => { }}
            iconColor={Colors.light.primary}
          />

          <ActionCard
            icon="store-cog"
            title="Edit Profile"
            subtitle="Update shop details and rewards"
            onPress={() => { }}
            iconColor={Colors.light.secondary}
          />

          <ActionCard
            icon="chart-line"
            title="AI Insights"
            subtitle="Get reward optimization suggestions"
            onPress={() => { }}
            iconColor={Colors.light.accent}
          />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  headerIcon: {
    margin: 0,
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
  },
  logo: {
    width: 160,
    height: 60,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: AppStyles.spacing.md,
    paddingTop: AppStyles.spacing.md,
  },
  welcomeSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: AppStyles.spacing.lg,
    padding: AppStyles.spacing.md,
    backgroundColor: Colors.light.surface,
    borderRadius: AppStyles.card.borderRadius,
    borderWidth: 1,
    borderColor: Colors.light.outline,
  },
  welcomeTextContainer: {
    flex: 1,
  },
  greeting: {
    color: Colors.light.text,
    opacity: 0.8,
    marginBottom: 4,
  },
  shopName: {
    color: Colors.light.text,
    fontWeight: '700',
    marginBottom: 8,
  },
  categoryChip: {
    backgroundColor: Colors.light.surfaceVariant,
    alignSelf: 'flex-start',
  },
  chipText: {
    color: Colors.light.text,
    fontSize: 12,
  },
  logoutButton: {
    margin: 0,
    backgroundColor: `${Colors.light.error}15`,
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
    color: Colors.light.onPrimary,
    fontWeight: '700',
    marginTop: AppStyles.spacing.xs,
  },
  statLabel: {
    color: Colors.light.onPrimary,
    opacity: 0.9,
    marginTop: AppStyles.spacing.xs,
    textAlign: 'center',
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