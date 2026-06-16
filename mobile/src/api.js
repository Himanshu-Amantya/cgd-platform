import * as SecureStore from 'expo-secure-store'

const BASE = 'https://cgd-api.onrender.com' // set to your deployed backend

export const session = {
  token:   () => SecureStore.getItemAsync('cgd_token'),
  user:    () => SecureStore.getItemAsync('cgd_user').then(v => v ? JSON.parse(v) : null),
  set:     (token, user) => Promise.all([
    SecureStore.setItemAsync('cgd_token', token),
    SecureStore.setItemAsync('cgd_user', JSON.stringify(user)),
  ]),
  clear:   () => Promise.all([
    SecureStore.deleteItemAsync('cgd_token'),
    SecureStore.deleteItemAsync('cgd_user'),
  ]),
}

async function req(path, opts = {}) {
  const token = await session.token()
  const res = await fetch(BASE + '/api' + path, {
    method: opts.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: 'Bearer ' + token } : {}),
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Request failed (' + res.status + ')')
  return data
}

export const api = {
  requestOtp: (mobile) => req('/auth/customer/request-otp', { method: 'POST', body: { mobile } }),
  verifyOtp:  (mobile, otp) => req('/auth/customer/verify-otp', { method: 'POST', body: { mobile, otp } }),
  myBills:    () => req('/me/bills'),
  myComplaints: () => req('/me/complaints'),
  raiseComplaint: (d) => req('/me/complaints', { method: 'POST', body: d }),
}
