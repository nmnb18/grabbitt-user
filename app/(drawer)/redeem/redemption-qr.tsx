// screens/wallet/redemption-qr-screen.tsx
import React, { useState, useEffect } from "react";
import {
    View,
    StyleSheet,
    ScrollView,
    Alert,
    Share,
    Platform,
    Image,
} from "react-native";
import { Text, Surface, ProgressBar, Chip } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/use-theme-color";
import { Button } from "@/components/ui/paper-button";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { GradientHeader } from "@/components/shared/app-header";
import { Redemption } from "@/types/redemptions";
import api from "@/services/axiosInstance";

export default function RedemptionQRScreen() {
    const theme = useTheme();
    const router = useRouter();
    const params = useLocalSearchParams();

    const [redemption, setRedemption] = useState<Redemption | null>(null);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [qrData, setQrData] = useState<string | undefined>('');

    useEffect(() => {
        if (params.redemption) {
            try {
                const parsedRedemption = JSON.parse(params.redemption as string);
                setRedemption(parsedRedemption);
                setQrData(parsedRedemption?.qr_code_base64)
            } catch (error) {
                console.error("Failed to parse redemption:", error);
                Alert.alert("Error", "Invalid redemption data");
                router.back();
            }
        }
    }, [params.redemption]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return theme.colors.warning;
            case 'redeemed': return theme.colors.success;
            case 'cancelled': return theme.colors.error;
            case 'expired': return theme.colors.error;
            default: return theme.colors.onSurfaceVariant;
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending': return 'clock';
            case 'redeemed': return 'check-circle';
            case 'cancelled': return 'close-circle';
            case 'expired': return 'clock-alert';
            default: return 'help-circle';
        }
    };

    const handleShareQR = async () => {
        if (!redemption) return;

        try {
            const message = `Redeem ${redemption.points} points at ${redemption.seller_shop_name}\n\nShow this QR code to the seller to complete your redemption.`;

            if (Platform.OS === 'web') {
                // For web, show QR data
                Alert.alert("QR Code", `Redemption ID: ${redemption.redemption_id}\n\nShow this to the seller.`);
            } else {
                // For mobile, share with native share dialog
                await Share.share({
                    message,
                    title: `Redemption QR - ${redemption.seller_shop_name}`,
                });
            }
        } catch (error) {
            console.error("Share error:", error);
        }
    };

    const handleRefreshStatus = async () => {
        if (!redemption) return;

        try {
            setRefreshing(true);
            const response = await api.get(`/getRedemptionStatus`, {
                params: { redemption_id: redemption.redemption_id }
            });

            if (response.data.success) {
                setRedemption(response.data.redemption);
                if (response.data.redemption.status !== 'pending') {
                    Alert.alert(
                        "Status Updated",
                        `Redemption has been ${response.data.redemption.status}`
                    );
                }
            }
        } catch (error) {
            console.error("Refresh status error:", error);
        } finally {
            setRefreshing(false);
        }
    };

    const handleCancelRedemption = async () => {
        if (!redemption) return;

        Alert.alert(
            "Cancel Redemption",
            "Are you sure you want to cancel this redemption?",
            [
                { text: "No", style: "cancel" },
                {
                    text: "Yes, Cancel",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            setLoading(true);
                            const response = await api.post("/cancelRedemption", {
                                redemption_id: redemption.redemption_id
                            });

                            if (response.data.success) {
                                Alert.alert(
                                    "Cancelled",
                                    "Redemption has been cancelled successfully",
                                    [
                                        {
                                            text: "OK",
                                            onPress: () => router.back()
                                        }
                                    ]
                                );
                            }
                        } catch (error: any) {
                            Alert.alert("Error", error.response?.data?.error || "Failed to cancel redemption");
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const pollRedemptionStatus = async () => {
        try {
            const response = await api.get("/getRedemptionStatus", {
                params: { redemption_id: redemption?.redemption_id },
            });

            if (!response.data.success) return;

            const updated = response.data.redemption;

            // Update UI
            setRedemption(updated);

            // Stop polling & alert once status is final
            if (updated.status !== "pending") {
                Alert.alert(
                    "Redemption Updated",
                    `Your redemption is now: ${updated.status.toUpperCase()}`,
                    [{ text: "OK", onPress: () => router.navigate('/(drawer)/(tabs)/home') }]
                );
            }
        } catch (error) {
            console.error("Polling error:", error);
        }
    };


    useEffect(() => {
        let interval: any = null;

        if (redemption && redemption.status === "pending") {
            interval = setInterval(() => {
                pollRedemptionStatus();
            }, 10000); // every 10 seconds
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [redemption]);

    if (!redemption) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <GradientHeader title="Redemption QR" />
                <View style={styles.loadingContainer}>
                    <MaterialCommunityIcons
                        name="qrcode-scan"
                        size={60}
                        color={theme.colors.primary}
                    />
                    <Text style={{ color: theme.colors.onSurfaceVariant, marginTop: 12 }}>
                        Loading redemption data...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <GradientHeader title="Redemption QR" />

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Status Header */}


                {/* Store Info */}
                <Surface style={[styles.storeCard, { backgroundColor: theme.colors.surfaceVariant }]}>
                    <View style={styles.storeHeader}>
                        <MaterialCommunityIcons
                            name="store"
                            size={24}
                            color={theme.colors.primary}
                        />
                        <Text style={[styles.storeName, { color: theme.colors.onSurface }]}>
                            {redemption.seller_shop_name}
                        </Text>
                    </View>
                    <Text style={[styles.storeInfo, { color: theme.colors.accent }]}>
                        Show this QR code at the store to redeem your points
                    </Text>
                </Surface>

                {/* QR Code Display */}
                <View style={styles.qrContainer}>
                    <Surface style={[styles.qrCard, { backgroundColor: theme.colors.surface }]}>
                        {qrData ? (
                            <Image
                                source={{ uri: `${qrData}` }}
                                style={styles.qrImage}
                                resizeMode="contain"
                            />
                        ) : (
                            <View style={styles.qrPlaceholder}>
                                <MaterialCommunityIcons
                                    name="qrcode"
                                    size={120}
                                    color={theme.colors.onSurfaceVariant}
                                />
                                <Text style={[styles.qrPlaceholderText, { color: theme.colors.onSurfaceVariant }]}>
                                    QR Code Generated
                                </Text>
                                <Text style={[styles.redemptionId, { color: theme.colors.primary }]}>
                                    ID: {redemption.redemption_id}
                                </Text>
                            </View>
                        )}
                    </Surface>

                    <View style={styles.statusHeader}>
                        <Chip
                            icon={getStatusIcon(redemption.status)}
                            style={{ borderColor: getStatusColor(redemption.status), borderWidth: 1, backgroundColor: theme.colors.background }}
                            textStyle={{ color: theme.colors.text }}


                        >
                            {redemption.status.toUpperCase()}
                        </Chip>
                    </View>
                </View>

                {/* Redemption Details */}
                <Surface style={[styles.detailsCard, { backgroundColor: theme.colors.backdrop }]}>
                    <Text style={[styles.detailsTitle, { color: theme.colors.onSurface }]}>
                        Redemption Details
                    </Text>

                    <View style={styles.detailRow}>
                        <Text style={[styles.detailLabel, { color: theme.colors.accent }]}>
                            Redemption ID:
                        </Text>
                        <Text style={[styles.detailValue, { color: theme.colors.onSurface }]}>
                            {redemption.redemption_id}
                        </Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={[styles.detailLabel, { color: theme.colors.accent }]}>
                            Points:
                        </Text>
                        <Text style={[styles.detailValue, { color: theme.colors.success }]}>
                            {redemption.points} pts
                        </Text>
                    </View>

                    {redemption.offer_name && (
                        <View style={styles.detailRow}>
                            <Text style={[styles.detailLabel, { color: theme.colors.accent }]}>
                                Offer:
                            </Text>
                            <Text style={[styles.detailValue, { color: theme.colors.onSurface }]}>
                                {redemption.offer_name}
                            </Text>
                        </View>
                    )}

                    <View style={styles.detailRow}>
                        <Text style={[styles.detailLabel, { color: theme.colors.accent }]}>
                            Created:
                        </Text>
                        <Text style={[styles.detailValue, { color: theme.colors.onSurface }]}>
                            {new Date(redemption.created_at).toLocaleString()}
                        </Text>
                    </View>

                    {redemption.redeemed_at && (
                        <View style={styles.detailRow}>
                            <Text style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>
                                Redeemed:
                            </Text>
                            <Text style={[styles.detailValue, { color: theme.colors.success }]}>
                                {new Date(redemption.redeemed_at).toLocaleString()}
                            </Text>
                        </View>
                    )}

                </Surface>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                    {redemption.status === 'pending' && (
                        <Button
                            variant="outlined"
                            onPress={handleCancelRedemption}
                            loading={loading}
                            disabled={refreshing}
                            icon="close"
                        >
                            Cancel Redemption
                        </Button>
                    )}

                    <Button
                        variant="outlined"
                        onPress={handleShareQR}
                        disabled={redemption.status !== 'pending'}
                        icon="share-variant"
                    >
                        Share QR
                    </Button>

                    <Button
                        variant="outlined"
                        onPress={handleRefreshStatus}
                        loading={refreshing}
                        icon="refresh"
                    >
                        Refresh Status
                    </Button>

                    <Button
                        variant="contained"
                        onPress={() => router.back()}
                        icon="check"
                    >
                        Done
                    </Button>
                </View>
            </ScrollView>
        </SafeAreaView>
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
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 40,
    },
    statusHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    storeCard: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        elevation: 2,
    },
    storeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    storeName: {
        fontSize: 18,
        fontWeight: '600',
        marginLeft: 12,
        flex: 1,
    },
    storeInfo: {
        fontSize: 14,
        lineHeight: 20,
    },
    qrContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    qrCard: {
        borderRadius: 16,
        padding: 24,
        marginBottom: 20,
        elevation: 3,
        alignItems: 'center',
        justifyContent: 'center',
    },
    qrImage: {
        width: 250,
        height: 250,
    },
    qrPlaceholder: {
        alignItems: 'center',
        padding: 20,
    },
    qrPlaceholderText: {
        fontSize: 16,
        marginTop: 12,
        marginBottom: 8,
    },
    redemptionId: {
        fontSize: 14,
        fontWeight: '600',
    },
    timerContainer: {
        width: '100%',
        marginBottom: 20,
    },
    timerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    timerLabel: {
        fontSize: 16,
        fontWeight: '500',
    },
    timerValue: {
        fontSize: 18,
        fontWeight: '700',
    },
    progressBar: {
        height: 8,
        borderRadius: 4,
    },
    instructionsCard: {
        borderRadius: 12,
        padding: 16,
        width: '100%',
    },
    instructionsTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    instructionsList: {
        gap: 12,
    },
    instructionItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    instructionText: {
        fontSize: 14,
        marginLeft: 12,
        flex: 1,
    },
    detailsCard: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        elevation: 2,
    },
    detailsTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    detailLabel: {
        fontSize: 14,
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'right',
        flex: 1,
    },
    actionButtons: {
        gap: 12,
    },
});