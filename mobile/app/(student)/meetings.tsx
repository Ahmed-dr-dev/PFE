import { api } from '@/lib/api'
import { Badge, Btn, C, Card, Empty, ErrorBox, Input, Loader, Row, Screen, SectionTitle } from '@/components/ui'
import { useCallback, useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

type Meeting = {
  id: string
  title: string | null
  scheduled_at: string | null
  location: string | null
  status: string
}

type Proposal = {
  id: string
  proposed_date: string
  proposed_time: string | null
  status: string
  student_notes: string | null
  professor_notes: string | null
  counter_date: string | null
  counter_time: string | null
}

function fmtDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

const PROPOSAL_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: 'En attente', color: '#d97706' },
  accepted: { label: 'Acceptée', color: '#059669' },
  rejected: { label: 'Refusée', color: '#dc2626' },
  counter_proposed: { label: 'Contre-proposition', color: '#0891b2' },
}

const today = new Date().toISOString().split('T')[0]

export default function StudentMeetings() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [propDate, setPropDate] = useState('')
  const [propTime, setPropTime] = useState('')
  const [propNotes, setPropNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  const load = useCallback(async () => {
    setError('')
    try {
      const [mRes, pRes] = await Promise.all([
        api.get<{ meetings: Meeting[] }>('/api/student/meetings'),
        api.get<{ proposals: Proposal[] }>('/api/student/meeting-proposals'),
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

  const handlePropose = async () => {
    setFormError('')
    if (!propDate) { setFormError('La date est requise.'); return }
    if (propDate < today) { setFormError('La date ne peut pas être dans le passé.'); return }
    setSubmitting(true)
    try {
      await api.post('/api/student/meeting-proposals', {
        proposed_date: propDate,
        proposed_time: propTime || null,
        student_notes: propNotes.trim() || null,
      })
      setPropDate(''); setPropTime(''); setPropNotes(''); setShowForm(false)
      await load()
    } catch (e: any) {
      setFormError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <Loader />

  return (
    <Screen>
      {error ? <ErrorBox message={error} /> : null}

      <Row>
        <View style={{ flex: 1 }}>
          <SectionTitle>Mes demandes</SectionTitle>
        </View>
        <Btn label={showForm ? 'Annuler' : '+ Proposer'} onPress={() => { setShowForm(!showForm); setFormError('') }} variant="secondary" small />
      </Row>

      {showForm && (
        <Card style={sty.formCard}>
          {formError ? <ErrorBox message={formError} /> : null}
          <Input
            label="Date (AAAA-MM-JJ)"
            value={propDate}
            onChangeText={setPropDate}
            placeholder={today}
            keyboardType="numeric"
          />
          <Input
            label="Heure (optionnel, HH:MM)"
            value={propTime}
            onChangeText={setPropTime}
            placeholder="09:00"
            keyboardType="numeric"
          />
          <Input
            label="Note pour l'encadrant (optionnel)"
            value={propNotes}
            onChangeText={setPropNotes}
            placeholder="Précisions..."
          />
          <Btn label="Envoyer la demande" onPress={handlePropose} loading={submitting} />
        </Card>
      )}

      {proposals.length === 0 ? <Empty message="Aucune demande de réunion" /> : (
        proposals.map((p) => {
          const s = PROPOSAL_MAP[p.status] || { label: p.status, color: C.gray400 }
          return (
            <Card key={p.id} style={sty.card}>
              <Row>
                <View style={{ flex: 1 }}>
                  <Text style={sty.date}>{fmtDate(p.proposed_date)}{p.proposed_time ? ` à ${p.proposed_time.slice(0, 5)}` : ''}</Text>
                  {p.student_notes ? <Text style={sty.notes}>"{p.student_notes}"</Text> : null}
                </View>
                <Badge label={s.label} color={s.color} />
              </Row>
              {p.status === 'counter_proposed' && p.counter_date ? (
                <View style={sty.counterBox}>
                  <Text style={sty.counterLabel}>Contre-proposition encadrant :</Text>
                  <Text style={sty.counterDate}>{fmtDate(p.counter_date)}{p.counter_time ? ` à ${p.counter_time.slice(0, 5)}` : ''}</Text>
                  {p.professor_notes ? <Text style={sty.notes}>{p.professor_notes}</Text> : null}
                </View>
              ) : null}
            </Card>
          )
        })
      )}

      <SectionTitle>Réunions confirmées ({meetings.length})</SectionTitle>
      {meetings.length === 0 ? <Empty message="Aucune réunion confirmée" /> : (
        meetings.map((m) => (
          <Card key={m.id} style={sty.card}>
            <Text style={sty.meetTitle}>{m.title || 'Réunion'}</Text>
            <Text style={sty.date}>{fmtDate(m.scheduled_at)}</Text>
            {m.location ? <Text style={sty.notes}>{m.location}</Text> : null}
          </Card>
        ))
      )}
    </Screen>
  )
}

const sty = StyleSheet.create({
  formCard: { gap: 12 },
  card: { gap: 6 },
  date: { fontSize: 14, fontWeight: '700', color: C.gray900 },
  notes: { fontSize: 12, color: C.gray500, fontStyle: 'italic' },
  meetTitle: { fontSize: 15, fontWeight: '700', color: C.gray900 },
  counterBox: { backgroundColor: C.gray50, borderRadius: 8, padding: 10, gap: 4, borderWidth: 1, borderColor: C.gray200 },
  counterLabel: { fontSize: 11, fontWeight: '700', color: C.gray500, textTransform: 'uppercase' },
  counterDate: { fontSize: 14, fontWeight: '700', color: C.cyan },
})
