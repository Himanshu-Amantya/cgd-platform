import { useNavigate } from 'react-router-dom'
import { Icon } from '../../lib/icons.jsx'
import { Panel, Badge, Crumbs, KV } from '../../components/ui.jsx'
import { initials } from '../../lib/format.js'
import { USER, KYC } from './data.js'

export default function Profile() {
  const nav = useNavigate()
  return (
    <div className="page" style={{ maxWidth: 880 }}>
      <Crumbs items={[{ label: 'Dashboard', onClick: () => nav('/customer') }, { label: 'Profile & KYC' }]} />
      <div className="phead"><div><h1>Profile &amp; KYC</h1><p>Your account details, synced with the PNGRB portal.</p></div></div>
      <div className="grid-2" style={{ alignItems: 'start' }}>
        <Panel title="Personal Details" icon="users">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
            <div className="sb-ava" style={{ width: 52, height: 52, borderRadius: 14, fontSize: 18 }}>{initials(USER.name)}</div>
            <div><div style={{ fontSize: 16, fontWeight: 800 }}>{USER.name}</div><div style={{ fontSize: 12, color: 'var(--g400)' }}>Customer since {USER.since}</div></div>
          </div>
          <KV k="Mobile">{USER.mobile} <Badge cls="b-green">Verified</Badge></KV>
          <KV k="Email">{USER.email}</KV>
          <KV k="Address"><span style={{ maxWidth: 220, display: 'inline-block' }}>{USER.address}</span></KV>
          <KV k="PNG ID"><span className="mono">{USER.pngId}</span></KV>
        </Panel>
        <Panel title="KYC Documents" icon="shield" sub="synced with PNGRB portal">
          {KYC.map((d, i) => (
            <div className="docrow" key={i}>
              <div className={'kpi-ic ' + (d[2] ? 'ic-green' : 'ic-amber')} style={{ width: 34, height: 34 }}><Icon name={d[2] ? 'check' : 'clock'} size={15} /></div>
              <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 700 }}>{d[0]}</div><div style={{ fontSize: 11.5, color: 'var(--g400)' }}>{d[1]}</div></div>
              <Badge cls={d[2] ? 'b-green' : 'b-amber'} dot>{d[2] ? 'Verified' : 'Pending'}</Badge>
            </div>
          ))}
        </Panel>
      </div>
    </div>
  )
}
