import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: { backgroundColor: '#0a1628', borderTopColor: '#1a6fb5' },
        tabBarActiveTintColor: '#60a5fa',
        tabBarInactiveTintColor: '#64748b',
        headerStyle: { backgroundColor: '#0a1628' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'My Boats',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="boat" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="systems"
        options={{
          title: 'Systems',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="layers" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="assistant"
        options={{
          title: 'AI Assistant',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubble-ellipses" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="maintenance"
        options={{
          title: 'Maintenance',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="construct" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
