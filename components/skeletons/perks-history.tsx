import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useTheme } from "@/hooks/use-theme-color";
import { Skeleton } from "@/components/ui/skeleton";
import { SafeAreaView } from "react-native-safe-area-context";
import { GradientHeader } from "../shared/app-header";

export default function PerksHistorySkeleton() {
  const theme = useTheme();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <GradientHeader title="Perks History" />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View style={{ padding: 16 }}>
          {/* List */}
          {[1, 2, 3].map((item) => (
            <View key={item} style={styles.card}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.shopRow}>
                  <Skeleton style={styles.logo} />
                  <View style={styles.shopInfo}>
                    <Skeleton style={styles.shopName} />
                    <Skeleton style={styles.offerName} />
                  </View>
                </View>

                <Skeleton style={styles.statusChip} />
              </View>

              {/* Divider */}
              <Skeleton style={styles.divider} />

              {/* Body */}
              <View style={styles.body}>
                <Skeleton style={styles.redeemCode} />
                <Skeleton style={styles.expiry} />
              </View>

              {/* Footer */}
              <View style={styles.footer}>
                <Skeleton style={styles.createdAt} />
                <Skeleton style={styles.arrow} />
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scrollView: { flex: 1 },

  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    backgroundColor: "transparent",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  shopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },

  logo: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },

  shopInfo: {
    flex: 1,
    gap: 6,
  },

  shopName: {
    height: 16,
    width: "70%",
    borderRadius: 4,
  },

  offerName: {
    height: 12,
    width: "55%",
    borderRadius: 4,
  },

  statusChip: {
    height: 28,
    width: 90,
    borderRadius: 16,
  },

  divider: {
    height: 1,
    width: "100%",
    marginVertical: 12,
    borderRadius: 1,
  },

  body: {
    gap: 8,
  },

  redeemCode: {
    height: 14,
    width: "60%",
    borderRadius: 4,
  },

  expiry: {
    height: 12,
    width: "40%",
    borderRadius: 4,
  },

  footer: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  createdAt: {
    height: 10,
    width: "35%",
    borderRadius: 4,
  },

  arrow: {
    height: 16,
    width: 16,
    borderRadius: 8,
  },
});
