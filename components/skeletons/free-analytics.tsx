import React from "react";
import { StyleSheet, View } from "react-native";
import { Skeleton } from "../ui/skeleton";

export default function FreeAnalyticsSkeleton() {
    return (
        <View style={styles.container}>

            {/* Header */}
            <Skeleton style={styles.headerTitle} />
            <Skeleton style={styles.headerSubtitle} />

            {/* Today card */}
            <Skeleton style={styles.todayCard} />

            {/* Stats grid */}
            <View style={styles.grid}>
                <Skeleton style={styles.tile} />
                <Skeleton style={styles.tile} />
            </View>
            <View style={styles.grid}>
                <Skeleton style={styles.tile} />
                <Skeleton style={styles.tile} />
            </View>
            <View style={styles.grid}>
                <Skeleton style={styles.tile} />
            </View>

            {/* Recent scans */}
            <Skeleton style={styles.card} />
            <Skeleton style={styles.card} />
            <Skeleton style={styles.card} />

            {/* Upgrade card */}
            <Skeleton style={styles.upgradeCard} />

        </View>
    );
}

const styles = StyleSheet.create({
    container: { padding: 16 },
    headerTitle: { width: 160, height: 24, marginBottom: 8 },
    headerSubtitle: { width: 220, height: 18, marginBottom: 16 },

    todayCard: {
        height: 90,
        borderRadius: 14,
        marginBottom: 16,
    },

    grid: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 14,
    },
    tile: {
        width: "48%",
        height: 110,
        borderRadius: 14,
    },

    card: {
        height: 70,
        borderRadius: 14,
        marginBottom: 16,
    },

    upgradeCard: {
        height: 140,
        borderRadius: 14,
        marginTop: 16,
    },
});
