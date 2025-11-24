import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Image,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/store/authStore";
import {
  Text,
  Card,
  Searchbar,
  Chip,
  FAB,
  Surface,
} from "react-native-paper";
import * as Location from "expo-location";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import api from "@/services/axiosInstance";
import { useTheme, useThemeColor } from "@/hooks/use-theme-color";
import { GradientText } from "@/components/ui/gradient-text";
import { fetchNearbySellers } from "@/services/userService";

const CATEGORIES = [{ label: "All", value: 'all' },
{ label: "Restaurant/Cafe", value: 'restaurant' },
{ label: "Shopping", value: 'other' },
{ label: "Retail Store", value: 'retail' }, { label: "Entertainment", value: 'other' }, { label: "Services", value: 'service' },];

export default function UserHome() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const theme = useTheme();
  const backgroundColor = useThemeColor({}, "background");

  const [sellers, setSellers] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ---------------------------------------------------
  // LOAD SELLERS
  // ---------------------------------------------------
  const loadNearbySellers = useCallback(async () => {
    try {
      setLoading(true);

      let lat: number | undefined;
      let lng: number | undefined;

      // -----------------------------
      // 1️⃣ Attempt device location
      // -----------------------------
      const { status } = await Location.getForegroundPermissionsAsync();

      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        lat = loc.coords.latitude;
        lng = loc.coords.longitude;
      }

      // -----------------------------
      // 2️⃣ Fetch sellers from backend
      // backend will fallback to saved location if lat/lng not sent
      // -----------------------------
      const data = await fetchNearbySellers(lat, lng);

      if (!data.success) {
        Alert.alert("Error", data.error || "Could not load sellers");
        return;
      }
      setSellers(data.sellers);
    } catch (err: any) {
      console.log(err);
      Alert.alert("Error", err?.message || "Failed to load sellers");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadNearbySellers();
  }, []);

  // ---------------------------------------------------
  // FILTER
  // ---------------------------------------------------
  const filterData = (list: any[], query: string, cat: string) => {
    let result = list;

    if (query) {
      result = result.filter((s) =>
        s.shop_name?.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (cat !== "all") {
      result = result.filter((s) => s.category === cat);
    }

    setFiltered(result);
  };

  useEffect(() => {
    filterData(sellers, search, category);
  }, [search, category, sellers]);


  return (
    <View style={[styles.container, { backgroundColor }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadNearbySellers(); }} />
        }
      >

        {/* ---------------------------------------------------
            SEARCH
        --------------------------------------------------- */}
        <Searchbar
          placeholder="Search stores..."
          onChangeText={setSearch}
          value={search}
          iconColor={theme.colors.onSurface}
          style={[styles.searchBar, { backgroundColor: theme.colors.surface, }]}
        />

        {/* ---------------------------------------------------
            CATEGORIES
        --------------------------------------------------- */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScroll}
        >
          {CATEGORIES.map((c) => (
            <Chip
              key={c.label}
              selected={category === c.value}
              onPress={() => setCategory(c.value)}
              selectedColor={category === c.value ? theme.colors.onPrimary : theme.colors.onSurface}
              style={[
                styles.categoryChip,
                { backgroundColor: theme.colors.outline },
                category === c.value && { backgroundColor: theme.colors.primary },
              ]}
              textStyle={[
                styles.categoryChipText
              ]}
            >
              {c.label}
            </Chip>
          ))}
        </ScrollView>

        {/* ---------------------------------------------------
            SELLERS LIST
        --------------------------------------------------- */}
        <View style={styles.storeSection}>
          <GradientText style={styles.sectionTitle}>Nearby Stores</GradientText>
          <Text style={styles.sectionSubtitle}>
            {filtered.length} stores available
          </Text>

          {filtered.length === 0 ? (
            <Card style={[styles.emptyCard, { backgroundColor: theme.colors.surface }]}>
              <Card.Content style={{ alignItems: "center", paddingVertical: 30 }}>
                <MaterialCommunityIcons name="store-off" size={60} />
                <Text style={styles.emptyTitle}>No stores found</Text>
              </Card.Content>
            </Card>
          ) : (
            filtered.map((seller) => (
              <Card
                key={seller.id}
                // onPress={() => router.push(`/user/seller-details?id=${seller.id}`)}
                style={[styles.storeCard, { backgroundColor: theme.colors.surface }]}
              >
                <Card.Content style={styles.storeCardInner}>
                  <Surface style={styles.storeIcon}>
                    <Text style={{ fontSize: 26 }}>🏪</Text>
                  </Surface>

                  <View style={styles.storeInfo}>
                    <Text style={styles.storeName}>{seller.shop_name}</Text>

                    {seller.category && (
                      <Chip
                        compact
                        mode="outlined"
                        style={[
                          styles.storeCategory,
                          { borderColor: theme.colors.primary }
                        ]}
                        textStyle={{
                          color: theme.colors.text,
                          fontSize: 12,
                          fontWeight: "600",
                          marginVertical: 0,
                          marginTop: 1, // fixes cut text
                        }}
                      >
                        {seller.category.toUpperCase()}
                      </Chip>
                    )}

                    {seller.description && (
                      <Text numberOfLines={2} style={[styles.storeDesc, { color: theme.colors.accent }]}>
                        {seller.description}
                      </Text>
                    )}
                    <View style={styles.rewardRow}>
                      <View style={styles.rewardData}>
                        <MaterialCommunityIcons name="star-circle" size={20} color={theme.colors.primary} />
                        <Text style={styles.rewardText}>{seller.points_per_visit} pts/visit</Text>
                      </View>
                      <View style={styles.rewardData}>
                        <MaterialCommunityIcons name="gift" size={20} color={theme.colors.primary} />
                        <Text style={styles.rewardText}>{seller.reward_points} pts reward</Text>
                      </View>
                    </View>



                  </View>
                </Card.Content>
              </Card>
            ))
          )}
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* ---------------------------------------------------
            FAB - Scan QR
        --------------------------------------------------- */}
      <FAB
        icon="qrcode-scan"
        label="Scan QR"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        // onPress={() => router.push("/user/scan-qr")}
        color={theme.colors.onSurface}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 30, paddingTop: 15 },

  searchBar: {
    marginBottom: 16,
    elevation: 3,
  },

  categoriesScroll: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  categoryChip: {
    borderRadius: 20,
  },
  categoryChipText: {
    fontWeight: "500",
  },

  storeSection: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 16,
  },

  emptyCard: {
    borderRadius: 16,
    padding: 20,
  },
  emptyTitle: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "600",
  },

  storeCard: {
    marginBottom: 16,
    borderRadius: 16,
  },
  storeCardInner: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 12,
  },
  storeIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  storeInfo: { flex: 1 },
  storeName: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
  storeCategory: {
    paddingHorizontal: 0,
    marginTop: 6,
    marginBottom: 6,
    borderRadius: 16, alignSelf: 'flex-start'
  },
  storeDesc: { fontSize: 12, marginBottom: 10 },
  rewardRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6, justifyContent: 'space-between' },
  rewardData: { flexDirection: "row", alignItems: "center", gap: 6 },
  rewardText: { fontSize: 12, fontWeight: "500" },

  fab: {
    position: "absolute",
    bottom: 50,
    right: 16,
  },
});
