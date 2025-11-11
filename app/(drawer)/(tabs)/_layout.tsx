import { useTheme } from '@/hooks/use-theme-color';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { Tabs } from 'expo-router';
import React from 'react';
import { Dimensions, Image, TouchableOpacity } from 'react-native';
const { width } = Dimensions.get('window');
const LOGO_WIDTH = width * 0.4;

export default function SellerLayout() {
  const sellerTheme = useTheme();
  const navigation = useNavigation<any>(); // <— use `any` to silence openDrawer TS issue

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: sellerTheme.colors.primary,
        tabBarInactiveTintColor: sellerTheme.colors.secondaryContainer,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: sellerTheme.colors.outline,
          borderTopWidth: 1,
          paddingBottom: 20,
          paddingTop: 8,
          height: 80,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerStyle: {
          height: 120,
          backgroundColor: '#FFFFFF',
          elevation: 0, // Android shadow
          shadowOpacity: 0, // iOS shadow
          borderBottomWidth: 0, // Remove bottom border line
        },

        /** ---------- custom header ---------- */
        headerTitle: () => (
          <Image
            source={require('@/assets/images/logo.png')}
            style={{ width: LOGO_WIDTH, height: LOGO_WIDTH * 0.35 }}
          />
        ),

        headerLeft: () => (
          <TouchableOpacity
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            style={{ marginLeft: 16 }}
          >
            <Ionicons name="menu" size={26} color="#000" />
          </TouchableOpacity>
        ),

        headerRight: () => (
          <TouchableOpacity
            onPress={() => console.log('Notifications pressed')}
            style={{ marginRight: 16 }}
          >
            <Ionicons name="notifications-outline" size={24} color="#000" />
          </TouchableOpacity>
        ),
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="view-dashboard" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="generate-qr"
        options={{
          title: 'QR Codes',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="qrcode" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile-setup"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-cog" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ai-insights"
        options={{
          title: 'Insights',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="chart-line" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
