import React, { useState, useEffect, useCallback } from "react";
import { Alert } from "react-native";
import * as Location from "expo-location";

import { fetchNearbySellers } from "@/services/userService";
import withSkeletonTransition from "@/components/wrappers/withSkeletonTransition";
import UserHome from "@/components/home/user-home";
import HomeSkeleton from "@/components/skeletons/home";
import { SimplifiedSeller } from "@/types/seller";

// Create enhanced component with skeleton
const UserHomeWithSkeleton = withSkeletonTransition(HomeSkeleton)(UserHome);

export default function UserHomeContainer() {
  // State management
  const [sellers, setSellers] = useState<SimplifiedSeller[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasData, setHasData] = useState(false);

  // Data fetching logic
  const loadNearbySellers = useCallback(async (isRefreshing = false) => {
    try {
      if (!isRefreshing) {
        setLoading(true);
      }

      let lat: number | undefined;
      let lng: number | undefined;

      // Get user location
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        lat = loc.coords.latitude;
        lng = loc.coords.longitude;
      }

      // Fetch sellers from backend
      const data = await fetchNearbySellers(lat, lng);

      if (!data.success) {
        Alert.alert("Error", data.error || "Could not load sellers");
        return;
      }

      setSellers(data.sellers);
      setHasData(data.sellers.length > 0);

    } catch (err: any) {
      console.log(err);
      Alert.alert("Error", err?.message || "Failed to load sellers");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadNearbySellers();
  }, [loadNearbySellers]);

  // Handle pull-to-refresh
  const handleRefresh = () => {
    setRefreshing(true);
    loadNearbySellers(true);
  };

  return (
    <UserHomeWithSkeleton
      // Data
      sellers={sellers}

      // Loading states
      loading={loading}
      hasData={hasData}
      refreshing={refreshing}

      // Actions
      onRefresh={handleRefresh}
    />
  );
}