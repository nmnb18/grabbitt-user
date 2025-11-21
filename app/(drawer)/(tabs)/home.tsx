import { QrCode } from "@/components/shared/qr-code";
import DashboardSkeleton from "@/components/skeletons/dashboard";
import { GradientIcon } from "@/components/ui/gradient-icon";
import { GradientText } from "@/components/ui/gradient-text";
import { Button } from "@/components/ui/paper-button";
import withSkeletonTransition from "@/components/wrappers/withSkeletonTransition";
import { useSellerQR } from "@/hooks/use-qr";
import { useTheme } from "@/hooks/use-theme-color";
import api from "@/services/axiosInstance";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Card, Chip, Surface, Text } from "react-native-paper";
import { useAuthStore } from "../../../store/authStore";

// ------------------------------
// TYPES
// ------------------------------

interface StatCardProps {
  icon: string;
  value: number;
  label: string;
  gradientColors?: [string, string];
  backgroundColor: string;
}

interface ActionCardProps {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  iconColor: string;
}

// ------------------------------
// STAT CARD
// ------------------------------

const StatCard = ({
  icon,
  value,
  label,
  gradientColors,
  backgroundColor,
}: StatCardProps) => (
  <Card style={[styles.statCard, { backgroundColor }]} elevation={2}>
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

// ------------------------------
// ACTION CARD
// ------------------------------

const ActionCard = ({
  icon,
  title,
  subtitle,
  onPress,
  iconColor,
}: ActionCardProps) => (
  <Card onPress={onPress} style={styles.actionCard} elevation={1}>
    <Card.Content style={styles.actionCardContent}>
      <Surface style={[styles.actionIcon, { backgroundColor: `${iconColor}20` }]}>
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

      <MaterialCommunityIcons name="chevron-right" size={24} color="#9CA3AF" />
    </Card.Content>
  </Card>
);

// ------------------------------
// MAIN DASHBOARD
// ------------------------------

function SellerDashboard() {
  const { user } = useAuthStore();
  const theme = useTheme();
  const router = useRouter();

  const sellerProfile = user?.user.seller_profile;

  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const backgroundColor = theme.colors.background;

  // Shared QR hook
  const { activeQR, fetchActiveQR } = useSellerQR({
    autoLoad: true,
    pollIntervalMs: 60000,
  });

  // ------------------------------
  // LOAD DASHBOARD DATA
  // ------------------------------
  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      const response = await api.get(`/sellerStats`);
      const { data } = response;

      if (!data?.success) {
        Alert.alert("Error", data?.error || "Failed to load dashboard stats");
        return;
      }

      const s = data.data;

      setStats({
        total_users: s.total_users,
        total_qrs: s.total_qrs,
        total_scanned: s.total_scanned,
        total_points_issued: s.total_points_issued,
        total_redemptions: s.total_redemptions,
        seller_name: s.seller_name,
      });

      await fetchActiveQR();
    } catch (error: any) {
      console.error(error);
      Alert.alert(
        "Error",
        error?.response?.data?.error || "Could not load dashboard"
      );
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

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} />
        }
      >

        {/* ------------------------------
            HERO BANNER
        ------------------------------ */}
        <View style={styles.heroContainer}>
          <Image
            source={require("@/assets/images/hero_banner.png")}
            style={styles.heroImage}
          />

          <View style={styles.heroOverlay} />

          <View style={styles.heroContent}>
            <Text variant="headlineSmall" style={styles.heroShopName}>
              Hello, {sellerProfile?.business?.shop_name}
            </Text>



            <Text variant="bodySmall" style={styles.heroSubLabel}>
              Manage your loyalty rewards and grow your customers
            </Text>


          </View>
        </View>

        {/* ------------------------------
            STAT CARDS
        ------------------------------ */}
        <View style={styles.statsSection}>
          <View style={styles.statsGrid}>
            <StatCard
              icon="account-group"
              value={stats?.total_users || 0}
              label="Total Users"
              backgroundColor={theme.colors.surface}
            />
            <StatCard
              icon="star-circle"
              value={stats?.total_points_issued || 0}
              label="Points Issued"
              backgroundColor={theme.colors.surface}
            />
          </View>

          <View style={styles.statsGrid}>
            <StatCard
              icon="gift"
              value={stats?.total_redemptions || 0}
              label="Redemptions"
              backgroundColor={theme.colors.surface}
            />
            <StatCard
              icon="qrcode"
              value={stats?.total_qrs || 0}
              label="Total QRs"
              backgroundColor={theme.colors.surface}
            />
          </View>
        </View>

        {/* ------------------------------
            ACTIVE QR CODE
        ------------------------------ */}
        <View style={styles.section}>
          {!activeQR && !loading && (
            <Card style={[styles.expiredCard, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.expiredText, { color: theme.colors.onSurface }]}>
                Your QR code has expired. Generate a new one.
              </Text>

              <Button
                variant="contained"
                onPress={() => router.push("/(drawer)/(tabs)/generate-qr")}
              >
                Generate New QR
              </Button>
            </Card>
          )}

          {activeQR && <QrCode qrMode={activeQR.qr_type} qrData={activeQR} />}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

export default withSkeletonTransition(DashboardSkeleton)(SellerDashboard);

// ------------------------------
// STYLES
// ------------------------------

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16 },

  heroContainer: {
    position: "relative",
    height: 200,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 24,
  },
  heroImage: { width: "100%", height: "100%", resizeMode: "cover" },
  heroOverlay: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  heroContent: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  heroShopName: { color: "#FFF", fontWeight: "700", fontSize: 22, marginBottom: 12 },
  heroChip: { backgroundColor: "rgba(255,255,255,0.4)", marginBottom: 8 },
  heroChipText: { fontWeight: "600" },
  heroSubLabel: { color: "#FFF", fontSize: 14, textAlign: "center", marginBottom: 16 },

  statsSection: { marginBottom: 24 },
  statsGrid: { flexDirection: "row", gap: 12, marginBottom: 12 },

  statCard: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
  },
  statContent: {
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 120,
  },
  statValue: { fontSize: 24, fontWeight: "700", marginTop: 6 },
  statLabel: { fontSize: 16, opacity: 0.9, marginTop: 4, textAlign: "center" },

  section: { marginBottom: 24 },

  expiredCard: { padding: 20, borderRadius: 16 },
  expiredText: { textAlign: "center", fontSize: 16, marginBottom: 12 },

  bottomSpacer: { height: 24 },

  actionCard: { marginBottom: 12, borderRadius: 16 },
  actionCardContent: { flexDirection: "row", alignItems: "center", paddingVertical: 16 },
  actionIcon: {
    width: 56, height: 56, borderRadius: 28,
    justifyContent: "center", alignItems: "center", marginRight: 12,
  },
  actionTextContainer: { flex: 1 },
  actionTitle: { fontWeight: "600", marginBottom: 4 },
  actionSubtitle: { opacity: 0.8 },
});
