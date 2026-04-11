import { api } from '@/lib/api'
import { Badge, Btn, C, Card, Empty, ErrorBox, Loader, Row, Screen, SectionTitle } from '@/components/ui'
import { useCallback, useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

type Meeting = {
  id: string
  title: string | null
  scheduled_at: string | null
  location: string | null
  status: string
  student?: { full_name: string | null; email: string } | null
}

type Proposal = {
  id: string
  proposed_date: string
  proposed_time: string | null
  status: string
  student_notes: string | null
  professor_notes: string | null
  student?: { full_name: string | null } | null
}

function fmtDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function proposalColor(s: string) {
  return s === 'accepted' ? C.emerald : s === 'rejected' ? C.red : s === 'counter_proposed' ? C.amber : C.gray400
}
function proposalLabel(s: string) {
  return s === 'accepted' ? 'Accepté' : s === 'rejected' ? 'Refusé' : s === 'counter_proposed' ? 'Contre-prop.' : 'En attente'
}

export default function ProfMeetings() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [acting, setActing] = useState<string | null>(null)

  const load = useCallback(async () => {
    setError('')
    try {
      const [mRes, pRes] = await Promise.all([
        api.get<{ meetings: Meeting[] }>('/api/professor/meetings'),
        api.get<{ proposals: Proposal[] }>('/api/professor/meeting-proposals'),
      ])
      setMeetings(mRes.meetings || [])
      setProposals(pRes.proposals || [])
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const respond = async (id: string, action: 'accept' | 'reject') => {
    setActing(id)
    try {
      await api.patch(`/api/professor/meeting-proposals/${id}`, { action })
      await load()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setActing(null)
    }
  }

  if (loading) return <Loader />

  return (
    <Screen>
      {error ? <ErrorBox message={error} /> : null}

      <SectionTitle>Demandes en attente ({proposals.filter(p => p.status === 'pending').length})</SectionTitle>
      {proposals.filter(p => p.status === 'pending').length === 0 ? (
        <Empty message="Aucune demande en attente" />
      ) : (
        proposals.filter(p => p.status === 'pending').map((p) => (
          <Card key={p.id} style={sty.card}>
            <Text style={sty.name}>{p.student?.full_name || 'Étudiant'}</Text>
            <Text style={sty.date}>{fmtDate(p.proposed_date)}{p.proposed_time ? ` à ${p.proposed_time.slice(0, 5)}` : ''}</Text>
            {p.student_notes ? <Text style={sty.notes}>{p.student_notes}</Text> : null}
            <Row>
              <Btn label="Accepter" onPress={() => respond(p.id, 'accept')} small loading={acting === p.id} />
              <Btn label="Refuser" onPress={() => respond(p.id, 'reject')} variant="danger" small loading={acting === p.id} />
            </Row>
          </Card>
        ))
      )}

      <SectionTitle>Réunions planifiées ({meetings.length})</SectionTitle>
      {meetings.length === 0 ? <Empty message="Aucune réunion planifiée" /> : (
        meetings.map((m) => (
          <Card key={m.id} style={sty.card}>
            <Row>
              <View style={{ flex: 1 }}>
                <Text style={sty.name}>{m.title || 'Réunion'}</Text>
                <Text style={sty.date}>{fmtDate(m.scheduled_at)}</Text>
                {m.student?.full_name ? <Text style={sty.meta}>Étudiant : {m.student.full_name}</Text> : null}
                {m.location ? <Text style={sty.meta}>{m.location}</Text> : null}
              </View>
              <Badge label={m.status === 'scheduled' ? 'Planifiée' : m.status} color={m.status === 'scheduled' ? C.emerald : C.gray400} />
            </Row>
          </Card>
        ))
      )}
    </Screen>
  )
}

const sty = StyleSheet.create({
  card: { gap: 8 },
  name: { fontSize: 15, fontWeight: '700', color: C.gray900 },
  date: { fontSize: 13, color: C.emerald, fontWeight: '600' },
  notes: { fontSize: 12, color: C.gray500, fontStyle: 'italic' },
  meta: { fontSize: 12, color: C.gray500 },
})
