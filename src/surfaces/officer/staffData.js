// ════════ CGD Staff Console — demo seed data ════════
// PNG ID is the single customer identifier across the platform (replaces CGD CRN).
// No timeline/SLA band labels (T0+2 / T2+4) are used anywhere here.

export const STAFF_USER = { name: 'Priya Sharma', role: 'CGD Officer', ga: 'Bikaner GA', mobile: '+91 98290 11234', empId: 'GAS-EMP-0142', email: 'priya.sharma@gasonet.in' }

export const CUSTOMERS = [
  { pngId: 'PNG-2026-000341', name: 'Pooja Sharma', mobile: '+91 99880 11223', category: 'Domestic', ga: 'Churu GA', area: 'Sardar Patel Nagar', status: 'Active', cycle: 'Cycle B' },
  { pngId: 'PNG-2026-000208', name: 'Ajay Singh', mobile: '+91 97000 88990', category: 'Commercial', ga: 'Churu GA', area: 'Industrial Estate', status: 'Active', cycle: 'Cycle A' },
  { pngId: 'PNG-2026-000190', name: 'Deepa Patel', mobile: '+91 95550 12121', category: 'Domestic', ga: 'Bikaner GA', area: 'Rani Bazar', status: 'Active', cycle: 'Cycle A' },
  { pngId: 'PNG-2026-000412', name: 'Neel Kumar', mobile: '+91 98765 43210', category: 'Domestic', ga: 'Bikaner GA', area: 'Rani Bazar', status: 'Active', cycle: null },
  { pngId: 'PNG-2025-009921', name: 'Ramesh Vyas', mobile: '+91 90011 22334', category: 'Domestic', ga: 'Bikaner GA', area: 'Jaynarayan Vyas Colony', status: 'Suspended', cycle: 'Cycle C' },
]

// Bi-weekly billing cycles a connection can be assigned to (date windows are the reading/billing window).
export const BILL_CYCLES = [
  { code: 'Cycle A', window: '1st – 7th', readDay: '1st of month' },
  { code: 'Cycle B', window: '8th – 14th', readDay: '8th of month' },
  { code: 'Cycle C', window: '15th – 21st', readDay: '15th of month' },
  { code: 'Cycle D', window: '22nd – 28th', readDay: '22nd of month' },
]

export const CATEGORIES = [
  { code: 'DOM', name: 'Domestic', sd: 5000, tariff: '₹54 / m³', count: 41280 },
  { code: 'COM', name: 'Commercial', sd: 15000, tariff: '₹62 / m³', count: 3120 },
  { code: 'IND', name: 'Industrial', sd: 50000, tariff: '₹58 / SCM', count: 214 },
]

export const METERS = [
  { meterNo: 'MTR-IN-880142', pngId: 'PNG-2026-000190', name: 'Deepa Patel', area: 'Rani Bazar', status: 'Installed', lastReading: 92, installedOn: '21 Apr 2026' },
  { meterNo: 'MTR-IN-880208', pngId: 'PNG-2026-000208', name: 'Ajay Singh', area: 'Industrial Estate', status: 'Installed', lastReading: 410, installedOn: '29 May 2026' },
  { meterNo: 'MTR-PD-880341', pngId: 'PNG-2026-000341', name: 'Pooja Sharma', area: 'Sardar Patel Nagar', status: 'Pending Install', lastReading: 0, installedOn: '—' },
  { meterNo: 'MTR-IN-880412', pngId: 'PNG-2026-000412', name: 'Neel Kumar', area: 'Rani Bazar', status: 'Installed', lastReading: 88, installedOn: '12 Mar 2026' },
]

export const WORK_ORDERS = [
  { id: 'WO-2026-0451', type: 'Site Survey', pngId: 'PNG-2026-000341', name: 'Pooja Sharma', crew: 'Team A', scheduled: '16 Jun 2026', status: 'Open', priority: 'High' },
  { id: 'WO-2026-0448', type: 'Meter Installation', pngId: 'PNG-2026-000208', name: 'Ajay Singh', crew: 'Team B', scheduled: '12 Jun 2026', status: 'In Progress', priority: 'Medium' },
  { id: 'WO-2026-0440', type: 'Leak Inspection', pngId: 'PNG-2026-000190', name: 'Deepa Patel', crew: 'Team A', scheduled: '08 Jun 2026', status: 'Completed', priority: 'Low' },
]

export const EMPLOYEES = [
  { empId: 'GAS-EMP-0142', name: 'Priya Sharma', email: 'priya.sharma@gasonet.in', role: 'CGD Officer', ga: 'Bikaner GA', status: 'Active' },
  { empId: 'GAS-EMP-0156', name: 'Vikram Rathore', email: 'vikram.r@gasonet.in', role: 'Meter Reader', ga: 'Bikaner GA', status: 'Active' },
  { empId: 'GAS-EMP-0163', name: 'Sunita Joshi', email: 'sunita.j@gasonet.in', role: 'Billing Executive', ga: 'Churu GA', status: 'Active' },
  { empId: 'GAS-EMP-0170', name: 'Mohit Agarwal', email: 'mohit.a@gasonet.in', role: 'Admin', ga: 'Bikaner GA', status: 'Invited' },
]

export const ROLES = ['Admin', 'CGD Officer', 'Billing Executive', 'Meter Reader', 'Field Engineer']
export const WO_TYPES = ['Site Survey', 'Meter Installation', 'Leak Inspection', 'Disconnection', 'Reconnection']

// ════════ M2 · Meter Reader — today's reading route ════════
export const READING_SCHEDULE = [
  { pngId: 'PNG-2026-000190', meterNo: 'MTR-IN-880142', name: 'Deepa Patel', area: 'Rani Bazar', address: 'Plot 14, Rani Bazar, Bikaner', cycle: 'Cycle A', prevReading: 92, avg: 11, slot: '09:00 AM', status: 'Pending' },
  { pngId: 'PNG-2026-000412', meterNo: 'MTR-IN-880412', name: 'Neel Kumar', area: 'Rani Bazar', address: 'Plot 21, Rani Bazar, Bikaner', cycle: 'Cycle A', prevReading: 88, avg: 9, slot: '09:40 AM', status: 'Pending' },
  { pngId: 'PNG-2026-000208', meterNo: 'MTR-IN-880208', name: 'Ajay Singh', area: 'Industrial Estate', address: 'Unit 3, Industrial Estate, Churu', cycle: 'Cycle A', prevReading: 410, avg: 64, slot: '11:15 AM', status: 'Done', curReading: 472 },
]

// ════════ M3 · Bill Generation & Approval — draft bill queue ════════
// status: PENDING_VALIDATION → VALIDATED → PENDING_APPROVAL → APPROVED → RELEASED | REJECTED
export const DRAFT_BILLS = [
  { id: 'INV2506190', pngId: 'PNG-2026-000190', name: 'Deepa Patel', category: 'Domestic', cycle: 'Cycle A', prev: 92, cur: 103, rate: 54, fixed: 90, status: 'PENDING_VALIDATION', generated: '14 Jun 2026', reason: '' },
  { id: 'INV2506412', pngId: 'PNG-2026-000412', name: 'Neel Kumar', category: 'Domestic', cycle: 'Cycle A', prev: 88, cur: 97, rate: 54, fixed: 90, status: 'PENDING_VALIDATION', generated: '14 Jun 2026', reason: '' },
  { id: 'INV2506208', pngId: 'PNG-2026-000208', name: 'Ajay Singh', category: 'Commercial', cycle: 'Cycle A', prev: 410, cur: 472, rate: 62, fixed: 250, status: 'PENDING_APPROVAL', generated: '13 Jun 2026', reason: '' },
  { id: 'INV2506341', pngId: 'PNG-2026-000341', name: 'Pooja Sharma', category: 'Domestic', cycle: 'Cycle B', prev: 70, cur: 71, rate: 54, fixed: 90, status: 'REJECTED', generated: '12 Jun 2026', reason: 'Consumption abnormally low — verify meter reading before approval.' },
]

// ════════ M5 · Payments & Collections — outstanding bills ════════
// status: DUE | DUE_TODAY | OVERDUE | REMINDED | SCHEDULED | PAID
export const COLLECTIONS = [
  { inv: 'INV2505117', pngId: 'PNG-2026-000412', name: 'Neel Kumar', mobile: '+91 98765 43210', amount: 4794, dueDate: '10 Jun 2026', status: 'OVERDUE', daysOverdue: 5 },
  { inv: 'INV2505190', pngId: 'PNG-2026-000190', name: 'Deepa Patel', mobile: '+91 95550 12121', amount: 4380, dueDate: '15 Jun 2026', status: 'DUE_TODAY', daysOverdue: 0 },
  { inv: 'INV2505208', pngId: 'PNG-2026-000208', name: 'Ajay Singh', mobile: '+91 97000 88990', amount: 8210, dueDate: '18 Jun 2026', status: 'DUE', daysOverdue: 0 },
  { inv: 'INV2505099', pngId: 'PNG-2025-009921', name: 'Ramesh Vyas', mobile: '+91 90011 22334', amount: 3120, dueDate: '02 Jun 2026', status: 'OVERDUE', daysOverdue: 13 },
  { inv: 'INV2505341', pngId: 'PNG-2026-000341', name: 'Pooja Sharma', mobile: '+91 99880 11223', amount: 2980, dueDate: '12 Jun 2026', status: 'REMINDED', daysOverdue: 3 },
]

// ════════ M6 · Complaints & Ticketing (officer side) ════════
// status: OPEN → IN_REVIEW → ASSIGNED → RESOLVED → CONFIRMED → CLOSED
export const COMPLAINT_TEAMS = ['Billing Team', 'Metering Team', 'Field Team', 'Finance Team']
export const COMPLAINTS_OFFICER = [
  { id: 'CMP60412', pngId: 'PNG-2026-000412', name: 'Neel Kumar', mobile: '+91 98765 43210', category: 'Billing', subject: 'May 2026 bill seems higher than usual', status: 'OPEN', raised: '12 Jun 2026', team: null, detail: 'Customer reports the May invoice (₹4,794) is higher than their usual ~₹4,400. Wants the meter reading verified.', resolution: '' },
  { id: 'CMP60401', pngId: 'PNG-2026-000208', name: 'Ajay Singh', mobile: '+91 97000 88990', category: 'Metering', subject: 'Meter display not visible at night', status: 'ASSIGNED', raised: '10 Jun 2026', team: 'Field Team', detail: 'Commercial customer requests a backlit/relocated meter for night-time readings.', resolution: '' },
  { id: 'CMP60388', pngId: 'PNG-2026-000190', name: 'Deepa Patel', mobile: '+91 95550 12121', category: 'Payment', subject: 'UPI payment debited but not reflected', status: 'RESOLVED', raised: '02 May 2026', team: 'Finance Team', detail: 'Payment TXN98120341 of ₹4,380 was debited but bill still showed Due.', resolution: 'Payment reconciled against INV2504098. Receipt re-sent to customer. Awaiting customer confirmation.' },
  { id: 'CMP60201', pngId: 'PNG-2026-000341', name: 'Pooja Sharma', mobile: '+91 99880 11223', category: 'Connection', subject: 'Status of new PNG connection', status: 'CLOSED', raised: '14 Mar 2026', team: 'Field Team', detail: 'Query on installation timeline for new connection.', resolution: 'Connection installed and JMR signed off on 21 Apr 2026. Customer confirmed. Ticket closed.' },
]
