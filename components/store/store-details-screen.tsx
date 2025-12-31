// screens/store/store-details-screen.tsx
import React from "react";
import { ScrollView, Linking, Platform, StyleSheet } from "react-native";
import { View } from "react-native";
import { useTheme } from "@/hooks/use-theme-color";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { GradientHeader } from "@/components/shared/app-header";
import { Button } from "@/components/ui/paper-button";

// Import types
import { StoreDetails } from "@/types/seller";
import { StoreHeader } from "./store-header";
import { ContactButtons } from "./contact-buttons";
import { OffersList } from "./offer-list";
import { RewardsCard } from "./rewards-card";
import api from "@/services/axiosInstance";
import { TodayOfferModal } from "./today-offer-modal";
import { Chip, Text } from "react-native-paper";
import { GradientText } from "../ui/gradient-text";

// Import styles

interface StoreDetailsScreenProps {
  store: StoreDetails;
  loading?: boolean;
  onBack?: () => void;
  storeId: string;
  todayOffer?: any;
  redemptionCode: string;
  redemptionStatus: string;
  setRedemptionCode: (code: string) => void;
  setRedemptionStatus: (status: string) => void;
  onRedeem?: (store: StoreDetails) => void;
}

export default function StoreDetailsScreen({
  store,
  loading = false,
  todayOffer,
  storeId,
  redemptionCode,
  redemptionStatus,
  setRedemptionCode,
  setRedemptionStatus,
  onBack,
  onRedeem,
}: StoreDetailsScreenProps) {
  const theme = useTheme();
  const router = useRouter();
  const [showTodayModal, setShowTodayModal] = React.useState(false);

  const [expandedSections, setExpandedSections] = React.useState({
    rewards: false,
  });

  // Use provided callbacks or default navigation
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const handleRedeemPoints = async () => {
    if (onRedeem) {
      onRedeem(store);
    } else {
      const storeData = await api.get("/getBalanceBySeller", {
        params: {
          seller_id: store.user_id,
        },
      });
      router.push({
        pathname: "/(drawer)/redeem/redeem-home",
        params: { store: JSON.stringify(storeData.data) },
      });
    }
  };

  const handleCallStore = () => {
    if (store?.account?.phone) {
      Linking.openURL(`tel:${store?.account?.phone}`);
    }
  };

  const handleOpenMaps = () => {
    if (store?.location) {
      const { lat, lng } = store.location;
      const url =
        Platform.OS === "ios"
          ? `http://maps.apple.com/?ll=${lat},${lng}&q=${encodeURIComponent(
            store.business.shop_name
          )}`
          : `geo:${lat},${lng}?q=${encodeURIComponent(
            store.business.shop_name
          )}`;
      Linking.openURL(url);
    }
  };

  const toggleRewards = () => {
    setExpandedSections((prev) => ({
      ...prev,
      rewards: !prev.rewards,
    }));
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <GradientHeader title="Store Details" />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <StoreHeader
          shopName={store.business.shop_name}
          category={store.business.category}
          businessType={store.business.business_type}
        />

        <ContactButtons
          onCall={handleCallStore}
          onGetDirections={handleOpenMaps}
        />

        {todayOffer && !redemptionCode && (
          <Button
            variant="contained"
            icon="calendar-star"
            onPress={() => setShowTodayModal(true)}
          >
            What's in Today?
          </Button>
        )}
        {redemptionCode && (
          <View>
            <Text style={styles.codeLabel}>Your Perk Code for Today</Text>

            <View style={styles.codeBox}>
              <GradientText style={styles.codeText}>
                {redemptionCode}
              </GradientText>
              <Chip
                style={{
                  borderColor: theme.colors.success,
                  borderWidth: 1,
                  backgroundColor: theme.colors.background,
                  alignSelf: "center",
                }}
                textStyle={{ color: theme.colors.text }}
              >
                {redemptionStatus}
              </Chip>
              <View>
                <Text style={styles.codeHint}>
                  1.) Visit Store (valid only for today)
                </Text>
                <Text style={styles.codeHint}>
                  2.) Show this code to the store to claim you perk
                </Text>
                <Text style={styles.codeHint}>3.) Enjoy your perks</Text>
              </View>
            </View>
          </View>
        )}

        <OffersList offers={store.rewards.offers} />

        {store.rewards && store.qr_settings.qr_code_type !== 'multiple' && (
          <RewardsCard
            rewards={store.rewards}
            expanded={expandedSections.rewards}
            onToggle={toggleRewards}
          />
        )}

        <View style={styles.actionButtons}>
          <Button
            variant="outlined"
            onPress={handleBack}
            icon="arrow-left"
            disabled={loading}
          >
            Back
          </Button>
          <Button
            variant="contained"
            onPress={handleRedeemPoints}
            icon="gift"
            disabled={loading}
            loading={loading}
          >
            Redeem Points
          </Button>
        </View>
      </ScrollView>
      <TodayOfferModal
        visible={showTodayModal}
        onClose={() => setShowTodayModal(false)}
        setRedemptionCode={setRedemptionCode}
        setRedemptionStatus={setRedemptionStatus}
        sellerId={storeId}
      />
    </SafeAreaView>
  );
}

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
    paddingTop: 24,
  },
  scrollContent: {
    marginHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    gap: 12,
  },
  codeBox: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#111827",
    gap: 10,
  },
  codeText: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 2,
    textAlign: "center",
    marginBottom: 10,
  },
  codeLabel: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 8,
  },
  codeHint: {
    fontSize: 12,
    marginBottom: 5,
  },
});
