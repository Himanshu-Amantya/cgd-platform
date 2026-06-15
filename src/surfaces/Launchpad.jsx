import { useNavigate } from 'react-router-dom'
import { Icon } from '../lib/icons.jsx'

const PORTALS = [
  { to: '/customer', tone: 'green', icon: 'leaf', name: 'Customer CGD Portal', who: 'Consumers',
    desc: 'Apply for a new PNG connection, pay the deposit, track your application and view bills.' },
  { to: '/mypng', tone: 'blue', icon: 'flame', name: 'MyPNG National Portal', who: 'Consumers (onboarding)',
    desc: 'The PNGRB central portal where the customer verifies mobile, confirms address and submits the application.' },
  { to: '/officer', tone: 'purple', icon: 'shield', name: 'CGD Staff Console', who: 'Gasonet staff',
    desc: 'Review applications, manage customers & meters, work orders, billing, cash collection, users and settings.' },
]

export default function Launchpad() {
  const nav = useNavigate()
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 28,
      background: 'linear-gradient(150deg,#0C1B35 0%,#13294f 55%,#0a3d2a 130%)', color: '#fff' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10 }}>
        <div className="sb-logo" style={{ width: 50, height: 50, borderRadius: 14 }}><Icon name="leaf" size={27} style={{ color: '#fff' }} /></div>
        <div>
          <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-.5px' }}>Gasonet CGD Platform</div>
          <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,.55)', fontWeight: 600, letterSpacing: '.4px', textTransform: 'uppercase' }}>City Gas Distribution · MyPNG Integration</div>
        </div>
      </div>
      <p style={{ color: 'rgba(255,255,255,.6)', fontSize: 14, maxWidth: 560, textAlign: 'center', lineHeight: 1.6, marginBottom: 34 }}>
        One platform, three connected surfaces. Pick a portal to begin — applications submitted on MyPNG flow to the
        officer console for review, and the decision flows back to the customer.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18, maxWidth: 980, width: '100%' }}>
        {PORTALS.map((p) => (
          <div key={p.to} onClick={() => nav(p.to)} style={{ cursor: 'pointer', background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 16, padding: 24, transition: '.16s' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,.1)'; e.currentTarget.style.transform = 'translateY(-3px)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,.06)'; e.currentTarget.style.transform = 'none' }}>
            <div className={'kpi-ic ic-' + p.tone} style={{ width: 48, height: 48, borderRadius: 13, marginBottom: 14 }}><Icon name={p.icon} size={24} /></div>
            <div style={{ fontSize: 16.5, fontWeight: 800 }}>{p.name}</div>
            <div style={{ fontSize: 11, color: 'var(--leaf)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px', margin: '4px 0 10px' }}>{p.who}</div>
            <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,.6)', lineHeight: 1.6, marginBottom: 16 }}>{p.desc}</div>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 700, color: '#fff' }}>Open portal <Icon name="arrowR" size={15} /></span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 30, fontSize: 11.5, color: 'rgba(255,255,255,.4)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <Icon name="shield" size={13} /> Gasonet Services (RJ) Ltd · Bikaner &amp; Churu GA · Built by Amantya
      </div>
    </div>
  )
}
