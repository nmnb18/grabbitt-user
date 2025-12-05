// components/wallet/store-points-list.tsx
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Card, Text, Surface, Divider } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/hooks/use-theme-color";
import { StoreBalance } from "@/types/wallet";
import { Button } from "../ui/paper-button";
import { useRouter } from "expo-router";
import { GradientText } from "../ui/gradient-text";

interface StorePointsListProps {
    balances: StoreBalance[];

}

export function StorePointsList({ balances }: StorePointsListProps) {
    const theme = useTheme();
    const router = useRouter();

    const handleRedeemPress = (store: StoreBalance) => {
        router.replace({
            pathname: "/(drawer)/redeem/redeem-home",
            params: {
                store: JSON.stringify(store), // Stringify the entire store object
            },
        });
    };
    return (
        <View style={styles.container}>


            {balances.map((store) => {
                return (
                    <Card
                        key={store.seller_id}
                        style={[styles.storeCard, { backgroundColor: theme.colors.surface }]}
                        elevation={2}
                        onPress={() => handleRedeemPress(store)}
                    >
                        <Card.Content>
                            {/* Store Header */}
                            <View style={styles.storeHeader}>
                                <Surface style={[styles.storeIcon, { backgroundColor: theme.colors.surfaceVariant }]}>
                                    <Text style={{ fontSize: 24 }}>🏪</Text>
                                </Surface>

                                <View style={styles.storeInfo}>
                                    <Text
                                        style={[styles.storeName, { color: theme.colors.onSurface }]}
                                        numberOfLines={1}
                                    >
                                        {store.seller_name}
                                    </Text>
                                    <Text
                                        style={[styles.storeReward, { color: theme.colors.onSurface }]}
                                        numberOfLines={2}
                                    >
                                        {store.reward_description}
                                    </Text>
                                </View>

                                <View style={styles.pointsContainer}>
                                    <Text style={[styles.pointsValue, { color: theme.colors.primary }]}>
                                        {store.points}
                                    </Text>
                                    <Text style={[styles.pointsLabel, { color: theme.colors.onSurface }]}>
                                        points
                                    </Text>
                                </View>
                            </View>

                            <Divider style={[styles.divider, { backgroundColor: theme.colors.outline }]} />

                            {/* Redeem Button */}
                            <GradientText >Tap to Redeem</GradientText>

                        </Card.Content>
                    </Card>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { marginTop: 16 },
    storeCard: {
        borderRadius: 16,
        marginBottom: 12,
        overflow: 'hidden',
    },
    storeHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    storeIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    storeInfo: {
        flex: 1,
        marginRight: 8,
    },
    storeName: {
        fontWeight: "600",
        fontSize: 16,
        marginBottom: 2,
    },
    storeReward: {
        fontSize: 12,
        lineHeight: 16,
    },
    pointsContainer: {
        alignItems: "center",
        minWidth: 60,
    },
    pointsValue: {
        fontSize: 20,
        fontWeight: "700",
    },
    pointsLabel: {
        fontSize: 12,
        marginTop: 2,
    },
    divider: {
        marginVertical: 12,
        height: 1,
    },
    progressContainer: {
        marginBottom: 16,
    },
    progressLabels: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 6,
    },
    progressLabel: {
        fontSize: 12,
        fontWeight: "500",
    },
    progressPercentage: {
        fontSize: 12,
        fontWeight: "600",
    },
    progressBar: {
        height: 8,
        borderRadius: 4,
        overflow: "hidden",
        marginBottom: 6,
    },
    progressFill: {
        height: "100%",
    },
    progressText: {
        fontSize: 11,
        textAlign: "center",
    },
    redeemButton: {
        borderRadius: 12,
        marginTop: 4,
    },
});