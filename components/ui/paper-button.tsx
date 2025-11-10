import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { AppStyles } from '@/utils/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

export type ButtonProps = {
    children: string;
    onPress: () => void;
    loading?: boolean;
    disabled?: boolean;
    variant?: 'contained' | 'outlined' | 'text';
    size?: 'medium' | 'large';
    fullWidth?: boolean;
    icon?: string; // MaterialCommunityIcons name
    iconPosition?: 'left' | 'right';
    iconSize?: number;
    iconColor?: string;
};

export function Button({
    children,
    onPress,
    loading = false,
    disabled = false,
    variant = 'contained',
    size = 'medium',
    fullWidth = false,
    icon,
    iconPosition = 'left',
    iconSize = 20,
    iconColor,
}: ButtonProps) {
    const backgroundColor = useThemeColor({}, 'background');
    const textColor = useThemeColor({}, 'text');
    const primaryColor = useThemeColor({}, 'primary');

    const isContained = variant === 'contained';
    const isOutlined = variant === 'outlined';
    const isText = variant === 'text';
    const isLarge = size === 'large';

    // Determine icon color based on variant
    const getIconColor = () => {
        if (iconColor) return iconColor;
        if (isContained) return '#FFFFFF';
        if (isOutlined) return textColor;
        return primaryColor;
    };

    const renderContent = () => {
        const content = (
            <>
                {icon && iconPosition === 'left' && !loading && (
                    <MaterialCommunityIcons
                        name={icon as any}
                        size={iconSize}
                        color={getIconColor()}
                        style={styles.iconLeft}
                    />
                )}

                {loading ? (
                    <ActivityIndicator
                        size="small"
                        color={isContained ? '#FFFFFF' : primaryColor}
                    />
                ) : (
                    <ThemedText
                        style={[
                            styles.buttonText,
                            isContained && styles.containedButtonText,
                            isOutlined && styles.outlineButtonText,
                            isText && [styles.textButtonText, { color: primaryColor }],
                            isLarge && styles.largeButtonText,
                        ]}
                    >
                        {children}
                    </ThemedText>
                )}

                {icon && iconPosition === 'right' && !loading && (
                    <MaterialCommunityIcons
                        name={icon as any}
                        size={iconSize}
                        color={getIconColor()}
                        style={styles.iconRight}
                    />
                )}
            </>
        );

        return content;
    };

    if (isContained) {
        return (
            <TouchableOpacity
                onPress={onPress}
                disabled={disabled || loading}
                style={[
                    styles.buttonBase,
                    styles.containedButton,
                    fullWidth && styles.fullWidth,
                    isLarge && styles.largeButton,
                    (disabled || loading) && styles.disabledButton,
                ]}
            >
                <LinearGradient
                    colors={AppStyles.gradients.primary}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[
                        styles.gradientBackground,
                        isLarge && styles.largeGradient,
                        styles.contentContainer,
                    ]}
                >
                    {renderContent()}
                </LinearGradient>
            </TouchableOpacity>
        );
    }

    if (isOutlined) {
        return (
            <TouchableOpacity
                onPress={onPress}
                disabled={disabled || loading}
                style={[
                    styles.outlineContainer,
                    fullWidth && styles.fullWidth,
                    (disabled || loading) && styles.disabledButton,
                ]}
            >
                <LinearGradient
                    colors={AppStyles.gradients.primary}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.outlineGradientBorder}
                >
                    <View style={[
                        styles.outlineButtonInner,
                        { backgroundColor },
                        isLarge && styles.largeOutlineButton,
                        styles.contentContainer,
                    ]}>
                        {renderContent()}
                    </View>
                </LinearGradient>
            </TouchableOpacity>
        );
    }

    // Text variant
    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            style={[
                styles.textButtonContainer,
                fullWidth && styles.fullWidth,
                (disabled || loading) && styles.disabledButton,
                styles.contentContainer,
            ]}
        >
            {renderContent()}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    buttonBase: {
        borderRadius: 12,
        overflow: 'hidden',
        ...AppStyles.shadows.medium,
    },
    containedButton: {
        // Additional contained button styles if needed
    },
    outlineContainer: {
        borderRadius: 12,
        ...AppStyles.shadows.medium,
    },
    outlineGradientBorder: {
        borderRadius: 12,
        padding: 2, // Creates the border
    },
    outlineButtonInner: {
        borderRadius: 10, // 12 - 2 = 10
        paddingVertical: 10,
        paddingHorizontal: 24,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 40,
    },
    largeOutlineButton: {
        paddingVertical: 14,
        minHeight: 48,
    },
    textButtonContainer: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 40,
    },
    gradientBackground: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 48,
    },
    largeGradient: {
        paddingVertical: 16,
        minHeight: 56,
    },
    largeButton: {
        minHeight: 56,
    },
    contentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        fontFamily: 'Inter',
        fontWeight: '500',
        textAlign: 'center',
    },
    containedButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
    },
    outlineButtonText: {
        fontSize: 16,
        fontWeight: '500',
        textAlign: 'center',
    },
    textButtonText: {
        fontSize: 16,
        fontWeight: '500',
        textAlign: 'center',
    },
    largeButtonText: {
        fontSize: 18,
    },
    iconLeft: {
        marginRight: 8,
    },
    iconRight: {
        marginLeft: 8,
    },
    fullWidth: {
        width: '100%',
    },
    disabledButton: {
        opacity: 0.6,
    },
});