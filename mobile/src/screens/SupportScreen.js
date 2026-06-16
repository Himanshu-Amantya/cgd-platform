import { useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Modal, TextInput, Alert, KeyboardAvoidingView, Platform,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Feather } from '@expo/vector-icons'
import { C, S, R, shadow } from '../theme'
import { MOCK_COMPLAINTS, COMPLAINT_CATEGORIES } from '../mock'
import { raisedComplaints } from '../store'

const STATUS = {
  OPEN:      { label: 'Open',      bg: '#FEF3C7', color: C.amber,   border: '#FDE68A' },
  IN_REVIEW: { label: 'In Review', bg: '#EFF6FF', color: C.blueMid, border: '#BFDBFE' },
  ASSIGNED:  { label: 'Assigned',  bg: '#F5F3FF', color: C.purple,  border: '#DDD6FE' },
  RESOLVED:  { label: 'Resolved',  bg: '#F0FDFA', color: C.teal,    border: '#99F6E4' },
  CLOSED:    { label: 'Closed',    bg: '#DCFCE7', color: C.greenMid,border: '#BBF7D0' },
}

const STATS = [['24h', 'Response', '⏱'], ['98%', 'Resolved', '✓'], ['4.8★', 'Rating', '⭐']]

function ComplaintCard({ c }) {
  const st = STATUS[c.status] || STATUS.OPEN
  return (
    <View style={s.cCard}>
      <View style={s.cTop}>
        <View style={[s.cStatusDot, { backgroundColor: st.color }]} />
        <View style={{ flex: 1 }}>
          <Text style={s.cSubject}>{c.subject}</Text>
          <Text style={s.cId}>{c.id}</Text>
        </View>
        <View style={[s.cBadge, { backgroundColor: st.bg, borderColor: st.border }]}>
          <Text style={[s.cBadgeT, { color: st.color }]}>{st.label}</Text>
        </View>
      </View>
      <View style={s.cFoot}>
        <View style={s.catPill}>
          <Text style={s.catPillT}>{c.category}</Text>
        </View>
        <Text style={s.cDate}>Raised {c.raised}</Text>
      </View>
    </View>
  )
}

export default function SupportScreen() {
  const [complaints, setComplaints] = useState([...raisedComplaints, ...MOCK_COMPLAINTS])
  const [modalOpen, setModal]       = useState(false)
  const [category, setCategory]     = useState(COMPLAINT_CATEGORIES[0])
  const [subject, setSubject]       = useState('')
  const [detail, setDetail]         = useState('')
  const [submitted, setSubmitted]   = useState(false)
  const [newCmp, setNewCmp]         = useState(null)

  const canSubmit = subject.trim().length > 3 && detail.trim().length > 5

  const raise = () => {
    if (!canSubmit) return
    const c = {
      id:      'CMP' + Math.floor(60500 + Math.random() * 9999),
      subject: subject.trim(),
      category,
      detail:  detail.trim(),
      status:  'OPEN',
      raised:  new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    }
    raisedComplaints.unshift(c)
    setComplaints([c, ...complaints])
    setNewCmp(c)
    setSubmitted(true)
    setSubject(''); setDetail(''); setCategory(COMPLAINT_CATEGORIES[0])
  }

  const closeModal = () => { setModal(false); setSubmitted(false); setNewCmp(null) }

  return (
    <View style={{ flex: 1, backgroundColor: '#F0F4F8' }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        {/* ── HEADER ── */}
        <LinearGradient colors={[C.navy, C.navy2, C.navy3]} style={s.header} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={s.hDec1} /><View style={s.hDec2} />
          <Text style={s.hTitle}>Support Center</Text>
          <Text style={s.hSub}>We're here to help you 24/7</Text>
          <View style={s.statsRow}>
            {STATS.map(([v, l, e]) => (
              <View key={l} style={s.statCard}>
                <Text style={s.statVal}>{v}</Text>
                <Text style={s.statLabel}>{l}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        <View style={s.body}>

          {/* Helpline banner */}
          <View style={s.helpCard}>
            <LinearGradient colors={['#F0FDF4', '#DCFCE7']} style={s.helpInner}>
              <View style={s.helpIc}>
                <Feather name="phone-call" size={20} color={C.greenMid} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.helpTitle}>24/7 Helpline</Text>
                <Text style={s.helpNum}>1800-419-1906 · Toll Free</Text>
              </View>
              <TouchableOpacity style={s.callBtn}>
                <Text style={s.callBtnT}>Call</Text>
                <Feather name="arrow-right" size={13} color={C.greenMid} />
              </TouchableOpacity>
            </LinearGradient>
          </View>

          {/* My Complaints */}
          <View style={s.section}>
            <View style={s.sectionTop}>
              <Text style={s.sectionH}>My Complaints</Text>
              {complaints.length > 0 && (
                <View style={s.countPill}><Text style={s.countT}>{complaints.length}</Text></View>
              )}
            </View>

            {complaints.length === 0 ? (
              <View style={s.emptyCard}>
                <Feather name="check-circle" size={44} color={C.g300} />
                <Text style={s.emptyH}>No complaints yet</Text>
                <Text style={s.emptySub}>Everything looks good — tap below to raise one if needed.</Text>
              </View>
            ) : (
              <View style={{ gap: S.sm }}>
                {complaints.map(c => <ComplaintCard key={c.id} c={c} />)}
              </View>
            )}
          </View>

        </View>
      </ScrollView>

      {/* ── FAB ── */}
      <View style={s.fabWrap}>
        <TouchableOpacity activeOpacity={0.88} onPress={() => setModal(true)}>
          <LinearGradient colors={[C.blueMid, C.indigo]} style={s.fab} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Feather name="plus" size={20} color="#fff" />
            <Text style={s.fabT}>Raise a Complaint</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* ── NEW COMPLAINT MODAL ── */}
      <Modal visible={modalOpen} transparent animationType="slide">
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={s.overlay}>
            <View style={s.sheet}>
              <View style={s.sheetHandle} />

              {submitted && newCmp ? (
                /* ── SUCCESS STATE ── */
                <View style={s.successWrap}>
                  <LinearGradient colors={[C.blueMid, C.indigo]} style={s.successIc}>
                    <Feather name="check" size={30} color="#fff" />
                  </LinearGradient>
                  <Text style={s.successTitle}>Complaint Raised!</Text>
                  <Text style={s.successId}>{newCmp.id}</Text>
                  <Text style={s.successMsg}>Our team will review and respond within <Text style={{ fontWeight: '800' }}>24 hours</Text>.</Text>
                  <View style={s.successDetail}>
                    <DetailRow k="Category" v={newCmp.category} />
                    <DetailRow k="Subject" v={newCmp.subject} />
                    <DetailRow k="Status" v="Open — under review" color={C.amber} />
                  </View>
                  <TouchableOpacity activeOpacity={0.88} onPress={closeModal}>
                    <LinearGradient colors={[C.blueMid, C.indigo]} style={s.doneBtn}>
                      <Text style={s.doneBtnT}>Done</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              ) : (
                /* ── FORM STATE ── */
                <>
                  <View style={s.sheetHead}>
                    <Text style={s.sheetTitle}>Raise a Complaint</Text>
                    <TouchableOpacity onPress={closeModal} style={s.closeBtn}>
                      <Feather name="x" size={18} color={C.g500} />
                    </TouchableOpacity>
                  </View>

                  <Text style={s.fieldLabel}>Category</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: S.lg }}>
                    <View style={{ flexDirection: 'row', gap: S.sm }}>
                      {COMPLAINT_CATEGORIES.map(cat => (
                        <TouchableOpacity key={cat} style={[s.catBtn, category === cat && s.catBtnOn]} onPress={() => setCategory(cat)}>
                          <Text style={[s.catBtnT, category === cat && { color: C.blueMid }]}>{cat}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>

                  <Text style={s.fieldLabel}>Subject <Text style={s.required}>*</Text></Text>
                  <TextInput
                    style={s.input}
                    placeholder="Brief subject of the complaint"
                    placeholderTextColor={C.g400}
                    value={subject}
                    onChangeText={setSubject}
                  />

                  <Text style={s.fieldLabel}>Details <Text style={s.required}>*</Text></Text>
                  <TextInput
                    style={[s.input, { height: 88, textAlignVertical: 'top' }]}
                    placeholder="Describe the issue in detail…"
                    placeholderTextColor={C.g400}
                    value={detail}
                    onChangeText={setDetail}
                    multiline
                  />

                  <TouchableOpacity activeOpacity={canSubmit ? 0.88 : 1} onPress={raise} disabled={!canSubmit}>
                    <LinearGradient
                      colors={canSubmit ? [C.blueMid, C.indigo] : [C.g300, C.g300]}
                      style={[s.submitBtn, !canSubmit && { opacity: .5 }]}
                      start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                      <Feather name="send" size={16} color="#fff" />
                      <Text style={s.submitBtnT}>Submit Complaint</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  )
}

function DetailRow({ k, v, color }) {
  return (
    <View style={s.detailRow}>
      <Text style={s.detailK}>{k}</Text>
      <Text style={[s.detailV, color && { color }]}>{v}</Text>
    </View>
  )
}

const s = StyleSheet.create({
  // Header
  header: { paddingTop: 22, paddingBottom: 28, paddingHorizontal: S.xl, overflow: 'hidden' },
  hDec1: { position: 'absolute', top: -30, right: -30, width: 130, height: 130, borderRadius: 65, backgroundColor: 'rgba(255,255,255,.05)' },
  hDec2: { position: 'absolute', bottom: 0, left: 40, width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(79,70,229,.2)' },
  hTitle: { fontSize: 24, fontWeight: '900', color: '#fff', letterSpacing: -.5, marginBottom: 4 },
  hSub: { fontSize: 13, color: 'rgba(255,255,255,.45)', marginBottom: S.xl },
  statsRow: { flexDirection: 'row', gap: S.sm },
  statCard: { flex: 1, backgroundColor: 'rgba(255,255,255,.1)', borderRadius: R.lg, padding: S.md, alignItems: 'center' },
  statVal: { fontSize: 18, fontWeight: '900', color: '#fff', letterSpacing: -.3 },
  statLabel: { fontSize: 10.5, color: 'rgba(255,255,255,.5)', fontWeight: '600', marginTop: 2 },

  // Body
  body: { padding: S.base, gap: S.lg },

  // Helpline
  helpCard: { borderRadius: R.xl, overflow: 'hidden', borderWidth: 1, borderColor: '#BBF7D0', ...shadow.sm },
  helpInner: { flexDirection: 'row', alignItems: 'center', gap: S.md, padding: S.lg },
  helpIc: { width: 46, height: 46, borderRadius: R.lg, backgroundColor: 'rgba(22,163,74,.12)', alignItems: 'center', justifyContent: 'center' },
  helpTitle: { fontSize: 14.5, fontWeight: '800', color: C.g900 },
  helpNum: { fontSize: 12, color: C.g500, marginTop: 2 },
  callBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#DCFCE7', borderRadius: R.lg, paddingHorizontal: 14, paddingVertical: 8 },
  callBtnT: { fontSize: 13, fontWeight: '800', color: C.greenMid },

  // Section
  section: { gap: S.sm },
  sectionTop: { flexDirection: 'row', alignItems: 'center', gap: S.sm },
  sectionH: { fontSize: 15.5, fontWeight: '800', color: C.g900, flex: 1 },
  countPill: { backgroundColor: C.blueLight, borderRadius: R.full, width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  countT: { fontSize: 11, fontWeight: '800', color: C.blueMid },

  // Empty
  emptyCard: { backgroundColor: '#fff', borderRadius: R.xl, padding: S['2xl'], alignItems: 'center', gap: S.md, borderWidth: 1, borderColor: C.g100, ...shadow.sm },
  emptyH: { fontSize: 16, fontWeight: '800', color: C.g700 },
  emptySub: { fontSize: 13, color: C.g400, textAlign: 'center', lineHeight: 19 },

  // Complaint card
  cCard: { backgroundColor: '#fff', borderRadius: R.xl, padding: S.md, gap: S.sm, borderWidth: 1, borderColor: C.g100, ...shadow.sm },
  cTop: { flexDirection: 'row', alignItems: 'flex-start', gap: S.sm },
  cStatusDot: { width: 9, height: 9, borderRadius: 5, marginTop: 5 },
  cSubject: { fontSize: 13.5, fontWeight: '700', color: C.g900, lineHeight: 19, flex: 1 },
  cId: { fontSize: 10.5, color: C.g400, fontFamily: 'monospace', marginTop: 2 },
  cBadge: { borderRadius: R.full, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, flexShrink: 0 },
  cBadgeT: { fontSize: 10.5, fontWeight: '700' },
  cFoot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft: S.lg },
  catPill: { backgroundColor: C.g100, borderRadius: R.full, paddingHorizontal: 10, paddingVertical: 3 },
  catPillT: { fontSize: 11, color: C.g600, fontWeight: '600' },
  cDate: { fontSize: 11, color: C.g400 },

  // FAB
  fabWrap: { position: 'absolute', bottom: 20, left: S.xl, right: S.xl },
  fab: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderRadius: R.full, paddingVertical: 16, ...shadow.blue },
  fabT: { fontSize: 15, fontWeight: '800', color: '#fff' },

  // Modal
  overlay: { flex: 1, backgroundColor: 'rgba(11,24,41,.6)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: S.xl, paddingBottom: 36 },
  sheetHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: C.g200, alignSelf: 'center', marginBottom: S.lg },
  sheetHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: S.xl },
  sheetTitle: { fontSize: 20, fontWeight: '900', color: C.g900, letterSpacing: -.4 },
  closeBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: C.g100, alignItems: 'center', justifyContent: 'center' },
  fieldLabel: { fontSize: 12, fontWeight: '800', color: C.g600, marginBottom: S.xs },
  required: { color: C.red },
  input: { backgroundColor: C.g50, borderWidth: 1.5, borderColor: C.g200, borderRadius: R.lg, padding: 13, fontSize: 13.5, color: C.g900, marginBottom: S.md },
  catBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: R.full, backgroundColor: C.g100, borderWidth: 1.5, borderColor: C.g200 },
  catBtnOn: { backgroundColor: C.blueLight, borderColor: C.blueMid },
  catBtnT: { fontSize: 13, fontWeight: '600', color: C.g600 },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: R.lg, paddingVertical: 15, marginTop: S.sm, ...shadow.blue },
  submitBtnT: { fontSize: 15, fontWeight: '800', color: '#fff' },

  // Success
  successWrap: { alignItems: 'center', paddingVertical: S.lg },
  successIc: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: S.xl, ...shadow.blue },
  successTitle: { fontSize: 22, fontWeight: '900', color: C.g900, letterSpacing: -.4, marginBottom: S.xs },
  successId: { fontSize: 13, fontWeight: '800', color: C.blueMid, fontFamily: 'monospace', marginBottom: S.sm },
  successMsg: { fontSize: 13.5, color: C.g500, textAlign: 'center', lineHeight: 20, marginBottom: S.xl },
  successDetail: { width: '100%', backgroundColor: C.g50, borderRadius: R.lg, padding: S.md, marginBottom: S.xl, gap: S.sm },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between' },
  detailK: { fontSize: 12.5, color: C.g500 },
  detailV: { fontSize: 12.5, fontWeight: '700', color: C.g900, flex: 1, textAlign: 'right' },
  doneBtn: { borderRadius: R.lg, paddingVertical: 14, paddingHorizontal: 48, ...shadow.blue },
  doneBtnT: { fontSize: 15, fontWeight: '800', color: '#fff' },
})
