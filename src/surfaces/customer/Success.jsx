import { useNavigate, useParams } from 'react-router-dom'
import { Icon } from '../../lib/icons.jsx'
import { StatusChip, Crumbs, KV, Empty } from '../../components/ui.jsx'
import { useToast } from '../../components/Toast.jsx'
import { useApps } from '../../lib/store.js'
import { inr } from '../../lib/format.js'

export default function Success() {
  const nav = useNavigate()
  const toast = useToast()
  const { png } = useParams()
  const app = useApps().find((a) => a.png === png)
  if (!app) return <div className="page" style={{ maxWidth: 640 }}><div className="card"><Empty title="Application not found"><button className="btn btn-primary btn-sm" onClick={() => nav('/customer')}>Dashboard</button></Empty></div></div>

  return (
    <div className="page" style={{ maxWidth: 640 }}>
      <Crumbs items={[{ label: 'Dashboard', onClick: () => nav('/customer') }, { label: 'Payment', onClick: () => nav('/customer/applications') }, { label: 'Success' }]} />
      <div className="card" style={{ padding: '40px 36px', textAlign: 'center', border: '1.5px solid #86EFAC', background: 'linear-gradient(180deg,#F0FDF4,#fff)' }}>
        <div className="success-ring"><div className="success-ic"><Icon name="check" size={32} /></div></div>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--green)', letterSpacing: '-.5px' }}>Payment Successful</h2>
        <p style={{ fontSize: 13.5, color: 'var(--g500)', marginTop: 8, marginBottom: 24 }}>Your payment has been received. Your application is now in the verification queue.</p>
        <div style={{ background: '#fff', border: '1px solid var(--g200)', borderRadius: 'var(--r-lg)', padding: '6px 20px', textAlign: 'left' }}>
          <KV k="PNG ID"><span className="mono">{app.png}</span></KV>
          <KV k="Transaction ID"><span className="mono">{app.txnId}</span></KV>
          {app.scheme && <KV k="Deposit Scheme">{app.scheme}</KV>}
          <KV k="Payment Amount"><span className="mono">{inr(app.amountPaid)}</span></KV>
          {app.recur && <KV k="Recurring (added to bill)"><span style={{ color: 'var(--purple)' }}>{app.recur}</span></KV>}
          <KV k="Payment Date">{app.paidOn}</KV>
          <KV k="Receipt Number"><span className="mono">{app.receipt}</span></KV>
          <KV k="Current Status"><StatusChip code={app.status} /></KV>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' }}>
          <button className="btn btn-light" onClick={() => toast({ tone: 'green', title: 'Receipt downloaded', msg: app.receipt + '.pdf' })}><Icon name="download" size={15} />Download Receipt</button>
          <button className="btn btn-soft" onClick={() => nav('/customer/status/' + app.png)}><Icon name="map" size={15} />View Application Status</button>
          <button className="btn btn-primary" onClick={() => nav('/customer')}><Icon name="home" size={15} />Go to Dashboard</button>
        </div>
      </div>
      <div className="alert alert-info" style={{ marginTop: 18 }}><Icon name="info" size={18} /><div>A copy of the receipt has been sent to <b>{app.email}</b> and via SMS to {app.mobile}.</div></div>
    </div>
  )
}
