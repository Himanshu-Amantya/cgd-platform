import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../../lib/icons.jsx'
import { api, session } from '../../lib/api.js'

export default function Login({ onLogin }) {
  const nav = useNavigate()
  const [step, setStep] = useState('mobile')
  const [mobile, setMobile] = useState('98765 43210')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [devOtp, setDevOtp] = useState('')
  const refs = useRef([])
  const setDigit = (i, v) => {
    v = v.replace(/\D/g, '').slice(-1)
    setOtp((o) => { const n = [...o]; n[i] = v; return n })
    if (v && i < 5) refs.current[i + 1]?.focus()
  }
  const filled = otp.every((d) => d !== '')

  const sendOtp = async () => {
    setErr(''); setBusy(true)
    try { const r = await api.requestOtp('+91 ' + mobile); setDevOtp(r.devOtp || ''); setStep('otp') }
    catch (e) { setErr(e.message) } finally { setBusy(false) }
  }
  const verify = async () => {
    setErr(''); setBusy(true)
    try {
      const { token, user } = await api.verifyOtp('+91 ' + mobile, otp.join(''))
      session.set(token, { ...user, type: 'customer' })
      onLogin(user)
    } catch (e) { setErr(e.message) } finally { setBusy(false) }
  }
  return (
    <div className="login">
      <div className="login-brand">
        <div style={{ display: 'flex', alignItems: 'center', gap: 13, position: 'relative' }}>
          <div className="sb-logo" style={{ width: 46, height: 46, borderRadius: 13 }}><Icon name="leaf" size={25} style={{ color: '#fff' }} /></div>
          <div><div style={{ fontSize: 21, fontWeight: 800 }}>Gasonet</div><div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '.4px' }}>CGD Customer Portal</div></div>
        </div>
        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--leaf)', letterSpacing: '.5px', marginBottom: 14 }}>GO GREEN WITH GASONET</div>
          <h1 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-1px', lineHeight: 1.12, marginBottom: 18 }}>Clean piped<br />natural gas,<br />for every home.</h1>
          <p style={{ fontSize: 14.5, color: 'rgba(255,255,255,.62)', lineHeight: 1.7, maxWidth: 420 }}>Apply for a new PNG connection, pay securely and track your application — integrated with the MyPNG national portal.</p>
          <div style={{ display: 'flex', gap: 9, marginTop: 26, flexWrap: 'wrap' }}>
            {['MyPNG integrated', 'PNGRB compliant', 'Secure payments', 'Bikaner & Churu GA'].map((c) => (
              <span key={c} style={{ background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.16)', borderRadius: 20, fontSize: 11.5, fontWeight: 600, padding: '6px 13px', color: 'rgba(255,255,255,.85)' }}>{c}</span>
            ))}
          </div>
        </div>
        <div style={{ position: 'relative', display: 'flex', gap: 28 }}>
          {[['48.7k', 'Connections'], ['15', 'Districts'], ['Phase 1', 'Live']].map((s, i) => (
            <div key={i}><div style={{ fontSize: 23, fontWeight: 800 }}>{s[0]}</div><div style={{ fontSize: 11, color: 'rgba(255,255,255,.45)' }}>{s[1]}</div></div>
          ))}
        </div>
      </div>
      <div className="login-form">
        <div className="login-card">
          {step === 'mobile' ? (
            <>
              <h2 style={{ fontSize: 25, fontWeight: 800, letterSpacing: '-.5px' }}>Sign in</h2>
              <p style={{ fontSize: 13.5, color: 'var(--g500)', marginTop: 6, marginBottom: 26 }}>Enter your registered mobile number. We'll send a one-time password.</p>
              <div className="fgroup"><label className="flabel">Mobile Number <span className="req">*</span></label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div className="finput" style={{ width: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--g600)', background: 'var(--g50)' }}>+91</div>
                  <input className="finput" value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="98765 43210" />
                </div>
              </div>
              {err && <div className="alert alert-warn" style={{ marginBottom: 12 }}><Icon name="alert" size={16} /><div>{err}</div></div>}
              <button className="btn btn-primary btn-block btn-lg" style={{ marginTop: 8 }} disabled={busy || !mobile.trim()} onClick={sendOtp}>{busy ? 'Sending…' : <>Send OTP <Icon name="arrowR" size={16} /></>}</button>
              <button className="btn btn-ghost btn-block" style={{ marginTop: 10 }} onClick={() => nav('/')}>← Back to platform</button>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 18, fontSize: 11.5, color: 'var(--g400)' }}><Icon name="lock" size={13} />256-bit TLS · OTP via SMS · PNGRB compliant</div>
            </>
          ) : (
            <>
              <button className="btn btn-ghost btn-sm" style={{ marginBottom: 14, paddingLeft: 0 }} onClick={() => setStep('mobile')}><Icon name="arrowL" size={14} />Change number</button>
              <h2 style={{ fontSize: 25, fontWeight: 800, letterSpacing: '-.5px' }}>Verify OTP</h2>
              <p style={{ fontSize: 13.5, color: 'var(--g500)', marginTop: 6, marginBottom: 24 }}>Enter the 6-digit code sent to <b>+91 {mobile}</b>.{devOtp && <span style={{ color: 'var(--blue-mid)' }}> (dev OTP: <b className="mono">{devOtp}</b>)</span>}</p>
              <div className="otp-row" style={{ marginBottom: 18 }}>
                {otp.map((d, i) => (
                  <input key={i} ref={(el) => (refs.current[i] = el)} className="otp" value={d} inputMode="numeric"
                    onChange={(e) => setDigit(i, e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Backspace' && !d && i > 0) refs.current[i - 1]?.focus() }} />
                ))}
              </div>
              {err && <div className="alert alert-warn" style={{ marginBottom: 12 }}><Icon name="alert" size={16} /><div>{err}</div></div>}
              <button className="btn btn-primary btn-block btn-lg" disabled={!filled || busy} onClick={verify}><Icon name="check" size={16} />{busy ? 'Verifying…' : 'Verify & Continue'}</button>
              <div style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: 'var(--g500)' }}>Didn't get it? <b style={{ color: 'var(--blue-mid)', cursor: 'pointer' }} onClick={sendOtp}>Resend OTP</b></div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
