import { useEffect, useRef, useState } from 'react'
import { Icon } from '../lib/icons.jsx'
import { statusCls, statusLabel } from '../lib/status.js'

// Make a clickable non-button (div) keyboard-operable: fire on Enter / Space.
export const onActivate = (fn) => (e) => {
  if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); fn() }
}

export function Badge({ cls, dot, children, style }) {
  return <span className={'badge ' + cls} style={style}>{dot && <i className="dot" />}{children}</span>
}

export function StatusChip({ code }) {
  return <Badge cls={statusCls(code)} dot>{statusLabel(code)}</Badge>
}

export function Panel({ title, icon, sub, action, children, style, bodyStyle }) {
  return (
    <div className="card" style={style}>
      {title && (
        <div className="card-h">
          <div><h3>{icon && <Icon name={icon} size={16} />}{title}</h3>{sub && <div className="sub">{sub}</div>}</div>
          {action}
        </div>
      )}
      <div className="card-b" style={bodyStyle}>{children}</div>
    </div>
  )
}

export function Crumbs({ items }) {
  return (
    <div className="crumbs">
      {items.map((it, i) => (
        <span key={i} style={{ display: 'contents' }}>
          {i > 0 && <span className="sep">/</span>}
          {it.onClick ? <a onClick={it.onClick}>{it.label}</a> : <span className="cur">{it.label}</span>}
        </span>
      ))}
    </div>
  )
}

export function KV({ k, children }) {
  return <div className="kv"><span className="k">{k}</span><span className="v">{children}</span></div>
}

export function Modal({ title, icon, onClose, children, footer }) {
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h)
  }, [])
  return (
    <div className="overlay center" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <div className="modal-h">
          <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
            {icon && <div className="kpi-ic ic-blue" style={{ width: 44, height: 44, borderRadius: 12 }}><Icon name={icon} size={22} /></div>}
            <h3>{title}</h3>
          </div>
          <button className="xbtn" onClick={onClose}><Icon name="x" size={16} /></button>
        </div>
        <div className="modal-b">{children}</div>
        {footer && <div className="modal-f">{footer}</div>}
      </div>
    </div>
  )
}

// Confirmation dialog built on Modal. tone → confirm button style (primary | danger | green).
export function Confirm({ title, icon = 'alert', tone = 'primary', confirmLabel = 'Confirm', cancelLabel = 'Cancel', confirmIcon, onConfirm, onClose, children }) {
  return (
    <Modal title={title} icon={icon} onClose={onClose}
      footer={<>
        <button className="btn btn-light" onClick={onClose}>{cancelLabel}</button>
        <button className={'btn btn-' + tone} onClick={onConfirm}>{confirmIcon && <Icon name={confirmIcon} size={15} />}{confirmLabel}</button>
      </>}>
      {children}
    </Modal>
  )
}

export function Drawer({ title, sub, onClose, children }) {
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h)
  }, [])
  return (
    <div className="overlay" onClick={onClose}>
      <div className="drawer" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <div className="drawer-h">
          <div><h3>{title}</h3>{sub && <div style={{ fontSize: 12, color: 'var(--g400)', marginTop: 3 }}>{sub}</div>}</div>
          <button className="xbtn" onClick={onClose}><Icon name="x" size={16} /></button>
        </div>
        <div className="drawer-b">{children}</div>
      </div>
    </div>
  )
}

// Three-dot (⋮) row action menu. items: [{ label, icon, danger, onClick }]
export function Menu({ items, label = 'Row actions' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    if (!open) return
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    window.addEventListener('mousedown', h); return () => window.removeEventListener('mousedown', h)
  }, [open])
  return (
    <div className="menu-wrap" ref={ref}>
      <button className="menu-btn" aria-label={label} aria-haspopup="true" aria-expanded={open} onClick={() => setOpen((v) => !v)}><Icon name="more" size={16} /></button>
      {open && (
        <div className="menu" role="menu">
          {items.map((it, i) => it.sep
            ? <div key={i} className="menu-sep" />
            : <button key={i} role="menuitem" className={'menu-item' + (it.danger ? ' danger' : '')} onClick={() => { setOpen(false); it.onClick() }}>
                {it.icon && <Icon name={it.icon} size={14} />}{it.label}
              </button>)}
        </div>
      )}
    </div>
  )
}

// Searchable single-select dropdown. options: [{ value, label, sub }]
export function SearchSelect({ options, value, onChange, placeholder = 'Select…', emptyText = 'No matches' }) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const ref = useRef(null)
  useEffect(() => {
    if (!open) return
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    window.addEventListener('mousedown', h); return () => window.removeEventListener('mousedown', h)
  }, [open])
  const sel = options.find((o) => o.value === value)
  const filtered = options.filter((o) => (o.label + ' ' + (o.sub || '')).toLowerCase().includes(q.toLowerCase()))
  const pick = (v) => { onChange(v); setOpen(false); setQ('') }
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button type="button" className="finput" aria-haspopup="listbox" aria-expanded={open}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', textAlign: 'left', cursor: 'pointer', gap: 8 }}
        onClick={() => setOpen((v) => !v)}>
        <span style={{ color: sel ? 'var(--g900)' : 'var(--g400)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sel ? sel.label : placeholder}</span>
        <Icon name="chev" size={14} style={{ color: 'var(--g400)', flexShrink: 0 }} />
      </button>
      {open && (
        <div className="menu" role="listbox" style={{ left: 0, right: 0, minWidth: 0, padding: 0, maxHeight: 300, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: 8, borderBottom: '1px solid var(--g200)' }}>
            <div className="fsearch" style={{ maxWidth: 'none' }}>
              <Icon name="search" size={14} /><input autoFocus placeholder="Type to search…" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
          </div>
          <div style={{ overflowY: 'auto', padding: 5 }}>
            {filtered.map((o) => (
              <button key={o.value} type="button" role="option" aria-selected={o.value === value} className="menu-item"
                style={o.value === value ? { background: 'var(--g100)' } : undefined} onClick={() => pick(o.value)}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700 }}>{o.label}</div>
                  {o.sub && <div style={{ fontSize: 11, color: 'var(--g400)', fontWeight: 500 }}>{o.sub}</div>}
                </div>
                {o.value === value && <Icon name="check" size={14} style={{ color: 'var(--green)', flexShrink: 0 }} />}
              </button>
            ))}
            {filtered.length === 0 && <div style={{ padding: '12px 10px', fontSize: 12, color: 'var(--g400)', textAlign: 'center' }}>{emptyText}</div>}
          </div>
        </div>
      )}
    </div>
  )
}

export function Empty({ icon = 'inbox', title, children, action }) {
  return (
    <div className="empty">
      <div className="eic"><Icon name={icon} size={28} /></div>
      <h3>{title}</h3>{children && <p>{children}</p>}{action}
    </div>
  )
}
