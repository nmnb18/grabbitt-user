import { AppHeader } from '@/components/shared/app-header';
import api from '@/services/axiosInstance';
import { useAuthStore } from '@/store/authStore';
import { PLANS } from '@/utils/constant';
import { AppStyles, Colors } from '@/utils/theme';
import Constants from 'expo-constants';
import React from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';
import RazorpayCheckout from 'react-native-razorpay';

const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL;

export default function SubscriptionScreen() {

    const handleBuy = async (planId: string) => {
        // later: integrate Razorpay checkout
        if (planId === 'free') return;
        try {
            const { user } = useAuthStore.getState();
            const response = await api.post(`${API_URL}/payments/create-order`, {
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
                    const verifyRes = await api.post(`${API_URL}/payments/verify-payment`, {
                        ...data,
                        sellerId: user?.user.uid,
                        planId,
                    });

                    if (verifyRes.data.success) {
                        Alert.alert('Success', 'Your subscription has been upgraded!');
                    } else {
                        Alert.alert('Verification Failed', verifyRes.data.error);
                    }
                })
                .catch((error) => {
                    console.error('Razorpay Error:', error);
                    Alert.alert('Payment Failed', error.description);
                });
        } catch (error) {
            console.error('Payment flow error:', error);
            Alert.alert('Error', 'Unable to start payment.');
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: Colors.light.background }
        }>
            <AppHeader />
            <ScrollView contentContainerStyle={styles.container}>
                <Text variant="headlineSmall" style={styles.title}>
                    Choose your plan
                </Text>

                {PLANS.map((plan) => (
                    <Card key={plan.id} style={styles.card} elevation={2}>
                        <Card.Content>
                            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
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

                            <Button
                                mode="contained"
                                buttonColor={plan.color}
                                style={styles.buyBtn}
                                onPress={() => handleBuy(plan.id)}
                            >
                                {plan.id === 'free' ? 'Current Plan' : 'Buy Now'}
                            </Button>
                        </Card.Content>
                    </Card>
                ))}

                <View style={{ height: 60 }} />
            </ScrollView>
        </View>

    );
}

const styles = StyleSheet.create({
    container: {
        padding: AppStyles.spacing.lg,
        backgroundColor: Colors.light.background,
    },
    title: {
        textAlign: 'center',
        marginBottom: AppStyles.spacing.xl,
        fontWeight: '700',
    },
    card: {
        marginBottom: AppStyles.spacing.lg,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: Colors.light.surface,
    },
    planName: {
        ...AppStyles.typography.heading,
        marginBottom: 4,
    },
    price: {
        ...AppStyles.typography.subheading,
        marginBottom: 4
    },
    features: {
        marginBlock: AppStyles.spacing.lg,
    },
    feature: {
        marginBottom: 4,
        color: Colors.light.text,
    },
    buyBtn: {
        borderRadius: 8,
    },
});
