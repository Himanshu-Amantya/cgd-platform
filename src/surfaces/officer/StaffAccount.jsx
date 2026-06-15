import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../../lib/icons.jsx'
import { Panel, Badge, KV, Crumbs } from '../../components/ui.jsx'
import { useToast } from '../../components/Toast.jsx'
import { initials } from '../../lib/format.js'
import { STAFF_USER } from './staffData.js'

const Req = () => <span className="req">*</span>

function PwdField({ label, value, onChange, placeholder }) {
  const [show, setShow] = useState(false)
  return (
    <div className="fgroup"><label className="flabel">{label} <Req /></label>
      <div style={{ position: 'relative' }}>
        <input className="finput" type={show ? 'text' : 'password'} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={{ paddingRight: 40 }} />
        <button type="button" aria-label={show ? 'Hide password' : 'Show password'} onClick={() => setShow((s) => !s)}
          style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--g400)', display: 'flex' }}><Icon name="eye" size={16} /></button>
      </div>
    </div>
  )
}

const rules = (p) => ({ len: p.length >= 8, num: /\d/.test(p), case: /[a-z]/.test(p) && /[A-Z]/.test(p) })

/* ════════ Set Password (new employee activation) ════════ */
export function SetPassword() {
  const nav = useNavigate()
  const toast = useToast()
  const [pwd, setPwd] = useState('')
  const [confirm, setConfirm] = useState('')
  const r = rules(pwd)
  const strong = r.len && r.num && r.case
  const match = pwd && pwd === confirm
  const valid = strong && match

  return (
    <div className="page" style={{ maxWidth: 520 }}>
      <div className="phead"><div><h1>Set Your Password</h1><p>Welcome to Gasonet CGD. Create a password to activate your employee account.</p></div></div>
      <Panel title="Create Password" icon="key">
        <div className="fgroup"><label className="flabel">Work Email</label><input className="finput" value={STAFF_USER.email} disabled /></div>
        <PwdField label="New Password" value={pwd} onChange={setPwd} placeholder="Create a password" />
        <PwdField label="Confirm Password" value={confirm} onChange={setConfirm} placeholder="Re-enter password" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, margin: '4px 0 16px' }}>
          {[['len', 'At least 8 characters'], ['case', 'Upper & lower case letters'], ['num', 'At least one number']].map(([k, t]) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5, color: r[k] ? 'var(--green)' : 'var(--g400)' }}>
              <Icon name={r[k] ? 'check' : 'info'} size={13} />{t}</div>
          ))}
          {confirm && !match && <div style={{ fontSize: 11.5, color: 'var(--red)', display: 'flex', alignItems: 'center', gap: 8 }}><Icon name="x" size={13} />Passwords do not match</div>}
        </div>
        <button className="btn btn-primary btn-block btn-lg" disabled={!valid} onClick={() => { toast({ tone: 'green', title: 'Password set', msg: 'Your account is active' }); nav('/officer') }}><Icon name="check" size={16} />Set Password &amp; Continue</button>
      </Panel>
    </div>
  )
}

/* ════════ Change Password ════════ */
export function ChangePassword() {
  const nav = useNavigate()
  const toast = useToast()
  const [cur, setCur] = useState('')
  const [pwd, setPwd] = useState('')
  const [confirm, setConfirm] = useState('')
  const r = rules(pwd)
  const valid = cur && r.len && r.num && r.case && pwd === confirm

  return (
    <div className="page" style={{ maxWidth: 520 }}>
      <Crumbs items={[{ label: 'Employee Profile', onClick: () => nav('/officer/profile') }, { label: 'Change Password' }]} />
      <div className="phead"><div><h1>Change Password</h1><p>Update the password for your CGD employee account.</p></div></div>
      <Panel title="Change Password" icon="key">
        <PwdField label="Current Password" value={cur} onChange={setCur} placeholder="Current password" />
        <PwdField label="New Password" value={pwd} onChange={setPwd} placeholder="New password" />
        <PwdField label="Confirm New Password" value={confirm} onChange={setConfirm} placeholder="Re-enter new password" />
        {confirm && pwd !== confirm && <div style={{ fontSize: 11.5, color: 'var(--red)', margin: '-6px 0 12px', display: 'flex', alignItems: 'center', gap: 8 }}><Icon name="x" size={13} />Passwords do not match</div>}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 6 }}>
          <button className="btn btn-light" onClick={() => nav('/officer/profile')}>Cancel</button>
          <button className="btn btn-primary" disabled={!valid} onClick={() => { toast({ tone: 'green', title: 'Password changed' }); nav('/officer/profile') }}><Icon name="check" size={15} />Update Password</button>
        </div>
      </Panel>
    </div>
  )
}

/* ════════ Change Mobile Number ════════ */
export function ChangeMobile() {
  const nav = useNavigate()
  const toast = useToast()
  const [step, setStep] = useState('enter')
  const [mobile, setMobile] = useState('')
  const [otp, setOtp] = useState('')
  const validMobile = mobile.length === 10

  return (
    <div className="page" style={{ maxWidth: 520 }}>
      <Crumbs items={[{ label: 'Employee Profile', onClick: () => nav('/officer/profile') }, { label: 'Change Mobile Number' }]} />
      <div className="phead"><div><h1>Change Mobile Number</h1><p>Update the mobile number linked to your account.</p></div></div>
      <Panel title="Mobile Number" icon="phone">
        <div className="fgroup"><label className="flabel">Current Mobile</label><input className="finput" value={STAFF_USER.mobile} disabled /></div>
        {step === 'enter' ? (
          <>
            <div className="fgroup"><label className="flabel">New Mobile Number <Req /></label>
              <div style={{ display: 'flex', gap: 8 }}>
                <div className="finput" style={{ width: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--g600)', background: 'var(--g50)' }}>+91</div>
                <input className="finput mono" inputMode="numeric" placeholder="98xxxxxxxx" value={mobile} onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))} />
              </div>
            </div>
            <button className="btn btn-primary btn-block" disabled={!validMobile} onClick={() => { setStep('otp'); toast({ tone: 'blue', title: 'OTP sent', msg: 'to +91 ' + mobile }) }}><Icon name="send" size={15} />Send OTP</button>
          </>
        ) : (
          <>
            <div className="fgroup"><label className="flabel">Enter OTP sent to +91 {mobile} <Req /></label>
              <input className="finput mono" inputMode="numeric" placeholder="6-digit OTP" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} /></div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-light" onClick={() => setStep('enter')}>Back</button>
              <button className="btn btn-primary btn-block" disabled={otp.length < 4} onClick={() => { toast({ tone: 'green', title: 'Mobile number updated', msg: '+91 ' + mobile }); nav('/officer/profile') }}><Icon name="check" size={15} />Verify &amp; Update</button>
            </div>
          </>
        )}
      </Panel>
    </div>
  )
}

/* ════════ CGD Employee Profile ════════ */
export function EmployeeProfile() {
  const nav = useNavigate()
  return (
    <div className="page" style={{ maxWidth: 760 }}>
      <div className="phead"><div><h1>Employee Profile</h1><p>Your CGD staff account details and security.</p></div></div>
      <div className="grid-2" style={{ alignItems: 'start' }}>
        <Panel title="Profile" icon="users">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
            <div className="sb-ava" style={{ width: 52, height: 52, borderRadius: 14, fontSize: 18 }}>{initials(STAFF_USER.name)}</div>
            <div><div style={{ fontSize: 16, fontWeight: 800 }}>{STAFF_USER.name}</div><div style={{ fontSize: 12, color: 'var(--g400)' }}>{STAFF_USER.role} · {STAFF_USER.ga}</div></div>
          </div>
          <KV k="Employee ID"><span className="mono">{STAFF_USER.empId}</span></KV>
          <KV k="Email">{STAFF_USER.email}</KV>
          <KV k="Mobile">{STAFF_USER.mobile} <Badge cls="b-green">Verified</Badge></KV>
          <KV k="Role"><Badge cls="b-blue">{STAFF_USER.role}</Badge></KV>
        </Panel>
        <Panel title="Security" icon="shield">
          <button className="btn btn-light btn-block" style={{ justifyContent: 'space-between', marginBottom: 10 }} onClick={() => nav('/officer/profile/password')}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 9 }}><Icon name="key" size={15} />Change Password</span><Icon name="arrowR" size={15} /></button>
          <button className="btn btn-light btn-block" style={{ justifyContent: 'space-between' }} onClick={() => nav('/officer/profile/mobile')}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 9 }}><Icon name="phone" size={15} />Change Mobile Number</span><Icon name="arrowR" size={15} /></button>
        </Panel>
      </div>
    </div>
  )
}
