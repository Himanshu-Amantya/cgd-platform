import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator,
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
  const valid  = digits.length === 10

  const requestOtp = async () => {
    setErr(''); setBusy(true)
    try {
      const res = await api.requestOtp('+91' + digits)
      navigation.navigate('Otp', { mobile: '+91' + digits, otp: res.otp })
    } catch {
      navigation.navigate('Otp', { mobile: '+91' + digits, otp: '123456', demo: true })
    } finally { setBusy(false) }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <LinearGradient colors={[C.navy, '#0D1F42', '#0F2C4A']} style={{ flex: 1 }} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>

        {/* Decorative elements */}
        <View style={s.dec1} /><View style={s.dec2} /><View style={s.dec3} />

        {/* Brand section */}
        <View style={s.brand}>
          <View style={s.logoRing}>
            <LinearGradient colors={['rgba(34,197,94,.25)', 'rgba(34,197,94,.08)']} style={s.logoInner}>
              <Feather name="wind" size={26} color={C.leaf} />
            </LinearGradient>
          </View>
          <Text style={s.brandName}>my<Text style={{ color: C.leaf }}>CGD</Text></Text>
          <Text style={s.brandTag}>Gasonet Services · Customer Portal</Text>

          <Text style={s.hero}>Your gas connection,{'\n'}in your pocket.</Text>

          <View style={s.pillRow}>
            {['PNGRB Compliant', 'Bikaner GA', 'Churu GA'].map(t => (
              <View key={t} style={s.pill}><Text style={s.pillT}>{t}</Text></View>
            ))}
          </View>
        </View>

        {/* Form card */}
        <View style={s.card}>
          <Text style={s.cardH}>Sign in with mobile</Text>
          <Text style={s.cardSub}>We'll send a 6-digit OTP to verify your number.</Text>

          <View style={s.inputWrap}>
            <View style={s.prefix}>
              <Text style={s.prefixFlag}>🇮🇳</Text>
              <Text style={s.prefixT}>+91</Text>
            </View>
            <TextInput
              style={[s.input, !!err && s.inputErr]}
              placeholder="10-digit mobile number"
              placeholderTextColor={C.g400}
              keyboardType="phone-pad"
              maxLength={10}
              value={mobile}
              onChangeText={v => { setMobile(v.replace(/\D/g, '')); setErr('') }}
              onSubmitEditing={valid ? requestOtp : undefined}
              returnKeyType="send"
            />
          </View>

          {!!err && (
            <View style={s.errRow}>
              <Feather name="alert-triangle" size={13} color={C.amber} />
              <Text style={s.errT}>{err}</Text>
            </View>
          )}

          <TouchableOpacity activeOpacity={0.88} onPress={requestOtp} disabled={!valid || busy}>
            <LinearGradient
              colors={valid ? [C.blueMid, C.indigo] : [C.g300, C.g300]}
              style={[s.btn, !valid && { opacity: .55 }]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              {busy
                ? <ActivityIndicator color="#fff" />
                : <><Text style={s.btnT}>Send OTP</Text><Feather name="arrow-right" size={17} color="rgba(255,255,255,.8)" /></>}
            </LinearGradient>
          </TouchableOpacity>

          <View style={s.hint}>
            <Feather name="info" size={13} color={C.blueMid} />
            <Text style={s.hintT}>Demo: any 10-digit number, OTP is <Text style={{ fontWeight: '800', fontFamily: 'monospace' }}>123456</Text></Text>
          </View>
        </View>

      </LinearGradient>
    </KeyboardAvoidingView>
  )
}

const s = StyleSheet.create({
  dec1: { position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(79,70,229,.12)' },
  dec2: { position: 'absolute', top: 80, right: 30, width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,.04)' },
  dec3: { position: 'absolute', top: 200, left: -60, width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(34,197,94,.07)' },

  brand: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: S['2xl'], paddingTop: 20 },
  logoRing: { width: 80, height: 80, borderRadius: 40, borderWidth: 1.5, borderColor: 'rgba(34,197,94,.3)', alignItems: 'center', justifyContent: 'center', marginBottom: S.lg },
  logoInner: { width: 66, height: 66, borderRadius: 33, alignItems: 'center', justifyContent: 'center' },
  brandName: { fontSize: 34, fontWeight: '900', color: '#fff', letterSpacing: -1, marginBottom: S.xs },
  brandTag: { fontSize: 11.5, color: 'rgba(255,255,255,.35)', letterSpacing: .5, textTransform: 'uppercase', fontWeight: '600', marginBottom: S['2xl'] },
  hero: { fontSize: 22, fontWeight: '800', color: '#fff', textAlign: 'center', letterSpacing: -.5, lineHeight: 30, marginBottom: S.lg },
  pillRow: { flexDirection: 'row', gap: S.sm, flexWrap: 'wrap', justifyContent: 'center' },
  pill: { backgroundColor: 'rgba(255,255,255,.1)', borderRadius: R.full, paddingHorizontal: 13, paddingVertical: 5 },
  pillT: { fontSize: 11, color: 'rgba(255,255,255,.6)', fontWeight: '600' },

  card: { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: S['2xl'], paddingBottom: 44, gap: 0 },
  cardH: { fontSize: 22, fontWeight: '900', color: C.g900, letterSpacing: -.5, marginBottom: 6 },
  cardSub: { fontSize: 13.5, color: C.g500, lineHeight: 20, marginBottom: S.xl },
  inputWrap: { flexDirection: 'row', gap: S.sm, marginBottom: S.md },
  prefix: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: C.g100, borderWidth: 1.5, borderColor: C.g200, borderRadius: R.lg, paddingHorizontal: 13 },
  prefixFlag: { fontSize: 18 },
  prefixT: { fontSize: 15, fontWeight: '700', color: C.g800 },
  input: { flex: 1, backgroundColor: '#fff', borderWidth: 1.5, borderColor: C.g200, borderRadius: R.lg, paddingHorizontal: 15, paddingVertical: 13, fontSize: 17, color: C.g900, letterSpacing: .5 },
  inputErr: { borderColor: C.red },
  errRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: S.sm },
  errT: { fontSize: 12.5, color: C.amber, fontWeight: '600', flex: 1 },
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: R.lg, paddingVertical: 16, marginBottom: S.lg, ...shadow.blue },
  btnT: { fontSize: 16, fontWeight: '800', color: '#fff', flex: 1, textAlign: 'center' },
  hint: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: C.blueLight, borderRadius: R.lg, padding: 13, borderWidth: 1, borderColor: C.bluePale },
  hintT: { fontSize: 12, color: C.blue, flex: 1, lineHeight: 18 },
})
