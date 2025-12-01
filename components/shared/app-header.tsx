import { useTheme } from "@/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import React from "react";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { GradientText } from "../ui/gradient-text";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "@/hooks/use-color-scheme.web";
import { AppStyles } from "@/utils/theme";
import { Text } from "react-native-paper";
import { useAuthStore } from "@/store/authStore";

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
    backgroundColor,
}) => {
    const navigation = useNavigation<any>();
    const theme = useTheme();
    const colorScheme = useColorScheme();
    const headerGradient =
        colorScheme === "dark"
            ? AppStyles.gradients.headerDark
            : AppStyles.gradients.headerLight;

    const { user } = useAuthStore();

    return (
        <LinearGradient
            colors={headerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
                paddingTop: Platform.OS === "ios" ? 60 : 40,
                paddingBottom: 20,
                paddingHorizontal: 16,
            }}
        >
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                {/* LEFT SIDE — LOGO + GREETING */}
                <View style={{ flexDirection: "column" }}>
                    <GradientText
                        style={{
                            fontFamily: "JostMedium",
                            fontSize: 36,
                            lineHeight: 38,
                        }}
                    >
                        grabbitt
                    </GradientText>

                    <Text
                        style={{
                            color: theme.colors.onSurface,
                            fontSize: 15,
                            marginTop: 2,
                            opacity: 0.9,
                        }}
                    >
                        Hello, {user?.user?.name || "User"} 👋
                    </Text>
                </View>

                {/* RIGHT SIDE — ICONS */}
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 18,
                    }}
                >
                    {/* Notifications */}
                    <TouchableOpacity
                        onPress={() => console.log("Notifications pressed")}
                    >
                        <Ionicons
                            name="notifications-outline"
                            size={26}
                            color={theme.colors.onSurface}
                        />
                    </TouchableOpacity>

                    {/* Menu */}
                    <TouchableOpacity
                        onPress={() =>
                            navigation.dispatch(DrawerActions.openDrawer())
                        }
                    >
                        <Ionicons
                            name="menu"
                            size={28}
                            color={theme.colors.onSurface}
                        />
                    </TouchableOpacity>
                </View>
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingBottom: 0,
        paddingHorizontal: 8,
    },
    iconButton: {
        width: 40,
        alignItems: "center",
    },
});
