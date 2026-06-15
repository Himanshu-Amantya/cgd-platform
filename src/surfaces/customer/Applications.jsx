import { useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { Icon } from '../../lib/icons.jsx'
import { Panel, StatusChip, Badge, Drawer, Empty, KV } from '../../components/ui.jsx'
import { useApps } from '../../lib/store.js'
import { statusLabel } from '../../lib/status.js'

export default function Applications() {
  const nav = useNavigate()
  const { onApply } = useOutletContext()
  const apps = useApps()
  const [filter, setFilter] = useState('All')
  const [q, setQ] = useState('')
  const [detail, setDetail] = useState(null)
  const filters = ['All', 'Payment Pending', 'Under Verification', 'Approved', 'Completed']
  const matchFilter = (a) => {
    if (filter === 'All') return true
    if (filter === 'Payment Pending') return a.status === 'PAYMENT_PENDING'
    if (filter === 'Under Verification') return ['REVIEW', 'VERIFIED', 'PAID'].includes(a.status)
    if (filter === 'Approved') return a.status === 'APPROVED'
    if (filter === 'Completed') return a.status === 'COMPLETED'
    return true
  }
  const rows = apps.filter((a) => matchFilter(a) && (!q || (a.png + a.name + a.connType).toLowerCase().includes(q.toLowerCase())))

  return (
    <div className="page">
      <div className="phead">
        <div><h1>My Applications</h1><p>Every PNG connection request, its status and payment.</p></div>
        <button className="btn btn-primary" onClick={onApply}><Icon name="plus" size={15} />New Connection</button>
      </div>
      <div className="filterbar">
        <div className="fsearch"><Icon name="search" size={15} /><input placeholder="Search by PNG ID…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        {filters.map((f) => <div key={f} className={'chip' + (filter === f ? ' on' : '')} onClick={() => setFilter(f)}>{f}</div>)}
      </div>
      {rows.length ? (
        <Panel bodyStyle={{ padding: 0 }}>
          <div className="tbl-wrap"><table className="tbl">
            <thead><tr><th>PNG ID</th><th>Type</th><th>Status</th><th>Payment</th><th>Submitted</th><th>Last Updated</th><th>Actions</th></tr></thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.png} className="clickable" onClick={() => setDetail(a)}>
                  <td className="mono strong" style={{ fontSize: 12 }}>{a.png}</td>
                  <td>{a.connType}</td>
                  <td><StatusChip code={a.status} /></td>
                  <td><Badge cls={a.paid ? 'b-green' : 'b-amber'} dot>{a.paid ? 'Paid' : 'Pending'}</Badge></td>
                  <td style={{ color: 'var(--g500)' }}>{a.submitted}</td>
                  <td style={{ color: 'var(--g500)' }}>{a.updated}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div className="row-actions">
                      <button className="btn btn-light btn-sm" onClick={() => setDetail(a)}><Icon name="eye" size={13} />Details</button>
                      {!a.paid && <button className="btn btn-green btn-sm" onClick={() => nav('/customer/payment/' + a.png)}><Icon name="card" size={13} />Pay</button>}
                      <button className="btn btn-ghost btn-sm" title="Track" onClick={() => nav('/customer/status/' + a.png)}><Icon name="map" size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </Panel>
      ) : (
        <Panel><Empty title="No applications here" action={<button className="btn btn-primary btn-sm" onClick={onApply}><Icon name="plus" size={13} />Apply Now</button>}>No applications match this filter. Try another, or apply for a new connection.</Empty></Panel>
      )}
      {detail && (
        <Drawer title={<span className="mono">{detail.png}</span>} sub={detail.connType} onClose={() => setDetail(null)}>
          <div style={{ display: 'flex', gap: 8 }}><StatusChip code={detail.status} /><Badge cls={detail.paid ? 'b-green' : 'b-amber'} dot>{detail.paid ? 'Paid' : 'Payment Pending'}</Badge></div>
          <Panel title="Application Summary" icon="file">
            <KV k="Applicant">{detail.name}</KV>
            <KV k="Mobile"><span className="mono">{detail.mobile}</span></KV>
            <KV k="Email">{detail.email}</KV>
            <KV k="Premise / Occupancy">{detail.premise} · {detail.occupancy}</KV>
            <KV k="eKYC"><span style={{ color: 'var(--green)' }}>{detail.ekyc} ✓</span></KV>
            <KV k="Serviceability"><span style={{ color: 'var(--green)' }}>{detail.serviceability} ✓</span></KV>
            <KV k="Submitted">{detail.submitted}</KV>
          </Panel>
          <Panel title="Reviewed Documents" icon="shield" sub="verificationStatus from CGD officer">
            {detail.docs.map((d, i) => (
              <div className="docrow" key={i}>
                <div className={'kpi-ic ' + (d[2] === 'APPROVED' ? 'ic-green' : d[2] === 'REJECTED' ? 'ic-red' : 'ic-amber')} style={{ width: 36, height: 36 }}><Icon name={d[2] === 'APPROVED' ? 'check' : d[2] === 'REJECTED' ? 'x' : 'clock'} size={16} /></div>
                <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 700 }}>{d[0]}</div><div style={{ fontSize: 11.5, color: 'var(--g400)' }}>{d[1]}</div></div>
                <Badge cls={d[2] === 'APPROVED' ? 'b-green' : d[2] === 'REJECTED' ? 'b-red' : 'b-amber'} dot>{d[2]}</Badge>
              </div>
            ))}
          </Panel>
          {detail.remarks && <div className="alert alert-info"><Icon name="info" size={18} /><div><b>Officer remarks:</b> {detail.remarks}</div></div>}
          <div style={{ display: 'flex', gap: 10 }}>
            {!detail.paid && <button className="btn btn-green" style={{ flex: 1 }} onClick={() => { setDetail(null); nav('/customer/payment/' + detail.png) }}><Icon name="card" size={15} />Pay Now</button>}
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => { setDetail(null); nav('/customer/status/' + detail.png) }}><Icon name="map" size={15} />Track Status</button>
          </div>
        </Drawer>
      )}
    </div>
  )
}
