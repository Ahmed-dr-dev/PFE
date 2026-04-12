import { api } from '@/lib/api'
import { Badge, Btn, C, Card, Divider, Empty, ErrorBox, Input, Loader, Row, Screen, SectionTitle } from '@/components/ui'
import { useCallback, useEffect, useState } from 'react'
import { StyleSheet, Text, TextInput, View } from 'react-native'

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
  pfe_project?: {
    student?: { full_name: string | null; email: string } | null
    topic?: { title: string | null } | null
    supervisor?: { full_name: string | null } | null
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

export default function JuryPresidentScreen() {
  const [defenses, setDefenses] = useState<Defense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [noteOpen, setNoteOpen] = useState<string | null>(null)
  const [noteVal, setNoteVal] = useState('')
  const [noteComment, setNoteComment] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  const load = useCallback(async () => {
    setError('')
    try {
      const data = await api.get<{ defenses: Defense[] }>('/api/professor/jury-defenses')
      setDefenses(data.defenses || [])
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const openNoteForm = (defense: Defense) => {
    setNoteOpen(defense.id)
    setNoteVal(defense.note !== null && defense.note !== undefined ? String(defense.note) : '')
    setNoteComment(defense.note_comment || '')
    setSaveError('')
  }

  const submitNote = async (defenseId: string) => {
    setSaveError('')
    const n = parseFloat(noteVal)
    if (isNaN(n) || n < 0 || n > 20) {
      setSaveError('Entrez une note entre 0 et 20.')
      return
    }
    setSaving(true)
    try {
      await api.patch(`/api/professor/defenses/${defenseId}`, {
        note: n,
        note_comment: noteComment.trim() || null,
      })
      setNoteOpen(null)
      await load()
    } catch (e: any) {
      setSaveError(e.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Loader />

  return (
    <Screen>
      {error ? <ErrorBox message={error} /> : null}
      <SectionTitle>Soutenances — Président du jury ({defenses.length})</SectionTitle>

      {defenses.length === 0 ? (
        <Empty message="Vous n'êtes président du jury pour aucune soutenance" />
      ) : (
        defenses.map((d) => {
          const student = d.pfe_project?.student
          const topic = d.pfe_project?.topic
          const isOpen = noteOpen === d.id
          const hasNote = d.note !== null && d.note !== undefined

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

              {/* Info */}
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

              {/* Jury members */}
              {(d.jury_members || []).length > 0 ? (
                <View style={sty.juryBox}>
                  {(d.jury_members || []).map((name, i) => (
                    <Text key={i} style={sty.juryMember}>
                      {i === 0 ? '👤 Encadrant' : i === 1 ? '📋 Rapporteur' : '🏅 Président'} — {name}
                    </Text>
                  ))}
                </View>
              ) : null}

              {/* Existing note */}
              {hasNote ? (
                <View style={sty.existingNote}>
                  <Text style={sty.existingNoteLabel}>Note attribuée :</Text>
                  <Text style={sty.existingNoteVal}>{d.note} / 20</Text>
                  {d.note_comment ? (
                    <Text style={sty.existingNoteComment}>{d.note_comment}</Text>
                  ) : null}
                </View>
              ) : null}

              {/* Note button */}
              <Btn
                label={hasNote ? 'Modifier la note' : 'Attribuer une note'}
                onPress={() => (isOpen ? setNoteOpen(null) : openNoteForm(d))}
                variant={hasNote ? 'secondary' : 'primary'}
                small
              />

              {/* Note form */}
              {isOpen && (
                <View style={sty.noteForm}>
                  <Divider />
                  {saveError ? <ErrorBox message={saveError} /> : null}

                  <View style={sty.noteInputRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={sty.noteInputLabel}>Note (0 – 20)</Text>
                      <TextInput
                        style={sty.noteInput}
                        value={noteVal}
                        onChangeText={setNoteVal}
                        keyboardType="decimal-pad"
                        placeholder="Ex: 14.5"
                        placeholderTextColor={C.gray400}
                      />
                    </View>
                  </View>

                  <View>
                    <Text style={sty.noteInputLabel}>Commentaire (optionnel)</Text>
                    <TextInput
                      style={sty.textarea}
                      value={noteComment}
                      onChangeText={setNoteComment}
                      multiline
                      numberOfLines={3}
                      placeholder="Appréciation..."
                      placeholderTextColor={C.gray400}
                      textAlignVertical="top"
                    />
                  </View>

                  <Btn
                    label={saving ? 'Enregistrement…' : 'Enregistrer la note'}
                    onPress={() => submitNote(d.id)}
                    loading={saving}
                  />
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
  card: { gap: 10 },
  studentName: { fontSize: 15, fontWeight: '700', color: C.gray900 },
  topicTitle: { fontSize: 12, color: C.gray500, marginTop: 2 },
  infoRow: { flexDirection: 'row', gap: 6 },
  infoLabel: { fontSize: 13, fontWeight: '600', color: C.gray600, width: 60 },
  infoVal: { fontSize: 13, color: C.gray900, flex: 1 },
  juryBox: { backgroundColor: C.gray100, borderRadius: 10, padding: 10, gap: 4 },
  juryMember: { fontSize: 12, color: C.gray600 },
  existingNote: {
    backgroundColor: C.emeraldLight, borderRadius: 10, padding: 12, gap: 4,
  },
  existingNoteLabel: { fontSize: 12, fontWeight: '600', color: C.emerald },
  existingNoteVal: { fontSize: 22, fontWeight: '800', color: C.emerald },
  existingNoteComment: { fontSize: 12, color: C.gray600, fontStyle: 'italic' },
  noteForm: { gap: 10 },
  noteInputRow: { flexDirection: 'row', gap: 10 },
  noteInputLabel: { fontSize: 13, fontWeight: '600', color: C.gray700, marginBottom: 4 },
  noteInput: {
    backgroundColor: C.gray100, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 10,
    fontSize: 20, fontWeight: '700', color: C.gray900,
    borderWidth: 1, borderColor: C.gray200,
  },
  textarea: {
    backgroundColor: C.gray100, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 10,
    fontSize: 14, color: C.gray900,
    borderWidth: 1, borderColor: C.gray200, minHeight: 80,
  },
})
