import { useState, useEffect, createContext, useContext, useCallback } from 'react'

const ToastCtx = createContext(null)

let _add = null
export const toast = {
  success: (msg) => _add && _add(msg, 'success'),
  error:   (msg) => _add && _add(msg, 'error'),
  info:    (msg) => _add && _add(msg, 'info'),
}

export default function Toast() {
  const [toasts, setToasts] = useState([])

  const add = useCallback((msg, type = 'info') => {
    const id = Date.now()
    setToasts(t => [...t, { id, msg, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500)
  }, [])

  useEffect(() => { _add = add; return () => { _add = null } }, [add])

  const icons = { success: '✅', error: '❌', info: 'ℹ️' }

  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <span>{icons[t.type]}</span>
          <span>{t.msg}</span>
        </div>
      ))}
    </div>
  )
}
