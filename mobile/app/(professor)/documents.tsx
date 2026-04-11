import { api } from '@/lib/api'
import { Badge, C, Card, Empty, ErrorBox, Loader, Row, Screen, SectionTitle } from '@/components/ui'
import { useCallback, useEffect, useState } from 'react'
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

type Doc = {
  id: string
  file_name: string
  file_url: string
  uploaded_at: string
  pfe_project_id: string | null
  uploader?: { full_name: string | null; role: string } | null
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function ProfDocuments() {
  const [docs, setDocs] = useState<Doc[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setError('')
    try {
      const data = await api.get<{ documents: Doc[] }>('/api/professor/documents?filter=all')
      setDocs(data.documents || [])
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const publicDocs = docs.filter((d) => !d.pfe_project_id)
  const studentDocs = docs.filter((d) => !!d.pfe_project_id && d.uploader?.role === 'student')
  const myDocs = docs.filter((d) => !!d.pfe_project_id && d.uploader?.role !== 'student')

  const DocCard = ({ doc }: { doc: Doc }) => (
    <Card style={sty.card}>
      <Row>
        <View style={{ flex: 1 }}>
          <Text style={sty.fileName} numberOfLines={1}>{doc.file_name}</Text>
          {doc.uploader?.full_name ? (
            <Text style={sty.meta}>Par {doc.uploader.full_name}</Text>
          ) : null}
          <Text style={sty.date}>{fmtDate(doc.uploaded_at)}</Text>
        </View>
        <TouchableOpacity onPress={() => Linking.openURL(doc.file_url)} style={sty.openBtn}>
          <Text style={sty.openTxt}>Ouvrir</Text>
        </TouchableOpacity>
      </Row>
      {!doc.pfe_project_id ? <Badge label="Public" color={C.cyan} /> : null}
      {doc.uploader?.role === 'student' ? <Badge label="Étudiant" color={C.violet} /> : null}
    </Card>
  )

  if (loading) return <Loader />

  return (
    <Screen>
      {error ? <ErrorBox message={error} /> : null}

      <SectionTitle>Documents publics ({publicDocs.length})</SectionTitle>
      {publicDocs.length === 0 ? <Empty message="Aucun document public" /> : publicDocs.map((d) => <DocCard key={d.id} doc={d} />)}

      <SectionTitle>Soumis par les étudiants ({studentDocs.length})</SectionTitle>
      {studentDocs.length === 0 ? <Empty message="Aucun document soumis" /> : studentDocs.map((d) => <DocCard key={d.id} doc={d} />)}

      <SectionTitle>Mes documents partagés ({myDocs.length})</SectionTitle>
      {myDocs.length === 0 ? <Empty message="Aucun document partagé" /> : myDocs.map((d) => <DocCard key={d.id} doc={d} />)}
    </Screen>
  )
}

const sty = StyleSheet.create({
  card: { gap: 8 },
  fileName: { fontSize: 14, fontWeight: '600', color: C.gray900 },
  meta: { fontSize: 12, color: C.gray500 },
  date: { fontSize: 12, color: C.gray400 },
  openBtn: { backgroundColor: C.emeraldLight, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, alignSelf: 'flex-start' },
  openTxt: { color: C.emerald, fontWeight: '700', fontSize: 13 },
})
