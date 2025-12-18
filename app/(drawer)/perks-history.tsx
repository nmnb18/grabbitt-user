import React, { useCallback, useState } from "react";
import { Alert } from "react-native";
import api from "@/services/axiosInstance";
import { UserPerkItem, UserPerksHistoryResponse } from "@/types/perks";
import PerksHistory from "@/components/perks/perks-history";
import PerksHistorySkeleton from "@/components/skeletons/perks-history";
import withSkeletonTransition from "@/components/wrappers/withSkeletonTransition";
import { useFocusEffect } from "expo-router";

const PerksHistoryWithSkeleton = withSkeletonTransition(PerksHistorySkeleton)(
    PerksHistory
);

export default function PerksHistoryContainer() {
    const [perks, setPerks] = useState<UserPerkItem[]>();
    const [loading, setLoading] = useState(true);
    const [hasData, setHasData] = useState(false);

    useFocusEffect(
        useCallback(() => {
            fetchPerks();
        }, [])
    );


    const fetchPerks = async () => {
        try {
            setLoading(true);

            const response = await api.get<UserPerksHistoryResponse>("/getUserPerks");
            if (response.data.success) {
                setPerks(response.data.perks)
            }
        } catch (error: any) {
            console.error("Fetch perks error:", error);
            Alert.alert("Error", "Failed to load perks history");
        } finally {
            setLoading(false);
            setHasData(true);
        }
    };




    return (
        <PerksHistoryWithSkeleton
            loading={loading}
            hasData={hasData}
            perks={perks}
        />
    );
}
