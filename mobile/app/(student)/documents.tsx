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
  uploaded_by: string | null
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function StudentDocuments() {
  const [myDocs, setMyDocs] = useState<Doc[]>([])
  const [profDocs, setProfDocs] = useState<Doc[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setError('')
    try {
      const data = await api.get<{ documents: Doc[] }>('/api/student/documents')
      const docs = data.documents || []
      // Separate own uploads vs professor shared docs
      setMyDocs(docs.filter((d) => d.pfe_project_id))
      setProfDocs([]) // public docs not in student API — show only own
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const DocCard = ({ doc }: { doc: Doc }) => (
    <Card style={sty.card}>
      <Row>
        <View style={{ flex: 1 }}>
          <Text style={sty.fileName} numberOfLines={1}>{doc.file_name}</Text>
          <Text style={sty.date}>{fmtDate(doc.uploaded_at)}</Text>
        </View>
        <TouchableOpacity onPress={() => Linking.openURL(doc.file_url)} style={sty.openBtn}>
          <Text style={sty.openTxt}>Ouvrir</Text>
        </TouchableOpacity>
      </Row>
    </Card>
  )

  if (loading) return <Loader />

  return (
    <Screen>
      {error ? <ErrorBox message={error} /> : null}
      <SectionTitle>Mes documents ({myDocs.length})</SectionTitle>
      {myDocs.length === 0 ? <Empty message="Aucun document soumis" /> : myDocs.map((d) => <DocCard key={d.id} doc={d} />)}
    </Screen>
  )
}

const sty = StyleSheet.create({
  card: { gap: 6 },
  fileName: { fontSize: 14, fontWeight: '600', color: C.gray900 },
  date: { fontSize: 12, color: C.gray400 },
  openBtn: { backgroundColor: '#cffafe', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, alignSelf: 'flex-start' },
  openTxt: { color: C.cyan, fontWeight: '700', fontSize: 13 },
})
