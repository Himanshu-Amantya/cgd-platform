export const inr = (n) => '₹' + Number(n || 0).toLocaleString('en-IN')

export const initials = (name = '') =>
  name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()

export const fmtDate = (d = new Date()) =>
  new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

export const fmtDateTime = (d = new Date()) =>
  new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

const AV = ['#1A4FA0', '#16A34A', '#7C3AED', '#EA580C', '#0D9488', '#D97706', '#2563EB']
export const avatarColor = (seed = '') => AV[(seed.charCodeAt(0) || 0) % AV.length]
