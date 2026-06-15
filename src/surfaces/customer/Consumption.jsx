import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../../lib/icons.jsx'
import { Panel, Crumbs } from '../../components/ui.jsx'
import { inr } from '../../lib/format.js'
import { CONSUMPTION, GAS_RATE } from './data.js'

const RANGES = [['daily', 'Daily'], ['weekly', 'Weekly'], ['monthly', 'Monthly'], ['yearly', 'Yearly'], ['custom', 'Custom']]
const METRICS = [['units', 'Consumption (m³)', 'bar'], ['amount', 'Bill Amount (₹)', 'rupee']]

export default function Consumption() {
  const nav = useNavigate()
  const [range, setRange] = useState('monthly')
  const [metric, setMetric] = useState('units')
  const [from, setFrom] = useState('2026-01-01')
  const [to, setTo] = useState('2026-06-14')

  const src = CONSUMPTION[range === 'custom' ? 'monthly' : range]
  const series = src.map(([lbl, units]) => ({ lbl, units, amount: Math.round(units * GAS_RATE) }))
  const vals = series.map((d) => (metric === 'units' ? d.units : d.amount))
  const max = Math.max(...vals, 1)
  const totalUnits = series.reduce((s, d) => s + d.units, 0)
  const totalAmt = series.reduce((s, d) => s + d.amount, 0)
  const avg = totalUnits / series.length
  const fmt = (v) => (metric === 'units' ? v + ' m³' : inr(v))

  return (
    <div className="page" style={{ maxWidth: 980 }}>
      <Crumbs items={[{ label: 'Dashboard', onClick: () => nav('/customer') }, { label: 'Consumption History' }]} />
      <div className="phead"><div><h1>Consumption History</h1><p>Track your piped natural gas usage and bill amount over time.</p></div></div>

      {/* summary */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
        <div className="kpi"><div className="kpi-top"><div className="kpi-ic ic-blue"><Icon name="bar" size={19} /></div></div><div className="kpi-val">{totalUnits.toFixed(1)}</div><div className="kpi-lbl">Total Usage (m³)</div></div>
        <div className="kpi"><div className="kpi-top"><div className="kpi-ic ic-purple"><Icon name="rupee" size={19} /></div></div><div className="kpi-val">{inr(totalAmt)}</div><div className="kpi-lbl">Total Bill Amount</div></div>
        <div className="kpi"><div className="kpi-top"><div className="kpi-ic ic-green"><Icon name="trend" size={19} /></div></div><div className="kpi-val">{avg.toFixed(1)}</div><div className="kpi-lbl">Avg / period (m³)</div></div>
      </div>

      <Panel title="Usage Trend" icon="trend" sub="Filter by period and switch between units and bill amount"
        action={<div className="seg">{METRICS.map((m) => (
          <button key={m[0]} className={metric === m[0] ? 'ok' : ''} onClick={() => setMetric(m[0])}><Icon name={m[2]} size={12} style={{ marginRight: 5, verticalAlign: '-2px' }} />{m[1].split(' ')[0]}</button>
        ))}</div>}>
        {/* range filters */}
        <div className="filterbar" style={{ marginBottom: 18 }}>
          {RANGES.map((r) => <div key={r[0]} className={'chip' + (range === r[0] ? ' on' : '')} onClick={() => setRange(r[0])}>{r[1]}</div>)}
          {range === 'custom' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
              <input type="date" className="finput" style={{ width: 150 }} value={from} onChange={(e) => setFrom(e.target.value)} />
              <span style={{ color: 'var(--g400)', fontSize: 12 }}>to</span>
              <input type="date" className="finput" style={{ width: 150 }} value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
          )}
        </div>

        {/* bar chart */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 220, padding: '0 4px', borderBottom: '1px solid var(--g200)' }}>
          {series.map((d, i) => {
            const v = metric === 'units' ? d.units : d.amount
            const h = Math.max(6, Math.round((v / max) * 180))
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: 6, minWidth: 0 }} title={d.lbl + ': ' + fmt(v)}>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--g600)', fontVariantNumeric: 'tabular-nums' }}>{metric === 'units' ? v : '₹' + (v / 1000).toFixed(1) + 'k'}</div>
                <div style={{ width: '70%', maxWidth: 46, height: h, borderRadius: '6px 6px 0 0', background: metric === 'units' ? 'linear-gradient(180deg,var(--blue-mid),var(--blue))' : 'linear-gradient(180deg,var(--purple),#6D28D9)', transition: 'height .3s' }} />
              </div>
            )
          })}
        </div>
        <div style={{ display: 'flex', gap: 10, padding: '8px 4px 0' }}>
          {series.map((d, i) => <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: 11, color: 'var(--g500)', fontWeight: 600, minWidth: 0 }}>{d.lbl}</div>)}
        </div>
      </Panel>

      {/* detail table */}
      <Panel title="Detailed Readings" icon="receipt" style={{ marginTop: 18 }} bodyStyle={{ padding: 0 }}>
        <div className="tbl-wrap"><table className="tbl">
          <thead><tr><th>Period</th><th>Consumption (m³)</th><th>Bill Amount</th></tr></thead>
          <tbody>{series.map((d, i) => (
            <tr key={i}><td className="strong">{d.lbl}</td><td className="mono">{d.units} m³</td><td className="mono strong">{inr(d.amount)}</td></tr>
          ))}</tbody>
        </table></div>
      </Panel>
    </div>
  )
}
