import React, { useState, useEffect, useCallback } from "react";
import { Alert } from "react-native";
import * as Location from "expo-location";
import { useFocusEffect } from "@react-navigation/native";

import { fetchNearbySellers } from "@/services/userService";
import withSkeletonTransition from "@/components/wrappers/withSkeletonTransition";
import UserHome from "@/components/home/user-home";
import HomeSkeleton from "@/components/skeletons/home";
import { SimplifiedSeller } from "@/types/seller";

const UserHomeWithSkeleton = withSkeletonTransition(HomeSkeleton)(UserHome);

export default function UserHomeContainer() {
  const [sellers, setSellers] = useState<SimplifiedSeller[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasData, setHasData] = useState(false);

  const loadNearbySellers = useCallback(
    async (isRefreshing = false, silent = false) => {
      try {
        if (!isRefreshing && !silent) {
          setLoading(true);
        }

        let lat: number | undefined;
        let lng: number | undefined;

        const { status } = await Location.getForegroundPermissionsAsync();
        if (status === "granted") {
          const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          //lat = loc.coords.latitude;
          //lng = loc.coords.longitude;
          lat = 37.785834;
          lng = -122.406417;
        }

        const data = await fetchNearbySellers(lat, lng);
        if (!data.success) {
          if (!silent) {
            Alert.alert("Error", data.error || "Could not load sellers");
          }
          return;
        }

        setSellers(data.sellers);
        setHasData(true);
      } catch (err: any) {
        console.log(err);
        if (!silent) {
          Alert.alert("Error", err?.message || "Failed to load sellers");
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  // Initial load
  useEffect(() => {
    loadNearbySellers();
  }, [loadNearbySellers]);

  // Refresh when screen comes into focus (user returns from scan)
  useFocusEffect(
    useCallback(() => {
      const refreshData = async () => {
        await loadNearbySellers(false, true); // Silent refresh
      };

      // Small delay to ensure backend has processed the scan
      const timer = setTimeout(refreshData, 100);
      return () => clearTimeout(timer);
    }, [loadNearbySellers])
  );


  const handleRefresh = () => {
    setRefreshing(true);
    loadNearbySellers(true);
  };

  return (
    <UserHomeWithSkeleton
      sellers={sellers}
      loading={loading}
      hasData={hasData}
      refreshing={refreshing}
      onRefresh={handleRefresh}
    />
  );
}
