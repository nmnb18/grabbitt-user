import SellerFreeAIInsights from '@/components/ai-insights/free-analytics';
import SellerProAnalyticsInsights from '@/components/ai-insights/pro-analytics';
import { useAuthStore } from '@/store/authStore';
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';

export default function AnalyticsScreen() {
  const { user } = useAuthStore();
  const tier = user?.user?.seller_profile?.subscription.tier || 'free';

  const [tab, setTab] = useState<'free' | 'pro'>('free');

  return (
    <View style={styles.container}>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          onPress={() => setTab('free')}
          style={[styles.tab, tab === 'free' && styles.activeTab]}
        >
          <Text style={[styles.tabText, tab === 'free' && styles.activeTabText]}>
            Overview
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setTab('pro')}
          style={[styles.tab, tab === 'pro' && styles.activeTab]}
        >
          <Text style={[styles.tabText, tab === 'pro' && styles.activeTabText]}>
            Insights
          </Text>
        </TouchableOpacity>
      </View>

      {/* CONTENT */}
      {tab === 'free' ? (
        <SellerFreeAIInsights />
      ) : (
        <SellerProAnalyticsInsights />
      )}

    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  tabs: {
    flexDirection: 'row',
    padding: 12,
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 12,
    backgroundColor: '#E5E7EB40',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#111827',
    fontWeight: '700',
  },
});
