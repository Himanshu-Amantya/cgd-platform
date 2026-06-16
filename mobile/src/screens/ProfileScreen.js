import { useState, useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch, Alert } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Feather } from '@expo/vector-icons'
import { C, S, R, shadow } from '../theme'
import { session } from '../api'
import { MOCK_USER } from '../mock'

const initials = (name = '') => name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

function SettingRow({ icon, label, value, onPress, danger, toggle, toggleVal, onToggle, grad }) {
  return (
    <TouchableOpacity style={s.row} onPress={onPress} activeOpacity={onPress ? 0.7 : 1} disabled={!onPress && !onToggle}>
      <LinearGradient
        colors={danger ? ['#FEE2E2', '#FEF2F2'] : grad || [C.blueLight, C.indigoLight]}
        style={s.rowIc}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <Feather name={icon} size={15} color={danger ? C.red : C.blueMid} />
      </LinearGradient>
      <View style={{ flex: 1 }}>
        <Text style={[s.rowLabel, danger && { color: C.red }]}>{label}</Text>
        {!!value && <Text style={s.rowValue}>{value}</Text>}
      </View>
      {toggle
        ? <Switch value={toggleVal} onValueChange={onToggle} trackColor={{ false: C.g200, true: C.blueMid }} thumbColor="#fff" ios_backgroundColor={C.g200} />
        : onPress && <Feather name="chevron-right" size={15} color={C.g300} />}
    </TouchableOpacity>
  )
}

function SectionCard({ title, children }) {
  return (
    <View style={s.section}>
      <Text style={s.sectionH}>{title}</Text>
      <View style={s.card}>{children}</View>
    </View>
  )
}

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(MOCK_USER)
  const [notif, setNotif] = useState(true)
  const [sms, setSms]     = useState(true)
  const [email, setEmail] = useState(false)

  useEffect(() => { session.user().then(u => { if (u) setUser(u) }) }, [])

  const logout = () => Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Sign Out', style: 'destructive', onPress: async () => { await session.clear(); navigation.replace('Auth') } },
  ])

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F0F4F8' }} contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>

      {/* ── PROFILE HERO ── */}
      <LinearGradient colors={[C.navy, C.navy2, C.navy3]} style={s.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={s.heroDec1} /><View style={s.heroDec2} />
        <View style={s.avatarCircle}>
          <Text style={s.avatarT}>{initials(user.name)}</Text>
        </View>
        <Text style={s.heroName}>{user.name}</Text>
        <Text style={s.heroMobile}>{user.mobile}</Text>
        <View style={s.heroBadge}>
          <View style={s.heroDot} />
          <Text style={s.heroBadgeT}>Active · {user.category}</Text>
        </View>
      </LinearGradient>

      {/* ── PNG ID STRIP ── */}
      <View style={s.idStrip}>
        <View style={s.idChip}>
          <Feather name="hash" size={13} color={C.blueMid} />
          <Text style={s.idText}>{user.pngId}</Text>
        </View>
        <View style={s.idChip}>
          <Feather name="map-pin" size={13} color={C.blueMid} />
          <Text style={s.idText}>{user.ga}</Text>
        </View>
      </View>

      <View style={s.body}>

        {/* Account Details */}
        <SectionCard title="Account">
          <SettingRow icon="hash"     label="PNG ID"             value={user.pngId}              grad={[C.blueLight, C.indigoLight]} />
          <View style={s.div} />
          <SettingRow icon="tag"      label="Category"           value={user.category}            grad={['#F0FDF4', '#DCFCE7']} />
          <View style={s.div} />
          <SettingRow icon="map-pin"  label="Geographical Area"  value={user.ga}                  grad={['#FEF9EE', '#FEF3C7']} />
          <View style={s.div} />
          <SettingRow icon="home"     label="Area"               value={user.area}                grad={['#FDF4FF', '#F5F3FF']} />
          <View style={s.div} />
          <SettingRow icon="calendar" label="Billing Cycle"      value={user.cycle || 'Cycle A'}  grad={[C.blueLight, C.indigoLight]} />
        </SectionCard>

        {/* Notifications */}
        <SectionCard title="Notifications">
          <SettingRow icon="bell"           label="Push Notifications" grad={['#FEF9EE', '#FEF3C7']} toggle toggleVal={notif}  onToggle={setNotif} />
          <View style={s.div} />
          <SettingRow icon="message-square" label="SMS Alerts"         grad={['#F0FDF4', '#DCFCE7']} toggle toggleVal={sms}   onToggle={setSms} />
          <View style={s.div} />
          <SettingRow icon="mail"           label="Email Updates"      grad={[C.blueLight, C.indigoLight]} toggle toggleVal={email} onToggle={setEmail} />
        </SectionCard>

        {/* Help */}
        <SectionCard title="Help & Support">
          <SettingRow icon="phone"  label="Call Helpline"  value="1800-419-1906 (Toll free)" grad={['#F0FDF4', '#DCFCE7']} onPress={() => {}} />
          <View style={s.div} />
          <SettingRow icon="mail"   label="Email Support"  value="support@gasonet.in"         grad={[C.blueLight, C.indigoLight]} onPress={() => Alert.alert('Email', 'support@gasonet.in')} />
          <View style={s.div} />
          <SettingRow icon="info"   label="About myCGD"    grad={['#FDF4FF', '#F5F3FF']} onPress={() => Alert.alert('myCGD', 'Gasonet Services (RJ) Ltd\nPNGRB Entity: PNGRB-RJ-GAS-014\nVersion 1.0.0')} />
        </SectionCard>

        {/* Sign out */}
        <View style={s.card}>
          <SettingRow icon="log-out" label="Sign Out" danger onPress={logout} />
        </View>

      </View>
    </ScrollView>
  )
}

const s = StyleSheet.create({
  // Hero
  hero: { paddingTop: 40, paddingBottom: 36, alignItems: 'center', overflow: 'hidden' },
  heroDec1: { position: 'absolute', top: -30, right: -30, width: 130, height: 130, borderRadius: 65, backgroundColor: 'rgba(255,255,255,.05)' },
  heroDec2: { position: 'absolute', bottom: -10, left: -20, width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(79,70,229,.15)' },
  avatarCircle: { width: 78, height: 78, borderRadius: 39, backgroundColor: 'rgba(255,255,255,.18)', alignItems: 'center', justifyContent: 'center', borderWidth: 2.5, borderColor: 'rgba(255,255,255,.25)', marginBottom: S.md },
  avatarT: { fontSize: 26, fontWeight: '900', color: '#fff' },
  heroName: { fontSize: 22, fontWeight: '900', color: '#fff', letterSpacing: -.4, marginBottom: 4 },
  heroMobile: { fontSize: 13, color: 'rgba(255,255,255,.5)', fontFamily: 'monospace', marginBottom: S.md },
  heroBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(34,197,94,.2)', borderRadius: R.full, paddingHorizontal: 13, paddingVertical: 5 },
  heroDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: C.leaf },
  heroBadgeT: { fontSize: 12, color: C.leaf, fontWeight: '700' },

  // ID strip
  idStrip: { flexDirection: 'row', justifyContent: 'center', gap: S.md, backgroundColor: '#fff', paddingVertical: S.md, borderBottomWidth: 1, borderBottomColor: C.g100 },
  idChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.blueLight, borderRadius: R.full, paddingHorizontal: 13, paddingVertical: 6 },
  idText: { fontSize: 12, fontWeight: '700', color: C.blue, fontFamily: 'monospace' },

  // Body
  body: { padding: S.base, gap: S.lg },
  section: { gap: S.xs },
  sectionH: { fontSize: 11.5, fontWeight: '800', color: C.g400, letterSpacing: .9, textTransform: 'uppercase', paddingHorizontal: S.xs },
  card: { backgroundColor: '#fff', borderRadius: R.xl, borderWidth: 1, borderColor: C.g100, ...shadow.sm, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: S.md, padding: S.md },
  rowIc: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { fontSize: 14, fontWeight: '700', color: C.g900 },
  rowValue: { fontSize: 11.5, color: C.g400, marginTop: 2, fontFamily: 'monospace' },
  div: { height: 1, backgroundColor: C.g50, marginLeft: S.md + 38 + S.md },
})
