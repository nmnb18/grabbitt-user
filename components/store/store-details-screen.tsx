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

// Import styles

interface StoreDetailsScreenProps {
    store: StoreDetails;
    loading?: boolean;
    onBack?: () => void;
    onRedeem?: (store: StoreDetails) => void;
}

export default function StoreDetailsScreen({
    store,
    loading = false,
    onBack,
    onRedeem,
}: StoreDetailsScreenProps) {
    const theme = useTheme();
    const router = useRouter();

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

    const handleRedeemPoints = () => {
        if (onRedeem) {
            onRedeem(store);
        } else {
            router.push({
                pathname: "/(drawer)/redeem/redeem-home",
                params: { store: JSON.stringify(store) },
            });
        }
    };

    const handleCallStore = () => {
        if (store?.account.phone) {
            Linking.openURL(`tel:${store.account.phone}`);
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
                    : `geo:${lat},${lng}?q=${encodeURIComponent(store.business.shop_name)}`;
            Linking.openURL(url);
        }
    };

    const toggleRewards = () => {
        setExpandedSections(prev => ({
            ...prev,
            rewards: !prev.rewards,
        }));
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
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

                <OffersList offers={store.rewards.offers} />

                {store.rewards && (
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
        </SafeAreaView>
    );
}

export const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    errorText: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 16,
        textAlign: 'center',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 40,
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 24,
        gap: 12,
    },
});