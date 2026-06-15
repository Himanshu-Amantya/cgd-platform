import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../../lib/icons.jsx'
import { Panel, Badge, Crumbs, KV } from '../../components/ui.jsx'
import { useToast } from '../../components/Toast.jsx'
import { api } from '../../lib/api.js'

const CATS = ['New Connection / Application', 'Payment / Refund', 'Billing', 'Metering', 'Other']

export default function Support() {
  const nav = useNavigate()
  const toast = useToast()
  const [sent, setSent] = useState(null)   // created ticket
  const [category, setCategory] = useState(CATS[2])
  const [detail, setDetail] = useState('')
  const [busy, setBusy] = useState(false)
  const submit = async () => {
    if (!detail.trim()) return
    setBusy(true)
    try {
      const t = await api.raiseComplaint({ category, subject: detail.slice(0, 60), detail })
      setSent(t); toast({ tone: 'green', title: 'Query submitted', msg: t.id })
    } catch (e) { toast({ tone: 'red', title: 'Could not submit', msg: e.message }) } finally { setBusy(false) }
  }
  return (
    <div className="page" style={{ maxWidth: 900 }}>
      <Crumbs items={[{ label: 'Dashboard', onClick: () => nav('/customer') }, { label: 'Support' }]} />
      <div className="phead"><div><h1>Support &amp; Help</h1><p>We resolve most queries within 48 hours · gas leaks within 2 hours.</p></div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button className="btn btn-light" onClick={() => nav('/customer/tickets')}><Icon name="inbox" size={14} />Tickets History</button>
          <span className="badge b-red" style={{ padding: '7px 14px', fontSize: 12 }}>🚨 Gas leak? Call 1906</span>
        </div></div>
      <div className="grid-2" style={{ alignItems: 'start' }}>
        <Panel title="Raise a Query" icon="bell">
          {sent ? (
            <div>
              <div className="alert alert-green" style={{ margin: '0 0 14px' }}><Icon name="check" size={18} /><div><b>Ticket {sent.id} created.</b> Our team will respond within the SLA window.</div></div>
              <button className="btn btn-light btn-block" onClick={() => nav('/customer/tickets')}><Icon name="inbox" size={14} />View in Tickets History</button>
            </div>
          ) : (
            <div>
              <div className="fgroup"><label className="flabel">Category <span className="req">*</span></label>
                <select className="finput" value={category} onChange={(e) => setCategory(e.target.value)}>{CATS.map((c) => <option key={c}>{c}</option>)}</select></div>
              <div className="fgroup"><label className="flabel">Describe your query <span className="req">*</span></label>
                <textarea className="finput" style={{ minHeight: 90 }} placeholder="Tell us what happened…" value={detail} onChange={(e) => setDetail(e.target.value)} /></div>
              <button className="btn btn-primary btn-block" disabled={busy || !detail.trim()} onClick={submit}>{busy ? 'Submitting…' : 'Submit Query'}</button>
            </div>
          )}
        </Panel>
        <Panel title="Contact" icon="phone">
          <KV k="24×7 Helpline"><span className="mono">1800-419-1906</span></KV>
          <KV k="Emergency (gas leak)"><span className="mono" style={{ color: 'var(--red)' }}>1906</span></KV>
          <KV k="WhatsApp"><span className="mono">+91 98290 01906</span></KV>
          <KV k="Email">care@gasonet.in</KV>
          <div className="alert alert-info" style={{ marginTop: 14 }}><Icon name="shield" size={18} /><div>Unresolved grievance? Escalate to the <b>PNGRB IGMS</b> portal as per regulation.</div></div>
        </Panel>
      </div>
    </div>
  )
}
