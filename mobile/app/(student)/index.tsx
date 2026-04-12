import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api'
import { Badge, Btn, C, Card, Divider, Empty, ErrorBox, Loader, Row, Screen, SectionTitle } from '@/components/ui'
import { useCallback, useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

type Milestone = { id: string; title: string; due_date: string | null; completed: boolean }

type PfeResponse = {
  pfe?: {
    id: string
    status: string
    supervisor_notes: string | null
    app_validated?: boolean
    rapport_validated?: boolean
    soutenance_validated?: boolean
    topic?: { title: string | null; description: string | null } | null
    supervisor?: { full_name: string | null } | null
  } | null
}

type Defense = {
  note: number | null
  note_comment: string | null
  status: string
}

type SupervisionData = { defense?: Defense | null }

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending:     { label: 'En attente',  color: C.amber },
  approved:    { label: 'Approuvé',    color: C.emerald },
  in_progress: { label: 'En cours',    color: C.cyan },
  completed:   { label: 'Terminé',     color: C.violet },
  rejected:    { label: 'Rejeté',      color: C.red },
}

function fmtDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function StudentPfe() {
  const { user, signOut } = useAuth()
  const [data, setData]         = useState<PfeResponse | null>(null)
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [defense, setDefense]   = useState<Defense | null>(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')

  const load = useCallback(async () => {
    setError('')
    try {
      const [pfeData, msData, supData] = await Promise.all([
        api.get<PfeResponse>('/api/student/my-pfe'),
        api.get<{ milestones: Milestone[] }>('/api/student/milestones').catch(() => ({ milestones: [] })),
        api.get<SupervisionData>('/api/student/supervision').catch(() => ({ defense: null })),
      ])
      setData(pfeData)
      setMilestones(msData.milestones || [])
      setDefense(supData.defense ?? null)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const proj = data?.pfe
  const status = proj?.status ? STATUS_MAP[proj.status] : null

  const validations = proj ? [
    { key: 'app',       label: 'Application', value: proj.app_validated },
    { key: 'rapport',   label: 'Rapport',     value: proj.rapport_validated },
    { key: 'soutenance',label: 'Soutenance',  value: proj.soutenance_validated },
  ] : []
  const doneCount = validations.filter(v => v.value).length
  const pct = validations.length ? doneCount / validations.length : 0

  if (loading) return <Loader />

  return (
    <Screen>
      {/* Greeting */}
      <View style={s.greetWrap}>
        <Text style={s.greet}>Bonjour,</Text>
        <Text style={s.name}>{user?.full_name || 'Étudiant'}</Text>
      </View>

      {error ? <ErrorBox message={error} /> : null}

      {!proj ? (
        <Empty message="Aucun PFE assigné pour le moment." />
      ) : (
        <>
          {/* Topic card */}
          <Card style={s.topicCard}>
            <Row>
              <Text style={s.topicLabel}>Mon sujet PFE</Text>
              {status ? <Badge label={status.label} color={status.color} /> : null}
            </Row>
            <Text style={s.topicTitle}>{proj.topic?.title || 'Sujet non défini'}</Text>
            {proj.topic?.description ? (
              <Text style={s.topicDesc} numberOfLines={3}>{proj.topic.description}</Text>
            ) : null}
            {proj.supervisor?.full_name ? (
              <Text style={s.supervisor}>Encadrant : {proj.supervisor.full_name}</Text>
            ) : null}
          </Card>

          {/* Progress */}
          <SectionTitle>Progression ({doneCount}/{validations.length})</SectionTitle>
          <Card style={s.progressCard}>
            <View style={s.bar}>
              <View style={[s.barFill, { width: `${pct * 100}%` as any }]} />
            </View>
            {validations.map(v => (
              <Row key={v.key} style={s.validRow}>
                <View style={[s.dot, { backgroundColor: v.value ? C.emerald : C.gray200 }]} />
                <Text style={[s.validLabel, v.value && s.validDone]}>
                  {v.label} {v.value ? '✓' : '—'}
                </Text>
              </Row>
            ))}
          </Card>

          {/* Supervisor notes */}
          {proj.supervisor_notes ? (
            <>
              <SectionTitle>Notes de l'encadrant</SectionTitle>
              <Card>
                <Text style={s.notes}>{proj.supervisor_notes}</Text>
              </Card>
            </>
          ) : null}

          {/* Milestones */}
          {milestones.length > 0 ? (
            <>
              <SectionTitle>Jalons</SectionTitle>
              {milestones.map(m => (
                <Card key={m.id} style={s.milestoneCard}>
                  <Row>
                    <View style={[s.dot, { backgroundColor: m.completed ? C.emerald : C.gray300 }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={s.milestoneTitle}>{m.title}</Text>
                      {m.due_date ? <Text style={s.milestoneDate}>Échéance : {fmtDate(m.due_date)}</Text> : null}
                    </View>
                    {m.completed ? <Badge label="Terminé" color={C.emerald} /> : null}
                  </Row>
                </Card>
              ))}
            </>
          ) : null}

          {/* Final note */}
          <SectionTitle>Note finale</SectionTitle>
          {defense?.note !== null && defense?.note !== undefined ? (
            <Card style={s.noteCard}>
              <Row style={s.noteRow}>
                <Text style={s.noteValue}>{defense.note}</Text>
                <Text style={s.noteDenom}> / 20</Text>
              </Row>
              {defense.note_comment ? (
                <Text style={s.noteComment}>"{defense.note_comment}"</Text>
              ) : null}
            </Card>
          ) : (
            <Card>
              <Text style={s.noNote}>
                {defense ? 'La note n\'a pas encore été attribuée.' : 'Aucune soutenance planifiée.'}
              </Text>
            </Card>
          )}
        </>
      )}

      <Divider />
      <Btn label="Se déconnecter" onPress={signOut} variant="ghost" />
    </Screen>
  )
}

const s = StyleSheet.create({
  greetWrap:      { paddingVertical: 4 },
  greet:          { fontSize: 13, color: C.gray500 },
  name:           { fontSize: 20, fontWeight: '700', color: C.gray900 },
  topicCard:      { gap: 8 },
  topicLabel:     { fontSize: 11, fontWeight: '700', color: C.gray400, textTransform: 'uppercase', flex: 1 },
  topicTitle:     { fontSize: 17, fontWeight: '700', color: C.gray900 },
  topicDesc:      { fontSize: 13, color: C.gray600, lineHeight: 20 },
  supervisor:     { fontSize: 13, color: C.cyan, fontWeight: '600' },
  progressCard:   { gap: 10 },
  bar:            { height: 8, backgroundColor: C.gray100, borderRadius: 4, overflow: 'hidden', marginBottom: 4 },
  barFill:        { height: 8, backgroundColor: C.emerald, borderRadius: 4 },
  validRow:       { alignItems: 'center', gap: 8 },
  dot:            { width: 10, height: 10, borderRadius: 5 },
  validLabel:     { fontSize: 13, color: C.gray500 },
  validDone:      { color: C.emerald, fontWeight: '600' },
  notes:          { fontSize: 13, color: C.gray700, lineHeight: 20, fontStyle: 'italic' },
  milestoneCard:  { paddingVertical: 10 },
  milestoneTitle: { fontSize: 14, fontWeight: '600', color: C.gray900 },
  milestoneDate:  { fontSize: 12, color: C.gray500 },
  noteCard:       { alignItems: 'center', paddingVertical: 20, gap: 8 },
  noteRow:        { alignItems: 'baseline' },
  noteValue:      { fontSize: 52, fontWeight: '800', color: C.emerald },
  noteDenom:      { fontSize: 22, fontWeight: '700', color: C.emerald },
  noteComment:    { fontSize: 13, color: C.gray600, fontStyle: 'italic', textAlign: 'center' },
  noNote:         { fontSize: 13, color: C.gray400, fontStyle: 'italic', textAlign: 'center', paddingVertical: 12 },
})
