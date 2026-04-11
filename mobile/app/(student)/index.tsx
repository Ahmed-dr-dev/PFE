import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api'
import { Badge, Btn, C, Card, ErrorBox, Loader, Row, Screen, SectionTitle, StatCard } from '@/components/ui'
import { useCallback, useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

type PfeData = {
  project?: {
    id: string
    status: string
    topic?: { title: string | null } | null
    supervisor?: { full_name: string | null; email: string } | null
    app_validated?: boolean
    rapport_validated?: boolean
    soutenance_validated?: boolean
  } | null
}

type SupervisionData = {
  supervisor?: { full_name: string | null; email: string; department: string | null } | null
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: 'En attente', color: C.amber },
  approved: { label: 'Approuvé', color: C.emerald },
  in_progress: { label: 'En cours', color: C.cyan },
  completed: { label: 'Terminé', color: C.violet },
  rejected: { label: 'Rejeté', color: C.red },
}

export default function StudentHome() {
  const { user, signOut } = useAuth()
  const [pfe, setPfe] = useState<PfeData | null>(null)
  const [supervision, setSupervision] = useState<SupervisionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setError('')
    try {
      const [pfeData, supData] = await Promise.all([
        api.get<PfeData>('/api/student/my-pfe'),
        api.get<SupervisionData>('/api/student/supervision').catch(() => ({})),
      ])
      setPfe(pfeData)
      setSupervision(supData)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const proj = pfe?.project
  const status = proj?.status ? STATUS_MAP[proj.status] : null

  return (
    <Screen>
      <View style={s.greetWrap}>
        <Text style={s.greet}>Bonjour,</Text>
        <Text style={s.name}>{user?.full_name || 'Étudiant'} 👋</Text>
      </View>

      {error ? <ErrorBox message={error} /> : null}
      {loading ? <Loader /> : (
        <>
          {proj ? (
            <Card style={s.pfeCard}>
              <Row>
                <Text style={s.pfeLabel}>Mon PFE</Text>
                {status ? <Badge label={status.label} color={status.color} /> : null}
              </Row>
              <Text style={s.pfeTitle} numberOfLines={2}>{proj.topic?.title || 'Sujet non défini'}</Text>

              <Row style={s.validRow}>
                <View style={[s.checkDot, { backgroundColor: proj.app_validated ? C.emerald : C.gray200 }]} />
                <Text style={s.checkLabel}>Application {proj.app_validated ? 'validée' : 'non validée'}</Text>
              </Row>
              <Row style={s.validRow}>
                <View style={[s.checkDot, { backgroundColor: proj.rapport_validated ? C.emerald : C.gray200 }]} />
                <Text style={s.checkLabel}>Rapport {proj.rapport_validated ? 'validé' : 'non validé'}</Text>
              </Row>
              <Row style={s.validRow}>
                <View style={[s.checkDot, { backgroundColor: proj.soutenance_validated ? C.emerald : C.gray200 }]} />
                <Text style={s.checkLabel}>Soutenance {proj.soutenance_validated ? 'validée' : 'non validée'}</Text>
              </Row>
            </Card>
          ) : (
            <Card>
              <Text style={s.noPfe}>Aucun PFE assigné pour le moment.</Text>
            </Card>
          )}

          {supervision?.supervisor && (
            <Card style={s.supCard}>
              <Text style={s.supLabel}>Encadrant</Text>
              <Text style={s.supName}>{supervision.supervisor.full_name}</Text>
              <Text style={s.supEmail}>{supervision.supervisor.email}</Text>
              {supervision.supervisor.department ? (
                <Text style={s.supDept}>{supervision.supervisor.department}</Text>
              ) : null}
            </Card>
          )}
        </>
      )}

      <Card style={s.profileCard}>
        <Text style={s.profileName}>{user?.full_name}</Text>
        <Text style={s.profileEmail}>{user?.email}</Text>
      </Card>

      <Btn label="Se déconnecter" onPress={signOut} variant="ghost" />
    </Screen>
  )
}

const s = StyleSheet.create({
  greetWrap: { paddingVertical: 8 },
  greet: { fontSize: 14, color: C.gray500 },
  name: { fontSize: 22, fontWeight: '700', color: C.gray900 },
  pfeCard: { gap: 10 },
  pfeLabel: { fontSize: 12, fontWeight: '700', color: C.gray500, textTransform: 'uppercase', letterSpacing: 0.5, flex: 1 },
  pfeTitle: { fontSize: 16, fontWeight: '700', color: C.gray900 },
  validRow: { alignItems: 'center', gap: 8 },
  checkDot: { width: 10, height: 10, borderRadius: 5 },
  checkLabel: { fontSize: 13, color: C.gray600 },
  noPfe: { color: C.gray500, fontSize: 14, textAlign: 'center', paddingVertical: 8 },
  supCard: { gap: 4 },
  supLabel: { fontSize: 11, fontWeight: '700', color: C.gray400, textTransform: 'uppercase' },
  supName: { fontSize: 16, fontWeight: '700', color: C.gray900 },
  supEmail: { fontSize: 13, color: C.gray500 },
  supDept: { fontSize: 13, color: C.cyan, fontWeight: '600' },
  profileCard: { gap: 4 },
  profileName: { fontSize: 16, fontWeight: '700', color: C.gray900 },
  profileEmail: { fontSize: 13, color: C.gray500 },
})
