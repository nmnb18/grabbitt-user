import { AppStyles, Colors } from '@/utils/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
    Image,
    StyleSheet,
    View,
} from 'react-native';
import {
    Card,
    Chip,
    Text,
} from 'react-native-paper';
interface QrCodeProps {
    qrMode: string;
    qrData: any;
}
export function QrCode({ qrMode, qrData }: QrCodeProps) {
    return (
        <Card style={styles.qrCard}>
            <View style={[styles.qrCardContent]}>
                <View style={styles.qrContainer}>
                    <Image
                        source={{ uri: qrData.qr_code_base64 }}
                        style={styles.qrImage}
                        resizeMode="contain"
                    />
                </View>

                <View style={styles.qrInfo}>
                    <Chip
                        icon="check-circle"
                        style={styles.qrChip}
                    >
                        Active
                    </Chip>
                    <Text variant="bodySmall" >
                        QR Code ID: {qrData?.qr_id?.substring(0, 8)}...
                    </Text>
                    {qrMode === 'dynamic' && qrData?.expires_at && (
                        <Text variant="bodySmall">
                            Expires: {new Date(qrData.expires_at).toLocaleString()}
                        </Text>
                    )}
                    {qrMode === 'static_with_code' && (
                        <View style={styles.codeContainer}>
                            <MaterialCommunityIcons name="key" size={16} color={Colors.light.onPrimary} />
                            <Text variant="bodySmall">
                                Code: {qrData.hiddenCode}
                            </Text>
                        </View>
                    )}
                </View>
            </View>
            {/* 
            <Card.Actions style={styles.cardActions}>
                <Button
                    onPress={handleShare}
                    icon="share-variant"
                >
                    Share
                </Button>
                <Button
                    onPress={() => {
                        setQrImage(null);
                        setQrData(null);
                    }}
                    icon="refresh"
                >
                    New QR
                </Button>
            </Card.Actions> */}
        </Card>
    );
}
const styles = StyleSheet.create({
    qrCard: {
        marginBottom: AppStyles.spacing.md,
        borderRadius: AppStyles.card.borderRadius,
        backgroundColor: Colors.light.surface,
        borderWidth: 1,
        borderColor: Colors.light.outline,
        overflow: 'hidden',
    },
    qrCardContent: {
        padding: AppStyles.spacing.lg,
        alignItems: 'center',
    },
    qrContainer: {
        backgroundColor: Colors.light.surface,
        padding: AppStyles.spacing.md,
        borderRadius: AppStyles.card.borderRadius,
        marginBottom: AppStyles.spacing.md,
    },
    qrImage: {
        width: 200,
        height: 200,
    },
    qrInfo: {
        alignItems: 'center',
        gap: AppStyles.spacing.sm,
    },
    qrChip: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        borderColor: Colors.light.primary
    },
    codeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: AppStyles.spacing.sm,
    },
})