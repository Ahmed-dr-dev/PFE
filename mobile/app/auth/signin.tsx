import { useAuth } from '@/lib/auth-context'
import { Btn, C, ErrorBox, Input } from '@/components/ui'
import { Redirect } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Easing,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const LOGO = require('../../assets/isaeg.jpg')
const WIN_W = Dimensions.get('window').width
const LOGO_W = Math.min(WIN_W - 72, 260)

export default function SigninScreen() {
  const { user, loading: authLoading, signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const headerOpacity = useRef(new Animated.Value(0)).current
  const headerTranslate = useRef(new Animated.Value(24)).current
  const formOpacity = useRef(new Animated.Value(0)).current
  const formTranslate = useRef(new Animated.Value(20)).current
  const logoFloat = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(headerTranslate, {
        toValue: 0,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(formOpacity, {
        toValue: 1,
        duration: 650,
        delay: 120,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(formTranslate, {
        toValue: 0,
        duration: 650,
        delay: 120,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start()

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(logoFloat, {
          toValue: 1,
          duration: 2800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(logoFloat, {
          toValue: 0,
          duration: 2800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    )
    loop.start()
    return () => loop.stop()
  }, [headerOpacity, headerTranslate, formOpacity, formTranslate, logoFloat])

  const logoTranslateY = logoFloat.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -5],
  })

  if (authLoading) {
    return (
      <View style={s.boot}>
        <ActivityIndicator size="large" color={C.emerald} />
      </View>
    )
  }

  if (user) {
    return user.role === 'professor' ? <Redirect href="/(professor)" /> : <Redirect href="/(student)" />
  }

  const handleSignIn = async () => {
    setError('')
    if (!email.trim() || !password) {
      setError('Veuillez remplir tous les champs.')
      return
    }
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
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={s.keyboardOuter}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.scrollContent}
          bounces={false}
        >
          <View style={s.inner}>
            <View style={s.blobTop} pointerEvents="none" />
            <View style={s.blobBottom} pointerEvents="none" />

            <Animated.View
              style={[
                s.header,
                {
                  opacity: headerOpacity,
                  transform: [{ translateY: headerTranslate }],
                },
              ]}
            >
              <Animated.View
                style={[
                  s.logoWrap,
                  { width: LOGO_W + 40 },
                  { transform: [{ translateY: logoTranslateY }] },
                ]}
              >
                <Image
                  source={LOGO}
                  style={[s.logoImg, { width: LOGO_W }]}
                  resizeMode="contain"
                  accessibilityLabel="Logo ISAEG"
                />
              </Animated.View>
              <Text style={s.brandName}>Plateforme PFE</Text>
              <Text style={s.title}>Connexion</Text>
              <Text style={s.subtitle}>Espace enseignant et étudiant</Text>
            </Animated.View>

            <Animated.View
              style={[
                s.form,
                {
                  opacity: formOpacity,
                  transform: [{ translateY: formTranslate }],
                },
              ]}
            >
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
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  boot: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: C.gray50,
  },
  safe: {
    flex: 1,
    backgroundColor: C.gray50,
  },
  keyboardOuter: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 24,
  },
  inner: {
    position: 'relative',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  blobTop: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: C.emeraldLight,
    opacity: 0.4,
  },
  blobBottom: {
    position: 'absolute',
    bottom: -60,
    left: -60,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#cffafe',
    opacity: 0.45,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    gap: 6,
    zIndex: 1,
  },
  logoWrap: {
    alignSelf: 'center',
    alignItems: 'center',
    backgroundColor: C.white,
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: C.gray100,
  },
  logoImg: {
    height: 72,
  },
  brandName: {
    fontSize: 13,
    fontWeight: '700',
    color: C.emerald,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  title: { fontSize: 24, fontWeight: '700', color: C.gray900 },
  subtitle: { fontSize: 14, color: C.gray500, textAlign: 'center', paddingHorizontal: 8 },
  form: { gap: 14, zIndex: 1 },
})
