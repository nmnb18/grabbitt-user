// screens/wallet/redemption-history-screen.tsx
import React, { useState, useEffect } from "react";
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
} from "react-native";
import { Text, Surface, Chip, Divider } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/use-theme-color";
import { Button } from "@/components/ui/paper-button";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { GradientHeader } from "@/components/shared/app-header";
import api from "@/services/axiosInstance";
import { RedemptionHistoryItem, RedemptionHistoryResponse } from "@/types/redemptions";

type RedemptionProps = {
    stats: any;
    redemptions: RedemptionHistoryItem[];
    loading: boolean;
    hasData: boolean;
    onRefresh: () => void;
}

export default function RedemptionHistoryScreen({ stats, redemptions, onRefresh }: RedemptionProps) {
    const theme = useTheme();
    const router = useRouter();

    const [allRedemptions, setAllRedemptions] = useState<RedemptionHistoryItem[]>([]);
    const [filteredRedemptions, setFilteredRedemptions] = useState<RedemptionHistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState<'all' | 'pending' | 'redeemed' | 'cancelled' | 'expired'>('all');

    const [loadingQR, setLoadingQR] = useState<string | null>(null);


    // Apply filter when allRedemptions or filter changes
    useEffect(() => {
        if (filter === 'all') {
            setFilteredRedemptions(redemptions);
        } else {
            setFilteredRedemptions(redemptions.filter(r => r.status === filter));
        }
    }, [redemptions, filter]);



    const fetchRedemptionQR = async (redemptionId: string) => {
        try {
            setLoadingQR(redemptionId);

            const response = await api.get("/getRedemptionQR", {
                params: { redemption_id: redemptionId }
            });

            if (response.data.success) {
                return response.data; // Returns qr_code_base64 and other QR data
            } else {
                throw new Error(response.data.error || "Failed to fetch QR code");
            }
        } catch (error: any) {
            console.error("Fetch QR error:", error);
            throw error;
        } finally {
            setLoadingQR(null)
        }
    };


    const formatTimeAgo = (dateString: string | Date) => {
        try {
            const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
            const now = new Date();
            const diffMs = now.getTime() - date.getTime();
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMs / 3600000);
            const diffDays = Math.floor(diffMs / 86400000);

            if (diffMins < 1) return "Just now";
            if (diffMins < 60) return `${diffMins}m ago`;
            if (diffHours < 24) return `${diffHours}h ago`;
            if (diffDays < 7) return `${diffDays}d ago`;
            return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        } catch {
            return '';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return theme.colors.warning;
            case 'redeemed': return theme.colors.success;
            case 'cancelled': return theme.colors.error;
            case 'expired': return theme.colors.error;
            default: return theme.colors.accent;
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

    const getStatusText = (status: string) => {
        switch (status) {
            case 'pending': return 'Pending';
            case 'redeemed': return 'Redeemed';
            case 'cancelled': return 'Cancelled';
            case 'expired': return 'Expired';
            default: return status;
        }
    };

    const handleRedemptionPress = async (redemption: RedemptionHistoryItem) => {
        try {
            // Only fetch QR for pending redemptions (others don't need QR)
            if (redemption.status === 'pending') {
                const qrData = await fetchRedemptionQR(redemption.redemption_id);

                // Navigate with QR data
                router.push({
                    pathname: "/(drawer)/redeem/redemption-qr",
                    params: {
                        redemption: JSON.stringify({
                            ...redemption,
                            qr_code_base64: qrData.qr_code_base64,
                        })
                    }
                });
            } else {
                // For non-pending redemptions, navigate without QR
                router.push({
                    pathname: "/(drawer)/redeem/redemption-qr",
                    params: {
                        redemption: JSON.stringify({
                            ...redemption,
                            qr_code_base64: null,
                            qr_data: null
                        })
                    }
                });
            }
        } catch (error) {
            console.error("Failed to load QR:", error);
            // Navigate anyway, but show error on QR screen
            router.push({
                pathname: "/(drawer)/redeem/redemption-qr",
                params: {
                    redemption: JSON.stringify(redemption)
                }
            });
        }
    };

    const handleCreateNewRedemption = () => {
        // Navigate to stores list or wallet
        router.push("/(drawer)/(tabs)/wallet");
    };

    const FilterChip = ({ value, label, count }: { value: string; label: string; count?: number }) => (
        <TouchableOpacity onPress={() => setFilter(value as any)}>
            <Chip
                style={[
                    styles.filterChip,
                    {
                        backgroundColor: filter === value ? theme.colors.primary : theme.colors.surfaceVariant,
                        borderColor: filter === value ? theme.colors.primary : theme.colors.outline,
                        borderWidth: 1,
                    }
                ]}
                textStyle={{
                    color: filter === value ? theme.colors.onPrimary : theme.colors.onSurface,
                    fontSize: 12,
                }}
            >
                {label} {count !== undefined ? `(${count})` : ''}
            </Chip>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <GradientHeader title="Redemption History" />

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[theme.colors.primary]}
                        tintColor={theme.colors.primary}
                    />
                }
            >
                {/* Stats Overview */}
                <Surface style={[styles.statsCard, { backgroundColor: theme.colors.surfaceVariant }]}>
                    <Text style={[styles.statsTitle, { color: theme.colors.onSurface }]}>
                        Redemption Summary
                    </Text>

                    <View style={styles.statsGrid}>
                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { color: theme.colors.text }]}>
                                {stats.total}
                            </Text>
                            <Text style={[styles.statLabel, { color: theme.colors.text }]}>
                                Total
                            </Text>
                        </View>

                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { color: theme.colors.text }]}>
                                {stats.pending}
                            </Text>
                            <Text style={[styles.statLabel, { color: theme.colors.text }]}>
                                Pending
                            </Text>
                        </View>

                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { color: theme.colors.text }]}>
                                {stats.redeemed}
                            </Text>
                            <Text style={[styles.statLabel, { color: theme.colors.text }]}>
                                Redeemed
                            </Text>
                        </View>

                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { color: theme.colors.text }]}>
                                {stats.cancelled + stats.expired}
                            </Text>
                            <Text style={[styles.statLabel, { color: theme.colors.text }]}>
                                Cancelled
                            </Text>
                        </View>
                    </View>
                </Surface>

                {/* Filter Chips */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.filterContainer}
                    contentContainerStyle={styles.filterContent}
                >
                    <FilterChip value="all" label="All" count={stats.total} />
                    <FilterChip value="pending" label="Pending" count={stats.pending} />
                    <FilterChip value="redeemed" label="Redeemed" count={stats.redeemed} />
                    <FilterChip value="cancelled" label="Cancelled" count={stats.cancelled} />
                </ScrollView>

                {/* Redemptions List */}
                {filteredRedemptions.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <MaterialCommunityIcons
                            name="inbox-outline"
                            size={80}
                            color={theme.colors.accent}
                        />
                        <Text style={[styles.emptyTitle, { color: theme.colors.onSurface }]}>
                            No redemptions found
                        </Text>
                        <Text style={[styles.emptyText, { color: theme.colors.accent }]}>
                            {filter === 'all'
                                ? "You haven't created any redemptions yet."
                                : `No ${filter} redemptions found.`
                            }
                        </Text>
                    </View>
                ) : (
                    <View style={styles.redemptionsList}>
                        {filteredRedemptions.map((redemption) => (
                            <TouchableOpacity
                                key={redemption.redemption_id}
                                onPress={() => handleRedemptionPress(redemption)}
                                disabled={loadingQR === redemption.redemption_id}
                            >
                                <Surface
                                    style={[
                                        styles.redemptionCard,
                                        { backgroundColor: theme.colors.backdrop, opacity: loadingQR === redemption.redemption_id ? 0.2 : 1 }
                                    ]}
                                >
                                    {/* Card Header */}
                                    <View style={styles.cardHeader}>
                                        <View style={styles.shopInfo}>
                                            <MaterialCommunityIcons
                                                name="store"
                                                size={20}
                                                color={theme.colors.primary}
                                            />
                                            <Text
                                                style={[styles.shopName, { color: theme.colors.onSurface }]}
                                                numberOfLines={1}
                                                ellipsizeMode="tail"
                                            >
                                                {redemption.seller_shop_name}
                                            </Text>
                                        </View>

                                        <Chip
                                            icon={getStatusIcon(redemption.status)}
                                            style={[

                                                { borderColor: getStatusColor(redemption.status), backgroundColor: theme.colors.background, borderWidth: 1 }
                                            ]}
                                            textStyle={{ color: getStatusColor(redemption.status), }}
                                        >
                                            {getStatusText(redemption.status)}
                                        </Chip>
                                    </View>

                                    <Divider style={[styles.divider, { backgroundColor: theme.colors.outline }]} />

                                    {/* Card Content */}
                                    <View style={styles.cardContent}>
                                        <View style={styles.pointsRow}>
                                            <Text style={[styles.pointsLabel, { color: theme.colors.text }]}>
                                                Points:
                                            </Text>
                                            <Text style={[styles.pointsValue, { color: theme.colors.primary }]}>
                                                {redemption.points} pts
                                            </Text>
                                        </View>

                                        {redemption.offer_name && (
                                            <View style={styles.offerRow}>
                                                <Text style={[styles.offerLabel, { color: theme.colors.text }]}>
                                                    Offer:
                                                </Text>
                                                <Text
                                                    style={[styles.offerValue, { color: theme.colors.onSurface }]}
                                                    numberOfLines={1}
                                                    ellipsizeMode="tail"
                                                >
                                                    {redemption.offer_name}
                                                </Text>
                                            </View>
                                        )}



                                        {redemption.status === 'redeemed' && redemption.redeemed_at && (
                                            <View style={styles.infoRow}>
                                                <MaterialCommunityIcons
                                                    name="check-circle"
                                                    size={14}
                                                    color={theme.colors.success}
                                                />
                                                <Text style={[styles.infoText, { color: theme.colors.success }]}>
                                                    Redeemed at: {formatTimeAgo(redemption.redeemed_at)}
                                                </Text>
                                            </View>
                                        )}

                                        {redemption.status === 'expired' && (
                                            <View style={styles.infoRow}>
                                                <MaterialCommunityIcons
                                                    name="clock-alert"
                                                    size={14}
                                                    color={theme.colors.error}
                                                />
                                                <Text style={[styles.infoText, { color: theme.colors.error }]}>
                                                    Expired
                                                </Text>
                                            </View>
                                        )}

                                        {redemption.status === 'cancelled' && (
                                            <View style={styles.infoRow}>
                                                <MaterialCommunityIcons
                                                    name="close-circle"
                                                    size={14}
                                                    color={theme.colors.error}
                                                />
                                                <Text style={[styles.infoText, { color: theme.colors.error }]}>
                                                    Cancelled
                                                </Text>
                                            </View>
                                        )}
                                    </View>

                                    {/* Card Footer */}
                                    <View style={styles.cardFooter}>
                                        <Text style={[styles.footerText, { color: theme.colors.text }]}>
                                            Created {formatTimeAgo(redemption.created_at)}
                                        </Text>

                                        <View style={styles.footerRight}>
                                            {redemption.status === 'pending' && (
                                                <MaterialCommunityIcons
                                                    name="qrcode"
                                                    size={16}
                                                    color={theme.colors.primary}
                                                    style={styles.qrIcon}
                                                />
                                            )}
                                            <MaterialCommunityIcons
                                                name="chevron-right"
                                                size={20}
                                                color={theme.colors.text}
                                            />
                                        </View>
                                    </View>
                                </Surface>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* Create New Button */}
                <View style={{ marginHorizontal: 16 }}>
                    {filteredRedemptions.length > 0 && (
                        <Button
                            variant="contained"
                            onPress={handleCreateNewRedemption}
                            icon="plus"
                        >
                            New Redemption
                        </Button>
                    )}
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
    statsCard: {
        borderRadius: 16,
        padding: 20,
        marginHorizontal: 20,
        marginTop: 16,
        marginBottom: 16,
        elevation: 2,
    },
    statsTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 16,
    },
    statsDivider: {
        height: 1,
        marginVertical: 12,
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 14,
        fontWeight: '500',
    },
    pointsSummary: {
        gap: 8,
    },
    pointsStat: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    pointsStatLabel: {
        fontSize: 13,
        flex: 1,
    },
    pointsStatValue: {
        fontSize: 14,
        fontWeight: '600',
    },
    filterContainer: {
        marginBottom: 16,
    },
    filterContent: {
        paddingHorizontal: 20,
        gap: 8,
    },
    filterChip: {
        marginRight: 8,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
        paddingVertical: 60,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
    },
    redemptionsList: {
        paddingHorizontal: 20,
        gap: 12,
        marginBottom: 20,
    },
    redemptionCard: {
        borderRadius: 16,
        padding: 16,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    shopInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 8,
    },
    shopName: {
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
        flex: 1,
    },
    divider: {
        height: 1,
        marginBottom: 12,
    },
    cardContent: {
        gap: 8,
    },
    pointsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    pointsLabel: {
        fontSize: 14,
        fontWeight: '500',
    },
    pointsValue: {
        fontSize: 16,
        fontWeight: '700',
    },
    offerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    offerLabel: {
        fontSize: 14,
        fontWeight: '500',
    },
    offerValue: {
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'right',
        flex: 1,
        marginLeft: 8,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    infoText: {
        fontSize: 12,
        fontWeight: '500',
        marginLeft: 6,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.1)',
    },
    footerText: {
        fontSize: 11,
    },
    footerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    qrIcon: {
        marginRight: 8,
    },
    createButton: {
        marginHorizontal: 20,
        marginBottom: 40,
    },
});