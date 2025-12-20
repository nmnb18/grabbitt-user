import React from "react";
import { StyleSheet, View } from "react-native";
import { Card, Text, Surface } from "react-native-paper";
import { useTheme } from "@/hooks/use-theme-color";
import { StoreBalance } from "@/types/wallet";
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
                                        style={[styles.storeReward, { color: theme.colors.accent }]}
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
                                        POINTS
                                    </Text>
                                </View>

                            </View>
                            <View style={styles.redeemOverlay}>
                                <GradientText >Tap to Redeem</GradientText>
                            </View>

                            {/* Redeem Button */}


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
        overflow: 'hidden',
        position: 'relative'
    },
    storeHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
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
        fontSize: 14,
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
    redeemOverlay: {
        position: "absolute",
        bottom: 5,
        alignSelf: "center",
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 8,
        backgroundColor: "rgba(0,0,0,0.05)",
    }
});