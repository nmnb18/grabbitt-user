import React, { useEffect, useState } from "react";
import {
    View,
    StyleSheet,
    ScrollView,
    RefreshControl,
} from "react-native";

import { useAuthStore } from "@/store/authStore";

import {
    Text,
    Card,
    Button,
    ActivityIndicator,
    Divider,
    Surface,
} from "react-native-paper";

import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useTheme, useThemeColor } from "@/hooks/use-theme-color";

import axios from "axios";
import Constants from "expo-constants";
import api from "@/services/axiosInstance";

const API_URL =
    Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL ||
    process.env.EXPO_PUBLIC_BACKEND_URL;

export default function UserWallet() {
    const { user } = useAuthStore();
    const theme = useTheme();

    // Theme colors
    const background = useThemeColor({}, "background");
    const surface = useThemeColor({}, "surface");
    const onSurface = useThemeColor({}, "onSurface");
    const onSurfaceVariant = useThemeColor({}, "onSurfaceDisabled");
    const primary = theme.colors.primary;
    const secondary = theme.colors.secondary;

    const [balances, setBalances] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadWalletData();
    }, []);

    const loadWalletData = async () => {
        try {
            const balanceRes = await api.get(`${API_URL}/points/balance`);
            setBalances(balanceRes.data);

            const txRes = await api.get(`${API_URL}/points/transactions`);
            setTransactions(txRes.data.slice(0, 10));
        } catch (err) {
            console.log("Wallet error:", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const totalPoints = balances.reduce((sum, b: any) => sum + b.points, 0);

    const onRefresh = () => {
        setRefreshing(true);
        loadWalletData();
    };

    const getTxIcon = (type: string) =>
        type === "earned" ? "plus-circle" : type === "redeemed" ? "gift" : "swap-horizontal";

    const getTxColor = (type: string) =>
        type === "earned"
            ? primary
            : type === "redeemed"
                ? secondary
                : theme.colors.outline;

    if (loading) {
        return (
            <View style={[styles.center, { backgroundColor: background }]}>
                <ActivityIndicator size="large" color={primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: background }]}>
            {/* HEADER */}
            <LinearGradient
                colors={[theme.colors.primary, theme.colors.secondary]}
                style={styles.header}
            >
                <Text variant="headlineMedium" style={styles.headerTitle}>
                    My Wallet
                </Text>
                <Text variant="bodyMedium" style={styles.headerSubtitle}>
                    Track your loyalty activity
                </Text>
            </LinearGradient>

            <ScrollView
                style={styles.scroll}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 24 }}
            >
                {/* -------------------------------------------TOTAL POINTS CARD-------------------------------------------- */}
                <Card style={[styles.totalCard, { backgroundColor: surface }]} elevation={3}>
                    <LinearGradient
                        colors={[theme.colors.primary, theme.colors.secondary]}
                        style={styles.totalGradient}
                    >
                        <MaterialCommunityIcons name="wallet" color="#FFF" size={44} />
                        <Text style={styles.totalValue}>{totalPoints}</Text>
                        <Text style={styles.totalLabel}>Total Points</Text>
                        <Text style={styles.totalStores}>
                            Across {balances.length} {balances.length === 1 ? "store" : "stores"}
                        </Text>
                    </LinearGradient>
                </Card>

                {/* -------------------------------------------POINTS BY STORE-------------------------------------------- */}
                <Text variant="titleMedium" style={[styles.sectionTitle, { color: onSurface }]}>
                    Points by Store
                </Text>

                {balances.length === 0 ? (
                    <Card style={[styles.emptyCard, { backgroundColor: surface }]}>
                        <Card.Content style={styles.emptyWrapper}>
                            <MaterialCommunityIcons name="wallet-outline" size={60} color={onSurfaceVariant} />
                            <Text variant="titleMedium" style={[styles.emptyHeader, { color: onSurface }]}>
                                No Points Yet
                            </Text>
                            <Text style={{ color: onSurfaceVariant }}>Scan QR to earn points</Text>
                        </Card.Content>
                    </Card>
                ) : (
                    balances.map((b: any) => {
                        const progress = Math.min((b.points / b.reward_points) * 100, 100);

                        return (
                            <Card key={b.seller_id} style={[styles.storeCard, { backgroundColor: surface }]}>
                                <Card.Content>
                                    {/* Store Header */}
                                    <View style={styles.storeHeader}>
                                        <Surface style={[styles.storeIcon]}>
                                            <Text style={{ fontSize: 24 }}>🏪</Text>
                                        </Surface>

                                        <View style={{ flex: 1 }}>
                                            <Text style={[styles.storeName, { color: onSurface }]}>
                                                {b.seller_name}
                                            </Text>
                                            <Text style={{ color: onSurfaceVariant, fontSize: 12 }}>
                                                {b.reward_description}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Progress Block */}
                                    <View style={styles.progressBlock}>
                                        <View style={styles.pointsRow}>
                                            <Text variant="headlineSmall" style={{ color: primary, fontWeight: "700" }}>
                                                {b.points}
                                            </Text>
                                            <Text style={{ color: onSurfaceVariant }}> / {b.reward_points} pts</Text>
                                        </View>

                                        <View style={[styles.progressBar, { backgroundColor: theme.colors.surfaceVariant }]}>
                                            <LinearGradient
                                                colors={[primary, theme.colors.secondary]}
                                                style={[styles.progressFill, { width: `${progress}%` }]}
                                            />
                                        </View>

                                        <Text style={{ color: onSurfaceVariant, fontSize: 12 }}>
                                            {Math.round(progress)}% complete
                                        </Text>
                                    </View>

                                    {progress >= 100 && (
                                        <Button mode="contained" icon="gift" style={styles.redeemBtn}>
                                            Redeem Reward
                                        </Button>
                                    )}
                                </Card.Content>
                            </Card>
                        );
                    })
                )}

                {/* -------------------------------------------RECENT TRANSACTIONS-------------------------------------------- */}
                {transactions.length > 0 && (
                    <>
                        <Text variant="titleMedium" style={[styles.sectionTitle, { color: onSurface }]}>
                            Recent Activity
                        </Text>

                        <Card style={[styles.txCard, { backgroundColor: surface }]}>
                            <Card.Content style={{ padding: 0 }}>
                                {transactions.map((tx: any, index: number) => (
                                    <View key={tx.id}>
                                        <View style={styles.txRow}>
                                            {/* Icon */}
                                            <Surface
                                                style={[
                                                    styles.txIcon,
                                                    { backgroundColor: `${getTxColor(tx.type)}20` },
                                                ]}
                                            >
                                                <MaterialCommunityIcons
                                                    name={getTxIcon(tx.type)}
                                                    size={22}
                                                    color={getTxColor(tx.type)}
                                                />
                                            </Surface>

                                            {/* Info */}
                                            <View style={{ flex: 1 }}>
                                                <Text style={[styles.txStore, { color: onSurface }]}>
                                                    {tx.seller_name}
                                                </Text>
                                                <Text style={{ color: onSurfaceVariant, fontSize: 12 }}>
                                                    {new Date(tx.created_at).toLocaleString()}
                                                </Text>
                                            </View>

                                            {/* Points */}
                                            <Text
                                                style={{
                                                    fontWeight: "700",
                                                    color: tx.type === "earned" ? primary : secondary,
                                                }}
                                            >
                                                {tx.type === "earned" ? "+" : "-"}
                                                {tx.points}
                                            </Text>
                                        </View>

                                        {index < transactions.length - 1 && (
                                            <Divider style={{ marginLeft: 70 }} />
                                        )}
                                    </View>
                                ))}
                            </Card.Content>
                        </Card>
                    </>
                )}

                <View style={{ height: 60 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },

    header: {
        paddingTop: 60,
        paddingBottom: 32,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    headerTitle: { color: "#FFF", fontWeight: "700", marginBottom: 6 },
    headerSubtitle: { color: "#FFF", opacity: 0.9 },

    scroll: {},

    totalCard: { borderRadius: 22, marginBottom: 24, overflow: "hidden" },
    totalGradient: { padding: 28, alignItems: "center" },
    totalValue: { color: "#FFF", fontSize: 34, fontWeight: "800", marginTop: 12 },
    totalLabel: { color: "#FFF", opacity: 0.9, marginTop: 4 },
    totalStores: { color: "#FFF", opacity: 0.8, marginTop: 2 },

    sectionTitle: { marginBottom: 16, marginTop: 6, fontWeight: "700" },

    emptyCard: { borderRadius: 16, marginBottom: 16 },
    emptyWrapper: { alignItems: "center", paddingVertical: 36 },
    emptyHeader: { marginTop: 12, marginBottom: 4 },

    storeCard: { borderRadius: 18, marginBottom: 20 },
    storeHeader: { flexDirection: "row", marginBottom: 12, alignItems: "center" },
    storeIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    storeName: { fontWeight: "700" },

    progressBlock: { marginTop: 8, marginBottom: 12 },
    pointsRow: { flexDirection: "row", alignItems: "baseline", marginBottom: 6 },

    progressBar: {
        height: 8,
        borderRadius: 4,
        overflow: "hidden",
        marginBottom: 6,
    },
    progressFill: { height: "100%" },

    redeemBtn: { borderRadius: 12, marginTop: 8 },

    txCard: { borderRadius: 16, overflow: "hidden" },
    txRow: { flexDirection: "row", alignItems: "center", padding: 14, paddingLeft: 20 },
    txIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 14,
    },
    txStore: { fontWeight: "600", marginBottom: 2 },
});
