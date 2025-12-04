// screens/store/store-details-container.tsx
import React, { useState, useEffect } from "react";
import { Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";

import withSkeletonTransition from "@/components/wrappers/withSkeletonTransition";

import { ApiResponse, StoreDetails } from "@/types/seller";
import api from "@/services/axiosInstance";
import StoreDetailsScreen from "@/components/store/store-details-screen";
import StoreDetailsSkeleton from "@/components/skeletons/store-details";
// Wrap with skeleton transition
const StoreDetailsWithSkeleton = withSkeletonTransition(StoreDetailsSkeleton)(
    StoreDetailsScreen
);
interface StoreDetailsContainerProps {
    loading?: boolean;
    hasData?: boolean;
}

export default function StoreDetailsContainer(props: StoreDetailsContainerProps) {
    const router = useRouter();
    const params = useLocalSearchParams();

    const [store, setStore] = useState<StoreDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [hasData, setHasData] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const storeId = params.storeId as string;

    useEffect(() => {
        fetchStoreDetails();
    }, [storeId]);

    const fetchStoreDetails = async () => {
        if (!storeId) {
            setError("Store ID is required");
            Alert.alert("Error", "Store ID is required");
            router.back();
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await api.get<ApiResponse>(`/getSellerDetails`, {
                params: { uid: storeId },
            });

            if (response.data.success && response.data.user.seller_profile) {
                setStore(response.data.user.seller_profile);

            } else {
                const errorMsg = response.data.error || "Failed to load store details";
                setError(errorMsg);
                Alert.alert("Error", errorMsg);
                router.back();
            }
        } catch (error: any) {
            console.error("Store details error:", error);
            const errorMsg = error.response?.data?.error || "Failed to load store details";
            setError(errorMsg);
            Alert.alert("Error", errorMsg);
            router.back();
        } finally {
            setLoading(false);
            setHasData(true);
        }
    };

    const handleRedeem = (storeData: StoreDetails) => {
        router.push({
            pathname: "/(drawer)/redeem",
            params: { store: JSON.stringify(storeData) },
        });
    };

    const handleBack = () => {
        router.back();
    };

    // Combine container loading with props loading
    const isLoading = loading || props.loading;

    // If we have an error but still showing skeleton, let skeleton wrapper handle it
    if (error && !isLoading) {
        // Error already shown in Alert, component will unmount
        return null;
    }

    if (!store) {
        // Return null, skeleton will show
        return null;
    }

    return (
        <StoreDetailsWithSkeleton
            store={store}
            loading={isLoading}
            onBack={handleBack}
            onRedeem={handleRedeem}
            hasData={hasData}
            // Pass through other props if needed
            {...props}
        />
    );
}

