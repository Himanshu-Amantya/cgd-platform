import { useState, useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch, Alert } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { C, S, R, shadow } from '../theme'
import { session } from '../api'
import { MOCK_USER } from '../mock'

const initials = (name = '') => name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

function Row({ icon, label, value, onPress, danger, toggle, toggleVal, onToggle }) {
  return (
    <TouchableOpacity style={s.row} onPress={onPress} activeOpacity={onPress ? 0.7 : 1} disabled={!onPress && !onToggle}>
      <View style={[s.rowIc, danger && { backgroundColor: C.redLight }]}>
        <Feather name={icon} size={16} color={danger ? C.red : C.g500} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[s.rowLabel, danger && { color: C.red }]}>{label}</Text>
        {!!value && <Text style={s.rowValue}>{value}</Text>}
      </View>
      {toggle
        ? <Switch value={toggleVal} onValueChange={onToggle} trackColor={{ false: C.g200, true: C.greenMid }} thumbColor="#fff" />
        : onPress && <Feather name="chevron-right" size={16} color={C.g300} />}
    </TouchableOpacity>
  )
}

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(MOCK_USER)
  const [notif, setNotif] = useState(true)
  const [sms, setSms] = useState(true)

  useEffect(() => {
    session.user().then(u => { if (u) setUser(u) })
  }, [])

  const logout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: async () => { await session.clear(); navigation.replace('Auth') } },
    ])
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.g100 }} contentContainerStyle={{ padding: S.base, gap: S.base }}>

      {/* Avatar card */}
      <View style={s.avatarCard}>
        <View style={s.avatar}><Text style={s.avatarT}>{initials(user.name)}</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={s.name}>{user.name}</Text>
          <Text style={s.mobile}>{user.mobile}</Text>
        </View>
        <View style={[s.activeBadge]}>
          <View style={s.activeDot} />
          <Text style={s.activeT}>Active</Text>
        </View>
      </View>

      {/* Account info */}
      <View style={s.section}>
        <Text style={s.sectionH}>Account</Text>
        <View style={s.card}>
          <Row icon="hash"       label="PNG ID"          value={user.pngId} />
          <View style={s.div} />
          <Row icon="tag"        label="Category"        value={user.category} />
          <View style={s.div} />
          <Row icon="map-pin"    label="Geographical Area" value={user.ga} />
          <View style={s.div} />
          <Row icon="home"       label="Area"            value={user.area} />
          <View style={s.div} />
          <Row icon="calendar"   label="Billing Cycle"   value={user.cycle || '—'} />
        </View>
      </View>

      {/* Preferences */}
      <View style={s.section}>
        <Text style={s.sectionH}>Notifications</Text>
        <View style={s.card}>
          <Row icon="bell"    label="Push Notifications" toggle toggleVal={notif} onToggle={setNotif} />
          <View style={s.div} />
          <Row icon="message-square" label="SMS Alerts" toggle toggleVal={sms} onToggle={setSms} />
        </View>
      </View>

      {/* Support */}
      <View style={s.section}>
        <Text style={s.sectionH}>Help</Text>
        <View style={s.card}>
          <Row icon="phone"    label="Call Helpline"   value="1800-419-1906" onPress={() => {}} />
          <View style={s.div} />
          <Row icon="mail"     label="Email Support"   value="support@gasonet.in" onPress={() => {}} />
          <View style={s.div} />
          <Row icon="info"     label="About myCGD"     onPress={() => Alert.alert('myCGD', 'Gasonet Services (RJ) Ltd\nPNGRB Entity: PNGRB-RJ-GAS-014\nVersion 1.0.0')} />
        </View>
      </View>

      {/* Sign out */}
      <View style={s.card}>
        <Row icon="log-out" label="Sign Out" danger onPress={logout} />
      </View>

      <View style={{ height: S.xl }} />
    </ScrollView>
  )
}

const s = StyleSheet.create({
  avatarCard: { flexDirection:'row', alignItems:'center', gap: S.md, backgroundColor:'#fff', borderRadius:R.xl, padding: S.lg, borderWidth:1, borderColor:C.g200, ...shadow.sm },
  avatar: { width:56, height:56, borderRadius:R.lg, backgroundColor:C.blueMid, alignItems:'center', justifyContent:'center' },
  avatarT: { fontSize:20, fontWeight:'800', color:'#fff' },
  name: { fontSize:17, fontWeight:'800', color:C.g900, letterSpacing:-.3 },
  mobile: { fontSize:12.5, color:C.g400, fontFamily:'monospace', marginTop:3 },
  activeBadge: { flexDirection:'row', alignItems:'center', gap:5, backgroundColor:C.greenLight, borderRadius:R.full, paddingHorizontal:10, paddingVertical:5 },
  activeDot: { width:6, height:6, borderRadius:3, backgroundColor:C.greenMid },
  activeT: { fontSize:11, fontWeight:'700', color:C.green },
  section: { gap: S.xs },
  sectionH: { fontSize:12, fontWeight:'800', color:C.g400, letterSpacing:.8, textTransform:'uppercase', paddingHorizontal: S.xs },
  card: { backgroundColor:'#fff', borderRadius:R.lg, borderWidth:1, borderColor:C.g200, ...shadow.sm, overflow:'hidden' },
  row: { flexDirection:'row', alignItems:'center', gap: S.md, padding: S.md },
  rowIc: { width:36, height:36, borderRadius:R.md, backgroundColor:C.g100, alignItems:'center', justifyContent:'center' },
  rowLabel: { fontSize:13.5, fontWeight:'600', color:C.g900 },
  rowValue: { fontSize:11.5, color:C.g400, marginTop:2, fontFamily:'monospace' },
  div: { height:1, backgroundColor:C.g100, marginLeft: S.md + 36 + S.md },
})
