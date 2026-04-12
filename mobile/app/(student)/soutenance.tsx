import { api } from '@/lib/api'
import { Badge, C, Card, Divider, Empty, ErrorBox, Loader, Screen, SectionTitle } from '@/components/ui'
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
  note_comment: string | null
}

type SupervisionData = {
  defense?: Defense | null
}

function fmtDate(d: string | null) {
  if (!d) return '—'
  return new Date(d + 'T00:00:00').toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

function statusColor(s: string) {
  return s === 'completed' ? C.emerald : s === 'cancelled' ? C.red : s === 'postponed' ? C.amber : C.cyan
}
function statusLabel(s: string) {
  const m: Record<string, string> = {
    scheduled: 'Planifiée', completed: 'Terminée',
    cancelled: 'Annulée', postponed: 'Reportée',
  }
  return m[s] || s
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.infoRow}>
      <Text style={s.infoLabel}>{label}</Text>
      <Text style={s.infoValue}>{value}</Text>
    </View>
  )
}

export default function StudentSoutenance() {
  const [data, setData]       = useState<SupervisionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  const load = useCallback(async () => {
    setError('')
    try {
      const res = await api.get<SupervisionData>('/api/student/supervision')
      setData(res)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  if (loading) return <Loader />

  const defense = data?.defense

  if (!defense) {
    return (
      <Screen>
        {error ? <ErrorBox message={error} /> : null}
        <Empty message="Aucune soutenance planifiée pour le moment." />
      </Screen>
    )
  }

  const jm: string[] = defense.jury_members || []
  const hasNote = defense.note !== null && defense.note !== undefined

  return (
    <Screen>
      {error ? <ErrorBox message={error} /> : null}

      {/* Status banner */}
      <Card style={[s.statusCard, { borderLeftColor: statusColor(defense.status), borderLeftWidth: 4 }]}>
        <View style={s.statusRow}>
          <Text style={s.statusTitle}>Ma soutenance</Text>
          <Badge label={statusLabel(defense.status)} color={statusColor(defense.status)} />
        </View>
      </Card>

      {/* Date / time / room */}
      <SectionTitle>Informations</SectionTitle>
      <Card style={s.infoCard}>
        <InfoRow label="📅  Date" value={fmtDate(defense.scheduled_date)} />
        {defense.scheduled_time ? (
          <>
            <Divider />
            <InfoRow label="🕐  Heure" value={defense.scheduled_time.slice(0, 5)} />
          </>
        ) : null}
        {defense.room ? (
          <>
            <Divider />
            <InfoRow label="📍  Salle" value={defense.room} />
          </>
        ) : null}
        {defense.duration_minutes ? (
          <>
            <Divider />
            <InfoRow label="⏱  Durée" value={`${defense.duration_minutes} minutes`} />
          </>
        ) : null}
      </Card>

      {/* Jury */}
      {jm.length > 0 ? (
        <>
          <SectionTitle>Jury</SectionTitle>
          <Card style={s.juryCard}>
            {jm[0] ? (
              <View style={s.juryRow}>
                <Text style={s.juryRole}>👤  Encadrant</Text>
                <Text style={s.juryName}>{jm[0]}</Text>
              </View>
            ) : null}
            {jm[1] ? (
              <>
                <Divider />
                <View style={s.juryRow}>
                  <Text style={[s.juryRole, { color: C.violet }]}>📋  Rapporteur</Text>
                  <Text style={s.juryName}>{jm[1]}</Text>
                </View>
              </>
            ) : null}
            {jm[2] ? (
              <>
                <Divider />
                <View style={s.juryRow}>
                  <Text style={[s.juryRole, { color: C.amber }]}>🏅  Président</Text>
                  <Text style={s.juryName}>{jm[2]}</Text>
                </View>
              </>
            ) : null}
          </Card>
        </>
      ) : null}

      {/* Note */}
      <SectionTitle>Note finale</SectionTitle>
      {hasNote ? (
        <Card style={s.noteCard}>
          <View style={s.noteBox}>
            <Text style={s.noteValue}>{defense.note}</Text>
            <Text style={s.noteDenom}> / 20</Text>
          </View>
          {defense.note_comment ? (
            <Text style={s.noteComment}>"{defense.note_comment}"</Text>
          ) : null}
        </Card>
      ) : (
        <Card>
          <Text style={s.noNote}>La note n'a pas encore été attribuée par le Président du jury.</Text>
        </Card>
      )}
    </Screen>
  )
}

const s = StyleSheet.create({
  statusCard:  { gap: 4 },
  statusRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusTitle: { fontSize: 16, fontWeight: '700', color: C.gray900 },
  infoCard:    { gap: 12 },
  infoRow:     { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoLabel:   { fontSize: 13, fontWeight: '600', color: C.gray600, width: 100 },
  infoValue:   { fontSize: 14, color: C.gray900, flex: 1, fontWeight: '500' },
  juryCard:    { gap: 12 },
  juryRow:     { gap: 2 },
  juryRole:    { fontSize: 11, fontWeight: '700', color: C.gray500, textTransform: 'uppercase' },
  juryName:    { fontSize: 15, fontWeight: '600', color: C.gray900 },
  noteCard:    { gap: 10, alignItems: 'center', paddingVertical: 20 },
  noteBox:     { flexDirection: 'row', alignItems: 'baseline' },
  noteValue:   { fontSize: 52, fontWeight: '800', color: C.emerald },
  noteDenom:   { fontSize: 22, fontWeight: '700', color: C.emerald },
  noteComment: { fontSize: 13, color: C.gray600, fontStyle: 'italic', textAlign: 'center' },
  noNote:      { fontSize: 13, color: C.gray400, fontStyle: 'italic', textAlign: 'center', paddingVertical: 12 },
})
