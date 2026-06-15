import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../../lib/icons.jsx'
import { Store } from '../../lib/store.js'
import { auth } from '../customer/auth.js'
import './mypng.css'

const mypngRef = () => '1-01-2026-' + Math.floor(10000000 + Math.random() * 89999999)

function PHeader() {
  return (
    <>
      <div className="govstrip">
        <div className="l"><span>भारत सरकार</span><span>Government of India</span><span>Ministry of Petroleum &amp; Natural Gas</span></div>
        <div style={{ opacity: .85 }}>Skip to Main Content · A- A A+</div>
      </div>
      <div className="hdr">
        <div className="hdr-emblem">
          <div className="emblem">सत्यमेव<br />जयते</div>
          <div className="minName"><b>MoPNG</b>Petroleum &amp; Natural Gas Regulatory Board</div>
        </div>
        <div className="pbrand">
          <div className="flame"><Icon name="flame" size={19} /></div>
          <div><div className="wm">My<span>PNG</span></div><div className="wmsub">Unified PNG Portal</div></div>
        </div>
        <nav className="pnav"><a className="on">Home</a><a>About</a><a>CGD Entry</a><a>Resources</a><a>Contact Us</a></nav>
        <div className="hdr-right">
          <div className="lang"><Icon name="globe" size={14} />English <Icon name="chev" size={12} /></div>
          <button className="btn btn-pblue">CGD Login</button>
        </div>
      </div>
    </>
  )
}
function PStepper({ step }) {
  const S = [[1, 'Verify Your Mobile Number'], [2, 'Fill in Basic Details & Confirm Address'], [3, 'Submit Your Application']]
  return (
    <div className="pstepper">
      {S.map((s, i) => (
        <span key={s[0]} style={{ display: 'contents' }}>
          {i > 0 && <div className={'pstep-line' + (step > s[0] - 1 ? ' done' : '')} />}
          <div className={'pstep ' + (step > s[0] ? 'done' : step === s[0] ? 'active' : '')}>
            <div className="dot">{step > s[0] ? <Icon name="check" size={13} /> : s[0]}</div><div className="lbl">{s[1]}</div>
          </div>
        </span>
      ))}
    </div>
  )
}
function PFooter() {
  return (
    <div className="pfoot">
      <div><b style={{ color: 'var(--pblue)' }}>My</b><b style={{ color: 'var(--pgreen)' }}>PNG</b> · Unified PNG Portal · © 2026 MoPNG</div>
      <div><a>Privacy Policy</a><a>Accessibility</a><a>Terms &amp; Conditions</a><a>Support</a></div>
    </div>
  )
}
const BrandCenter = () => (
  <div className="brand-center"><div className="flame"><Icon name="flame" size={24} /></div><div className="wm">My<span>PNG</span></div></div>
)

function MobileStep({ onNext, onHome }) {
  const [m, setM] = useState('')
  return (
    <div className="pcard narrow"><div className="pcard-pad">
      <BrandCenter />
      <div className="ctitle">Enter your mobile number to start your PNG application</div>
      <div className="fgroup"><label className="flabel">Mobile Number <span className="req">*</span></label>
        <div className="phoneRow"><div className="cc">+91</div><input className="finput" placeholder="98xxxxxxxx" value={m} onChange={(e) => setM(e.target.value.replace(/\D/g, '').slice(0, 10))} /></div></div>
      <button className="btn btn-pblue btn-block btn-lg" onClick={onNext}><Icon name="phone" size={15} />Send OTP</button>
      <div style={{ textAlign: 'center', marginTop: 14 }}><button className="plink" style={{ color: 'var(--g500)' }} onClick={onHome}>← Return to Home</button></div>
      <div style={{ textAlign: 'center', marginTop: 14, fontSize: 11.5, color: 'var(--g400)' }}>By continuing you agree to the Terms of Service and Privacy Policy.</div>
    </div></div>
  )
}
function OtpStep({ mobile, onNext, onBack }) {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [t, setT] = useState(299)
  const refs = useRef([])
  useEffect(() => { const x = setInterval(() => setT((s) => Math.max(0, s - 1)), 1000); return () => clearInterval(x) }, [])
  const set = (i, v) => { v = v.replace(/\D/g, '').slice(-1); setOtp((o) => { const n = [...o]; n[i] = v; return n }); if (v && i < 5) refs.current[i + 1]?.focus() }
  const mm = Math.floor(t / 60), ss = String(t % 60).padStart(2, '0')
  return (
    <div className="pcard narrow"><div className="pcard-pad">
      <BrandCenter />
      <div className="ctitle">Enter the OTP sent to your registered mobile number</div>
      <div className="fgroup"><label className="flabel">Mobile Number</label><input className="finput" value={'+91 ' + mobile} disabled /></div>
      <label className="flabel">Enter 6-digit OTP <span className="req">*</span></label>
      <div className="potp-row">{otp.map((d, i) => (<input key={i} ref={(el) => (refs.current[i] = el)} className="potp" value={d} inputMode="numeric"
        onChange={(e) => set(i, e.target.value)} onKeyDown={(e) => { if (e.key === 'Backspace' && !d && i > 0) refs.current[i - 1]?.focus() }} />))}</div>
      <div style={{ textAlign: 'center', fontSize: 11.5, color: 'var(--g400)', marginBottom: 14 }}>OTP Expires in {mm}:{ss}</div>
      <button className="btn btn-pblue btn-block btn-lg" onClick={onNext}><Icon name="check" size={15} />Verify OTP</button>
      <div style={{ textAlign: 'center', marginTop: 14, display: 'flex', gap: 18, justifyContent: 'center' }}>
        <button className="plink" onClick={onBack}>Change Number</button><button className="plink">Resend OTP</button></div>
    </div></div>
  )
}
function RegAddrModal({ onCancel, onContinue }) {
  return (
    <div className="overlay center" onClick={onCancel}><div className="modal" onClick={(e) => e.stopPropagation()}><div style={{ padding: '28px 30px' }}>
      <BrandCenter />
      <h2 style={{ textAlign: 'center', fontSize: 18, fontWeight: 800, marginBottom: 10 }}>Registered Address Details</h2>
      <div className="ctitle" style={{ marginBottom: 16 }}>To simplify your PNG registration process, your LPG connection address details will be securely fetched for verification and application processing.</div>
      <div className="pnote"><Icon name="check" size={16} /><div>Your existing LPG details will be used to help you fill out your PNG application.</div></div>
      <div className="pnote"><Icon name="lock" size={16} /><div>Your information will be handled securely as per privacy and regulatory guidelines.</div></div>
      <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
        <button className="btn btn-light btn-block" onClick={onCancel}>Cancel</button>
        <button className="btn btn-pblue btn-block" onClick={onContinue}>Continue</button></div>
    </div></div></div>
  )
}
function SelectAddr({ onBack, onContinue }) {
  const opts = [
    { nm: 'Anjali Sharma', ad: '401, Sun Vihar, Sector 22, 201123, Ahmedabad, Gujarat' },
    { nm: 'Aaron Sharma', ad: 'B 304, Lotus Heights, Sector 21, Navi Mumbai, Maharashtra' },
  ]
  const [sel, setSel] = useState(0)
  return (
    <div className="pcard narrow"><div className="pcard-pad">
      <h2 style={{ marginBottom: 6 }}>Select Address for Your PNG Connection</h2>
      <div className="psub">Select an existing LPG address linked to your mobile number or add a different address for your PNG connection.</div>
      <div className="pnote"><Icon name="info" size={16} /><div>Using an existing LPG address can help reduce manual entry and simplify application processing.</div></div>
      {opts.map((o, i) => (<div key={i} className={'addr-opt' + (sel === i ? ' on' : '')} onClick={() => setSel(i)}>
        <div className="pradio" /><div><div className="nm">{o.nm}</div><div className="ad">{o.ad}</div></div></div>))}
      <button className="plink" style={{ marginBottom: 4 }}>+ Use Different Address</button>
      <div style={{ display: 'flex', gap: 12, marginTop: 14 }}>
        <button className="btn btn-light btn-block" onClick={onBack}>Cancel</button>
        <button className="btn btn-pblue btn-block" onClick={onContinue}>Continue</button></div>
    </div></div>
  )
}
function ConfirmAddr({ onBack, onContinue }) {
  const [mode, setMode] = useState('pin')
  return (
    <div className="pcard wide"><div className="pcard-pad">
      <h1 className="ptitle">Confirm Installation Address</h1>
      <div className="psub">Review and update your address details for your PNG connection. Some information has been pre-filled using verified records.</div>
      <div className="pnote"><Icon name="info" size={16} /><div>Pin the exact installation location to help verify PNG network availability for the applicable CGD service area.</div></div>
      <div className="searchbar"><Icon name="search" size={16} /><input placeholder="Search by address, area, landmark, or building" /></div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <button className={'toolbtn' + (mode === 'pin' ? ' on' : '')} onClick={() => setMode('pin')}><Icon name="pin" size={14} />Pin on Map</button>
        <button className={'toolbtn' + (mode === 'cur' ? ' on' : '')} onClick={() => setMode('cur')}><Icon name="crosshair" size={14} />Use Current Location</button>
      </div>
      <div className="pwidegrid" style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 18 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--g700)', marginBottom: 12 }}>Address Information</div>
          <div className="grid-2">
            <div className="fgroup"><label className="flabel">Applicant Name</label><input className="finput" defaultValue="Anjali Sharma" /></div>
            <div className="fgroup"><label className="flabel">Mobile Number</label><input className="finput" defaultValue="9876543210" /></div>
            <div className="fgroup"><label className="flabel">Pincode</label><input className="finput" defaultValue="123456" /></div>
            <div className="fgroup"><label className="flabel">State</label><select className="finput"><option>Gujarat</option><option>Maharashtra</option><option>Rajasthan</option></select></div>
            <div className="fgroup"><label className="flabel">District</label><select className="finput"><option>Ahmedabad</option></select></div>
            <div className="fgroup"><label className="flabel">City / Town</label><input className="finput" defaultValue="Ahmedabad" /></div>
            <div className="fgroup"><label className="flabel">Area / Locality</label><input className="finput" placeholder="Enter area / locality" /></div>
            <div className="fgroup"><label className="flabel">Premise Type</label><select className="finput"><option>Select</option><option>Independent House</option><option>Society / Apartment</option></select></div>
            <div className="fgroup"><label className="flabel">Building / Society Name</label><input className="finput" defaultValue="Sun Vihar" /></div>
            <div className="fgroup"><label className="flabel">House Number</label><input className="finput" placeholder="Enter House Number" /></div>
            <div className="fgroup"><label className="flabel">Floor</label><input className="finput" placeholder="Enter Floor" /></div>
            <div className="fgroup"><label className="flabel">Landmark</label><input className="finput" placeholder="Enter Landmark" /></div>
          </div>
        </div>
        <div className="map"><div className="mtag">Drag map to adjust location</div><div className="pin"><Icon name="pin" size={34} /></div><div className="recenter"><Icon name="crosshair" size={13} />Recenter</div></div>
      </div>
      <div className="pcard-actions"><button className="btn btn-light" onClick={onBack}>Back</button><button className="btn btn-pblue" onClick={onContinue}>Continue <Icon name="arrowR" size={15} /></button></div>
    </div></div>
  )
}
function DocsStep({ form, setForm, onBack, onSubmit }) {
  const [occ, setOcc] = useState('Owned')
  const [c, setC] = useState([false, false, false])
  const consents = [
    'I authorize the concerned authority to use and verify my application details/documents for KYC, application processing, and PNG service delivery.',
    'I confirm that I have obtained the property owner’s consent for installation of the PNG connection at the provided address.',
    'I agree to receive application, service, safety, and status updates through SMS, call, email, or other digital modes.',
  ]
  const allConsent = c.every(Boolean)
  return (
    <div className="pcard wide"><div className="pcard-pad">
      <h1 className="ptitle">Applicant Information &amp; Documents</h1>
      <div className="psub">Review your details, complete the required information, and upload supporting documents. Pre-filled information is sourced from verified records.</div>
      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--g700)', margin: '4px 0 12px' }}>Customer Information</div>
      <div className="grid-3">
        <div className="fgroup"><label className="flabel">Full Name <span className="req">*</span></label><input className="finput" defaultValue="Anjali Sharma" onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></div>
        <div className="fgroup"><label className="flabel">Mobile Number <span className="req">*</span></label><input className="finput" defaultValue="9876543210" onChange={(e) => setForm((f) => ({ ...f, mobile: '+91 ' + e.target.value }))} /></div>
        <div className="fgroup"><label className="flabel">Date of Birth</label><input className="finput" type="date" defaultValue="1990-02-01" /></div>
        <div className="fgroup"><label className="flabel">Father&#39;s / Spouse Name</label><input className="finput" placeholder="Enter Name" /></div>
        <div className="fgroup"><label className="flabel">WhatsApp Number</label><input className="finput" placeholder="Enter WhatsApp Number" /></div>
        <div className="fgroup"><label className="flabel">Email</label><input className="finput" placeholder="Enter Email" onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} /></div>
      </div>
      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--g700)', margin: '10px 0 12px' }}>Upload Documents</div>
      <div className="fgroup"><label className="flabel">Occupancy Type</label>
        <select className="finput" value={occ} onChange={(e) => setOcc(e.target.value)} style={{ maxWidth: 320 }}><option>Owned</option><option>Tenant</option></select></div>
      <div className="grid-2">
        <div className="fgroup"><label className="flabel">Identity Proof — PAN Card</label><div className="urow"><span className="uname">PAN_card.pdf</span><button className="upbtn"><Icon name="upload" size={13} />Upload</button></div></div>
        <div className="fgroup"><label className="flabel">Address Proof — Electricity Bill</label><div className="urow"><span className="uname">electricity_bill.pdf</span><button className="upbtn"><Icon name="upload" size={13} />Upload</button></div></div>
      </div>
      <div style={{ marginTop: 8 }}>{consents.map((t, i) => (
        <div key={i} className={'consent' + (c[i] ? ' on' : '')} onClick={() => setC((x) => x.map((v, j) => (j === i ? !v : v)))}>
          <div className="cbox">{c[i] && <Icon name="check" size={12} />}</div><div>{t}</div></div>))}</div>
      <div className="pcard-actions"><button className="btn btn-light" onClick={onBack}>Back</button>
        <button className="btn btn-pblue" disabled={!allConsent} onClick={onSubmit}><Icon name="check" size={15} />Submit</button></div>
    </div></div>
  )
}
function Submitted({ refId, onReturn }) {
  return (
    <div className="pcard narrow"><div className="pcard-pad" style={{ textAlign: 'center' }}>
      <BrandCenter />
      <div className="psuccess-ic"><Icon name="check" size={30} /></div>
      <h2 style={{ marginBottom: 8 }}>Application Submitted Successfully</h2>
      <div className="ctitle" style={{ marginBottom: 18 }}>Your PNG application has been submitted and is now under review.</div>
      <div style={{ background: 'var(--g50)', border: '1px solid var(--g200)', borderRadius: 12, padding: '12px 16px', marginBottom: 18 }}>
        <div style={{ fontSize: 11.5, color: 'var(--g400)' }}>Application ID</div><div className="mono" style={{ fontSize: 16, fontWeight: 800, color: 'var(--pblue)' }}>{refId}</div></div>
      <button className="btn btn-pblue btn-block btn-lg" onClick={onReturn}>Return to Home <Icon name="arrowR" size={15} /></button>
      <div style={{ fontSize: 11.5, color: 'var(--g400)', marginTop: 12 }}>You'll be taken back to the CGD portal to complete your payment.</div>
    </div></div>
  )
}

export default function MyPngApp() {
  const nav = useNavigate()
  const [screen, setScreen] = useState('mobile')
  const [modal, setModal] = useState(null)
  const [mobile] = useState('9876543210')
  const [form, setForm] = useState({ name: 'Anjali Sharma', mobile: '+91 9876543210', email: 'anjali.sharma@gmail.com' })
  const [ref] = useState(mypngRef())
  const [pngId, setPngId] = useState(null)
  const step = (screen === 'mobile' || screen === 'otp') ? 1 : (screen === 'selectAddr' || screen === 'confirmAddr') ? 2 : 3

  const submit = async () => {
    const png = await Store.create({ name: form.name, mobile: form.mobile, email: form.email, connType: 'Domestic PNG', mypng: ref, premise: 'Society / Apartment', occupancy: 'Tenant', ga: 'Ahmedabad GA' })
    setPngId(png); setScreen('submitted')
  }
  const finish = async () => {
    // cross-portal: log the applicant into the CGD portal (dev OTP auto-verify), fall back to the demo customer
    try { await auth.demoLogin(form.mobile) } catch { await auth.demoLogin('+91 98765 43210') }
    nav('/customer/payment/' + pngId)
  }

  return (
    <div className="mypng">
      <PHeader />
      <PStepper step={step} />
      <div className="pcontent">
        {screen === 'mobile' && <MobileStep onHome={() => nav('/')} onNext={() => setScreen('otp')} />}
        {screen === 'otp' && <OtpStep mobile={mobile} onBack={() => setScreen('mobile')} onNext={() => setModal('regAddr')} />}
        {screen === 'selectAddr' && <SelectAddr onBack={() => setScreen('mobile')} onContinue={() => setScreen('confirmAddr')} />}
        {screen === 'confirmAddr' && <ConfirmAddr onBack={() => setScreen('selectAddr')} onContinue={() => setScreen('docs')} />}
        {screen === 'docs' && <DocsStep form={form} setForm={setForm} onBack={() => setScreen('confirmAddr')} onSubmit={submit} />}
        {screen === 'submitted' && <Submitted refId={ref} onReturn={finish} />}
      </div>
      <PFooter />
      {modal === 'regAddr' && <RegAddrModal onCancel={() => { setModal(null); setScreen('otp') }} onContinue={() => { setModal(null); setScreen('selectAddr') }} />}
    </div>
  )
}
