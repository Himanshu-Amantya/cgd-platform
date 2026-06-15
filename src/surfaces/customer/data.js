export const USER = {
  name: 'Neel Kumar', mobile: '+91 98765 43210', email: 'neel.k@gmail.com',
  address: 'Plot 14, Rani Bazar, Bikaner 334001', since: 'Mar 2025', pngId: 'PNG-2026-000412',
}

// Three SD / payment schemes CGDs offer for a new PNG connection
export const SCHEMES = [
  { id: 'upfront', name: 'One-Time Payment', tag: 'One-time', tagCls: 'b-blue',
    sdLabel: 'Security Deposit (refundable)', sd: 5000, chargeLabel: 'Installation Charges', charge: 1180,
    payNow: 6180, recur: null, desc: 'Pay the full refundable security deposit + installation charges once at registration.' },
  { id: 'emi', name: 'Installment Option', tag: 'Low upfront', tagCls: 'b-purple',
    sdLabel: 'Security Deposit (part now)', sd: 1000, chargeLabel: 'Installation Charges', charge: 1180,
    payNow: 2180, recur: '₹500 / bill', recurNote: 'Balance security deposit of ₹4,000 recovered as ₹500 per bill over later cycles.',
    desc: 'Pay a small amount now; balance security deposit in easy EMIs on your gas bills.' },
  { id: 'rental', name: 'Rental / FDC', tag: 'No big deposit', tagCls: 'b-teal',
    sdLabel: 'Security Deposit', sd: 0, chargeLabel: 'One-time Registration Fee', charge: 590,
    payNow: 590, recur: '₹150 / month', recurNote: 'No large deposit — a small monthly rental / fixed daily charge is added to your bill.',
    desc: 'Minimal initial cost; pay a small one-time fee plus monthly rental or fixed daily charge.' },
]
export const CONV_FEE = 120

export const BILLS = [
  { id: 'INV2505117', cycle: 'May 2026', units: 88, total: 4794, status: 'Due', cls: 'b-amber', date: '28 May' },
  { id: 'INV2504098', cycle: 'Apr 2026', units: 81, total: 4380, status: 'Paid', cls: 'b-green', date: '27 Apr' },
  { id: 'INV2503072', cycle: 'Mar 2026', units: 92, total: 4980, status: 'Paid', cls: 'b-green', date: '28 Mar' },
]
export const PAYMENTS = [
  { id: 'TXN98120341', for: 'INV2504098', amt: 4380, mode: 'UPI', date: '02 May 2026' },
  { id: 'TXN98119522', for: 'INV2503072', amt: 4980, mode: 'UPI', date: '04 Apr 2026' },
  { id: 'TXN98117174', for: 'Security Deposit', amt: 5000, mode: 'NEFT', date: '12 Mar 2026' },
]
// Consumption history series per range — units (m³) and bill amount (₹).
// rate ≈ ₹54 / m³ used to derive amount where needed.
export const CONSUMPTION = {
  daily:   [['08 Jun', 3.1], ['09 Jun', 2.8], ['10 Jun', 3.4], ['11 Jun', 2.6], ['12 Jun', 3.0], ['13 Jun', 3.6], ['14 Jun', 2.9]],
  weekly:  [['W1', 19.4], ['W2', 21.2], ['W3', 18.7], ['W4', 22.5]],
  monthly: [['Jan', 78], ['Feb', 74], ['Mar', 92], ['Apr', 81], ['May', 88], ['Jun', 69]],
  yearly:  [['2022', 910], ['2023', 980], ['2024', 1040], ['2025', 1115], ['2026', 482]],
}
export const GAS_RATE = 54 // ₹ per m³ (indicative)

// Support tickets raised by the customer — history with current status.
export const TICKETS = [
  { id: 'CMP60412', category: 'Billing', subject: 'May 2026 bill seems higher than usual', status: 'In Progress', cls: 'b-blue', raised: '12 Jun 2026', updated: '13 Jun 2026',
    detail: 'Your May consumption was 88 m³ vs an average of ~81 m³. Our billing team is verifying the meter reading and will respond within the SLA window.' },
  { id: 'CMP60388', category: 'Payment / Refund', subject: 'UPI payment debited but not reflected', status: 'Resolved', cls: 'b-green', raised: '02 May 2026', updated: '03 May 2026',
    detail: 'Payment TXN98120341 of ₹4,380 was reconciled against invoice INV2504098. Receipt has been emailed to you.' },
  { id: 'CMP60201', category: 'New Connection / Application', subject: 'Status of my new PNG connection', status: 'Closed', cls: 'b-gray', raised: '14 Mar 2026', updated: '16 Mar 2026',
    detail: 'Your connection PNG-2026-000412 was scheduled and installed. Ticket closed after confirmation.' },
]

export const KYC = [
  ['Aadhaar Card', 'eKYC AUTO_APPROVED via UIDAI', true],
  ['PAN Card', 'PAN_neel.pdf · verified', true],
  ['Address Proof — Electricity Bill', 'electricity_apr.pdf · verified', true],
  ['Premise Ownership Declaration', 'self-declared · owner', true],
]
