import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../../lib/icons.jsx'
import { Panel, Badge, Crumbs, Empty } from '../../components/ui.jsx'
import { useToast } from '../../components/Toast.jsx'
import { inr } from '../../lib/format.js'
import { api } from '../../lib/api.js'

const COL = {
  DUE: ['Due', 'b-amber'], DUE_TODAY: ['Due Today', 'b-amber'], OVERDUE: ['Overdue', 'b-red'],
  REMINDED: ['Due', 'b-amber'], SCHEDULED: ['Visit Scheduled', 'b-purple'], PAID: ['Paid', 'b-green'],
}

export default function Bills() {
  const nav = useNavigate()
  const toast = useToast()
  const [tab, setTab] = useState('bills')
  const [rows, setRows] = useState([])
  useEffect(() => { api.myBills().then(setRows).catch(() => {}) }, [])
  const outstanding = rows.filter((b) => b.status !== 'PAID')
  const paid = rows.filter((b) => b.status === 'PAID')

  return (
    <div className="page">
      <Crumbs items={[{ label: 'Dashboard', onClick: () => nav('/customer') }, { label: 'Bills & Payments' }]} />
      <div className="phead"><div><h1>Bills &amp; Payments</h1><p>Your invoices, dues and payment history — synced live with Gasonet CGD.</p></div></div>
      <div className="tabs">
        <div className={'tab' + (tab === 'bills' ? ' on' : '')} onClick={() => setTab('bills')}><Icon name="receipt" size={15} />My Bills <span className="cnt">{rows.length}</span></div>
        <div className={'tab' + (tab === 'pays' ? ' on' : '')} onClick={() => setTab('pays')}><Icon name="card" size={15} />Payment History <span className="cnt">{paid.length}</span></div>
      </div>
      {tab === 'bills' ? (
        <Panel bodyStyle={{ padding: 0 }}><div className="tbl-wrap"><table className="tbl">
          <thead><tr><th>Invoice</th><th>Amount</th><th>Due Date</th><th>Status</th><th></th></tr></thead>
          <tbody>{rows.map((b) => (
            <tr key={b.inv}>
              <td className="mono strong" style={{ fontSize: 12 }}>{b.inv}</td>
              <td className="mono strong">{inr(b.amount)}</td>
              <td style={{ color: 'var(--g500)' }}>{b.dueDate}{b.daysOverdue > 0 && <span style={{ color: 'var(--red)', fontSize: 11, display: 'block' }}>{b.daysOverdue}d overdue</span>}</td>
              <td><Badge cls={(COL[b.status] || ['', 'b-gray'])[1]} dot>{(COL[b.status] || [b.status])[0]}</Badge></td>
              <td>{b.status !== 'PAID'
                ? <button className="btn btn-green btn-sm" onClick={() => toast({ tone: 'green', title: 'Redirecting to gateway', msg: inr(b.amount) })}><Icon name="qr" size={13} />Pay</button>
                : <button className="btn btn-light btn-sm" onClick={() => toast({ tone: 'green', title: 'Bill downloaded', msg: b.inv + '.pdf' })}><Icon name="download" size={13} />PDF</button>}</td>
            </tr>
          ))}</tbody>
        </table>{rows.length === 0 && <Empty title="No bills yet">Your cyclic bills will appear here once generated.</Empty>}</div></Panel>
      ) : (
        <Panel bodyStyle={{ padding: 0 }}><div className="tbl-wrap"><table className="tbl">
          <thead><tr><th>Invoice</th><th>Amount</th><th>Paid On</th><th>Status</th><th></th></tr></thead>
          <tbody>{paid.map((p) => (
            <tr key={p.inv}>
              <td className="mono strong" style={{ fontSize: 12 }}>{p.inv}</td>
              <td className="mono strong" style={{ color: 'var(--green)' }}>{inr(p.amount)}</td>
              <td style={{ color: 'var(--g500)' }}>{p.dueDate}</td>
              <td><Badge cls="b-green" dot>Success</Badge></td>
              <td><button className="btn btn-light btn-sm" onClick={() => toast({ tone: 'green', title: 'Receipt downloaded', msg: p.inv })}><Icon name="download" size={13} />Receipt</button></td>
            </tr>
          ))}</tbody>
        </table>{paid.length === 0 && <Empty title="No payments yet">Paid invoices will show up here.</Empty>}</div></Panel>
      )}
    </div>
  )
}
