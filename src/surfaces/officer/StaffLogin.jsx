import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../../lib/icons.jsx'
import { api, session } from '../../lib/api.js'

export default function StaffLogin({ onLogin }) {
  const nav = useNavigate()
  const [email, setEmail] = useState('priya.sharma@gasonet.in')
  const [password, setPassword] = useState('gasonet123')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    setErr(''); setBusy(true)
    try {
      const { token, user } = await api.staffLogin(email, password)
      session.set(token, { ...user, type: 'staff' })
      onLogin(user)
    } catch (e) { setErr(e.message) } finally { setBusy(false) }
  }

  return (
    <div className="login">
      <div className="login-brand">
        <div style={{ display: 'flex', alignItems: 'center', gap: 13, position: 'relative' }}>
          <div className="sb-logo" style={{ width: 46, height: 46, borderRadius: 13 }}><Icon name="leaf" size={25} style={{ color: '#fff' }} /></div>
          <div><div style={{ fontSize: 21, fontWeight: 800 }}>my<b style={{ color: 'var(--leaf)' }}>CGD</b></div><div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '.4px' }}>Gasonet Staff Console</div></div>
        </div>
        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--leaf)', letterSpacing: '.5px', marginBottom: 14 }}>CGD OPERATIONS</div>
          <h1 style={{ fontSize: 34, fontWeight: 800, letterSpacing: '-1px', lineHeight: 1.14, marginBottom: 18 }}>Onboarding to<br />collections,<br />one console.</h1>
          <p style={{ fontSize: 14.5, color: 'rgba(255,255,255,.62)', lineHeight: 1.7, maxWidth: 420 }}>Review applications, run meter readings, generate &amp; approve bills, drive collections and resolve complaints — all role-based.</p>
        </div>
        <div style={{ position: 'relative', display: 'flex', gap: 28 }}>
          {[['MyPNG', 'Integrated'], ['PNGRB', 'Compliant'], ['Bikaner', '+ Churu GA']].map((s, i) => (
            <div key={i}><div style={{ fontSize: 19, fontWeight: 800 }}>{s[0]}</div><div style={{ fontSize: 11, color: 'rgba(255,255,255,.45)' }}>{s[1]}</div></div>
          ))}
        </div>
      </div>
      <div className="login-form">
        <div className="login-card">
          <h2 style={{ fontSize: 25, fontWeight: 800, letterSpacing: '-.5px' }}>Staff sign in</h2>
          <p style={{ fontSize: 13.5, color: 'var(--g500)', marginTop: 6, marginBottom: 24 }}>Sign in with your Gasonet work email.</p>
          <div className="fgroup"><label className="flabel">Work Email <span className="req">*</span></label>
            <input className="finput" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@gasonet.in" /></div>
          <div className="fgroup"><label className="flabel">Password <span className="req">*</span></label>
            <input className="finput" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') submit() }} placeholder="••••••••" /></div>
          {err && <div className="alert alert-warn" style={{ marginBottom: 12 }}><Icon name="alert" size={16} /><div>{err}</div></div>}
          <button className="btn btn-primary btn-block btn-lg" style={{ marginTop: 4 }} disabled={busy} onClick={submit}>{busy ? 'Signing in…' : <>Sign in <Icon name="arrowR" size={16} /></>}</button>
          <button className="btn btn-ghost btn-block" style={{ marginTop: 10 }} onClick={() => nav('/')}>← Back to platform</button>
          <div className="alert alert-info" style={{ marginTop: 18 }}><Icon name="info" size={16} /><div>Demo accounts (password <b className="mono">gasonet123</b>): <b>priya.sharma@gasonet.in</b> (CGD Officer), <b>vikram.r@gasonet.in</b> (Meter Reader), <b>sunita.j@gasonet.in</b> (Billing), <b>mohit.a@gasonet.in</b> (Admin).</div></div>
        </div>
      </div>
    </div>
  )
}
