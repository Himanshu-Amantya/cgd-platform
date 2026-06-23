import { useNavigate, useOutletContext } from 'react-router-dom'
import { Icon } from '../../lib/icons.jsx'
import { Panel, StatusChip, Badge, onActivate } from '../../components/ui.jsx'
import { useToast } from '../../components/Toast.jsx'
import { useApps } from '../../lib/store.js'
import { inr } from '../../lib/format.js'
import { CONV_FEE, SCHEMES, USER } from './data.js'

export default function Dashboard() {
  const nav = useNavigate()
  const toast = useToast()
  const { onApply } = useOutletContext()
  const apps = useApps()
  const dues = apps.filter((a) => !a.paid).length
  const inProgress = apps.filter((a) => ['REVIEW', 'VERIFIED', 'PAID', 'PAYMENT_PENDING'].includes(a.status)).length
  const active = apps.filter((a) => a.status === 'COMPLETED').length
  const dueAmount = SCHEMES[0].payNow + CONV_FEE
  const kpis = [
    { ic: 'file', tone: 'blue', val: String(apps.length), lbl: 'Total Applications' },
    { ic: 'clock', tone: 'amber', val: String(inProgress), lbl: 'In Progress' },
    { ic: 'flame', tone: 'green', val: String(active), lbl: 'Active Connections' },
    { ic: 'wallet', tone: 'purple', val: dues ? inr(dueAmount) : '₹0', lbl: 'Dues to Pay' },
  ]
  const receipt = (a) => toast(a.paid
    ? { tone: 'green', title: 'Receipt downloaded', msg: 'Receipt for ' + a.png }
    : { tone: 'amber', title: 'No receipt yet', msg: 'Payment pending for ' + a.png })

  return (
    <div className="page">
      <div className="phead"><div><h1>Namaste, {USER.name.split(' ')[0]} 👋</h1><p>Manage your PNG connection applications and payments from one place.</p></div></div>
      <div className="kpi-grid">
        {kpis.map((k, i) => (
          <div className="kpi" key={i}>
            <div className="kpi-top"><div className={'kpi-ic ic-' + k.tone}><Icon name={k.ic} size={19} /></div></div>
            <div className="kpi-val">{k.val}</div><div className="kpi-lbl">{k.lbl}</div>
          </div>
        ))}
      </div>
      <Panel title="My Applications" icon="file" sub="All your connection requests" bodyStyle={{ padding: 0 }}
        action={<button className="btn btn-soft btn-sm" onClick={onApply}><Icon name="plus" size={13} />New</button>}>
        <div className="tbl-wrap"><table className="tbl">
          <thead><tr><th>PNG ID</th><th>Type</th><th>Status</th><th>Payment</th><th>Submitted</th><th>Last Updated</th><th>Actions</th></tr></thead>
          <tbody>
            {apps.map((a) => (
              <tr key={a.png} className="clickable" tabIndex={0} role="link" aria-label={'Track status of ' + a.png}
                onClick={() => nav('/customer/status/' + a.png)} onKeyDown={onActivate(() => nav('/customer/status/' + a.png))}>
                <td className="mono strong" style={{ fontSize: 12 }}>{a.png}</td>
                <td>{a.connType}</td>
                <td><StatusChip code={a.status} /></td>
                <td><Badge cls={a.paid ? 'b-green' : 'b-amber'} dot>{a.paid ? 'Paid' : 'Pending'}</Badge></td>
                <td style={{ color: 'var(--g500)' }}>{a.submitted}</td>
                <td style={{ color: 'var(--g500)' }}>{a.updated}</td>
                <td onClick={(e) => e.stopPropagation()}>
                  <div className="row-actions">
                    {!a.paid
                      ? <button className="btn btn-green btn-sm" onClick={() => nav('/customer/payment/' + a.png)}><Icon name="card" size={13} />Pay Now</button>
                      : <button className="btn btn-light btn-sm" onClick={() => nav('/customer/status/' + a.png)}><Icon name="eye" size={13} />View</button>}
                    <button className="btn btn-ghost btn-sm" title="Track Status" aria-label={'Track status of ' + a.png} onClick={() => nav('/customer/status/' + a.png)}><Icon name="map" size={13} /></button>
                    <button className="btn btn-ghost btn-sm" title="Download Receipt" aria-label={'Download receipt for ' + a.png} onClick={() => receipt(a)}><Icon name="download" size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table></div>
      </Panel>
    </div>
  )
}
