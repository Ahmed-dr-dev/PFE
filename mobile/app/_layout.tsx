'use client'
import { AuthProvider, useAuth } from '@/lib/auth-context'
import { Redirect, Slot, Stack } from 'expo-router'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { ActivityIndicator, View } from 'react-native'
import { C } from '@/components/ui'

function RootGuard() {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={C.emerald} />
      </View>
    )
  }
  if (!user) return <Redirect href="/auth/signin" />
  if (user.role === 'professor') return <Redirect href="/(professor)" />
  if (user.role === 'student') return <Redirect href="/(student)" />
  return <Redirect href="/auth/signin" />
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="auth/signin" />
            <Stack.Screen name="(professor)" />
            <Stack.Screen name="(student)" />
          </Stack>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
