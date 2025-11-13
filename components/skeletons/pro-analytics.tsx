import React from "react";
import { StyleSheet, View } from "react-native";
import { Skeleton } from "../ui/skeleton";

export default function ProAnalyticsSkeleton() {
    return (
        <View style={styles.container}>

            {/* Header */}
            <Skeleton style={styles.title} />
            <Skeleton style={styles.subtitle} />

            {/* 7-day chart card */}
            <Skeleton style={styles.cardHeader} />
            {Array.from({ length: 7 }).map((_, i) => (
                <View key={i} style={styles.chartRow}>
                    <Skeleton style={styles.chartLabel} />
                    <Skeleton style={styles.chartBar} />
                    <Skeleton style={styles.chartValue} />
                </View>
            ))}

            {/* Customers segmentation */}
            <Skeleton style={styles.cardHeader} />
            <View style={styles.row}>
                <Skeleton style={styles.boxHalf} />
                <Skeleton style={styles.boxHalf} />
            </View>

            {/* Peak hours & days */}
            <Skeleton style={styles.cardHeader} />
            <View style={styles.row}>
                <View style={styles.half}>
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} style={styles.listRow} />
                    ))}
                </View>
                <View style={styles.half}>
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} style={styles.listRow} />
                    ))}
                </View>
            </View>

            {/* QR breakdown */}
            <Skeleton style={styles.cardHeader} />
            {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} style={styles.listRow} />
            ))}

            {/* Top customers */}
            <Skeleton style={styles.cardHeader} />
            {Array.from({ length: 5 }).map((_, i) => (
                <View key={i} style={styles.customerRow}>
                    <Skeleton style={styles.avatar} />
                    <Skeleton style={styles.customerText} />
                </View>
            ))}

            {/* Reward funnel */}
            <Skeleton style={styles.cardHeader} />
            <Skeleton style={styles.funnelLine} />
            <Skeleton style={styles.funnelLine} />
            <Skeleton style={styles.funnelLine} />

            {/* Export */}
            <Skeleton style={styles.cardHeader} />
            <Skeleton style={styles.exportLine} />

            <View style={{ height: 40 }} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { padding: 16 },

    title: { width: 180, height: 22, marginBottom: 6 },
    subtitle: { width: 140, height: 16, marginBottom: 16 },

    cardHeader: {
        width: 160,
        height: 20,
        marginBottom: 12,
        marginTop: 16,
    },

    // Chart
    chartRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    chartLabel: { width: 40, height: 14, marginRight: 8 },
    chartBar: { flex: 1, height: 10, borderRadius: 6 },
    chartValue: { width: 30, height: 14, marginLeft: 8 },

    // Two-box rows
    row: { flexDirection: "row", marginBottom: 8 },
    boxHalf: {
        flex: 1,
        height: 80,
        borderRadius: 12,
        marginRight: 6,
    },
    half: { flex: 1, marginHorizontal: 4 },

    // Peak rows + QR list
    listRow: {
        width: "100%",
        height: 18,
        marginBottom: 10,
        borderRadius: 6,
    },

    // Top Customers
    customerRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 12,
    },
    customerText: { width: "70%", height: 16 },

    // Funnel
    funnelLine: {
        width: "60%",
        height: 16,
        marginBottom: 8,
    },

    exportLine: {
        width: "80%",
        height: 18,
        marginBottom: 12,
    },
});
