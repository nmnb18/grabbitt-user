import { useThemeColor } from "@/hooks/use-theme-color";
import { AppStyles } from "@/utils/theme";
import React from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    View,
} from "react-native";

export default function AuthScreenWrapper({ children }: { children: React.ReactNode }) {
    const backgroundColor = useThemeColor({}, 'background');
    return (
        <View style={{ flex: 1, backgroundColor }}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
            >
                <ScrollView
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {children}
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: AppStyles.spacing.lg,
        paddingTop: AppStyles.spacing.xl,
        paddingBottom: 200, // 👈 This prevents inputs/buttons from hiding behind keyboard
    },
});
