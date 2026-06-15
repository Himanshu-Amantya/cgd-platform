import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../../lib/icons.jsx'
import { Panel, Crumbs } from '../../components/ui.jsx'
import { useApps } from '../../lib/store.js'
import { inr } from '../../lib/format.js'

export default function Notifications() {
  const nav = useNavigate()
  const apps = useApps()
  const pending = apps.find((a) => !a.paid)
  const base = [
    pending && { t: 'Payment pending', m: 'Pay for ' + pending.png + ' within 72 hours to avoid cancellation.', d: '2h ago', tone: 'amber', unread: true },
    { t: 'Application received from MyPNG', m: (apps[0]?.png || '') + ' was submitted and synced to Gasonet CGD.', d: '1 day ago', tone: 'blue', unread: true },
    { t: 'eKYC verified', m: 'Your Aadhaar eKYC was AUTO_APPROVED.', d: '1 day ago', tone: 'green', unread: false },
    { t: 'May 2026 bill generated', m: 'Invoice INV2505117 of ' + inr(4794) + ' is due on 10 Jun 2026.', d: '15 days ago', tone: 'blue', unread: false },
  ].filter(Boolean)
  const [items, setItems] = useState(base)
  return (
    <div className="page" style={{ maxWidth: 760 }}>
      <Crumbs items={[{ label: 'Dashboard', onClick: () => nav('/customer') }, { label: 'Notifications' }]} />
      <div className="phead"><div><h1>Notifications</h1><p>Updates on your applications, payments and bills.</p></div>
        <button className="btn btn-light" onClick={() => setItems((x) => x.map((n) => ({ ...n, unread: false })))}><Icon name="check" size={14} />Mark all read</button></div>
      <Panel bodyStyle={{ padding: 10 }}>
        {items.map((n, i) => (
          <div key={i} className={'notif' + (n.unread ? ' unread' : '')} onClick={() => setItems((x) => x.map((o, j) => (j === i ? { ...o, unread: false } : o)))}>
            <div className={'kpi-ic ic-' + n.tone} style={{ width: 38, height: 38, flexShrink: 0 }}><Icon name={n.tone === 'amber' ? 'alert' : n.tone === 'green' ? 'check' : 'info'} size={17} /></div>
            <div style={{ flex: 1 }}><div className="nt">{n.t}</div><div className="nm">{n.m}</div><div className="nd">{n.d}</div></div>
            {n.unread && <i style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--blue-mid)', flexShrink: 0, marginTop: 6 }} />}
          </div>
        ))}
      </Panel>
    </div>
  )
}
