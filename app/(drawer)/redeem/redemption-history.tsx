// screens/wallet/redemption-history-container.tsx
import React, { useState, useEffect, useCallback } from "react";
import { Alert } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";

import withSkeletonTransition from "@/components/wrappers/withSkeletonTransition";

import api from "@/services/axiosInstance";
import { RedemptionHistoryResponse } from "@/types/redemptions";
import RedemptionHistorySkeleton from "@/components/skeletons/redemption-history";
import RedemptionHistoryScreen from "@/components/wallet/redemption-history";

const RedemptionHistoryWithSkeleton = withSkeletonTransition(RedemptionHistorySkeleton)(
    RedemptionHistoryScreen
);

type RedemptionHistoryContainerProps = {
    loading?: boolean;
    hasData?: boolean;
}

export default function RedemptionHistoryContainer(props: RedemptionHistoryContainerProps) {
    const [redemptions, setRedemptions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        redeemed: 0,
        cancelled: 0,
        expired: 0,
        total_points: 0,
        redeemed_points: 0,
        pending_points: 0,
    });

    useFocusEffect(
        useCallback(() => {
            fetchRedemptions();
        }, [])
    );

    const fetchRedemptions = async () => {
        try {
            setLoading(true);

            const response = await api.get<RedemptionHistoryResponse>("/getUserRedemptions");

            if (response.data.success) {
                setRedemptions(response.data.redemptions);
                if (response.data.stats) {
                    setStats(response.data.stats);
                }
            }
        } catch (error: any) {
            console.error("Fetch redemptions error:", error);
            Alert.alert("Error", "Failed to load redemption history");
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        await fetchRedemptions();
    };

    // Calculate hasData for skeleton wrapper
    const hasData = redemptions.length > 0 || !loading;

    return (
        <RedemptionHistoryWithSkeleton
            redemptions={redemptions}
            stats={stats}
            onRefresh={handleRefresh}
            {...props}
            loading={loading}
            hasData={hasData}
        />
    );
}
