import { useEffect, useState } from 'react'
import { Icon } from '../../lib/icons.jsx'
import { Panel, Badge } from '../../components/ui.jsx'
import { inr } from '../../lib/format.js'
import { useApps } from '../../lib/store.js'
import { useBills, useCollections, billAmount } from '../../lib/billingStore.js'
import { api } from '../../lib/api.js'

function Kpi({ icon, tone, value, label, sub }) {
  return (
    <div className="kpi">
      <div className={'kpi-ic ic-' + tone} style={{ width: 38, height: 38, marginBottom: 10 }}><Icon name={icon} size={18} /></div>
      <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--g900)' }}>{value}</div>
      <div style={{ fontSize: 12, color: 'var(--g500)', fontWeight: 600 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--g400)', marginTop: 2 }} className="mono">{sub}</div>}
    </div>
  )
}

// Horizontal bar chart. data: [[label, value, colorVar]]
function BarChart({ data, fmt = (v) => v }) {
  const max = Math.max(1, ...data.map((d) => d[1]))
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
      {data.map((d) => (
        <div key={d[0]}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
            <span style={{ color: 'var(--g600)', fontWeight: 600 }}>{d[0]}</span>
            <span className="mono" style={{ color: 'var(--g700)', fontWeight: 700 }}>{fmt(d[1])}</span>
          </div>
          <div style={{ height: 9, borderRadius: 6, background: 'var(--g100)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: (d[1] / max * 100) + '%', background: d[2] || 'var(--blue-mid)', borderRadius: 6, transition: 'width .3s' }} />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function Reports() {
  const apps = useApps()
  const bills = useBills()
  const collections = useCollections()
  const [customers, setCustomers] = useState([])
  const [complaints, setComplaints] = useState([])
  useEffect(() => { api.customers().then(setCustomers).catch(() => {}); api.complaints().then(setComplaints).catch(() => {}) }, [])

  const inReview = apps.filter((a) => ['REVIEW', 'PAID', 'VERIFIED'].includes(a.status)).length
  const completed = apps.filter((a) => a.status === 'COMPLETED').length
  const released = bills.filter((b) => b.status === 'RELEASED').length
  const outstanding = collections.filter((c) => c.status !== 'PAID').reduce((s, c) => s + c.amount, 0)
  const collected = collections.filter((c) => c.status === 'PAID').reduce((s, c) => s + c.amount, 0)
  const openComplaints = complaints.filter((c) => c.status !== 'CLOSED').length
  const collectRate = outstanding + collected > 0 ? Math.round(collected / (outstanding + collected) * 100) : 0

  const billPipeline = [
    ['Pending Validation', bills.filter((b) => b.status === 'PENDING_VALIDATION').length, 'var(--amber)'],
    ['Pending Approval', bills.filter((b) => b.status === 'PENDING_APPROVAL').length, 'var(--blue-mid)'],
    ['Approved', bills.filter((b) => b.status === 'APPROVED').length, 'var(--teal)'],
    ['Released', bills.filter((b) => b.status === 'RELEASED').length, 'var(--green-mid)'],
    ['Rejected', bills.filter((b) => b.status === 'REJECTED').length, 'var(--red)'],
  ]
  const collAging = [
    ['Due', collections.filter((c) => ['DUE', 'DUE_TODAY'].includes(c.status)).reduce((s, c) => s + c.amount, 0), 'var(--amber)'],
    ['Overdue', collections.filter((c) => c.status === 'OVERDUE').reduce((s, c) => s + c.amount, 0), 'var(--red)'],
    ['Reminded', collections.filter((c) => c.status === 'REMINDED').reduce((s, c) => s + c.amount, 0), 'var(--blue-mid)'],
    ['Scheduled', collections.filter((c) => c.status === 'SCHEDULED').reduce((s, c) => s + c.amount, 0), 'var(--purple)'],
    ['Collected', collected, 'var(--green-mid)'],
  ]
  const cats = ['Domestic', 'Commercial', 'Industrial']
  const revByCat = cats.map((cat) => [cat, bills.filter((b) => b.category === cat).reduce((s, b) => s + billAmount(b), 0), 'var(--blue-mid)']).filter((r) => r[1] > 0)

  return (
    <div className="page wide">
      <div className="phead"><div><h1>Reports &amp; Dashboard</h1><p>Live snapshot across onboarding, metering, billing and collections.</p></div>
        <Badge cls="b-green" style={{ padding: '7px 12px' }}><i className="dot" />Live</Badge></div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 16 }}>
        <Kpi icon="users" tone="blue" value={customers.length} label="Total Connections" />
        <Kpi icon="inbox" tone="amber" value={inReview} label="Applications in Review" />
        <Kpi icon="flame" tone="green" value={completed} label="Connections Completed" />
        <Kpi icon="receipt" tone="teal" value={released} label="Bills Released" />
        <Kpi icon="rupee" tone="amber" value={inr(outstanding)} label="Collection Outstanding" />
        <Kpi icon="check" tone="green" value={inr(collected)} label="Collected" sub={collectRate + '% collection rate'} />
        <Kpi icon="alert" tone="red" value={openComplaints} label="Open Complaints" />
        <Kpi icon="bar" tone="blue" value={bills.length} label="Total Bills (cycle)" />
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        <Panel title="Bill Generation Pipeline" icon="receipt"><BarChart data={billPipeline} /></Panel>
        <Panel title="Collections Aging (₹)" icon="rupee"><BarChart data={collAging} fmt={inr} /></Panel>
      </div>
      <Panel title="Revenue by Category (₹, this cycle)" icon="bar" style={{ marginTop: 18 }}>
        {revByCat.length ? <BarChart data={revByCat} fmt={inr} /> : <div style={{ fontSize: 12.5, color: 'var(--g400)', textAlign: 'center', padding: 10 }}>No billed revenue yet — generate bills from readings.</div>}
      </Panel>
    </div>
  )
}
