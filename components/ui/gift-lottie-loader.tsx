import React from "react";
import { View, StyleSheet, Text } from "react-native";
import LottieView from "lottie-react-native";
import { useTheme } from "@/hooks/use-theme-color";

export default function GiftLottieLoader({
    text = "Picking your best perk...",
}: {
    text?: string;
}) {
    const theme = useTheme();

    return (
        <View style={styles.container}>
            <LottieView
                source={require("@/assets/json/gift_box.json")}
                autoPlay
                loop
                style={styles.lottie}
            />

            <Text style={[styles.text, { color: theme.colors.onSurfaceDisabled }]}>
                {text}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        justifyContent: "center",
    },
    lottie: {
        width: 160,
        height: 160,
    },
    text: {
        marginTop: 16,
        fontSize: 15,
        fontWeight: "500",
    },
});
