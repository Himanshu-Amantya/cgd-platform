import { useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Modal, Animated,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Feather } from '@expo/vector-icons'
import { C, S, R, shadow } from '../theme'
import { paidBills } from '../store'

const inr = (n) => '₹' + Number(n || 0).toLocaleString('en-IN')

const METHODS = [
  { id: 'upi',  label: 'UPI',         sub: 'PhonePe · GPay · Paytm',  icon: 'smartphone' },
  { id: 'card', label: 'Debit / Credit Card', sub: 'Visa · Mastercard · RuPay', icon: 'credit-card' },
  { id: 'net',  label: 'Net Banking',  sub: 'All major banks supported',icon: 'globe' },
]

const STATUS_MAP = {
  DUE:     { bg: '#FEF3C7', color: C.amber,    border: '#FDE68A', label: 'Due' },
  OVERDUE: { bg: '#FEE2E2', color: C.red,      border: '#FECACA', label: 'Overdue' },
  PAID:    { bg: '#DCFCE7', color: C.greenMid, border: '#BBF7D0', label: 'Paid' },
}

function SectionHead({ icon, title }) {
  return (
    <View style={s.secHead}>
      <View style={s.secIc}><Feather name={icon} size={14} color={C.blueMid} /></View>
      <Text style={s.secTitle}>{title}</Text>
    </View>
  )
}

export default function BillDetailScreen({ route, navigation }) {
  const { bill } = route.params
  const [method, setMethod]     = useState('upi')
  const [modalOpen, setModal]   = useState(false)
  const [success, setSuccess]   = useState(false)
  const [isPaid, setIsPaid]     = useState(bill.paid || paidBills.has(bill.id))

  const energy = bill.units * bill.rate
  const txnId  = 'TXN' + bill.id.slice(-6) + Math.floor(Math.random() * 9000 + 1000)
  const st = STATUS_MAP[isPaid ? 'PAID' : bill.status] || STATUS_MAP.DUE

  const confirmPay = () => {
    setModal(false)
    paidBills.add(bill.id)
    setIsPaid(true)
    setSuccess(true)
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F0F4F8' }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: isPaid ? 24 : 100 }}>

        {/* ── GRADIENT HEADER ── */}
        <LinearGradient colors={[C.navy, C.navy2, C.navy3]} style={s.header} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={s.hDec1} /><View style={s.hDec2} />
          <View style={s.hRow}>
            <View style={s.hIcon}>
              <Feather name="file-text" size={20} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.hPeriod}>{bill.period}</Text>
              <Text style={s.hId}>{bill.id}</Text>
            </View>
            <View style={[s.stBadge, { backgroundColor: st.bg, borderColor: st.border }]}>
              <Text style={[s.stT, { color: st.color }]}>{isPaid ? 'Paid' : st.label}</Text>
            </View>
          </View>
          <Text style={s.hAmtLabel}>BILL AMOUNT</Text>
          <Text style={s.hAmt}>{inr(bill.amount)}</Text>
          {!isPaid && <Text style={s.hDue}>Due by {bill.dueDate}</Text>}
        </LinearGradient>

        <View style={s.body}>

          {/* ── METER READINGS ── */}
          <View style={s.card}>
            <SectionHead icon="activity" title="Meter Readings" />
            <View style={s.meterRow}>
              <View style={s.mBox}>
                <Text style={s.mLabel}>Previous</Text>
                <Text style={s.mVal}>{bill.prev}</Text>
                <Text style={s.mUnit}>m³</Text>
              </View>
              <View style={s.mArrow}>
                <Feather name="arrow-right" size={18} color={C.g300} />
              </View>
              <View style={s.mBox}>
                <Text style={s.mLabel}>Current</Text>
                <Text style={[s.mVal, { color: C.blueMid }]}>{bill.cur}</Text>
                <Text style={s.mUnit}>m³</Text>
              </View>
              <View style={s.mArrow}>
                <Feather name="zap" size={14} color={C.indigo} />
              </View>
              <LinearGradient colors={[C.blueMid, C.indigo]} style={s.mBoxActive}>
                <Text style={s.mLabelW}>Used</Text>
                <Text style={s.mValW}>{bill.units}</Text>
                <Text style={s.mUnitW}>m³</Text>
              </LinearGradient>
            </View>
          </View>

          {/* ── BILL BREAKDOWN ── */}
          <View style={s.card}>
            <SectionHead icon="list" title="Bill Breakdown" />
            <View style={s.rows}>
              <Row label="Energy Charge" value={`${bill.units} m³ × ₹${bill.rate}`} amount={inr(energy)} />
              <Row label="Fixed / Service Charge" value="Monthly" amount={inr(bill.fixed)} />
              <View style={s.totalRow}>
                <View style={{ flex: 1 }}>
                  <Text style={s.totalLabel}>Total Amount</Text>
                  <Text style={s.totalSub}>Including all taxes</Text>
                </View>
                <Text style={s.totalAmt}>{inr(bill.amount)}</Text>
              </View>
            </View>
          </View>

          {/* ── PAYMENT INFO (if paid) ── */}
          {isPaid && (
            <View style={s.paidCard}>
              <LinearGradient colors={['#DCFCE7', '#F0FDF4']} style={s.paidInner}>
                <View style={s.paidIcWrap}>
                  <Feather name="check-circle" size={28} color={C.greenMid} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.paidT}>Payment Received</Text>
                  <Text style={s.paidSub}>Thank you! This bill has been cleared.</Text>
                </View>
              </LinearGradient>
            </View>
          )}

        </View>
      </ScrollView>

      {/* ── PAY BUTTON ── */}
      {!isPaid && (
        <View style={s.footer}>
          <TouchableOpacity activeOpacity={0.88} onPress={() => setModal(true)}>
            <LinearGradient colors={[C.blueMid, C.indigo]} style={s.payBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Feather name="credit-card" size={18} color="#fff" />
              <Text style={s.payBtnT}>Pay {inr(bill.amount)}</Text>
              <Feather name="arrow-right" size={16} color="rgba(255,255,255,.65)" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {/* ── PAYMENT METHOD MODAL ── */}
      <Modal visible={modalOpen} transparent animationType="slide">
        <View style={s.overlay}>
          <View style={s.sheet}>
            <View style={s.sheetHandle} />
            <View style={s.sheetHead}>
              <View>
                <Text style={s.sheetTitle}>Choose Payment Method</Text>
                <Text style={s.sheetSub}>Paying <Text style={{ fontWeight: '900', color: C.g900 }}>{inr(bill.amount)}</Text> · {bill.period}</Text>
              </View>
              <TouchableOpacity onPress={() => setModal(false)} style={s.closeBtn}>
                <Feather name="x" size={18} color={C.g500} />
              </TouchableOpacity>
            </View>

            <View style={s.methods}>
              {METHODS.map(m => (
                <TouchableOpacity key={m.id} style={[s.method, method === m.id && s.methodOn]} onPress={() => setMethod(m.id)} activeOpacity={0.8}>
                  <View style={[s.methodIc, method === m.id && { backgroundColor: C.blueLight }]}>
                    <Feather name={m.icon} size={20} color={method === m.id ? C.blueMid : C.g500} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.methodLabel, method === m.id && { color: C.blueMid }]}>{m.label}</Text>
                    <Text style={s.methodSub}>{m.sub}</Text>
                  </View>
                  <View style={[s.radio, method === m.id && s.radioOn]}>
                    {method === m.id && <View style={s.radioDot} />}
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity activeOpacity={0.88} onPress={confirmPay}>
              <LinearGradient colors={[C.blueMid, C.indigo]} style={s.confirmBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Feather name="lock" size={15} color="rgba(255,255,255,.8)" />
                <Text style={s.confirmT}>Confirm & Pay {inr(bill.amount)}</Text>
              </LinearGradient>
            </TouchableOpacity>

            <Text style={s.secureNote}>🔒  256-bit encrypted · PNGRB compliant</Text>
          </View>
        </View>
      </Modal>

      {/* ── SUCCESS OVERLAY ── */}
      {success && (
        <View style={s.successOverlay}>
          <LinearGradient colors={[C.navy, '#065F46']} style={s.successGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <View style={s.successIc}>
              <Feather name="check" size={40} color="#fff" />
            </View>
            <Text style={s.successTitle}>Payment Successful!</Text>
            <Text style={s.successAmt}>{inr(bill.amount)}</Text>
            <Text style={s.successSub}>{bill.period} · {bill.id}</Text>

            <View style={s.txnCard}>
              <View style={s.txnRow}>
                <Text style={s.txnK}>Transaction ID</Text>
                <Text style={s.txnV}>{txnId}</Text>
              </View>
              <View style={s.txnRow}>
                <Text style={s.txnK}>Payment Method</Text>
                <Text style={s.txnV}>{METHODS.find(m => m.id === method)?.label}</Text>
              </View>
              <View style={[s.txnRow, { borderBottomWidth: 0 }]}>
                <Text style={s.txnK}>Status</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <View style={s.greenDot} />
                  <Text style={[s.txnV, { color: C.leaf }]}>Confirmed</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity style={s.doneBtn} onPress={() => { setSuccess(false); navigation.navigate('BillsList', { paidId: bill.id }) }} activeOpacity={0.88}>
              <Text style={s.doneBtnT}>Back to Bills</Text>
              <Feather name="arrow-right" size={16} color={C.navy} />
            </TouchableOpacity>
          </LinearGradient>
        </View>
      )}
    </View>
  )
}

function Row({ label, value, amount }) {
  return (
    <View style={s.row}>
      <View style={{ flex: 1 }}>
        <Text style={s.rowLabel}>{label}</Text>
        <Text style={s.rowSub}>{value}</Text>
      </View>
      <Text style={s.rowAmt}>{amount}</Text>
    </View>
  )
}

const s = StyleSheet.create({
  // Header
  header: { paddingTop: 22, paddingBottom: 28, paddingHorizontal: S.xl, overflow: 'hidden' },
  hDec1: { position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,.05)' },
  hDec2: { position: 'absolute', bottom: 0, left: 80, width: 120, height: 60, borderRadius: 60, backgroundColor: 'rgba(79,70,229,.2)' },
  hRow: { flexDirection: 'row', alignItems: 'center', gap: S.md, marginBottom: S.lg },
  hIcon: { width: 44, height: 44, borderRadius: 13, backgroundColor: 'rgba(255,255,255,.15)', alignItems: 'center', justifyContent: 'center' },
  hPeriod: { fontSize: 16, fontWeight: '800', color: '#fff', letterSpacing: -.2 },
  hId: { fontSize: 11, color: 'rgba(255,255,255,.45)', fontFamily: 'monospace', marginTop: 2 },
  stBadge: { borderRadius: R.full, paddingHorizontal: 11, paddingVertical: 5, borderWidth: 1 },
  stT: { fontSize: 11.5, fontWeight: '700' },
  hAmtLabel: { fontSize: 10.5, color: 'rgba(255,255,255,.4)', fontWeight: '700', letterSpacing: .8, marginBottom: 5 },
  hAmt: { fontSize: 38, fontWeight: '900', color: '#fff', letterSpacing: -1 },
  hDue: { fontSize: 12.5, color: 'rgba(255,255,255,.5)', marginTop: 5 },

  // Body
  body: { padding: S.base, gap: S.md },

  // Card
  card: { backgroundColor: '#fff', borderRadius: R.xl, overflow: 'hidden', borderWidth: 1, borderColor: C.g100, ...shadow.sm },
  secHead: { flexDirection: 'row', alignItems: 'center', gap: S.sm, padding: S.lg, borderBottomWidth: 1, borderBottomColor: C.g100 },
  secIc: { width: 30, height: 30, borderRadius: 9, backgroundColor: C.blueLight, alignItems: 'center', justifyContent: 'center' },
  secTitle: { fontSize: 13, fontWeight: '800', color: C.g700, letterSpacing: -.1 },

  // Meter
  meterRow: { flexDirection: 'row', alignItems: 'center', padding: S.lg, gap: S.sm },
  mBox: { flex: 1, alignItems: 'center', backgroundColor: C.g50, borderRadius: R.lg, paddingVertical: S.md },
  mLabel: { fontSize: 9.5, color: C.g400, fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 },
  mVal: { fontSize: 22, fontWeight: '900', color: C.g900 },
  mUnit: { fontSize: 10, color: C.g400, fontWeight: '600' },
  mArrow: { alignItems: 'center', justifyContent: 'center' },
  mBoxActive: { flex: 1, alignItems: 'center', borderRadius: R.lg, paddingVertical: S.md, ...shadow.blue },
  mLabelW: { fontSize: 9.5, color: 'rgba(255,255,255,.6)', fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 },
  mValW: { fontSize: 22, fontWeight: '900', color: '#fff' },
  mUnitW: { fontSize: 10, color: 'rgba(255,255,255,.65)', fontWeight: '600' },

  // Bill rows
  rows: { padding: S.base, gap: S.sm },
  row: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: S.sm },
  rowLabel: { fontSize: 13.5, fontWeight: '600', color: C.g800 },
  rowSub: { fontSize: 11.5, color: C.g400, marginTop: 2 },
  rowAmt: { fontSize: 14, fontWeight: '700', color: C.g900 },
  totalRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.blueLight, borderRadius: R.lg, padding: S.md, marginTop: S.sm },
  totalLabel: { fontSize: 14, fontWeight: '800', color: C.g900 },
  totalSub: { fontSize: 11.5, color: C.g500, marginTop: 2 },
  totalAmt: { fontSize: 22, fontWeight: '900', color: C.blueMid },

  // Paid card
  paidCard: { borderRadius: R.xl, overflow: 'hidden', borderWidth: 1, borderColor: '#BBF7D0', ...shadow.sm },
  paidInner: { flexDirection: 'row', alignItems: 'center', gap: S.md, padding: S.lg },
  paidIcWrap: {},
  paidT: { fontSize: 14, fontWeight: '800', color: C.green },
  paidSub: { fontSize: 12, color: C.greenMid, marginTop: 3 },

  // Footer
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: C.g100, padding: S.base, paddingBottom: 28 },
  payBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderRadius: R.lg, paddingVertical: 16, ...shadow.blue },
  payBtnT: { fontSize: 16, fontWeight: '800', color: '#fff', flex: 1, textAlign: 'center' },

  // Modal / Sheet
  overlay: { flex: 1, backgroundColor: 'rgba(11,24,41,.6)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: S.xl, paddingBottom: 36 },
  sheetHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: C.g200, alignSelf: 'center', marginBottom: S.lg },
  sheetHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: S.xl },
  sheetTitle: { fontSize: 20, fontWeight: '900', color: C.g900, letterSpacing: -.4 },
  sheetSub: { fontSize: 13, color: C.g500, marginTop: 4 },
  closeBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: C.g100, alignItems: 'center', justifyContent: 'center' },
  methods: { gap: S.sm, marginBottom: S.lg },
  method: { flexDirection: 'row', alignItems: 'center', gap: S.md, padding: S.md, borderRadius: R.xl, borderWidth: 1.5, borderColor: C.g200 },
  methodOn: { borderColor: C.blueMid, backgroundColor: '#EFF6FF' },
  methodIc: { width: 44, height: 44, borderRadius: R.lg, backgroundColor: C.g100, alignItems: 'center', justifyContent: 'center' },
  methodLabel: { fontSize: 14, fontWeight: '800', color: C.g900, letterSpacing: -.1 },
  methodSub: { fontSize: 11.5, color: C.g400, marginTop: 2 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: C.g300, alignItems: 'center', justifyContent: 'center' },
  radioOn: { borderColor: C.blueMid },
  radioDot: { width: 11, height: 11, borderRadius: 6, backgroundColor: C.blueMid },
  confirmBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: R.lg, paddingVertical: 16, marginBottom: S.md, ...shadow.blue },
  confirmT: { fontSize: 15.5, fontWeight: '800', color: '#fff' },
  secureNote: { fontSize: 11.5, color: C.g400, textAlign: 'center', fontWeight: '500' },

  // Success overlay
  successOverlay: { position: 'absolute', inset: 0, top: 0, left: 0, right: 0, bottom: 0 },
  successGrad: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: S['2xl'] },
  successIc: { width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(255,255,255,.15)', alignItems: 'center', justifyContent: 'center', marginBottom: S.xl, borderWidth: 2, borderColor: 'rgba(255,255,255,.2)' },
  successTitle: { fontSize: 26, fontWeight: '900', color: '#fff', letterSpacing: -.5, marginBottom: S.sm },
  successAmt: { fontSize: 44, fontWeight: '900', color: '#fff', letterSpacing: -1.5, marginBottom: S.xs },
  successSub: { fontSize: 14, color: 'rgba(255,255,255,.55)', marginBottom: S['2xl'] },
  txnCard: { backgroundColor: 'rgba(255,255,255,.12)', borderRadius: R.xl, width: '100%', padding: S.lg, marginBottom: S['2xl'] },
  txnRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,.1)' },
  txnK: { fontSize: 13, color: 'rgba(255,255,255,.5)', fontWeight: '600' },
  txnV: { fontSize: 13, fontWeight: '800', color: '#fff', fontFamily: 'monospace' },
  greenDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: C.leaf },
  doneBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff', borderRadius: R.full, paddingHorizontal: 32, paddingVertical: 14 },
  doneBtnT: { fontSize: 15, fontWeight: '800', color: C.navy },
})
