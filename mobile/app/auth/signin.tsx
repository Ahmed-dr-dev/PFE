import { useAuth } from '@/lib/auth-context'
import { Btn, C, ErrorBox, Input, Screen } from '@/components/ui'
import { Redirect } from 'expo-router'
import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

export default function SigninScreen() {
  const { user, signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (user) {
    return user.role === 'professor' ? <Redirect href="/(professor)" /> : <Redirect href="/(student)" />
  }

  const handleSignIn = async () => {
    setError('')
    if (!email.trim() || !password) { setError('Veuillez remplir tous les champs.'); return }
    setLoading(true)
    try {
      await signIn(email.trim(), password)
    } catch (e: any) {
      setError(e.message || 'Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Screen scroll={false} style={s.container}>
      <View style={s.header}>
        <Text style={s.logo}>PFE</Text>
        <Text style={s.title}>Connexion</Text>
        <Text style={s.subtitle}>Espace enseignant &amp; étudiant</Text>
      </View>

      <View style={s.form}>
        {error ? <ErrorBox message={error} /> : null}
        <Input
          label="Email ou identifiant"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="votre@email.com"
        />
        <Input
          label="Mot de passe"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="••••••••"
        />
        <Btn label="Se connecter" onPress={handleSignIn} loading={loading} />
      </View>
    </Screen>
  )
}

const s = StyleSheet.create({
  container: { justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 32, gap: 6 },
  logo: { fontSize: 48, fontWeight: '900', color: C.emerald },
  title: { fontSize: 24, fontWeight: '700', color: C.gray900 },
  subtitle: { fontSize: 14, color: C.gray500 },
  form: { gap: 14 },
})
