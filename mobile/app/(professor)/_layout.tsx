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
          title: 'Mon profil',
          tabBarLabel: 'Profil',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-circle-outline" size={size} color={color} />,
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
        name="defenses"
        options={{
          title: 'Mes soutenances',
          tabBarLabel: 'Soutenances',
          tabBarIcon: ({ color, size }) => <Ionicons name="school-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="requests"
        options={{
          title: "Demandes d'encadrement",
          tabBarLabel: 'Encadrement',
          tabBarIcon: ({ color, size }) => <Ionicons name="mail-open-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="jury"
        options={{
          title: 'Jury — Président',
          tabBarLabel: 'Jury',
          tabBarIcon: ({ color, size }) => <Ionicons name="ribbon-outline" size={size} color={color} />,
        }}
      />
    </Tabs>
  )
}
