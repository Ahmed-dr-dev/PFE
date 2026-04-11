import { api } from '@/lib/api'
import { C, Card, Empty, ErrorBox, Loader, Screen, SectionTitle } from '@/components/ui'
import { useCallback, useEffect, useState } from 'react'
import { StyleSheet, Text } from 'react-native'

type Announcement = {
  id: string
  title: string
  content: string
  target_audience: string
  created_at: string
  created_by?: string | null
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function StudentAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setError('')
    try {
      const data = await api.get<{ announcements: Announcement[] }>('/api/announcements')
      setAnnouncements(data.announcements || [])
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
      <SectionTitle>Annonces ({announcements.length})</SectionTitle>
      {announcements.length === 0 ? <Empty message="Aucune annonce disponible" /> : (
        announcements.map((a) => (
          <Card key={a.id} style={sty.card}>
            <Text style={sty.title}>{a.title}</Text>
            <Text style={sty.date}>{fmtDate(a.created_at)}</Text>
            <Text style={sty.content}>{a.content}</Text>
          </Card>
        ))
      )}
    </Screen>
  )
}

const sty = StyleSheet.create({
  card: { gap: 6 },
  title: { fontSize: 15, fontWeight: '700', color: C.gray900 },
  date: { fontSize: 12, color: C.gray400 },
  content: { fontSize: 13, color: C.gray600, lineHeight: 20 },
})
