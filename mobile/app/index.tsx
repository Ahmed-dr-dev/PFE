import { useAuth } from '@/lib/auth-context'
import { Redirect } from 'expo-router'
import { ActivityIndicator, View } from 'react-native'
import { C } from '@/components/ui'

export default function Index() {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.gray50 }}>
        <ActivityIndicator size="large" color={C.emerald} />
      </View>
    )
  }
  if (!user) return <Redirect href="/auth/signin" />
  if (user.role === 'professor') return <Redirect href="/(professor)" />
  return <Redirect href="/(student)" />
}
