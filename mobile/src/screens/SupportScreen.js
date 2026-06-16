import { useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Modal, TextInput, Alert, KeyboardAvoidingView, Platform,
} from 'react-native'
import { Feather } from '@expo/vector-icons'
import { C, S, R, shadow } from '../theme'
import { MOCK_COMPLAINTS, COMPLAINT_CATEGORIES } from '../mock'

const CSTATUS = {
  OPEN:      { label: 'Open',     bg: C.amberPale,   color: C.amber },
  IN_REVIEW: { label: 'In Review',bg: C.bluePale,    color: C.blueMid },
  ASSIGNED:  { label: 'Assigned', bg: C.purpleLight, color: C.purple },
  RESOLVED:  { label: 'Resolved', bg: C.tealLight,   color: C.teal },
  CLOSED:    { label: 'Closed',   bg: C.greenLight,  color: C.green },
}

export default function SupportScreen() {
  const [complaints, setComplaints] = useState(MOCK_COMPLAINTS)
  const [newOpen, setNewOpen] = useState(false)
  const [category, setCategory] = useState(COMPLAINT_CATEGORIES[0])
  const [subject, setSubject] = useState('')
  const [detail, setDetail] = useState('')

  const raise = () => {
    if (!subject.trim() || !detail.trim()) return Alert.alert('Required', 'Please fill in subject and details.')
    const c = {
      id: 'CMP' + Math.floor(60500 + Math.random() * 999),
      subject, category, detail,
      status: 'OPEN',
      raised: new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }),
    }
    setComplaints(cs => [c, ...cs])
    setNewOpen(false); setSubject(''); setDetail(''); setCategory(COMPLAINT_CATEGORIES[0])
    Alert.alert('Complaint Raised', c.id + '\nOur team will review and contact you within 24 hours.')
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.g100 }}>
      <ScrollView contentContainerStyle={{ padding: S.base, gap: S.base }}>

        {/* FAQ strip */}
        <View style={s.faqRow}>
          {[['24h', 'Response time'], ['98%', 'Resolution rate'], ['4.8★', 'Satisfaction']].map(([v, l]) => (
            <View key={l} style={s.faqCard}>
              <Text style={s.faqV}>{v}</Text>
              <Text style={s.faqL}>{l}</Text>
            </View>
          ))}
        </View>

        {/* Complaints */}
        <Text style={s.listH}>My Complaints</Text>
        {complaints.length === 0 && (
          <View style={s.empty}>
            <Feather name="check-circle" size={40} color={C.g300} />
            <Text style={s.emptyH}>No complaints</Text>
            <Text style={s.emptyS}>Everything looks good!</Text>
          </View>
        )}
        {complaints.map((c, i) => {
          const st = CSTATUS[c.status] || CSTATUS.OPEN
          return (
            <View key={c.id} style={s.card}>
              <View style={s.cardTop}>
                <View style={{ flex: 1, gap: 3 }}>
                  <Text style={s.cardId}>{c.id}</Text>
                  <Text style={s.cardSubject}>{c.subject}</Text>
                </View>
                <View style={[s.badge, { backgroundColor: st.bg }]}>
                  <Text style={[s.badgeT, { color: st.color }]}>{st.label}</Text>
                </View>
              </View>
              <View style={s.cardFoot}>
                <View style={s.catChip}>
                  <Text style={s.catChipT}>{c.category}</Text>
                </View>
                <Text style={s.cardDate}>Raised {c.raised}</Text>
              </View>
            </View>
          )
        })}

        {/* Helpline */}
        <View style={[s.card, { flexDirection:'row', alignItems:'center', gap: S.md, padding: S.md }]}>
          <View style={s.helpIc}><Feather name="phone" size={20} color={C.greenMid} /></View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize:13.5, fontWeight:'800', color:C.g900 }}>24/7 Helpline</Text>
            <Text style={{ fontSize:12, color:C.g500, marginTop:2 }}>1800-419-1906 (Toll free)</Text>
          </View>
          <TouchableOpacity style={s.callBtn}>
            <Text style={{ fontSize:12, fontWeight:'700', color:C.greenMid }}>Call Now</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={s.fab} onPress={() => setNewOpen(true)} activeOpacity={0.85}>
        <Feather name="plus" size={22} color="#fff" />
        <Text style={s.fabT}>Raise Complaint</Text>
      </TouchableOpacity>

      {/* New complaint modal */}
      <Modal visible={newOpen} transparent animationType="slide">
        <KeyboardAvoidingView style={{ flex:1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={s.modalOverlay}>
            <View style={s.modal}>
              <View style={s.modalH}>
                <Text style={s.modalTitle}>Raise a Complaint</Text>
                <TouchableOpacity onPress={() => setNewOpen(false)}><Feather name="x" size={20} color={C.g500} /></TouchableOpacity>
              </View>

              <Text style={s.fieldLabel}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: S.md }}>
                <View style={{ flexDirection:'row', gap: S.xs }}>
                  {COMPLAINT_CATEGORIES.map(cat => (
                    <TouchableOpacity key={cat} style={[s.catBtn, category === cat && s.catBtnOn]} onPress={() => setCategory(cat)}>
                      <Text style={[s.catBtnT, category === cat && { color: C.blueMid }]}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              <Text style={s.fieldLabel}>Subject *</Text>
              <TextInput style={s.textInput} placeholder="Brief subject of the complaint" placeholderTextColor={C.g400}
                value={subject} onChangeText={setSubject} />

              <Text style={s.fieldLabel}>Details *</Text>
              <TextInput style={[s.textInput, { height: 90, textAlignVertical:'top' }]}
                placeholder="Describe the issue in detail…" placeholderTextColor={C.g400}
                value={detail} onChangeText={setDetail} multiline />

              <TouchableOpacity style={[s.submitBtn, (!subject.trim() || !detail.trim()) && { opacity:.45 }]}
                onPress={raise} disabled={!subject.trim() || !detail.trim()}>
                <Feather name="send" size={16} color="#fff" />
                <Text style={s.submitT}>Submit Complaint</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  )
}

const s = StyleSheet.create({
  faqRow: { flexDirection:'row', gap: S.sm },
  faqCard: { flex:1, backgroundColor:'#fff', borderRadius:R.lg, padding: S.md, alignItems:'center', borderWidth:1, borderColor:C.g200, ...shadow.sm },
  faqV: { fontSize:18, fontWeight:'800', color:C.g900, letterSpacing:-.3 },
  faqL: { fontSize:10.5, color:C.g500, fontWeight:'600', textAlign:'center', marginTop:2 },
  listH: { fontSize:13, fontWeight:'800', color:C.g500, letterSpacing:.4, textTransform:'uppercase' },
  empty: { alignItems:'center', padding: S['3xl'], gap: S.sm },
  emptyH: { fontSize:16, fontWeight:'700', color:C.g600 },
  emptyS: { fontSize:13, color:C.g400 },
  card: { backgroundColor:'#fff', borderRadius:R.lg, borderWidth:1, borderColor:C.g200, padding: S.md, gap: S.sm, ...shadow.sm },
  cardTop: { flexDirection:'row', alignItems:'flex-start', gap: S.sm },
  cardId: { fontSize:10.5, color:C.g400, fontFamily:'monospace' },
  cardSubject: { fontSize:13.5, fontWeight:'700', color:C.g900, lineHeight:19 },
  badge: { borderRadius:R.full, paddingHorizontal:9, paddingVertical:4, alignSelf:'flex-start', flexShrink:0 },
  badgeT: { fontSize:10.5, fontWeight:'700' },
  cardFoot: { flexDirection:'row', alignItems:'center', justifyContent:'space-between' },
  catChip: { backgroundColor:C.g100, borderRadius:R.full, paddingHorizontal:9, paddingVertical:3 },
  catChipT: { fontSize:11, color:C.g600, fontWeight:'600' },
  cardDate: { fontSize:11, color:C.g400 },
  helpIc: { width:42, height:42, borderRadius:R.md, backgroundColor:C.greenLight, alignItems:'center', justifyContent:'center' },
  callBtn: { backgroundColor:C.greenLight, borderRadius:R.md, paddingHorizontal:12, paddingVertical:7, borderWidth:1, borderColor:'#BBF7D0' },
  fab: { position:'absolute', bottom: S.xl, right: S.xl, flexDirection:'row', alignItems:'center', gap: S.sm, backgroundColor:C.blueMid, borderRadius:R.full, paddingHorizontal: S.lg, paddingVertical:14, ...shadow.lg },
  fabT: { fontSize:14, fontWeight:'700', color:'#fff' },
  modalOverlay: { flex:1, justifyContent:'flex-end', backgroundColor:'rgba(15,23,42,.5)' },
  modal: { backgroundColor:'#fff', borderTopLeftRadius:24, borderTopRightRadius:24, padding: S.xl, paddingBottom:40 },
  modalH: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom: S.lg },
  modalTitle: { fontSize:18, fontWeight:'800', color:C.g900 },
  fieldLabel: { fontSize:12, fontWeight:'700', color:C.g600, marginBottom: S.xs },
  textInput: { backgroundColor:C.g50, borderWidth:1.5, borderColor:C.g200, borderRadius:R.md, padding:12, fontSize:13.5, color:C.g900, marginBottom: S.md },
  catBtn: { paddingHorizontal:14, paddingVertical:7, borderRadius:R.full, backgroundColor:C.g100, borderWidth:1, borderColor:C.g200 },
  catBtnOn: { backgroundColor:C.blueLight, borderColor:C.blueMid },
  catBtnT: { fontSize:12.5, fontWeight:'600', color:C.g600 },
  submitBtn: { flexDirection:'row', alignItems:'center', justifyContent:'center', gap:8, backgroundColor:C.blueMid, borderRadius:R.lg, padding:16, marginTop: S.sm, ...shadow.md },
  submitT: { fontSize:15, fontWeight:'700', color:'#fff' },
})
