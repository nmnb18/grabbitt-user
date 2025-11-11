import { AppStyles } from '@/utils/theme';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text } from 'react-native';

interface GradientTextProps {
    children: React.ReactNode;
    style?: any;
    colors?: string[];
}

// Gradient Text Component
export const GradientText = ({ children, style }: GradientTextProps) => {
    const gradientColors = AppStyles.gradients.primary;

    return (
        <MaskedView
            maskElement={
                <Text style={[styles.maskText, style]}>
                    {children}
                </Text>
            }
        >
            <LinearGradient
                colors={gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
            >
                <Text style={[styles.gradientText, style, { opacity: 0 }]}>
                    {children}
                </Text>
            </LinearGradient>
        </MaskedView>
    );
};

const styles = StyleSheet.create({
    maskText: {
        backgroundColor: 'transparent',
        fontFamily: 'Poppins',
        fontWeight: '600',
        textAlign: 'center',
    },
    gradientText: {
        backgroundColor: 'transparent',
        fontFamily: 'Poppins',
        fontWeight: '600',
        textAlign: 'center',
    },
});