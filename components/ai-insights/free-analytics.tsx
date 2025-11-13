import api from '@/services/axiosInstance';
import { useAuthStore } from '@/store/authStore';
import { Colors } from '@/utils/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Card, Text } from 'react-native-paper';

type TodayStats = {
    scans: number;
    points: number;
};

type LastScan = {
    id: string;
    user_id?: string;
    seller_name?: string;
    points?: number;
    qr_type?: string;
    timestamp?: any;
    description?: string;
};

type SellerStats = {
    total_users: number;
    total_qrs: number;
    total_scanned: number;
    total_points_issued: number;
    total_redemptions: number;
    seller_id: string;
    seller_name?: string;
    today?: TodayStats;
    last_five_scans?: LastScan[];
    subscription_tier?: 'free' | 'pro' | 'premium';
    locked_features?: boolean;
};

export default function SellerFreeAIInsights() {
    const { user } = useAuthStore();
    const idToken = user?.idToken;

    const [stats, setStats] = useState<SellerStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isFree = stats?.subscription_tier === 'free' || !stats?.subscription_tier;

    const fetchStats = async () => {
        try {
            setError(null);
            const resp = await api.get('/dashboard/seller-stats', {
                headers: { Authorization: `Bearer ${idToken}` },
            });
            setStats(resp.data.data);
        } catch (err: any) {
            console.log('Analytics fetch error', err.response?.data || err.message);
            setError(err.response?.data?.error || 'Failed to load analytics');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchStats();
    };

    if (loading && !stats) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.light.primary} />
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            {/* ERROR BANNER */}
            {error && (
                <Card style={styles.errorCard}>
                    <Card.Content>
                        <Text style={styles.errorText}>{error}</Text>
                    </Card.Content>
                </Card>
            )}

            {/* HEADER */}
            <View style={styles.headerRow}>
                <Text style={styles.title}>Analytics</Text>
                <Text style={styles.subtitle}>
                    {stats?.seller_name ? stats.seller_name : 'Your shop'} • Overview
                </Text>
            </View>

            {/* TODAY SUMMARY CARD */}
            <Card style={styles.todayCard}>
                <Card.Content style={styles.todayContent}>
                    <View>
                        <Text style={styles.todayLabel}>Today</Text>
                        <Text style={styles.todayScans}>
                            {stats?.today?.scans ?? 0} scans
                        </Text>
                        <Text style={styles.todayPoints}>
                            {stats?.today?.points ?? 0} points issued
                        </Text>
                    </View>
                    <MaterialCommunityIcons name="calendar-today" size={32} color={Colors.light.accent} />
                </Card.Content>
            </Card>

            {/* GRID TILE ANALYTICS */}
            <View style={styles.grid}>
                <StatTile
                    label="Total Scans"
                    value={stats?.total_scanned ?? 0}
                    icon="qrcode-scan"
                />

                <StatTile
                    label="Unique Customers"
                    value={stats?.total_users ?? 0}
                    icon="account-group-outline"
                />

                <StatTile
                    label="Points Issued"
                    value={stats?.total_points_issued ?? 0}
                    icon="star-circle-outline"
                />

                <StatTile
                    label="QR Codes"
                    value={stats?.total_qrs ?? 0}
                    icon="qrcode"
                />

                <StatTile
                    label="Redemptions"
                    value={stats?.total_redemptions ?? 0}
                    icon="gift-outline"
                />
            </View>

            {/* LAST 5 SCANS */}
            <Card style={styles.card}>
                <Card.Content>
                    <View style={styles.cardHeaderRow}>
                        <Text style={styles.cardTitle}>Recent Scans</Text>
                    </View>

                    {stats?.last_five_scans && stats.last_five_scans.length > 0 ? (
                        stats.last_five_scans.map((scan, idx) => (
                            <View key={scan.id || idx} style={styles.scanRow}>
                                <View>
                                    <Text style={styles.scanTitle}>
                                        {scan.description || 'QR Scan'}
                                    </Text>
                                    <Text style={styles.scanSubtitle}>
                                        {scan.points ?? 0} pts • {scan.qr_type || 'QR'}
                                    </Text>
                                </View>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.emptyText}>No recent scans yet.</Text>
                    )}
                </Card.Content>
            </Card>

            {/* UPGRADE CARD (PREVIEW PRO ANALYTICS) */}
            {isFree && (
                <Card style={styles.upgradeCard}>
                    <Card.Content>
                        <Text style={styles.upgradeTitle}>Unlock full analytics</Text>
                        <Text style={styles.upgradeText}>
                            Get detailed trends, charts, customer segments, and more with Pro or Premium.
                        </Text>
                        <View style={styles.upgradeFeaturesRow}>
                            <Text style={styles.upgradeBullet}>• Scan trends & charts</Text>
                            <Text style={styles.upgradeBullet}>• Top customers insights</Text>
                            <Text style={styles.upgradeBullet}>• Export reports</Text>
                        </View>
                        <View style={styles.upgradeButtonRow}>
                            <Text style={styles.upgradeCta}>Go to Subscription to upgrade →</Text>
                        </View>
                    </Card.Content>
                </Card>
            )}

            <View style={{ height: 32 }} />
        </ScrollView>
    );
}

interface StatTileProps {
    label: string;
    value: number;
    icon: string;
}

function StatTile({ label, value, icon }: StatTileProps) {
    return (
        <Card style={styles.tile}>
            <Card.Content style={styles.tileContent}>
                <View style={styles.tileHeader}>
                    <MaterialCommunityIcons name={icon as any} size={22} color={Colors.light.accent} />
                    {/* Simple trend fake indicator for now (we can wire real later) */}
                    <View style={styles.trendBadge}>
                        <MaterialCommunityIcons name="trending-up" size={14} color="#10B981" />
                        <Text style={styles.trendText}>—</Text>
                    </View>
                </View>

                <Text style={styles.tileValue}>{value}</Text>
                <Text style={styles.tileLabel}>{label}</Text>
            </Card.Content>
        </Card>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    content: { padding: 16, paddingBottom: 32 },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#111827',
    },
    subtitle: {
        fontSize: 13,
        color: '#6B7280',
        marginTop: 2,
    },

    errorCard: {
        marginBottom: 12,
        borderRadius: 12,
        backgroundColor: '#FEF2F2',
    },
    errorText: {
        color: '#B91C1C',
        fontSize: 13,
    },

    todayCard: {
        borderRadius: 16,
        marginBottom: 16,
        backgroundColor: '',
    },
    todayContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#ffffff'
    },
    todayLabel: {
        fontSize: 16,
        color: Colors.light.primary,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4,
    },
    todayScans: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0F172A',
    },
    todayPoints: {
        fontSize: 13,
        color: '#475569',
        marginTop: 4,
    },

    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 16,
        justifyContent: 'space-between'
    },
    tile: {
        width: '48%',
        marginBottom: 12,
        backgroundColor: 'transparent',
        elevation: 0,
    },
    tileContent: {
        borderRadius: 14,
        backgroundColor: '#FFFFFF',
        paddingVertical: 12,
        paddingHorizontal: 12,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    tileHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    tileValue: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 4,
    },
    tileLabel: {
        fontSize: 12,
        color: '#6B7280',
    },
    trendBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ECFDF5',
        borderRadius: 999,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    trendText: {
        marginLeft: 4,
        fontSize: 10,
        color: '#065F46',
    },

    card: {
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        marginBottom: 16,
    },
    cardHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 8,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    scanRow: {
        paddingVertical: 10,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#E5E7EB',
    },
    scanTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: '#111827',
    },
    scanSubtitle: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
    },
    emptyText: {
        fontSize: 13,
        color: '#9CA3AF',
        marginTop: 4,
    },

    upgradeCard: {
        borderRadius: 16,
        backgroundColor: '#F5F3FF',
    },
    upgradeTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#4C1D95',
        marginBottom: 4,
    },
    upgradeText: {
        fontSize: 13,
        color: '#4B5563',
        marginBottom: 8,
    },
    upgradeFeaturesRow: {
        marginBottom: 8,
    },
    upgradeBullet: {
        fontSize: 12,
        color: '#6B7280',
    },
    upgradeButtonRow: {
        marginTop: 4,
    },
    upgradeCta: {
        fontSize: 13,
        color: Colors.light.accent,
        fontWeight: '600',
    },
});
