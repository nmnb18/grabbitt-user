import React from "react";
import { StyleSheet, View } from "react-native";
import { useTheme } from "@/hooks/use-theme-color";
import { Skeleton } from "../ui/skeleton";

const CATEGORIES = [
    { label: "All", value: 'all' },
    { label: "Restaurant/Cafe", value: 'restaurant' },
    { label: "Shopping", value: 'other' },
    { label: "Retail Store", value: 'retail' },
    { label: "Entertainment", value: 'other' },
    { label: "Services", value: 'service' },
];

export default function HomeSkeleton() {
    const theme = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Search Bar Skeleton */}
            <Skeleton style={styles.searchBar} />

            {/* Categories Skeleton */}
            <View style={styles.categoriesScroll}>
                {CATEGORIES.map((_, index) => (
                    <Skeleton key={index} style={styles.categoryChip} />
                ))}
            </View>

            {/* Section Header */}
            <View style={styles.sectionHeader}>
                <Skeleton style={styles.sectionTitle} />
                <Skeleton style={styles.sectionSubtitle} />
            </View>

            {/* Store Cards Skeleton */}
            <View style={styles.storesList}>
                {[1, 2, 3, 4].map((item) => (
                    <View key={item} style={styles.storeCard}>
                        {/* Store Icon & Info Row */}
                        <View style={styles.storeCardInner}>
                            <Skeleton style={styles.storeIcon} />

                            <View style={styles.storeInfo}>
                                <Skeleton style={styles.storeName} />
                                <Skeleton style={styles.storeCategory} />
                                <Skeleton style={styles.storeDesc} />
                                <Skeleton style={styles.storeDescShort} />

                                {/* Reward Points Row */}
                                <View style={styles.rewardRow}>
                                    <View style={styles.rewardItem}>
                                        <Skeleton style={styles.rewardIcon} />
                                        <Skeleton style={styles.rewardText} />
                                    </View>
                                    <View style={styles.rewardItem}>
                                        <Skeleton style={styles.rewardIcon} />
                                        <Skeleton style={styles.rewardText} />
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>
                ))}
            </View>

            {/* FAB Skeleton */}
            <Skeleton style={styles.fab} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 16,
        paddingBottom: 30,
        paddingTop: 15,
    },
    searchBar: {
        height: 56,
        borderRadius: 8,
        marginBottom: 16,
    },
    categoriesScroll: {
        flexDirection: "row",
        gap: 10,
        marginBottom: 20,
    },
    categoryChip: {
        height: 32,
        width: 80,
        borderRadius: 20,
    },
    sectionHeader: {
        marginBottom: 16,
        gap: 8,
    },
    sectionTitle: {
        height: 24,
        width: 150,
        borderRadius: 4,
    },
    sectionSubtitle: {
        height: 16,
        width: 120,
        borderRadius: 4,
    },
    storesList: {
        gap: 16,
    },
    storeCard: {
        borderRadius: 16,
    },
    storeCardInner: {
        flexDirection: "row",
        gap: 12,
        paddingVertical: 12,
    },
    storeIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
    },
    storeInfo: {
        flex: 1,
        gap: 8,
    },
    storeName: {
        height: 20,
        width: "70%",
        borderRadius: 4,
    },
    storeCategory: {
        height: 20,
        width: 60,
        borderRadius: 16,
    },
    storeDesc: {
        height: 12,
        width: "90%",
        borderRadius: 4,
    },
    storeDescShort: {
        height: 12,
        width: "60%",
        borderRadius: 4,
    },
    rewardRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 4,
    },
    rewardItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    rewardIcon: {
        width: 20,
        height: 20,
        borderRadius: 10,
    },
    rewardText: {
        height: 12,
        width: 80,
        borderRadius: 4,
    },
    fab: {
        position: "absolute",
        bottom: 50,
        right: 16,
        width: 56,
        height: 56,
        borderRadius: 28,
    },
});