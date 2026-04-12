import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api'
import { Btn, C, Card, Divider, ErrorBox, Loader, Row, Screen, SectionTitle, StatCard } from '@/components/ui'
import { useCallback, useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

type Stats = {
  topicsProposed?: number
  studentsSupervised?: number
  pendingApplications?: number
}

export default function ProfessorProfile() {
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
      {/* Profile card */}
      <Card style={s.profileCard}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>
            {(user?.full_name || user?.email || '?')[0].toUpperCase()}
          </Text>
        </View>
        <Text style={s.name}>{user?.full_name || 'Enseignant'}</Text>
        <Text style={s.email}>{user?.email}</Text>
        {user?.department ? <Text style={s.dept}>{user.department}</Text> : null}
      </Card>

      <Divider />

      <SectionTitle>Statistiques</SectionTitle>
      {error ? <ErrorBox message={error} /> : null}
      {loading ? <Loader /> : (
        <Row style={s.statsRow}>
          <StatCard label="Sujets proposés" value={stats?.topicsProposed ?? 0} color={C.emerald} />
          <StatCard label="Étudiants encadrés" value={stats?.studentsSupervised ?? 0} color={C.cyan} />
          <StatCard label="Candidatures en attente" value={stats?.pendingApplications ?? 0} color={C.amber} />
        </Row>
      )}

      <Btn label="Se déconnecter" onPress={signOut} variant="ghost" />
    </Screen>
  )
}

const s = StyleSheet.create({
  profileCard: { alignItems: 'center', gap: 6, paddingVertical: 24 },
  avatar: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: C.emeraldLight,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 8,
  },
  avatarText: { fontSize: 28, fontWeight: '800', color: C.emerald },
  name: { fontSize: 20, fontWeight: '700', color: C.gray900 },
  email: { fontSize: 13, color: C.gray500 },
  dept: { fontSize: 13, color: C.emerald, fontWeight: '600' },
  statsRow: { flexWrap: 'wrap', gap: 10 },
})
