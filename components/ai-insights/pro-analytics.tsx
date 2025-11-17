import api from '@/services/axiosInstance';
import { useAuthStore } from '@/store/authStore';
import { Colors } from '@/utils/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import ProAnalyticsSkeleton from '../skeletons/pro-analytics';
import { Button } from '../ui/paper-button';
import withSkeletonTransition from '../wrappers/withSkeletonTransition';

type DayBucket = {
    date: string; // "YYYY-MM-DD"
    scans: number;
    unique_users: number;
    points: number;
    redemptions: number;
};

type PeakHour = { hour: number; scans: number };
type PeakDay = { weekday: number; scans: number };

type TopCustomer = {
    user_id: string;
    total_scans: number;
    total_points: number;
    last_scan?: string | Date | null;
};

type RewardFunnel = {
    earned_customers: number;
    redeemed_customers: number;
    total_redemptions: number;
};

type Segments = {
    new: number;
    regular: number;
    loyal: number;
    dormant: number;
};

type AdvancedAnalytics = {
    seller_id: string;
    seller_name: string | null;
    subscription_tier: 'free' | 'pro' | 'premium';

    trends_7d: DayBucket[];
    trends_30d: DayBucket[];

    new_vs_returning_30d: {
        new: number;
        returning: number;
    };

    peak_hours: PeakHour[];
    peak_days: PeakDay[];

    qr_type_breakdown: Record<string, number>;
    qr_type_points: Record<string, number>;

    top_customers: TopCustomer[];

    reward_funnel: RewardFunnel;

    segments: Segments;

    export_available: boolean;
};

function SellerProAnalyticsInsights() {
    const router = useRouter();
    const { user } = useAuthStore();
    const idToken = user?.idToken;
    const tier = user?.user?.seller_profile?.subscription.tier || 'free';

    const [data, setData] = useState<AdvancedAnalytics | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isFree = tier === 'free';

    const fetchAdvancedAnalytics = async () => {
        try {
            setError(null);
            const resp = await api.get('/sellerAdvancedAnalytics', {
                headers: { Authorization: `Bearer ${idToken}` },
            });
            setData(resp.data.data);
        } catch (err: any) {
            console.log('Pro analytics error', err.response?.data || err.message);
            setError(err.response?.data?.error || 'Failed to load advanced analytics');
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchAdvancedAnalytics();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchAdvancedAnalytics();
    };

    // compute max for 7d mini-chart
    const maxScans7 = useMemo(
        () => (data?.trends_7d?.length ? Math.max(...data.trends_7d.map(d => d.scans)) || 1 : 1),
        [data?.trends_7d]
    );

    // top hours & days
    const topHours = useMemo(() => {
        if (!data?.peak_hours?.length) return [];
        return [...data.peak_hours]
            .sort((a, b) => b.scans - a.scans)
            .slice(0, 3);
    }, [data?.peak_hours]);

    const topDays = useMemo(() => {
        if (!data?.peak_days?.length) return [];
        return [...data.peak_days]
            .sort((a, b) => b.scans - a.scans)
            .slice(0, 3);
    }, [data?.peak_days]);

    const totalQrScans = useMemo(() => {
        if (!data?.qr_type_breakdown) return 0;
        return Object.values(data.qr_type_breakdown).reduce((sum, v) => sum + v, 0);
    }, [data?.qr_type_breakdown]);

    // If free, show locked message
    if (isFree) {
        return (
            <View style={styles.lockedContainer}>
                <Text style={styles.lockedIcon}>🔒</Text>
                <Text style={styles.lockedTitle}>Advanced analytics locked</Text>
                <Text style={styles.lockedText}>
                    Upgrade to Pro or Premium to unlock trends, peak hours, QR performance, and customer insights.
                </Text>
                <Button
                    variant="text"
                    icon="arrow-right-bold-circle"
                    onPress={() => router.push('/(drawer)/subscription')}
                >
                    Go to Plans
                </Button>
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
            {/* HEADER */}
            <View style={styles.headerRow}>
                <View>
                    <Text style={styles.title}>Advanced Analytics</Text>
                    <Text style={styles.subtitle}>
                        {data?.seller_name || 'Your shop'} • Pro insights
                    </Text>
                </View>
                <View style={styles.tierBadge}>
                    <MaterialCommunityIcons name="crown-outline" size={14} color="#F59E0B" />
                    <Text style={styles.tierText}>{tier.toUpperCase()}</Text>
                </View>
            </View>

            {/* ERROR */}
            {error && (
                <Card style={styles.errorCard}>
                    <Card.Content>
                        <Text style={styles.errorText}>{error}</Text>
                    </Card.Content>
                </Card>
            )}

            {/* A: 7-day Trend mini chart */}
            <Card style={styles.card}>
                <Card.Content>
                    <View style={styles.cardHeaderRow}>
                        <Text style={styles.cardTitle}>Last 7 days</Text>
                        <Text style={styles.cardSubtitle}>Scans per day</Text>
                    </View>

                    {data?.trends_7d?.length ? (
                        <View>
                            {data.trends_7d.map(day => {
                                const widthPercent = maxScans7 ? (day.scans / maxScans7) * 100 : 0;
                                return (
                                    <View key={day.date} style={styles.barRow}>
                                        <Text style={styles.barLabel}>
                                            {day.date.slice(5)} {/* show MM-DD */}
                                        </Text>
                                        <View style={styles.barTrack}>
                                            <View style={[styles.barFill, { width: `${widthPercent || 4}%` }]} />
                                        </View>
                                        <Text style={styles.barValue}>{day.scans}</Text>
                                    </View>
                                );
                            })}
                        </View>
                    ) : (
                        <Text style={styles.emptyText}>No scans in the last 7 days.</Text>
                    )}
                </Card.Content>
            </Card>

            {/* B: New vs Returning & Segments */}
            <Card style={styles.card}>
                <Card.Content>
                    <View style={styles.cardHeaderRow}>
                        <Text style={styles.cardTitle}>Customers (last 30 days)</Text>
                    </View>

                    <View style={styles.row}>
                        <View style={[styles.half, { paddingRight: 4 }]}>
                            <Text style={styles.sectionLabel}>New vs Returning</Text>
                            <View style={styles.stackBarTrack}>
                                {data && (
                                    <>
                                        <View
                                            style={[
                                                styles.stackBarFillNew,
                                                {
                                                    flex: data.new_vs_returning_30d.new,
                                                },
                                            ]}
                                        />
                                        <View
                                            style={[
                                                styles.stackBarFillReturning,
                                                {
                                                    flex: data.new_vs_returning_30d.returning,
                                                },
                                            ]}
                                        />
                                    </>
                                )}
                            </View>
                            <View style={styles.stackLegendRow}>
                                <View style={styles.legendItem}>
                                    <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
                                    <Text style={styles.legendText}>
                                        New: {data?.new_vs_returning_30d.new ?? 0}
                                    </Text>
                                </View>
                                <View style={styles.legendItem}>
                                    <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
                                    <Text style={styles.legendText}>
                                        Returning: {data?.new_vs_returning_30d.returning ?? 0}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <View style={[styles.half, { paddingLeft: 4 }]}>
                            <Text style={styles.sectionLabel}>Segments</Text>
                            <View style={styles.segRow}>
                                <SegmentPill label="New" value={data?.segments.new ?? 0} color="#3B82F6" />
                                <SegmentPill label="Regular" value={data?.segments.regular ?? 0} color="#6366F1" />
                            </View>
                            <View style={styles.segRow}>
                                <SegmentPill label="Loyal" value={data?.segments.loyal ?? 0} color="#F59E0B" />
                                <SegmentPill label="Dormant" value={data?.segments.dormant ?? 0} color="#9CA3AF" />
                            </View>
                        </View>
                    </View>
                </Card.Content>
            </Card>

            {/* C: Peak Hours & Days */}
            <Card style={styles.card}>
                <Card.Content>
                    <View style={styles.cardHeaderRow}>
                        <Text style={styles.cardTitle}>Peak times</Text>
                        <Text style={styles.cardSubtitle}>Last 30 days</Text>
                    </View>

                    <View style={styles.row}>
                        <View style={[styles.half, { paddingRight: 4 }]}>
                            <Text style={styles.sectionLabel}>Top Hours</Text>
                            {topHours?.length ? (
                                topHours.map(h => (
                                    <View key={h.hour} style={styles.peakRow}>
                                        <Text style={styles.peakLabel}>{h.hour}:00</Text>
                                        <Text style={styles.peakValue}>{h.scans} scans</Text>
                                    </View>
                                ))
                            ) : (
                                <Text style={styles.emptyText}>No hour data.</Text>
                            )}
                        </View>
                        <View style={[styles.half, { paddingLeft: 4 }]}>
                            <Text style={styles.sectionLabel}>Top Days</Text>
                            {topDays?.length ? (
                                topDays.map(d => (
                                    <View key={d.weekday} style={styles.peakRow}>
                                        <Text style={styles.peakLabel}>
                                            {weekdayLabel(d.weekday)}
                                        </Text>
                                        <Text style={styles.peakValue}>{d.scans} scans</Text>
                                    </View>
                                ))
                            ) : (
                                <Text style={styles.emptyText}>No day data.</Text>
                            )}
                        </View>
                    </View>
                </Card.Content>
            </Card>

            {/* D: QR Type performance */}
            <Card style={styles.card}>
                <Card.Content>
                    <View style={styles.cardHeaderRow}>
                        <Text style={styles.cardTitle}>QR Type Performance</Text>
                    </View>

                    {data?.qr_type_breakdown && totalQrScans > 0 ? (
                        Object.entries(data.qr_type_breakdown).map(([type, count]) => {
                            const pct = ((count / totalQrScans) * 100).toFixed(0);
                            return (
                                <View key={type} style={styles.qrRow}>
                                    <Text style={styles.qrLabel}>{prettyQrLabel(type)}</Text>
                                    <Text style={styles.qrValue}>
                                        {count} scans • {pct}%
                                    </Text>
                                </View>
                            );
                        })
                    ) : (
                        <Text style={styles.emptyText}>No QR scan data yet.</Text>
                    )}
                </Card.Content>
            </Card>

            {/* E: Top customers */}
            <Card style={styles.card}>
                <Card.Content>
                    <View style={styles.cardHeaderRow}>
                        <Text style={styles.cardTitle}>Top Customers</Text>
                        <Text style={styles.cardSubtitle}>Last 30 days</Text>
                    </View>

                    {data?.top_customers && data.top_customers.length > 0 ? (
                        data.top_customers.slice(0, 5).map((c) => (
                            <View key={c.user_id} style={styles.customerRow}>
                                <View style={styles.customerAvatar}>
                                    <Text style={styles.customerAvatarText}>
                                        {c.user_id?.slice(0, 2).toUpperCase()}
                                    </Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.customerTitle}>
                                        Customer {c.user_id.slice(0, 6)}…
                                    </Text>
                                    <Text style={styles.customerSubtitle}>
                                        {c.total_scans} scans • {c.total_points} pts
                                    </Text>
                                </View>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.emptyText}>Not enough data yet.</Text>
                    )}
                </Card.Content>
            </Card>

            {/* F: Reward funnel */}
            <Card style={styles.card}>
                <Card.Content>
                    <View style={styles.cardHeaderRow}>
                        <Text style={styles.cardTitle}>Reward Funnel</Text>
                        <Text style={styles.cardSubtitle}>Last 30 days</Text>
                    </View>

                    <Text style={styles.funnelText}>
                        Customers earning points: {data?.reward_funnel.earned_customers ?? 0}
                    </Text>
                    <Text style={styles.funnelText}>
                        Customers who redeemed: {data?.reward_funnel.redeemed_customers ?? 0}
                    </Text>
                    <Text style={styles.funnelText}>
                        Total redemptions: {data?.reward_funnel.total_redemptions ?? 0}
                    </Text>
                </Card.Content>
            </Card>

            {/* H: Export tools */}
            <Card style={styles.card}>
                <Card.Content>
                    <View style={styles.cardHeaderRow}>
                        <Text style={styles.cardTitle}>Export</Text>
                    </View>
                    {data?.export_available ? (
                        <Text style={styles.exportText}>
                            Export detailed analytics as CSV or integrate with your reporting tools (to be implemented).
                        </Text>
                    ) : (
                        <Text style={styles.exportText}>
                            Exports are available on Premium plans.
                        </Text>
                    )}
                </Card.Content>
            </Card>

            <View style={{ height: 32 }} />
        </ScrollView>
    );
}

function SegmentPill({ label, value, color }: { label: string; value: number; color: string }) {
    return (
        <View style={[styles.segPill, { borderColor: color }]}>
            <Text style={[styles.segPillLabel, { color }]}>{label}</Text>
            <Text style={[styles.segPillValue, { color }]}>{value}</Text>
        </View>
    );
}

function weekdayLabel(idx: number) {
    const map = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return map[idx] || '-';
}

function prettyQrLabel(type: string) {
    if (type === 'dynamic') return 'Dynamic QR';
    if (type === 'static') return 'Static QR';
    if (type === 'static_hidden') return 'Static Hidden QR';
    return type;
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    content: { padding: 16, paddingBottom: 32 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: { fontSize: 22, fontWeight: '700', color: '#111827' },
    subtitle: { fontSize: 13, color: '#6B7280', marginTop: 2 },

    tierBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF3C7',
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    tierText: {
        fontSize: 11,
        color: '#92400E',
        marginLeft: 4,
        fontWeight: '600',
    },

    errorCard: {
        borderRadius: 12,
        backgroundColor: '#FEF2F2',
        marginBottom: 12,
    },
    errorText: { color: '#B91C1C', fontSize: 13 },

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
    cardTitle: { fontSize: 16, fontWeight: '600', color: '#111827' },
    cardSubtitle: { fontSize: 12, color: '#6B7280' },

    emptyText: { fontSize: 12, color: '#9CA3AF' },

    // 7-day bar mini chart
    barRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    barLabel: {
        width: 52,
        fontSize: 11,
        color: '#6B7280',
    },
    barTrack: {
        flex: 1,
        height: 8,
        borderRadius: 999,
        backgroundColor: '#E5E7EB',
        overflow: 'hidden',
    },
    barFill: {
        height: 8,
        borderRadius: 999,
        backgroundColor: Colors.light.accent,
    },
    barValue: {
        width: 32,
        fontSize: 11,
        textAlign: 'right',
        color: '#4B5563',
        marginLeft: 6,
    },

    // new vs returning, segments
    row: { flexDirection: 'row', marginTop: 4 },
    half: { flex: 1 },
    sectionLabel: { fontSize: 12, fontWeight: '600', color: '#4B5563', marginBottom: 4 },

    stackBarTrack: {
        flexDirection: 'row',
        borderRadius: 999,
        overflow: 'hidden',
        height: 12,
        backgroundColor: '#E5E7EB',
    },
    stackBarFillNew: { backgroundColor: '#3B82F6' },
    stackBarFillReturning: { backgroundColor: '#10B981' },
    stackLegendRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 6,
    },
    legendItem: { flexDirection: 'row', alignItems: 'center' },
    legendDot: {
        width: 8,
        height: 8,
        borderRadius: 999,
        marginRight: 4,
    },
    legendText: { fontSize: 11, color: '#6B7280' },

    segRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    segPill: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 999,
        borderWidth: 1,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    segPillLabel: {
        fontSize: 11,
        fontWeight: '600',
        marginRight: 4,
    },
    segPillValue: { fontSize: 11 },

    // peaks
    peakRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 4,
    },
    peakLabel: { fontSize: 13, color: '#111827' },
    peakValue: { fontSize: 12, color: '#6B7280' },

    // qr performance
    qrRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 6,
    },
    qrLabel: { fontSize: 13, color: '#111827' },
    qrValue: { fontSize: 12, color: '#6B7280' },

    // top customers
    customerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#E5E7EB',
    },
    customerAvatar: {
        width: 32,
        height: 32,
        borderRadius: 999,
        backgroundColor: '#EEF2FF',
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    customerAvatarText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#4F46E5',
    },
    customerTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#111827',
    },
    customerSubtitle: { fontSize: 11, color: '#6B7280' },

    funnelText: {
        fontSize: 13,
        color: '#4B5563',
        marginBottom: 3,
    },

    exportText: {
        fontSize: 13,
        color: '#4B5563',
    },

    lockedContainer: {
        flex: 1,
        backgroundColor: '#F9FAFB',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    lockedIcon: { fontSize: 42, marginBottom: 8 },
    lockedTitle: { fontSize: 18, fontWeight: '700', marginBottom: 6, color: '#111827' },
    lockedText: { fontSize: 14, color: '#4B5563', textAlign: 'center', marginBottom: 14 },
    lockedCta: { fontSize: 14, color: Colors.light.accent, fontWeight: '600' },
});

export default withSkeletonTransition(ProAnalyticsSkeleton)(SellerProAnalyticsInsights)