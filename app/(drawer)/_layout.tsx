// app/(drawer)/_layout.tsx
import { GradientIcon } from '@/components/ui/gradient-icon';
import { useAuthStore } from '@/store/authStore';
import { Colors } from '@/utils/theme';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { Alert, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DrawerLayout() {
    return (
        <Drawer
            screenOptions={{
                headerShown: false,
                drawerActiveTintColor: '#FF7A00',
                drawerLabelStyle: { fontSize: 16 },
            }}
            drawerContent={(props) => <CustomDrawerContent />}
        >
            {/* Your main tab layout */}
            <Drawer.Screen
                name="(tabs)"
                options={{
                    title: 'Dashboard',
                    drawerIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
                }}

            />
        </Drawer>
    );
}

function CustomDrawerContent() {
    const router = useRouter();
    const { logout, user } = useAuthStore();
    const version = Constants.expoConfig?.version || '1.0.0';

    const handleLogout = async () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Logout',
                onPress: async () => {
                    await logout(user?.uid ?? '');
                    router.replace('/auth/login');
                },
            },
        ]);
    };

    const MenuItem = ({
        label,
        icon,
        onPress,
        color
    }: {
        label: string;
        icon: keyof typeof Ionicons.glyphMap;
        onPress: () => void;
        color: string;
    }) => (
        <TouchableOpacity style={styles.menuItem} onPress={onPress}>
            <GradientIcon name={icon} size={22} />
            <Text style={styles.menuLabel}>{label}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={{ flex: 1 }}><View style={styles.container}>
            <ScrollView style={styles.menuContainer}>
                <MenuItem label="Dashboard" icon="grid" color={Colors.light.primary} onPress={() => router.push('/(tabs)/dashboard')} />
                <MenuItem label="Subscription" icon="star" color={Colors.light.primary} onPress={() => router.push('/subscription')} />
                <MenuItem
                    label="Contact Us"
                    icon="mail" color={Colors.light.primary}
                    onPress={() => Linking.openURL('mailto:support@grabbitt.in')}
                />
                <MenuItem
                    label="Privacy Policy"
                    icon="lock" color={Colors.light.primary}
                    onPress={() => Linking.openURL('https://grabbitt.in/privacy')}
                />
                <MenuItem
                    label="Terms & Conditions"
                    icon="file" color={Colors.light.primary}
                    onPress={() => Linking.openURL('https://grabbitt.in/terms')}
                />
            </ScrollView>

            <View style={styles.logout}>


                <MenuItem
                    label="Logout"
                    icon="logout" color={Colors.light.primary}
                    onPress={handleLogout}
                />
            </View>
            <View style={styles.footer}>
                <Text style={styles.footerText}>
                    Version {version}
                    {'\n'}
                    Maintained & Developed by <Text style={{ fontWeight: '600' }}>Grabbitt Team</Text>
                </Text>
            </View>
        </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'space-between' },
    menuContainer: { padding: 16 },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomColor: '#ddd',
        borderBottomWidth: 1,
        gap: 16,
    },
    menuLabel: { fontSize: 16, color: Colors.light.onSurface },
    footer: {
        borderTopWidth: 0,
        borderTopColor: '#ddd',
        padding: 0,
        marginBlockEnd: 20
    },
    logout: {
        borderTopWidth: 1,
        borderTopColor: '#ddd',
        justifyContent: 'space-between',
        paddingInline: 16
    },
    footerText: {
        textAlign: 'center',
        fontSize: 12,
        color: '#777',
        marginBlockStart: 10
    },
    logoutButton: {}
});


