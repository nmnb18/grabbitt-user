// components/splash/AnimatedSplash.tsx
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

const coinRain = require('@/assets/images/grabbitt_coin_rain_top_only.gif');
const logo = require('@/assets/images/logo.png');

interface AnimatedSplashProps {
    onFinish?: () => void;
}

export default function AnimatedSplash({ onFinish }: AnimatedSplashProps) {
    const opacity = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(0.9)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.parallel([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.spring(scale, {
                    toValue: 1,
                    friction: 6,
                    tension: 60,
                    useNativeDriver: true,
                }),
            ]),
            Animated.delay(100), // keep visible a bit
        ]).start(() => {
            //onFinish();
        });
    }, [opacity, scale]);

    return (
        <View style={styles.container}>
            {/* coin rain background at top */}

            {/* logo + tagline */}
            <View style={styles.centerContent}>
                <Animated.Image
                    source={logo}
                    style={[
                        styles.logo,
                        {
                            opacity,
                            transform: [{ scale }],
                        },
                    ]}
                    resizeMode="contain"
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    centerContent: {

    },
    logo: {
        width: 480,
        height: 160,
    },
    tagline: {
        marginTop: 12,
        fontSize: 16,
        color: '#6B7280',
        letterSpacing: 1,
    },
});
