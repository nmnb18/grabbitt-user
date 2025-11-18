// components/skeleton/DashboardSkeleton.tsx
import { useTheme } from "@/hooks/use-theme-color";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Skeleton } from "../ui/skeleton";

export default function DashboardSkeleton() {
    const theme = useTheme();
    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]} >
            {/* Hero Banner */}
            < Skeleton style={styles.hero} />

            {/* Stats Grid */}
            < View style={styles.grid} >
                <Skeleton style={styles.card} />
                < Skeleton style={styles.card} />
            </View>

            < View style={styles.grid} >
                <Skeleton style={styles.card} />
                < Skeleton style={styles.card} />
            </View>

            {/* QR Section */}
            <Skeleton style={styles.qr} />

            {/* Quick actions */}
            <Skeleton style={styles.action} />
            < Skeleton style={styles.action} />
            <Skeleton style={styles.action} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
    hero: {
        height: 180,
        borderRadius: 16,
        marginBottom: 24,
    },
    grid: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 16,
    },
    card: {
        flex: 1,
        height: 120,
        borderRadius: 16,
    },
    qr: {
        height: 200,
        borderRadius: 16,
        marginBottom: 24,
    },
    action: {
        height: 70,
        borderRadius: 14,
        marginBottom: 16,
    },
});
