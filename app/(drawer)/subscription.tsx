import { AppHeader } from '@/components/shared/app-header';
import api from '@/services/axiosInstance';
import { useAuthStore } from '@/store/authStore';
import { PLANS } from '@/utils/constant';
import { AppStyles, Colors } from '@/utils/theme';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Card, Chip, Text } from 'react-native-paper';
import RazorpayCheckout from 'react-native-razorpay';

const API_URL =
    Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL ||
    process.env.EXPO_PUBLIC_BACKEND_URL;

export default function SubscriptionScreen() {
    const router = useRouter();
    const { user, fetchUserDetails } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState('');
    const [verifying, setVerifying] = useState(false);

    const subscription = user?.user?.seller_profile?.subscription;

    const currentTier = subscription?.tier ?? 'free';
    const expiryDate = subscription?.expires_at
        ? new Date(subscription?.expires_at._seconds * 1000)
        : null;

    // Sort plans: active plan first
    const sortedPlans = useMemo(() => {
        const activePlan = PLANS.find((p) => p.id === currentTier);
        const others = PLANS.filter((p) => p.id !== currentTier);
        return activePlan ? [activePlan, ...others] : PLANS;
    }, [currentTier]);

    const handleBuy = async (planId: string) => {
        if (planId === 'free') return;

        setSelectedPlan(planId);
        try {
            setLoading(true);

            const response = await api.post(`/createOrder`, {
                planId,
                sellerId: user?.user.uid,
            });

            const { order_id, key_id, amount, currency } = response.data;

            const options = {
                description: `Grabbitt ${planId.toUpperCase()} Plan`,
                currency,
                key: key_id,
                amount: amount.toString(),
                name: 'Grabbitt',
                order_id,
                prefill: {
                    email: user?.user.email,
                    contact: user?.user.phone,
                    name: user?.user.name,
                },
                theme: { color: '#FF7A00' },
            };

            RazorpayCheckout.open(options)
                .then(async (data) => {
                    setVerifying(true);

                    const verifyRes = await api.post(`/verifyPayment`, {
                        ...data,
                        sellerId: user?.user.uid,
                        planId,
                    });

                    if (verifyRes.data.success) {
                        await fetchUserDetails(user?.user.uid ?? '', 'seller');

                        setLoading(false);
                        setSelectedPlan('');
                        setVerifying(false);

                        router.push({
                            pathname: '/(drawer)/payment-sucess',
                            params: {
                                orderId: verifyRes.data.subscription.order_id,
                                plan: planId,
                                expiresAt: verifyRes.data.subscription.expires_at,
                            },
                        });
                    } else {
                        setLoading(false);
                        setSelectedPlan('');
                        setVerifying(false);
                        Alert.alert('Verification Failed', verifyRes.data.error);
                    }
                })
                .catch((error) => {
                    setLoading(false);
                    setSelectedPlan('');
                    setVerifying(false);
                    console.error('Razorpay Error:', error);
                    Alert.alert('Payment Failed', error.description);
                });
        } catch (error) {
            console.error('Payment flow error:', error);
            Alert.alert('Error', 'Unable to start payment.');
        } finally {
            setLoading(false);
        }
    };

    /** -------------------- LOADING SCREEN -------------------- **/
    if (verifying) {
        return (
            <View style={{ flex: 1, backgroundColor: Colors.light.background }}>
                <AppHeader />

                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color={Colors.light.primary} />
                    <Text>Please wait! Verifying your payment...</Text>
                </View>
            </View>
        );
    }

    /** -------------------- MAIN SCREEN -------------------- **/
    return (
        <View style={styles.screen}>
            <AppHeader />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContainer}
            >
                <Text variant="headlineSmall" style={styles.title}>
                    Choose your plan
                </Text>

                {sortedPlans.map((plan) => {
                    const isCurrent = plan.id === currentTier;
                    const isLocked = currentTier !== 'free' && !isCurrent;

                    return (
                        <Card
                            key={plan.id}
                            style={[
                                styles.card,
                                isCurrent && { borderColor: plan.color, borderWidth: 1 },
                            ]}
                            elevation={1}
                        >
                            <Card.Content>
                                <View style={styles.rowBetween}>
                                    <Text
                                        variant="titleLarge"
                                        style={[styles.planName, { color: plan.color }]}
                                    >
                                        {plan.name}
                                    </Text>
                                    <Text variant="bodyMedium" style={styles.price}>
                                        {plan.price}
                                    </Text>
                                </View>

                                <View style={styles.features}>
                                    {plan.features.map((f, i) => (
                                        <Text key={i} style={styles.feature}>
                                            • {f}
                                        </Text>
                                    ))}
                                </View>

                                {isCurrent && expiryDate && (
                                    <Text style={styles.expiryText}>
                                        Expires on: {expiryDate.toLocaleDateString()}
                                    </Text>
                                )}

                                {isCurrent && (
                                    <View style={styles.ribbonContainer}>
                                        <Chip
                                            mode="flat"
                                            style={[styles.ribbon, { backgroundColor: plan.color + '20' }]}
                                            textStyle={[styles.ribbonText, { color: plan.color }]}
                                        >
                                            Current Active Plan
                                        </Chip>
                                    </View>
                                )}

                                {!isCurrent && currentTier === 'free' && (
                                    <Button
                                        mode="contained"
                                        buttonColor={plan.color}
                                        style={styles.buyBtn}
                                        loading={loading && selectedPlan === plan.id}
                                        disabled={loading}
                                        onPress={() => handleBuy(plan.id)}
                                    >
                                        Buy Now
                                    </Button>
                                )}

                                {isLocked && (
                                    <Text style={styles.lockedText}>
                                        You can purchase another plan after your current plan expires.
                                    </Text>
                                )}
                            </Card.Content>
                        </Card>
                    );
                })}

                {/* Scroll padding */}
                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

/* -------------------- STYLES -------------------- */
const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },

    scrollContainer: {
        padding: AppStyles.spacing.lg,
        paddingBottom: 100, // important for Android scrolling
    },

    title: {
        textAlign: 'center',
        marginBottom: AppStyles.spacing.xl,
        fontWeight: '700',
    },

    card: {
        marginBottom: AppStyles.spacing.lg,
        borderRadius: 16,
        backgroundColor: Colors.light.surface,
    },

    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    planName: {
        ...AppStyles.typography.heading,
    },

    price: {
        ...AppStyles.typography.subheading,
    },

    features: {
        marginVertical: AppStyles.spacing.md,
    },

    feature: {
        marginBottom: 4,
        color: Colors.light.text,
    },

    buyBtn: {
        borderRadius: 8,
        marginTop: 10,
    },

    expiryText: {
        color: Colors.light.accent,
        fontSize: 13,
        marginBottom: 10,
    },

    ribbonContainer: {
        width: '100%',
        marginBottom: 10,
    },

    ribbon: {
        justifyContent: 'center',
        height: 38,
    },

    ribbonText: {
        fontWeight: '600',
    },

    lockedText: {
        color: Colors.light.secondary,
        fontSize: 12,
        textAlign: 'center',
        marginTop: 8,
    },

    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
});
