import { AppStyles } from '@/utils/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { View } from 'react-native';

interface GradientIconProps {
    name: any;
    size: number;
}

export const GradientIcon = ({ name = '', size = 24 }: GradientIconProps) => {
    const gradientColors = AppStyles.gradients.primary;
    return (
        <MaskedView
            style={{ width: size, height: size }}
            maskElement={
                <View style={{ backgroundColor: 'transparent' }}>
                    <MaterialCommunityIcons name={name} size={size} color="black" />
                </View>
            }
        >
            <LinearGradient
                colors={gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ flex: 1 }}
            />
        </MaskedView>
    );
};
