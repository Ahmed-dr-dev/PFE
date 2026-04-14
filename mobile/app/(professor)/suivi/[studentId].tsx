import { api } from '@/lib/api'
import { Badge, Btn, C, Card, Divider, Empty, ErrorBox, Loader, Row, Screen, SectionTitle } from '@/components/ui'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

type SuiviData = {
  student?: {
    id: string
    full_name: string | null
    email: string
    department: string | null
    year: string | null
  } | null
  project?: {
    id: string
    status: string
    supervisor_notes: string | null
    app_validated: boolean
    rapport_validated: boolean
    soutenance_validated: boolean
    topic?: { title: string | null; description: string | null } | null
  } | null
  documents?: {
    id: string
    category: string | null
    file_name: string
    uploaded_at: string
  }[]
  missingDocs?: string[]
}

const DOC_STRUCTURE = [
  'Cahier des charges',
  'CHP01', 'CHP02', 'CHP03', 'CHP04',
  'Conclusion', 'Bibliographie', 'Annexes', 'Présentation',
]

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending:     { label: 'En attente',  color: C.amber },
  approved:    { label: 'Approuvé',    color: C.emerald },
  in_progress: { label: 'En cours',    color: C.cyan },
  completed:   { label: 'Terminé',     color: C.violet },
  rejected:    { label: 'Rejeté',      color: C.red },
}

export default function ProfSuiviDetail() {
  const { studentId } = useLocalSearchParams<{ studentId: string }>()
  const router = useRouter()
  const [data, setData]     = useState<SuiviData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState('')
  const [saving, setSaving] = useState(false)
  const [saveErr, setSaveErr] = useState('')

  const load = useCallback(async () => {
    setError('')
    try {
      const res = await api.get<SuiviData>(`/api/professor/suivi/${studentId}`)
      setData(res)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [studentId])

  useEffect(() => { void load() }, [load])

  const handleValidate = async (
    field: 'app_validated' | 'rapport_validated' | 'soutenance_validated',
    val: boolean
  ) => {
    setSaving(true)
    setSaveErr('')
    try {
      await api.patch(`/api/professor/suivi/${studentId}`, { [field]: val })
      await load()
    } catch (e: any) {
      setSaveErr(e.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Loader />

  const proj   = data?.project
  const student = data?.student
  const docs   = data?.documents || []
  const status = proj?.status ? STATUS_MAP[proj.status] : null

  const uploadedTitles = new Set(docs.map(d => d.category || ''))
  const missingDocs = DOC_STRUCTURE.filter(t => !uploadedTitles.has(t))
  const allDocsUploaded = missingDocs.length === 0

  return (
    <Screen>
      <Btn label="← Retour" onPress={() => router.back()} variant="ghost" small />

      {error ? <ErrorBox message={error} /> : null}
      {saveErr ? <ErrorBox message={saveErr} /> : null}

      {/* Student info */}
      {student ? (
        <Card style={sty.studentCard}>
          <Row>
            <View style={{ flex: 1 }}>
              <Text style={sty.studentName}>{student.full_name || student.email}</Text>
              <Text style={sty.studentEmail}>{student.email}</Text>
              {(student.department || student.year) ? (
                <Text style={sty.studentMeta}>
                  {[student.department, student.year].filter(Boolean).join(' · ')}
                </Text>
              ) : null}
            </View>
            {status ? <Badge label={status.label} color={status.color} /> : null}
          </Row>
          {proj?.topic?.title ? (
            <Text style={sty.topicTitle}>{proj.topic.title}</Text>
          ) : null}
        </Card>
      ) : null}

      {!proj ? (
        <Empty message="Aucun projet trouvé pour cet étudiant." />
      ) : (
        <>
          {/* Validation section */}
          <SectionTitle>Validation</SectionTitle>
          <Card style={sty.validCard}>

            {/* App */}
            <Row style={sty.validRow}>
              <View style={[sty.dot, { backgroundColor: proj.app_validated ? C.emerald : C.gray200 }]} />
              <View style={{ flex: 1 }}>
                <Text style={sty.validLabel}>Application</Text>
              </View>
              <Btn
                label={proj.app_validated ? '✓ Validée' : 'Valider'}
                onPress={() => handleValidate('app_validated', !proj.app_validated)}
                variant={proj.app_validated ? 'primary' : 'secondary'}
                small
                loading={saving}
                disabled={proj.soutenance_validated}
              />
            </Row>

            <Divider />

            {/* Rapport */}
            <Row style={sty.validRow}>
              <View style={[sty.dot, { backgroundColor: proj.rapport_validated ? C.emerald : C.gray200 }]} />
              <View style={{ flex: 1 }}>
                <Text style={sty.validLabel}>Rapport</Text>
                {!allDocsUploaded && !proj.rapport_validated ? (
                  <Text style={sty.missingHint}>{missingDocs.length} doc(s) manquant(s)</Text>
                ) : null}
              </View>
              <Btn
                label={proj.rapport_validated ? '✓ Validé' : 'Valider'}
                onPress={() => handleValidate('rapport_validated', !proj.rapport_validated)}
                variant={proj.rapport_validated ? 'primary' : 'secondary'}
                small
                loading={saving}
                disabled={proj.soutenance_validated || !proj.app_validated || !allDocsUploaded}
              />
            </Row>

            <Divider />

            {/* Soutenance */}
            <Row style={sty.validRow}>
              <View style={[sty.dot, { backgroundColor: proj.soutenance_validated ? C.emerald : C.gray200 }]} />
              <View style={{ flex: 1 }}>
                <Text style={sty.validLabel}>Soutenance</Text>
              </View>
              <Btn
                label={proj.soutenance_validated ? '✓ Validée' : 'Valider'}
                onPress={() => handleValidate('soutenance_validated', !proj.soutenance_validated)}
                variant={proj.soutenance_validated ? 'primary' : 'danger'}
                small
                loading={saving}
                disabled={!proj.app_validated || !proj.rapport_validated}
              />
            </Row>
          </Card>

          {/* Missing docs warning */}
          {!allDocsUploaded ? (
            <Card style={sty.warnCard}>
              <Text style={sty.warnTitle}>Documents manquants ({missingDocs.length})</Text>
              {missingDocs.map(d => (
                <Text key={d} style={sty.warnItem}>✗  {d}</Text>
              ))}
            </Card>
          ) : null}

          {/* Documents submitted */}
          <SectionTitle>Documents déposés ({docs.length})</SectionTitle>
          {docs.length === 0 ? (
            <Empty message="Aucun document déposé" />
          ) : (
            docs.map(d => (
              <Card key={d.id} style={sty.docCard}>
                <Text style={sty.docCategory}>{d.category || '—'}</Text>
                <Text style={sty.docName} numberOfLines={1}>{d.file_name}</Text>
                <Text style={sty.docDate}>
                  {new Date(d.uploaded_at).toLocaleDateString('fr-FR', {
                    day: '2-digit', month: 'short', year: 'numeric',
                  })}
                </Text>
              </Card>
            ))
          )}

          {/* Supervisor notes */}
          {proj.supervisor_notes ? (
            <>
              <SectionTitle>Mes notes</SectionTitle>
              <Card>
                <Text style={sty.notes}>{proj.supervisor_notes}</Text>
              </Card>
            </>
          ) : null}
        </>
      )}
    </Screen>
  )
}

const sty = StyleSheet.create({
  studentCard:  { gap: 8 },
  studentName:  { fontSize: 16, fontWeight: '700', color: C.gray900 },
  studentEmail: { fontSize: 12, color: C.gray500 },
  studentMeta:  { fontSize: 12, color: C.gray400 },
  topicTitle:   { fontSize: 13, color: C.emerald, fontWeight: '600' },
  validCard:    { gap: 14 },
  validRow:     { alignItems: 'center', gap: 10 },
  dot:          { width: 10, height: 10, borderRadius: 5 },
  validLabel:   { fontSize: 14, fontWeight: '600', color: C.gray900 },
  missingHint:  { fontSize: 11, color: C.red, marginTop: 2 },
  warnCard:     { backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca', gap: 6 },
  warnTitle:    { fontSize: 13, fontWeight: '700', color: C.red },
  warnItem:     { fontSize: 12, color: C.red },
  docCard:      { gap: 4, paddingVertical: 10 },
  docCategory:  { fontSize: 11, fontWeight: '700', color: C.gray400, textTransform: 'uppercase' },
  docName:      { fontSize: 13, fontWeight: '600', color: C.gray900 },
  docDate:      { fontSize: 11, color: C.gray400 },
  notes:        { fontSize: 13, color: C.gray700, fontStyle: 'italic', lineHeight: 20 },
})
