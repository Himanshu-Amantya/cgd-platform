import { createContext, useCallback, useContext, useState } from 'react'
import { Icon } from '../lib/icons.jsx'

const ToastCtx = createContext(() => {})
export const useToast = () => useContext(ToastCtx)

const ICON = { green: 'check', red: 'alert', amber: 'info', blue: 'info' }

export function ToastHost({ children }) {
  const [toasts, setToasts] = useState([])
  const push = useCallback((t) => {
    const id = Date.now() + Math.random()
    setToasts((x) => [...x, { ...t, id }])
    setTimeout(() => setToasts((x) => x.filter((o) => o.id !== id)), t.ttl || 4200)
  }, [])
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="toast-wrap">
        {toasts.map((t) => (
          <div key={t.id} className={'toast ' + (t.tone || 'blue')}>
            <div className={'kpi-ic ic-' + (t.tone === 'green' ? 'green' : t.tone === 'red' ? 'red' : t.tone === 'amber' ? 'amber' : 'blue')} style={{ width: 32, height: 32, flexShrink: 0 }}>
              <Icon name={ICON[t.tone] || 'info'} size={16} />
            </div>
            <div style={{ flex: 1 }}>
              <div className="tt">{t.title}</div>
              {t.msg && <div className="ts">{t.msg}</div>}
            </div>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}
