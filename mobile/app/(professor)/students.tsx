import { api } from '@/lib/api'
import { Badge, Btn, C, Card, Divider, Empty, ErrorBox, Loader, Row, Screen, SectionTitle } from '@/components/ui'
import { useCallback, useEffect, useState } from 'react'
import { StyleSheet, Text, TextInput, View } from 'react-native'

type Student = {
  id: string
  full_name: string | null
  email: string
  department: string | null
  year: string | null
  project?: {
    id: string
    status: string
    topic?: { title: string | null } | null
    app_validated?: boolean
    rapport_validated?: boolean
    soutenance_validated?: boolean
  } | null
}

function statusLabel(s: string) {
  const map: Record<string, string> = {
    pending: 'En attente',
    approved: 'Approuvé',
    rejected: 'Rejeté',
    in_progress: 'En cours',
    completed: 'Terminé',
  }
  return map[s] || s
}

function statusColor(s: string) {
  const map: Record<string, string> = {
    pending: C.amber,
    approved: C.emerald,
    in_progress: C.cyan,
    completed: C.violet,
    rejected: C.red,
  }
  return map[s] || C.gray400
}

export default function ProfStudents() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setError('')
    try {
      const data = await api.get<{ students: Student[] }>('/api/professor/students')
      setStudents(data.students || [])
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const filtered = students.filter((s) => {
    const q = search.toLowerCase()
    return !q || (s.full_name || '').toLowerCase().includes(q) || (s.email || '').toLowerCase().includes(q)
  })

  const toggleExpand = (id: string) => {
    setExpanded((prev) => (prev === id ? null : id))
    setNotes('')
  }

  const handleValidate = async (studentId: string, field: 'app_validated' | 'rapport_validated' | 'soutenance_validated', val: boolean) => {
    setSaving(true)
    try {
      await api.patch(`/api/professor/suivi/${studentId}`, { [field]: val })
      await load()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Screen>
      <SectionTitle>Mes étudiants ({students.length})</SectionTitle>
      {error ? <ErrorBox message={error} /> : null}
      <TextInput
        style={sty.search}
        placeholder="Rechercher..."
        placeholderTextColor={C.gray400}
        value={search}
        onChangeText={setSearch}
      />
      {loading ? <Loader /> : filtered.length === 0 ? (
        <Empty message="Aucun étudiant encadré" />
      ) : (
        filtered.map((st) => {
          const proj = st.project
          const isOpen = expanded === st.id
          return (
            <Card key={st.id} style={sty.card}>
              <Row>
                <View style={{ flex: 1 }}>
                  <Text style={sty.name}>{st.full_name || st.email}</Text>
                  <Text style={sty.email}>{st.email}</Text>
                  {(st.department || st.year) ? (
                    <Text style={sty.meta}>{[st.department, st.year].filter(Boolean).join(' · ')}</Text>
                  ) : null}
                  {proj?.topic?.title ? (
                    <Text style={sty.topic} numberOfLines={1}>{proj.topic.title}</Text>
                  ) : null}
                </View>
                {proj?.status ? (
                  <Badge label={statusLabel(proj.status)} color={statusColor(proj.status)} />
                ) : null}
              </Row>

              <Btn label={isOpen ? 'Fermer' : 'Voir suivi'} onPress={() => toggleExpand(st.id)} variant="secondary" small />

              {isOpen && proj && (
                <View style={sty.suivi}>
                  <Divider />
                  <Text style={sty.suiviTitle}>Validation soutenance</Text>
                  <Row>
                    <Btn
                      label={proj.app_validated ? '✓ App validée' : 'Valider App'}
                      onPress={() => handleValidate(st.id, 'app_validated', !proj.app_validated)}
                      variant={proj.app_validated ? 'primary' : 'secondary'}
                      small
                      loading={saving}
                    />
                    <Btn
                      label={proj.rapport_validated ? '✓ Rapport validé' : 'Valider Rapport'}
                      onPress={() => handleValidate(st.id, 'rapport_validated', !proj.rapport_validated)}
                      variant={proj.rapport_validated ? 'primary' : 'secondary'}
                      small
                      loading={saving}
                    />
                  </Row>
                  {proj.app_validated && proj.rapport_validated && (
                    <Btn
                      label={proj.soutenance_validated ? '✓ Soutenance validée' : 'Valider pour soutenance'}
                      onPress={() => handleValidate(st.id, 'soutenance_validated', !proj.soutenance_validated)}
                      variant={proj.soutenance_validated ? 'primary' : 'danger'}
                      loading={saving}
                    />
                  )}
                </View>
              )}
            </Card>
          )
        })
      )}
    </Screen>
  )
}

const sty = StyleSheet.create({
  search: {
    backgroundColor: C.white,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: C.gray900,
    borderWidth: 1,
    borderColor: C.gray200,
  },
  card: { gap: 10 },
  name: { fontSize: 15, fontWeight: '700', color: C.gray900 },
  email: { fontSize: 12, color: C.gray500 },
  meta: { fontSize: 12, color: C.gray400, marginTop: 2 },
  topic: { fontSize: 13, color: C.emerald, fontWeight: '600', marginTop: 4 },
  suivi: { gap: 10 },
  suiviTitle: { fontSize: 13, fontWeight: '700', color: C.gray700 },
})
