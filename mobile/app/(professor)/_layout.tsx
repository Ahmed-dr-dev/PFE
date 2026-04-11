import { useAuth } from '@/lib/auth-context'
import { C } from '@/components/ui'
import { Ionicons } from '@expo/vector-icons'
import { Redirect, Tabs } from 'expo-router'

export default function ProfessorLayout() {
  const { user } = useAuth()
  if (!user || user.role !== 'professor') return <Redirect href="/auth/signin" />

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: C.emerald,
        tabBarInactiveTintColor: C.gray400,
        tabBarStyle: { borderTopColor: C.gray200 },
        headerStyle: { backgroundColor: C.white },
        headerTitleStyle: { fontWeight: '700', color: C.gray900 },
        headerTintColor: C.emerald,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Tableau de bord',
          tabBarLabel: 'Accueil',
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="students"
        options={{
          title: 'Mes étudiants',
          tabBarLabel: 'Étudiants',
          tabBarIcon: ({ color, size }) => <Ionicons name="people-outline" size={size} color={color} />,
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
        name="documents"
        options={{
          title: 'Documents',
          tabBarLabel: 'Documents',
          tabBarIcon: ({ color, size }) => <Ionicons name="document-outline" size={size} color={color} />,
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
