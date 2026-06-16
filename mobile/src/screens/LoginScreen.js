import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Feather } from '@expo/vector-icons'
import { C, S, R, shadow } from '../theme'
import { api } from '../api'

export default function LoginScreen({ navigation }) {
  const [mobile, setMobile] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const digits = mobile.replace(/\D/g, '')
  const valid = digits.length === 10

  const requestOtp = async () => {
    setErr(''); setBusy(true)
    try {
      const res = await api.requestOtp('+91' + digits)
      navigation.navigate('Otp', { mobile: '+91' + digits, otp: res.otp })
    } catch (e) {
      // Demo fallback when backend unavailable
      if (e.message.includes('fetch') || e.message.includes('Network')) {
        navigation.navigate('Otp', { mobile: '+91' + digits, otp: '123456', demo: true })
      } else {
        setErr(e.message)
      }
    } finally { setBusy(false) }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <LinearGradient colors={[C.navy, C.navy2, '#0a3d2a']} style={s.hero}>
          <View style={s.logoRow}>
            <View style={s.logoBox}>
              <Feather name="wind" size={22} color="#fff" />
            </View>
            <View>
              <Text style={s.brandName}>my<Text style={{ color: C.leaf }}>CGD</Text></Text>
              <Text style={s.brandTag}>Gasonet · Customer App</Text>
            </View>
          </View>
          <Text style={s.heroH}>Your gas connection,{'\n'}in your pocket.</Text>
          <Text style={s.heroSub}>View bills, track consumption, pay online and raise complaints — all in one place.</Text>
          <View style={s.heroPills}>
            {['PNGRB Compliant', 'Bikaner GA', 'Churu GA'].map(t => (
              <View key={t} style={s.heroPill}><Text style={s.heroPillT}>{t}</Text></View>
            ))}
          </View>
        </LinearGradient>

        <View style={s.form}>
          <Text style={s.formH}>Sign in with mobile</Text>
          <Text style={s.formSub}>We'll send a 6-digit OTP to verify your number.</Text>

          <View style={s.inputRow}>
            <View style={s.prefix}><Text style={s.prefixT}>🇮🇳 +91</Text></View>
            <TextInput
              style={[s.input, err ? s.inputErr : null]}
              placeholder="10-digit mobile number"
              placeholderTextColor={C.g400}
              keyboardType="phone-pad"
              maxLength={10}
              value={mobile}
              onChangeText={v => { setMobile(v.replace(/\D/g, '')); setErr('') }}
              onSubmitEditing={valid ? requestOtp : undefined}
            />
          </View>

          {!!err && (
            <View style={s.errRow}>
              <Feather name="alert-triangle" size={13} color={C.amber} />
              <Text style={s.errText}>{err}</Text>
            </View>
          )}

          <TouchableOpacity style={[s.btn, !valid && s.btnDis]} onPress={requestOtp} disabled={!valid || busy} activeOpacity={0.85}>
            {busy
              ? <ActivityIndicator color="#fff" />
              : <><Text style={s.btnT}>Send OTP</Text><Feather name="arrow-right" size={16} color="#fff" /></>}
          </TouchableOpacity>

          <View style={s.demoBox}>
            <Feather name="info" size={14} color={C.blueMid} />
            <Text style={s.demoT}>Demo: use any 10-digit number. OTP is <Text style={{ fontWeight:'800', fontFamily:'monospace' }}>123456</Text>.</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const s = StyleSheet.create({
  hero: { padding: S.xl, paddingTop: 64, paddingBottom: S['2xl'], gap: S.lg },
  logoRow: { flexDirection:'row', alignItems:'center', gap: S.md },
  logoBox: { width:44, height:44, borderRadius:13, backgroundColor:'rgba(34,197,94,.25)', alignItems:'center', justifyContent:'center', borderWidth:1, borderColor:'rgba(34,197,94,.3)' },
  brandName: { fontSize:19, fontWeight:'800', color:'#fff', letterSpacing:-.3 },
  brandTag: { fontSize:10, color:'rgba(255,255,255,.42)', marginTop:2, letterSpacing:.4, textTransform:'uppercase', fontWeight:'600' },
  heroH: { fontSize:30, fontWeight:'800', color:'#fff', letterSpacing:-1, lineHeight:36, marginTop: S.sm },
  heroSub: { fontSize:14, color:'rgba(255,255,255,.62)', lineHeight:21, maxWidth:360 },
  heroPills: { flexDirection:'row', flexWrap:'wrap', gap: S.sm },
  heroPill: { backgroundColor:'rgba(255,255,255,.1)', borderRadius:R.full, paddingHorizontal:12, paddingVertical:5 },
  heroPillT: { fontSize:11, color:'rgba(255,255,255,.7)', fontWeight:'600' },
  form: { flex:1, backgroundColor:'#fff', borderTopLeftRadius:24, borderTopRightRadius:24, marginTop:-20, padding: S.xl, paddingTop: S['2xl'] },
  formH: { fontSize:22, fontWeight:'800', color:C.g900, letterSpacing:-.5, marginBottom:6 },
  formSub: { fontSize:13.5, color:C.g500, lineHeight:20, marginBottom: S.xl },
  inputRow: { flexDirection:'row', marginBottom: S.md, gap: S.sm },
  prefix: { backgroundColor:C.g100, borderWidth:1, borderColor:C.g200, borderRadius:R.md, paddingHorizontal:14, justifyContent:'center' },
  prefixT: { fontSize:14, fontWeight:'700', color:C.g700 },
  input: { flex:1, backgroundColor:'#fff', borderWidth:1.5, borderColor:C.g200, borderRadius:R.md, padding:14, fontSize:16, color:C.g900, letterSpacing:.5 },
  inputErr: { borderColor:C.red },
  errRow: { flexDirection:'row', alignItems:'center', gap:6, marginBottom:14 },
  errText: { fontSize:12, color:C.amber, fontWeight:'600', flex:1 },
  btn: { flexDirection:'row', alignItems:'center', justifyContent:'center', gap:8, backgroundColor:C.blueMid, borderRadius:R.lg, padding:16, marginBottom: S.lg, ...shadow.md },
  btnDis: { opacity:.45 },
  btnT: { fontSize:15, fontWeight:'700', color:'#fff' },
  demoBox: { flexDirection:'row', gap:8, backgroundColor:C.blueLight, borderRadius:R.md, padding:14, borderWidth:1, borderColor:C.bluePale },
  demoT: { fontSize:12, color:C.blue, flex:1, lineHeight:18 },
})
