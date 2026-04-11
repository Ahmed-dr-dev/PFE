import { api } from '@/lib/api'
import { Btn, C, Card, Empty, ErrorBox, Input, Loader, Row, Screen, SectionTitle } from '@/components/ui'
import { useCallback, useEffect, useState } from 'react'
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'

type Announcement = {
  id: string
  title: string
  content: string
  target_audience: string
  created_at: string
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function ProfAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [audience, setAudience] = useState<'students' | 'all'>('students')
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const load = useCallback(async () => {
    setError('')
    try {
      const data = await api.get<{ announcements: Announcement[] }>('/api/professor/announcements')
      setAnnouncements(data.announcements || [])
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const handleCreate = async () => {
    if (!title.trim() || !content.trim()) { setError('Titre et contenu requis.'); return }
    setSubmitting(true)
    setError('')
    try {
      await api.post('/api/professor/announcements', { title: title.trim(), content: content.trim(), target_audience: audience })
      setTitle(''); setContent(''); setShowForm(false)
      await load()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    setDeleting(id)
    try {
      await api.del(`/api/professor/announcements/${id}`)
      await load()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setDeleting(null)
    }
  }

  return (
    <Screen>
      {error ? <ErrorBox message={error} /> : null}

      <Row>
        <View style={{ flex: 1 }}>
          <SectionTitle>Mes annonces</SectionTitle>
        </View>
        <Btn label={showForm ? 'Annuler' : '+ Nouvelle'} onPress={() => setShowForm(!showForm)} variant="secondary" small />
      </Row>

      {showForm && (
        <Card>
          <Input label="Titre" value={title} onChangeText={setTitle} placeholder="Titre de l'annonce" />
          <View style={sty.inputWrap}>
            <Text style={sty.label}>Contenu</Text>
            <TextInput
              style={sty.textarea}
              value={content}
              onChangeText={setContent}
              multiline
              numberOfLines={4}
              placeholder="Contenu de l'annonce..."
              placeholderTextColor={C.gray400}
              textAlignVertical="top"
            />
          </View>
          <View style={sty.inputWrap}>
            <Text style={sty.label}>Audience</Text>
            <Row>
              <TouchableOpacity
                style={[sty.audienceBtn, audience === 'students' && sty.audienceBtnActive]}
                onPress={() => setAudience('students')}
              >
                <Text style={[sty.audienceTxt, audience === 'students' && sty.audienceTxtActive]}>Mes étudiants</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[sty.audienceBtn, audience === 'all' && sty.audienceBtnActive]}
                onPress={() => setAudience('all')}
              >
                <Text style={[sty.audienceTxt, audience === 'all' && sty.audienceTxtActive]}>Tous</Text>
              </TouchableOpacity>
            </Row>
          </View>
          <Btn label="Publier" onPress={handleCreate} loading={submitting} />
        </Card>
      )}

      {loading ? <Loader /> : announcements.length === 0 ? (
        <Empty message="Aucune annonce publiée" />
      ) : (
        announcements.map((a) => (
          <Card key={a.id} style={sty.card}>
            <Row>
              <View style={{ flex: 1 }}>
                <Text style={sty.annTitle}>{a.title}</Text>
                <Text style={sty.annDate}>{fmtDate(a.created_at)} · {a.target_audience === 'all' ? 'Tous' : 'Mes étudiants'}</Text>
              </View>
              <Btn
                label="Suppr."
                onPress={() => handleDelete(a.id)}
                variant="danger"
                small
                loading={deleting === a.id}
              />
            </Row>
            <Text style={sty.annContent}>{a.content}</Text>
          </Card>
        ))
      )}
    </Screen>
  )
}

const sty = StyleSheet.create({
  card: { gap: 8 },
  annTitle: { fontSize: 15, fontWeight: '700', color: C.gray900 },
  annDate: { fontSize: 12, color: C.gray500 },
  annContent: { fontSize: 13, color: C.gray600, lineHeight: 20 },
  inputWrap: { gap: 4 },
  label: { fontSize: 13, fontWeight: '600', color: C.gray700 },
  textarea: {
    backgroundColor: C.gray100,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: C.gray900,
    borderWidth: 1,
    borderColor: C.gray200,
    minHeight: 100,
  },
  audienceBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, backgroundColor: C.gray100, alignItems: 'center', borderWidth: 1, borderColor: C.gray200 },
  audienceBtnActive: { backgroundColor: C.emeraldLight, borderColor: C.emerald },
  audienceTxt: { fontSize: 13, fontWeight: '600', color: C.gray700 },
  audienceTxtActive: { color: C.emerald },
})
