import { useNavigate, useParams } from 'react-router-dom'
import { Icon } from '../../lib/icons.jsx'
import { Panel, Crumbs, Badge, Empty } from '../../components/ui.jsx'
import { useToast } from '../../components/Toast.jsx'
import { useApps } from '../../lib/store.js'
import { journey } from '../../lib/status.js'
import { USER } from './data.js'

export default function Status() {
  const nav = useNavigate()
  const toast = useToast()
  const { png } = useParams()
  const apps = useApps()
  const app = apps.find((a) => a.png === png) || apps[0]
  if (!app) return <div className="page"><div className="card"><Empty title="No applications yet" /></div></div>

  const { stages, active } = journey(app)
  return (
    <div className="page" style={{ maxWidth: 820 }}>
      <Crumbs items={[{ label: 'Dashboard', onClick: () => nav('/customer') }, { label: 'Applications', onClick: () => nav('/customer/applications') }, { label: 'Track Status' }]} />
      <div className="phead">
        <div><h1>Application Status</h1><p>{app.connType} · {USER.address}</p></div>
        <button className="btn btn-light" onClick={() => toast(app.paid ? { tone: 'green', title: 'Receipt downloaded', msg: (app.receipt || app.png) + '.pdf' } : { tone: 'amber', title: 'No receipt yet', msg: 'Payment pending' })}><Icon name="download" size={15} />Download Receipt</button>
      </div>
      <div className="card" style={{ marginBottom: 18, background: 'linear-gradient(120deg,var(--blue),var(--blue-mid))', border: 'none', color: '#fff', padding: '18px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div><div style={{ fontSize: 17, fontWeight: 800 }} className="mono">{app.png}</div><div style={{ fontSize: 12, opacity: .78, marginTop: 3 }}>Stage {active + 1} of {stages.length} · MyPNG ref {app.mypng}</div></div>
        <span style={{ background: 'rgba(255,255,255,.2)', border: '1px solid rgba(255,255,255,.3)', borderRadius: 8, padding: '7px 15px', fontSize: 13, fontWeight: 700 }}>{stages[active].t}</span>
      </div>
      <Panel title="Application Journey" icon="map">
        <div className="tl2">
          {stages.map((s, i) => {
            const state = i < active ? 'done' : i === active ? 'active' : ''
            return (
              <div key={i} className={'tl2-i ' + state}>
                <div className="tl2-d"><Icon name={i < active ? 'check' : i === active ? 'clock' : s.icon} size={16} /></div>
                <div className="tl2-card">
                  <div className="tl2-top"><span className="tl2-t">{s.t}</span><Badge cls={i < active ? 'b-green' : i === active ? 'b-blue' : 'b-gray'} dot>{i < active ? 'Completed' : i === active ? 'In Progress' : 'Pending'}</Badge></div>
                  <div className="tl2-desc" style={{ marginTop: 6 }}>{s.desc}</div>
                </div>
              </div>
            )
          })}
        </div>
      </Panel>
      {app.remarks && <div className="alert alert-info" style={{ marginTop: 18 }}><Icon name="info" size={18} /><div><b>Officer remarks:</b> {app.remarks}</div></div>}
      <div className="alert alert-info" style={{ marginTop: 14 }}><Icon name="phone" size={18} /><div>Questions about your application? Call <b>1800-419-1906</b> (24×7) or quote PNG ID <span className="mono">{app.png}</span>.</div></div>
    </div>
  )
}
