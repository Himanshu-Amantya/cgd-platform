import { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Modal, TextInput } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { C, S, R, shadow } from '../theme'

const inr = (n) => '₹' + Number(n || 0).toLocaleString('en-IN')

const PAYMENT_MODES = [
  { id: 'upi',  label: 'UPI',        icon: 'smartphone', sub: 'PhonePe, GPay, Paytm' },
  { id: 'card', label: 'Card',       icon: 'credit-card', sub: 'Debit / Credit Card' },
  { id: 'net',  label: 'Net Banking', icon: 'globe',      sub: 'All major banks' },
]

export default function BillDetailScreen({ route, navigation }) {
  const { bill } = route.params
  const [payOpen, setPayOpen] = useState(false)
  const [payMode, setPayMode] = useState('upi')

  const energy = bill.units * bill.rate
  const rows = [
    ['Units Consumed',       `${bill.prev} → ${bill.cur} m³ (${bill.units} m³)`],
    ['Energy Charge',        `${bill.units} × ₹${bill.rate}/m³ = ${inr(energy)}`],
    ['Fixed / Service Charge', inr(bill.fixed)],
  ]

  const pay = () => {
    setPayOpen(false)
    Alert.alert('Payment Successful', `${inr(bill.amount)} paid via ${payMode.toUpperCase()}.\nReceipt: TXN${Date.now().toString().slice(-8)}`, [
      { text: 'Done', onPress: () => navigation.goBack() },
    ])
  }

  const StatusBadge = () => {
    const map = { DUE: [C.amberPale, C.amber, 'Due'], OVERDUE: [C.redPale, C.red, 'Overdue'], PAID: [C.greenLight, C.green, 'Paid'] }
    const [bg, cl, label] = map[bill.status] || map.DUE
    return <View style={[s.statusBadge, { backgroundColor: bg }]}><Text style={[s.statusT, { color: cl }]}>{label}</Text></View>
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.g100 }}>
      <ScrollView contentContainerStyle={{ padding: S.base, gap: S.base }}>

        {/* Bill header */}
        <View style={s.card}>
          <View style={s.cardH}>
            <View style={s.billIc}><Feather name="file-text" size={22} color={C.blueMid} /></View>
            <View style={{ flex: 1 }}>
              <Text style={s.period}>{bill.period}</Text>
              <Text style={s.billId}>{bill.id}</Text>
            </View>
            <StatusBadge />
          </View>
          <View style={s.amtRow}>
            <Text style={s.amtLabel}>Bill Amount</Text>
            <Text style={s.amt}>{inr(bill.amount)}</Text>
          </View>
          {!bill.paid && <Text style={s.dueNote}>Due by {bill.dueDate}</Text>}
        </View>

        {/* Breakdown */}
        <View style={s.card}>
          <View style={s.sectionH}><Feather name="list" size={14} color={C.g500} /><Text style={s.sectionHT}>Bill Breakdown</Text></View>
          {rows.map(([k, v]) => (
            <View key={k} style={s.kv}>
              <Text style={s.kvK}>{k}</Text>
              <Text style={s.kvV}>{v}</Text>
            </View>
          ))}
          <View style={[s.kv, s.totalRow]}>
            <Text style={s.totalK}>Total Bill</Text>
            <Text style={s.totalV}>{inr(bill.amount)}</Text>
          </View>
        </View>

        {/* Meter readings */}
        <View style={s.card}>
          <View style={s.sectionH}><Feather name="activity" size={14} color={C.g500} /><Text style={s.sectionHT}>Meter Reading</Text></View>
          <View style={s.meterRow}>
            <View style={s.meterBox}>
              <Text style={s.meterLabel}>Previous</Text>
              <Text style={s.meterVal}>{bill.prev}</Text>
              <Text style={s.meterUnit}>m³</Text>
            </View>
            <Feather name="arrow-right" size={20} color={C.g300} />
            <View style={s.meterBox}>
              <Text style={s.meterLabel}>Current</Text>
              <Text style={[s.meterVal, { color: C.blueMid }]}>{bill.cur}</Text>
              <Text style={s.meterUnit}>m³</Text>
            </View>
            <View style={[s.meterBox, { backgroundColor: C.blueLight }]}>
              <Text style={s.meterLabel}>Consumed</Text>
              <Text style={[s.meterVal, { color: C.blue }]}>{bill.units}</Text>
              <Text style={s.meterUnit}>m³</Text>
            </View>
          </View>
        </View>

        {!bill.paid && <View style={{ height: 80 }} />}
      </ScrollView>

      {/* Pay button */}
      {!bill.paid && (
        <View style={s.footer}>
          <TouchableOpacity style={s.payBtn} onPress={() => setPayOpen(true)} activeOpacity={0.85}>
            <Feather name="credit-card" size={18} color="#fff" />
            <Text style={s.payBtnT}>Pay {inr(bill.amount)}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Payment modal */}
      <Modal visible={payOpen} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.modal}>
            <View style={s.modalH}>
              <Text style={s.modalTitle}>Choose Payment Method</Text>
              <TouchableOpacity onPress={() => setPayOpen(false)}><Feather name="x" size={20} color={C.g500} /></TouchableOpacity>
            </View>
            <Text style={s.modalSub}>Paying <Text style={{ fontWeight:'800', color:C.g900 }}>{inr(bill.amount)}</Text> for {bill.period}</Text>
            <View style={{ gap: S.sm, marginVertical: S.lg }}>
              {PAYMENT_MODES.map(m => (
                <TouchableOpacity key={m.id} style={[s.modeRow, payMode === m.id && s.modeOn]} onPress={() => setPayMode(m.id)}>
                  <View style={[s.modeIc, payMode === m.id && { backgroundColor: C.blueLight }]}>
                    <Feather name={m.icon} size={18} color={payMode === m.id ? C.blueMid : C.g500} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.modeLbl, payMode === m.id && { color: C.blueMid }]}>{m.label}</Text>
                    <Text style={s.modeSub}>{m.sub}</Text>
                  </View>
                  <View style={[s.radio, payMode === m.id && s.radioOn]}>
                    {payMode === m.id && <View style={s.radioDot} />}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={s.payBtn} onPress={pay} activeOpacity={0.85}>
              <Text style={s.payBtnT}>Confirm & Pay {inr(bill.amount)}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const s = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: R.lg, borderWidth: 1, borderColor: C.g200, ...shadow.sm, overflow: 'hidden' },
  cardH: { flexDirection: 'row', alignItems: 'center', gap: S.md, padding: S.md, borderBottomWidth: 1, borderBottomColor: C.g100 },
  billIc: { width: 46, height: 46, borderRadius: R.md, backgroundColor: C.blueLight, alignItems: 'center', justifyContent: 'center' },
  period: { fontSize: 15, fontWeight: '800', color: C.g900 },
  billId: { fontSize: 11, color: C.g400, fontFamily: 'monospace', marginTop: 2 },
  statusBadge: { borderRadius: R.full, paddingHorizontal: 10, paddingVertical: 4 },
  statusT: { fontSize: 11, fontWeight: '700' },
  amtRow: { padding: S.md },
  amtLabel: { fontSize: 12, color: C.g500, fontWeight: '600', marginBottom: 4 },
  amt: { fontSize: 32, fontWeight: '800', color: C.g900, letterSpacing: -.8 },
  dueNote: { fontSize: 12, color: C.amber, fontWeight: '600', paddingHorizontal: S.md, paddingBottom: S.md },
  sectionH: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: S.md, borderBottomWidth: 1, borderBottomColor: C.g100 },
  sectionHT: { fontSize: 12.5, fontWeight: '700', color: C.g500, textTransform: 'uppercase', letterSpacing: .4 },
  kv: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: S.md, paddingVertical: S.md, borderBottomWidth: 1, borderBottomColor: C.g100 },
  kvK: { fontSize: 12.5, color: C.g500, flex: 1 },
  kvV: { fontSize: 12.5, fontWeight: '600', color: C.g800, textAlign: 'right', flex: 1 },
  totalRow: { borderBottomWidth: 0, backgroundColor: C.blueLight },
  totalK: { fontSize: 14, fontWeight: '800', color: C.g900 },
  totalV: { fontSize: 18, fontWeight: '800', color: C.blueMid },
  meterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', padding: S.lg, gap: S.sm },
  meterBox: { flex: 1, alignItems: 'center', backgroundColor: C.g50, borderRadius: R.md, padding: S.md },
  meterLabel: { fontSize: 10, color: C.g400, fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 },
  meterVal: { fontSize: 22, fontWeight: '800', color: C.g900 },
  meterUnit: { fontSize: 10, color: C.g400, fontWeight: '600' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: S.base, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: C.g100 },
  payBtn: { flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: C.blueMid, borderRadius: R.lg, padding: 16, ...shadow.md },
  payBtnT: { fontSize: 15, fontWeight: '700', color: '#fff' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15,23,42,.5)', justifyContent: 'flex-end' },
  modal: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: S.xl, paddingBottom: 40 },
  modalH: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: S.xs },
  modalTitle: { fontSize: 18, fontWeight: '800', color: C.g900 },
  modalSub: { fontSize: 13, color: C.g500, marginBottom: 4 },
  modeRow: { flexDirection: 'row', alignItems: 'center', gap: S.md, padding: S.md, borderRadius: R.lg, borderWidth: 1.5, borderColor: C.g200 },
  modeOn: { borderColor: C.blueMid, backgroundColor: C.blueLight + '66' },
  modeIc: { width: 40, height: 40, borderRadius: R.md, backgroundColor: C.g100, alignItems: 'center', justifyContent: 'center' },
  modeLbl: { fontSize: 14, fontWeight: '700', color: C.g900 },
  modeSub: { fontSize: 11.5, color: C.g400, marginTop: 2 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: C.g300, alignItems: 'center', justifyContent: 'center' },
  radioOn: { borderColor: C.blueMid },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: C.blueMid },
})
