// components/skeletons/RedemptionHistorySkeleton.tsx
import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Surface } from "react-native-paper";
import { useTheme } from "@/hooks/use-theme-color";
import { Skeleton } from "../ui/skeleton";
import { GradientHeader } from "../shared/app-header";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RedemptionHistorySkeleton() {
    const theme = useTheme();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <GradientHeader title="Redemption History" />

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 }}
            >
                {/* Stats Card */}
                <Surface style={[styles.statsCard, { backgroundColor: theme.colors.surfaceVariant }]}>
                    <Skeleton style={styles.statsTitleSkeleton} />

                    <View style={styles.statsGrid}>
                        {[1, 2, 3, 4].map((i) => (
                            <View key={i} style={styles.statItem}>
                                <Skeleton style={styles.statValueSkeleton} />
                                <Skeleton style={styles.statLabelSkeleton} />
                            </View>
                        ))}
                    </View>
                </Surface>

                {/* Filters */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.filterContainer}
                    contentContainerStyle={styles.filterContent}
                >
                    {[1, 2, 3, 4, 5].map((i) => (
                        <Skeleton key={i} style={styles.filterChipSkeleton} />
                    ))}
                </ScrollView>

                {/* Redemption Cards */}
                <View style={styles.redemptionsList}>
                    {[1, 2, 3].map((i) => (
                        <Surface
                            key={i}
                            style={[
                                styles.redemptionCardSkeleton,
                                { backgroundColor: theme.colors.surfaceVariant },
                            ]}
                        >
                            {/* Header */}
                            <View style={styles.cardHeader}>
                                <View style={styles.shopInfo}>
                                    <Skeleton style={styles.shopIconSkeleton} />
                                    <Skeleton style={styles.shopNameSkeleton} />
                                </View>
                                <Skeleton style={styles.statusChipSkeleton} />
                            </View>

                            <Skeleton style={styles.dividerSkeleton} />

                            {/* Content */}
                            <View style={styles.cardContent}>
                                <View style={styles.pointsRow}>
                                    <Skeleton style={styles.pointsLabelSkeleton} />
                                    <Skeleton style={styles.pointsValueSkeleton} />
                                </View>

                                <Skeleton style={styles.offerRowSkeleton} />
                                <Skeleton style={styles.dateRowSkeleton} />
                                <Skeleton style={styles.expiryRowSkeleton} />
                            </View>

                            {/* Footer */}
                            <View style={styles.cardFooter}>
                                <Skeleton style={styles.footerTextSkeleton} />
                                <Skeleton style={styles.arrowSkeleton} />
                            </View>
                        </Surface>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollView: { flex: 1 },

    // Stats Card
    statsCard: {
        borderRadius: 16,
        padding: 20,
        marginHorizontal: 20,
        marginTop: 16,
        marginBottom: 16,
        elevation: 2,
    },
    statsTitleSkeleton: {
        width: "40%",
        height: 20,
        borderRadius: 8,
        marginBottom: 16,
    },
    statsGrid: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    statItem: { alignItems: "center" },
    statValueSkeleton: {
        width: 40,
        height: 28,
        borderRadius: 8,
        marginBottom: 6,
    },
    statLabelSkeleton: {
        width: 30,
        height: 14,
        borderRadius: 6,
    },

    // Filters
    filterContainer: { marginBottom: 16 },
    filterContent: { paddingHorizontal: 20, gap: 8 },
    filterChipSkeleton: {
        width: 80,
        height: 32,
        borderRadius: 16,
    },

    // List
    redemptionsList: {
        paddingHorizontal: 20,
        gap: 12,
    },
    redemptionCardSkeleton: {
        borderRadius: 16,
        padding: 16,
        elevation: 2,
    },

    // Card Header
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    shopInfo: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    shopIconSkeleton: {
        width: 20,
        height: 20,
        borderRadius: 10,
    },
    shopNameSkeleton: {
        height: 18,
        borderRadius: 6,
        marginLeft: 8,
        flex: 1,
    },
    statusChipSkeleton: {
        width: 70,
        height: 24,
        borderRadius: 12,
    },

    dividerSkeleton: {
        height: 1,
        borderRadius: 0,
        marginBottom: 12,
    },

    // Content
    cardContent: { gap: 8 },
    pointsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    pointsLabelSkeleton: {
        width: "30%",
        height: 16,
        borderRadius: 6,
    },
    pointsValueSkeleton: {
        width: "20%",
        height: 20,
        borderRadius: 8,
    },
    offerRowSkeleton: {
        width: "90%",
        height: 14,
        borderRadius: 6,
    },
    dateRowSkeleton: {
        width: "60%",
        height: 12,
        borderRadius: 6,
        marginTop: 4,
    },
    expiryRowSkeleton: {
        width: "50%",
        height: 12,
        borderRadius: 6,
        marginTop: 2,
    },

    // Footer
    cardFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 12,
        paddingTop: 12,
    },
    footerTextSkeleton: {
        width: "40%",
        height: 12,
        borderRadius: 6,
    },
    arrowSkeleton: {
        width: 20,
        height: 20,
        borderRadius: 10,
    },
});
