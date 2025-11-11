import { Colors } from '@/utils/theme';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';

interface AppHeaderProps {
    showMenu?: boolean;
    showNotifications?: boolean;
    onNotificationsPress?: () => void;
    backgroundColor?: string;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
    showMenu = true,
    showNotifications = true,
    onNotificationsPress,
    backgroundColor = Colors.light.background,
}) => {
    const navigation = useNavigation<any>();

    return (
        <View style={[styles.headerContainer, { backgroundColor }]}>
            {showMenu ? (
                <TouchableOpacity
                    onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
                    style={styles.iconButton}
                >
                    <Ionicons name="menu" size={26} color="#000" />
                </TouchableOpacity>
            ) : (
                <View style={styles.iconButton} />
            )}

            <Image
                source={require('@/assets/images/logo.png')}
                style={styles.logo}
            />

            {showNotifications ? (
                <TouchableOpacity
                    onPress={onNotificationsPress || (() => console.log('Notifications pressed'))}
                    style={styles.iconButton}
                >
                    <Ionicons name="notifications-outline" size={24} color="#000" />
                </TouchableOpacity>
            ) : (
                <View style={styles.iconButton} />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 60,
        paddingBottom: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 0,
    },
    iconButton: {
        width: 40,
        alignItems: 'center',
    },
    logo: {
        width: 160,
        height: 60,
    },
});
