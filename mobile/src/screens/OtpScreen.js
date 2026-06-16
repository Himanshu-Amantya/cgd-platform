import { useState, useRef, useEffect } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native'
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

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#fff' }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={s.wrap}>
        <TouchableOpacity style={s.back} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={20} color={C.g700} />
        </TouchableOpacity>

        <View style={s.icon}><Feather name="message-circle" size={28} color={C.blueMid} /></View>
        <Text style={s.h}>Enter OTP</Text>
        <Text style={s.sub}>We sent a 6-digit code to{'\n'}<Text style={{ color: C.g900, fontWeight: '700' }}>{mobile}</Text></Text>

        <View style={s.boxes}>
          {refs.map((ref, i) => (
            <TextInput key={i} ref={ref} style={[s.box, code[i] ? s.boxFilled : null]}
              keyboardType="number-pad" maxLength={1} value={code[i]}
              onChangeText={v => setValue(i, v)}
              onKeyPress={({ nativeEvent: { key } }) => onKey(i, key)}
              selectTextOnFocus />
          ))}
        </View>

        {!!err && (
          <View style={s.errRow}>
            <Feather name="alert-triangle" size={13} color={C.red} />
            <Text style={s.errT}>{err}</Text>
          </View>
        )}

        {busy && <ActivityIndicator color={C.blueMid} style={{ marginTop: S.md }} />}

        <View style={s.resendRow}>
          {timer > 0
            ? <Text style={s.timerT}>Resend OTP in <Text style={{ color: C.blueMid, fontWeight: '700' }}>{timer}s</Text></Text>
            : <TouchableOpacity onPress={() => { setTimer(30); api.requestOtp(mobile).catch(() => {}) }}>
                <Text style={s.resendT}>Resend OTP</Text>
              </TouchableOpacity>}
        </View>

        {demo && (
          <View style={s.demoBox}>
            <Feather name="info" size={14} color={C.blueMid} />
            <Text style={s.demoT}>Demo mode — enter <Text style={{ fontWeight: '800', fontFamily: 'monospace' }}>123456</Text></Text>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  )
}

const s = StyleSheet.create({
  wrap: { flex: 1, padding: S.xl, paddingTop: 60 },
  back: { width: 40, height: 40, borderRadius: R.md, backgroundColor: C.g100, alignItems: 'center', justifyContent: 'center', marginBottom: S.xl },
  icon: { width: 60, height: 60, borderRadius: R.xl, backgroundColor: C.blueLight, alignItems: 'center', justifyContent: 'center', marginBottom: S.lg },
  h: { fontSize: 26, fontWeight: '800', color: C.g900, letterSpacing: -.5, marginBottom: S.sm },
  sub: { fontSize: 14, color: C.g500, lineHeight: 21, marginBottom: S['2xl'] },
  boxes: { flexDirection: 'row', gap: S.sm, marginBottom: S.lg },
  box: { flex: 1, height: 56, borderWidth: 1.5, borderColor: C.g200, borderRadius: R.lg, fontSize: 24, fontWeight: '800', textAlign: 'center', color: C.g900, backgroundColor: C.g50 },
  boxFilled: { borderColor: C.blueMid, backgroundColor: C.blueLight },
  errRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: S.sm },
  errT: { fontSize: 12.5, color: C.red, fontWeight: '600', flex: 1 },
  resendRow: { alignItems: 'center', marginTop: S.lg },
  timerT: { fontSize: 13, color: C.g400 },
  resendT: { fontSize: 13, color: C.blueMid, fontWeight: '700' },
  demoBox: { flexDirection: 'row', gap: 8, backgroundColor: C.blueLight, borderRadius: R.md, padding: 14, borderWidth: 1, borderColor: C.bluePale, marginTop: S['2xl'] },
  demoT: { fontSize: 12, color: C.blue, flex: 1 },
})
