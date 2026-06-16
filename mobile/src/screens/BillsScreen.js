import { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { C, S, R, shadow } from '../theme'
import { MOCK_BILLS } from '../mock'

const inr = (n) => '₹' + Number(n || 0).toLocaleString('en-IN')

const STATUS = {
  DUE:     { label: 'Due',      bg: C.amberPale, color: C.amber },
  OVERDUE: { label: 'Overdue',  bg: C.redPale,   color: C.red },
  PAID:    { label: 'Paid',     bg: C.greenLight, color: C.green },
}

function BillRow({ bill, onPress }) {
  const st = STATUS[bill.status] || STATUS.DUE
  return (
    <TouchableOpacity style={s.row} onPress={onPress} activeOpacity={0.8}>
      <View style={[s.rowIc, { backgroundColor: bill.paid ? C.greenLight : C.blueLight }]}>
        <Feather name={bill.paid ? 'check' : 'file-text'} size={18} color={bill.paid ? C.greenMid : C.blueMid} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.rowPeriod}>{bill.period}</Text>
        <Text style={s.rowId}>{bill.id}</Text>
      </View>
      <View style={{ alignItems: 'flex-end', gap: 5 }}>
        <Text style={s.rowAmt}>{inr(bill.amount)}</Text>
        <View style={[s.badge, { backgroundColor: st.bg }]}>
          <Text style={[s.badgeT, { color: st.color }]}>{st.label}</Text>
        </View>
      </View>
      <Feather name="chevron-right" size={16} color={C.g300} style={{ marginLeft: 4 }} />
    </TouchableOpacity>
  )
}

export default function BillsScreen({ navigation }) {
  const [bills] = useState(MOCK_BILLS)
  const [refreshing, setRefreshing] = useState(false)

  const unpaid = bills.filter(b => !b.paid)
  const totalDue = unpaid.reduce((sum, b) => sum + b.amount, 0)

  const onRefresh = async () => {
    setRefreshing(true)
    await new Promise(r => setTimeout(r, 800))
    setRefreshing(false)
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.g100 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.blueMid} />}>

      {/* Summary banner */}
      {totalDue > 0 && (
        <View style={s.banner}>
          <View>
            <Text style={s.bannerLabel}>{unpaid.length} bill{unpaid.length > 1 ? 's' : ''} outstanding</Text>
            <Text style={s.bannerAmt}>{inr(totalDue)}</Text>
          </View>
          <Feather name="alert-circle" size={28} color="rgba(255,255,255,.5)" />
        </View>
      )}

      {/* KPIs */}
      <View style={s.kpiRow}>
        {[
          ['Total Bills', bills.length, C.g900],
          ['Due', unpaid.length, C.amber],
          ['Paid', bills.filter(b => b.paid).length, C.green],
        ].map(([l, v, c]) => (
          <View key={l} style={s.kpi}>
            <Text style={[s.kpiVal, { color: c }]}>{v}</Text>
            <Text style={s.kpiLbl}>{l}</Text>
          </View>
        ))}
      </View>

      {/* Bill list */}
      <View style={s.listWrap}>
        <Text style={s.listH}>All Bills</Text>
        <View style={s.list}>
          {bills.map((b, i) => (
            <View key={b.id}>
              <BillRow bill={b} onPress={() => navigation.navigate('BillDetail', { bill: b })} />
              {i < bills.length - 1 && <View style={s.divider} />}
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  )
}

const s = StyleSheet.create({
  banner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: C.blueMid, padding: S.lg, marginBottom: 2 },
  bannerLabel: { fontSize: 12, color: 'rgba(255,255,255,.7)', fontWeight: '600', marginBottom: 3 },
  bannerAmt: { fontSize: 26, fontWeight: '800', color: '#fff', letterSpacing: -.4 },
  kpiRow: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: C.g100 },
  kpi: { flex: 1, alignItems: 'center', padding: S.lg, borderRightWidth: 1, borderRightColor: C.g100 },
  kpiVal: { fontSize: 22, fontWeight: '800', letterSpacing: -.4 },
  kpiLbl: { fontSize: 11, color: C.g500, fontWeight: '600', marginTop: 2 },
  listWrap: { padding: S.base, gap: S.sm },
  listH: { fontSize: 13, fontWeight: '800', color: C.g500, letterSpacing: .4, textTransform: 'uppercase' },
  list: { backgroundColor: '#fff', borderRadius: R.lg, borderWidth: 1, borderColor: C.g200, ...shadow.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: S.md, padding: S.md },
  rowIc: { width: 42, height: 42, borderRadius: R.md, alignItems: 'center', justifyContent: 'center' },
  rowPeriod: { fontSize: 13.5, fontWeight: '700', color: C.g900 },
  rowId: { fontSize: 11, color: C.g400, fontFamily: 'monospace', marginTop: 2 },
  rowAmt: { fontSize: 14, fontWeight: '800', color: C.g900, letterSpacing: -.2 },
  badge: { borderRadius: R.full, paddingHorizontal: 8, paddingVertical: 3 },
  badgeT: { fontSize: 10.5, fontWeight: '700' },
  divider: { height: 1, backgroundColor: C.g100, marginLeft: S.md + 42 + S.md },
})
