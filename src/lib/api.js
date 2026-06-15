// ════════ Frontend API client ════════
// Talks to the Express + SQLite backend (via Vite proxy /api → :4000).
const TOKEN_KEY = 'cgd_token'
const USER_KEY = 'cgd_user'

export const session = {
  token: () => localStorage.getItem(TOKEN_KEY),
  user: () => { try { return JSON.parse(localStorage.getItem(USER_KEY) || 'null') } catch { return null } },
  isStaff: () => session.user()?.type === 'staff' || session.user()?.empId,
  set: (token, user) => { localStorage.setItem(TOKEN_KEY, token); localStorage.setItem(USER_KEY, JSON.stringify(user)) },
  clear: () => { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY) },
}

// Dev: empty → '/api' hits the Vite proxy (→ :4000).
// Prod: set VITE_API_BASE to the deployed backend origin (e.g. https://cgd-api.onrender.com).
const BASE = import.meta.env.VITE_API_BASE || ''

async function req(path, { method = 'GET', body } = {}) {
  const res = await fetch(BASE + '/api' + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(session.token() ? { Authorization: 'Bearer ' + session.token() } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Request failed (' + res.status + ')')
  return data
}

export const api = {
  // auth
  staffLogin: (email, password) => req('/auth/staff/login', { method: 'POST', body: { email, password } }),
  requestOtp: (mobile) => req('/auth/customer/request-otp', { method: 'POST', body: { mobile } }),
  verifyOtp: (mobile, otp) => req('/auth/customer/verify-otp', { method: 'POST', body: { mobile, otp } }),
  // applications
  applications: () => req('/applications'),
  createApplication: (d) => req('/applications', { method: 'POST', body: d }),
  payApplication: (png, info) => req(`/applications/${png}/pay`, { method: 'POST', body: info }),
  decideApplication: (png, decision, remarks, docs) => req(`/applications/${png}/decide`, { method: 'POST', body: { decision, remarks, docs } }),
  advanceApplication: (png, to) => req(`/applications/${png}/advance`, { method: 'POST', body: { to } }),
  // schedule + readings
  schedule: () => req('/schedule'),
  submitReading: (pngId, payload) => req(`/schedule/${pngId}/reading`, { method: 'POST', body: payload }),
  // bills
  bills: () => req('/bills'),
  billAction: (id, action, body) => req(`/bills/${id}/${action}`, { method: 'POST', body }),
  // collections
  collections: () => req('/collections'),
  collectionAction: (inv, action, body) => req(`/collections/${inv}/${action}`, { method: 'POST', body }),
  // complaints
  complaints: () => req('/complaints'),
  updateComplaint: (id, changes) => req(`/complaints/${id}/update`, { method: 'POST', body: changes }),
  // customers
  customers: () => req('/customers'),
  setCycle: (pngId, cycle) => req(`/customers/${pngId}/cycle`, { method: 'POST', body: { cycle } }),
  // staff
  staff: () => req('/staff'),
  inviteStaff: (d) => req('/staff/invite', { method: 'POST', body: d }),
  updateStaff: (empId, changes) => req(`/staff/${empId}/update`, { method: 'POST', body: changes }),
  suspendStaff: (empId) => req(`/staff/${empId}/suspend`, { method: 'POST' }),
  // demo
  resetDemo: () => req('/admin/reset', { method: 'POST' }),
  // customer self-service
  myBills: () => req('/me/bills'),
  myComplaints: () => req('/me/complaints'),
  raiseComplaint: (d) => req('/me/complaints', { method: 'POST', body: d }),
}
