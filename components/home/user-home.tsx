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
import { SimplifiedSeller } from "@/types/seller";
import { PulsingChip } from "../ui/pluse-chip";

export const BUSINESS_TYPES = [
    { label: 'All', value: 'all' },
    { label: 'Restaurant/Cafe', value: 'restaurant' },
    { label: 'Retail Store', value: 'retail' },
    { label: 'Professional Services', value: 'service' },
    { label: 'FMCG/Manufacturer', value: 'fmcg' },
    { label: 'Other', value: 'other' },
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
            result = result.filter((s) => s.business_type.toLowerCase().includes(category));
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
                    style={[styles.searchBar, { backgroundColor: theme.colors.surfaceVariant }]}
                />

                {/* Categories */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoriesScroll}
                >
                    {BUSINESS_TYPES.map((c) => (
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
                                onPress={() =>
                                    router.push({
                                        pathname: "/(drawer)/store/store-details",
                                        params: { storeId: seller.id },
                                    })
                                }
                            >
                                {/* BANNER */}
                                <View style={styles.bannerWrapper}>
                                    <Image
                                        source={{
                                            uri:
                                                seller.banner ||
                                                "https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d",
                                        }}
                                        style={styles.bannerImage}
                                    />

                                    <View style={styles.bannerOverlay} />

                                    {/* TOP ROW */}
                                    <View style={styles.bannerTop}>
                                        {seller.category && (
                                            <Chip compact style={{ borderColor: theme.colors.tertiary, borderWidth: 1, backgroundColor: theme.colors.background, alignSelf: 'center' }}
                                                textStyle={{ color: theme.colors.text }}>
                                                {seller.category.toUpperCase()}
                                            </Chip>
                                        )}

                                        {seller.distance_km !== undefined && (
                                            <View style={styles.distancePill}>
                                                <MaterialCommunityIcons
                                                    name="map-marker-distance"
                                                    size={14}
                                                    color="#fff"
                                                />
                                                <Text style={styles.distanceText}>
                                                    {seller.distance_km} km
                                                </Text>
                                            </View>
                                        )}
                                    </View>

                                    {/* BOTTOM ROW */}
                                    <View style={styles.bannerBottom}>
                                        <Surface style={styles.logoSurface}>
                                            {seller.logo ? (
                                                <Image source={{ uri: seller.logo }} style={styles.logo} />
                                            ) : (
                                                <Text style={{ fontSize: 22 }}>🏪</Text>
                                            )}
                                        </Surface>

                                        <View style={styles.titleBlock}>
                                            <Text style={[styles.storeName, { color: theme.colors.onPrimary }]}>{seller.shop_name}</Text>


                                        </View>

                                    </View>
                                </View>

                                {/* BODY */}
                                <Card.Content style={styles.body}>
                                    {(seller.business_type || seller.description) && (
                                        <View style={styles.description}>
                                            <Text numberOfLines={2} style={styles.subText}>
                                                {seller.business_type}
                                                {seller.description ? ` • ${seller.description}` : ""}
                                            </Text>
                                            {seller.perksAvailable && (
                                                <PulsingChip
                                                    label="TODAY'S PERK"
                                                    color={theme.colors.tertiary}
                                                />
                                            )}
                                        </View>

                                    )}
                                    <View style={styles.contact}>
                                        <View style={styles.contactItem}>
                                            <MaterialCommunityIcons
                                                name="google-maps"
                                                size={18}
                                                color={theme.colors.accent}
                                            />
                                            <Text style={[{ color: theme.colors.onSurface }]}>{seller.address}</Text>
                                        </View>
                                        <View style={styles.contactItem}>
                                            <MaterialCommunityIcons
                                                name="phone"
                                                size={18}
                                                color={theme.colors.accent}
                                            />
                                            <Text style={[{ color: theme.colors.onSurface }]}>{seller.phone}</Text>

                                        </View>
                                    </View>

                                    <View style={[styles.actionRow, { borderColor: theme.colors.outline }]}>


                                        <View style={styles.actionBtn}>
                                            <MaterialCommunityIcons
                                                name="star-circle"
                                                size={18}
                                                color={theme.colors.tertiary}
                                            />
                                            <Text style={styles.actionText}>
                                                {seller.reward_points} pts
                                            </Text>
                                        </View>
                                        <View style={[styles.actionBtn, { borderColor: theme.colors.outline, borderLeftWidth: 1 }]}>
                                            <MaterialCommunityIcons
                                                name="eye-outline"
                                                size={18}
                                                color={theme.colors.primary}
                                            />
                                            <Text style={styles.actionText}>View</Text>
                                        </View>
                                    </View>
                                </Card.Content>
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

    contact: {
        paddingHorizontal: 14,
        gap: 12,
        paddingVertical: 6,
        marginBottom: 10
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8
    }
    ,
    storeCard: {
        borderRadius: 18,
        marginBottom: 20,
    },

    description: {
        flexDirection: 'row',
        marginTop: 4,
        justifyContent: 'space-between',
        alignItems: 'center'
    },

    /* ---------- Banner ---------- */
    bannerWrapper: {
        height: 160,
        position: "relative",
    },

    bannerImage: {
        width: "100%",
        height: "100%",
    },

    bannerOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.30)",
    },

    /* Top row */
    bannerTop: {
        position: "absolute",
        top: 10,
        left: 10,
        right: 10,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    categoryChip: {
    },

    distancePill: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        backgroundColor: "rgba(0,0,0,0.6)",
    },

    distanceText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "600",
    },

    /* Bottom row */
    bannerBottom: {
        position: "absolute",
        top: 125,
        left: 12,
        right: 12,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },

    logoSurface: {
        width: 46,
        height: 46,
        borderRadius: 23,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
    },

    logo: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },

    titleBlock: {
        paddingBottom: 10
    },

    storeName: {
        fontSize: 18,
        fontWeight: "700",
    },

    subText: {
        fontSize: 12,
        marginTop: 20,
        marginBottom: 12,
        textTransform: 'capitalize',
        paddingHorizontal: 14
    },

    /* ---------- Body ---------- */
    body: {
        padding: 14,
        marginHorizontal: -14,
        marginVertical: -14
    },

    actionRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        borderTopWidth: 1,
    },

    actionBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 14,
        paddingVertical: 14,
        gap: 6,
        flex: 1
    },

    actionText: {
        fontSize: 18,
    },
    content: { flex: 1 },
    scrollContent: { paddingHorizontal: 16, paddingBottom: 30, paddingTop: 15 },
    searchBar: { marginBottom: 16, elevation: 3 },
    categoriesScroll: { flexDirection: "row", gap: 10, marginBottom: 20 },
    storeSection: { marginBottom: 20 },
    sectionTitle: { fontSize: 20, fontWeight: "700", marginBottom: 4, textAlign: 'center' },
    sectionSubtitle: { fontSize: 14, color: "#6B7280", marginBottom: 16 },
    emptyCard: { borderRadius: 16, padding: 20 },
    emptyTitle: { marginTop: 12, fontSize: 16, fontWeight: "600" },
    fab: { position: "absolute", bottom: 50, right: 16 },
});