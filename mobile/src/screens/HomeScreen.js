import { useState, useEffect, useCallback } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl, Linking } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Feather } from '@expo/vector-icons'
import { useFocusEffect } from '@react-navigation/native'
import { C, S, R, shadow } from '../theme'
import { session } from '../api'
import { MOCK_USER, MOCK_BILLS } from '../mock'
import { paidBills } from '../store'

const inr = (n) => '₹' + Number(n || 0).toLocaleString('en-IN')
const initials = (name = '') => name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

const ACTIONS = [
  { icon: 'file-text',     label: 'My Bills',  grad: ['#2563EB', '#4F46E5'], screen: 'Bills' },
  { icon: 'credit-card',   label: 'Pay Bill',  grad: ['#059669', '#10B981'], screen: 'Bills' },
  { icon: 'message-circle',label: 'Support',   grad: ['#7C3AED', '#A855F7'], screen: 'Support' },
  { icon: 'phone',         label: 'Helpline',  grad: ['#D97706', '#F59E0B'], screen: null, action: () => Linking.openURL('tel:18004191906') },
]

const MONTHS  = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
const USAGE   = [8, 11, 9, 10, 9, 9]
const MAX_USE = 13

function Bar({ value, month, active }) {
  const fillH = Math.round((value / MAX_USE) * 88)
  return (
    <View style={s.barCol}>
      <Text style={[s.barVal, active && { color: C.blueMid, fontWeight: '800' }]}>{value}</Text>
      <View style={s.barTrack}>
        {active
          ? <LinearGradient colors={[C.indigo, C.blueMid]} style={[s.barFill, { height: fillH }]} start={{ x: 0, y: 1 }} end={{ x: 0, y: 0 }} />
          : <View style={[s.barFill, { height: fillH, backgroundColor: C.g200 }]} />
        }
      </View>
      <Text style={[s.barLbl, active && { color: C.blueMid, fontWeight: '800' }]}>{month}</Text>
    </View>
  )
}

const applyPaid = () => MOCK_BILLS.map(b => paidBills.has(b.id) ? { ...b, paid: true, status: 'PAID' } : b)

export default function HomeScreen({ navigation }) {
  const [user, setUser] = useState(MOCK_USER)
  const [bills, setBills] = useState(applyPaid)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => { session.user().then(u => { if (u) setUser(u) }) }, [])
  useFocusEffect(useCallback(() => { setBills(applyPaid()) }, []))

  const unpaid    = bills.filter(b => !b.paid)
  const totalDue  = unpaid.reduce((sum, b) => sum + b.amount, 0)
  const latestBill = unpaid[0] || bills[0]
  const isOverdue  = latestBill?.status === 'OVERDUE'

  const onRefresh = async () => {
    setRefreshing(true)
    await new Promise(r => setTimeout(r, 900))
    setBills(applyPaid())
    setRefreshing(false)
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F0F4F8' }}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.blueMid} colors={[C.blueMid]} />}>

      {/* ── HEADER ── */}
      <LinearGradient colors={[C.navy, C.navy2, C.navy3]} style={s.header} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={s.dec1} /><View style={s.dec2} /><View style={s.dec3} />

        <View style={s.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={s.greeting}>Good morning ✨</Text>
            <Text style={s.name}>{user.name}</Text>
          </View>
          <View style={s.avatarWrap}>
            <View style={s.avatar}>
              <Text style={s.avatarT}>{initials(user.name)}</Text>
            </View>
            <View style={s.onlineDot} />
          </View>
        </View>

        <View style={s.chipRow}>
          <View style={s.chip}>
            <Feather name="wind" size={10} color={C.leaf} />
            <Text style={s.chipT}>{user.pngId}</Text>
          </View>
          <View style={s.chip}>
            <Feather name="map-pin" size={10} color="rgba(255,255,255,.5)" />
            <Text style={s.chipT}>{user.ga}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* ── FLOATING BILL CARD ── */}
      <View style={s.floatWrap}>
        <View style={s.billCard}>
          <View style={s.billRow}>
            <View style={{ flex: 1 }}>
              <Text style={s.billLabel}>TOTAL OUTSTANDING</Text>
              <Text style={s.billAmt}>{inr(totalDue)}</Text>
              <Text style={s.billSub}>{unpaid.length} unpaid bill{unpaid.length !== 1 ? 's' : ''}</Text>
            </View>
            <View style={[s.statusPill, isOverdue ? s.pillRed : s.pillAmber]}>
              <View style={[s.pillDot, { backgroundColor: isOverdue ? C.red : C.amber }]} />
              <Text style={[s.pillT, { color: isOverdue ? C.red : C.amber }]}>
                {isOverdue ? 'Overdue' : 'Due ' + latestBill?.dueDate}
              </Text>
            </View>
          </View>

          {totalDue > 0 ? (
            <TouchableOpacity activeOpacity={0.88} onPress={() => navigation.navigate('Bills')}>
              <LinearGradient colors={[C.blueMid, C.indigo]} style={s.payBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Feather name="credit-card" size={16} color="#fff" />
                <Text style={s.payBtnT}>Pay Now</Text>
                <Feather name="arrow-right" size={15} color="rgba(255,255,255,.65)" />
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <View style={s.paidRow}>
              <Feather name="check-circle" size={18} color={C.greenMid} />
              <Text style={s.paidT}>All bills paid — great job! 🎉</Text>
            </View>
          )}
        </View>
      </View>

      <View style={s.body}>

        {/* ── QUICK ACTIONS ── */}
        <View style={s.qaRow}>
          {ACTIONS.map(a => (
            <TouchableOpacity key={a.label} style={s.qa} onPress={() => a.action ? a.action() : a.screen && navigation.navigate(a.screen)} activeOpacity={0.8}>
              <LinearGradient colors={a.grad} style={s.qaIc} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <Feather name={a.icon} size={22} color="#fff" />
              </LinearGradient>
              <Text style={s.qaT}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── CONSUMPTION CHART ── */}
        <View style={s.section}>
          <View style={s.sectionTop}>
            <Text style={s.sectionH}>Gas Usage</Text>
            <View style={s.unitPill}><Text style={s.unitT}>m³ / month</Text></View>
          </View>
          <View style={s.card}>
            <View style={s.chartArea}>
              {MONTHS.map((m, i) => (
                <Bar key={m} value={USAGE[i]} month={m} active={i === MONTHS.length - 1} />
              ))}
            </View>
            <View style={s.chartFooter}>
              <View style={s.chartStat}>
                <Feather name="trending-up" size={13} color={C.green} />
                <Text style={s.chartStatT}>Avg 9.3 m³ · Stable</Text>
              </View>
              <Text style={s.chartMonthT}>Jun '25 — Current</Text>
            </View>
          </View>
        </View>

        {/* ── CONNECTION ── */}
        <View style={s.section}>
          <Text style={s.sectionH}>My Connection</Text>
          <View style={s.connCard}>
            <LinearGradient colors={['#EFF6FF', '#E0F2FE']} style={s.connTop} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <LinearGradient colors={[C.blueMid, C.indigo]} style={s.connIcon}>
                <Feather name="zap" size={19} color="#fff" />
              </LinearGradient>
              <View style={{ flex: 1 }}>
                <Text style={s.connTitle}>Active Connection</Text>
                <Text style={s.connSub}>{user.category} · {user.ga}</Text>
              </View>
              <View style={s.activePill}>
                <View style={s.activeDot} />
                <Text style={s.activeT}>Active</Text>
              </View>
            </LinearGradient>
            <View style={s.connBody}>
              {[
                ['Area', user.area],
                ['Billing Cycle', user.cycle || 'Monthly'],
                ['Meter Status', 'Functional'],
              ].map(([k, v]) => (
                <View key={k} style={s.kvRow}>
                  <Text style={s.kvK}>{k}</Text>
                  <Text style={s.kvV}>{v}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

      </View>
      <View style={{ height: 24 }} />
    </ScrollView>
  )
}

const s = StyleSheet.create({
  // Header
  header: { paddingTop: 58, paddingHorizontal: S.xl, paddingBottom: 52, overflow: 'hidden' },
  dec1: { position: 'absolute', top: -50, right: -50, width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(255,255,255,.04)' },
  dec2: { position: 'absolute', top: 10, right: 70, width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(255,255,255,.05)' },
  dec3: { position: 'absolute', bottom: -20, left: -30, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(79,70,229,.15)' },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 },
  greeting: { fontSize: 13, color: 'rgba(255,255,255,.45)', marginBottom: 5, letterSpacing: .3 },
  name: { fontSize: 25, fontWeight: '900', color: '#fff', letterSpacing: -.5 },
  avatarWrap: { position: 'relative' },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(255,255,255,.14)', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,.22)' },
  avatarT: { fontSize: 18, fontWeight: '900', color: '#fff' },
  onlineDot: { position: 'absolute', bottom: 1, right: 1, width: 14, height: 14, borderRadius: 7, backgroundColor: C.leaf, borderWidth: 2.5, borderColor: C.navy2 },
  chipRow: { flexDirection: 'row', gap: S.sm },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,255,255,.1)', borderRadius: R.full, paddingHorizontal: 11, paddingVertical: 5 },
  chipT: { fontSize: 11, color: 'rgba(255,255,255,.65)', fontFamily: 'monospace', fontWeight: '600' },

  // Bill card
  floatWrap: { paddingHorizontal: S.lg, marginTop: -30, marginBottom: S.base },
  billCard: { backgroundColor: '#fff', borderRadius: 22, padding: S.xl, ...shadow.lg },
  billRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: S.lg },
  billLabel: { fontSize: 10.5, color: C.g400, fontWeight: '700', letterSpacing: .8, marginBottom: 5 },
  billAmt: { fontSize: 34, fontWeight: '900', color: C.g900, letterSpacing: -1 },
  billSub: { fontSize: 12, color: C.g400, marginTop: 4 },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: R.full, paddingHorizontal: 11, paddingVertical: 6, borderWidth: 1 },
  pillAmber: { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' },
  pillRed: { backgroundColor: '#FEF2F2', borderColor: '#FECACA' },
  pillDot: { width: 6, height: 6, borderRadius: 3 },
  pillT: { fontSize: 11.5, fontWeight: '700' },
  payBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: R.lg, paddingVertical: 15, paddingHorizontal: S.lg, ...shadow.blue },
  payBtnT: { fontSize: 15, fontWeight: '800', color: '#fff', flex: 1, textAlign: 'center' },
  paidRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.greenLight, borderRadius: R.lg, padding: 13 },
  paidT: { fontSize: 13.5, color: C.green, fontWeight: '700' },

  // Body
  body: { paddingHorizontal: S.base, gap: S.xl },

  // Quick actions
  qaRow: { flexDirection: 'row', gap: S.sm },
  qa: { flex: 1, alignItems: 'center', gap: 8 },
  qaIc: { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center', ...shadow.md },
  qaT: { fontSize: 11, fontWeight: '700', color: C.g700, textAlign: 'center' },

  // Section
  section: { gap: S.sm },
  sectionTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionH: { fontSize: 15.5, fontWeight: '800', color: C.g900, letterSpacing: -.3 },
  unitPill: { backgroundColor: C.g100, borderRadius: R.full, paddingHorizontal: 11, paddingVertical: 4 },
  unitT: { fontSize: 10.5, fontWeight: '600', color: C.g500 },
  card: { backgroundColor: '#fff', borderRadius: R.xl, padding: S.lg, borderWidth: 1, borderColor: C.g100, ...shadow.sm },

  // Chart
  chartArea: { flexDirection: 'row', alignItems: 'flex-end', gap: S.xs, height: 120, marginBottom: S.md },
  barCol: { flex: 1, alignItems: 'center', gap: 5, height: '100%', justifyContent: 'flex-end' },
  barVal: { fontSize: 10, fontWeight: '700', color: C.g400 },
  barTrack: { flex: 1, width: '68%', backgroundColor: C.g100, borderRadius: 6, justifyContent: 'flex-end', overflow: 'hidden' },
  barFill: { width: '100%', borderRadius: 6 },
  barLbl: { fontSize: 9.5, color: C.g400, fontWeight: '600' },
  chartFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: C.g100, paddingTop: S.sm },
  chartStat: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  chartStatT: { fontSize: 11.5, color: C.green, fontWeight: '700' },
  chartMonthT: { fontSize: 11, color: C.g400, fontWeight: '600' },

  // Connection card
  connCard: { backgroundColor: '#fff', borderRadius: R.xl, overflow: 'hidden', borderWidth: 1, borderColor: C.g100, ...shadow.sm },
  connTop: { flexDirection: 'row', alignItems: 'center', gap: S.md, padding: S.lg },
  connIcon: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center', ...shadow.sm },
  connTitle: { fontSize: 14.5, fontWeight: '800', color: C.g900, letterSpacing: -.2 },
  connSub: { fontSize: 12, color: C.g500, marginTop: 2 },
  activePill: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: C.greenLight, borderRadius: R.full, paddingHorizontal: 10, paddingVertical: 5 },
  activeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.greenMid },
  activeT: { fontSize: 11, fontWeight: '700', color: C.green },
  connBody: { padding: S.lg, paddingTop: S.md, gap: 0 },
  kvRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.g50 },
  kvK: { fontSize: 13, color: C.g500 },
  kvV: { fontSize: 13, fontWeight: '700', color: C.g900 },
})
