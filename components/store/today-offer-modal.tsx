import React, { useState, useEffect } from "react";
import { Modal, Portal, Text } from "react-native-paper";
import { View, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useTheme } from "@/hooks/use-theme-color";
import { Button } from "@/components/ui/paper-button";
import api from "@/services/axiosInstance";
import { GradientText } from "@/components/ui/gradient-text";
import GiftLottieLoader from "../ui/gift-lottie-loader";
import Animated, { FadeInUp } from "react-native-reanimated";

export function TodayOfferModal({ visible, onClose, sellerId, setRedemptionCode, setRedemptionStatus }: any) {
    const theme = useTheme();

    const [revealedOffer, setRevealedOffer] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isRedeeming, setIsRedeeming] = useState(false);
    // ---------- API ----------
    const fetchBackendOffer = async () => {
        try {

            const resp = await api.post("/assignTodayOffer", {
                seller_id: sellerId,
            });
            return resp.data?.offer ?? null;
        } catch (e) {
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    // ---------- REVEAL ----------
    const startReveal = async () => {
        if (isLoading) return;
        setIsLoading(true);
        setTimeout(async () => {
            const selected = await fetchBackendOffer();
            if (!selected) return;
            setRevealedOffer(selected);
        }, 3000)


    };

    const handleRedeem = async () => {
        try {
            setIsRedeeming(true);
            const resp = await api.post("/redeemTodayOffer", {
                seller_id: sellerId,
            });

            setRedemptionCode(resp.data.redeem_code);
            setRedemptionStatus(resp.data.status);
            close();
        } catch (e: any) {
            Alert.alert(
                "Redeem",
                e.response?.data?.error || "Already redeemed today"
            );
        } finally {
            setIsRedeeming(false);
        }
    };


    // ---------- RESET ----------
    const close = () => {
        setRevealedOffer(null);
        onClose();
    };

    useEffect(() => {
        if (visible) {
            setRevealedOffer(null);
        }
    }, [visible]);

    return (
        <Portal>
            <Modal
                visible={visible}
                onDismiss={close}
                contentContainerStyle={[
                    styles.modal,
                    { backgroundColor: theme.colors.surface },
                ]}
            >
                <Text style={[styles.title, { color: theme.colors.onSurface }]}>
                    What’s in Today?
                </Text>

                <View style={styles.cardContainer}>
                    {!revealedOffer ? (
                        <TouchableOpacity
                            style={styles.card}
                            onPress={startReveal}
                            disabled={isLoading}
                            activeOpacity={0.8}
                        >
                            {isLoading ? (
                                <GiftLottieLoader />
                            ) : (
                                <>
                                    <Text style={styles.emoji}>🎁</Text>
                                    <Text style={styles.tapText}>Tap to Reveal</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    ) : (
                        <View
                            style={[
                                styles.card,
                            ]}
                        >
                            <Animated.Text style={[styles.title]} entering={FadeInUp.delay(300).duration(400)}>🎉</Animated.Text>
                            <Animated.Text style={[styles.revealTitle, { color: theme.colors.text }]} entering={FadeInUp.delay(300).duration(500)}>You got</Animated.Text>
                            <Animated.View entering={FadeInUp.delay(300).duration(500)}>
                                <GradientText style={styles.offerTitle}>
                                    Free {revealedOffer.title}
                                </GradientText>
                            </Animated.View>


                            <Animated.Text style={[styles.offerMeta, { color: theme.colors.text }]} entering={FadeInUp.delay(300).duration(600)}>
                                Min Spend ₹{revealedOffer.min_spend}
                            </Animated.Text>

                            <Animated.View entering={FadeInUp.delay(300).duration(600)}>
                                <Button loading={isRedeeming} variant="outlined" onPress={handleRedeem}>
                                    Claim Now
                                </Button>
                            </Animated.View>
                            <Animated.Text style={[{ fontSize: 10, color: theme.colors.accent, marginTop: 10 }]} entering={FadeInUp.delay(300).duration(800)}>
                                *** Terms Apply ***
                            </Animated.Text>
                        </View>
                    )}
                </View>

                <Button variant="text" onPress={close}>
                    {revealedOffer ? "Close" : "Cancel"}
                </Button>
            </Modal>
        </Portal>
    );
}

const styles = StyleSheet.create({
    modal: {
        margin: 20,
        borderRadius: 20,
        padding: 24,
        alignItems: "center",
    },
    title: {
        fontSize: 30,
        fontWeight: "700",
        marginBottom: 20,
    },
    cardContainer: {
        width: "100%",
        minHeight: 300,
        marginBottom: 20,
    },
    card: {
        flex: 1,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderStyle: "dashed",
        borderColor: "#e91e63",
    },
    emoji: {
        fontSize: 56,
        marginBottom: 12,
    },
    tapText: {
        fontSize: 18,
        fontWeight: "600",
    },
    revealEmoji: {
        fontSize: 48,
        marginBottom: 10,
    },
    revealTitle: {
        fontSize: 18,
        marginBottom: 8,
    },
    offerTitle: {
        fontSize: 22,
        fontWeight: "800",
        marginBottom: 6,
    },
    offerMeta: {
        opacity: 0.7,
        marginBottom: 20,
    },
});
