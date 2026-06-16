// Demo data — mirrors web customer portal
export const MOCK_USER = {
  name: 'Rahul Sharma',
  mobile: '+91 98765 43210',
  pngId: 'PNG-2026-000412',
  category: 'Domestic',
  ga: 'Bikaner GA',
  area: 'Rani Bazar',
  status: 'Active',
  cycle: 'Cycle A',
}

export const MOCK_BILLS = [
  { id: 'INV2506412', period: 'Jun 2026', prev: 88, cur: 97, units: 9, rate: 54, fixed: 90, amount: 576, dueDate: '10 Jun 2026', status: 'DUE', paid: false },
  { id: 'INV2505117', period: 'May 2026', prev: 79, cur: 88, units: 9, rate: 54, fixed: 90, amount: 576, dueDate: '10 May 2026', status: 'OVERDUE', paid: false },
  { id: 'INV2504098', period: 'Apr 2026', prev: 70, cur: 79, units: 9, rate: 54, fixed: 90, amount: 576, dueDate: '10 Apr 2026', status: 'PAID', paid: true },
  { id: 'INV2503081', period: 'Mar 2026', prev: 61, cur: 70, units: 9, rate: 54, fixed: 90, amount: 576, dueDate: '10 Mar 2026', status: 'PAID', paid: true },
]

export const MOCK_COMPLAINTS = [
  { id: 'CMP60412', subject: 'May 2026 bill seems higher than usual', category: 'Billing', status: 'OPEN', raised: '12 Jun 2026', detail: 'The May invoice appears higher than my average monthly bill. Please verify.' },
  { id: 'CMP60201', subject: 'Status of new PNG connection', category: 'Connection', status: 'CLOSED', raised: '14 Mar 2026', detail: 'Query on installation timeline for new connection.' },
]

export const COMPLAINT_CATEGORIES = ['Billing', 'Metering', 'Connection', 'Payment', 'Other']
