// screens/store/store-details-container.tsx
import React, { useState, useEffect, useCallback } from "react";
import { Alert } from "react-native";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";

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
    const [todayOffer, setTodayOffer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [hasData, setHasData] = useState(false);
    const [redemptionCode, setRedemptionCode] = useState();
    const [redemptionStatus, setRedemptionStatus] = useState();
    const [error, setError] = useState<string | null>(null);

    const storeId = params.storeId as string;

    useFocusEffect(
        useCallback(() => {
            fetchStoreDetails();
        }, [storeId]));

    const fetchTodayOffer = async () => {
        try {
            const resp = await api.get(`/getSellerOfferById?seller_id=${storeId}`);
            if (resp.data.active?.length > 0) {
                setTodayOffer(resp.data.active[0]); // today’s single entry
            } else {
                setTodayOffer(null);
            }
        } catch (e) {
            console.log("Failed to fetch today's offer");
        }
    };

    const fetchOfferStatus = async () => {
        try {
            const resp = await api.get(`/getTodayOfferStatus?seller_id=${storeId}`);
            if (!resp.data.error) {
                setRedemptionCode(resp.data.redeem_code);
                setRedemptionStatus(resp.data.status);
            }
        } catch (e) {
            console.log("Failed to fetch today's offer status");
        }
    };


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

            await fetchTodayOffer();
            await fetchOfferStatus();

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

    const handleRedeem = async (storeData: StoreDetails) => {
        setLoading(true);
        try {
            const store = await api.get('/getBalanceBySeller', {
                params: {
                    seller_id: storeData.user_id
                }
            })
            if (!store.data.can_redeem) {
                Alert.alert("Redeem", "You don't have enough rewards points! Scan more to redeem points")
                return;
            } else {
                router.push({
                    pathname: "/(drawer)/redeem/redeem-home",
                    params: { store: JSON.stringify(store.data) },
                });
            }
        } catch (error: any) {
            const errorMsg = error.response?.data?.error || "Failed to redeem";
            Alert.alert("Error", errorMsg);
        } finally {
            setLoading(false);
        }


    };

    const handleBack = () => {
        router.back();
    };

    // Combine container loading with props loading
    const isLoading = loading || props.loading;


    return (
        <StoreDetailsWithSkeleton
            store={store}
            loading={isLoading}
            todayOffer={todayOffer}
            redemptionCode={redemptionCode}
            redemptionStatus={redemptionStatus}
            onBack={handleBack}
            onRedeem={handleRedeem}
            setRedemptionCode={setRedemptionCode}
            setRedemptionStatus={setRedemptionStatus}
            storeId={storeId}
            hasData={hasData}
            // Pass through other props if needed
            {...props}
        />
    );
}

