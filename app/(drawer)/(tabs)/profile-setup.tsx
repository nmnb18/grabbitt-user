import { useTheme } from '@/hooks/use-theme-color';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  ActivityIndicator,
  Button,
  Card,
  Divider,
  SegmentedButtons,
  Text,
  TextInput,
} from 'react-native-paper';
import { useAuthStore } from '../../../store/authStore';

const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL;

const categories = ['Food', 'Shopping', 'Services', 'Entertainment', 'Health', 'Other'];

export default function SellerProfileSetup() {
  const sellerTheme = useTheme();
  const { user } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isNewProfile, setIsNewProfile] = useState(true);

  const [shopName, setShopName] = useState('');
  const [category, setCategory] = useState('Food');
  const [description, setDescription] = useState('');
  const [pointsPerVisit, setPointsPerVisit] = useState('10');
  const [rewardPoints, setRewardPoints] = useState('100');
  const [rewardDescription, setRewardDescription] = useState('');
  const [subscriptionTier, setSubscriptionTier] = useState('free');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/sellers/profile`, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });

      const profile = response.data;
      setShopName(profile.shop_name);
      setCategory(profile.category || 'Food');
      setDescription(profile.description || '');
      setPointsPerVisit(profile.points_per_visit?.toString() || '10');
      setRewardPoints(profile.reward_points?.toString() || '100');
      setRewardDescription(profile.reward_description || '');
      setSubscriptionTier(profile.subscription_tier || 'free');
      setIsNewProfile(false);
    } catch (error: any) {
      if (error.response?.status === 404) {
        setIsNewProfile(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!shopName || !rewardDescription) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      const profileData = {
        shop_name: shopName,
        category,
        description,
        points_per_visit: parseInt(pointsPerVisit),
        reward_points: parseInt(rewardPoints),
        reward_description: rewardDescription,
        subscription_tier: subscriptionTier,
      };

      if (isNewProfile) {
        await axios.post(`${API_URL}/api/sellers/profile`, profileData, {
          headers: { Authorization: `Bearer ${user?.token}` }
        });
        Alert.alert('Success', 'Profile created successfully!', [
          { text: 'OK', onPress: () => router.replace('/(tabs)/dashboard') }
        ]);
      } else {
        await axios.put(`${API_URL}/api/sellers/profile`, profileData, {
          headers: { Authorization: `Bearer ${user?.token}` }
        });
        Alert.alert('Success', 'Profile updated successfully!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={sellerTheme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with Gradient */}
      <LinearGradient
        colors={['#0D7377', '#14FFEC']}
        style={styles.header}
      >
        <Text variant="headlineMedium" style={styles.headerTitle}>
          {isNewProfile ? 'Setup Your Profile' : 'Edit Profile'}
        </Text>
        <Text variant="bodyMedium" style={styles.headerSubtitle}>
          {isNewProfile ? 'Tell us about your business' : 'Update your shop details'}
        </Text>
      </LinearGradient>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Shop Details Card */}
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.cardTitle}>
                🏪 Shop Details
              </Text>
              <Divider style={styles.divider} />

              <TextInput
                label="Shop Name *"
                value={shopName}
                onChangeText={setShopName}
                mode="outlined"
                style={styles.input}
                left={<TextInput.Icon icon="store" />}
              />

              <Text variant="labelLarge" style={styles.label}>Category</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoryScroll}
              >
                {categories.map((cat) => (
                  <Button
                    key={cat}
                    mode={category === cat ? 'contained' : 'outlined'}
                    onPress={() => setCategory(cat)}
                    style={styles.categoryButton}
                    compact
                  >
                    {cat}
                  </Button>
                ))}
              </ScrollView>

              <TextInput
                label="Description"
                value={description}
                onChangeText={setDescription}
                mode="outlined"
                multiline
                numberOfLines={3}
                style={styles.input}
                left={<TextInput.Icon icon="text" />}
                placeholder="Tell customers about your shop..."
              />
            </Card.Content>
          </Card>

          {/* Rewards Settings Card */}
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.cardTitle}>
                🎁 Rewards Settings
              </Text>
              <Divider style={styles.divider} />

              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <TextInput
                    label="Points per Visit"
                    value={pointsPerVisit}
                    onChangeText={setPointsPerVisit}
                    mode="outlined"
                    keyboardType="numeric"
                    style={styles.input}
                    left={<TextInput.Icon icon="star" />}
                  />
                </View>
                <View style={styles.halfInput}>
                  <TextInput
                    label="Points for Reward"
                    value={rewardPoints}
                    onChangeText={setRewardPoints}
                    mode="outlined"
                    keyboardType="numeric"
                    style={styles.input}
                    left={<TextInput.Icon icon="gift" />}
                  />
                </View>
              </View>

              <TextInput
                label="Reward Description *"
                value={rewardDescription}
                onChangeText={setRewardDescription}
                mode="outlined"
                style={styles.input}
                left={<TextInput.Icon icon="gift-outline" />}
                placeholder="e.g., Free coffee, 20% off, etc."
              />

              <Card style={styles.previewCard}>
                <Card.Content style={styles.previewContent}>
                  <MaterialCommunityIcons name="information" size={20} color={sellerTheme.colors.primary} />
                  <Text variant="bodySmall" style={styles.previewText}>
                    Customers earn {pointsPerVisit} points per visit. After {rewardPoints} points, they get: {rewardDescription || 'your reward'}
                  </Text>
                </Card.Content>
              </Card>
            </Card.Content>
          </Card>

          {/* Subscription Card */}
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.cardTitle}>
                💎 Subscription Tier
              </Text>
              <Divider style={styles.divider} />

              <SegmentedButtons
                value={subscriptionTier}
                onValueChange={setSubscriptionTier}
                buttons={[
                  {
                    value: 'free',
                    label: 'Free',
                    icon: 'gift-outline',
                  },
                  {
                    value: 'pro',
                    label: 'Pro',
                    icon: 'star',
                  },
                ]}
              />

              <Card style={[styles.tierCard, subscriptionTier === 'free' && styles.tierCardActive]}>
                <Card.Content>
                  <Text variant="labelMedium" style={styles.tierTitle}>Free Tier</Text>
                  <Text variant="bodySmall" style={styles.tierDescription}>
                    • Up to 50 customers
                    • Basic QR codes
                    • Standard support
                  </Text>
                </Card.Content>
              </Card>

              <Card style={[styles.tierCard, subscriptionTier === 'pro' && styles.tierCardActive]}>
                <Card.Content>
                  <Text variant="labelMedium" style={styles.tierTitle}>Pro Tier</Text>
                  <Text variant="bodySmall" style={styles.tierDescription}>
                    • Unlimited customers
                    • Advanced QR codes
                    • AI insights
                    • Priority support
                  </Text>
                </Card.Content>
              </Card>
            </Card.Content>
          </Card>

          <Button
            mode="contained"
            onPress={handleSave}
            loading={saving}
            disabled={saving}
            style={styles.saveButton}
            contentStyle={styles.saveButtonContent}
            icon="content-save"
          >
            {isNewProfile ? 'Create Profile' : 'Save Changes'}
          </Button>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  cardTitle: {
    fontWeight: '600',
    marginBottom: 12,
  },
  divider: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  label: {
    marginBottom: 8,
  },
  categoryScroll: {
    marginBottom: 16,
  },
  categoryButton: {
    marginRight: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  previewCard: {
    elevation: 0,
  },
  previewContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  previewText: {
    flex: 1,
  },
  tierCard: {
    marginTop: 12,
    elevation: 0,
  },
  tierCardActive: {
    borderWidth: 2,
  },
  tierTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  tierDescription: {
  },
  saveButton: {
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 12,
  },
  saveButtonContent: {
    paddingVertical: 8,
  },
  bottomSpacer: {
    height: 80,
  },
});