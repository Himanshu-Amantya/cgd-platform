import { useOutletContext } from 'react-router-dom'
import { Icon } from '../../lib/icons.jsx'
import { Panel, Badge, Crumbs, KV } from '../../components/ui.jsx'

const STEPS = [
  { ic: 'plus', t: 'Apply on MyPNG', d: 'Click "Apply" — you are securely redirected to the MyPNG national portal to fill your details and complete eKYC.' },
  { ic: 'shield', t: 'eKYC & Serviceability', d: 'Aadhaar eKYC (AUTO_APPROVED when it matches your LPG identity) and address serviceability are verified instantly.' },
  { ic: 'card', t: 'Return & Pay', d: 'You return to the Gasonet CGD Portal to pay the security deposit & charges via UPI / card / net-banking / NEFT.' },
  { ic: 'eye', t: 'Verification', d: 'A Gasonet CGD officer reviews your documents (status REVIEW → VERIFIED → APPROVED).' },
  { ic: 'calendar', t: 'Installation Scheduled', d: 'An installation slot is confirmed with the field crew for survey & piping.' },
  { ic: 'flame', t: 'Connection Live', d: 'Meter installed, JMR signed and gas supply activated (status COMPLETED).' },
]

export default function Onboarding() {
  const { onApply } = useOutletContext()
  return (
    <div className="page" style={{ maxWidth: 1000 }}>
      <Crumbs items={[{ label: 'Dashboard', onClick: null }, { label: 'New PNG Connection' }]} />
      <div className="cta-card">
        <div><h2>Apply for a New PNG Connection</h2><p>Clean piped natural gas for your home or business. The application is completed on the MyPNG national portal and you return here to pay and track.</p></div>
        <button className="btn btn-green btn-lg" style={{ position: 'relative', flexShrink: 0 }} onClick={onApply}><Icon name="plus" size={17} />Apply for New PNG Connection</button>
      </div>
      <div className="phead" style={{ marginBottom: 14 }}><div><h1 style={{ fontSize: 18 }}>How onboarding works</h1><p>6 simple steps — most of it is automated through the MyPNG ↔ Gasonet CGD integration.</p></div></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
        {STEPS.map((s, i) => (
          <div className="card" key={i} style={{ padding: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div className="kpi-ic ic-blue" style={{ width: 40, height: 40 }}><Icon name={s.ic} size={19} /></div>
              <span className="mono" style={{ fontSize: 12, fontWeight: 700, color: 'var(--g300)' }}>0{i + 1}</span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 5 }}>{s.t}</div>
            <div style={{ fontSize: 12, color: 'var(--g500)', lineHeight: 1.55 }}>{s.d}</div>
          </div>
        ))}
      </div>
      <div className="grid-2" style={{ marginTop: 18, alignItems: 'start' }}>
        <Panel title="What you'll need" icon="file">
          {['Registered mobile number (for OTP)', 'Aadhaar (for eKYC)', 'PAN card', 'Address proof (e.g. electricity bill)', 'Premise ownership / NOC'].map((d, i) => (
            <KV key={i} k={<span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Icon name="check" size={14} style={{ color: 'var(--green-mid)' }} />{d}</span>}> </KV>
          ))}
        </Panel>
        <Panel title="Eligible connection types" icon="flame" sub="Phase 1 · web">
          <KV k="Domestic PNG"><Badge cls="b-green" dot>Available</Badge></KV>
          <KV k="Commercial PNG"><Badge cls="b-green" dot>Available</Badge></KV>
          <KV k="Industrial PNG"><Badge cls="b-amber" dot>Phase 2</Badge></KV>
          <div className="alert alert-info" style={{ marginTop: 14 }}><Icon name="info" size={18} /><div>Serviceability depends on whether the Gasonet network covers your area. This is checked automatically on MyPNG.</div></div>
        </Panel>
      </div>
    </div>
  )
}
