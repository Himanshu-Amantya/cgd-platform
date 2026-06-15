// ════════ SQLite database — schema + seed ════════
import Database from 'better-sqlite3'
import bcrypt from 'bcryptjs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
// DB_PATH lets a host point this at a persistent disk (e.g. Render disk mount).
const DB_FILE = process.env.DB_PATH || join(__dirname, 'cgd.db')
export const db = new Database(DB_FILE)
db.pragma('journal_mode = WAL')

db.exec(`
  CREATE TABLE IF NOT EXISTS staff (
    empId TEXT PRIMARY KEY, name TEXT, email TEXT UNIQUE, password TEXT,
    role TEXT, ga TEXT, status TEXT, mobile TEXT
  );
  CREATE TABLE IF NOT EXISTS customers (
    pngId TEXT PRIMARY KEY, name TEXT, mobile TEXT, email TEXT, category TEXT,
    ga TEXT, area TEXT, status TEXT, cycle TEXT
  );
  CREATE TABLE IF NOT EXISTS applications (png TEXT PRIMARY KEY, data TEXT);
  CREATE TABLE IF NOT EXISTS schedule (pngId TEXT PRIMARY KEY, data TEXT);
  CREATE TABLE IF NOT EXISTS bills (id TEXT PRIMARY KEY, data TEXT);
  CREATE TABLE IF NOT EXISTS collections (inv TEXT PRIMARY KEY, data TEXT);
  CREATE TABLE IF NOT EXISTS complaints (id TEXT PRIMARY KEY, data TEXT);
  CREATE TABLE IF NOT EXISTS otps (mobile TEXT PRIMARY KEY, code TEXT, expires INTEGER);
  CREATE TABLE IF NOT EXISTS meta (k TEXT PRIMARY KEY, v TEXT);
`)

// ── JSON-row helpers (one column "data" holds the object) ──
export const jsonTable = (table, key) => ({
  all: () => db.prepare(`SELECT data FROM ${table}`).all().map((r) => JSON.parse(r.data)),
  get: (id) => { const r = db.prepare(`SELECT data FROM ${table} WHERE ${key}=?`).get(id); return r ? JSON.parse(r.data) : null },
  put: (obj) => db.prepare(`INSERT INTO ${table} (${key}, data) VALUES (?, ?) ON CONFLICT(${key}) DO UPDATE SET data=excluded.data`).run(obj[key], JSON.stringify(obj)),
  del: (id) => db.prepare(`DELETE FROM ${table} WHERE ${key}=?`).run(id),
})
export const Applications = jsonTable('applications', 'png')
export const Schedule = jsonTable('schedule', 'pngId')
export const Bills = jsonTable('bills', 'id')
export const Collections = jsonTable('collections', 'inv')
export const Complaints = jsonTable('complaints', 'id')

// ════════ seed (runs once) ════════
const SEED_VERSION = '1'
function seeded() { const r = db.prepare('SELECT v FROM meta WHERE k=?').get('seed'); return r?.v === SEED_VERSION }

export function seed() {
  if (seeded()) return
  const tx = db.transaction(() => {
    // staff — default password for all demo accounts
    const pw = bcrypt.hashSync('gasonet123', 10)
    const staff = [
      ['GAS-EMP-0142', 'Priya Sharma', 'priya.sharma@gasonet.in', 'CGD Officer', 'Bikaner GA', 'Active', '+91 98290 11234'],
      ['GAS-EMP-0156', 'Vikram Rathore', 'vikram.r@gasonet.in', 'Meter Reader', 'Bikaner GA', 'Active', '+91 98290 11235'],
      ['GAS-EMP-0163', 'Sunita Joshi', 'sunita.j@gasonet.in', 'Billing Executive', 'Churu GA', 'Active', '+91 98290 11236'],
      ['GAS-EMP-0170', 'Mohit Agarwal', 'mohit.a@gasonet.in', 'Admin', 'Bikaner GA', 'Invited', '+91 98290 11237'],
    ]
    const sStmt = db.prepare('INSERT INTO staff (empId,name,email,password,role,ga,status,mobile) VALUES (?,?,?,?,?,?,?,?)')
    staff.forEach((s) => sStmt.run(s[0], s[1], s[2], pw, s[3], s[4], s[5], s[6]))

    const customers = [
      ['PNG-2026-000341', 'Pooja Sharma', '+91 99880 11223', 'pooja.s@gmail.com', 'Domestic', 'Churu GA', 'Sardar Patel Nagar', 'Active', 'Cycle B'],
      ['PNG-2026-000208', 'Ajay Singh', '+91 97000 88990', 'ajay.s@gmail.com', 'Commercial', 'Churu GA', 'Industrial Estate', 'Active', 'Cycle A'],
      ['PNG-2026-000190', 'Deepa Patel', '+91 95550 12121', 'deepa.p@gmail.com', 'Domestic', 'Bikaner GA', 'Rani Bazar', 'Active', 'Cycle A'],
      ['PNG-2026-000412', 'Neel Kumar', '+91 98765 43210', 'neel.k@gmail.com', 'Domestic', 'Bikaner GA', 'Rani Bazar', 'Active', null],
      ['PNG-2025-009921', 'Ramesh Vyas', '+91 90011 22334', 'ramesh.v@gmail.com', 'Domestic', 'Bikaner GA', 'Jaynarayan Vyas Colony', 'Suspended', 'Cycle C'],
    ]
    const cStmt = db.prepare('INSERT INTO customers (pngId,name,mobile,email,category,ga,area,status,cycle) VALUES (?,?,?,?,?,?,?,?,?)')
    customers.forEach((c) => cStmt.run(...c))

    const apps = [
      { png: 'PNG-2026-000341', mypng: '1-01-2026-12338771', name: 'Pooja Sharma', mobile: '+91 99880 11223', email: 'pooja.s@gmail.com', connType: 'Domestic PNG', ga: 'Churu GA', premise: 'Society / Apartment', occupancy: 'Tenant', ekyc: 'AUTO_APPROVED', serviceability: 'SERVICEABLE', status: 'REVIEW', scheme: 'One-Time Payment', amountPaid: 6300, paid: true, sla: '1d left', slaWarn: true, submitted: '02 Jun 2026', updated: '10 Jun 2026', remarks: '', docs: [['Aadhaar (eKYC)', 'AUTO_APPROVED', 'PENDING'], ['PAN Card', 'pan_pooja.pdf', 'PENDING'], ['Address Proof', 'rent_agreement.pdf', 'PENDING'], ['Owner NOC', 'noc_landlord.pdf', 'PENDING']] },
      { png: 'PNG-2026-000208', mypng: '1-01-2026-12331004', name: 'Ajay Singh', mobile: '+91 97000 88990', email: 'ajay.s@gmail.com', connType: 'Commercial PNG', ga: 'Churu GA', premise: 'Office', occupancy: 'Tenant', ekyc: 'AUTO_APPROVED', serviceability: 'SERVICEABLE', status: 'APPROVED', scheme: 'Installment Option', amountPaid: 2300, paid: true, sla: '—', slaWarn: false, submitted: '18 May 2026', updated: '29 May 2026', remarks: 'Application reviewed and approved by CGD officer.', docs: [['Aadhaar', 'ok', 'APPROVED'], ['PAN Card', 'ok', 'APPROVED'], ['Address Proof', 'ok', 'APPROVED'], ['Trade License', 'ok', 'APPROVED']] },
      { png: 'PNG-2026-000190', mypng: '1-01-2026-12320551', name: 'Deepa Patel', mobile: '+91 95550 12121', email: 'deepa.p@gmail.com', connType: 'Domestic PNG', ga: 'Bikaner GA', premise: 'Society / Apartment', occupancy: 'Owner', ekyc: 'AUTO_APPROVED', serviceability: 'SERVICEABLE', status: 'COMPLETED', scheme: 'One-Time Payment', amountPaid: 6300, paid: true, sla: '—', slaWarn: false, submitted: '04 Apr 2026', updated: '21 Apr 2026', remarks: 'Approved & connection completed.', docs: [['Aadhaar', 'ok', 'APPROVED'], ['PAN Card', 'ok', 'APPROVED'], ['Address Proof', 'ok', 'APPROVED'], ['Ownership', 'ok', 'APPROVED']] },
    ]
    apps.forEach((a) => Applications.put(a))

    const schedule = [
      { pngId: 'PNG-2026-000190', meterNo: 'MTR-IN-880142', name: 'Deepa Patel', area: 'Rani Bazar', address: 'Plot 14, Rani Bazar, Bikaner', cycle: 'Cycle A', prevReading: 92, avg: 11, slot: '09:00 AM', status: 'Pending' },
      { pngId: 'PNG-2026-000412', meterNo: 'MTR-IN-880412', name: 'Neel Kumar', area: 'Rani Bazar', address: 'Plot 21, Rani Bazar, Bikaner', cycle: 'Cycle A', prevReading: 88, avg: 9, slot: '09:40 AM', status: 'Pending' },
      { pngId: 'PNG-2026-000208', meterNo: 'MTR-IN-880208', name: 'Ajay Singh', area: 'Industrial Estate', address: 'Unit 3, Industrial Estate, Churu', cycle: 'Cycle A', prevReading: 410, avg: 64, slot: '11:15 AM', status: 'Done', curReading: 472 },
    ]
    schedule.forEach((s) => Schedule.put(s))

    const bills = [
      { id: 'INV2506190', pngId: 'PNG-2026-000190', name: 'Deepa Patel', category: 'Domestic', cycle: 'Cycle A', prev: 92, cur: 103, rate: 54, fixed: 90, status: 'PENDING_VALIDATION', generated: '14 Jun 2026', reason: '' },
      { id: 'INV2506412', pngId: 'PNG-2026-000412', name: 'Neel Kumar', category: 'Domestic', cycle: 'Cycle A', prev: 88, cur: 97, rate: 54, fixed: 90, status: 'PENDING_VALIDATION', generated: '14 Jun 2026', reason: '' },
      { id: 'INV2506208', pngId: 'PNG-2026-000208', name: 'Ajay Singh', category: 'Commercial', cycle: 'Cycle A', prev: 410, cur: 472, rate: 62, fixed: 250, status: 'PENDING_APPROVAL', generated: '13 Jun 2026', reason: '' },
      { id: 'INV2506341', pngId: 'PNG-2026-000341', name: 'Pooja Sharma', category: 'Domestic', cycle: 'Cycle B', prev: 70, cur: 71, rate: 54, fixed: 90, status: 'REJECTED', generated: '12 Jun 2026', reason: 'Consumption abnormally low — verify meter reading before approval.' },
    ]
    bills.forEach((b) => Bills.put(b))

    const collections = [
      { inv: 'INV2505117', pngId: 'PNG-2026-000412', name: 'Neel Kumar', mobile: '+91 98765 43210', amount: 4794, dueDate: '10 Jun 2026', status: 'OVERDUE', daysOverdue: 5 },
      { inv: 'INV2505190', pngId: 'PNG-2026-000190', name: 'Deepa Patel', mobile: '+91 95550 12121', amount: 4380, dueDate: '15 Jun 2026', status: 'DUE_TODAY', daysOverdue: 0 },
      { inv: 'INV2505208', pngId: 'PNG-2026-000208', name: 'Ajay Singh', mobile: '+91 97000 88990', amount: 8210, dueDate: '18 Jun 2026', status: 'DUE', daysOverdue: 0 },
      { inv: 'INV2505099', pngId: 'PNG-2025-009921', name: 'Ramesh Vyas', mobile: '+91 90011 22334', amount: 3120, dueDate: '02 Jun 2026', status: 'OVERDUE', daysOverdue: 13 },
      { inv: 'INV2505341', pngId: 'PNG-2026-000341', name: 'Pooja Sharma', mobile: '+91 99880 11223', amount: 2980, dueDate: '12 Jun 2026', status: 'REMINDED', daysOverdue: 3 },
    ]
    collections.forEach((c) => Collections.put(c))

    const complaints = [
      { id: 'CMP60412', pngId: 'PNG-2026-000412', name: 'Neel Kumar', mobile: '+91 98765 43210', category: 'Billing', subject: 'May 2026 bill seems higher than usual', status: 'OPEN', raised: '12 Jun 2026', team: null, detail: 'Customer reports the May invoice (₹4,794) is higher than their usual ~₹4,400. Wants the meter reading verified.', resolution: '' },
      { id: 'CMP60401', pngId: 'PNG-2026-000208', name: 'Ajay Singh', mobile: '+91 97000 88990', category: 'Metering', subject: 'Meter display not visible at night', status: 'ASSIGNED', raised: '10 Jun 2026', team: 'Field Team', detail: 'Commercial customer requests a backlit/relocated meter for night-time readings.', resolution: '' },
      { id: 'CMP60388', pngId: 'PNG-2026-000190', name: 'Deepa Patel', mobile: '+91 95550 12121', category: 'Payment', subject: 'UPI payment debited but not reflected', status: 'RESOLVED', raised: '02 May 2026', team: 'Finance Team', detail: 'Payment TXN98120341 of ₹4,380 was debited but bill still showed Due.', resolution: 'Payment reconciled against INV2504098. Receipt re-sent to customer. Awaiting customer confirmation.' },
      { id: 'CMP60201', pngId: 'PNG-2026-000341', name: 'Pooja Sharma', mobile: '+91 99880 11223', category: 'Connection', subject: 'Status of new PNG connection', status: 'CLOSED', raised: '14 Mar 2026', team: 'Field Team', detail: 'Query on installation timeline for new connection.', resolution: 'Connection installed and JMR signed off on 21 Apr 2026. Customer confirmed. Ticket closed.' },
    ]
    complaints.forEach((c) => Complaints.put(c))

    db.prepare('INSERT INTO meta (k,v) VALUES (?,?) ON CONFLICT(k) DO UPDATE SET v=excluded.v').run('seed', SEED_VERSION)
  })
  tx()
}
