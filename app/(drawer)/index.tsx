// app/(drawer)/index.tsx
import { Redirect } from 'expo-router';

export default function DrawerIndex() {
    // When the drawer route mounts, redirect into the tabs layout
    return <Redirect href="/(drawer)/(tabs)/dashboard" />;
}
