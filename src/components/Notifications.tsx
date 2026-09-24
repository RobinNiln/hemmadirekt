import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { useSale } from '../state/SaleContext'
import { cn } from './ui'

export function NotificationBell() {
  const { state, dispatch, unreadCount } = useSale()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  const toggle = () => {
    if (open) dispatch({ type: 'READ_NOTIFICATIONS' })
    setOpen(!open)
  }

  return (
    <div className="relative" ref={ref}>
      <button onClick={toggle} className="relative flex h-10 w-10 items-center justify-center rounded-xl text-ink-soft hover:bg-sand-200 hover:text-ink" aria-label={`Notiser (${unreadCount} olästa)`}>
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-petrol-700 px-1 text-[10px] font-bold text-white">{unreadCount}</span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-12 z-50 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-sand-300 bg-white shadow-lift animate-rise">
          <div className="flex items-center justify-between border-b border-sand-200 px-4 py-3">
            <p className="font-semibold">Notiser</p>
            {unreadCount > 0 && (
              <button className="text-xs font-semibold text-petrol-700 hover:underline" onClick={() => dispatch({ type: 'READ_NOTIFICATIONS' })}>
                Markera som lästa
              </button>
            )}
          </div>
          <ul className="max-h-80 overflow-y-auto">
            {state.notifications.length === 0 && <li className="px-4 py-6 text-center text-sm text-ink-muted">Inga notiser än.</li>}
            {state.notifications.map((n) => (
              <li key={n.id}>
                <button
                  onClick={() => {
                    dispatch({ type: 'READ_NOTIFICATIONS' })
                    setOpen(false)
                    if (n.link) navigate(n.link)
                  }}
                  className={cn('flex w-full gap-3 border-b border-sand-100 px-4 py-3 text-left hover:bg-sand-50', !n.read && 'bg-mint-100/40')}
                >
                  <span className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', n.read ? 'bg-transparent' : 'bg-petrol-600')} />
                  <span className="min-w-0">
                    <span className="block text-sm text-ink">{n.text}</span>
                    <span className="mt-0.5 block text-xs text-ink-muted">{n.time}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
