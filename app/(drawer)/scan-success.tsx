// components/scan-qr/success-screen.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '@/hooks/use-theme-color';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeInUp, ZoomIn } from 'react-native-reanimated';
import { Button } from '@/components/ui/paper-button';
import { AppHeader } from '@/components/shared/app-header';


export default function ScanSuccess() {
    const router = useRouter();
    const theme = useTheme();
    const { primary, onPrimary, surface, text } = theme.colors;

    const { sellerName, pointsEarned = 0, totalPoints, message, timestamp, type, amount } = useLocalSearchParams();

    const handleDone = () => {
        router.replace('/(drawer)/(tabs)/home'); // Or wherever you want to navigate
    };

    const handleScanAgain = () => {
        router.back();
    };

    return (
        <View style={[styles.container, { backgroundColor: surface }]}>
            <View style={styles.content}>
                <Animated.View entering={ZoomIn.duration(600)}>
                    <Image
                        source={require("@/assets/images/success-check.png")}
                        style={styles.checkImage}
                    />
                </Animated.View>

                {/* Success Message */}
                <Animated.Text style={[styles.title, { color: text }]} entering={FadeInUp.delay(300).duration(400)}>
                    {type === 'payment' ? 'Payment Successful!' : 'Scan Successful!'}
                </Animated.Text>
                <Animated.Text style={[styles.message, { color: text }]} entering={FadeInUp.delay(600).duration(400)}>
                    {message}
                </Animated.Text>

                {/* Cafe Name */}
                <Animated.Text style={[styles.cafeName, { color: primary }]} entering={FadeInUp.delay(400).duration(400)}>
                    {sellerName}
                </Animated.Text>

                {/* Points Earned */}
                {pointsEarned && (
                    <Animated.View style={styles.pointsContainer} entering={FadeInUp.delay(400).duration(400)}>
                        <Text style={[styles.pointsLabel, { color: text }]}>Points Earned</Text>
                        <Text style={[styles.pointsValue, { color: primary }]}>
                            +{pointsEarned}
                        </Text>
                    </Animated.View>
                )}

                {/* Payment Amount */}
                {amount && (
                    <Animated.View style={styles.amountContainer} entering={FadeInUp.delay(500).duration(400)}>
                        <Text style={[styles.amountLabel, { color: text }]}>Amount Paid</Text>
                        <Text style={[styles.amountValue, { color: text }]}>
                            ₹{amount}
                        </Text>
                    </Animated.View>
                )}

                {/* Total Points */}
                <Animated.View style={styles.totalPointsContainer} entering={FadeInUp.delay(500).duration(400)}>
                    <Text style={[styles.totalPointsLabel, { color: text }]}>Total Points</Text>
                    <Text style={[styles.totalPointsValue, { color: primary }]}>
                        {totalPoints}
                    </Text>
                </Animated.View>

                {/* Message */}


            </View>

            {/* Action Buttons */}
            <Animated.View style={styles.buttonsContainer} entering={FadeInUp.delay(700).duration(400)}>
                <Button
                    variant='outlined'
                    onPress={handleScanAgain}
                >
                    Scan Another QR
                </Button>

                <Button
                    variant='contained'
                    onPress={handleDone}
                >
                    Done
                </Button>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkImage: {
        width: 140,
        height: 140,
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    cafeName: {
        fontSize: 22,
        fontWeight: '600',
        marginBottom: 30,
        textAlign: 'center',
    },
    pointsContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    pointsLabel: {
        fontSize: 16,
        marginBottom: 5,
    },
    pointsValue: {
        fontSize: 32,
        fontWeight: 'bold',
    },
    amountContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    amountLabel: {
        fontSize: 16,
        marginBottom: 5,
    },
    amountValue: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    totalPointsContainer: {
        alignItems: 'center',
        marginBottom: 30,
        padding: 15,
        borderRadius: 10,
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    totalPointsLabel: {
        fontSize: 14,
        marginBottom: 5,
    },
    totalPointsValue: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    message: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 22,
    },
    buttonsContainer: {
        gap: 12,
    },
    button: {
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    scanAgainButton: {
        borderWidth: 2,
        backgroundColor: 'transparent',
    },
    scanAgainText: {
        fontSize: 16,
        fontWeight: '600',
    },
    doneText: {
        fontSize: 16,
        fontWeight: '600',
    },
});