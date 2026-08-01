import { useState, useRef, useEffect } from 'react'
import { fetchAlerts, markAlertRead, markAllAlertsRead, type AlertItem } from '../api'

const alertColor = { critical: '#ef4444', warning: '#f59e0b', info: '#38bdf8' }
const alertBg = { critical: '#ef444420', warning: '#f59e0b20', info: '#38bdf820' }
const alertLabel = { critical: 'มากเกินไป', warning: 'น้อยเกินไป', info: 'ข้อมูล' }

interface TopbarProps {
  onLogout: () => void
}

export function Topbar({ onLogout }: TopbarProps) {
  const [alerts, setAlerts] = useState<AlertItem[]>([])

  useEffect(() => {
    let active = true
    fetchAlerts()
      .then((rows) => { if (active) setAlerts(rows) })
      .catch(() => { /* โหลดไม่ได้ก็แสดงว่าไม่มีแจ้งเตือน */ })
    return () => { active = false }
  }, [])
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const unread = alerts.filter((a) => !a.isRead).length

  const now = new Date()
  const timeStr = now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
  const dateStr = now.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const markAllRead = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, isRead: true })))
    void markAllAlertsRead()
  }

  return (
    <header
      className="flex items-center justify-between px-6 py-3 border-b shrink-0 relative z-50"
      style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
    >
      <div className="flex items-center gap-3">
        <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
          {dateStr} &nbsp;·&nbsp; {timeStr}
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* Alert bell */}
        <div ref={ref} className="relative">
          <button
            onClick={() => setOpen((v) => !v)}
            className="relative p-2 rounded-lg transition-colors"
            style={{ color: 'var(--muted-foreground)', backgroundColor: open ? 'var(--secondary)' : 'transparent' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--secondary)'; e.currentTarget.style.color = 'var(--foreground)' }}
            onMouseLeave={(e) => { if (!open) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--muted-foreground)' } }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {unread > 0 && (
              <span
                className="absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ backgroundColor: '#ef4444', color: '#fff', fontSize: '9px' }}
              >
                {unread}
              </span>
            )}
          </button>

          {/* Dropdown */}
          {open && (
            <div
              className="absolute right-0 top-full mt-2 w-96 rounded-xl border overflow-hidden shadow-2xl"
              style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--secondary)' }}>
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>การแจ้งเตือนระบบ</p>
                  {unread > 0 && <p className="text-xs" style={{ color: '#ef4444' }}>{unread} รายการยังไม่ได้อ่าน</p>}
                </div>
                {unread > 0 && (
                  <button onClick={markAllRead} className="text-xs px-2 py-1 rounded-md transition-colors" style={{ color: 'var(--primary)' }}>
                    อ่านทั้งหมด
                  </button>
                )}
              </div>

              {/* List */}
              <div className="overflow-y-auto" style={{ maxHeight: '360px' }}>
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="px-4 py-3 border-b transition-colors cursor-pointer"
                    style={{
                      borderColor: 'var(--border)',
                      backgroundColor: alert.isRead ? 'transparent' : `${alertBg[alert.type]}`,
                    }}
                    onClick={() => {
                      setAlerts((prev) => prev.map((a) => a.id === alert.id ? { ...a, isRead: true } : a))
                      void markAlertRead(alert.id)
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className="mt-0.5 px-1.5 py-0.5 rounded text-xs font-semibold shrink-0"
                        style={{ backgroundColor: alertBg[alert.type], color: alertColor[alert.type] }}
                      >
                        {alertLabel[alert.type]}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
                          {alert.zoneId ? `Zone ${alert.zoneId}` : 'ระบบ'}{alert.treeId ? ` · ต้นที่ ${alert.treeId}` : ''}
                        </p>
                        <p className="text-sm mt-0.5" style={{ color: 'var(--foreground)' }}>{alert.message}</p>
                        <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>{alert.createdAt}</p>
                      </div>
                      {!alert.isRead && (
                        <span className="w-2 h-2 rounded-full shrink-0 mt-1" style={{ backgroundColor: alertColor[alert.type] }} />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {alerts.every((a) => a.isRead) && (
                <div className="px-4 py-6 text-center text-sm" style={{ color: 'var(--muted-foreground)' }}>
                  ✓ ไม่มีการแจ้งเตือนใหม่
                </div>
              )}
            </div>
          )}
        </div>

        {/* User info */}
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
          >
            AD
          </div>
          <div className="text-sm">
            <p className="font-medium leading-none" style={{ color: 'var(--foreground)' }}>Admin</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>admin@sensorhub.io</p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all"
          style={{ color: 'var(--muted-foreground)', border: '1px solid var(--border)' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = '#ef4444' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--muted-foreground)'; e.currentTarget.style.borderColor = 'var(--border)' }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Logout
        </button>
      </div>
    </header>
  )
}
