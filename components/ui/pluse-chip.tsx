import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet } from "react-native";
import { Chip } from "react-native-paper";

export function PulsingChip({ label, color }: { label: string; color: string }) {
    const scale = useRef(new Animated.Value(1)).current;
    const opacity = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const pulse = Animated.loop(
            Animated.parallel([
                Animated.sequence([
                    Animated.timing(scale, {
                        toValue: 1.06,
                        duration: 700,
                        useNativeDriver: true,
                    }),
                    Animated.timing(scale, {
                        toValue: 1,
                        duration: 700,
                        useNativeDriver: true,
                    }),
                ]),
                Animated.sequence([
                    Animated.timing(opacity, {
                        toValue: 0.6,
                        duration: 700,
                        useNativeDriver: true,
                    }),
                    Animated.timing(opacity, {
                        toValue: 1,
                        duration: 700,
                        useNativeDriver: true,
                    }),
                ]),
            ])
        );

        pulse.start();
        return () => pulse.stop();
    }, []);

    return (
        <Animated.View style={{ transform: [{ scale }], opacity }}>
            <Chip
                compact
                style={[styles.chip, { backgroundColor: color }]}
                textStyle={styles.text}

            >
                {label}
            </Chip>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    chip: {
        alignSelf: "flex-start",
    },
    text: {
        color: "#fff",
        fontWeight: "700",
    },
});
