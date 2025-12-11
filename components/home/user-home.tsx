import React, { useEffect, useState } from "react";
import {
    View,
    StyleSheet,
    ScrollView,
    RefreshControl,
    Image,
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
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useTheme, useThemeColor } from "@/hooks/use-theme-color";
import { GradientText } from "@/components/ui/gradient-text";
import { SimplifiedSeller } from "@/types/seller";

const CATEGORIES = [
    { label: "All", value: 'all' },
    { label: "Restaurant/Cafe", value: 'restaurant' },
    { label: "Shopping", value: 'other' },
    { label: "Retail Store", value: 'retail' },
    { label: "Entertainment", value: 'other' },
    { label: "Services", value: 'service' },
];

// Props interface
interface UserHomeProps {
    // Data
    sellers: SimplifiedSeller[];

    // Loading states
    loading?: boolean;
    hasData?: boolean;
    refreshing?: boolean;

    // Actions
    onRefresh?: () => void;
}

export default function UserHome({
    sellers = [],
    loading = false,
    hasData = false,
    refreshing = false,
    onRefresh
}: UserHomeProps) {
    const { user } = useAuthStore();
    const router = useRouter();
    const theme = useTheme();
    const backgroundColor = useThemeColor({}, "background");

    // Local UI state (search and filter)
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("all");
    const [filteredSellers, setFilteredSellers] = useState<SimplifiedSeller[]>([]);

    // Filter logic (pure function)
    useEffect(() => {
        let result = sellers;

        if (search) {
            result = result.filter((s) =>
                s.shop_name?.toLowerCase().includes(search.toLowerCase())
            );
        }

        if (category !== "all") {
            result = result.filter((s) => s.category === category);
        }

        setFilteredSellers(result);
    }, [search, category, sellers]);

    return (
        <View style={[styles.container, { backgroundColor }]}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                style={styles.content}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing || false}
                        onRefresh={onRefresh}
                    />
                }
            >
                {/* Search */}
                <Searchbar
                    placeholder="Search stores..."
                    onChangeText={setSearch}
                    value={search}
                    iconColor={theme.colors.onSurface}
                    style={[styles.searchBar, { backgroundColor: theme.colors.surface }]}
                />

                {/* Categories */}
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
                                category === c.value && { backgroundColor: theme.colors.tertiary },
                            ]}
                            textStyle={styles.categoryChipText}
                        >
                            {c.label}
                        </Chip>
                    ))}
                </ScrollView>

                {/* Stores List */}
                <View style={styles.storeSection}>
                    <Text style={styles.sectionTitle}>Nearby Stores</Text>
                    <Text style={[styles.sectionSubtitle, { color: theme.colors.accent }]}>
                        {filteredSellers.length} stores available
                    </Text>

                    {filteredSellers.length === 0 ? (
                        <Card style={[styles.emptyCard, { backgroundColor: theme.colors.surface }]}>
                            <Card.Content style={{ alignItems: "center", paddingVertical: 30 }}>
                                <MaterialCommunityIcons name="store-off" size={60} />
                                <Text style={styles.emptyTitle}>
                                    {loading ? "Loading stores..." : "No stores found"}
                                </Text>
                            </Card.Content>
                        </Card>
                    ) : (
                        filteredSellers.map((seller) => (
                            <Card
                                key={seller.id}
                                style={[styles.storeCard, { backgroundColor: theme.colors.surface }]}
                                onPress={() => {
                                    router.push({
                                        pathname: '/(drawer)/store-details',
                                        params: {
                                            storeId: seller.id
                                        }
                                    })
                                }}
                            >
                                <Card.Content style={styles.storeCardInner}>
                                    <Surface style={styles.storeIcon}>

                                        {seller?.logo ? <Image
                                            source={{ uri: seller.logo }}
                                            style={styles.logo}
                                        /> :
                                            <Text style={{ fontSize: 26 }}>🏪</Text>}
                                    </Surface>

                                    <View style={styles.storeInfo}>
                                        <Text style={styles.storeName}>{seller.shop_name}</Text>
                                        {seller.description && (
                                            <Text numberOfLines={2} style={[styles.storeDesc, { color: theme.colors.accent }]}>
                                                {seller.description}
                                            </Text>
                                        )}



                                    </View>
                                    {seller.category && (
                                        <Chip
                                            compact
                                            mode="outlined"
                                            style={[
                                                styles.storeCategory,
                                                { borderColor: theme.colors.tertiary }
                                            ]}
                                            textStyle={{
                                                color: theme.colors.text,
                                                fontSize: 12,
                                                fontWeight: "600",
                                                marginVertical: 0,
                                                marginTop: 1,
                                            }}
                                        >
                                            {seller.category.toUpperCase()}
                                        </Chip>
                                    )}
                                </Card.Content>
                                <View style={styles.rewardRow}>
                                    <View style={styles.rewardData}>
                                        <MaterialCommunityIcons name="star-circle" size={20} color={theme.colors.tertiary} />
                                        {seller.reward_description?.type !== 'slab' && <Text style={styles.rewardText}>{seller.reward_description?.text}</Text>}
                                        {seller.reward_description?.type === 'slab' && <View style={styles.slabRewards}>{seller.reward_description?.text?.map((t: string, index: number) => <Text key={index} style={styles.rewardText}>{t}</Text>)}</View>}
                                    </View>
                                    <View style={styles.rewardData}>
                                        <MaterialCommunityIcons name="gift" size={20} color={theme.colors.tertiary} />
                                        <Text style={styles.rewardText}>{seller.reward_points} pts rewarded</Text>
                                    </View>
                                </View>
                            </Card>
                        ))
                    )}
                </View>

                <View style={{ height: 80 }} />
            </ScrollView>

            {/* FAB */}
            <FAB
                icon="qrcode-scan"
                label=""
                style={[styles.fab, { backgroundColor: theme.colors.tertiary }]}
                onPress={() => router.push("/(drawer)/(tabs)/scan-qr")}
                color={theme.colors.onSurface}
            />
        </View>
    );
}

// Keep your existing styles...
const styles = StyleSheet.create({
    // ... your existing styles remain exactly the same
    container: { flex: 1 },
    logo: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "#EEE",
    },
    content: { flex: 1 },
    scrollContent: { paddingHorizontal: 16, paddingBottom: 30, paddingTop: 15 },
    searchBar: { marginBottom: 16, elevation: 3 },
    categoriesScroll: { flexDirection: "row", gap: 10, marginBottom: 20 },
    categoryChip: { borderRadius: 20 },
    categoryChipText: { fontWeight: "500" },
    storeSection: { marginBottom: 20 },
    sectionTitle: { fontSize: 20, fontWeight: "700", marginBottom: 4, textAlign: 'center' },
    sectionSubtitle: { fontSize: 14, color: "#6B7280", marginBottom: 16 },
    emptyCard: { borderRadius: 16, padding: 20 },
    emptyTitle: { marginTop: 12, fontSize: 16, fontWeight: "600" },
    storeCard: { marginBottom: 16, borderRadius: 16 },
    storeCardInner: { flexDirection: "row", gap: 12, paddingVertical: 12 },
    storeIcon: { width: 56, height: 56, borderRadius: 28, justifyContent: "center", alignItems: "center" },
    storeInfo: { flex: 1 },
    storeName: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
    storeCategory: { borderRadius: 16, alignSelf: 'flex-start' },
    storeDesc: { fontSize: 12, marginBottom: 4 },
    rewardRow: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingBottom: 12, justifyContent: 'space-between' },
    rewardData: { flexDirection: "row", alignItems: "center", gap: 6 },
    rewardText: { fontSize: 14, fontWeight: "500" },
    fab: { position: "absolute", bottom: 50, right: 16 },
    slabRewards: { gap: 4 }
});