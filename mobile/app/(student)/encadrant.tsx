import { api } from '@/lib/api'
import { C, Card, Divider, Empty, ErrorBox, Loader, Row, Screen, SectionTitle } from '@/components/ui'
import { useCallback, useEffect, useState } from 'react'
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

type Supervisor = {
  id: string
  full_name: string | null
  email: string
  phone: string | null
  department: string | null
  office: string | null
  office_hours: string | null
  bio: string | null
  expertise: string | null
}

type SupervisionData = {
  supervisor?: Supervisor | null
  pfeStatus?: string | null
}

function InfoRow({ icon, label, value, onPress }: {
  icon: string; label: string; value: string; onPress?: () => void
}) {
  return (
    <View style={s.infoRow}>
      <Text style={s.infoIcon}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={s.infoLabel}>{label}</Text>
        {onPress ? (
          <TouchableOpacity onPress={onPress}>
            <Text style={[s.infoValue, s.link]}>{value}</Text>
          </TouchableOpacity>
        ) : (
          <Text style={s.infoValue}>{value}</Text>
        )}
      </View>
    </View>
  )
}

export default function StudentEncadrant() {
  const [data, setData]     = useState<SupervisionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState('')

  const load = useCallback(async () => {
    setError('')
    try {
      const res = await api.get<SupervisionData>('/api/student/supervision')
      setData(res)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  if (loading) return <Loader />

  const sup = data?.supervisor

  if (!sup) {
    return (
      <Screen>
        {error ? <ErrorBox message={error} /> : null}
        <Empty message="Aucun encadrant assigné pour le moment." />
      </Screen>
    )
  }

  return (
    <Screen>
      {error ? <ErrorBox message={error} /> : null}

      {/* Avatar + name */}
      <Card style={s.profileCard}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>
            {(sup.full_name || sup.email)[0].toUpperCase()}
          </Text>
        </View>
        <Text style={s.name}>{sup.full_name || 'Encadrant'}</Text>
        {sup.department ? <Text style={s.dept}>{sup.department}</Text> : null}
      </Card>

      <SectionTitle>Coordonnées</SectionTitle>
      <Card style={s.infoCard}>
        <InfoRow
          icon="✉️"
          label="Email"
          value={sup.email}
          onPress={() => Linking.openURL(`mailto:${sup.email}`)}
        />
        {sup.phone ? (
          <>
            <Divider />
            <InfoRow
              icon="📞"
              label="Téléphone"
              value={sup.phone}
              onPress={() => Linking.openURL(`tel:${sup.phone}`)}
            />
          </>
        ) : null}
        {sup.office ? (
          <>
            <Divider />
            <InfoRow icon="📍" label="Bureau" value={sup.office} />
          </>
        ) : null}
        {sup.office_hours ? (
          <>
            <Divider />
            <InfoRow icon="🕐" label="Heures de présence" value={sup.office_hours} />
          </>
        ) : null}
      </Card>

      {sup.expertise ? (
        <>
          <SectionTitle>Expertise</SectionTitle>
          <Card>
            <Text style={s.bioText}>{sup.expertise}</Text>
          </Card>
        </>
      ) : null}

      {sup.bio ? (
        <>
          <SectionTitle>Biographie</SectionTitle>
          <Card>
            <Text style={s.bioText}>{sup.bio}</Text>
          </Card>
        </>
      ) : null}
    </Screen>
  )
}

const s = StyleSheet.create({
  profileCard: { alignItems: 'center', gap: 6, paddingVertical: 20 },
  avatar: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#cffafe', // cyan-100
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 8,
  },
  avatarText: { fontSize: 28, fontWeight: '800', color: C.cyan },
  name: { fontSize: 20, fontWeight: '700', color: C.gray900 },
  dept: { fontSize: 13, color: C.cyan, fontWeight: '600' },
  infoCard: { gap: 12 },
  infoRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  infoIcon: { fontSize: 18, width: 26, textAlign: 'center' },
  infoLabel: { fontSize: 11, fontWeight: '700', color: C.gray400, textTransform: 'uppercase', marginBottom: 2 },
  infoValue: { fontSize: 14, color: C.gray900, fontWeight: '500' },
  link: { color: C.cyan, textDecorationLine: 'underline' },
  bioText: { fontSize: 13, color: C.gray700, lineHeight: 21 },
})
