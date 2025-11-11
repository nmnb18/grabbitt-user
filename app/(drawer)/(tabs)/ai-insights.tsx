import { useTheme } from '@/hooks/use-theme-color';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  ActivityIndicator,
  Button,
  Card,
  Chip,
  Text
} from 'react-native-paper';
import { useAuthStore } from '../../../store/authStore';

const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL;

export default function SellerAIInsights() {
  const sellerTheme = useTheme();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'optimize' | 'fraud' | 'recommend'>('optimize');

  const fetchOptimization = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/api/ai/optimize-rewards`,
        {},
        {
          headers: { Authorization: `Bearer ${user?.token}` }
        }
      );
      setInsights(response.data);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to fetch insights');
    } finally {
      setLoading(false);
    }
  };

  const fetchFraudDetection = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/api/ai/fraud-detection`,
        {},
        {
          headers: { Authorization: `Bearer ${user?.token}` }
        }
      );
      setInsights(response.data);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to fetch fraud analysis');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: 'optimize' | 'fraud' | 'recommend') => {
    setActiveTab(tab);
    setInsights(null);

    if (tab === 'optimize') {
      fetchOptimization();
    } else if (tab === 'fraud') {
      fetchFraudDetection();
    }
  };

  return (
    <View style={styles.container}>
      {/* Header with Gradient */}
      <LinearGradient
        colors={['#0D7377', '#14FFEC']}
        style={styles.header}
      >
        <Text variant="headlineMedium" style={styles.headerTitle}>
          AI Insights
        </Text>
        <Text variant="bodyMedium" style={styles.headerSubtitle}>
          Powered by advanced analytics
        </Text>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Tab Selection */}
        <View style={styles.tabContainer}>
          <Button
            mode={activeTab === 'optimize' ? 'contained' : 'outlined'}
            onPress={() => handleTabChange('optimize')}
            style={styles.tabButton}
            icon="lightbulb"
            compact
          >
            Optimize
          </Button>
          <Button
            mode={activeTab === 'fraud' ? 'contained' : 'outlined'}
            onPress={() => handleTabChange('fraud')}
            style={styles.tabButton}
            icon="shield-alert"
            compact
          >
            Fraud
          </Button>
        </View>

        {/* Loading State */}
        {loading && (
          <Card style={styles.card}>
            <Card.Content style={styles.loadingContent}>
              <ActivityIndicator size="large" color={sellerTheme.colors.primary} />
              <Text variant="titleMedium" style={styles.loadingText}>
                Analyzing your data...
              </Text>
              <Text variant="bodySmall" style={styles.loadingSubtext}>
                This may take a few moments
              </Text>
            </Card.Content>
          </Card>
        )}

        {/* Insights Display */}
        {!loading && insights && (
          <Card style={styles.insightsCard}>
            <LinearGradient
              colors={['#2B5F75', '#0D7377']}
              style={styles.insightsHeader}
            >
              <MaterialCommunityIcons
                name={activeTab === 'optimize' ? 'lightbulb' : 'shield-check'}
                size={40}
                color="#FFFFFF"
              />
              <Text variant="headlineSmall" style={styles.insightsTitle}>
                {activeTab === 'optimize' ? 'Optimization Suggestions' : 'Security Analysis'}
              </Text>
            </LinearGradient>
            <Card.Content style={styles.insightsContent}>
              <Text variant="bodyMedium" style={styles.insightsText}>
                {insights.suggestion || insights.analysis || 'No insights available'}
              </Text>

              {activeTab === 'optimize' && (
                <View style={styles.metricsContainer}>
                  <View style={styles.metricCard}>
                    <MaterialCommunityIcons name="trending-up" size={24} color={sellerTheme.colors.primary} />
                    <Text variant="labelMedium" style={styles.metricLabel}>Potential Growth</Text>
                    <Text variant="titleLarge" style={styles.metricValue}>+15%</Text>
                  </View>
                  <View style={styles.metricCard}>
                    <MaterialCommunityIcons name="account-multiple" size={24} color={sellerTheme.colors.secondary} />
                    <Text variant="labelMedium" style={styles.metricLabel}>User Retention</Text>
                    <Text variant="titleLarge" style={styles.metricValue}>85%</Text>
                  </View>
                </View>
              )}
            </Card.Content>
          </Card>
        )}

        {/* Feature Cards */}
        {!loading && !insights && (
          <>
            <Card style={styles.featureCard}>
              <Card.Content>
                <View style={styles.featureHeader}>
                  <MaterialCommunityIcons name="lightbulb" size={40} color="#F59E0B" />
                  <Text variant="titleLarge" style={styles.featureTitle}>
                    Reward Optimization
                  </Text>
                </View>
                <Text variant="bodyMedium" style={styles.featureDescription}>
                  Get AI-powered suggestions to optimize your reward structure, increase customer engagement, and maximize ROI.
                </Text>
                <View style={styles.featureList}>
                  <Chip icon="check" style={styles.featureChip}>Smart point allocation</Chip>
                  <Chip icon="check" style={styles.featureChip}>Engagement analysis</Chip>
                  <Chip icon="check" style={styles.featureChip}>Revenue prediction</Chip>
                </View>
                <Button
                  mode="contained"
                  onPress={() => handleTabChange('optimize')}
                  style={styles.featureButton}
                  icon="rocket"
                >
                  Optimize Now
                </Button>
              </Card.Content>
            </Card>

            <Card style={styles.featureCard}>
              <Card.Content>
                <View style={styles.featureHeader}>
                  <MaterialCommunityIcons name="shield-check" size={40} color="#10B981" />
                  <Text variant="titleLarge" style={styles.featureTitle}>
                    Fraud Detection
                  </Text>
                </View>
                <Text variant="bodyMedium" style={styles.featureDescription}>
                  Advanced AI algorithms analyze patterns to detect suspicious activities and protect your business.
                </Text>
                <View style={styles.featureList}>
                  <Chip icon="check" style={styles.featureChip}>Real-time monitoring</Chip>
                  <Chip icon="check" style={styles.featureChip}>Pattern analysis</Chip>
                  <Chip icon="check" style={styles.featureChip}>Threat alerts</Chip>
                </View>
                <Button
                  mode="contained"
                  onPress={() => handleTabChange('fraud')}
                  style={styles.featureButton}
                  icon="shield"
                >
                  Analyze Security
                </Button>
              </Card.Content>
            </Card>
          </>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: '#FFFFFF',
    opacity: 0.9,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
  },
  card: {
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  loadingContent: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
  },
  loadingSubtext: {
    marginTop: 8,
  },
  insightsCard: {
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    marginBottom: 16,
  },
  insightsHeader: {
    padding: 24,
    alignItems: 'center',
  },
  insightsTitle: {
    color: '#FFFFFF',
    marginTop: 12,
    textAlign: 'center',
  },
  insightsContent: {
    padding: 20,
  },
  insightsText: {
    lineHeight: 24,
  },
  metricsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  metricCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  metricLabel: {
    marginTop: 8,
    textAlign: 'center',
  },
  metricValue: {
    fontWeight: '700',
    marginTop: 4,
  },
  featureCard: {
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  featureHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  featureTitle: {
    marginTop: 12,
    textAlign: 'center',
  },
  featureDescription: {
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },
  featureList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 20,
  },
  featureChip: {
  },
  featureButton: {
    borderRadius: 12,
  },
  bottomSpacer: {
    height: 80,
  },
});