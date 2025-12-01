import { StyleSheet, View } from "react-native";
import { ActivityIndicator, Text, useTheme } from "react-native-paper";

export const LoadingView = ({ color, message }: { color: string, message?: string }) => {
    const theme = useTheme();
    return (
        <View style={[styles.center, { backgroundColor: theme.colors.surface }]}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={{ color: theme.colors.primary }} >{message ?? ''}</Text>
        </View>)
};


const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: "center", alignItems: "center", gap: 16 }
});