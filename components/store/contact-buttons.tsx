// components/store/ContactButtons.tsx
import React from "react";
import { View, StyleSheet, Linking, Platform } from "react-native";
import { Button } from "@/components/ui/paper-button";
import { useTheme } from "@/hooks/use-theme-color";

interface ContactButtonsProps {
    onCall: () => void;
    onGetDirections: () => void;
}

export const ContactButtons: React.FC<ContactButtonsProps> = ({
    onCall,
    onGetDirections,
}) => {

    return (
        <View style={styles.contactRow}>
            <Button
                variant="outlined"
                icon="phone"
                onPress={onCall}
            >
                Call Store
            </Button>
            <Button
                variant="outlined"
                icon="directions"
                onPress={onGetDirections}
            >
                Get Directions
            </Button>
        </View>
    );
};

const styles = StyleSheet.create({
    contactRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 32,
    },
});