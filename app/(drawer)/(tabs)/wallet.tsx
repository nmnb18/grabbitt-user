// screens/wallet.tsx
import React, { useState, useCallback } from "react";
import { Alert, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import api from "@/services/axiosInstance";
import { WalletData } from "@/types/wallet";
import withSkeletonTransition from "@/components/wrappers/withSkeletonTransition";
import WalletSkeleton from "@/components/skeletons/wallet";
import { WalletScreen } from "@/components/wallet/wallet";

const WalletScreenWithSkeleton = withSkeletonTransition(WalletSkeleton)(WalletScreen);

export default function WalletContainer() {
    const [walletData, setWalletData] = useState<WalletData>({
        balances: [],
        transactions: [],
        stats: {
            available_points: 0,
            total_points_earned: 0,
            points_wating_redeem: 0,
            total_points_redeem: 0
        }
    });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [hasData, setHasData] = useState(false);

    const loadWalletData = useCallback(async (isRefreshing = false, silent = false) => {
        try {
            if (!isRefreshing && !silent) {
                setLoading(true);
            }

            const [balanceRes, txRes] = await Promise.all([
                api.get("/getPointsBalance"),
                api.get("/getTransactions")
            ]);

            const balances = balanceRes.data.balances || [];

            setWalletData({
                balances,
                transactions: txRes.data || [],
                stats: balanceRes.data.stats
            });

            setHasData(true)

        } catch (err: any) {
            console.error("Wallet error:", err);
            if (!silent) {
                Alert.alert("Error", err?.message || "Failed to load wallet data");
            }
        } finally {
            setLoading(false);
            setHasData(true)
            setRefreshing(false);
        }
    }, []);

    // Initial load
    useFocusEffect(
        useCallback(() => {
            loadWalletData();
        }, [loadWalletData])
    );

    const handleRefresh = () => {
        setRefreshing(true);
        loadWalletData(true);
    };

    return (
        <View style={{ flex: 1 }}>
            <WalletScreenWithSkeleton
                walletData={walletData}
                loading={loading}
                refreshing={refreshing}
                hasData={hasData}
                onRefresh={handleRefresh}
            />
        </View>
    );
}