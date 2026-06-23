import { useState } from 'react'
import { Routes, Route, Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom'
import { Icon } from '../../lib/icons.jsx'
import { Modal, Confirm } from '../../components/ui.jsx'
import { useApps } from '../../lib/store.js'
import { auth } from './auth.js'
import { USER } from './data.js'
import { USE_REAL_MYPNG, MYPNG_URL } from '../../config.js'
import Login from './Login.jsx'
import Dashboard from './Dashboard.jsx'
import Onboarding from './Onboarding.jsx'
import Applications from './Applications.jsx'
import Payment from './Payment.jsx'
import Success from './Success.jsx'
import Status from './Status.jsx'
import Bills from './Bills.jsx'
import Consumption from './Consumption.jsx'
import Profile from './Profile.jsx'
import Notifications from './Notifications.jsx'
import Support from './Support.jsx'
import Tickets from './Tickets.jsx'
import Components from './Components.jsx'

const initials = USER.name.split(' ').map((w) => w[0]).join('').slice(0, 2)

const NAV = [
  { sec: 'Overview', items: [{ to: '/customer', label: 'Dashboard', icon: 'home', end: true }] },
  { sec: 'My Connections', items: [
    { to: '/customer/applications', label: 'My Applications', icon: 'file' },
    { to: '/customer/bills', label: 'Bills & Payments', icon: 'receipt' },
    { to: '/customer/consumption', label: 'Consumption History', icon: 'bar' },
  ] },
  { sec: 'Account', items: [
    { to: '/customer/profile', label: 'Profile & KYC', icon: 'users' },
    { to: '/customer/notifications', label: 'Notifications', icon: 'bell', pill: '2' },
    { to: '/customer/support', label: 'Support', icon: 'phone' },
    { to: '/customer/tickets', label: 'Tickets History', icon: 'inbox' },
  ] },
  { sec: 'Design', items: [{ to: '/customer/components', label: 'UI Components', icon: 'grid' }] },
]

const CRUMB = {
  '/customer': ['home', 'Dashboard', 'Your CGD connections overview'],
  '/customer/onboarding': ['leaf', 'New PNG Connection', 'Customer onboarding via MyPNG'],
  '/customer/applications': ['file', 'My Applications', 'Connection requests · status · payment'],
  '/customer/payment': ['card', 'Payment', 'Complete payment for your application'],
  '/customer/success': ['check', 'Payment Successful', 'Receipt & confirmation'],
  '/customer/status': ['map', 'Application Status', 'Track your connection journey'],
  '/customer/bills': ['receipt', 'Bills & Payments', 'Invoices, receipts & payment history'],
  '/customer/consumption': ['bar', 'Consumption History', 'PNG usage & bill amount trends'],
  '/customer/profile': ['users', 'Profile & KYC', 'Account details synced with PNGRB'],
  '/customer/notifications': ['bell', 'Notifications', 'Updates on applications & payments'],
  '/customer/support': ['phone', 'Support', 'Help, contact & grievances'],
  '/customer/tickets': ['inbox', 'Tickets History', 'Your queries & grievances'],
  '/customer/components': ['grid', 'UI Components', 'Design system reference'],
}
function crumbFor(path) {
  if (CRUMB[path]) return CRUMB[path]
  const base = '/' + path.split('/').slice(1, 3).join('/')
  return CRUMB[base] || CRUMB['/customer']
}

function ConfirmRedirect({ onContinue, onCancel }) {
  return (
    <Modal title="Redirect to MyPNG Portal" icon="link" onClose={onCancel}
      footer={<>
        <button className="btn btn-light" onClick={onCancel}>Cancel</button>
        <button className="btn btn-primary" onClick={onContinue}>Continue to MyPNG <Icon name="arrowR" size={15} /></button>
      </>}>
      You'll be securely redirected to the <b>MyPNG national portal</b> to fill in your application details and complete eKYC.
      Once submitted, you'll automatically return to the Gasonet CGD Portal to make your payment.
      <div className="alert alert-info" style={{ marginTop: 16 }}><Icon name="lock" size={18} /><div>Your session is encrypted (OAuth 2.0). No payment is taken on MyPNG — only on this portal.</div></div>
    </Modal>
  )
}

function Layout() {
  const nav = useNavigate()
  const loc = useLocation()
  const apps = useApps()
  const [confirm, setConfirm] = useState(false)
  const [logoutAsk, setLogoutAsk] = useState(false)
  const doLogout = () => { setLogoutAsk(false); auth.logout(); nav('/') }
  const onApply = () => setConfirm(true)
  const goToMyPng = () => {
    setConfirm(false)
    if (USE_REAL_MYPNG) window.location.href = MYPNG_URL  // real MyPNG portal
    else nav('/mypng')                                    // bundled in-app recreation
  }
  const crumb = crumbFor(loc.pathname)
  const appCount = apps.length
  const isActive = (it) => it.end ? loc.pathname === it.to : loc.pathname.startsWith(it.to)

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="sb-brand">
          <div className="sb-logo"><Icon name="leaf" size={21} style={{ color: '#fff' }} /></div>
          <div><div className="sb-name">CGD<b> Portal</b></div><div className="sb-tag">Gasonet · MyPNG</div></div>
        </div>
        <div className="sb-scroll">
          {NAV.map((g) => (
            <div key={g.sec}>
              <div className="sb-sec">{g.sec}</div>
              {g.items.map((it) => (
                <button key={it.label} className={'sb-item' + (it.to && isActive(it) ? ' active' : '')}
                  onClick={() => (it.action === 'apply' ? onApply() : nav(it.to))}>
                  <Icon name={it.icon} size={17} /><span className="lbl">{it.label}</span>
                  {it.to === '/customer/applications' && <span className="pill">{appCount}</span>}
                  {it.pill && <span className="pill">{it.pill}</span>}
                </button>
              ))}
            </div>
          ))}
        </div>
        <div className="sb-foot">
          <div className="sb-user" onClick={() => setLogoutAsk(true)} title="Sign out">
            <div className="sb-ava">{initials}</div>
            <div style={{ flex: 1, minWidth: 0 }}><div className="nm">{USER.name}</div><div className="rl">Bikaner GA · Customer</div></div>
            <Icon name="logout" size={16} style={{ color: 'rgba(255,255,255,.4)' }} />
          </div>
        </div>
      </aside>
      <div className="main-area">
        <div className="topbar">
          <div className="tb-crumb"><div className="ic"><Icon name={crumb[0]} size={18} /></div><div><h2>{crumb[1]}</h2><p>{crumb[2]}</p></div></div>
          <div className="tb-right">
            <div className="tb-search"><Icon name="search" size={15} /><input placeholder="Search by PNG ID…" aria-label="Search applications by PNG ID" /></div>
            <span className="tb-env" title="Connected to production">LIVE</span>
            <button className="tb-icon-btn" aria-label="Notifications, 2 unread" onClick={() => nav('/customer/notifications')}><Icon name="bell" size={17} /><span className="tb-badge">2</span></button>
            <button className="tb-icon-btn" aria-label="Settings & profile" onClick={() => nav('/customer/profile')}><Icon name="settings" size={17} /></button>
            <div className="sb-ava" style={{ borderRadius: 9, cursor: 'pointer' }} onClick={() => nav('/customer/profile')}>{initials}</div>
            <button className="tb-icon-btn" aria-label="Logout" title="Logout" onClick={() => setLogoutAsk(true)}><Icon name="logout" size={17} /></button>
          </div>
        </div>
        <div className="canvas"><Outlet context={{ onApply }} /></div>
      </div>
      {confirm && <ConfirmRedirect onCancel={() => setConfirm(false)} onContinue={goToMyPng} />}
      {logoutAsk && (
        <Confirm title="Sign out?" icon="logout" tone="danger" confirmLabel="Sign out" confirmIcon="logout"
          onClose={() => setLogoutAsk(false)} onConfirm={doLogout}>
          You'll be signed out of the Gasonet CGD Portal and returned to the platform launchpad.
          You can sign back in any time with your registered mobile number.
        </Confirm>
      )}
    </div>
  )
}

export default function CustomerApp() {
  const [authed, setAuthed] = useState(auth.isAuthed())
  if (!authed) return <Login onLogin={() => setAuthed(true)} />
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="onboarding" element={<Onboarding />} />
        <Route path="applications" element={<Applications />} />
        <Route path="payment/:png" element={<Payment />} />
        <Route path="payment" element={<Payment />} />
        <Route path="success/:png" element={<Success />} />
        <Route path="status/:png" element={<Status />} />
        <Route path="status" element={<Status />} />
        <Route path="bills" element={<Bills />} />
        <Route path="consumption" element={<Consumption />} />
        <Route path="profile" element={<Profile />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="support" element={<Support />} />
        <Route path="tickets" element={<Tickets />} />
        <Route path="components" element={<Components />} />
        <Route path="*" element={<Navigate to="/customer" replace />} />
      </Route>
    </Routes>
  )
}
