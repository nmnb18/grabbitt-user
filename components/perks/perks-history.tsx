import React, { useEffect, useState } from "react";
import { FlatList, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "@/services/axiosInstance";
import PerkListItem from "@/components/perks/perk-list-item";
import { GradientHeader } from "@/components/shared/app-header";
import { UserPerkItem, UserPerksHistoryResponse } from "@/types/perks";

type PerksProps = {
    perks: UserPerkItem[];
    loading: boolean;
    hasData: boolean;
}

export default function PerksHistory({ perks }: PerksProps) {

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <GradientHeader title="My Perks" />

            <FlatList
                data={perks}
                keyExtractor={(item: any) => item.id}
                contentContainerStyle={{ padding: 16 }}
                renderItem={({ item }) => (
                    <PerkListItem
                        perk={item}
                    />
                )}
            />
        </SafeAreaView>
    );
}
