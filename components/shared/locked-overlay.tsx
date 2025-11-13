import { Colors } from "@/utils/theme";
import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { Button } from "../ui/paper-button";

export function LockedOverlay({
    message = "Editing is disabled on the Free plan.",
}: {
    message?: string;
}) {
    const router = useRouter();

    return (
        <View style={styles.overlay}>
            <View style={styles.box}>
                <Text style={styles.lockIcon}>🔒</Text>
                <Text style={styles.title}>Upgrade Required</Text>
                <Text style={styles.message}>{message}</Text>

                <Button
                    variant="contained"
                    onPress={() => router.push('/(drawer)/subscription')}
                >
                    Upgrade Plan
                </Button>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(255,255,255,0.8)",
        zIndex: 99,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
        borderRadius: 16,
    },
    box: {
        alignItems: "center",
    },
    lockIcon: { fontSize: 42, marginBottom: 4 },
    title: { fontSize: 18, fontWeight: "700", marginBottom: 6 },
    message: {
        textAlign: "center",
        fontSize: 14,
        marginBottom: 14,
        color: "#555",
    },
    button: {
        borderRadius: 10,
        backgroundColor: Colors.light.accent,
        paddingHorizontal: 18,
        paddingVertical: 6,
    },
});
