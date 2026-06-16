import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../../lib/icons.jsx'
import { Panel, Badge, StatusChip, Menu, Modal, Confirm, Drawer, KV, Empty, Crumbs } from '../../components/ui.jsx'
import { useToast } from '../../components/Toast.jsx'
import { useApps, Store } from '../../lib/store.js'
import { api } from '../../lib/api.js'
import { inr, avatarColor, initials, isEmail } from '../../lib/format.js'
import { CATEGORIES, CUSTOMERS, ROLES, BILL_CYCLES, COMPLAINT_TEAMS } from './staffData.js'

const Req = () => <span className="req">*</span>

/* ════════ Customer Master (Admin) — no timeline / SLA band labels ════════ */
export function CustomerMaster() {
  const [q, setQ] = useState('')
  const [all, setAll] = useState([])
  useEffect(() => { api.customers().then(setAll).catch(() => {}) }, [])
  const rows = all.filter((c) => (c.name + c.pngId + c.mobile).toLowerCase().includes(q.toLowerCase()))
  return (
    <div className="page wide">
      <div className="phead"><div><h1>Customer Master</h1><p>Master record of all registered PNG customers.</p></div></div>
      <div className="filterbar"><div className="fsearch"><Icon name="search" size={15} /><input placeholder="Search name, PNG ID or mobile…" value={q} onChange={(e) => setQ(e.target.value)} /></div></div>
      <div className="card"><div className="tbl-wrap"><table className="tbl">
        <thead><tr><th>PNG ID</th><th>Customer Name</th><th>Mobile</th><th>Category</th><th>GA</th><th>Area</th><th>Status</th></tr></thead>
        <tbody>{rows.map((c) => (
          <tr key={c.pngId}>
            <td className="mono strong" style={{ fontSize: 12 }}>{c.pngId}</td>
            <td><div className="cust"><div className="av" style={{ background: avatarColor(c.name) }}>{initials(c.name)}</div><div className="nm">{c.name}</div></div></td>
            <td className="mono" style={{ fontSize: 12 }}>{c.mobile}</td>
            <td>{c.category}</td><td style={{ color: 'var(--g500)' }}>{c.ga}</td><td style={{ color: 'var(--g500)' }}>{c.area}</td>
            <td><Badge cls={c.status === 'Active' ? 'b-green' : 'b-red'} dot>{c.status}</Badge></td>
          </tr>
        ))}</tbody>
      </table>{rows.length === 0 && <Empty title="No customers found" />}</div></div>
    </div>
  )
}

/* ════════ M1 · Billing Cycle Assignment ════════ */
export function BillingCycle() {
  const toast = useToast()
  const [rows, setRows] = useState([])
  const [assign, setAssign] = useState(null)   // customer being assigned
  const [q, setQ] = useState('')
  const load = () => api.customers().then(setRows).catch(() => {})
  useEffect(() => { load() }, [])

  const filtered = rows.filter((c) => (c.name + c.pngId).toLowerCase().includes(q.toLowerCase()))
  const unassigned = rows.filter((c) => !c.cycle).length

  const save = async (pngId, cycle) => {
    await api.setCycle(pngId, cycle)
    await load()
    toast({ tone: 'green', title: 'Billing cycle assigned', msg: pngId + ' → ' + cycle })
    setAssign(null)
  }

  return (
    <div className="page wide">
      <div className="phead"><div><h1>Billing Cycle Assignment</h1><p>Assign each verified connection to a billing cycle. Connections become <b>Active</b> once a cycle is set.</p></div></div>
      {unassigned > 0 && <div className="alert alert-amber"><Icon name="alert" size={18} /><div><b>{unassigned}</b> connection{unassigned > 1 ? 's are' : ' is'} awaiting a billing cycle — they won't be picked up by the reading schedule until assigned.</div></div>}
      <div className="filterbar"><div className="fsearch"><Icon name="search" size={15} /><input placeholder="Search name or PNG ID…" value={q} onChange={(e) => setQ(e.target.value)} /></div></div>
      <div className="card"><div className="tbl-wrap"><table className="tbl">
        <thead><tr><th>PNG ID</th><th>Customer</th><th>Category</th><th>GA</th><th>Billing Cycle</th><th>Status</th><th style={{ textAlign: 'right' }}>Action</th></tr></thead>
        <tbody>{filtered.map((c) => (
          <tr key={c.pngId}>
            <td className="mono strong" style={{ fontSize: 12 }}>{c.pngId}</td>
            <td><div className="cust"><div className="av" style={{ background: avatarColor(c.name) }}>{initials(c.name)}</div><div className="nm">{c.name}</div></div></td>
            <td>{c.category}</td><td style={{ color: 'var(--g500)' }}>{c.ga}</td>
            <td>{c.cycle ? <Badge cls="b-blue">{c.cycle}</Badge> : <Badge cls="b-amber" dot>Unassigned</Badge>}</td>
            <td><Badge cls={c.status === 'Active' ? 'b-green' : 'b-red'} dot>{c.status}</Badge></td>
            <td style={{ textAlign: 'right' }}><button className={'btn btn-sm ' + (c.cycle ? 'btn-light' : 'btn-primary')} onClick={() => setAssign(c)}><Icon name="calendar" size={13} />{c.cycle ? 'Change' : 'Assign'}</button></td>
          </tr>
        ))}</tbody>
      </table>{filtered.length === 0 && <Empty title="No connections found" />}</div></div>
      {assign && <AssignCycleModal cust={assign} onClose={() => setAssign(null)} onSave={save} />}
    </div>
  )
}

function AssignCycleModal({ cust, onClose, onSave }) {
  const [cycle, setCycle] = useState(cust.cycle || BILL_CYCLES[0].code)
  return (
    <Modal title="Assign Billing Cycle" icon="calendar" onClose={onClose}
      footer={<><button className="btn btn-light" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={() => onSave(cust.pngId, cycle)}><Icon name="check" size={15} />Save &amp; Activate</button></>}>
      <div className="card" style={{ background: 'var(--g50)', marginBottom: 16 }}><div className="card-b" style={{ padding: 14 }}>
        <KV k="Customer">{cust.name}</KV><KV k="PNG ID"><span className="mono">{cust.pngId}</span></KV><KV k="Category">{cust.category}</KV>
      </div></div>
      <label className="flabel" style={{ marginBottom: 8, display: 'block' }}>Billing Cycle <Req /></label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {BILL_CYCLES.map((bc) => (
          <label key={bc.code} className="pm" style={{ borderColor: cycle === bc.code ? 'var(--blue-mid)' : 'var(--g200)' }} onClick={() => setCycle(bc.code)}>
            <input type="radio" name="cycle" checked={cycle === bc.code} onChange={() => setCycle(bc.code)} />
            <div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: 13 }}>{bc.code}</div><div style={{ fontSize: 11.5, color: 'var(--g500)' }}>Reading window {bc.window} · reads on {bc.readDay}</div></div>
          </label>
        ))}
      </div>
    </Modal>
  )
}

/* ════════ Customer Applications (Admin) — with Manual Entry ════════ */
export function CustomerApplications() {
  const toast = useToast()
  const apps = useApps()
  const [manual, setManual] = useState(false)
  const [form, setForm] = useState({ name: '', mobile: '', email: '', connType: 'Domestic PNG' })
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const valid = form.name && form.mobile

  const save = async () => {
    const png = await Store.create({ name: form.name, mobile: form.mobile, email: form.email || 'na@gmail.com', connType: form.connType, source: 'Manual Entry' })
    toast({ tone: 'green', title: 'Application created', msg: png + ' · manual entry' })
    setManual(false); setForm({ name: '', mobile: '', email: '', connType: 'Domestic PNG' })
  }

  return (
    <div className="page wide">
      <div className="phead"><div><h1>Customer Applications</h1><p>All connection applications — from MyPNG and manual office entry.</p></div>
        <button className="btn btn-primary" onClick={() => setManual(true)}><Icon name="plus" size={15} />Manual Entry</button></div>
      <div className="card"><div className="tbl-wrap"><table className="tbl">
        <thead><tr><th>PNG ID</th><th>Customer</th><th>Type</th><th>Source</th><th>Payment</th><th>Status</th></tr></thead>
        <tbody>{apps.map((a) => (
          <tr key={a.png}>
            <td className="mono strong" style={{ fontSize: 12 }}>{a.png}</td>
            <td><div className="cust"><div className="av" style={{ background: avatarColor(a.name) }}>{initials(a.name)}</div><div><div className="nm">{a.name}</div><div className="id">{a.mobile}</div></div></div></td>
            <td>{a.connType}</td>
            <td><Badge cls={a.source === 'Manual Entry' ? 'b-purple' : 'b-blue'}>{a.source || 'MyPNG'}</Badge></td>
            <td><Badge cls={a.paid ? 'b-green' : 'b-amber'} dot>{a.paid ? 'Paid' : 'Pending'}</Badge></td>
            <td><StatusChip code={a.status} /></td>
          </tr>
        ))}</tbody>
      </table></div></div>

      {manual && (
        <Modal title="Manual Application Entry" icon="edit" onClose={() => setManual(false)}
          footer={<><button className="btn btn-light" onClick={() => setManual(false)}>Cancel</button>
            <button className="btn btn-primary" disabled={!valid} onClick={save}><Icon name="check" size={15} />Create Application</button></>}>
          <div className="alert alert-info" style={{ marginBottom: 16 }}><Icon name="info" size={18} /><div>Use for walk-in customers applying at the CGD office instead of MyPNG.</div></div>
          <div className="grid-2">
            <div className="fgroup"><label className="flabel">Customer Name <Req /></label><input className="finput" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Full name" /></div>
            <div className="fgroup"><label className="flabel">Mobile Number <Req /></label><input className="finput" value={form.mobile} onChange={(e) => set('mobile', e.target.value)} placeholder="+91 …" /></div>
            <div className="fgroup"><label className="flabel">Email</label><input className="finput" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="email@example.com" /></div>
            <div className="fgroup"><label className="flabel">Connection Type <Req /></label>
              <select className="finput" value={form.connType} onChange={(e) => set('connType', e.target.value)}><option>Domestic PNG</option><option>Commercial PNG</option><option>Industrial PNG</option></select></div>
          </div>
        </Modal>
      )}
    </div>
  )
}

/* ════════ Users & Access (Admin) — Invite + ⋮ menu ════════ */
export function UsersAccess() {
  const nav = useNavigate()
  const toast = useToast()
  const [users, setUsers] = useState([])
  const [edit, setEdit] = useState(null)   // { user, mode: 'details' | 'role' }
  const [suspendAsk, setSuspendAsk] = useState(null)   // user pending suspend/reactivate confirmation
  const load = () => api.staff().then(setUsers).catch(() => {})
  useEffect(() => { load() }, [])

  const suspend = async (u) => {
    await api.suspendStaff(u.empId)
    await load()
    toast({ tone: 'amber', title: u.status === 'Suspended' ? 'Account reactivated' : 'Account suspended', msg: u.name })
    setSuspendAsk(null)
  }
  const saveEdit = async (changes) => { await api.updateStaff(edit.user.empId, changes); await load(); toast({ tone: 'green', title: 'User updated', msg: edit.user.name }); setEdit(null) }

  return (
    <div className="page wide">
      <div className="phead"><div><h1>Users &amp; Access</h1><p>Manage CGD employee accounts, roles and access.</p></div>
        <button className="btn btn-primary" onClick={() => nav('/officer/users/invite')}><Icon name="plus" size={15} />Invite User</button></div>
      <div className="card"><div className="tbl-wrap"><table className="tbl">
        <thead><tr><th>Employee ID</th><th>Name</th><th>Email</th><th>Role</th><th>GA</th><th>Status</th><th style={{ textAlign: 'right' }}>Actions</th></tr></thead>
        <tbody>{users.map((u) => (
          <tr key={u.empId}>
            <td className="mono" style={{ fontSize: 12 }}>{u.empId}</td>
            <td><div className="cust"><div className="av" style={{ background: avatarColor(u.name) }}>{initials(u.name)}</div><div className="nm">{u.name}</div></div></td>
            <td style={{ color: 'var(--g500)' }}>{u.email}</td>
            <td><Badge cls="b-blue">{u.role}</Badge></td>
            <td style={{ color: 'var(--g500)' }}>{u.ga}</td>
            <td><Badge cls={u.status === 'Active' ? 'b-green' : u.status === 'Invited' ? 'b-amber' : 'b-red'} dot>{u.status}</Badge></td>
            <td style={{ textAlign: 'right' }}>
              <Menu label={'Actions for ' + u.name} items={[
                { label: 'Edit User Details', icon: 'edit', onClick: () => setEdit({ user: u, mode: 'details' }) },
                { label: 'Edit Role', icon: 'shield', onClick: () => setEdit({ user: u, mode: 'role' }) },
                { sep: true },
                { label: u.status === 'Suspended' ? 'Reactivate Account' : 'Suspend Account', icon: 'lock', danger: u.status !== 'Suspended', onClick: () => setSuspendAsk(u) },
              ]} />
            </td>
          </tr>
        ))}</tbody>
      </table></div></div>
      {edit && <EditUserModal edit={edit} onClose={() => setEdit(null)} onSave={saveEdit} />}
      {suspendAsk && (
        suspendAsk.status === 'Suspended' ? (
          <Confirm title="Reactivate account?" icon="lock" tone="green" confirmLabel="Reactivate" confirmIcon="check"
            onClose={() => setSuspendAsk(null)} onConfirm={() => suspend(suspendAsk)}>
            <b>{suspendAsk.name}</b> ({suspendAsk.empId}) will regain access to the Staff Console with their <b>{suspendAsk.role}</b> role restored.
          </Confirm>
        ) : (
          <Confirm title="Suspend account?" icon="lock" tone="danger" confirmLabel="Suspend Account" confirmIcon="lock"
            onClose={() => setSuspendAsk(null)} onConfirm={() => suspend(suspendAsk)}>
            <b>{suspendAsk.name}</b> ({suspendAsk.empId}) will immediately lose access to the myCGD Staff Console.
            Active sessions are ended and sign-in is blocked until the account is reactivated.
            <div className="alert alert-warn" style={{ marginTop: 16 }}><Icon name="alert" size={18} /><div>This does not delete the account or its activity history — it can be reactivated later.</div></div>
          </Confirm>
        )
      )}
    </div>
  )
}

function EditUserModal({ edit, onClose, onSave }) {
  const { user, mode } = edit
  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)
  const [role, setRole] = useState(user.role)
  const emailError = email && !isEmail(email)
  const canSave = mode === 'role' || (name.trim() && isEmail(email))
  return (
    <Modal title={mode === 'role' ? 'Edit Role' : 'Edit User Details'} icon={mode === 'role' ? 'shield' : 'edit'} onClose={onClose}
      footer={<><button className="btn btn-light" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" disabled={!canSave} onClick={() => onSave(mode === 'role' ? { role } : { name, email })}><Icon name="check" size={15} />Save Changes</button></>}>
      {mode === 'role' ? (
        <div className="fgroup"><label className="flabel">Role <Req /></label>
          <select className="finput" value={role} onChange={(e) => setRole(e.target.value)}>{ROLES.map((r) => <option key={r}>{r}</option>)}</select></div>
      ) : (
        <>
          <div className="fgroup"><label className="flabel">Full Name <Req /></label><input className="finput" value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div className="fgroup"><label className="flabel">Email <Req /></label>
            <input className={'finput' + (emailError ? ' input-err' : '')} type="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={emailError ? 'true' : undefined} />
            {emailError && <span className="field-err"><Icon name="alert" size={13} />Enter a valid email address.</span>}</div>
        </>
      )}
    </Modal>
  )
}

export function InviteUser() {
  const nav = useNavigate()
  const toast = useToast()
  const [form, setForm] = useState({ name: '', email: '', role: ROLES[1], ga: 'Bikaner GA' })
  const [touched, setTouched] = useState(false)
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const emailOk = isEmail(form.email)
  const emailError = touched && form.email && !emailOk
  const valid = form.name && emailOk
  const invite = async () => { await api.inviteStaff(form); toast({ tone: 'green', title: 'Invitation sent', msg: form.email + ' · ' + form.role }); nav('/officer/users') }
  return (
    <div className="page" style={{ maxWidth: 640 }}>
      <Crumbs items={[{ label: 'Users & Access', onClick: () => nav('/officer/users') }, { label: 'Invite User' }]} />
      <div className="phead"><div><h1>Invite User</h1><p>Send an invitation for a new CGD employee to set up their account.</p></div></div>
      <Panel title="New Employee Invitation" icon="users">
        <div className="grid-2">
          <div className="fgroup"><label className="flabel">Full Name <Req /></label><input className="finput" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Employee name" /></div>
          <div className="fgroup"><label className="flabel">Work Email <Req /></label>
            <input className={'finput' + (emailError ? ' input-err' : '')} type="email" value={form.email} onChange={(e) => set('email', e.target.value)} onBlur={() => setTouched(true)} placeholder="name@gasonet.in" aria-invalid={emailError ? 'true' : undefined} />
            {emailError && <span className="field-err"><Icon name="alert" size={13} />Enter a valid email address (e.g. name@gasonet.in).</span>}</div>
          <div className="fgroup"><label className="flabel">Role <Req /></label>
            <select className="finput" value={form.role} onChange={(e) => set('role', e.target.value)}>{ROLES.map((r) => <option key={r}>{r}</option>)}</select></div>
          <div className="fgroup"><label className="flabel">Geographical Area <Req /></label>
            <select className="finput" value={form.ga} onChange={(e) => set('ga', e.target.value)}><option>Bikaner GA</option><option>Churu GA</option></select></div>
        </div>
        <div className="alert alert-info" style={{ margin: '4px 0 16px' }}><Icon name="info" size={18} /><div>The employee will receive an email link to <b>set their password</b> and activate their account.</div></div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="btn btn-light" onClick={() => nav('/officer/users')}>Cancel</button>
          <button className="btn btn-primary" disabled={!valid} onClick={invite}><Icon name="send" size={15} />Send Invitation</button>
        </div>
      </Panel>
    </div>
  )
}

/* ════════ Billing Config — editable category / deposit / tariff list ════════ */
export function Billing() {
  const nav = useNavigate()
  const toast = useToast()
  const [cats, setCats] = useState(() => CATEGORIES.map((c) => ({ ...c })))
  const [edit, setEdit] = useState(null)   // category being edited (null = none)

  const save = (changes) => {
    setCats((cs) => cs.map((c) => (c.code === edit.code ? { ...c, ...changes } : c)))
    toast({ tone: 'green', title: 'Category updated', msg: edit.code + ' · ' + edit.name })
    setEdit(null)
  }

  return (
    <div className="page wide">
      <div className="phead"><div><h1>Billing Config</h1><p>Customer master, new connections, categories and security deposit configuration.</p></div></div>
      <div className="grid-2" style={{ marginBottom: 18 }}>
        <Panel title="New Connection" icon="plus" sub="Register a new connection at the office"
          action={<button className="btn btn-soft btn-sm" onClick={() => nav('/officer/applications')}>Open</button>}>
          <p style={{ fontSize: 12.5, color: 'var(--g500)' }}>Create a new connection application via manual entry for walk-in customers.</p>
        </Panel>
        <Panel title="Customer Master" icon="users" sub="All registered customers"
          action={<button className="btn btn-soft btn-sm" onClick={() => nav('/officer/customers')}>Open</button>}>
          <p style={{ fontSize: 12.5, color: 'var(--g500)' }}>View and search the master record of all PNG customers.</p>
        </Panel>
      </div>
      <Panel title="Customer Category & Security Deposit" icon="receipt" sub="Configure deposit & tariff per category" bodyStyle={{ padding: 0 }}>
        <div className="tbl-wrap"><table className="tbl">
          <thead><tr><th>Code</th><th>Category</th><th>Security Deposit</th><th>Tariff</th><th>Customers</th><th style={{ textAlign: 'right' }}>Action</th></tr></thead>
          <tbody>{cats.map((c) => (
            <tr key={c.code}>
              <td className="mono strong">{c.code}</td><td>{c.name}</td>
              <td className="mono strong">{inr(c.sd)}</td><td className="mono">{c.tariff}</td>
              <td className="mono">{c.count.toLocaleString('en-IN')}</td>
              <td style={{ textAlign: 'right' }}><button className="btn btn-light btn-sm" onClick={() => setEdit(c)}><Icon name="edit" size={13} />Edit</button></td>
            </tr>
          ))}</tbody>
        </table></div>
      </Panel>
      {edit && <EditCategoryModal cat={edit} onClose={() => setEdit(null)} onSave={save} />}
    </div>
  )
}

function EditCategoryModal({ cat, onClose, onSave }) {
  const [name, setName] = useState(cat.name)
  const [sd, setSd] = useState(String(cat.sd))
  const [tariff, setTariff] = useState(cat.tariff)
  const valid = name.trim() && Number(sd) >= 0 && tariff.trim()
  return (
    <Modal title="Edit Billing Category" icon="receipt" onClose={onClose}
      footer={<><button className="btn btn-light" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" disabled={!valid} onClick={() => onSave({ name, sd: Number(sd), tariff })}><Icon name="check" size={15} />Save Changes</button></>}>
      <div className="card" style={{ background: 'var(--g50)', marginBottom: 16 }}><div className="card-b" style={{ padding: 14 }}>
        <KV k="Category Code"><span className="mono strong">{cat.code}</span></KV>
        <KV k="Active Customers"><span className="mono">{cat.count.toLocaleString('en-IN')}</span></KV>
      </div></div>
      <div className="grid-2">
        <div className="fgroup"><label className="flabel">Category Name <Req /></label><input className="finput" value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div className="fgroup"><label className="flabel">Security Deposit (₹) <Req /></label><input className="finput mono" inputMode="numeric" value={sd} onChange={(e) => setSd(e.target.value.replace(/\D/g, ''))} /></div>
      </div>
      <div className="fgroup"><label className="flabel">Tariff <Req /></label><input className="finput mono" value={tariff} onChange={(e) => setTariff(e.target.value)} placeholder="e.g. ₹54 / m³" /></div>
    </Modal>
  )
}

/* ════════ Offline Bill Payment — Cash Payment ════════ */
export function CashPayment() {
  const toast = useToast()
  const [pngId, setPngId] = useState('')
  const [amount, setAmount] = useState('')
  const found = CUSTOMERS.find((c) => c.pngId.toLowerCase() === pngId.trim().toLowerCase())
  const outstanding = found ? 4794 : 0
  const valid = found && Number(amount) > 0

  const collect = () => {
    const rcpt = 'CASH-2026-' + String(Math.floor(1000 + Math.random() * 8999))
    toast({ tone: 'green', title: 'Cash payment recorded', msg: rcpt + ' · ' + inr(Number(amount)) })
    setPngId(''); setAmount('')
  }

  return (
    <div className="page" style={{ maxWidth: 640 }}>
      <div className="phead"><div><h1>Cash Payment</h1><p>Record a bill payment made in cash by a customer visiting the CGD office.</p></div></div>
      <Panel title="Collect Cash Payment" icon="rupee">
        <div className="fgroup"><label className="flabel">Customer PNG ID <Req /></label>
          <input className="finput mono" placeholder="PNG-2026-xxxxxx" value={pngId} onChange={(e) => setPngId(e.target.value)} /></div>
        {pngId && !found && <div className="alert alert-warn" style={{ marginBottom: 14 }}><Icon name="alert" size={18} /><div>No customer found for this PNG ID. Try <span className="mono">PNG-2026-000412</span>.</div></div>}
        {found && (
          <>
            <div className="card" style={{ background: 'var(--g50)', marginBottom: 16 }}><div className="card-b" style={{ padding: 14 }}>
              <KV k="Customer">{found.name}</KV><KV k="Category">{found.category}</KV>
              <KV k="Outstanding"><span className="mono strong" style={{ color: 'var(--amber)' }}>{inr(outstanding)}</span></KV>
            </div></div>
            <div className="grid-2">
              <div className="fgroup"><label className="flabel">Amount Received (₹) <Req /></label><input className="finput mono" inputMode="numeric" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))} /></div>
              <div className="fgroup"><label className="flabel">Payment Date <Req /></label><input className="finput" type="date" defaultValue="2026-06-14" /></div>
            </div>
            <button className="btn btn-green btn-block btn-lg" disabled={!valid} onClick={collect}><Icon name="rupee" size={16} />Record Cash Payment &amp; Print Receipt</button>
          </>
        )}
      </Panel>
    </div>
  )
}

/* ════════ M6 · Complaints & Ticketing ════════ */
const CSTATUS = {
  OPEN: ['Open', 'b-amber'], IN_REVIEW: ['In Review', 'b-blue'], ASSIGNED: ['Assigned', 'b-purple'],
  RESOLVED: ['Resolved', 'b-teal'], CONFIRMED: ['Customer Confirmed', 'b-blue'], CLOSED: ['Closed', 'b-green'],
}
const CFlow = [['OPEN', 'Open'], ['IN_REVIEW', 'Review'], ['ASSIGNED', 'Assign'], ['RESOLVED', 'Resolve'], ['CONFIRMED', 'Confirm'], ['CLOSED', 'Close']]
const CBadge = ({ s }) => <Badge cls={CSTATUS[s][1]} dot>{CSTATUS[s][0]}</Badge>

export function Complaints() {
  const toast = useToast()
  const [rows, setRows] = useState([])
  const [open, setOpen] = useState(null)
  const [filter, setFilter] = useState('all')
  const cur = open && rows.find((c) => c.id === open)
  const load = () => api.complaints().then(setRows).catch(() => {})
  useEffect(() => { load() }, [])

  const set = async (id, changes, t) => { await api.updateComplaint(id, changes); await load(); if (t) toast(t) }
  const KPI = [
    ['Open', rows.filter((c) => c.status === 'OPEN').length, 'b-amber'],
    ['In Progress', rows.filter((c) => ['IN_REVIEW', 'ASSIGNED'].includes(c.status)).length, 'b-blue'],
    ['Resolved', rows.filter((c) => ['RESOLVED', 'CONFIRMED'].includes(c.status)).length, 'b-teal'],
    ['Closed', rows.filter((c) => c.status === 'CLOSED').length, 'b-green'],
  ]
  const list = rows.filter((c) => {
    if (filter === 'open' && ['CLOSED'].includes(c.status)) return false
    if (filter === 'closed' && c.status !== 'CLOSED') return false
    return true
  })

  return (
    <div className="page wide">
      <div className="phead"><div><h1>Complaints &amp; Ticketing</h1><p>Customer complaints from the portal · review, assign, resolve and close.</p></div></div>
      <div className="funnel">{KPI.map((k) => (
        <div key={k[0]} className="fn" style={{ cursor: 'default' }}><div className="v">{k[1]}</div><div className="k">{k[0]}</div></div>
      ))}</div>
      <div className="filterbar">
        {[['all', 'All'], ['open', 'Active'], ['closed', 'Closed']].map((c) => <div key={c[0]} className={'chip' + (filter === c[0] ? ' on' : '')} onClick={() => setFilter(c[0])}>{c[1]}</div>)}
      </div>
      <div className="card"><div className="tbl-wrap"><table className="tbl">
        <thead><tr><th>Ticket</th><th>Customer</th><th>Category</th><th>Subject</th><th>Team</th><th>Raised</th><th>Status</th><th></th></tr></thead>
        <tbody>{list.map((c) => (
          <tr key={c.id} className="clickable" onClick={() => setOpen(c.id)}>
            <td className="mono strong" style={{ fontSize: 12 }}>{c.id}</td>
            <td><div className="cust"><div className="av" style={{ background: avatarColor(c.name) }}>{initials(c.name)}</div><div><div className="nm">{c.name}</div><div className="id">{c.pngId}</div></div></div></td>
            <td>{c.category}</td><td className="strong">{c.subject}</td>
            <td style={{ color: 'var(--g500)' }}>{c.team || '—'}</td><td style={{ color: 'var(--g500)' }}>{c.raised}</td>
            <td><CBadge s={c.status} /></td>
            <td onClick={(e) => e.stopPropagation()}><button className="btn btn-light btn-sm" onClick={() => setOpen(c.id)}><Icon name="eye" size={13} />Open</button></td>
          </tr>
        ))}</tbody>
      </table>{list.length === 0 && <Empty title="No complaints" />}</div></div>
      {cur && <ComplaintDrawer c={cur} onClose={() => setOpen(null)} set={set} />}
    </div>
  )
}

function ComplaintDrawer({ c, onClose, set }) {
  const [team, setTeam] = useState(c.team || COMPLAINT_TEAMS[0])
  const [resolution, setResolution] = useState(c.resolution || '')
  const stepIdx = CFlow.findIndex((s) => s[0] === c.status)

  return (
    <Drawer title={<span className="mono">{c.id}</span>} sub={c.name + ' · ' + c.pngId} onClose={onClose}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <CBadge s={c.status} /><Badge cls="b-gray">{c.category}</Badge>
        <span style={{ marginLeft: 'auto', fontSize: 11.5, color: 'var(--g400)' }}>Raised {c.raised}</span>
      </div>
      {/* progress strip */}
      <div className="card" style={{ marginTop: 14 }}><div className="card-b" style={{ padding: 12, display: 'flex', gap: 4, overflowX: 'auto' }}>
        {CFlow.map((s, i) => (
          <div key={s[0]} style={{ flex: 1, textAlign: 'center', minWidth: 56 }}>
            <div style={{ width: 26, height: 26, borderRadius: '50%', margin: '0 auto 5px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, background: i <= stepIdx ? 'var(--green-mid)' : 'var(--g100)', color: i <= stepIdx ? '#fff' : 'var(--g400)' }}>{i < stepIdx ? '✓' : i + 1}</div>
            <div style={{ fontSize: 10, color: i <= stepIdx ? 'var(--g700)' : 'var(--g400)', fontWeight: 600 }}>{s[1]}</div>
          </div>
        ))}
      </div></div>
      <Panel title="Complaint" icon="alert"><KV k="Subject">{c.subject}</KV><KV k="Mobile"><span className="mono">{c.mobile}</span></KV>
        <p style={{ fontSize: 13, color: 'var(--g700)', lineHeight: 1.6, marginTop: 10 }}>{c.detail}</p></Panel>

      {(c.status === 'ASSIGNED' || c.status === 'IN_REVIEW') && (
        <Panel title="Assign Concern Team" icon="users">
          <div className="fgroup"><label className="flabel">Team <Req /></label>
            <select className="finput" value={team} onChange={(e) => setTeam(e.target.value)}>{COMPLAINT_TEAMS.map((t) => <option key={t}>{t}</option>)}</select></div>
        </Panel>
      )}
      {['ASSIGNED', 'RESOLVED', 'CONFIRMED', 'CLOSED'].includes(c.status) && (
        <Panel title="Resolution" icon="check">
          <textarea className="finput" placeholder="Describe how the issue was resolved…" value={resolution} onChange={(e) => setResolution(e.target.value)} disabled={['CONFIRMED', 'CLOSED'].includes(c.status)} />
        </Panel>
      )}

      {/* status-driven actions */}
      {c.status === 'OPEN' && <button className="btn btn-primary btn-block" onClick={() => set(c.id, { status: 'IN_REVIEW' }, { tone: 'blue', title: 'Review started', msg: c.id })}><Icon name="eye" size={15} />Start Review</button>}
      {c.status === 'IN_REVIEW' && <button className="btn btn-primary btn-block" onClick={() => set(c.id, { status: 'ASSIGNED', team }, { tone: 'purple', title: 'Assigned', msg: c.id + ' → ' + team })}><Icon name="send" size={15} />Assign to {team}</button>}
      {c.status === 'ASSIGNED' && <button className="btn btn-green btn-block" disabled={!resolution.trim()} onClick={() => set(c.id, { status: 'RESOLVED', resolution }, { tone: 'green', title: 'Marked resolved', msg: c.id })}><Icon name="check" size={15} />Mark Resolved</button>}
      {c.status === 'RESOLVED' && (
        <>
          <div className="alert alert-info"><Icon name="phone" size={18} /><div>Confirm with the customer that the issue is resolved before closing.</div></div>
          <button className="btn btn-primary btn-block" onClick={() => set(c.id, { status: 'CONFIRMED', resolution }, { tone: 'blue', title: 'Customer confirmed', msg: c.id })}><Icon name="check" size={15} />Record Customer Confirmation</button>
        </>
      )}
      {c.status === 'CONFIRMED' && <button className="btn btn-green btn-block" onClick={() => set(c.id, { status: 'CLOSED' }, { tone: 'green', title: 'Ticket closed', msg: c.id })}><Icon name="check" size={15} />Close Ticket</button>}
      {c.status === 'CLOSED' && <div className="alert alert-green" style={{ marginBottom: 0 }}><Icon name="check" size={18} /><div>This complaint is <b>closed</b>. Resolution: {c.resolution || '—'}</div></div>}
    </Drawer>
  )
}

/* ════════ CGD Settings ════════ */
export function Settings() {
  const toast = useToast()
  const [notif, setNotif] = useState(true)
  const [autoSync, setAutoSync] = useState(true)
  return (
    <div className="page" style={{ maxWidth: 760 }}>
      <div className="phead"><div><h1>CGD Settings</h1><p>Organisation, tariff and integration settings for the CGD console.</p></div></div>
      <Panel title="Organisation" icon="shield" style={{ marginBottom: 18 }}>
        <div className="grid-2">
          <div className="fgroup"><label className="flabel">CGD Entity <Req /></label><input className="finput" defaultValue="Gasonet Services (RJ) Ltd" /></div>
          <div className="fgroup"><label className="flabel">Geographical Areas <Req /></label><input className="finput" defaultValue="Bikaner GA, Churu GA" /></div>
          <div className="fgroup"><label className="flabel">PNGRB Entity Code <Req /></label><input className="finput mono" defaultValue="PNGRB-RJ-GAS-014" /></div>
          <div className="fgroup"><label className="flabel">Support Helpline</label><input className="finput mono" defaultValue="1800-419-1906" /></div>
        </div>
      </Panel>
      <Panel title="Preferences" icon="settings">
        <Toggle label="Customer notifications (SMS / email)" on={notif} set={setNotif} />
        <Toggle label="Auto-sync applications from MyPNG" on={autoSync} set={setAutoSync} />
        <div style={{ textAlign: 'right', marginTop: 14 }}>
          <button className="btn btn-primary" onClick={() => toast({ tone: 'green', title: 'Settings saved' })}><Icon name="check" size={15} />Save Settings</button>
        </div>
      </Panel>
    </div>
  )
}

function Toggle({ label, on, set }) {
  return (
    <div className="kv">
      <span className="k" style={{ fontWeight: 600, color: 'var(--g700)' }}>{label}</span>
      <button onClick={() => set(!on)} aria-pressed={on} style={{ width: 42, height: 24, borderRadius: 20, border: 'none', background: on ? 'var(--green-mid)' : 'var(--g300)', position: 'relative', transition: '.16s' }}>
        <span style={{ position: 'absolute', top: 3, left: on ? 21 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: '.16s' }} />
      </button>
    </div>
  )
}
