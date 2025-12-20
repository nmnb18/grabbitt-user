import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PerkListItem from "@/components/perks/perk-list-item";
import { GradientHeader } from "@/components/shared/app-header";
import { UserPerkItem } from "@/types/perks";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text } from "react-native-paper";
import { useTheme } from "@/hooks/use-theme-color";

type PerksProps = {
  perks: UserPerkItem[];
  loading: boolean;
  hasData: boolean;
};

export default function PerksHistory({ perks }: PerksProps) {
  const theme = useTheme();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <GradientHeader title="My Perks" />
      {perks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons
            name="inbox-outline"
            size={80}
            color={theme.colors.accent}
          />
          <Text style={[styles.emptyTitle, { color: theme.colors.onSurface }]}>
            No perks found
          </Text>
          <Text style={[styles.emptyText, { color: theme.colors.accent }]}>
            You have not redeemed any perks yet.
          </Text>
        </View>
      ) : (
        <FlatList
          data={perks}
          keyExtractor={(item: any) => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => <PerkListItem perk={item} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
});
