import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";
import { Card, Modal, Portal, Text, TextInput } from "react-native-paper";
import { Button } from "../ui/paper-button";
import { PaymentSeller } from "@/types/scan-qr";

interface PaymentModalProps {
    visible: boolean;
    seller: PaymentSeller | null;
    amount: string;
    processing: boolean;
    onAmountChange: (amount: string) => void;
    onPayment: () => void;
    onCancel: () => void;
    theme: any;
    isValidAmount: boolean;
}

export const PaymentModal = ({
    visible,
    seller,
    amount,
    processing,
    onAmountChange,
    onPayment,
    onCancel,
    theme,
    isValidAmount
}: PaymentModalProps) => (
    <Portal>
        <Modal visible={visible} onDismiss={onCancel} contentContainerStyle={styles.paymentModal}>
            <Card style={[styles.modalCard, { backgroundColor: theme.surface }]}>
                <Card.Content>
                    <View style={styles.modalHeader}>
                        <MaterialCommunityIcons name="cash" size={42} color={theme.primary} />
                        <Text variant="headlineSmall" style={{ fontWeight: "700" }}>
                            Make Payment
                        </Text>
                        <Text style={{ opacity: 0.7, marginTop: 4, textAlign: "center" }}>
                            Pay {seller?.shop_name} via UPI
                        </Text>
                    </View>

                    <TextInput
                        label="Enter Amount (₹)"
                        mode="outlined"
                        value={amount}
                        onChangeText={onAmountChange}
                        keyboardType="numeric"
                        left={<TextInput.Icon icon="currency-inr" />}
                        style={{ marginBottom: 16 }}
                        outlineColor={theme.outline}
                        activeOutlineColor={theme.primary}
                    />

                    <Text style={[styles.rewardInfo, { color: theme.primary }]}>
                        You'll earn reward points based on your payment
                    </Text>

                    <View style={styles.modalActions}>
                        <Button variant="outlined" onPress={onCancel} >
                            Cancel
                        </Button>
                        <Button variant="contained"
                            loading={processing}
                            disabled={processing || !isValidAmount}
                            onPress={onPayment}
                        >
                            {`Pay ₹${amount || '0'}`}
                        </Button>
                    </View>
                </Card.Content>
            </Card>
        </Modal>
    </Portal>
);

const styles = StyleSheet.create({
    paymentModal: { paddingHorizontal: 20 },
    modalCard: { borderRadius: 20 },
    modalHeader: { alignItems: "center", marginBottom: 20 },
    modalActions: { flexDirection: "row", gap: 10 },
    rewardInfo: { fontSize: 12, textAlign: 'center', marginBottom: 16, fontWeight: '500' },
})