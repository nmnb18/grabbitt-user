// screens/wallet/redemption-container.tsx
import React, { useState, useEffect } from "react";
import { Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuthStore } from "@/store/authStore";

import withSkeletonTransition from "@/components/wrappers/withSkeletonTransition";

import api from "@/services/axiosInstance";
import { StoreBalance, Offer } from "@/types/wallet";
import { RedemptionResponse } from "@/types/redemptions";
import RedemptionSkeleton from "@/components/skeletons/redemptions";
import RedemptionScreen from "@/components/wallet/redemption-screen";

const UserHomeWithSkeleton = withSkeletonTransition(RedemptionSkeleton)(RedemptionScreen);

interface RedemptionContainerProps {
    loading?: boolean;
    hasData?: boolean;
}

export default function RedemptionContainer(props: RedemptionContainerProps) {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { user } = useAuthStore();

    const [store, setStore] = useState<StoreBalance | null>(null);
    const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
    const [customPoints, setCustomPoints] = useState<string>("");
    const [pointsToRedeem, setPointsToRedeem] = useState<number>(0);
    const [error, setError] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    // Parse store from params
    useEffect(() => {
        if (params.store) {
            try {
                const parsedStore = JSON.parse(params.store as string);
                setStore(parsedStore);
            } catch (error) {
                console.error("Failed to parse store data:", error);
                Alert.alert("Error", "Invalid store data");
                router.back();
            } finally {
                setLoading(false);
            }
        } else {
            Alert.alert("Error", "Store information is required");
            router.back();
        }
    }, [params.store]);

    // Initialize with minimum points
    useEffect(() => {
        if (store) {
            if (store.offers && store.offers.length > 0) {
                const minPointsOffer = [...store.offers].sort((a, b) => a.reward_points - b.reward_points)[0];
                setSelectedOffer(minPointsOffer);
                setPointsToRedeem(minPointsOffer.reward_points);
                setCustomPoints(minPointsOffer.reward_points.toString());
            } else {
                setPointsToRedeem(store.reward_points);
                setCustomPoints(store.reward_points.toString());
            }
        }
    }, [store]);

    const handlePointsChange = (text: string) => {
        const points = parseInt(text) || 0;
        setCustomPoints(text);
        setSelectedOffer(null);
        validatePoints(points);
    };

    const validatePoints = (points: number) => {
        if (!store) return;

        const minPoints = getMinPoints();
        const maxPoints = getMaxPoints();

        if (points < minPoints) {
            setError(`Minimum ${minPoints} points required`);
            setPointsToRedeem(0);
        } else if (points > store.points) {
            setError(`Maximum ${store.points} points available`);
            setPointsToRedeem(0);
        } else if (points > maxPoints) {
            setError(`Maximum ${maxPoints} points allowed per redemption`);
            setPointsToRedeem(0);
        } else {
            setError("");
            setPointsToRedeem(points);
        }
    };

    const getMinPoints = (): number => {
        if (!store) return 0;
        if (!store.offers || store.offers.length === 0) {
            return store.reward_points;
        }
        return Math.min(...store.offers.map(offer => offer.reward_points));
    };

    const getMaxPoints = (): number => {
        if (!store) return 0;
        if (!store.offers || store.offers.length === 0) {
            return store.reward_points;
        }
        return Math.max(...store.offers.map(offer => offer.reward_points));
    };

    const canRedeem = (): boolean => {
        if (!store || pointsToRedeem === 0) return false;
        const minPoints = getMinPoints();
        return pointsToRedeem >= minPoints && pointsToRedeem <= store.points;
    };

    const handleOfferSelect = (offer: Offer) => {
        setSelectedOffer(offer);
        setCustomPoints(offer.reward_points.toString());
        setPointsToRedeem(offer.reward_points);
        setError("");
    };

    const handleCreateRedemption = async () => {
        if (!store || !canRedeem() || !user) return;

        try {
            setProcessing(true);

            const response = await api.post<RedemptionResponse>("/createRedemption", {
                seller_id: store.seller_id,
                points: pointsToRedeem,
                offer_id: selectedOffer?.reward_id ?? '',
                offer_name: selectedOffer?.reward_name
            });

            if (response.data.success) {
                // Navigate to QR display screen
                router.push({
                    pathname: "/(drawer)/redemption-qr",
                    params: {
                        redemption: JSON.stringify({
                            ...response.data,
                            seller_name: store.seller_name,
                            seller_shop_name: store.seller_name,
                            user_id: user.uid,
                            created_at: new Date().toISOString()
                        })
                    }
                });
            } else {
                Alert.alert("Error", "Failed to create redemption");
            }
        } catch (error: any) {
            console.error("Create redemption error:", error);
            Alert.alert(
                "Error",
                error.response?.data?.error || "Failed to create redemption"
            );
        } finally {
            setProcessing(false);
        }
    };

    const handleBack = () => {
        router.back();
    };

    // Calculate hasData for skeleton wrapper
    const hasData = !!store && !loading;

    // Combine container loading with props loading
    const isLoading = loading || props.loading;

    return (
        <UserHomeWithSkeleton
            store={store}
            selectedOffer={selectedOffer}
            customPoints={customPoints}
            pointsToRedeem={pointsToRedeem}
            error={error}
            processing={processing}
            canRedeem={canRedeem()}
            onPointsChange={handlePointsChange}
            onOfferSelect={handleOfferSelect}
            onCreateRedemption={handleCreateRedemption}
            onBack={handleBack}
            hasData={hasData}
            {...props}
            loading={isLoading}
        />
    );
}
