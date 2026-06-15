import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../../lib/icons.jsx'
import { Panel, Badge, Drawer, Modal, Menu, KV, Empty } from '../../components/ui.jsx'
import { useToast } from '../../components/Toast.jsx'
import { inr, avatarColor, initials } from '../../lib/format.js'
import { BillingStore, useBills, useCollections, billAmount } from '../../lib/billingStore.js'

const Req = () => <span className="req">*</span>

/* ════════ M3 · Bill Generation & Approval ════════ */
const BSTATUS = {
  PENDING_VALIDATION: ['Pending Validation', 'b-amber'],
  PENDING_APPROVAL: ['Pending Approval', 'b-blue'],
  APPROVED: ['Approved', 'b-teal'],
  RELEASED: ['Released', 'b-green'],
  REJECTED: ['Rejected', 'b-red'],
}
const BBadge = ({ s }) => <Badge cls={BSTATUS[s][1]} dot>{BSTATUS[s][0]}</Badge>

export function BillGeneration() {
  const rows = useBills()
  const [open, setOpen] = useState(null)
  const [filter, setFilter] = useState('all')
  const cur = open && rows.find((b) => b.id === open)

  const KPI = [
    ['Pending Validation', rows.filter((b) => b.status === 'PENDING_VALIDATION').length, 'var(--amber)'],
    ['Pending Approval', rows.filter((b) => b.status === 'PENDING_APPROVAL').length, 'var(--blue-mid)'],
    ['Approved', rows.filter((b) => b.status === 'APPROVED').length, 'var(--g900)'],
    ['Released', rows.filter((b) => b.status === 'RELEASED').length, 'var(--green)'],
    ['Rejected', rows.filter((b) => b.status === 'REJECTED').length, 'var(--red)'],
  ]
  const list = rows.filter((b) => {
    if (filter === 'validate' && b.status !== 'PENDING_VALIDATION') return false
    if (filter === 'approve' && b.status !== 'PENDING_APPROVAL') return false
    if (filter === 'done' && !['APPROVED', 'RELEASED'].includes(b.status)) return false
    return true
  })

  return (
    <div className="page wide">
      <div className="phead"><div><h1>Bill Generation &amp; Approval</h1><p>Validate cyclic readings, generate bills, get manager approval and release to customers.</p></div></div>
      <div className="funnel">{KPI.map((k) => (
        <div key={k[0]} className="fn" style={{ cursor: 'default' }}><div className="v" style={{ color: k[2] }}>{k[1]}</div><div className="k">{k[0]}</div></div>
      ))}</div>
      <div className="filterbar">
        {[['all', 'All'], ['validate', 'To Validate'], ['approve', 'To Approve'], ['done', 'Approved / Released']].map((c) => <div key={c[0]} className={'chip' + (filter === c[0] ? ' on' : '')} onClick={() => setFilter(c[0])}>{c[1]}</div>)}
      </div>
      <div className="card"><div className="tbl-wrap"><table className="tbl">
        <thead><tr><th>Invoice</th><th>Customer</th><th>Cycle</th><th>Units</th><th>Amount</th><th>Generated</th><th>Status</th><th></th></tr></thead>
        <tbody>{list.map((b) => (
          <tr key={b.id} className="clickable" onClick={() => setOpen(b.id)}>
            <td className="mono strong" style={{ fontSize: 12 }}>{b.id}</td>
            <td><div className="cust"><div className="av" style={{ background: avatarColor(b.name) }}>{initials(b.name)}</div><div><div className="nm">{b.name}</div><div className="id">{b.pngId}</div></div></div></td>
            <td>{b.cycle}</td><td className="mono">{b.cur - b.prev} m³</td><td className="mono strong">{inr(billAmount(b))}</td>
            <td style={{ color: 'var(--g500)' }}>{b.generated}</td><td><BBadge s={b.status} /></td>
            <td onClick={(e) => e.stopPropagation()}><button className={'btn btn-sm ' + (['PENDING_VALIDATION', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED'].includes(b.status) ? 'btn-primary' : 'btn-light')} onClick={() => setOpen(b.id)}><Icon name="eye" size={13} />{['PENDING_VALIDATION', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED'].includes(b.status) ? 'Process' : 'View'}</button></td>
          </tr>
        ))}</tbody>
      </table>{list.length === 0 && <Empty title="No bills match" />}</div></div>
      {cur && <BillDrawer b={cur} onClose={() => setOpen(null)} />}
    </div>
  )
}

function BillDrawer({ b, onClose }) {
  const toast = useToast()
  const [reject, setReject] = useState(false)
  const units = b.cur - b.prev
  const energy = units * b.rate
  const amount = energy + b.fixed
  const done = (fn, t) => { fn(); toast(t); onClose() }

  return (
    <Drawer title={<span className="mono">{b.id}</span>} sub={b.name + ' · ' + b.pngId} onClose={onClose}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <BBadge s={b.status} /><Badge cls="b-gray">{b.cycle}</Badge>
        <span style={{ marginLeft: 'auto', fontSize: 11.5, color: 'var(--g400)' }}>Generated {b.generated}</span>
      </div>
      <Panel title="Bill Preview" icon="receipt">
        <KV k="Meter Reading">{b.prev} → {b.cur} m³</KV>
        <KV k="Consumption"><span className="mono">{units} m³</span></KV>
        <KV k={'Energy Charge (' + units + ' × ₹' + b.rate + ')'}><span className="mono">{inr(energy)}</span></KV>
        <KV k="Fixed / Service Charge"><span className="mono">{inr(b.fixed)}</span></KV>
        <div className="kv" style={{ borderTop: '2px solid var(--g200)', borderBottom: 'none', paddingTop: 10 }}>
          <span className="k" style={{ fontWeight: 800, color: 'var(--g900)' }}>Bill Amount</span>
          <span className="v mono" style={{ fontSize: 17, color: 'var(--blue)' }}>{inr(amount)}</span>
        </div>
      </Panel>
      {b.status === 'REJECTED' && b.reason && <div className="alert alert-warn"><Icon name="alert" size={18} /><div><b>Returned:</b> {b.reason}</div></div>}

      {b.status === 'PENDING_VALIDATION' && (
        <>
          <div className="alert alert-info"><Icon name="info" size={18} /><div>Validate the reading and charges, then generate the bill for manager approval.</div></div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-danger" style={{ flex: 1 }} onClick={() => setReject(true)}><Icon name="x" size={15} />Reject</button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => done(() => BillingStore.validateBill(b.id), { tone: 'blue', title: 'Bill generated', msg: b.id + ' → pending approval' })}><Icon name="check" size={15} />Validate &amp; Generate</button>
          </div>
        </>
      )}
      {b.status === 'PENDING_APPROVAL' && (
        <>
          <div className="alert alert-info"><Icon name="shield" size={18} /><div>Manager approval required before the bill is released to the customer.</div></div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-danger" style={{ flex: 1 }} onClick={() => setReject(true)}><Icon name="x" size={15} />Reject</button>
            <button className="btn btn-green" style={{ flex: 1 }} onClick={() => done(() => BillingStore.approveBill(b.id), { tone: 'green', title: 'Bill approved', msg: b.id })}><Icon name="check" size={15} />Approve Bill</button>
          </div>
        </>
      )}
      {b.status === 'APPROVED' && (
        <button className="btn btn-primary btn-block" onClick={() => done(() => BillingStore.releaseBill(b.id), { tone: 'green', title: 'Bill released', msg: b.id + ' · SMS · Email · WhatsApp · Portal · → Collections' })}><Icon name="send" size={15} />Release to Customer</button>
      )}
      {b.status === 'RELEASED' && <div className="alert alert-green" style={{ marginBottom: 0 }}><Icon name="check" size={18} /><div>Released via <b>SMS, Email, WhatsApp</b> &amp; the <b>Customer Portal</b>. An outstanding entry was added to <b>Collections</b>.</div></div>}
      {b.status === 'REJECTED' && (
        <button className="btn btn-primary btn-block" onClick={() => done(() => BillingStore.regenerateBill(b.id), { tone: 'blue', title: 'Bill regenerated', msg: b.id + ' → pending validation' })}><Icon name="refresh" size={15} />Correct &amp; Regenerate</button>
      )}

      {reject && <RejectModal b={b} onClose={() => setReject(false)} onReject={(reason) => done(() => BillingStore.rejectBill(b.id, reason), { tone: 'red', title: 'Bill rejected', msg: b.id + ' → returned for correction' })} />}
    </Drawer>
  )
}

function RejectModal({ b, onClose, onReject }) {
  const [reason, setReason] = useState('')
  return (
    <Modal title="Reject / Return Bill" icon="x" onClose={onClose}
      footer={<><button className="btn btn-light" onClick={onClose}>Cancel</button>
        <button className="btn btn-danger" disabled={!reason.trim()} onClick={() => onReject(reason)}><Icon name="x" size={15} />Reject &amp; Return</button></>}>
      <p style={{ fontSize: 13, color: 'var(--g600)', marginTop: 0 }}>Returning <b className="mono">{b.id}</b> for correction. The billing team can fix the reading and regenerate.</p>
      <div className="fgroup"><label className="flabel">Reason <Req /></label>
        <textarea className="finput" placeholder="e.g. Reading discrepancy — verify before regenerating…" value={reason} onChange={(e) => setReason(e.target.value)} /></div>
    </Modal>
  )
}

/* ════════ M5 · Payments & Collections ════════ */
const COLSTATUS = {
  DUE: ['Due', 'b-amber'], DUE_TODAY: ['Due Today', 'b-amber'], OVERDUE: ['Overdue', 'b-red'],
  REMINDED: ['Reminded', 'b-blue'], SCHEDULED: ['Visit Scheduled', 'b-purple'], PAID: ['Paid', 'b-green'],
}
const ColBadge = ({ s }) => <Badge cls={COLSTATUS[s][1]} dot>{COLSTATUS[s][0]}</Badge>

export function Collections() {
  const nav = useNavigate()
  const toast = useToast()
  const rows = useCollections()
  const [filter, setFilter] = useState('all')
  const [visit, setVisit] = useState(null)
  const [pay, setPay] = useState(null)

  const unpaid = rows.filter((c) => c.status !== 'PAID')
  const KPI = [
    ['Pending', unpaid.length, inr(unpaid.reduce((s, c) => s + c.amount, 0)), 'var(--g900)'],
    ['Due Today', rows.filter((c) => c.status === 'DUE_TODAY').length, '', 'var(--amber)'],
    ['Overdue', rows.filter((c) => c.status === 'OVERDUE').length, '', 'var(--red)'],
    ['Collected', rows.filter((c) => c.status === 'PAID').length, inr(rows.filter((c) => c.status === 'PAID').reduce((s, c) => s + c.amount, 0)), 'var(--green)'],
  ]
  const list = rows.filter((c) => {
    if (filter === 'today' && c.status !== 'DUE_TODAY') return false
    if (filter === 'overdue' && c.status !== 'OVERDUE') return false
    if (filter === 'open' && c.status === 'PAID') return false
    return true
  })

  return (
    <div className="page wide">
      <div className="phead"><div><h1>Payments &amp; Collections</h1><p>Track outstanding bills, send reminders and schedule collection visits.</p></div></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 18 }}>
        {KPI.map((k) => (
          <div key={k[0]} className="kpi"><div style={{ fontSize: 22, fontWeight: 800, color: k[3] }}>{k[1]}</div><div style={{ fontSize: 11.5, color: 'var(--g500)', fontWeight: 600 }}>{k[0]}</div>{k[2] && <div style={{ fontSize: 11.5, color: 'var(--g400)', marginTop: 2 }} className="mono">{k[2]}</div>}</div>
        ))}
      </div>
      <div className="filterbar">
        {[['all', 'All'], ['open', 'Outstanding'], ['today', 'Due Today'], ['overdue', 'Overdue']].map((c) => <div key={c[0]} className={'chip' + (filter === c[0] ? ' on' : '')} onClick={() => setFilter(c[0])}>{c[1]}</div>)}
      </div>
      <div className="card"><div className="tbl-wrap"><table className="tbl">
        <thead><tr><th>Invoice</th><th>Customer</th><th>Amount</th><th>Due Date</th><th>Status</th><th style={{ textAlign: 'right' }}>Actions</th></tr></thead>
        <tbody>{list.map((c) => (
          <tr key={c.inv}>
            <td className="mono strong" style={{ fontSize: 12 }}>{c.inv}</td>
            <td><div className="cust"><div className="av" style={{ background: avatarColor(c.name) }}>{initials(c.name)}</div><div><div className="nm">{c.name}</div><div className="id mono">{c.mobile}</div></div></div></td>
            <td className="mono strong">{inr(c.amount)}</td>
            <td style={{ color: 'var(--g500)' }}>{c.dueDate}{c.daysOverdue > 0 && <span style={{ color: 'var(--red)', fontSize: 11, display: 'block' }}>{c.daysOverdue}d overdue</span>}</td>
            <td><ColBadge s={c.status} /></td>
            <td style={{ textAlign: 'right' }}>
              {c.status === 'PAID' ? <Badge cls="b-green" dot>Settled</Badge> : (
                <Menu label={'Collection actions for ' + c.name} items={[
                  { label: 'Send Reminder (SMS)', icon: 'send', onClick: () => { BillingStore.remindCollection(c.inv); toast({ tone: 'blue', title: 'Reminder sent', msg: c.mobile }) } },
                  { label: 'Call Customer', icon: 'phone', onClick: () => toast({ tone: 'blue', title: 'Calling ' + c.name, msg: c.mobile }) },
                  { label: 'Schedule Visit', icon: 'calendar', onClick: () => setVisit(c) },
                  { sep: true },
                  { label: 'Record Payment', icon: 'rupee', onClick: () => setPay(c) },
                  { label: 'Open Cash Desk', icon: 'wallet', onClick: () => nav('/officer/cash-payment') },
                ]} />
              )}
            </td>
          </tr>
        ))}</tbody>
      </table>{list.length === 0 && <Empty title="No outstanding bills" />}</div></div>

      {visit && (
        <ScheduleVisitModal c={visit} onClose={() => setVisit(null)} onSave={(date) => { BillingStore.scheduleCollection(visit.inv); toast({ tone: 'purple', title: 'Visit scheduled', msg: visit.name + ' · ' + date }); setVisit(null) }} />
      )}
      {pay && (
        <RecordPaymentModal c={pay} onClose={() => setPay(null)} onSave={(mode) => { BillingStore.recordPayment(pay.inv); toast({ tone: 'green', title: 'Payment recorded', msg: pay.inv + ' · ' + inr(pay.amount) + ' · ' + mode }); setPay(null) }} />
      )}
    </div>
  )
}

function ScheduleVisitModal({ c, onClose, onSave }) {
  const [date, setDate] = useState('2026-06-17')
  return (
    <Modal title="Schedule Collection Visit" icon="calendar" onClose={onClose}
      footer={<><button className="btn btn-light" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={() => onSave(date)}><Icon name="check" size={15} />Schedule Visit</button></>}>
      <div className="card" style={{ background: 'var(--g50)', marginBottom: 16 }}><div className="card-b" style={{ padding: 14 }}>
        <KV k="Customer">{c.name}</KV><KV k="Invoice"><span className="mono">{c.inv}</span></KV><KV k="Outstanding"><span className="mono strong" style={{ color: 'var(--amber)' }}>{inr(c.amount)}</span></KV>
      </div></div>
      <div className="grid-2">
        <div className="fgroup"><label className="flabel">Visit Date <Req /></label><input className="finput" type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
        <div className="fgroup"><label className="flabel">Collection Agent <Req /></label>
          <select className="finput"><option>Vikram Rathore</option><option>Field Team A</option><option>Field Team B</option></select></div>
      </div>
    </Modal>
  )
}

function RecordPaymentModal({ c, onClose, onSave }) {
  const [mode, setMode] = useState('UPI')
  return (
    <Modal title="Record Payment" icon="rupee" onClose={onClose}
      footer={<><button className="btn btn-light" onClick={onClose}>Cancel</button>
        <button className="btn btn-green" onClick={() => onSave(mode)}><Icon name="check" size={15} />Record &amp; Settle</button></>}>
      <div className="card" style={{ background: 'var(--g50)', marginBottom: 16 }}><div className="card-b" style={{ padding: 14 }}>
        <KV k="Customer">{c.name}</KV><KV k="Invoice"><span className="mono">{c.inv}</span></KV>
        <KV k="Amount"><span className="mono strong" style={{ color: 'var(--green)' }}>{inr(c.amount)}</span></KV>
      </div></div>
      <div className="fgroup"><label className="flabel">Payment Mode <Req /></label>
        <select className="finput" value={mode} onChange={(e) => setMode(e.target.value)}><option>UPI</option><option>Cash</option><option>NEFT / Bank</option><option>Card</option></select></div>
    </Modal>
  )
}
