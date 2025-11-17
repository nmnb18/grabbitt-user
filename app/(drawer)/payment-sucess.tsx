import { AppHeader } from "@/components/shared/app-header";
import { Button } from "@/components/ui/paper-button";
import { Colors } from "@/utils/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Image, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import Animated, { FadeInUp, ZoomIn } from "react-native-reanimated";

export default function PaymentSuccess() {
    const router = useRouter();

    // Comes from router.push("/payment-success?orderId=GBT-001&plan=pro")
    const { orderId, plan, expiresAt } = useLocalSearchParams();

    const expiresAtValue = Array.isArray(expiresAt) ? expiresAt[0] : expiresAt;

    const formattedDate = new Date(expiresAtValue).toLocaleString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });

    return (
        <View style={{ flex: 1, backgroundColor: Colors.light.background }}>

            <AppHeader />
            <View style={styles.container}>
                {/* Animated Check Icon */}
                <Animated.View entering={ZoomIn.duration(600)}>
                    <Image
                        source={require('@/assets/images/success-check.png')}
                        style={styles.checkImage}
                    />
                </Animated.View>

                {/* Title */}
                <Animated.Text entering={FadeInUp.delay(200).duration(400)} style={styles.title}>
                    🎉 Hurray! Payment Successful
                </Animated.Text>

                {/* Order ID */}
                <Animated.Text entering={FadeInUp.delay(300).duration(400)} style={styles.orderId}>
                    Order ID: <Text style={styles.orderIdHighlight}>{orderId}</Text>
                </Animated.Text>

                <Animated.Text entering={FadeInUp.delay(300).duration(400)} style={styles.orderId}>
                    Expires At: <Text style={styles.orderIdHighlight}>{formattedDate}</Text>
                </Animated.Text>

                {/* Plan Info */}
                <Animated.Text entering={FadeInUp.delay(400).duration(400)} style={styles.plan}>
                    Your <Text style={styles.planHighlight}>{String(plan).toUpperCase()}</Text> plan is now active!
                </Animated.Text>

                {/* Subtitle */}
                <Animated.Text entering={FadeInUp.delay(500).duration(400)} style={styles.subtext}>
                    Enjoy advanced analytics, unlimited QR codes and more 🚀
                </Animated.Text>

                {/* CTA Button */}
                <Animated.View entering={FadeInUp.delay(600).duration(400)}>
                    <Button
                        variant="contained"
                        onPress={() => router.replace("/(drawer)")}
                    >
                        Go to Dashboard
                    </Button>
                </Animated.View>
            </View>


        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        paddingHorizontal: 28,
        justifyContent: "center",
        alignItems: "center",
    },
    checkImage: {
        width: 140,
        height: 140,
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: "700",
        color: "#222",
        textAlign: "center",
        marginBottom: 10,
    },
    orderId: {
        fontSize: 18,
        color: "#333",
        marginBottom: 8,
    },
    orderIdHighlight: {
        fontWeight: "700",
        color: "#009688",
    },
    plan: {
        fontSize: 18,
        color: "#444",
        marginBottom: 6,
    },
    planHighlight: {
        fontWeight: "700",
        color: "#0066CC",
    },
    subtext: {
        fontSize: 14,
        color: "#666",
        textAlign: "center",
        width: "90%",
        marginBottom: 28,
        marginTop: 4,
    },
    button: {
        borderRadius: 10,
        width: 200,
        backgroundColor: "#0066CC",
    },
});
