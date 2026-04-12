import { api } from '@/lib/api'
import { Badge, C, Card, Empty, ErrorBox, Loader, Row, Screen, SectionTitle } from '@/components/ui'
import { useCallback, useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

type Request = {
  id: string
  status: string
  message: string | null
  suggested_topic_title: string | null
  created_at: string
  student?: { full_name: string | null; email: string; department: string | null; year: string | null } | null
  topic?: { title: string | null } | null
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function statusColor(s: string) {
  const m: Record<string, string> = {
    pending: C.amber,
    accepted: C.emerald,
    rejected: C.red,
  }
  return m[s] || C.gray400
}
function statusLabel(s: string) {
  const m: Record<string, string> = {
    pending: 'En attente',
    accepted: 'Acceptée',
    rejected: 'Refusée',
  }
  return m[s] || s
}

export default function ProfRequests() {
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setError('')
    try {
      const data = await api.get<{ requests: Request[] }>('/api/professor/supervision-requests')
      setRequests(data.requests || [])
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const pending = requests.filter((r) => r.status === 'pending')
  const others = requests.filter((r) => r.status !== 'pending')

  if (loading) return <Loader />

  return (
    <Screen>
      {error ? <ErrorBox message={error} /> : null}

      <SectionTitle>En attente ({pending.length})</SectionTitle>
      {pending.length === 0 ? (
        <Empty message="Aucune demande en attente" />
      ) : (
        pending.map((r) => <RequestCard key={r.id} req={r} />)
      )}

      {others.length > 0 ? (
        <>
          <SectionTitle>Historique ({others.length})</SectionTitle>
          {others.map((r) => <RequestCard key={r.id} req={r} muted />)}
        </>
      ) : null}
    </Screen>
  )
}

function RequestCard({ req, muted = false }: { req: Request; muted?: boolean }) {
  const st = req.student
  const topicTitle = req.topic?.title || req.suggested_topic_title
  return (
    <Card style={[sty.card, muted && sty.muted]}>
      <Row>
        <View style={{ flex: 1 }}>
          <Text style={sty.name}>{st?.full_name || st?.email || 'Étudiant'}</Text>
          <Text style={sty.meta}>
            {[st?.department, st?.year].filter(Boolean).join(' · ') || st?.email}
          </Text>
        </View>
        <Badge label={statusLabel(req.status)} color={statusColor(req.status)} />
      </Row>

      {topicTitle ? (
        <View style={sty.topicRow}>
          <Text style={sty.topicLabel}>Sujet :</Text>
          <Text style={sty.topicVal} numberOfLines={2}>{topicTitle}</Text>
        </View>
      ) : null}

      {req.message ? (
        <Text style={sty.message} numberOfLines={3}>"{req.message}"</Text>
      ) : null}

      <Text style={sty.date}>{fmtDate(req.created_at)}</Text>
    </Card>
  )
}

const sty = StyleSheet.create({
  card: { gap: 8 },
  muted: { opacity: 0.65 },
  name: { fontSize: 15, fontWeight: '700', color: C.gray900 },
  meta: { fontSize: 12, color: C.gray500 },
  topicRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  topicLabel: { fontSize: 13, fontWeight: '600', color: C.gray600 },
  topicVal: { fontSize: 13, color: C.gray900, flex: 1 },
  message: { fontSize: 13, color: C.gray500, fontStyle: 'italic' },
  date: { fontSize: 11, color: C.gray400, textAlign: 'right' },
})
