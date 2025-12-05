// components/wallet/total-points-card.tsx
import React from "react";
import { StyleSheet, View } from "react-native";
import { Card, Chip, Text } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/use-theme-color";
import { WalletStats } from "@/types/wallet";

interface TotalPointsCardProps {
    storeCount: number;
    stats: WalletStats
}

export function TotalPointsCard({ stats, storeCount }: TotalPointsCardProps) {
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
                    {stats.total_points_earned.toLocaleString()}
                </Text>
                <Text style={[styles.pointsLabel, { color: theme.colors.onPrimary }]}>
                    Total Points
                </Text>

                <View style={[styles.storeChip]}>
                    <Chip
                        icon='arrow-down'
                        style={[

                            { backgroundColor: theme.colors.text, borderWidth: 1 }
                        ]}
                        textStyle={{ fontWeight: '600' }}
                    >
                        {`${stats.points_wating_redeem}`}
                    </Chip>
                    <Chip
                        icon='star'
                        style={[

                            { backgroundColor: theme.colors.text, borderWidth: 1 }
                        ]}
                        textStyle={{ fontWeight: '600' }}
                    >
                        {`${stats.available_points}`}
                    </Chip>
                    <Chip
                        icon='gift'
                        style={[

                            { backgroundColor: theme.colors.text, borderWidth: 1 }
                        ]}
                        textStyle={{ fontWeight: '600' }}
                    >
                        {`${stats.total_points_redeem}`}
                    </Chip>
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
    storeChip: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 10
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