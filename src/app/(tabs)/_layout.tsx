import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useColorScheme, type ColorValue } from 'react-native';

import { palette } from '@/constants/palette';

type IoniconName = keyof typeof Ionicons.glyphMap;

function tabIcon(focusedName: IoniconName, name: IoniconName) {
  return function TabIcon({ color, size, focused }: { color: ColorValue; size: number; focused: boolean }) {
    return <Ionicons name={focused ? focusedName : name} size={size} color={color} />;
  };
}

export default function TabsLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colorScheme === 'dark' ? palette.brand[400] : palette.brand[600],
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Map', tabBarIcon: tabIcon('map', 'map-outline') }}
      />
      <Tabs.Screen
        name="dogs"
        options={{ title: 'Dogs', tabBarIcon: tabIcon('paw', 'paw-outline') }}
      />
      <Tabs.Screen
        name="add"
        options={{ title: 'Add Dog', tabBarIcon: tabIcon('add-circle', 'add-circle-outline') }}
      />
      <Tabs.Screen
        name="alerts"
        options={{ title: 'Alerts', tabBarIcon: tabIcon('notifications', 'notifications-outline') }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile', tabBarIcon: tabIcon('person', 'person-outline') }}
      />
    </Tabs>
  );
}
