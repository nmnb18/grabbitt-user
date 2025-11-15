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

    const subscription = user?.user?.seller_profile?.subscription

    const currentTier = subscription?.tier ?? 'free';
    const expiryDate = subscription?.expires_at
        ? new Date(subscription?.expires_at._seconds * 1000)
        : null;

    const sortedPlans = useMemo(() => {
        const activePlan = PLANS.find((p) => p.id === currentTier);
        const otherPlans = PLANS.filter((p) => p.id !== currentTier);
        return activePlan ? [activePlan, ...otherPlans] : PLANS;
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
                        const res = await fetchUserDetails(user?.user.uid ?? '', 'seller');
                        setLoading(false);
                        setSelectedPlan('');
                        setVerifying(false);
                        Alert.alert('Success', 'Your subscription has been upgraded!');
                        router.push({
                            pathname: "/(drawer)/payment-sucess",
                            params: {
                                orderId: verifyRes.data.subscription.order_id,
                                plan: planId,
                                expiresAt: verifyRes.data.subscription.expires_at
                            }
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
            setSelectedPlan('');
            setVerifying(false);
        }
    };

    if (verifying) {
        return (
            <ScrollView contentContainerStyle={styles.container}>
                <AppHeader />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.light.primary} />
                    <Text>Please wait! Verifying your payment...</Text>
                </View>
            </ScrollView>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: Colors.light.background }}>
            <AppHeader />
            <ScrollView contentContainerStyle={styles.container}>
                <Text variant="headlineSmall" style={styles.title}>
                    Choose your plan
                </Text>

                {sortedPlans.map((plan, idx) => {
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
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                    }}
                                >
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
                                            <Text style={styles.ribbonText}>Current Active Plan</Text>
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

                <View style={{ height: 60 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: AppStyles.spacing.lg,
        backgroundColor: Colors.light.background,
        flex: 1
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
    },
    ribbonContainer: {
        width: '100%',
        marginBottom: 8,

    },

    ribbon: {
        justifyContent: 'center',
        height: 40,
        backgroundColor: Colors.light.surfaceVariant,
        padding: 0
    },

    ribbonText: {
        textAlign: 'center',
        fontWeight: '600',
        width: '100%',
        padding: 0,
        color: Colors.light.primary, // fallback if plan.color isn't applied dynamically
    },
    expiryText: {
        color: Colors.light.accent,
        fontSize: 13,
        marginBottom: 10,
    },
    lockedText: {
        color: Colors.light.secondary,
        fontSize: 12,
        textAlign: 'center',
        marginTop: 8,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
});
