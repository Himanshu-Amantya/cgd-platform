// ════════ Gasonet CGD Platform — API server ════════
import express from 'express'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { db, seed, Applications, Schedule, Bills, Collections, Complaints } from './db.js'

seed()

const app = express()
app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 4000
const SECRET = process.env.JWT_SECRET || 'gasonet-dev-secret'
// No SMS provider yet → return the OTP to the client so the demo can log in.
// Set SHOW_OTP=0 once real SMS delivery is wired.
const SHOW_OTP = process.env.SHOW_OTP !== '0'

// ── helpers ──
const fmtDate = (d = new Date()) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
const digits = (s) => (s || '').replace(/\D/g, '').slice(-10)
const RATES = { Domestic: { rate: 54, fixed: 90 }, Commercial: { rate: 62, fixed: 250 }, Industrial: { rate: 58, fixed: 500 } }
const billAmount = (b) => Math.max(0, b.cur - b.prev) * b.rate + b.fixed
const invId = () => 'INV' + Math.floor(100000 + Math.random() * 899999)
const cmpId = () => 'CMP' + Math.floor(60500 + Math.random() * 899)
const pngId = () => 'PNG-2026-' + String(100400 + Math.floor(Math.random() * 8999)).slice(0, 6)
const sign = (payload) => jwt.sign(payload, SECRET, { expiresIn: '12h' })
const ok = (res, data) => res.json(data ?? { ok: true })
const wrap = (fn) => (req, res) => { try { fn(req, res) } catch (e) { console.error(e); res.status(500).json({ error: e.message }) } }

const staffStmt = {
  byEmail: db.prepare('SELECT * FROM staff WHERE lower(email)=lower(?)'),
  byId: db.prepare('SELECT * FROM staff WHERE empId=?'),
  all: db.prepare('SELECT empId,name,email,role,ga,status FROM staff'),
  insert: db.prepare('INSERT INTO staff (empId,name,email,password,role,ga,status,mobile) VALUES (?,?,?,?,?,?,?,?)'),
  update: db.prepare('UPDATE staff SET name=?,email=?,role=?,status=? WHERE empId=?'),
}
const custStmt = {
  byMobile: db.prepare('SELECT * FROM customers'),
  byId: db.prepare('SELECT * FROM customers WHERE pngId=?'),
  all: db.prepare('SELECT * FROM customers'),
  setCycle: db.prepare('UPDATE customers SET cycle=?, status=? WHERE pngId=?'),
}

// ════════ auth ════════
app.post('/api/auth/staff/login', wrap((req, res) => {
  const { email, password } = req.body
  const u = staffStmt.byEmail.get(email || '')
  if (!u || !bcrypt.compareSync(password || '', u.password)) return res.status(401).json({ error: 'Invalid email or password' })
  if (u.status === 'Suspended') return res.status(403).json({ error: 'Account suspended — contact your administrator' })
  const user = { empId: u.empId, name: u.name, email: u.email, role: u.role, ga: u.ga }
  ok(res, { token: sign({ ...user, type: 'staff' }), user })
}))

app.post('/api/auth/customer/request-otp', wrap((req, res) => {
  const m = digits(req.body.mobile)
  const cust = custStmt.byMobile.all().find((c) => digits(c.mobile) === m)
  if (!cust) return res.status(404).json({ error: 'No customer found for this mobile number' })
  const code = String(Math.floor(100000 + Math.random() * 899999))
  db.prepare('INSERT INTO otps (mobile,code,expires) VALUES (?,?,?) ON CONFLICT(mobile) DO UPDATE SET code=excluded.code, expires=excluded.expires')
    .run(m, code, Date.now() + 5 * 60 * 1000)
  // TODO(real SMS): send `code` via MSG91/Twilio. In dev we return it so the demo flows.
  console.log(`[OTP] ${cust.name} (${m}) → ${code}`)
  ok(res, { sent: true, ...(SHOW_OTP ? { devOtp: code } : {}) })
}))

app.post('/api/auth/customer/verify-otp', wrap((req, res) => {
  const m = digits(req.body.mobile)
  const row = db.prepare('SELECT * FROM otps WHERE mobile=?').get(m)
  if (!row || row.code !== String(req.body.otp) || row.expires < Date.now()) return res.status(401).json({ error: 'Invalid or expired OTP' })
  db.prepare('DELETE FROM otps WHERE mobile=?').run(m)
  const cust = custStmt.byMobile.all().find((c) => digits(c.mobile) === m)
  const user = { pngId: cust.pngId, name: cust.name, mobile: cust.mobile, email: cust.email }
  ok(res, { token: sign({ ...user, type: 'customer' }), user })
}))

// ── auth middleware (everything below /api except /api/auth/* requires a token) ──
app.use('/api', (req, res, next) => {
  if (req.path.startsWith('/auth/') || req.path === '/health') return next()
  const h = req.headers.authorization || ''
  const token = h.startsWith('Bearer ') ? h.slice(7) : null
  if (!token) return res.status(401).json({ error: 'Authentication required' })
  try { req.user = jwt.verify(token, SECRET); next() } catch { res.status(401).json({ error: 'Invalid or expired session' }) }
})
const customerOnly = (req, res, next) => req.user?.type === 'customer' ? next() : res.status(403).json({ error: 'Customer access only' })

// ════════ applications (onboarding) ════════
app.get('/api/applications', wrap((req, res) => ok(res, Applications.all())))
app.post('/api/applications', wrap((req, res) => {
  const d = req.body || {}
  const png = d.png || pngId()
  const app_ = {
    png, mypng: d.mypng || '1-01-2026-' + Math.floor(10000000 + Math.random() * 89999999),
    name: d.name || 'New Applicant', mobile: d.mobile || '+91 90000 00000', email: d.email || 'applicant@gmail.com',
    connType: d.connType || 'Domestic PNG', ga: d.ga || 'Bikaner GA', premise: d.premise || 'Independent House',
    occupancy: d.occupancy || 'Owner', ekyc: 'AUTO_APPROVED', serviceability: 'SERVICEABLE',
    status: 'PAYMENT_PENDING', scheme: null, amountPaid: 0, paid: false, sla: '3d left', slaWarn: false,
    submitted: fmtDate(), updated: fmtDate(), remarks: '', source: d.source || 'MyPNG',
    docs: [['Aadhaar (eKYC)', 'AUTO_APPROVED', 'PENDING'], ['PAN Card', 'pan.pdf', 'PENDING'], ['Address Proof', 'electricity_bill.pdf', 'PENDING'], ['Ownership / NOC', 'declared', 'PENDING']],
  }
  if (!Applications.get(png)) Applications.put(app_)
  ok(res, app_)
}))
const patchApp = (png, changes) => { const a = Applications.get(png); if (a) Applications.put({ ...a, ...changes, updated: fmtDate() }); return Applications.get(png) }
app.post('/api/applications/:png/pay', wrap((req, res) => ok(res, patchApp(req.params.png, { paid: true, status: 'REVIEW', ...req.body }))))
app.post('/api/applications/:png/decide', wrap((req, res) => {
  const { decision, remarks, docs } = req.body
  ok(res, patchApp(req.params.png, { status: decision, remarks, ...(docs ? { docs } : {}) }))
}))
app.post('/api/applications/:png/advance', wrap((req, res) => ok(res, patchApp(req.params.png, { status: req.body.to }))))

// ════════ schedule + readings (M2) → generates a bill (M3) ════════
app.get('/api/schedule', wrap((req, res) => ok(res, Schedule.all())))
app.post('/api/schedule/:pngId/reading', wrap((req, res) => {
  const { curReading, consumption, flagged } = req.body
  const stop = Schedule.get(req.params.pngId)
  if (!stop) return res.status(404).json({ error: 'Schedule stop not found' })
  Schedule.put({ ...stop, status: flagged ? 'Flagged' : 'Done', curReading, consumption })
  let billId = null
  if (!flagged) {
    const cust = custStmt.byId.get(req.params.pngId)
    const cat = cust?.category || 'Domestic'
    const { rate, fixed } = RATES[cat] || RATES.Domestic
    billId = invId()
    Bills.put({ id: billId, pngId: stop.pngId, name: stop.name, category: cat, cycle: stop.cycle, prev: stop.prevReading, cur: curReading, rate, fixed, status: 'PENDING_VALIDATION', generated: fmtDate(), reason: '', source: 'auto' })
  }
  ok(res, { stop: Schedule.get(req.params.pngId), billId })
}))

// ════════ bills (M3) ════════
app.get('/api/bills', wrap((req, res) => ok(res, Bills.all())))
const patchBill = (id, changes) => { const b = Bills.get(id); if (b) Bills.put({ ...b, ...changes }); return Bills.get(id) }
app.post('/api/bills/:id/validate', wrap((req, res) => ok(res, patchBill(req.params.id, { status: 'PENDING_APPROVAL', reason: '' }))))
app.post('/api/bills/:id/approve', wrap((req, res) => ok(res, patchBill(req.params.id, { status: 'APPROVED', reason: '' }))))
app.post('/api/bills/:id/reject', wrap((req, res) => ok(res, patchBill(req.params.id, { status: 'REJECTED', reason: req.body.reason || '' }))))
app.post('/api/bills/:id/regenerate', wrap((req, res) => ok(res, patchBill(req.params.id, { status: 'PENDING_VALIDATION', reason: '', generated: fmtDate() }))))
app.post('/api/bills/:id/release', wrap((req, res) => {
  const b = Bills.get(req.params.id)
  if (!b) return res.status(404).json({ error: 'Bill not found' })
  patchBill(b.id, { status: 'RELEASED' })
  if (!Collections.get(b.id)) {
    const cust = custStmt.byId.get(b.pngId)
    Collections.put({ inv: b.id, pngId: b.pngId, name: b.name, mobile: cust?.mobile || '+91 90000 00000', amount: billAmount(b), dueDate: fmtDate(new Date(Date.now() + 15 * 86400000)), status: 'DUE', daysOverdue: 0 })
  }
  ok(res, { bill: Bills.get(b.id), collection: Collections.get(b.id) })
}))

// ════════ collections (M5) ════════
app.get('/api/collections', wrap((req, res) => ok(res, Collections.all())))
const patchColl = (inv, changes) => { const c = Collections.get(inv); if (c) Collections.put({ ...c, ...changes }); return Collections.get(inv) }
app.post('/api/collections/:inv/remind', wrap((req, res) => ok(res, patchColl(req.params.inv, { status: 'REMINDED' }))))
app.post('/api/collections/:inv/schedule', wrap((req, res) => ok(res, patchColl(req.params.inv, { status: 'SCHEDULED' }))))
app.post('/api/collections/:inv/pay', wrap((req, res) => ok(res, patchColl(req.params.inv, { status: 'PAID', daysOverdue: 0 }))))

// ════════ complaints (M6) ════════
app.get('/api/complaints', wrap((req, res) => ok(res, Complaints.all())))
app.post('/api/complaints/:id/update', wrap((req, res) => {
  const c = Complaints.get(req.params.id)
  if (!c) return res.status(404).json({ error: 'Complaint not found' })
  Complaints.put({ ...c, ...req.body })
  ok(res, Complaints.get(req.params.id))
}))

// ════════ customers + cycle (M1) ════════
app.get('/api/customers', wrap((req, res) => ok(res, custStmt.all.all())))
app.post('/api/customers/:pngId/cycle', wrap((req, res) => {
  const c = custStmt.byId.get(req.params.pngId)
  if (!c) return res.status(404).json({ error: 'Customer not found' })
  const status = c.status === 'Suspended' ? c.status : 'Active'
  custStmt.setCycle.run(req.body.cycle, status, req.params.pngId)
  ok(res, custStmt.byId.get(req.params.pngId))
}))

// ════════ staff / users ════════
app.get('/api/staff', wrap((req, res) => ok(res, staffStmt.all.all())))
app.post('/api/staff/invite', wrap((req, res) => {
  const { name, email, role, ga } = req.body
  const empId = 'GAS-EMP-' + Math.floor(200 + Math.random() * 799)
  staffStmt.insert.run(empId, name, email, bcrypt.hashSync('gasonet123', 10), role, ga, 'Invited', '')
  ok(res, { empId, name, email, role, ga, status: 'Invited' })
}))
app.post('/api/staff/:empId/update', wrap((req, res) => {
  const u = staffStmt.byId.get(req.params.empId)
  if (!u) return res.status(404).json({ error: 'Staff not found' })
  const next = { ...u, ...req.body }
  staffStmt.update.run(next.name, next.email, next.role, next.status, u.empId)
  ok(res, staffStmt.all.all().find((s) => s.empId === u.empId))
}))
app.post('/api/staff/:empId/suspend', wrap((req, res) => {
  const u = staffStmt.byId.get(req.params.empId)
  if (!u) return res.status(404).json({ error: 'Staff not found' })
  const status = u.status === 'Suspended' ? 'Active' : 'Suspended'
  staffStmt.update.run(u.name, u.email, u.role, status, u.empId)
  ok(res, { ...u, status })
}))

// ════════ customer self-service (/api/me/*) ════════
app.get('/api/me/bills', customerOnly, wrap((req, res) => {
  const mine = Collections.all().filter((c) => c.pngId === req.user.pngId)
  ok(res, mine)
}))
app.get('/api/me/complaints', customerOnly, wrap((req, res) => ok(res, Complaints.all().filter((c) => c.pngId === req.user.pngId))))
app.post('/api/me/complaints', customerOnly, wrap((req, res) => {
  const id = cmpId()
  const c = { id, pngId: req.user.pngId, name: req.user.name, mobile: req.user.mobile, category: req.body.category || 'Other', subject: req.body.subject || 'Customer query', status: 'OPEN', raised: fmtDate(), team: null, detail: req.body.detail || '', resolution: '' }
  Complaints.put(c)
  ok(res, c)
}))

// ════════ demo reset ════════
app.post('/api/admin/reset', wrap((req, res) => {
  db.exec('DELETE FROM staff; DELETE FROM customers; DELETE FROM applications; DELETE FROM schedule; DELETE FROM bills; DELETE FROM collections; DELETE FROM complaints; DELETE FROM otps; DELETE FROM meta;')
  seed()
  ok(res)
}))

app.get('/api/health', (req, res) => res.json({ ok: true, ts: Date.now() }))
app.listen(PORT, () => console.log(`CGD API on http://localhost:${PORT}`))
