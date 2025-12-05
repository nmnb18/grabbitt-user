/**
 * Grabbitt Seller App Theme
 * Consolidated theme system for the seller app
 */

import { Platform } from "react-native";
import { MD3LightTheme as DefaultTheme } from "react-native-paper";

// Grabbitt Brand Colors
const grabbittPrimary = "#e91e63"; // Deep Pink
const grabbittSecondary = "#ff6b35"; // Orange
const grabbittAccent = "#9CA3AF"; // Light Gray

export const Colors = {
  light: {
    // Brand colors
    primary: grabbittPrimary,
    secondary: grabbittSecondary,
    accent: grabbittAccent,
    teritary: '#ef3555',

    // UI colors (adjusted for dark mode)
    text: "#FFFFFF",
    background: "#151718",
    tint: "#FFFFFF",
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: "#FFFFFF",

    // Surface colors
    surface: "#1E293B",
    surfaceVariant: "#334155",
    outline: "#475569",

    // Status colors
    error: "#EF4444",
    success: "#10B981",
    warning: "#F59E0B",

    // React Native Paper specific
    onPrimary: "#FFFFFF",
    onSecondary: "#FFFFFF",
    onBackground: "#FFFFFF",
    onSurface: "#FFFFFF",
    surfaceDisabled: "#334155",
    onSurfaceDisabled: "#9BA1A6",
  },
  dark: {
    // Brand colors (same for dark mode)
    primary: grabbittPrimary,
    secondary: grabbittSecondary,
    accent: grabbittAccent,
    teritary: '#ef3555',

    // UI colors (adjusted for dark mode)
    text: "#FFFFFF",
    background: "#151718",
    tint: "#FFFFFF",
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: "#FFFFFF",

    // Surface colors
    surface: "#1E293B",
    surfaceVariant: "#334155",
    outline: "#475569",

    // Status colors
    error: "#EF4444",
    success: "#10B981",
    warning: "#F59E0B",

    // React Native Paper specific
    onPrimary: "#FFFFFF",
    onSecondary: "#FFFFFF",
    onBackground: "#FFFFFF",
    onSurface: "#FFFFFF",
    surfaceDisabled: "#334155",
    onSurfaceDisabled: "#9BA1A6",
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "Inter",
    heading: "Poppins",
  },
  android: {
    sans: "Inter",
    heading: "Poppins",
  },
  default: {
    sans: "Inter",
    heading: "Poppins",
  },
  web: {
    sans: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    heading:
      "Poppins, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  },
});

// React Native Paper Theme
export const LightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.light.primary,
    primaryContainer: Colors.light.primary,
    secondary: Colors.light.secondary,
    secondaryContainer: Colors.light.secondary,
    tertiary: Colors.light.teritary,
    accent: Colors.light.accent,
    background: Colors.light.background,
    surface: Colors.light.surface,
    surfaceVariant: Colors.light.surfaceVariant,
    onPrimary: Colors.light.onPrimary,
    onSecondary: Colors.light.onSecondary,
    onBackground: Colors.light.onBackground,
    onSurface: Colors.light.onSurface,
    error: Colors.light.error,
    warning: Colors.light.warning,
    success: Colors.light.success,
    outline: Colors.light.outline,
    surfaceDisabled: Colors.light.surfaceDisabled,
    onSurfaceDisabled: Colors.light.onSurfaceDisabled,
    text: Colors.light.text
  },
  roundness: 12,
  fonts: {
    ...DefaultTheme.fonts,
    titleLarge: {
      ...DefaultTheme.fonts.titleLarge,
      fontFamily: Fonts.heading,
    },
    titleMedium: {
      ...DefaultTheme.fonts.titleMedium,
      fontFamily: Fonts.heading,
    },
    titleSmall: {
      ...DefaultTheme.fonts.titleSmall,
      fontFamily: Fonts.heading,
    },
    bodyLarge: {
      ...DefaultTheme.fonts.bodyLarge,
      fontFamily: Fonts.sans,
    },
    bodyMedium: {
      ...DefaultTheme.fonts.bodyMedium,
      fontFamily: Fonts.sans,
    },
    bodySmall: {
      ...DefaultTheme.fonts.bodySmall,
      fontFamily: Fonts.sans,
    },
    labelLarge: {
      ...DefaultTheme.fonts.labelLarge,
      fontFamily: Fonts.sans,
    },
    labelMedium: {
      ...DefaultTheme.fonts.labelMedium,
      fontFamily: Fonts.sans,
    },
    labelSmall: {
      ...DefaultTheme.fonts.labelSmall,
      fontFamily: Fonts.sans,
    },
  },
};

export const DarkTheme = {
  ...LightTheme,
  colors: {
    ...LightTheme.colors,
    primary: Colors.dark.primary,
    primaryContainer: Colors.dark.primary,
    secondary: Colors.dark.secondary,
    secondaryContainer: Colors.dark.secondary,
    tertiary: Colors.dark.teritary,
    accent: Colors.dark.accent,
    background: Colors.dark.background,
    surface: Colors.dark.surface,
    surfaceVariant: Colors.dark.surfaceVariant,
    onPrimary: Colors.dark.onPrimary,
    onSecondary: Colors.dark.onSecondary,
    onBackground: Colors.dark.onBackground,
    onSurface: Colors.dark.onSurface,
    outline: Colors.dark.outline,
    surfaceDisabled: Colors.dark.surfaceDisabled,
    onSurfaceDisabled: Colors.dark.onSurfaceDisabled,
    text: Colors.dark.text
  },
};

// App-specific styles
export const AppStyles = {
  // Gradients
  gradients: {
    primary: [Colors.light.primary, Colors.light.secondary] as [string, string],
    secondary: [Colors.light.secondary, Colors.light.primary] as [
      string,
      string
    ],
    accent: [Colors.light.accent, "#6B7280"] as [string, string],
    headerLight: ["#FAFAF5", "#F2F4F7"] as [string, string],   // Light mode header
    headerDark: ["#1F2937", "#111827"] as [string, string],
  },

  // Spacing scale
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 60,
  },

  // Card styles
  card: {
    elevation: 2,
    borderRadius: 12,
    backgroundColor: Colors.light.surface,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.outline,
  },

  // Shadow styles
  shadows: {
    small: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    medium: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 4,
    },
  },

  // Typography (optional - you can use ThemedText component instead)
  typography: {
    heading: {
      fontFamily: Fonts.heading,
      fontSize: 24,
      fontWeight: "600" as const,
      color: Colors.light.text,
      lineHeight: 32,
    },
    subheading: {
      fontFamily: Fonts.heading,
      fontSize: 18,
      fontWeight: "600" as const,
      color: Colors.light.text,
      lineHeight: 28,
    },
    body: {
      fontFamily: Fonts.sans,
      fontSize: 16,
      fontWeight: "400" as const,
      color: Colors.light.text,
      lineHeight: 24,
    },
  },
  colors: {
    ...Colors,
  },
};
