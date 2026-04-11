import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'

// ─── Colors ───────────────────────────────────────────────────────────────────
export const C = {
  emerald: '#059669',
  emeraldLight: '#d1fae5',
  cyan: '#0891b2',
  violet: '#7c3aed',
  amber: '#d97706',
  red: '#dc2626',
  orange: '#ea580c',
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray900: '#111827',
  white: '#ffffff',
}

// ─── Screen wrapper ───────────────────────────────────────────────────────────
export function Screen({
  children,
  scroll = true,
  style,
}: {
  children: React.ReactNode
  scroll?: boolean
  style?: object
}) {
  const inner = (
    <View style={[s.screenInner, style]}>{children}</View>
  )
  return scroll ? (
    <ScrollView style={s.screen} contentContainerStyle={s.screenContent} keyboardShouldPersistTaps="handled">
      {inner}
    </ScrollView>
  ) : (
    <View style={[s.screen, s.screenContent]}>{inner}</View>
  )
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, style }: { children: React.ReactNode; style?: object }) {
  return <View style={[s.card, style]}>{children}</View>
}

// ─── Stat card ────────────────────────────────────────────────────────────────
export function StatCard({ label, value, color = C.emerald }: { label: string; value: string | number; color?: string }) {
  return (
    <View style={[s.statCard, { borderLeftColor: color }]}>
      <Text style={[s.statValue, { color }]}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  )
}

// ─── Button ───────────────────────────────────────────────────────────────────
type BtnVariant = 'primary' | 'secondary' | 'danger' | 'ghost'
export function Btn({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  small = false,
}: {
  label: string
  onPress: () => void
  variant?: BtnVariant
  loading?: boolean
  disabled?: boolean
  small?: boolean
}) {
  const bg: Record<BtnVariant, string> = {
    primary: C.emerald,
    secondary: C.gray100,
    danger: C.red,
    ghost: 'transparent',
  }
  const fg: Record<BtnVariant, string> = {
    primary: C.white,
    secondary: C.gray700,
    danger: C.white,
    ghost: C.gray700,
  }
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        s.btn,
        small && s.btnSmall,
        { backgroundColor: bg[variant], opacity: pressed || disabled ? 0.6 : 1 },
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={fg[variant]} />
      ) : (
        <Text style={[s.btnText, small && s.btnTextSmall, { color: fg[variant] }]}>{label}</Text>
      )}
    </Pressable>
  )
}

// ─── Badge ────────────────────────────────────────────────────────────────────
export function Badge({ label, color = C.emerald }: { label: string; color?: string }) {
  return (
    <View style={[s.badge, { backgroundColor: color + '20', borderColor: color + '40' }]}>
      <Text style={[s.badgeText, { color }]}>{label}</Text>
    </View>
  )
}

// ─── Section title ────────────────────────────────────────────────────────────
export function SectionTitle({ children }: { children: string }) {
  return <Text style={s.sectionTitle}>{children}</Text>
}

// ─── Divider ──────────────────────────────────────────────────────────────────
export function Divider() {
  return <View style={s.divider} />
}

// ─── Empty state ──────────────────────────────────────────────────────────────
export function Empty({ message }: { message: string }) {
  return (
    <Card style={s.emptyCard}>
      <Text style={s.emptyText}>{message}</Text>
    </Card>
  )
}

// ─── Loading spinner ──────────────────────────────────────────────────────────
export function Loader() {
  return (
    <View style={s.loaderWrap}>
      <ActivityIndicator size="large" color={C.emerald} />
    </View>
  )
}

// ─── Error box ────────────────────────────────────────────────────────────────
export function ErrorBox({ message }: { message: string }) {
  return (
    <View style={s.errorBox}>
      <Text style={s.errorText}>{message}</Text>
    </View>
  )
}

// ─── Input row ────────────────────────────────────────────────────────────────
import { TextInput, TextInputProps } from 'react-native'
export function Input({ label, ...props }: TextInputProps & { label: string }) {
  return (
    <View style={s.inputWrap}>
      <Text style={s.inputLabel}>{label}</Text>
      <TextInput style={s.input} placeholderTextColor={C.gray400} {...props} />
    </View>
  )
}

// ─── Row ──────────────────────────────────────────────────────────────────────
export function Row({ children, style }: { children: React.ReactNode; style?: object }) {
  return <View style={[s.row, style]}>{children}</View>
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.gray50 },
  screenContent: { flexGrow: 1 },
  screenInner: { padding: 16, gap: 12 },
  card: {
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  statCard: {
    backgroundColor: C.white,
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 4,
    flex: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  statValue: { fontSize: 28, fontWeight: '700' },
  statLabel: { fontSize: 12, color: C.gray500, marginTop: 2 },
  btn: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSmall: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8 },
  btnText: { fontWeight: '600', fontSize: 15 },
  btnTextSmall: { fontSize: 13 },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
  },
  badgeText: { fontSize: 12, fontWeight: '600' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: C.gray900 },
  divider: { height: 1, backgroundColor: C.gray200 },
  emptyCard: { alignItems: 'center', padding: 32 },
  emptyText: { color: C.gray500, fontSize: 14 },
  loaderWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  errorBox: { backgroundColor: '#fef2f2', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#fecaca' },
  errorText: { color: C.red, fontSize: 13 },
  inputWrap: { gap: 4 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: C.gray700 },
  input: {
    backgroundColor: C.gray100,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: C.gray900,
    borderWidth: 1,
    borderColor: C.gray200,
  },
  row: { flexDirection: 'row', gap: 8 },
})
