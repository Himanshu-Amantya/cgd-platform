// Official PNG application lifecycle (from PNG_CGD_Integration_API_Guide v1.10)
// SUBMITTED → IN_PROGRESS → REVIEW → VERIFIED → APPROVED / NOT_APPROVED
//   → PAYMENT_PENDING → SCHEDULED → COMPLETED
export const STATUS = {
  SUBMITTED:       { label: 'Application Submitted', short: 'Submitted',         cls: 'b-blue' },
  PAYMENT_PENDING: { label: 'Payment Pending',       short: 'Payment Pending',   cls: 'b-amber' },
  PAID:            { label: 'Paid · Under Review',    short: 'Paid',              cls: 'b-blue' },
  REVIEW:          { label: 'Under Verification',     short: 'Under Review',      cls: 'b-blue' },
  VERIFIED:        { label: 'Verified',               short: 'Verified',          cls: 'b-teal' },
  APPROVED:        { label: 'Approved',               short: 'Approved',          cls: 'b-teal' },
  NOT_APPROVED:    { label: 'Not Approved',           short: 'Not Approved',      cls: 'b-red' },
  SCHEDULED:       { label: 'Connection Scheduled',   short: 'Scheduled',         cls: 'b-purple' },
  COMPLETED:       { label: 'Connection Completed',   short: 'Completed',         cls: 'b-green' },
}

export const statusLabel = (c) => (STATUS[c] || { label: c }).label
export const statusCls = (c) => (STATUS[c] || { cls: 'b-gray' }).cls

// Customer-facing journey timeline derived from an application's status
export function journey(app) {
  const order = ['SUBMITTED', 'PAID', 'REVIEW', 'APPROVED', 'SCHEDULED', 'COMPLETED']
  // map raw status to a stage index
  const idxByStatus = {
    SUBMITTED: 0, PAYMENT_PENDING: 0, PAID: 1, REVIEW: 2, VERIFIED: 2,
    APPROVED: 3, NOT_APPROVED: 3, SCHEDULED: 4, COMPLETED: 5,
  }
  const active = idxByStatus[app.status] ?? 0
  const stages = [
    { t: 'Application Submitted', icon: 'file', desc: 'Created on MyPNG and pushed to Gasonet CGD (status SUBMITTED).' },
    { t: 'Payment Successful', icon: 'card', desc: 'Security deposit & charges received. Application sent for review.' },
    { t: 'Under Verification', icon: 'eye', desc: 'Documents under review by the Gasonet CGD officer (REVIEW).' },
    { t: app.status === 'NOT_APPROVED' ? 'Not Approved' : 'Approved', icon: app.status === 'NOT_APPROVED' ? 'x' : 'check', desc: app.status === 'NOT_APPROVED' ? 'Application returned by officer. See remarks.' : 'Officer decision APPROVED. PNG ID generated in CGD-OS.' },
    { t: 'Connection Scheduled', icon: 'calendar', desc: 'Installation slot confirmed with the field crew.' },
    { t: 'Connection Completed', icon: 'flame', desc: 'Meter installed, JMR signed and gas supply activated.' },
  ]
  return { stages, active, order }
}
