import { useState } from 'react'
import { zones } from '../data/mockData'

type PumpMode = 'on' | 'off' | 'auto' | 'schedule'

interface Schedule {
  enabled: boolean
  startTime: string
  endTime: string
  days: number[]
}

interface ZoneListPageProps {
  onSelectZone: (id: number) => void
}

const statusColor: Record<string, string> = {
  normal: '#00c9a7',
  warning: '#f59e0b',
  critical: '#ef4444',
}
const statusLabel: Record<string, string> = {
  normal: 'ดี',
  warning: 'น้อยเกินไป',
  critical: 'มากเกินไป',
}

const dayLabels = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']

const defaultSchedule: Schedule = {
  enabled: true,
  startTime: '06:00',
  endTime: '07:00',
  days: [1, 2, 3, 4, 5],
}

function ScheduleModal({ subtitle, schedule, onSave, onClose }: {
  subtitle: string; schedule: Schedule; onSave: (s: Schedule) => void; onClose: () => void
}) {
  const [draft, setDraft] = useState<Schedule>({ ...schedule })

  const toggleDay = (d: number) => {
    setDraft((prev) => ({
      ...prev,
      days: prev.days.includes(d) ? prev.days.filter((x) => x !== d) : [...prev.days, d].sort(),
    }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="w-full max-w-sm mx-4 rounded-2xl border overflow-hidden shadow-2xl" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--secondary)' }}>
          <div>
            <p className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>ตั้งเวลาปั๊มน้ำ</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{subtitle}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg" style={{ color: 'var(--muted-foreground)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="p-5 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>เปิดใช้งานตั้งเวลา</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>ปั๊มจะทำงานตามเวลาที่กำหนด</p>
            </div>
            <button onClick={() => setDraft((p) => ({ ...p, enabled: !p.enabled }))} className="relative w-11 h-6 rounded-full transition-all" style={{ backgroundColor: draft.enabled ? 'var(--primary)' : 'var(--secondary)', border: '1px solid var(--border)' }}>
              <span className="absolute top-0.5 w-5 h-5 rounded-full transition-all" style={{ backgroundColor: '#fff', left: draft.enabled ? 'calc(100% - 22px)' : '2px', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
            </button>
          </div>

          <div className={draft.enabled ? '' : 'opacity-40 pointer-events-none'}>
            <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: 'var(--muted-foreground)' }}>ช่วงเวลา</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs mb-1.5" style={{ color: 'var(--muted-foreground)' }}>เวลาเริ่ม</label>
                <input type="time" value={draft.startTime} onChange={(e) => setDraft((p) => ({ ...p, startTime: e.target.value }))} className="w-full px-3 py-2 rounded-lg text-sm font-mono outline-none" style={{ backgroundColor: 'var(--secondary)', color: 'var(--foreground)', border: '1px solid var(--border)' }} onFocus={(e) => { e.target.style.borderColor = 'var(--primary)' }} onBlur={(e) => { e.target.style.borderColor = 'var(--border)' }} />
              </div>
              <div>
                <label className="block text-xs mb-1.5" style={{ color: 'var(--muted-foreground)' }}>เวลาสิ้นสุด</label>
                <input type="time" value={draft.endTime} onChange={(e) => setDraft((p) => ({ ...p, endTime: e.target.value }))} className="w-full px-3 py-2 rounded-lg text-sm font-mono outline-none" style={{ backgroundColor: 'var(--secondary)', color: 'var(--foreground)', border: '1px solid var(--border)' }} onFocus={(e) => { e.target.style.borderColor = 'var(--primary)' }} onBlur={(e) => { e.target.style.borderColor = 'var(--border)' }} />
              </div>
            </div>
            {draft.startTime && draft.endTime && (
              <div className="mt-2 px-3 py-2 rounded-lg text-xs flex items-center gap-2" style={{ backgroundColor: 'var(--muted)' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary)' }}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                <span style={{ color: 'var(--muted-foreground)' }}>ระยะเวลา: {(() => {
                  const [sh, sm] = draft.startTime.split(':').map(Number)
                  const [eh, em] = draft.endTime.split(':').map(Number)
                  const diff = (eh * 60 + em) - (sh * 60 + sm)
                  if (diff <= 0) return '—'
                  const h = Math.floor(diff / 60); const m = diff % 60
                  return h > 0 ? `${h} ชม. ${m > 0 ? `${m} นาที` : ''}` : `${m} นาที`
                })()}</span>
              </div>
            )}
          </div>

          <div className={draft.enabled ? '' : 'opacity-40 pointer-events-none'}>
            <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: 'var(--muted-foreground)' }}>วันที่ใช้งาน</p>
            <div className="flex gap-1.5">
              {dayLabels.map((label, d) => {
                const active = draft.days.includes(d)
                return (
                  <button key={d} onClick={() => toggleDay(d)} className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all" style={{ backgroundColor: active ? 'var(--primary)' : 'var(--secondary)', color: active ? 'var(--primary-foreground)' : 'var(--muted-foreground)', border: `1px solid ${active ? 'var(--primary)' : 'var(--border)'}` }}>
                    {label}
                  </button>
                )
              })}
            </div>
            {draft.days.length === 0 && <p className="text-xs mt-2" style={{ color: '#ef4444' }}>กรุณาเลือกอย่างน้อย 1 วัน</p>}
          </div>

          <div className="flex gap-2 pt-1">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-lg text-sm font-medium" style={{ backgroundColor: 'var(--secondary)', color: 'var(--foreground)', border: '1px solid var(--border)' }}>ยกเลิก</button>
            <button onClick={() => { if (draft.days.length > 0 || !draft.enabled) { onSave(draft); onClose() } }} className="flex-1 py-2.5 rounded-lg text-sm font-semibold" style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}>บันทึก</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ZoneListPage({ onSelectZone }: ZoneListPageProps) {
  // ปั๊มน้ำตัวเดียว ใช้ร่วมกันทุกโซน
  const [pumpMode, setPumpMode] = useState<PumpMode>('auto')
  const [schedule, setSchedule] = useState<Schedule>({ ...defaultSchedule })
  const [scheduleOpen, setScheduleOpen] = useState(false)

  const modeBtnStyle = (m: PumpMode) => ({
    backgroundColor: pumpMode === m ? (m === 'on' ? '#00c9a7' : m === 'off' ? '#ef4444' : m === 'auto' ? '#f59e0b' : '#6366f1') : 'var(--muted)',
    color: pumpMode === m ? '#fff' : 'var(--muted-foreground)',
    opacity: pumpMode === m ? 1 : 0.5,
  })
  const pumpDotColor = pumpMode === 'on' ? '#00c9a7' : pumpMode === 'auto' ? '#f59e0b' : pumpMode === 'schedule' ? '#6366f1' : 'var(--muted-foreground)'
  const pumpStatusLabel = pumpMode === 'on' ? 'กำลังทำงาน' : pumpMode === 'auto' ? 'อัตโนมัติ' : pumpMode === 'schedule' ? 'ตั้งเวลาแล้ว' : 'หยุดทำงาน'

  return (
    <div className="space-y-6">
      {scheduleOpen && (
        <ScheduleModal
          subtitle={`ใช้ร่วมกันทั้ง ${zones.length} โซน`}
          schedule={schedule}
          onSave={setSchedule}
          onClose={() => setScheduleOpen(false)}
        />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>Zone List</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>ทุเรียนทั้งหมด 10 ต้น แบ่งออกเป็น 3 โซน</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs border" style={{ color: 'var(--muted-foreground)', borderColor: 'var(--border)' }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: '#00c9a7' }} />
          Live data
        </div>
      </div>

      {/* ปั๊มน้ำ — 1 ตัว ใช้ร่วมกันทุกโซน */}
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
        <div className="px-5 py-4" style={{ backgroundColor: 'var(--secondary)' }}>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" /></svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-base" style={{ color: 'var(--foreground)' }}>ปั๊มน้ำ</p>
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>ใช้ร่วมกันทั้ง {zones.length} โซน</p>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full transition-all" style={{ backgroundColor: pumpDotColor, boxShadow: pumpMode !== 'off' ? `0 0 6px ${pumpDotColor}` : 'none' }} />
              <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{pumpStatusLabel}</span>
            </div>
          </div>

          <div className="mt-3 pt-3 flex items-center gap-3 flex-wrap border-t" style={{ borderColor: 'var(--border)' }}>
            <div className="flex gap-1">
              {(['on', 'off', 'auto', 'schedule'] as PumpMode[]).map((m) => (
                <button key={m} onClick={() => { setPumpMode(m); if (m === 'schedule') setScheduleOpen(true) }} className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all" style={modeBtnStyle(m)}>
                  {m === 'on' ? 'เปิด' : m === 'off' ? 'ปิด' : m === 'auto' ? 'Auto' : '⏰ ตั้งเวลา'}
                </button>
              ))}
            </div>
            {pumpMode === 'schedule' && (
              <button onClick={() => setScheduleOpen(true)} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-all" style={{ backgroundColor: '#6366f120', color: '#818cf8', border: '1px solid #6366f140' }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                {schedule.startTime} – {schedule.endTime} · {schedule.days.map((d) => dayLabels[d]).join(' ')}
              </button>
            )}
            {pumpMode === 'auto' && (
              <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>ระบบจะเปิด/ปิดปั๊มอัตโนมัติตามค่าความชื้น</span>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {zones.map((zone) => {
          const allStatuses = zone.trees.flatMap((t) => [t.tempStatus, t.humidStatus])
          const zoneStatus = allStatuses.includes('critical') ? 'critical' : allStatuses.includes('warning') ? 'warning' : 'normal'
          return (
            <div key={zone.id} className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
              <div className="px-5 py-4" style={{ backgroundColor: 'var(--secondary)', borderBottom: '1px solid var(--border)' }}>
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0" style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}>{zone.id}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-base" style={{ color: 'var(--foreground)' }}>{zone.name}</p>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{zone.trees.length} ต้น</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: `${statusColor[zoneStatus]}20`, color: statusColor[zoneStatus] }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusColor[zoneStatus] }} />
                    {statusLabel[zoneStatus]}
                  </span>
                  <button onClick={() => onSelectZone(zone.id)} className="text-xs px-3 py-1.5 rounded-lg transition-all shrink-0" style={{ color: 'var(--primary)', border: '1px solid var(--primary)' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary-foreground)' }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--primary)' }}>ดูกราฟ</button>
                </div>

              </div>

              <div className="p-4 grid gap-3" style={{ backgroundColor: 'var(--card)', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
                {zone.trees.map((tree) => {
                  const treeStatus = [tree.tempStatus, tree.humidStatus].includes('critical') ? 'critical'
                    : [tree.tempStatus, tree.humidStatus].includes('warning') ? 'warning' : 'normal'
                  return (
                    <div key={tree.id} className="p-4 rounded-xl border flex flex-col gap-3" style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)' }}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🌳</span>
                          <div>
                            <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{tree.name}</p>
                            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{tree.lastUpdated}</p>
                          </div>
                        </div>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: `${statusColor[treeStatus]}20`, color: statusColor[treeStatus] }}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusColor[treeStatus] }} />
                          {statusLabel[treeStatus]}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-2 rounded-lg text-center" style={{ backgroundColor: 'var(--secondary)' }}>
                          <p className="text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>🌡 อุณหภูมิ</p>
                          <p className="text-sm font-bold font-mono" style={{ color: tree.tempStatus === 'normal' ? '#f97316' : statusColor[tree.tempStatus] }}>{tree.temperature}°C</p>
                        </div>
                        <div className="p-2 rounded-lg text-center" style={{ backgroundColor: 'var(--secondary)' }}>
                          <p className="text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>💧 ความชื้น</p>
                          <p className="text-sm font-bold font-mono" style={{ color: tree.humidStatus === 'normal' ? '#38bdf8' : statusColor[tree.humidStatus] }}>{tree.humidity}%</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
