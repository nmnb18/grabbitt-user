import { BlurView } from "expo-blur";
import React from "react";
import { ActivityIndicator, StyleSheet } from "react-native";

export default function BlurLoader() {
    return (
        <BlurView intensity={40} style={styles.overlay}>
            <ActivityIndicator size="large" color="#fff" />
        </BlurView>
    );
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
    },
});
