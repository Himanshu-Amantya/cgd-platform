import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../../lib/icons.jsx'
import { Panel, Badge, Drawer, KV, Empty, Crumbs } from '../../components/ui.jsx'
import { api } from '../../lib/api.js'

// backend complaint status → customer-facing label + badge
const STATUS = {
  OPEN: ['Open', 'b-amber'], IN_REVIEW: ['Under Review', 'b-blue'], ASSIGNED: ['In Progress', 'b-blue'],
  RESOLVED: ['Resolved', 'b-teal'], CONFIRMED: ['Resolved', 'b-teal'], CLOSED: ['Closed', 'b-gray'],
}
const isOpen = (t) => !['CLOSED'].includes(t.status)
const FILTERS = [['all', 'All'], ['open', 'Open'], ['closed', 'Closed']]

export default function Tickets() {
  const nav = useNavigate()
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState('all')
  const [open, setOpen] = useState(null)
  const [tickets, setTickets] = useState([])
  useEffect(() => { api.myComplaints().then(setTickets).catch(() => {}) }, [])

  const rows = tickets.filter((t) => {
    if (filter === 'open' && !isOpen(t)) return false
    if (filter === 'closed' && isOpen(t)) return false
    if (q && !(t.id + t.subject + t.category).toLowerCase().includes(q.toLowerCase())) return false
    return true
  })
  const openCount = tickets.filter(isOpen).length
  const cur = open && tickets.find((t) => t.id === open)

  return (
    <div className="page" style={{ maxWidth: 900 }}>
      <Crumbs items={[{ label: 'Dashboard', onClick: () => nav('/customer') }, { label: 'Support', onClick: () => nav('/customer/support') }, { label: 'Tickets History' }]} />
      <div className="phead">
        <div><h1>Tickets History</h1><p>{openCount} open · {tickets.length} total · queries and grievances you've raised.</p></div>
        <button className="btn btn-primary" onClick={() => nav('/customer/support')}><Icon name="plus" size={15} />Raise a Query</button>
      </div>
      <div className="filterbar">
        <div className="fsearch"><Icon name="search" size={15} /><input placeholder="Search ticket ID, subject or category…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        {FILTERS.map((c) => <div key={c[0]} className={'chip' + (filter === c[0] ? ' on' : '')} onClick={() => setFilter(c[0])}>{c[1]}</div>)}
      </div>
      <div className="card"><div className="tbl-wrap"><table className="tbl">
        <thead><tr><th>Ticket</th><th>Category</th><th>Subject</th><th>Raised</th><th>Team</th><th>Status</th><th></th></tr></thead>
        <tbody>{rows.map((t) => (
          <tr key={t.id} className="clickable" onClick={() => setOpen(t.id)}>
            <td className="mono strong" style={{ fontSize: 12 }}>{t.id}</td>
            <td style={{ color: 'var(--g500)' }}>{t.category}</td>
            <td className="strong">{t.subject}</td>
            <td style={{ color: 'var(--g500)' }}>{t.raised}</td>
            <td style={{ color: 'var(--g500)' }}>{t.team || '—'}</td>
            <td><Badge cls={(STATUS[t.status] || ['', 'b-gray'])[1]} dot>{(STATUS[t.status] || [t.status])[0]}</Badge></td>
            <td onClick={(e) => e.stopPropagation()}><button className="btn btn-light btn-sm" onClick={() => setOpen(t.id)}><Icon name="eye" size={13} />View</button></td>
          </tr>
        ))}</tbody>
      </table>{rows.length === 0 && <Empty title="No tickets found">Raise a new query from Support.</Empty>}</div></div>

      {cur && (
        <Drawer title={<span className="mono">{cur.id}</span>} sub={cur.category} onClose={() => setOpen(null)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Badge cls={(STATUS[cur.status] || ['', 'b-gray'])[1]} dot>{(STATUS[cur.status] || [cur.status])[0]}</Badge>
            <span style={{ marginLeft: 'auto', fontSize: 11.5, color: 'var(--g400)' }}>Raised {cur.raised}</span>
          </div>
          <Panel title="Query" icon="bell">
            <KV k="Subject">{cur.subject}</KV>
            <KV k="Category">{cur.category}</KV>
            {cur.team && <KV k="Assigned Team">{cur.team}</KV>}
            <p style={{ fontSize: 13, color: 'var(--g700)', lineHeight: 1.6, marginTop: 10 }}>{cur.detail}</p>
          </Panel>
          {cur.resolution && <Panel title="Resolution" icon="check"><p style={{ fontSize: 13, color: 'var(--g700)', lineHeight: 1.6, margin: 0 }}>{cur.resolution}</p></Panel>}
          {isOpen(cur)
            ? <div className="alert alert-info"><Icon name="clock" size={18} /><div>This ticket is being worked on. We resolve most queries within 48 hours.</div></div>
            : <div className="alert alert-green"><Icon name="check" size={18} /><div>This ticket is closed. Raise a new query if the issue persists.</div></div>}
          <div className="alert alert-info" style={{ marginBottom: 0 }}><Icon name="shield" size={18} /><div>Unresolved grievance? Escalate to the <b>PNGRB IGMS</b> portal as per regulation.</div></div>
        </Drawer>
      )}
    </div>
  )
}
