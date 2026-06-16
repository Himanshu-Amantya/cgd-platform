import { useState, useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Feather } from '@expo/vector-icons'
import { C, S, R, shadow } from '../theme'
import { session } from '../api'
import { MOCK_USER, MOCK_BILLS } from '../mock'

const inr = (n) => '₹' + Number(n || 0).toLocaleString('en-IN')

function QuickAction({ icon, label, color, bg, onPress }) {
  return (
    <TouchableOpacity style={[s.qa, { backgroundColor: bg }]} onPress={onPress} activeOpacity={0.8}>
      <View style={[s.qaIc, { backgroundColor: color + '22' }]}>
        <Feather name={icon} size={20} color={color} />
      </View>
      <Text style={[s.qaT, { color }]}>{label}</Text>
    </TouchableOpacity>
  )
}

function MiniBar({ pct, color }) {
  return (
    <View style={s.barBg}>
      <View style={[s.barFill, { width: pct + '%', backgroundColor: color }]} />
    </View>
  )
}

export default function HomeScreen({ navigation }) {
  const [user, setUser] = useState(MOCK_USER)
  const [bills, setBills] = useState(MOCK_BILLS)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    session.user().then(u => { if (u) setUser(u) })
  }, [])

  const latestBill = bills.find(b => !b.paid) || bills[0]
  const totalDue = bills.filter(b => !b.paid).reduce((s, b) => s + b.amount, 0)
  const months = ['Jan','Feb','Mar','Apr','May','Jun']
  const consumption = [8, 11, 9, 10, 9, 9]

  const onRefresh = async () => {
    setRefreshing(true)
    await new Promise(r => setTimeout(r, 800))
    setRefreshing(false)
  }

  const initials = (name = '') => name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.g100 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.blueMid} />}>

      {/* Header */}
      <LinearGradient colors={[C.navy, C.navy2]} style={s.header}>
        <View style={s.headerTop}>
          <View>
            <Text style={s.greeting}>Good morning 👋</Text>
            <Text style={s.name}>{user.name}</Text>
            <View style={s.pngRow}>
              <Feather name="hash" size={11} color="rgba(255,255,255,.5)" />
              <Text style={s.pngId}>{user.pngId}</Text>
            </View>
          </View>
          <View style={s.avatar}><Text style={s.avatarT}>{initials(user.name)}</Text></View>
        </View>

        {/* Bill summary card */}
        <View style={s.billCard}>
          <View style={s.billCardTop}>
            <View>
              <Text style={s.billLabel}>Total Outstanding</Text>
              <Text style={s.billAmt}>{inr(totalDue)}</Text>
            </View>
            <View style={[s.dueBadge, latestBill?.status === 'OVERDUE' ? s.badgeRed : s.badgeAmber]}>
              <View style={s.dot} />
              <Text style={s.dueT}>{latestBill?.status === 'OVERDUE' ? 'Overdue' : 'Due ' + latestBill?.dueDate}</Text>
            </View>
          </View>
          {totalDue > 0 && (
            <TouchableOpacity style={s.payBtn} onPress={() => navigation.navigate('Bills')} activeOpacity={0.85}>
              <Feather name="credit-card" size={15} color="#fff" />
              <Text style={s.payBtnT}>Pay Now</Text>
            </TouchableOpacity>
          )}
          {totalDue === 0 && (
            <View style={s.paidRow}>
              <Feather name="check-circle" size={15} color={C.greenMid} />
              <Text style={s.paidT}>All bills paid · Great job!</Text>
            </View>
          )}
        </View>
      </LinearGradient>

      <View style={s.body}>
        {/* Quick actions */}
        <View style={s.section}>
          <Text style={s.sectionH}>Quick Actions</Text>
          <View style={s.qaGrid}>
            <QuickAction icon="file-text" label="My Bills"    color={C.blueMid}  bg={C.blueLight}  onPress={() => navigation.navigate('Bills')} />
            <QuickAction icon="credit-card" label="Pay Bill"  color={C.greenMid} bg={C.greenLight}  onPress={() => navigation.navigate('Bills')} />
            <QuickAction icon="message-circle" label="Support" color={C.purple} bg={C.purpleLight}  onPress={() => navigation.navigate('Support')} />
            <QuickAction icon="user"      label="Profile"     color={C.g600}     bg={C.g100}        onPress={() => navigation.navigate('Profile')} />
          </View>
        </View>

        {/* Consumption chart */}
        <View style={s.section}>
          <Text style={s.sectionH}>Gas Consumption (m³)</Text>
          <View style={[s.card, { padding: S.lg }]}>
            <View style={s.chartRow}>
              {months.map((m, i) => (
                <View key={m} style={s.chartCol}>
                  <Text style={s.chartVal}>{consumption[i]}</Text>
                  <MiniBar pct={Math.round((consumption[i] / 12) * 100)} color={i === months.length - 1 ? C.blueMid : C.g300} />
                  <Text style={s.chartLbl}>{m}</Text>
                </View>
              ))}
            </View>
            <View style={s.chartFooter}>
              <Feather name="trending-up" size={13} color={C.green} />
              <Text style={s.chartFooterT}>Avg 9.3 m³/month · Stable consumption</Text>
            </View>
          </View>
        </View>

        {/* Connection info */}
        <View style={s.section}>
          <Text style={s.sectionH}>Connection Details</Text>
          <View style={s.card}>
            {[
              ['Category',     user.category],
              ['GA',           user.ga],
              ['Area',         user.area],
              ['Billing Cycle',user.cycle || '—'],
              ['Status',       user.status],
            ].map(([k, v]) => (
              <View key={k} style={s.kv}>
                <Text style={s.kvK}>{k}</Text>
                <Text style={[s.kvV, k === 'Status' && { color: C.greenMid, fontWeight: '700' }]}>{v}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  )
}

const s = StyleSheet.create({
  header: { paddingTop: 56, paddingHorizontal: S.xl, paddingBottom: S['2xl'] },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: S.xl },
  greeting: { fontSize: 13, color: 'rgba(255,255,255,.55)', marginBottom: 3 },
  name: { fontSize: 22, fontWeight: '800', color: '#fff', letterSpacing: -.4 },
  pngRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  pngId: { fontSize: 11.5, color: 'rgba(255,255,255,.45)', fontFamily: 'monospace' },
  avatar: { width: 46, height: 46, borderRadius: R.lg, backgroundColor: 'rgba(255,255,255,.15)', alignItems: 'center', justifyContent: 'center' },
  avatarT: { fontSize: 16, fontWeight: '800', color: '#fff' },
  billCard: { backgroundColor: '#fff', borderRadius: R.xl, padding: S.lg, ...shadow.sm },
  billCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: S.md },
  billLabel: { fontSize: 11.5, color: C.g500, fontWeight: '600', marginBottom: 4 },
  billAmt: { fontSize: 28, fontWeight: '800', color: C.g900, letterSpacing: -.6 },
  dueBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: R.full, paddingHorizontal: 10, paddingVertical: 5 },
  badgeAmber: { backgroundColor: C.amberPale },
  badgeRed: { backgroundColor: C.redPale },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.amber },
  dueT: { fontSize: 11.5, color: C.amber, fontWeight: '700' },
  payBtn: { flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: C.blueMid, borderRadius: R.lg, padding: S.md, ...shadow.sm },
  payBtnT: { fontSize: 14, fontWeight: '700', color: '#fff' },
  paidRow: { flexDirection: 'row', gap: 7, alignItems: 'center' },
  paidT: { fontSize: 13, color: C.green, fontWeight: '600' },
  body: { padding: S.base, gap: S.lg },
  section: { gap: S.sm },
  sectionH: { fontSize: 14, fontWeight: '800', color: C.g700, letterSpacing: -.2 },
  card: { backgroundColor: '#fff', borderRadius: R.lg, borderWidth: 1, borderColor: C.g200, ...shadow.sm },
  qaGrid: { flexDirection: 'row', gap: S.sm },
  qa: { flex: 1, alignItems: 'center', borderRadius: R.lg, padding: S.md, gap: S.xs, borderWidth: 1, borderColor: 'rgba(0,0,0,.04)' },
  qaIc: { width: 40, height: 40, borderRadius: R.md, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  qaT: { fontSize: 11, fontWeight: '700', textAlign: 'center' },
  chartRow: { flexDirection: 'row', alignItems: 'flex-end', gap: S.xs, marginBottom: S.md },
  chartCol: { flex: 1, alignItems: 'center', gap: 4 },
  chartVal: { fontSize: 10.5, fontWeight: '700', color: C.g700 },
  barBg: { width: '100%', height: 60, backgroundColor: C.g100, borderRadius: 4, justifyContent: 'flex-end' },
  barFill: { width: '100%', borderRadius: 4 },
  chartLbl: { fontSize: 9.5, color: C.g400, fontWeight: '600' },
  chartFooter: { flexDirection: 'row', gap: 6, alignItems: 'center', borderTopWidth: 1, borderTopColor: C.g100, paddingTop: S.sm },
  chartFooterT: { fontSize: 11.5, color: C.green, fontWeight: '600' },
  kv: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: S.md, borderBottomWidth: 1, borderBottomColor: C.g100 },
  kvK: { fontSize: 12.5, color: C.g500 },
  kvV: { fontSize: 12.5, fontWeight: '600', color: C.g800 },
})
