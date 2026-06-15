import { useState } from 'react'
import { Routes, Route, Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom'
import { Icon } from '../../lib/icons.jsx'
import { Badge, StatusChip, Panel, Drawer, Empty, KV, Confirm } from '../../components/ui.jsx'
import { useToast } from '../../components/Toast.jsx'
import { useApps, Store } from '../../lib/store.js'
import { BillingStore } from '../../lib/billingStore.js'
import { api, session } from '../../lib/api.js'
import StaffLogin from './StaffLogin.jsx'
import { STATUS } from '../../lib/status.js'
import { avatarColor, initials } from '../../lib/format.js'
import { STAFF_USER, ROLES } from './staffData.js'
import { MeterOperations, MeterReading, WorkOrders, ReadingSchedule } from './StaffOps.jsx'
import { CustomerMaster, CustomerApplications, UsersAccess, InviteUser, Billing, BillingCycle, CashPayment, Complaints, Settings } from './StaffAdmin.jsx'
import { BillGeneration, Collections } from './StaffBilling.jsx'
import { SetPassword, ChangePassword, ChangeMobile, EmployeeProfile } from './StaffAccount.jsx'
import Reports from './Reports.jsx'

const FUNNEL = [
  ['received', 'Received', (a) => ['SUBMITTED', 'PAYMENT_PENDING'].includes(a.status)],
  ['review', 'Under Review', (a) => ['REVIEW', 'PAID'].includes(a.status)],
  ['verified', 'Verified', (a) => a.status === 'VERIFIED'],
  ['approved', 'Approved', (a) => a.status === 'APPROVED'],
  ['scheduled', 'Scheduled', (a) => a.status === 'SCHEDULED'],
  ['completed', 'Completed', (a) => a.status === 'COMPLETED'],
]
const EDITABLE = ['REVIEW', 'PAID', 'VERIFIED']

function Review({ app, onClose }) {
  const toast = useToast()
  const [docs, setDocs] = useState(app.docs.map((d) => [...d]))
  const [remarks, setRemarks] = useState(app.remarks || '')
  const editable = EDITABLE.includes(app.status)
  const setDoc = (i, v) => setDocs((ds) => ds.map((d, j) => (j === i ? [d[0], d[1], v] : d)))
  const allApproved = docs.every((d) => d[2] === 'APPROVED')
  const anyRejected = docs.some((d) => d[2] === 'REJECTED')
  const decide = (decision) => {
    Store.decide(app.png, decision, remarks || (decision === 'APPROVED' ? 'Application reviewed and approved by CGD officer.' : 'Documents not in order.'), docs)
    toast(decision === 'APPROVED'
      ? { tone: 'green', title: 'POST /v1/png-application/update', msg: app.png + ' → APPROVED · pushed to MyPNG' }
      : { tone: 'red', title: 'POST /v1/png-application/update', msg: app.png + ' → NOT_APPROVED · pushed to MyPNG' })
    onClose()
  }
  const advance = (to) => { Store.advance(app.png, to); toast({ tone: 'green', title: 'Status updated', msg: app.png + ' → ' + STATUS[to].label }); onClose() }

  return (
    <Drawer title={<span className="mono">{app.png}</span>} sub={'MyPNG ref ' + app.mypng} onClose={onClose}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <StatusChip code={app.status} />{app.slaWarn && <Badge cls="b-red" dot>SLA {app.sla}</Badge>}
        <span style={{ marginLeft: 'auto', fontSize: 11.5, color: 'var(--g400)' }}>Received {app.submitted}</span>
      </div>
      <Panel title="Applicant Information" icon="users" action={<Badge cls="b-blue">from MyPNG</Badge>}>
        <KV k="Name">{app.name}</KV>
        <KV k="Mobile"><span className="mono">{app.mobile}</span></KV>
        <KV k="Email">{app.email}</KV>
        <KV k="Connection Type">{app.connType}</KV>
        <KV k="GA">{app.ga}</KV>
        <KV k="Premise / Occupancy">{app.premise} · {app.occupancy}</KV>
        <KV k="eKYC"><span style={{ color: app.ekyc === 'AUTO_APPROVED' ? 'var(--green)' : 'var(--amber)' }}>{app.ekyc}{app.ekyc === 'AUTO_APPROVED' ? ' ✓' : ''}</span></KV>
        <KV k="Payment"><Badge cls={app.paid ? 'b-green' : 'b-amber'} dot>{app.paid ? 'Paid ' + (app.scheme || '') : 'Pending'}</Badge></KV>
      </Panel>
      <Panel title="Document Verification" icon="shield" sub="set verificationStatus">
        {docs.map((d, i) => (
          <div className="docrow" key={i}>
            <div className={'kpi-ic ' + (d[2] === 'APPROVED' ? 'ic-green' : d[2] === 'REJECTED' ? 'ic-red' : 'ic-amber')} style={{ width: 34, height: 34 }}><Icon name={d[2] === 'APPROVED' ? 'check' : d[2] === 'REJECTED' ? 'x' : 'clock'} size={15} /></div>
            <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13, fontWeight: 700 }}>{d[0]}</div><div style={{ fontSize: 11.5, color: 'var(--g400)' }}>{d[1]}</div></div>
            {editable
              ? <div className="seg"><button className={d[2] === 'APPROVED' ? 'ok' : ''} onClick={() => setDoc(i, 'APPROVED')}>Approve</button><button className={d[2] === 'REJECTED' ? 'no' : ''} onClick={() => setDoc(i, 'REJECTED')}>Reject</button></div>
              : <Badge cls={d[2] === 'APPROVED' ? 'b-green' : d[2] === 'REJECTED' ? 'b-red' : 'b-amber'} dot>{d[2]}</Badge>}
          </div>
        ))}
      </Panel>
      <Panel><label className="flabel">Officer Remarks</label>
        <textarea className="finput" placeholder="Add review remarks (sent to MyPNG with the decision)…" value={remarks} onChange={(e) => setRemarks(e.target.value)} disabled={!editable} /></Panel>
      {editable ? (
        <>
          {anyRejected && <div className="alert alert-warn"><Icon name="bell" size={18} /><div>One or more documents are rejected — the application will be sent back as <b>NOT_APPROVED</b>.</div></div>}
          <div className="alert alert-info"><Icon name="link" size={18} /><div>Your decision calls <b className="mono">POST /v1/png-application/update</b> with the status, remarks and per-document <span className="mono">verificationStatus</span>.</div></div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-danger" style={{ flex: 1 }} onClick={() => decide('NOT_APPROVED')}><Icon name="x" size={15} />Reject</button>
            <button className="btn btn-green" style={{ flex: 1 }} disabled={!allApproved} onClick={() => decide('APPROVED')}><Icon name="check" size={15} />Approve &amp; Push to MyPNG</button>
          </div>
          {!allApproved && !anyRejected && <div style={{ fontSize: 11, color: 'var(--g400)', textAlign: 'center' }}>Approve all documents to enable approval.</div>}
          {!app.paid && <div className="alert alert-amber"><Icon name="info" size={18} /><div>Customer payment is still pending — they pay on the CGD portal before/after review.</div></div>}
        </>
      ) : app.status === 'APPROVED' ? (
        <><div className="alert alert-green"><Icon name="check" size={18} /><div>Approved. Schedule the connection with the field crew.</div></div>
          <button className="btn btn-primary btn-block" onClick={() => advance('SCHEDULED')}><Icon name="calendar" size={15} />Schedule Connection</button></>
      ) : app.status === 'SCHEDULED' ? (
        <button className="btn btn-green btn-block" onClick={() => advance('COMPLETED')}><Icon name="flame" size={15} />Mark Connection Completed</button>
      ) : (
        <div className="alert alert-green"><Icon name="check" size={18} /><div>This application is <b>{STATUS[app.status].label}</b>. No further action needed.</div></div>
      )}
    </Drawer>
  )
}

function Queue() {
  const toast = useToast()
  const apps = useApps()
  const [filter, setFilter] = useState('all')
  const [q, setQ] = useState('')
  const [fsel, setFsel] = useState(null)
  const [open, setOpen] = useState(null)
  const openApp = open && apps.find((a) => a.png === open)

  const rows = apps.filter((a) => {
    if (fsel) { const f = FUNNEL.find((x) => x[0] === fsel); if (f && !f[2](a)) return false }
    if (filter === 'needs' && !EDITABLE.includes(a.status)) return false
    if (filter === 'done' && !['APPROVED', 'COMPLETED', 'NOT_APPROVED', 'SCHEDULED'].includes(a.status)) return false
    if (q && !(a.name + a.png + a.mypng).toLowerCase().includes(q.toLowerCase())) return false
    return true
  })
  const pending = apps.filter((a) => EDITABLE.includes(a.status)).length

  return (
    <div className="page wide">
      <div className="phead">
        <div><h1>MyPNG Application Review</h1><p>Applications received from the MyPNG national portal. Review documents and push the decision back to MyPNG &amp; the customer.</p></div>
        <div style={{ display: 'flex', gap: 10 }}>
          <span className="badge b-green" style={{ padding: '7px 12px' }}><i className="dot" />MyPNG sync: 2 min ago</span>
          <button className="btn btn-soft" onClick={() => toast({ tone: 'blue', title: 'Sync triggered', msg: 'GET new applications from MyPNG' })}><Icon name="refresh" size={14} />Sync now</button>
        </div>
      </div>
      <div className="funnel">
        {FUNNEL.map((f) => {
          const n = apps.filter(f[2]).length
          return (
            <div key={f[0]} className={'fn' + (fsel === f[0] ? ' on' : '')} onClick={() => setFsel(fsel === f[0] ? null : f[0])}>
              <div className="v" style={{ color: f[0] === 'received' ? 'var(--blue-mid)' : f[0] === 'completed' ? 'var(--green)' : 'var(--g900)' }}>{n}</div>
              <div className="k">{f[1]}</div>
            </div>
          )
        })}
      </div>
      <div className="filterbar">
        <div className="fsearch"><Icon name="search" size={15} /><input placeholder="Search PNG ID, MyPNG ref, applicant…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        {[['all', 'All'], ['needs', 'Needs Action'], ['done', 'Decided']].map((c) => <div key={c[0]} className={'chip' + (filter === c[0] ? ' on' : '')} onClick={() => setFilter(c[0])}>{c[1]}</div>)}
        {fsel && <div className="chip on" onClick={() => setFsel(null)}>{FUNNEL.find((x) => x[0] === fsel)[1]} ✕</div>}
      </div>
      <div className="card"><div className="tbl-wrap"><table className="tbl">
        <thead><tr><th>PNG ID</th><th>MyPNG Ref</th><th>Applicant</th><th>Type</th><th>GA</th><th>Payment</th><th>Status</th><th>Action</th></tr></thead>
        <tbody>
          {rows.map((a) => (
            <tr key={a.png} className="clickable" onClick={() => setOpen(a.png)}>
              <td className="mono strong" style={{ fontSize: 12 }}>{a.png}</td>
              <td className="mono" style={{ fontSize: 11, color: 'var(--g500)' }}>{a.mypng}</td>
              <td><div className="cust"><div className="av" style={{ background: avatarColor(a.name) }}>{initials(a.name)}</div><div><div className="nm">{a.name}</div><div className="id">{a.mobile}</div></div></div></td>
              <td>{a.connType}</td>
              <td style={{ color: 'var(--g500)' }}>{a.ga}</td>
              <td><Badge cls={a.paid ? 'b-green' : 'b-amber'} dot>{a.paid ? 'Paid' : 'Pending'}</Badge></td>
              <td><StatusChip code={a.status} /></td>
              <td onClick={(e) => e.stopPropagation()}>
                <button className={'btn btn-sm ' + (EDITABLE.includes(a.status) ? 'btn-primary' : 'btn-light')} onClick={() => setOpen(a.png)}>
                  <Icon name="eye" size={13} />{EDITABLE.includes(a.status) ? 'Review' : 'View'}</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
        {rows.length === 0 && <Empty title="No applications match">Try a different filter, or wait for the next MyPNG sync.</Empty>}
      </div></div>
      {openApp && <Review app={openApp} onClose={() => setOpen(null)} />}
    </div>
  )
}

// Role-based access. `roles` lists who can see an item; omitted ⇒ everyone.
const OFFICE = ['Admin', 'CGD Officer', 'Billing Executive']           // back-office
const FIELD = ['Admin', 'CGD Officer', 'Meter Reader', 'Field Engineer'] // field staff
const NAV = [
  { sec: 'Overview', items: [
    { to: '/officer', label: 'Application Review', icon: 'inbox', end: true, badge: 'pending', roles: OFFICE },
    { to: '/officer/reports', label: 'Reports & Dashboard', icon: 'trend', roles: OFFICE },
  ] },
  { sec: 'Customer Management', items: [
    { to: '/officer/applications', label: 'Customer Applications', icon: 'file', roles: OFFICE },
    { to: '/officer/customers', label: 'Customer Master', icon: 'users', roles: OFFICE },
    { to: '/officer/billing-cycle', label: 'Billing Cycle Assignment', icon: 'calendar', roles: OFFICE },
  ] },
  { sec: 'Field Operations', items: [
    { to: '/officer/reading-schedule', label: "Today's Schedule", icon: 'pin', roles: FIELD },
    { to: '/officer/meters', label: 'Meter Operations', icon: 'gauge', roles: FIELD },
    { to: '/officer/meter-reading', label: 'Submit Meter Reading', icon: 'bar', roles: ['Admin', 'CGD Officer', 'Meter Reader'] },
    { to: '/officer/work-orders', label: 'Survey & Work Orders', icon: 'wrench', roles: ['Admin', 'CGD Officer', 'Field Engineer'] },
  ] },
  { sec: 'Billing & Collections', items: [
    { to: '/officer/bill-generation', label: 'Bill Generation', icon: 'receipt', roles: OFFICE },
    { to: '/officer/billing', label: 'Billing Config', icon: 'settings', roles: OFFICE },
    { to: '/officer/collections', label: 'Collections', icon: 'rupee', roles: OFFICE },
    { to: '/officer/cash-payment', label: 'Cash Payment', icon: 'wallet', roles: OFFICE },
  ] },
  { sec: 'Customer Care', items: [
    { to: '/officer/complaints', label: 'Complaints', icon: 'alert', roles: OFFICE },
  ] },
  { sec: 'Administration', items: [
    { to: '/officer/users', label: 'Users & Access', icon: 'shield', roles: ['Admin'] },
    { to: '/officer/settings', label: 'CGD Settings', icon: 'settings', roles: ['Admin'] },
  ] },
  { sec: 'Account', items: [{ to: '/officer/profile', label: 'Employee Profile', icon: 'users' }] },
]

const CRUMB = {
  '/officer': ['inbox', 'MyPNG Application Review', 'Intake · routing · review · decision'],
  '/officer/reports': ['trend', 'Reports & Dashboard', 'Live operations & revenue snapshot'],
  '/officer/applications': ['file', 'Customer Applications', 'MyPNG + manual office entry'],
  '/officer/customers': ['users', 'Customer Master', 'All registered PNG customers'],
  '/officer/billing-cycle': ['calendar', 'Billing Cycle Assignment', 'Assign connections to billing cycles'],
  '/officer/reading-schedule': ['pin', "Today's Reading Schedule", 'Meter reader field route'],
  '/officer/meters': ['gauge', 'Meter Operations', 'Meter inventory & field installation'],
  '/officer/meter-reading': ['bar', 'Submit Meter Reading', 'Manual reading entry'],
  '/officer/work-orders': ['wrench', 'Survey & Work Orders', 'Field jobs & crew scheduling'],
  '/officer/bill-generation': ['receipt', 'Bill Generation & Approval', 'Validate · generate · approve · release'],
  '/officer/billing': ['settings', 'Billing Config', 'Categories · deposits · tariff'],
  '/officer/collections': ['rupee', 'Payments & Collections', 'Outstanding bills & follow-up'],
  '/officer/cash-payment': ['wallet', 'Cash Payment', 'Offline bill collection at office'],
  '/officer/users': ['shield', 'Users & Access', 'Employee accounts & roles'],
  '/officer/settings': ['settings', 'CGD Settings', 'Organisation & preferences'],
  '/officer/profile': ['users', 'Employee Profile', 'Your account & security'],
  '/officer/complaints': ['alert', 'Complaints & Ticketing', 'Review · assign · resolve · close'],
  '/officer/set-password': ['key', 'Set Password', 'Activate employee account'],
}
function crumbFor(path) {
  if (CRUMB[path]) return CRUMB[path]
  const base = '/' + path.split('/').slice(1, 3).join('/')
  return CRUMB[base] || CRUMB['/officer']
}

function Layout() {
  const nav = useNavigate()
  const loc = useLocation()
  const apps = useApps()
  const pending = apps.filter((a) => EDITABLE.includes(a.status)).length
  const crumb = crumbFor(loc.pathname)
  const [logoutAsk, setLogoutAsk] = useState(false)
  const doLogout = () => { setLogoutAsk(false); session.clear(); nav('/') }
  const su = session.user() || STAFF_USER
  const [role, setRole] = useState(su.role || STAFF_USER.role)
  const su0 = initials(su.name)
  const isActive = (it) => (it.end ? loc.pathname === it.to : loc.pathname.startsWith(it.to))
  const can = (it) => !it.roles || it.roles.includes(role)
  const visibleNav = NAV.map((g) => ({ ...g, items: g.items.filter(can) })).filter((g) => g.items.length)
  const switchRole = (r) => {
    setRole(r)
    const allowed = NAV.flatMap((g) => g.items).filter((it) => !it.roles || it.roles.includes(r))
    if (!allowed.some((it) => isActive(it))) nav(allowed[0]?.to || '/officer')
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="sb-brand"><div className="sb-logo"><Icon name="leaf" size={21} style={{ color: '#fff' }} /></div>
          <div><div className="sb-name">my<b>CGD</b></div><div className="sb-tag">Gasonet · Staff Console</div></div></div>
        <div className="sb-scroll">
          {visibleNav.map((g) => (
            <div key={g.sec}>
              <div className="sb-sec">{g.sec}</div>
              {g.items.map((it) => (
                <button key={it.to} className={'sb-item' + (isActive(it) ? ' active' : '')} onClick={() => nav(it.to)}>
                  <Icon name={it.icon} size={17} /><span className="lbl">{it.label}</span>
                  {it.badge === 'pending' && pending > 0 && <span className="pill alert">{pending}</span>}
                  {it.pill && <span className="pill">{it.pill}</span>}
                </button>
              ))}
            </div>
          ))}
          <div className="sb-sec">System</div>
          <button className="sb-item" onClick={async () => { await api.resetDemo(); await Store.load(); await BillingStore.load(); nav('/officer') }}><Icon name="refresh" size={17} /><span className="lbl">Reset demo data</span></button>
        </div>
        <div className="sb-foot"><div className="sb-user" onClick={() => setLogoutAsk(true)} title="Sign out">
          <div className="sb-ava">{su0}</div>
          <div style={{ flex: 1, minWidth: 0 }}><div className="nm">{su.name}</div><div className="rl">{role} · {su.ga}</div></div>
          <Icon name="logout" size={16} style={{ color: 'rgba(255,255,255,.4)' }} /></div></div>
      </aside>
      <div className="main-area">
        <div className="topbar">
          <div className="tb-crumb"><div className="ic"><Icon name={crumb[0]} size={18} /></div><div><h2>{crumb[1]}</h2><p>{crumb[2]}</p></div></div>
          <div className="tb-right">
            <div className="tb-search"><Icon name="search" size={15} /><input placeholder="Search anything…" aria-label="Search" /></div>
            <select className="finput" aria-label="View as role" title="Demo: view console as role" value={role} onChange={(e) => switchRole(e.target.value)}
              style={{ width: 'auto', padding: '6px 28px 6px 10px', fontSize: 12, fontWeight: 600 }}>
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <span className="tb-env uat">UAT</span>
            <button className="tb-icon-btn" aria-label="Notifications" onClick={() => nav('/officer')}><Icon name="bell" size={17} />{pending > 0 && <span className="tb-badge">{pending}</span>}</button>
            <button className="tb-icon-btn" aria-label="Settings" onClick={() => nav('/officer/settings')}><Icon name="settings" size={17} /></button>
            <div className="sb-ava" style={{ borderRadius: 9, cursor: 'pointer' }} onClick={() => nav('/officer/profile')}>{su0}</div>
            <button className="tb-icon-btn" aria-label="Logout" title="Logout" onClick={() => setLogoutAsk(true)}><Icon name="logout" size={17} /></button>
          </div>
        </div>
        <div className="canvas"><Outlet /></div>
      </div>
      {logoutAsk && (
        <Confirm title="Sign out of Staff Console?" icon="logout" tone="danger" confirmLabel="Sign out" confirmIcon="logout"
          onClose={() => setLogoutAsk(false)} onConfirm={doLogout}>
          You'll be signed out of the myCGD Staff Console and returned to the platform launchpad.
          Any unsaved changes in open forms will be lost.
        </Confirm>
      )}
    </div>
  )
}

const isStaffAuthed = () => !!session.token() && session.user()?.type === 'staff'

export default function OfficerApp() {
  const [authed, setAuthed] = useState(isStaffAuthed())
  if (!authed) return <StaffLogin onLogin={() => setAuthed(true)} />
  return (
    <Routes>
      <Route path="set-password" element={<SetPassword />} />
      <Route element={<Layout />}>
        <Route index element={<Queue />} />
        <Route path="reports" element={<Reports />} />
        <Route path="applications" element={<CustomerApplications />} />
        <Route path="customers" element={<CustomerMaster />} />
        <Route path="billing-cycle" element={<BillingCycle />} />
        <Route path="reading-schedule" element={<ReadingSchedule />} />
        <Route path="meters" element={<MeterOperations />} />
        <Route path="meter-reading" element={<MeterReading />} />
        <Route path="work-orders" element={<WorkOrders />} />
        <Route path="bill-generation" element={<BillGeneration />} />
        <Route path="billing" element={<Billing />} />
        <Route path="collections" element={<Collections />} />
        <Route path="cash-payment" element={<CashPayment />} />
        <Route path="users" element={<UsersAccess />} />
        <Route path="users/invite" element={<InviteUser />} />
        <Route path="settings" element={<Settings />} />
        <Route path="profile" element={<EmployeeProfile />} />
        <Route path="profile/password" element={<ChangePassword />} />
        <Route path="profile/mobile" element={<ChangeMobile />} />
        <Route path="complaints" element={<Complaints />} />
        <Route path="*" element={<Navigate to="/officer" replace />} />
      </Route>
    </Routes>
  )
}
