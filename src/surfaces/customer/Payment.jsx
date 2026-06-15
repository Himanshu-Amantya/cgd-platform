import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Icon } from '../../lib/icons.jsx'
import { Panel, StatusChip, Badge, Crumbs, KV, Empty, onActivate } from '../../components/ui.jsx'
import { useToast } from '../../components/Toast.jsx'
import { useApps, Store } from '../../lib/store.js'
import { inr } from '../../lib/format.js'
import { SCHEMES, CONV_FEE } from './data.js'

const METHODS = [
  ['upi', 'UPI', 'GPay · PhonePe · Paytm', 'qr'],
  ['card', 'Credit / Debit Card', 'Visa · Mastercard · RuPay', 'card'],
  ['nb', 'Net Banking', 'All major banks', 'wallet'],
  ['neft', 'NEFT / RTGS', 'Bank transfer', 'receipt'],
]

export default function Payment() {
  const nav = useNavigate()
  const toast = useToast()
  const { png } = useParams()
  const apps = useApps()
  const app = apps.find((a) => a.png === png) || apps.find((a) => !a.paid)
  const [schemeId, setSchemeId] = useState('upfront')
  const [method, setMethod] = useState('upi')
  const [agree, setAgree] = useState(false)

  if (!app) return (
    <div className="page" style={{ maxWidth: 640 }}>
      <Panel><Empty icon="check" title="Nothing to pay">All your applications are paid. Track them from My Applications.
        <div style={{ marginTop: 14 }}><button className="btn btn-primary btn-sm" onClick={() => nav('/customer/applications')}>My Applications</button></div></Empty></Panel>
    </div>
  )

  const sc = SCHEMES.find((s) => s.id === schemeId)
  const total = sc.payNow + CONV_FEE
  const proceed = async () => {
    const txnId = 'TXN' + Math.floor(5000000000 + Math.random() * 4000000000)
    const receipt = 'RCPT-2026-' + String(Math.floor(100 + Math.random() * 899))
    toast({ tone: 'green', title: 'Payment authorised', msg: 'Processing ' + inr(total) + ' via ' + method.toUpperCase() })
    await Store.pay(app.png, { scheme: sc.name, total, recur: sc.recur, txnId, receipt })
    nav('/customer/success/' + app.png)
  }

  return (
    <div className="page" style={{ maxWidth: 1060 }}>
      <Crumbs items={[{ label: 'Dashboard', onClick: () => nav('/customer') }, { label: 'Applications', onClick: () => nav('/customer/applications') }, { label: 'Payment' }]} />
      <div className="phead">
        <div><h1>Complete your payment</h1><p>Your application was submitted on MyPNG. Choose a deposit scheme and pay to send it for verification.</p></div>
        <Badge cls="b-green" dot>Returned from MyPNG</Badge>
      </div>
      <div className="alert alert-green" style={{ marginBottom: 20 }}><Icon name="check" size={18} /><div><b>Application received from MyPNG.</b> Reference <span className="mono">{app.png}</span> · please pay within 72 hours to avoid cancellation.</div></div>
      <div className="grid-2" style={{ alignItems: 'start' }}>
        <Panel title="Application Summary" icon="file" sub="Synced from MyPNG · PNGRB registry">
          <KV k="PNG ID (Application No.)"><span className="mono">{app.png}</span></KV>
          <KV k="Applicant Name">{app.name}</KV>
          <KV k="Mobile Number"><span className="mono">{app.mobile}</span></KV>
          <KV k="Email">{app.email}</KV>
          <KV k="Connection Type">{app.connType}</KV>
          <KV k="eKYC Status"><span style={{ color: 'var(--green)' }}>{app.ekyc} ✓</span></KV>
          <KV k="Application Status"><StatusChip code="PAYMENT_PENDING" /></KV>
          <KV k="Submission Date">{app.submitted}</KV>
        </Panel>
        <Panel title="Payment Details" icon="wallet">
          <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--g600)', marginBottom: 10 }}>Choose a Deposit Scheme</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 18 }} role="radiogroup" aria-label="Choose a deposit scheme">
            {SCHEMES.map((s) => (
              <div key={s.id} className={'pm' + (schemeId === s.id ? ' on' : '')} style={{ alignItems: 'flex-start' }}
                role="radio" aria-checked={schemeId === s.id} tabIndex={0}
                onClick={() => setSchemeId(s.id)} onKeyDown={onActivate(() => setSchemeId(s.id))}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span className="pmt">{s.name}</span><Badge cls={s.tagCls}>{s.tag}</Badge></div>
                  <div className="pms" style={{ marginTop: 3, lineHeight: 1.45 }}>{s.desc}</div>
                  <div style={{ marginTop: 6, fontSize: 12, fontWeight: 700, color: 'var(--g800)' }}>Pay now {inr(s.payNow)}{s.recur && <span style={{ fontWeight: 600, color: 'var(--g500)' }}> · then {s.recur}</span>}</div>
                </div>
                <div className="pmr" style={{ marginTop: 3 }} />
              </div>
            ))}
          </div>
          <KV k={sc.sdLabel}><span className="mono">{inr(sc.sd)}</span></KV>
          <KV k={sc.chargeLabel}><span className="mono">{inr(sc.charge)}</span></KV>
          <KV k="Convenience Fee"><span className="mono">{inr(CONV_FEE)}</span></KV>
          {sc.recur && <KV k="Recurring (added to bill)"><span style={{ color: 'var(--purple)' }}>{sc.recur}</span></KV>}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 13, marginTop: 6, borderTop: '2px solid var(--g200)' }}>
            <span style={{ fontSize: 15, fontWeight: 800 }}>Total Payable Now</span><span className="mono" style={{ fontSize: 20, fontWeight: 800, color: 'var(--blue)' }}>{inr(total)}</span>
          </div>
          {sc.recurNote && <div className="alert alert-info" style={{ marginTop: 12, fontSize: 11.5, padding: '10px 12px' }}><Icon name="info" size={16} /><div>{sc.recurNote}</div></div>}
          <div style={{ margin: '18px 0 10px', fontSize: 11.5, fontWeight: 700, color: 'var(--g600)' }}>Select Payment Method</div>
          <div className="pm-grid" role="radiogroup" aria-label="Select payment method">
            {METHODS.map((m) => (
              <div key={m[0]} className={'pm' + (method === m[0] ? ' on' : '')}
                role="radio" aria-checked={method === m[0]} tabIndex={0}
                onClick={() => setMethod(m[0])} onKeyDown={onActivate(() => setMethod(m[0]))}>
                <div className="pmic"><Icon name={m[3]} size={17} /></div>
                <div style={{ minWidth: 0 }}><div className="pmt">{m[1]}</div><div className="pms">{m[2]}</div></div><div className="pmr" />
              </div>
            ))}
          </div>
          <div style={{ margin: '18px 0' }} className={'chk' + (agree ? ' on' : '')}
            role="checkbox" aria-checked={agree} tabIndex={0}
            onClick={() => setAgree((v) => !v)} onKeyDown={onActivate(() => setAgree((v) => !v))}>
            <div className="box">{agree && <Icon name="check" size={12} />}</div>
            <div>I agree to the <b style={{ color: 'var(--blue-mid)' }}>Terms &amp; Conditions</b>, refund policy and PNGRB tariff schedule for new connections.</div>
          </div>
          <button className="btn btn-green btn-block btn-lg" disabled={!agree} onClick={proceed}><Icon name="lock" size={16} />Proceed to Payment · {inr(total)}</button>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 14, fontSize: 11, color: 'var(--g400)', fontWeight: 600 }}><Icon name="shield" size={13} />Secured by Razorpay / PayU · PCI-DSS</div>
        </Panel>
      </div>
    </div>
  )
}
