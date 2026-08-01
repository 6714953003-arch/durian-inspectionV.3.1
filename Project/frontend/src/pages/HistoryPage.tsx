import { useEffect, useState } from 'react'
import { ApiError, exportLoginHistory, fetchLoginHistory, type LoginRecord } from '../api'

export function HistoryPage() {
  const [filter, setFilter] = useState<'all' | 'login' | 'logout'>('all')
  const [search, setSearch] = useState('')
  const [records, setRecords] = useState<LoginRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [exporting, setExporting] = useState(false)

  const handleExport = async () => {
    setError('')
    setExporting(true)
    try {
      await exportLoginHistory()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'ดาวน์โหลดไม่สำเร็จ')
    } finally {
      setExporting(false)
    }
  }

  useEffect(() => {
    let active = true
    fetchLoginHistory()
      .then((rows) => { if (active) setRecords(rows) })
      .catch((err) => {
        if (active) setError(err instanceof ApiError ? err.message : 'โหลดข้อมูลไม่สำเร็จ')
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const filtered = records.filter((r) => {
    const matchFilter =
      filter === 'all' ? true
      : r.action === filter
    const matchSearch = r.user.toLowerCase().includes(search.toLowerCase()) || r.ip.includes(search)
    return matchFilter && matchSearch
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>ประวัติการ Login</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>บันทึกการเข้า-ออกระบบ</p>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
          style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)', opacity: exporting ? 0.6 : 1 }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          {exporting ? 'กำลังดาวน์โหลด...' : 'Export'}
        </button>
      </div>

      {/* Filters & search */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-1 p-1 rounded-lg" style={{ backgroundColor: 'var(--secondary)' }}>
          {(['all', 'login', 'logout'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded-md text-xs font-medium transition-all"
              style={{
                backgroundColor: filter === f ? 'var(--primary)' : 'transparent',
                color: filter === f ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
              }}
            >
              {f === 'all' ? 'ทั้งหมด' : f === 'login' ? 'Login' : 'Logout'}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="ค้นหา ชื่อ หรือ IP..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 rounded-lg text-sm outline-none"
          style={{ backgroundColor: 'var(--card)', color: 'var(--foreground)', border: '1px solid var(--border)', minWidth: '200px' }}
          onFocus={(e) => { e.target.style.borderColor = 'var(--primary)' }}
          onBlur={(e) => { e.target.style.borderColor = 'var(--border)' }}
        />
        <span className="text-xs ml-auto" style={{ color: 'var(--muted-foreground)' }}>
          {filtered.length} รายการ
        </span>
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: 'var(--secondary)' }}>
              {['ผู้ใช้', 'การกระทำ', 'สถานะ', 'IP Address', 'อุปกรณ์', 'เวลา'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs uppercase tracking-wider font-medium" style={{ color: 'var(--muted-foreground)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => (
              <tr
                key={r.id}
                style={{ backgroundColor: i % 2 === 0 ? 'var(--card)' : 'var(--muted)', borderTop: '1px solid var(--border)' }}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={{ backgroundColor: r.status === 'failed' ? '#ef444420' : 'var(--primary)', color: r.status === 'failed' ? '#ef4444' : 'var(--primary-foreground)' }}
                    >
                      {r.user.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-xs" style={{ color: 'var(--foreground)' }}>{r.user}</p>
                      <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{r.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{ backgroundColor: r.action === 'login' ? '#00c9a720' : 'var(--secondary)', color: r.action === 'login' ? '#00c9a7' : 'var(--muted-foreground)' }}
                  >
                    {r.action === 'login' ? '→ Login' : '← Logout'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{ backgroundColor: r.status === 'success' ? '#00c9a720' : '#ef444420', color: r.status === 'success' ? '#00c9a7' : '#ef4444' }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: r.status === 'success' ? '#00c9a7' : '#ef4444' }} />
                    {r.status === 'success' ? 'สำเร็จ' : 'ล้มเหลว'}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--muted-foreground)' }}>{r.ip}</td>
                <td className="px-4 py-3 text-xs" style={{ color: 'var(--muted-foreground)' }}>{r.device}</td>
                <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--muted-foreground)' }}>{r.timestamp}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm" style={{ color: error ? '#ef4444' : 'var(--muted-foreground)' }}>
                  {loading ? 'กำลังโหลดข้อมูล...' : error ? error : 'ไม่พบข้อมูล'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
