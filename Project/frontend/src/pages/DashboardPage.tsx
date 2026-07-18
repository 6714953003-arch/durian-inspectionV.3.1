import { zones, allTrees, generateTodayStats } from '../data/mockData'

interface DashboardPageProps {
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

export function DashboardPage({ onSelectZone }: DashboardPageProps) {
  const avgTemp = +(allTrees.reduce((s, t) => s + t.temperature, 0) / allTrees.length).toFixed(1)
  const avgHumid = Math.round(allTrees.reduce((s, t) => s + t.humidity, 0) / allTrees.length)
  const todayStats = generateTodayStats(avgTemp, avgHumid)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>Dashboard</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
          ภาพรวมสวนทุเรียนวันนี้ — {allTrees.length} ต้น, {zones.length} โซน
        </p>
      </div>

      {/* Today stats */}
      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
        {[
          {
            label: 'อุณหภูมิในดิน',
            avg: `${todayStats.tempAvg}°C`,
            min: `${todayStats.tempMin}°C`,
            max: `${todayStats.tempMax}°C`,
            color: '#f97316',
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
              </svg>
            ),
          },
          {
            label: 'ความชื้นในดิน',
            avg: `${todayStats.humidAvg}%`,
            min: `${todayStats.humidMin}%`,
            max: `${todayStats.humidMax}%`,
            color: '#38bdf8',
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
              </svg>
            ),
          },
        ].map((s) => (
          <div key={s.label} className="p-5 rounded-xl border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${s.color}20`, color: s.color }}>
                {s.icon}
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>{s.label}</p>
                <p className="text-2xl font-bold font-mono mt-0.5" style={{ color: s.color }}>{s.avg}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 rounded-lg text-center" style={{ backgroundColor: 'var(--secondary)' }}>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>ต่ำสุด</p>
                <p className="text-sm font-mono font-semibold mt-0.5" style={{ color: 'var(--foreground)' }}>{s.min}</p>
              </div>
              <div className="p-2 rounded-lg text-center" style={{ backgroundColor: 'var(--secondary)' }}>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>สูงสุด</p>
                <p className="text-sm font-mono font-semibold mt-0.5" style={{ color: 'var(--foreground)' }}>{s.max}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Zone summary */}
      <div>
        <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--foreground)' }}>สรุปสถานะแต่ละโซน</h2>
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          {zones.map((zone) => {
            const allStatuses = zone.trees.flatMap((t) => [t.tempStatus, t.humidStatus])
            const zoneStatus = allStatuses.includes('critical') ? 'critical' : allStatuses.includes('warning') ? 'warning' : 'normal'
            const avgT = (zone.trees.reduce((s, t) => s + t.temperature, 0) / zone.trees.length).toFixed(1)
            const avgH = Math.round(zone.trees.reduce((s, t) => s + t.humidity, 0) / zone.trees.length)
            return (
              <div key={zone.id} className="p-5 rounded-xl border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--foreground)' }}>{zone.name}</p>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{zone.trees.length} ต้น</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: `${statusColor[zoneStatus]}20`, color: statusColor[zoneStatus] }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusColor[zoneStatus] }} />
                    {statusLabel[zoneStatus]}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {[
                    { label: 'อุณหภูมิในดิน', val: `${avgT}°C`, color: '#f97316' },
                    { label: 'ความชื้นในดิน', val: `${avgH}%`, color: '#38bdf8' },
                  ].map((s) => (
                    <div key={s.label} className="p-2 rounded-lg text-center" style={{ backgroundColor: 'var(--secondary)' }}>
                      <p className="text-xs mb-0.5" style={{ color: 'var(--muted-foreground)' }}>{s.label}</p>
                      <p className="text-sm font-bold font-mono" style={{ color: s.color }}>{s.val}</p>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => onSelectZone(zone.id)}
                  className="w-full py-2 rounded-lg text-sm font-medium transition-all"
                  style={{ color: 'var(--primary)', border: '1px solid var(--primary)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary-foreground)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--primary)' }}
                >
                  ดูรายละเอียด
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* All trees table */}
      <div>
        <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--foreground)' }}>ข้อมูลของแต่ละต้น</h2>
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: 'var(--secondary)' }}>
                {['ต้น', 'โซน', 'อุณหภูมิในดิน', 'ความชื้นในดิน', 'Pump', 'สถานะ'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs uppercase tracking-wider font-medium" style={{ color: 'var(--muted-foreground)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allTrees.map((t, i) => {
                const worst = [t.tempStatus, t.humidStatus].includes('critical') ? 'critical'
                  : [t.tempStatus, t.humidStatus].includes('warning') ? 'warning' : 'normal'
                const pumpColors: Record<string, string> = { on: '#00c9a7', off: '#64748b', auto: '#f59e0b' }
                const pumpLabels: Record<string, string> = { on: 'เปิด', off: 'ปิด', auto: 'Auto' }
                return (
                  <tr key={t.id} style={{ backgroundColor: i % 2 === 0 ? 'var(--card)' : 'var(--muted)', borderTop: '1px solid var(--border)' }}>
                    <td className="px-4 py-3 font-medium" style={{ color: 'var(--foreground)' }}>🌳 {t.name}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--muted-foreground)' }}>Zone {t.zoneId}</td>
                    <td className="px-4 py-3 font-mono font-semibold" style={{ color: t.tempStatus === 'normal' ? '#f97316' : statusColor[t.tempStatus] }}>{t.temperature}°C</td>
                    <td className="px-4 py-3 font-mono font-semibold" style={{ color: t.humidStatus === 'normal' ? '#38bdf8' : statusColor[t.humidStatus] }}>{t.humidity}%</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: `${pumpColors[t.pumpMode]}20`, color: pumpColors[t.pumpMode] }}>
                        {pumpLabels[t.pumpMode]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: `${statusColor[worst]}20`, color: statusColor[worst] }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusColor[worst] }} />
                        {statusLabel[worst]}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
