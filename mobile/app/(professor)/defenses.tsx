import { api } from '@/lib/api'
import { Badge, C, Card, Empty, ErrorBox, Loader, Row, Screen, SectionTitle } from '@/components/ui'
import { useCallback, useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

type Defense = {
  id: string
  scheduled_date: string | null
  scheduled_time: string | null
  room: string | null
  duration_minutes: number | null
  status: string
  jury_members: string[] | null
  note: number | null
  pfe_project?: {
    student?: { full_name: string | null; email: string } | null
    topic?: { title: string | null } | null
  } | null
}

function fmtDate(d: string | null) {
  if (!d) return '—'
  return new Date(d + 'T00:00:00').toLocaleDateString('fr-FR', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  })
}

function statusColor(s: string) {
  return s === 'completed' ? C.emerald : s === 'cancelled' ? C.red : C.cyan
}
function statusLabel(s: string) {
  return s === 'completed' ? 'Terminée' : s === 'cancelled' ? 'Annulée' : 'Planifiée'
}

export default function ProfDefenses() {
  const [defenses, setDefenses] = useState<Defense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setError('')
    try {
      const data = await api.get<{ defenses: Defense[] }>('/api/professor/defenses')
      setDefenses(data.defenses || [])
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  if (loading) return <Loader />

  return (
    <Screen>
      {error ? <ErrorBox message={error} /> : null}
      <SectionTitle>Mes soutenances ({defenses.length})</SectionTitle>

      {defenses.length === 0 ? (
        <Empty message="Aucune soutenance planifiée pour vos étudiants" />
      ) : (
        defenses.map((d) => {
          const student = d.pfe_project?.student
          const topic = d.pfe_project?.topic
          return (
            <Card key={d.id} style={sty.card}>
              <Row>
                <View style={{ flex: 1 }}>
                  <Text style={sty.studentName}>
                    {student?.full_name || student?.email || 'Étudiant'}
                  </Text>
                  {topic?.title ? (
                    <Text style={sty.topicTitle} numberOfLines={2}>{topic.title}</Text>
                  ) : null}
                </View>
                <Badge label={statusLabel(d.status)} color={statusColor(d.status)} />
              </Row>

              <View style={sty.infoRow}>
                <Text style={sty.infoLabel}>Date :</Text>
                <Text style={sty.infoVal}>{fmtDate(d.scheduled_date)}</Text>
              </View>
              {d.scheduled_time ? (
                <View style={sty.infoRow}>
                  <Text style={sty.infoLabel}>Heure :</Text>
                  <Text style={sty.infoVal}>{d.scheduled_time.slice(0, 5)}</Text>
                </View>
              ) : null}
              {d.room ? (
                <View style={sty.infoRow}>
                  <Text style={sty.infoLabel}>Salle :</Text>
                  <Text style={sty.infoVal}>{d.room}</Text>
                </View>
              ) : null}
              {d.duration_minutes ? (
                <View style={sty.infoRow}>
                  <Text style={sty.infoLabel}>Durée :</Text>
                  <Text style={sty.infoVal}>{d.duration_minutes} min</Text>
                </View>
              ) : null}

              {/* Jury */}
              {(d.jury_members || []).length > 0 ? (
                <View style={sty.juryBox}>
                  <Text style={sty.juryTitle}>Jury :</Text>
                  {(d.jury_members || []).map((name, i) => (
                    <Text key={i} style={sty.juryMember}>
                      {i === 0 ? '👤 Encadrant' : i === 1 ? '📋 Rapporteur' : '🏅 Président'} — {name}
                    </Text>
                  ))}
                </View>
              ) : null}

              {d.note !== null && d.note !== undefined ? (
                <View style={sty.noteBox}>
                  <Text style={sty.noteLabel}>Note finale :</Text>
                  <Text style={sty.noteVal}>{d.note} / 20</Text>
                </View>
              ) : null}
            </Card>
          )
        })
      )}
    </Screen>
  )
}

const sty = StyleSheet.create({
  card: { gap: 8 },
  studentName: { fontSize: 15, fontWeight: '700', color: C.gray900 },
  topicTitle: { fontSize: 12, color: C.gray500, marginTop: 2 },
  infoRow: { flexDirection: 'row', gap: 6 },
  infoLabel: { fontSize: 13, fontWeight: '600', color: C.gray600, width: 60 },
  infoVal: { fontSize: 13, color: C.gray900, flex: 1 },
  juryBox: { backgroundColor: C.gray100, borderRadius: 10, padding: 10, gap: 4 },
  juryTitle: { fontSize: 12, fontWeight: '700', color: C.gray700, marginBottom: 2 },
  juryMember: { fontSize: 12, color: C.gray600 },
  noteBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: C.emeraldLight, borderRadius: 10, padding: 10,
  },
  noteLabel: { fontSize: 13, fontWeight: '600', color: C.emerald },
  noteVal: { fontSize: 18, fontWeight: '800', color: C.emerald },
})
