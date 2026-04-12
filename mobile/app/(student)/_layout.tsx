import { useAuth } from '@/lib/auth-context'
import { C } from '@/components/ui'
import { Ionicons } from '@expo/vector-icons'
import { Redirect, Tabs } from 'expo-router'

export default function StudentLayout() {
  const { user } = useAuth()
  if (!user || user.role !== 'student') return <Redirect href="/auth/signin" />

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: C.cyan,
        tabBarInactiveTintColor: C.gray400,
        tabBarStyle: { borderTopColor: C.gray200 },
        headerStyle: { backgroundColor: C.white },
        headerTitleStyle: { fontWeight: '700', color: C.gray900 },
        headerTintColor: C.cyan,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Mon PFE',
          tabBarLabel: 'Mon PFE',
          tabBarIcon: ({ color, size }) => <Ionicons name="school-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="encadrant"
        options={{
          title: 'Mon encadrant',
          tabBarLabel: 'Encadrant',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="soutenance"
        options={{
          title: 'Ma soutenance',
          tabBarLabel: 'Soutenance',
          tabBarIcon: ({ color, size }) => <Ionicons name="ribbon-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="meetings"
        options={{
          title: 'Réunions',
          tabBarLabel: 'Réunions',
          tabBarIcon: ({ color, size }) => <Ionicons name="calendar-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="announcements"
        options={{
          title: 'Annonces',
          tabBarLabel: 'Annonces',
          tabBarIcon: ({ color, size }) => <Ionicons name="megaphone-outline" size={size} color={color} />,
        }}
      />
    </Tabs>
  )
}
