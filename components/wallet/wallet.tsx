// components/wallet/index.tsx
import React, { useState } from "react";
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from "react-native";
import { useTheme } from "@/hooks/use-theme-color";
import { WalletData } from "@/types/wallet";
import { TotalPointsCard } from "./total-points-card";
import { EmptyState } from "./empty-state";
import { StorePointsList } from "./store-points-list";
import { RecentActivity } from "./recent-activity";
import { SegmentedButtons, Text } from "react-native-paper";

interface WalletScreenProps {
    walletData: WalletData;
    loading?: boolean;
    refreshing?: boolean;
    onRefresh: () => void;
}

export function WalletScreen({
    walletData,
    loading = false,
    refreshing = false,
    onRefresh,
}: WalletScreenProps) {
    const theme = useTheme();

    const [tab, setTab] = useState<'balance' | 'activity'>('balance');

    const inactiveTextColor = theme.colors.onSurface + "99"; // subtle
    const activeTextColor = theme.colors.onSurface;
    const tabBackground = theme.colors.surface + "33";

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                contentContainerStyle={styles.content}
            >
                <TotalPointsCard
                    stats={walletData.stats}
                    storeCount={walletData.balances.length}
                />
                <View style={[
                    styles.tabs,
                    { backgroundColor: tabBackground }
                ]}>
                    <SegmentedButtons
                        value={tab}
                        onValueChange={(value) => setTab(value as "balance" | "activity")}
                        buttons={[
                            { value: "balance", label: "Points by Store", icon: "star" },
                            { value: "activity", label: "Recent Activity", icon: "menu" },
                        ]}
                        style={{ marginBottom: 20, width: '100%' }}
                        theme={{
                            colors: {
                                secondaryContainer: theme.colors.tertiary,
                                onSecondaryContainer: "#fff",
                            },
                        }}
                    />

                </View>

                {tab === 'balance' ? walletData.balances.length === 0 ? (
                    <EmptyState
                        icon="wallet-outline"
                        title="No Points Yet"
                        message="Scan QR codes at stores to earn points"
                        onAction={() => { }} // Will navigate to scan QR
                    />
                ) : (
                    <StorePointsList
                        balances={walletData.balances}
                    />
                ) : walletData.balances.length === 0 ? (
                    <EmptyState
                        icon="menu"
                        title="No acitivity yet"
                        message="Scan QR codes to get start"
                        onAction={() => { }} // Will navigate to scan QR
                    />
                ) : (
                    <RecentActivity
                        transactions={walletData.transactions}
                        onRefresh={onRefresh}
                    />
                )}

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { paddingHorizontal: 16, paddingTop: 24 },
    tabs: {
        flexDirection: 'row',
        marginTop: 12,
        borderRadius: 12,
    },

    tab: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },

    tabText: {
        fontSize: 16,
        fontWeight: '500',
    }
});