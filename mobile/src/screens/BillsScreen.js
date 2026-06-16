import { useState, useCallback } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Feather } from '@expo/vector-icons'
import { useFocusEffect } from '@react-navigation/native'
import { C, S, R, shadow } from '../theme'
import { MOCK_BILLS } from '../mock'
import { paidBills } from '../store'

const inr = (n) => '₹' + Number(n || 0).toLocaleString('en-IN')

const STATUS = {
  DUE:     { label: 'Due',     bg: '#FEF3C7', color: C.amber,   border: '#FDE68A', icon: 'clock' },
  OVERDUE: { label: 'Overdue', bg: '#FEE2E2', color: C.red,     border: '#FECACA', icon: 'alert-circle' },
  PAID:    { label: 'Paid',    bg: '#DCFCE7', color: C.greenMid,border: '#BBF7D0', icon: 'check-circle' },
}

function BillCard({ bill, onPress }) {
  const st = STATUS[bill.status] || STATUS.DUE
  return (
    <TouchableOpacity style={s.billCard} onPress={onPress} activeOpacity={0.8}>
      <View style={s.cardLeft}>
        <View style={[s.cardIcon, { backgroundColor: st.bg, borderColor: st.border }]}>
          <Feather name={st.icon} size={18} color={st.color} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.cardPeriod}>{bill.period}</Text>
          <Text style={s.cardId}>{bill.id}</Text>
        </View>
      </View>
      <View style={s.cardRight}>
        <Text style={s.cardAmt}>{inr(bill.amount)}</Text>
        <View style={[s.badge, { backgroundColor: st.bg, borderColor: st.border }]}>
          <Text style={[s.badgeT, { color: st.color }]}>{st.label}</Text>
        </View>
      </View>
      <Feather name="chevron-right" size={15} color={C.g300} style={{ marginLeft: S.xs }} />
    </TouchableOpacity>
  )
}

const applyPaid = () => MOCK_BILLS.map(b => paidBills.has(b.id) ? { ...b, paid: true, status: 'PAID' } : b)

export default function BillsScreen({ navigation }) {
  const [bills, setBills] = useState(applyPaid)
  const [refreshing, setRefreshing] = useState(false)

  useFocusEffect(useCallback(() => { setBills(applyPaid()) }, []))

  const unpaid   = bills.filter(b => !b.paid)
  const paid     = bills.filter(b => b.paid)
  const totalDue = unpaid.reduce((sum, b) => sum + b.amount, 0)

  const onRefresh = async () => {
    setRefreshing(true)
    await new Promise(r => setTimeout(r, 800))
    setBills(applyPaid())
    setRefreshing(false)
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F0F4F8' }}>
      <ScrollView showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.blueMid} colors={[C.blueMid]} />}>

        {/* ── HEADER BANNER ── */}
        <LinearGradient colors={[C.navy, C.navy2, C.navy3]} style={s.banner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={s.bannerDec1} /><View style={s.bannerDec2} />
          <Text style={s.bannerLabel}>TOTAL OUTSTANDING</Text>
          <Text style={s.bannerAmt}>{inr(totalDue)}</Text>
          {totalDue > 0
            ? <Text style={s.bannerSub}>{unpaid.length} bill{unpaid.length > 1 ? 's' : ''} awaiting payment</Text>
            : <View style={s.allPaidPill}><Feather name="check-circle" size={13} color={C.leaf} /><Text style={s.allPaidT}>All clear!</Text></View>
          }
        </LinearGradient>

        {/* ── KPI STRIP ── */}
        <View style={s.kpiStrip}>
          {[
            { label: 'Total', val: bills.length, color: C.g900 },
            { label: 'Unpaid', val: unpaid.length, color: C.amber },
            { label: 'Paid', val: paid.length, color: C.greenMid },
          ].map((k, i) => (
            <View key={k.label} style={[s.kpiCell, i < 2 && s.kpiBorder]}>
              <Text style={[s.kpiVal, { color: k.color }]}>{k.val}</Text>
              <Text style={s.kpiLbl}>{k.label}</Text>
            </View>
          ))}
        </View>

        <View style={s.listArea}>

          {/* Unpaid */}
          {unpaid.length > 0 && (
            <View style={s.group}>
              <View style={s.groupHeader}>
                <View style={s.groupDot} />
                <Text style={s.groupH}>Pending Payment</Text>
                <View style={s.groupCount}><Text style={s.groupCountT}>{unpaid.length}</Text></View>
              </View>
              {unpaid.map(b => (
                <BillCard key={b.id} bill={b} onPress={() => navigation.navigate('BillDetail', { bill: b })} />
              ))}
            </View>
          )}

          {/* Paid */}
          {paid.length > 0 && (
            <View style={s.group}>
              <View style={s.groupHeader}>
                <View style={[s.groupDot, { backgroundColor: C.greenMid }]} />
                <Text style={s.groupH}>Paid</Text>
                <View style={[s.groupCount, { backgroundColor: C.greenLight }]}>
                  <Text style={[s.groupCountT, { color: C.greenMid }]}>{paid.length}</Text>
                </View>
              </View>
              {paid.map(b => (
                <BillCard key={b.id} bill={b} onPress={() => navigation.navigate('BillDetail', { bill: b })} />
              ))}
            </View>
          )}

        </View>
        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Pay All FAB */}
      {totalDue > 0 && (
        <View style={s.fabWrap}>
          <TouchableOpacity activeOpacity={0.88}>
            <LinearGradient colors={[C.blueMid, C.indigo]} style={s.fab} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Feather name="credit-card" size={18} color="#fff" />
              <Text style={s.fabT}>Pay All — {inr(totalDue)}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

const s = StyleSheet.create({
  // Banner
  banner: { paddingTop: 20, paddingBottom: 28, paddingHorizontal: S.xl, overflow: 'hidden' },
  bannerDec1: { position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,.05)' },
  bannerDec2: { position: 'absolute', bottom: -10, left: 100, width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(79,70,229,.2)' },
  bannerLabel: { fontSize: 10.5, color: 'rgba(255,255,255,.45)', fontWeight: '700', letterSpacing: .8, marginBottom: 5 },
  bannerAmt: { fontSize: 36, fontWeight: '900', color: '#fff', letterSpacing: -1, marginBottom: 6 },
  bannerSub: { fontSize: 12.5, color: 'rgba(255,255,255,.5)', fontWeight: '600' },
  allPaidPill: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', backgroundColor: 'rgba(34,197,94,.15)', borderRadius: R.full, paddingHorizontal: 12, paddingVertical: 5 },
  allPaidT: { fontSize: 12, fontWeight: '700', color: C.leaf },

  // KPI strip
  kpiStrip: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: C.g100 },
  kpiCell: { flex: 1, alignItems: 'center', paddingVertical: S.lg },
  kpiBorder: { borderRightWidth: 1, borderRightColor: C.g100 },
  kpiVal: { fontSize: 24, fontWeight: '900', letterSpacing: -.5 },
  kpiLbl: { fontSize: 11, color: C.g500, fontWeight: '600', marginTop: 3 },

  // List
  listArea: { padding: S.base, gap: S.lg },
  group: { gap: S.sm },
  groupHeader: { flexDirection: 'row', alignItems: 'center', gap: S.sm, marginBottom: 2 },
  groupDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.amber },
  groupH: { fontSize: 13, fontWeight: '800', color: C.g700, flex: 1, letterSpacing: -.1 },
  groupCount: { backgroundColor: C.amberPale, borderRadius: R.full, width: 22, height: 22, alignItems: 'center', justifyContent: 'center' },
  groupCountT: { fontSize: 11, fontWeight: '800', color: C.amber },

  // Bill card
  billCard: { backgroundColor: '#fff', borderRadius: R.xl, padding: S.md, flexDirection: 'row', alignItems: 'center', ...shadow.sm, borderWidth: 1, borderColor: C.g100 },
  cardLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: S.md },
  cardIcon: { width: 44, height: 44, borderRadius: R.lg, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  cardPeriod: { fontSize: 14, fontWeight: '800', color: C.g900, letterSpacing: -.2 },
  cardId: { fontSize: 10.5, color: C.g400, fontFamily: 'monospace', marginTop: 2 },
  cardRight: { alignItems: 'flex-end', gap: 5 },
  cardAmt: { fontSize: 15, fontWeight: '900', color: C.g900, letterSpacing: -.3 },
  badge: { borderRadius: R.full, paddingHorizontal: 9, paddingVertical: 3, borderWidth: 1 },
  badgeT: { fontSize: 10.5, fontWeight: '700' },

  // FAB
  fabWrap: { position: 'absolute', bottom: 20, left: S.xl, right: S.xl },
  fab: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderRadius: R.full, paddingVertical: 16, ...shadow.blue },
  fabT: { fontSize: 15, fontWeight: '800', color: '#fff' },
})
