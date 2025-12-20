import React from "react";
import { StyleSheet, View } from "react-native";
import { useTheme } from "@/hooks/use-theme-color";
import { Skeleton } from "../ui/skeleton";

const CATEGORIES = [
    { label: "All", value: "all" },
    { label: "Restaurant/Cafe", value: "restaurant" },
    { label: "Shopping", value: "other" },
    { label: "Retail Store", value: "retail" },
    { label: "Entertainment", value: "other" },
    { label: "Services", value: "service" },
];

export default function HomeSkeleton() {
    const theme = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Search */}
            <Skeleton style={styles.searchBar} />

            {/* Categories */}
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

            {/* Store Cards */}
            <View style={styles.storesList}>
                {[1, 2, 3].map((item) => (
                    <View key={item} style={styles.storeCard}>
                        {/* Banner */}
                        <View style={styles.bannerWrapper}>
                            <Skeleton style={styles.bannerImage} />

                            {/* Top row */}
                            <View style={styles.bannerTop}>
                                <Skeleton style={styles.bannerCategory} />
                                <Skeleton style={styles.bannerDistance} />
                            </View>

                            {/* Bottom row */}
                            <View style={styles.bannerBottom}>
                                <Skeleton style={styles.logo} />
                                <Skeleton style={styles.storeName} />
                            </View>
                        </View>

                        {/* Body */}
                        <View style={styles.body}>
                            <Skeleton style={styles.storeDesc} />

                            {/* Contact rows */}
                            <View style={styles.contactRow}>
                                <Skeleton style={styles.contactIcon} />
                                <Skeleton style={styles.contactText} />
                            </View>

                            <View style={styles.contactRow}>
                                <Skeleton style={styles.contactIcon} />
                                <Skeleton style={styles.contactText} />
                            </View>

                            {/* Actions */}
                            <View style={styles.actionRow}>
                                <Skeleton style={styles.actionBtn} />
                                <Skeleton style={styles.actionBtn} />
                            </View>
                        </View>
                    </View>
                ))}
            </View>

            {/* FAB */}
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

    /* Search */
    searchBar: {
        height: 56,
        borderRadius: 8,
        marginBottom: 16,
    },

    /* Categories */
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

    /* Section header */
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

    /* Cards */
    storesList: {
        gap: 20,
    },
    storeCard: {
        borderRadius: 18,
    },

    /* Banner */
    bannerWrapper: {
        height: 160,
        position: "relative",
    },
    bannerImage: {
        height: "100%",
        width: "100%",
        borderRadius: 12,
    },

    bannerTop: {
        position: "absolute",
        top: 10,
        left: 10,
        right: 10,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    bannerCategory: {
        height: 26,
        width: 70,
        borderRadius: 13,
    },
    bannerDistance: {
        height: 22,
        width: 60,
        borderRadius: 11,
    },

    bannerBottom: {
        position: "absolute",
        bottom: 10,
        left: 12,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    logo: {
        width: 46,
        height: 46,
        borderRadius: 23,
    },
    storeName: {
        height: 18,
        width: 160,
        borderRadius: 6,
    },

    /* Body */
    body: {
        padding: 14,
    },
    storeDesc: {
        height: 12,
        width: "90%",
        borderRadius: 4,
        marginVertical: 12,
    },
    storeDescShort: {
        height: 12,
        width: "60%",
        borderRadius: 4,
        marginBottom: 14,
    },

    contactRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginBottom: 10,
    },
    contactIcon: {
        width: 18,
        height: 18,
        borderRadius: 9,
    },
    contactText: {
        height: 12,
        flex: 1,
        borderRadius: 4,
    },

    actionRow: {
        flexDirection: "row",
        marginTop: 10,
    },
    actionBtn: {
        flex: 1,
        height: 48,
        borderRadius: 0,
    },

    /* FAB */
    fab: {
        position: "absolute",
        bottom: 50,
        right: 16,
        width: 56,
        height: 56,
        borderRadius: 28,
    },
});