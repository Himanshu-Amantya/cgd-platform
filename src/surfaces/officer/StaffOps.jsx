import { useState } from 'react'
import { Icon } from '../../lib/icons.jsx'
import { Panel, Badge, Drawer, Modal, KV, Empty, SearchSelect } from '../../components/ui.jsx'
import { useToast } from '../../components/Toast.jsx'
import { METERS, WORK_ORDERS, WO_TYPES, CUSTOMERS } from './staffData.js'
import { BillingStore, useSchedule } from '../../lib/billingStore.js'

const Req = () => <span className="req">*</span>

/* ════════ Meter Operations ════════ */
export function MeterOperations() {
  const toast = useToast()
  const [q, setQ] = useState('')
  const [view, setView] = useState(null)   // meter to view connection
  const [logFor, setLogFor] = useState(null) // meter to log installation
  const rows = METERS.filter((m) => (m.name + m.pngId + m.meterNo).toLowerCase().includes(q.toLowerCase()))

  return (
    <div className="page wide">
      <div className="phead"><div><h1>Meter Operations</h1><p>Meter inventory, connections and field installation logs.</p></div></div>
      <div className="filterbar">
        <div className="fsearch"><Icon name="search" size={15} /><input placeholder="Search meter no, customer or PNG ID…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
      </div>
      <div className="card"><div className="tbl-wrap"><table className="tbl">
        <thead><tr><th>Meter No.</th><th>Customer Name</th><th>PNG ID</th><th>Area</th><th>Status</th><th>Last Reading</th><th>Actions</th></tr></thead>
        <tbody>{rows.map((m) => (
          <tr key={m.meterNo}>
            <td className="mono strong" style={{ fontSize: 12 }}>{m.meterNo}</td>
            <td className="strong">{m.name}</td>
            <td className="mono" style={{ fontSize: 12 }}>{m.pngId}</td>
            <td style={{ color: 'var(--g500)' }}>{m.area}</td>
            <td><Badge cls={m.status === 'Installed' ? 'b-green' : 'b-amber'} dot>{m.status}</Badge></td>
            <td className="mono">{m.lastReading ? m.lastReading + ' m³' : '—'}</td>
            <td><div className="row-actions">
              <button className="btn btn-light btn-sm" onClick={() => setView(m)}><Icon name="eye" size={13} />View Connection</button>
              <button className="btn btn-soft btn-sm" onClick={() => setLogFor(m)}><Icon name="wrench" size={13} />Log Installation</button>
            </div></td>
          </tr>
        ))}</tbody>
      </table>{rows.length === 0 && <Empty title="No meters found" />}</div></div>

      {view && (
        <Drawer title={<span className="mono">{view.meterNo}</span>} sub={view.name + ' · ' + view.pngId} onClose={() => setView(null)}>
          <Panel title="Connection Details" icon="gauge">
            <KV k="Meter Number"><span className="mono">{view.meterNo}</span></KV>
            <KV k="Customer Name">{view.name}</KV>
            <KV k="PNG ID"><span className="mono">{view.pngId}</span></KV>
            <KV k="Area / Locality">{view.area}</KV>
            <KV k="Status"><Badge cls={view.status === 'Installed' ? 'b-green' : 'b-amber'} dot>{view.status}</Badge></KV>
            <KV k="Last Reading"><span className="mono">{view.lastReading ? view.lastReading + ' m³' : '—'}</span></KV>
            <KV k="Installed On">{view.installedOn}</KV>
          </Panel>
          <div className="alert alert-info"><Icon name="info" size={18} /><div>Connection record is read-only here. Use <b>Log Installation</b> to record a new field installation.</div></div>
        </Drawer>
      )}

      {logFor && <LogInstallation meter={logFor} onClose={() => setLogFor(null)} />}
    </div>
  )
}

/* ════════ Log Installation + JMR Sign-off (field engineer → customer OTP) ════════ */
function maskMobile(m) {
  const d = (m || '').replace(/\D/g, '')
  if (d.length < 4) return '+91 ••••• •••••'
  const last10 = (d.slice(0, -4) + '••••').slice(-10)   // keep all but last 4 digits, mask the rest
  return '+91 ' + last10.slice(0, 5) + ' ' + last10.slice(5)
}

function LogInstallation({ meter, onClose }) {
  const toast = useToast()
  const cust = CUSTOMERS.find((c) => c.pngId === meter.pngId)
  const mobile = cust?.mobile || '+91 98290 00000'
  const [step, setStep] = useState('details')   // details → jmr → done
  const [form, setForm] = useState({ date: '2026-06-14', initial: '', engineer: '', seal: '', remarks: '' })
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const detailsValid = form.engineer.trim() && form.initial !== ''
  const [sent, setSent] = useState(false)
  const [otp, setOtp] = useState('')
  const otpValid = otp.length === 6

  const sendOtp = () => { setSent(true); toast({ tone: 'blue', title: 'JMR OTP sent', msg: 'One-time code sent to ' + maskMobile(mobile) }) }
  const signOff = () => {
    toast({ tone: 'green', title: 'JMR signed off ✓', msg: meter.pngId + ' · verified via customer OTP' })
    setStep('done')
  }

  const footer = step === 'details'
    ? (<><button className="btn btn-light" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" disabled={!detailsValid} onClick={() => setStep('jmr')}>Proceed to JMR Sign-off <Icon name="arrowR" size={15} /></button></>)
    : step === 'jmr'
    ? (<><button className="btn btn-light" onClick={() => setStep('details')}><Icon name="arrowL" size={15} />Back</button>
        <button className="btn btn-green" disabled={!otpValid} onClick={signOff}><Icon name="check" size={15} />Confirm JMR Sign-off</button></>)
    : (<button className="btn btn-primary" onClick={onClose}><Icon name="check" size={15} />Done</button>)

  return (
    <Modal title={step === 'done' ? 'Installation Complete' : 'Log Installation'} icon={step === 'done' ? 'check' : 'wrench'} onClose={onClose} footer={footer}>
      {step === 'details' && (
        <>
          <div className="grid-2">
            <div className="fgroup"><label className="flabel">Meter Number <Req /></label><input className="finput" defaultValue={meter.meterNo} /></div>
            <div className="fgroup"><label className="flabel">PNG ID <Req /></label><input className="finput" defaultValue={meter.pngId} /></div>
            <div className="fgroup"><label className="flabel">Installation Date <Req /></label><input className="finput" type="date" value={form.date} onChange={(e) => set('date', e.target.value)} /></div>
            <div className="fgroup"><label className="flabel">Initial Reading <Req /></label><input className="finput mono" inputMode="numeric" placeholder="0" value={form.initial} onChange={(e) => set('initial', e.target.value.replace(/[^\d.]/g, ''))} /></div>
            <div className="fgroup"><label className="flabel">Field Engineer <Req /></label><input className="finput" placeholder="Engineer name" value={form.engineer} onChange={(e) => set('engineer', e.target.value)} /></div>
            <div className="fgroup"><label className="flabel">Seal Number</label><input className="finput" placeholder="Seal / tag no." value={form.seal} onChange={(e) => set('seal', e.target.value)} /></div>
          </div>
          <div className="fgroup"><label className="flabel">Remarks</label><textarea className="finput" placeholder="JMR notes, site conditions…" value={form.remarks} onChange={(e) => set('remarks', e.target.value)} /></div>
          <div className="alert alert-info" style={{ marginBottom: 0 }}><Icon name="info" size={18} /><div>After recording the installation, the customer signs off the <b>Joint Meter Reading (JMR)</b> on-site using an OTP sent to their registered mobile.</div></div>
        </>
      )}

      {step === 'jmr' && (
        <>
          <div className="card" style={{ background: 'var(--g50)', marginBottom: 16 }}><div className="card-b" style={{ padding: 14 }}>
            <KV k="Customer">{meter.name}</KV>
            <KV k="PNG ID"><span className="mono">{meter.pngId}</span></KV>
            <KV k="Initial Reading"><span className="mono">{form.initial || '0'} m³</span></KV>
            <KV k="Registered Mobile"><span className="mono">{maskMobile(mobile)}</span></KV>
          </div></div>
          <div className="alert alert-info"><Icon name="shield" size={18} /><div>The customer confirms the meter number, seal and initial reading recorded above are correct. Sign-off is captured via a one-time password sent to their registered mobile.</div></div>
          {!sent ? (
            <button className="btn btn-primary btn-block" onClick={sendOtp}><Icon name="send" size={15} />Send OTP to customer</button>
          ) : (
            <div className="fgroup">
              <label className="flabel">Enter customer OTP <Req /></label>
              <input className="finput mono" inputMode="numeric" maxLength={6} placeholder="6-digit code" style={{ fontSize: 18, letterSpacing: 6, textAlign: 'center' }}
                value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11.5, color: 'var(--g400)' }}>
                <span>Sent to {maskMobile(mobile)}</span>
                <button className="btn-link" style={{ background: 'none', border: 'none', color: 'var(--blue-mid)', fontWeight: 600, cursor: 'pointer', fontSize: 11.5 }} onClick={sendOtp}>Resend OTP</button>
              </div>
            </div>
          )}
        </>
      )}

      {step === 'done' && (
        <div style={{ textAlign: 'center', padding: '8px 0' }}>
          <div className="kpi-ic ic-green" style={{ width: 56, height: 56, borderRadius: 16, margin: '0 auto 14px' }}><Icon name="check" size={28} /></div>
          <h3 style={{ margin: '0 0 6px' }}>Installation logged &amp; JMR signed off</h3>
          <p style={{ fontSize: 13, color: 'var(--g500)', margin: '0 0 16px' }}>{meter.pngId} · {meter.name}</p>
          <div className="card" style={{ background: 'var(--g50)', textAlign: 'left' }}><div className="card-b" style={{ padding: 14 }}>
            <KV k="Meter"><span className="mono">{meter.meterNo}</span></KV>
            <KV k="Initial Reading"><span className="mono">{form.initial || '0'} m³</span></KV>
            <KV k="Field Engineer">{form.engineer}</KV>
            <KV k="JMR Sign-off"><Badge cls="b-green" dot>Verified via customer OTP</Badge></KV>
          </div></div>
        </div>
      )}
    </Modal>
  )
}

/* ════════ Submit Meter Reading (Meter Reader) ════════ */
export function MeterReading() {
  const toast = useToast()
  const installed = METERS.filter((m) => m.status === 'Installed')
  const [png, setPng] = useState(installed[0].pngId)
  const [reading, setReading] = useState('')
  const [photo, setPhoto] = useState(null)   // { name, url }
  const sel = METERS.find((m) => m.pngId === png)
  const prev = sel?.lastReading || 0
  const cur = Number(reading) || 0
  const consumption = Math.max(0, cur - prev)
  const valid = reading !== '' && cur >= prev

  const onPhoto = (e) => {
    const f = e.target.files?.[0]
    if (f) setPhoto({ name: f.name, url: URL.createObjectURL(f) })
  }

  const options = installed.map((m) => ({ value: m.pngId, label: m.pngId, sub: m.name + ' · ' + m.meterNo + ' · ' + m.area }))

  const submit = () => {
    toast({ tone: 'green', title: 'Reading submitted', msg: sel.pngId + ' · ' + consumption + ' m³ consumed' + (photo ? ' · photo attached' : '') })
    setReading(''); setPhoto(null)
  }

  return (
    <div className="page" style={{ maxWidth: 640 }}>
      <div className="phead"><div><h1>Submit Meter Reading</h1><p>Manually record a meter reading captured in the field.</p></div></div>
      <Panel title="Manual Reading Entry" icon="gauge">
        <div className="fgroup"><label className="flabel">PNG ID <Req /></label>
          <SearchSelect options={options} value={png} onChange={setPng} placeholder="Search PNG ID, customer or meter…" />
        </div>
        <div className="grid-2">
          <div className="fgroup"><label className="flabel">Customer</label><input className="finput" value={sel ? sel.name : ''} disabled /></div>
          <div className="fgroup"><label className="flabel">Meter No.</label><input className="finput mono" value={sel ? sel.meterNo : ''} disabled /></div>
        </div>
        <div className="grid-2">
          <div className="fgroup"><label className="flabel">Previous Reading (m³)</label><input className="finput mono" value={prev} disabled /></div>
          <div className="fgroup"><label className="flabel">Current Reading (m³) <Req /></label>
            <input className="finput mono" inputMode="numeric" placeholder="Enter reading" value={reading} onChange={(e) => setReading(e.target.value.replace(/[^\d.]/g, ''))} /></div>
        </div>
        {reading !== '' && cur < prev && <div className="alert alert-warn" style={{ marginBottom: 14 }}><Icon name="alert" size={18} /><div>Current reading can't be lower than the previous reading ({prev} m³).</div></div>}
        <div className="fgroup"><label className="flabel">Meter Reading Photo</label>
          {photo ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, border: '1px solid var(--g200)', borderRadius: 10, padding: 10 }}>
              <img src={photo.url} alt="Meter reading" style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--g200)' }} />
              <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 12.5, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{photo.name}</div><div style={{ fontSize: 11, color: 'var(--green)' }}>Attached ✓</div></div>
              <button className="btn btn-light btn-sm" onClick={() => setPhoto(null)}><Icon name="x" size={13} />Remove</button>
            </div>
          ) : (
            <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, border: '1.5px dashed var(--g300)', borderRadius: 10, padding: '18px 12px', cursor: 'pointer', color: 'var(--g500)', background: 'var(--g50)' }}>
              <Icon name="upload" size={20} />
              <span style={{ fontSize: 12.5, fontWeight: 600 }}>Upload meter photo</span>
              <span style={{ fontSize: 11, color: 'var(--g400)' }}>Capture the meter face showing the reading · JPG/PNG</span>
              <input type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={onPhoto} />
            </label>
          )}
        </div>
        <div className="kv" style={{ borderTop: '2px solid var(--g200)', borderBottom: 'none', paddingTop: 12 }}>
          <span className="k" style={{ fontWeight: 700, color: 'var(--g700)' }}>Consumption this cycle</span>
          <span className="v mono" style={{ fontSize: 16, color: 'var(--blue)' }}>{consumption} m³</span>
        </div>
        <button className="btn btn-green btn-block btn-lg" style={{ marginTop: 14 }} disabled={!valid} onClick={submit}><Icon name="check" size={16} />Submit Reading</button>
      </Panel>
    </div>
  )
}

/* ════════ M2 · Reader — Today's Schedule + GPS + discrepancy ════════ */
export function ReadingSchedule() {
  const toast = useToast()
  const stops = useSchedule()
  const [active, setActive] = useState(null)   // stop being recorded
  const cur = active && stops.find((s) => s.pngId === active)
  const done = stops.filter((s) => s.status === 'Done').length
  const flagged = stops.filter((s) => s.status === 'Flagged').length

  const sCls = (s) => (s === 'Done' ? 'b-green' : s === 'Flagged' ? 'b-red' : 'b-amber')
  const record = async (pngId, payload) => {
    const billId = await BillingStore.submitReading(pngId, payload)
    if (payload.flagged) toast({ tone: 'amber', title: 'Reading flagged', msg: pngId + ' · revisit required' })
    else toast({ tone: 'green', title: 'Reading submitted', msg: billId ? 'Draft bill ' + billId + ' generated' : pngId + ' · ' + payload.consumption + ' m³' })
    setActive(null)
  }

  return (
    <div className="page" style={{ maxWidth: 820 }}>
      <div className="phead"><div><h1>Today's Reading Schedule</h1><p>Your meter-reading route for today · {fmtToday()}.</p></div></div>
      <div className="funnel">
        <div className="fn" style={{ cursor: 'default' }}><div className="v">{stops.length}</div><div className="k">Total Stops</div></div>
        <div className="fn" style={{ cursor: 'default' }}><div className="v" style={{ color: 'var(--green)' }}>{done}</div><div className="k">Done</div></div>
        <div className="fn" style={{ cursor: 'default' }}><div className="v" style={{ color: 'var(--amber)' }}>{stops.length - done - flagged}</div><div className="k">Pending</div></div>
        <div className="fn" style={{ cursor: 'default' }}><div className="v" style={{ color: 'var(--red)' }}>{flagged}</div><div className="k">Flagged</div></div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {stops.map((s) => (
          <div key={s.pngId} className="card"><div className="card-b" style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ textAlign: 'center', minWidth: 56 }}><div style={{ fontSize: 12, fontWeight: 800, color: 'var(--g700)' }}>{s.slot}</div><Badge cls={sCls(s.status)} dot>{s.status}</Badge></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700 }}>{s.name} <span className="mono" style={{ fontSize: 11, color: 'var(--g400)', fontWeight: 500 }}>· {s.pngId}</span></div>
              <div style={{ fontSize: 12, color: 'var(--g500)', display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}><Icon name="pin" size={13} />{s.address}</div>
              <div style={{ fontSize: 11.5, color: 'var(--g400)', marginTop: 2 }}>Meter {s.meterNo} · prev {s.prevReading} m³{s.curReading ? ' · now ' + s.curReading + ' m³' : ''}</div>
            </div>
            <button className={'btn btn-sm ' + (s.status === 'Pending' ? 'btn-primary' : 'btn-light')} onClick={() => setActive(s.pngId)}>
              <Icon name={s.status === 'Pending' ? 'gauge' : 'eye'} size={13} />{s.status === 'Pending' ? 'Record' : s.status === 'Flagged' ? 'Re-read' : 'View'}</button>
          </div></div>
        ))}
      </div>
      {cur && <RecordReading stop={cur} onClose={() => setActive(null)} onSave={record} />}
    </div>
  )
}

function fmtToday() {
  return new Date().toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'short' })
}

function RecordReading({ stop, onClose, onSave }) {
  const toast = useToast()
  const [reading, setReading] = useState('')
  const [photo, setPhoto] = useState(null)
  const [gps, setGps] = useState(null)   // { lat, lng } or 'capturing'
  const prev = stop.prevReading
  const cur = Number(reading) || 0
  const consumption = Math.max(0, cur - prev)
  const tooLow = reading !== '' && cur < prev
  // discrepancy: consumption wildly off the customer's average (±60%)
  const abnormal = reading !== '' && !tooLow && (consumption > stop.avg * 1.6 || consumption < stop.avg * 0.4)
  const canSubmit = reading !== '' && !tooLow && photo && gps && gps !== 'capturing'

  const captureGps = () => {
    setGps('capturing')
    const fallback = { lat: 28.0229, lng: 73.3119 }   // demo coords (Bikaner)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (p) => setGps({ lat: p.coords.latitude, lng: p.coords.longitude }),
        () => { setGps(fallback); toast({ tone: 'blue', title: 'GPS (approx)', msg: 'Using approximate location' }) },
        { timeout: 4000 })
    } else setGps(fallback)
  }
  const onPhoto = (e) => { const f = e.target.files?.[0]; if (f) setPhoto({ name: f.name, url: URL.createObjectURL(f) }) }

  const submit = (flag) => onSave(stop.pngId, { flagged: flag, curReading: cur, consumption })

  return (
    <Modal title="Meter Reading" icon="gauge" onClose={onClose}
      footer={<>
        <button className="btn btn-light" onClick={onClose}>Cancel</button>
        {abnormal
          ? <button className="btn btn-soft" disabled={!canSubmit} onClick={() => submit(true)}><Icon name="alert" size={15} />Flag for Revisit</button>
          : <button className="btn btn-green" disabled={!canSubmit} onClick={() => submit(false)}><Icon name="check" size={15} />Submit Reading</button>}
      </>}>
      <div className="card" style={{ background: 'var(--g50)', marginBottom: 16 }}><div className="card-b" style={{ padding: 14 }}>
        <KV k="Customer">{stop.name}</KV><KV k="PNG ID"><span className="mono">{stop.pngId}</span></KV>
        <KV k="Meter"><span className="mono">{stop.meterNo}</span></KV><KV k="Previous Reading"><span className="mono">{prev} m³</span></KV>
      </div></div>
      <div className="fgroup"><label className="flabel">Current Reading (m³) <Req /></label>
        <input className="finput mono" inputMode="numeric" placeholder="Enter reading" value={reading} onChange={(e) => setReading(e.target.value.replace(/[^\d.]/g, ''))} /></div>
      {tooLow && <div className="alert alert-warn"><Icon name="alert" size={18} /><div>Reading can't be lower than the previous reading ({prev} m³).</div></div>}
      {!tooLow && reading !== '' && (
        <div className="kv" style={{ borderBottom: 'none' }}><span className="k" style={{ fontWeight: 700 }}>Consumption</span><span className="v mono" style={{ color: 'var(--blue)' }}>{consumption} m³ <span style={{ color: 'var(--g400)', fontSize: 11 }}>(avg {stop.avg})</span></span></div>
      )}
      {abnormal && <div className="alert alert-amber"><Icon name="alert" size={18} /><div>Consumption is far from this customer's average — looks like a <b>discrepancy</b>. Recheck the meter, or <b>flag for revisit</b>.</div></div>}

      <div className="grid-2" style={{ marginTop: 6 }}>
        <div className="fgroup"><label className="flabel">GPS Location <Req /></label>
          {gps && gps !== 'capturing'
            ? <div className="finput" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--green)' }}><Icon name="pin" size={14} /><span className="mono" style={{ fontSize: 11.5 }}>{gps.lat.toFixed(4)}, {gps.lng.toFixed(4)}</span></div>
            : <button className="btn btn-light btn-block" disabled={gps === 'capturing'} onClick={captureGps}><Icon name="crosshair" size={14} />{gps === 'capturing' ? 'Capturing…' : 'Capture GPS'}</button>}
        </div>
        <div className="fgroup"><label className="flabel">Meter Photo <Req /></label>
          {photo
            ? <div className="finput" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><img src={photo.url} alt="" style={{ width: 24, height: 24, borderRadius: 5, objectFit: 'cover' }} /><span style={{ fontSize: 11.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--green)' }}>Attached ✓</span></div>
            : <label className="btn btn-light btn-block" style={{ cursor: 'pointer' }}><Icon name="upload" size={14} />Camera<input type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={onPhoto} /></label>}
        </div>
      </div>
      {!canSubmit && reading !== '' && !tooLow && <div style={{ fontSize: 11, color: 'var(--g400)', textAlign: 'center' }}>Capture GPS and a meter photo to submit.</div>}
    </Modal>
  )
}

/* ════════ Survey & Work Orders ════════ */
export function WorkOrders() {
  const toast = useToast()
  const [orders, setOrders] = useState(WORK_ORDERS)
  const [create, setCreate] = useState(false)
  const [form, setForm] = useState({ type: WO_TYPES[0], pngId: '', name: '', crew: 'Team A', scheduled: '2026-06-16', priority: 'Medium' })
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const valid = form.pngId && form.name && form.scheduled

  const save = () => {
    const id = 'WO-2026-' + String(Math.floor(400 + Math.random() * 599))
    setOrders((o) => [{ id, ...form, status: 'Open' }, ...o])
    toast({ tone: 'green', title: 'Work order created', msg: id + ' · ' + form.type })
    setCreate(false)
    setForm({ type: WO_TYPES[0], pngId: '', name: '', crew: 'Team A', scheduled: '2026-06-16', priority: 'Medium' })
  }

  const prCls = (p) => (p === 'High' ? 'b-red' : p === 'Medium' ? 'b-amber' : 'b-gray')
  const stCls = (s) => (s === 'Completed' ? 'b-green' : s === 'In Progress' ? 'b-blue' : 'b-amber')

  return (
    <div className="page wide">
      <div className="phead"><div><h1>Survey &amp; Work Orders</h1><p>Site surveys, installations and field jobs for the crew.</p></div>
        <button className="btn btn-primary" onClick={() => setCreate(true)}><Icon name="plus" size={15} />Create Work Order</button></div>
      <div className="card"><div className="tbl-wrap"><table className="tbl">
        <thead><tr><th>Work Order</th><th>Type</th><th>Customer</th><th>PNG ID</th><th>Crew</th><th>Scheduled</th><th>Priority</th><th>Status</th></tr></thead>
        <tbody>{orders.map((w) => (
          <tr key={w.id}>
            <td className="mono strong" style={{ fontSize: 12 }}>{w.id}</td>
            <td>{w.type}</td><td className="strong">{w.name}</td><td className="mono" style={{ fontSize: 12 }}>{w.pngId}</td>
            <td style={{ color: 'var(--g500)' }}>{w.crew}</td><td style={{ color: 'var(--g500)' }}>{w.scheduled}</td>
            <td><Badge cls={prCls(w.priority)} dot>{w.priority}</Badge></td>
            <td><Badge cls={stCls(w.status)} dot>{w.status}</Badge></td>
          </tr>
        ))}</tbody>
      </table></div></div>

      {create && (
        <Modal title="Create Work Order" icon="wrench" onClose={() => setCreate(false)}
          footer={<>
            <button className="btn btn-light" onClick={() => setCreate(false)}>Cancel</button>
            <button className="btn btn-primary" disabled={!valid} onClick={save}><Icon name="check" size={15} />Create Work Order</button>
          </>}>
          <div className="grid-2">
            <div className="fgroup"><label className="flabel">Work Order Type <Req /></label>
              <select className="finput" value={form.type} onChange={(e) => set('type', e.target.value)}>{WO_TYPES.map((t) => <option key={t}>{t}</option>)}</select></div>
            <div className="fgroup"><label className="flabel">PNG ID <Req /></label><input className="finput" placeholder="PNG-2026-xxxxxx" value={form.pngId} onChange={(e) => set('pngId', e.target.value)} /></div>
            <div className="fgroup"><label className="flabel">Customer Name <Req /></label><input className="finput" placeholder="Customer name" value={form.name} onChange={(e) => set('name', e.target.value)} /></div>
            <div className="fgroup"><label className="flabel">Assign Crew <Req /></label>
              <select className="finput" value={form.crew} onChange={(e) => set('crew', e.target.value)}><option>Team A</option><option>Team B</option><option>Team C</option></select></div>
            <div className="fgroup"><label className="flabel">Scheduled Date <Req /></label><input className="finput" type="date" value={form.scheduled} onChange={(e) => set('scheduled', e.target.value)} /></div>
            <div className="fgroup"><label className="flabel">Priority <Req /></label>
              <select className="finput" value={form.priority} onChange={(e) => set('priority', e.target.value)}><option>High</option><option>Medium</option><option>Low</option></select></div>
          </div>
        </Modal>
      )}
    </div>
  )
}
