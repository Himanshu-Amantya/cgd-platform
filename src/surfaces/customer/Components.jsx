import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../../lib/icons.jsx'
import { Panel, Badge, StatusChip, Crumbs, Modal, Empty } from '../../components/ui.jsx'
import { useToast } from '../../components/Toast.jsx'
import { STATUS } from '../../lib/status.js'

const COLORS = [['--navy', 'Navy'], ['--blue', 'Blue'], ['--blue-mid', 'Blue Mid'], ['--green-mid', 'Green'], ['--leaf', 'Leaf'], ['--amber', 'Amber'], ['--red', 'Red'], ['--purple', 'Purple'], ['--teal', 'Teal']]

export default function Components() {
  const nav = useNavigate()
  const toast = useToast()
  const [demo, setDemo] = useState(false)
  return (
    <div className="page">
      <Crumbs items={[{ label: 'Dashboard', onClick: () => nav('/customer') }, { label: 'UI Components' }]} />
      <div className="phead"><div><h1>UI Component Library</h1><p>Reusable building blocks used across the CGD Platform — built on the Gasonet design system.</p></div></div>
      <div className="comp-grid">
        <Panel title="Color Tokens" icon="grid"><div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
          {COLORS.map((c) => <div key={c[0]} className="swatch" style={{ background: `var(${c[0]})` }}>{c[1]}</div>)}</div></Panel>
        <Panel title="Buttons" icon="grid"><div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <button className="btn btn-primary">Primary</button><button className="btn btn-green">Success</button><button className="btn btn-soft">Soft</button>
          <button className="btn btn-light">Light</button><button className="btn btn-danger">Danger</button><button className="btn btn-ghost">Ghost</button></div></Panel>
        <Panel title="Status Chips (PNG lifecycle)" icon="grid"><div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {Object.keys(STATUS).map((k) => <StatusChip key={k} code={k} />)}</div></Panel>
        <Panel title="Alerts" icon="grid"><div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="alert alert-info"><Icon name="info" size={18} /><div>Informational message.</div></div>
          <div className="alert alert-green"><Icon name="check" size={18} /><div>Success — action completed.</div></div>
          <div className="alert alert-warn"><Icon name="alert" size={18} /><div>Warning — please review.</div></div>
          <div className="alert alert-red"><Icon name="x" size={18} /><div>Error — something went wrong.</div></div></div></Panel>
        <Panel title="Forms" icon="grid">
          <div className="fgroup"><label className="flabel">Mobile Number</label><input className="finput" defaultValue="+91 98765 43210" /></div>
          <div className="fgroup" style={{ marginBottom: 0 }}><label className="flabel">Connection Type</label>
            <select className="finput"><option>Domestic PNG</option><option>Commercial PNG</option><option>Industrial PNG</option></select></div></Panel>
        <Panel title="Overlays & Feedback" icon="grid"><div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <button className="btn btn-light" onClick={() => setDemo(true)}>Modal</button>
          <button className="btn btn-light" onClick={() => toast({ tone: 'green', title: 'Toast notification', msg: 'Saved successfully' })}>Toast</button></div></Panel>
        <Panel title="Empty State" icon="grid"><Empty title="No applications yet" action={<button className="btn btn-primary btn-sm"><Icon name="plus" size={13} />Apply Now</button>}>Start by applying for a new PNG connection.</Empty></Panel>
        <Panel title="Badges" icon="grid"><div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {['b-blue', 'b-green', 'b-amber', 'b-red', 'b-purple', 'b-teal', 'b-gray'].map((c) => <Badge key={c} cls={c} dot>{c.replace('b-', '')}</Badge>)}</div></Panel>
      </div>
      {demo && <Modal title="Confirmation Modal" icon="link" onClose={() => setDemo(false)} footer={<><button className="btn btn-light" onClick={() => setDemo(false)}>Cancel</button><button className="btn btn-primary" onClick={() => setDemo(false)}>Continue</button></>}>This is a reusable modal component used for confirmations across the platform.</Modal>}
    </div>
  )
}
