import { useState, useRef, useEffect } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Feather } from '@expo/vector-icons'
import { C, S, R, shadow } from '../theme'
import { api, session } from '../api'
import { MOCK_USER } from '../mock'

export default function OtpScreen({ route, navigation }) {
  const { mobile, otp: hint, demo } = route.params
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [timer, setTimer] = useState(30)
  const refs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()]

  useEffect(() => {
    refs[0].current?.focus()
    const t = setInterval(() => setTimer(v => Math.max(0, v - 1)), 1000)
    return () => clearInterval(t)
  }, [])

  const setValue = (i, v) => {
    const c = [...code]
    c[i] = v.slice(-1)
    setCode(c)
    if (v && i < 5) refs[i + 1].current?.focus()
    if (c.every(x => x) && !c.includes('')) submit(c.join(''))
  }

  const onKey = (i, key) => {
    if (key === 'Backspace' && !code[i] && i > 0) refs[i - 1].current?.focus()
  }

  const submit = async (entered) => {
    setErr(''); setBusy(true)
    try {
      if (demo) {
        if (entered !== '123456') throw new Error('Invalid OTP. Use 123456 for the demo.')
        await session.set('demo-token', { ...MOCK_USER, type: 'customer' })
        navigation.replace('Main')
      } else {
        const { token, user } = await api.verifyOtp(mobile, entered)
        await session.set(token, { ...user, type: 'customer' })
        navigation.replace('Main')
      }
    } catch (e) { setErr(e.message); setCode(['', '', '', '', '', '']); refs[0].current?.focus() }
    finally { setBusy(false) }
  }

  const filled = code.filter(x => x).length

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#fff' }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={s.wrap}>

        {/* Back */}
        <TouchableOpacity style={s.back} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={19} color={C.g700} />
        </TouchableOpacity>

        {/* Icon */}
        <LinearGradient colors={[C.blueMid, C.indigo]} style={s.iconWrap} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <Feather name="message-circle" size={26} color="#fff" />
        </LinearGradient>

        <Text style={s.h}>Enter OTP</Text>
        <Text style={s.sub}>
          6-digit code sent to{'\n'}
          <Text style={s.mobileT}>{mobile}</Text>
        </Text>

        {/* OTP boxes */}
        <View style={s.boxes}>
          {refs.map((ref, i) => (
            <TextInput
              key={i} ref={ref}
              style={[s.box, code[i] ? s.boxFilled : null, !!err && s.boxErr]}
              keyboardType="number-pad" maxLength={1} value={code[i]}
              onChangeText={v => setValue(i, v)}
              onKeyPress={({ nativeEvent: { key } }) => onKey(i, key)}
              selectTextOnFocus
            />
          ))}
        </View>

        {/* Progress bar */}
        <View style={s.progress}>
          <View style={[s.progressFill, { width: `${(filled / 6) * 100}%` }]} />
        </View>

        {!!err && (
          <View style={s.errRow}>
            <Feather name="alert-circle" size={14} color={C.red} />
            <Text style={s.errT}>{err}</Text>
          </View>
        )}

        {busy && (
          <View style={s.loadingRow}>
            <ActivityIndicator color={C.blueMid} size="small" />
            <Text style={s.loadingT}>Verifying…</Text>
          </View>
        )}

        {/* Resend */}
        <View style={s.resendRow}>
          {timer > 0 ? (
            <Text style={s.timerT}>Resend in <Text style={s.timerNum}>{timer}s</Text></Text>
          ) : (
            <TouchableOpacity onPress={() => { setTimer(30); api.requestOtp(mobile).catch(() => {}) }}>
              <Text style={s.resendT}>Resend OTP</Text>
            </TouchableOpacity>
          )}
        </View>

        {demo && (
          <View style={s.demoBox}>
            <Feather name="info" size={14} color={C.blueMid} />
            <Text style={s.demoT}>
              Demo mode — enter{' '}
              <Text style={s.demoCode}>123456</Text>
            </Text>
          </View>
        )}

      </View>
    </KeyboardAvoidingView>
  )
}

const s = StyleSheet.create({
  wrap: { flex: 1, padding: S.xl, paddingTop: 56 },
  back: { width: 42, height: 42, borderRadius: R.lg, backgroundColor: C.g100, alignItems: 'center', justifyContent: 'center', marginBottom: S.xl },
  iconWrap: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: S.xl, ...shadow.blue },
  h: { fontSize: 28, fontWeight: '900', color: C.g900, letterSpacing: -.6, marginBottom: S.sm },
  sub: { fontSize: 14, color: C.g500, lineHeight: 22, marginBottom: S['2xl'] },
  mobileT: { color: C.g900, fontWeight: '800' },
  boxes: { flexDirection: 'row', gap: S.sm, marginBottom: S.md },
  box: { flex: 1, height: 60, borderWidth: 1.5, borderColor: C.g200, borderRadius: R.lg, fontSize: 26, fontWeight: '900', textAlign: 'center', color: C.g900, backgroundColor: C.g50 },
  boxFilled: { borderColor: C.blueMid, backgroundColor: C.blueLight, color: C.blueMid },
  boxErr: { borderColor: C.red, backgroundColor: '#FEF2F2' },
  progress: { height: 3, backgroundColor: C.g100, borderRadius: 2, marginBottom: S.lg, overflow: 'hidden' },
  progressFill: { height: 3, backgroundColor: C.blueMid, borderRadius: 2 },
  errRow: { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: '#FEF2F2', borderRadius: R.md, padding: 11, marginBottom: S.md },
  errT: { fontSize: 12.5, color: C.red, fontWeight: '600', flex: 1 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: S.md },
  loadingT: { fontSize: 13.5, color: C.g500, fontWeight: '600' },
  resendRow: { alignItems: 'center', marginTop: S.lg },
  timerT: { fontSize: 13.5, color: C.g400 },
  timerNum: { color: C.blueMid, fontWeight: '800' },
  resendT: { fontSize: 14, color: C.blueMid, fontWeight: '800' },
  demoBox: { flexDirection: 'row', gap: 9, backgroundColor: C.blueLight, borderRadius: R.lg, padding: 14, borderWidth: 1, borderColor: C.bluePale, marginTop: S['2xl'] },
  demoT: { fontSize: 12.5, color: C.blue, flex: 1, lineHeight: 19 },
  demoCode: { fontWeight: '900', fontFamily: 'monospace', color: C.blueMid },
})
