import { StyleSheet, View } from "react-native";
import { ActivityIndicator } from "react-native-paper";

export const LoadingView = ({ color }: { color: string }) => (
    <View style={styles.center}>
        <ActivityIndicator size="large" color={color} />
    </View>
);


const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "black" },
    center: { flex: 1, justifyContent: "center", alignItems: "center" }
});