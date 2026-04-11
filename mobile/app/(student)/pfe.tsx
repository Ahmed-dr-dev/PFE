import { api } from '@/lib/api'
import { Badge, C, Card, Empty, ErrorBox, Loader, Row, Screen, SectionTitle } from '@/components/ui'
import { useCallback, useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

type Milestone = {
  id: string
  title: string
  due_date: string | null
  completed: boolean
}

type PfeDetail = {
  project?: {
    id: string
    status: string
    supervisor_notes: string | null
    topic?: { title: string | null; description: string | null } | null
    supervisor?: { full_name: string | null } | null
    app_validated?: boolean
    rapport_validated?: boolean
    soutenance_validated?: boolean
    soutenance_validated_at?: string | null
  } | null
  milestones?: Milestone[]
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: 'En attente', color: '#d97706' },
  approved: { label: 'Approuvé', color: '#059669' },
  in_progress: { label: 'En cours', color: '#0891b2' },
  completed: { label: 'Terminé', color: '#7c3aed' },
  rejected: { label: 'Rejeté', color: '#dc2626' },
}

function fmtDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function StudentPfe() {
  const [data, setData] = useState<PfeDetail | null>(null)
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setError('')
    try {
      const [pfeData, msData] = await Promise.all([
        api.get<PfeDetail>('/api/student/my-pfe'),
        api.get<{ milestones: Milestone[] }>('/api/student/milestones').catch(() => ({ milestones: [] })),
      ])
      setData(pfeData)
      setMilestones(msData.milestones || [])
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const proj = data?.project
  const status = proj?.status ? STATUS_MAP[proj.status] : null

  if (loading) return <Loader />

  if (!proj) {
    return (
      <Screen>
        <Empty message="Aucun PFE assigné pour le moment." />
      </Screen>
    )
  }

  const validations = [
    { key: 'app_validated', label: "Application", value: proj.app_validated },
    { key: 'rapport_validated', label: "Rapport", value: proj.rapport_validated },
    { key: 'soutenance_validated', label: "Soutenance", value: proj.soutenance_validated },
  ]

  const doneCount = validations.filter(v => v.value).length
  const progress = doneCount / validations.length

  return (
    <Screen>
      {error ? <ErrorBox message={error} /> : null}

      <Card style={sty.topCard}>
        <Row>
          <Text style={sty.topLabel}>Sujet</Text>
          {status ? <Badge label={status.label} color={status.color} /> : null}
        </Row>
        <Text style={sty.topTitle}>{proj.topic?.title || 'Sans titre'}</Text>
        {proj.topic?.description ? (
          <Text style={sty.topDesc}>{proj.topic.description}</Text>
        ) : null}
        {proj.supervisor?.full_name ? (
          <Text style={sty.supName}>Encadrant : {proj.supervisor.full_name}</Text>
        ) : null}
      </Card>

      <SectionTitle>Progression</SectionTitle>
      <Card>
        <View style={sty.progressBar}>
          <View style={[sty.progressFill, { width: `${progress * 100}%` as any }]} />
        </View>
        <Text style={sty.progressLabel}>{doneCount}/{validations.length} étapes validées</Text>
        {validations.map((v) => (
          <Row key={v.key} style={sty.validRow}>
            <View style={[sty.dot, { backgroundColor: v.value ? C.emerald : C.gray200 }]} />
            <Text style={sty.validLabel}>{v.label} {v.value ? '✓' : '—'}</Text>
          </Row>
        ))}
        {proj.soutenance_validated && proj.soutenance_validated_at ? (
          <Text style={sty.soutenanceDate}>Validé le {fmtDate(proj.soutenance_validated_at)}</Text>
        ) : null}
      </Card>

      {proj.supervisor_notes ? (
        <>
          <SectionTitle>Notes de l'encadrant</SectionTitle>
          <Card>
            <Text style={sty.notes}>{proj.supervisor_notes}</Text>
          </Card>
        </>
      ) : null}

      {milestones.length > 0 && (
        <>
          <SectionTitle>Jalons</SectionTitle>
          {milestones.map((m) => (
            <Card key={m.id} style={sty.milestoneCard}>
              <Row>
                <View style={[sty.dot, { backgroundColor: m.completed ? C.emerald : C.gray300 }]} />
                <View style={{ flex: 1 }}>
                  <Text style={sty.milestoneTitle}>{m.title}</Text>
                  {m.due_date ? <Text style={sty.milestoneDate}>Échéance : {fmtDate(m.due_date)}</Text> : null}
                </View>
                {m.completed && <Badge label="Terminé" color={C.emerald} />}
              </Row>
            </Card>
          ))}
        </>
      )}
    </Screen>
  )
}

const sty = StyleSheet.create({
  topCard: { gap: 8 },
  topLabel: { fontSize: 11, fontWeight: '700', color: C.gray400, textTransform: 'uppercase', flex: 1 },
  topTitle: { fontSize: 17, fontWeight: '700', color: C.gray900 },
  topDesc: { fontSize: 13, color: C.gray600, lineHeight: 20 },
  supName: { fontSize: 13, color: C.cyan, fontWeight: '600' },
  progressBar: { height: 8, backgroundColor: C.gray100, borderRadius: 4, marginBottom: 8, overflow: 'hidden' },
  progressFill: { height: 8, backgroundColor: C.emerald, borderRadius: 4 },
  progressLabel: { fontSize: 12, color: C.gray500, marginBottom: 8 },
  validRow: { alignItems: 'center', gap: 8, marginBottom: 4 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  validLabel: { fontSize: 13, color: C.gray700 },
  soutenanceDate: { fontSize: 12, color: C.emerald, fontWeight: '600', marginTop: 6 },
  notes: { fontSize: 13, color: C.gray700, lineHeight: 20, fontStyle: 'italic' },
  milestoneCard: { paddingVertical: 10 },
  milestoneTitle: { fontSize: 14, fontWeight: '600', color: C.gray900 },
  milestoneDate: { fontSize: 12, color: C.gray500 },
})
