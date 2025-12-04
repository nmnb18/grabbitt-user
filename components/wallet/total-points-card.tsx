// components/wallet/total-points-card.tsx
import React from "react";
import { StyleSheet, View } from "react-native";
import { Card, Text } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/use-theme-color";

interface TotalPointsCardProps {
    totalPoints: number;
    storeCount: number;
}

export function TotalPointsCard({ totalPoints, storeCount }: TotalPointsCardProps) {
    const theme = useTheme();

    return (
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <LinearGradient
                colors={[theme.colors.primary, theme.colors.secondary]}
                style={styles.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={[styles.iconContainer, { backgroundColor: theme.colors.text }]}>
                    <MaterialCommunityIcons
                        name="wallet"
                        color={theme.colors.primary}
                        size={36}
                    />
                </View>

                <Text style={[styles.pointsValue, { color: theme.colors.onPrimary }]}>
                    {totalPoints.toLocaleString()}
                </Text>
                <Text style={[styles.pointsLabel, { color: theme.colors.onPrimary }]}>
                    Total Points
                </Text>

                <View style={[styles.storeCount, { backgroundColor: theme.colors.text }]}>
                    <MaterialCommunityIcons
                        name="store"
                        size={14}
                        color={theme.colors.onSurfaceVariant}
                        style={{ opacity: 0.9 }}
                    />
                    <Text style={[styles.storeCountText, { color: theme.colors.onSurfaceVariant }]}>
                        Across {storeCount} {storeCount === 1 ? "store" : "stores"}
                    </Text>
                </View>
            </LinearGradient>
        </Card>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        marginBottom: 24,
        overflow: "hidden",
        elevation: 4,
    },
    gradient: {
        padding: 16,
        alignItems: "center",
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 12,
    },
    pointsValue: {
        fontSize: 40,
        fontWeight: "800",
    },
    pointsLabel: {
        fontSize: 16,
        marginTop: 4,
        opacity: 0.9,
        fontWeight: '600'
    },
    storeCount: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 12,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    storeCountText: {
        fontSize: 14,
        marginLeft: 6,
        opacity: 0.9,
    },
});