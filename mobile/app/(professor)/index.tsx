import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api'
import { Btn, C, Card, Loader, ErrorBox, Row, Screen, SectionTitle, StatCard } from '@/components/ui'
import { useCallback, useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

type Stats = {
  topics_count?: number
  students_count?: number
  pending_applications?: number
  meetings_count?: number
}

export default function ProfessorHome() {
  const { user, signOut } = useAuth()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setError('')
    try {
      const data = await api.get<Stats>('/api/professor/stats')
      setStats(data)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  return (
    <Screen>
      <View style={s.greetWrap}>
        <Text style={s.greet}>Bonjour,</Text>
        <Text style={s.name}>{user?.full_name || 'Enseignant'} 👋</Text>
      </View>

      {error ? <ErrorBox message={error} /> : null}
      {loading ? <Loader /> : (
        <>
          <SectionTitle>Statistiques</SectionTitle>
          <Row style={s.statsRow}>
            <StatCard label="Sujets proposés" value={stats?.topics_count ?? 0} color={C.emerald} />
            <StatCard label="Étudiants encadrés" value={stats?.students_count ?? 0} color={C.cyan} />
          </Row>
          <Row style={s.statsRow}>
            <StatCard label="Candidatures en attente" value={stats?.pending_applications ?? 0} color={C.amber} />
            <StatCard label="Réunions planifiées" value={stats?.meetings_count ?? 0} color={C.violet} />
          </Row>
        </>
      )}

      <Card style={s.profileCard}>
        <Text style={s.profileName}>{user?.full_name}</Text>
        <Text style={s.profileEmail}>{user?.email}</Text>
        {user?.department ? <Text style={s.profileDept}>{user.department}</Text> : null}
      </Card>

      <Btn label="Se déconnecter" onPress={signOut} variant="ghost" />
    </Screen>
  )
}

const s = StyleSheet.create({
  greetWrap: { paddingVertical: 8 },
  greet: { fontSize: 14, color: C.gray500 },
  name: { fontSize: 22, fontWeight: '700', color: C.gray900 },
  statsRow: { gap: 10 },
  profileCard: { gap: 4 },
  profileName: { fontSize: 16, fontWeight: '700', color: C.gray900 },
  profileEmail: { fontSize: 13, color: C.gray500 },
  profileDept: { fontSize: 13, color: C.emerald, fontWeight: '600' },
})
