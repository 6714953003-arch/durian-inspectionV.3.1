import { useState, useEffect } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts'
import { zones, generateChartData, generateDailyData } from '../data/mockData'

interface ZoneDetailPageProps {
  zoneId: number
  onBack: () => void
}

type ChartTab = 'temperature' | 'humidity'
type ViewMode = 'live' | 'history'
type PumpMode = 'on' | 'off' | 'auto'

export function ZoneDetailPage({ zoneId, onBack }: ZoneDetailPageProps) {
  const zone = zones.find((z) => z.id === zoneId) || zones[0]
  const [selectedTreeId, setSelectedTreeId] = useState(zone.trees[0].id)
  const tree = zone.trees.find((t) => t.id === selectedTreeId) || zone.trees[0]

  const [chartData] = useState(() => generateChartData(tree.temperature, tree.humidity))
  const [dailyData] = useState(() => generateDailyData(tree.temperature, tree.humidity, 10))
  const [pumpMode, setPumpMode] = useState<PumpMode>(tree.pumpMode as PumpMode)
  const [activeTab, setActiveTab] = useState<ChartTab>('temperature')
  const [viewMode, setViewMode] = useState<ViewMode>('live')
  const [liveTemp, setLiveTemp] = useState(tree.temperature)
  const [liveHumid, setLiveHumid] = useState(tree.humidity)

  useEffect(() => {
    setLiveTemp(tree.temperature)
    setLiveHumid(tree.humidity)
    setPumpMode(tree.pumpMode as PumpMode)
  }, [tree])

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveTemp(+(tree.temperature + (Math.random() - 0.5) * 1.5).toFixed(1))
      setLiveHumid(Math.round(tree.humidity + (Math.random() - 0.5) * 4))
    }, 3000)
    return () => clearInterval(interval)
  }, [tree])

  const chartConfig: Record<ChartTab, { key: string; color: string; unit: string; label: string }> = {
    temperature: { key: 'temperature', color: '#f97316', unit: '°C', label: 'อุณหภูมิในดิน' },
    humidity: { key: 'humidity', color: '#38bdf8', unit: '%', label: 'ความชื้นในดิน' },
  }
  const cfg = chartConfig[activeTab]

  const statusColor: Record<string, string> = { normal: '#00c9a7', warning: '#f59e0b', critical: '#ef4444' }
  const pumpBtnStyle = (mode: PumpMode) => ({
    backgroundColor: pumpMode === mode
      ? mode === 'on' ? '#00c9a7' : mode === 'off' ? '#ef4444' : '#f59e0b'
      : 'var(--muted)',
    color: pumpMode === mode ? '#fff' : 'var(--muted-foreground)',
    opacity: pumpMode === mode ? 1 : 0.55,
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 rounded-lg transition-colors" style={{ color: 'var(--muted-foreground)', border: '1px solid var(--border)' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)' }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted-foreground)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>{zone.name}</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>ทุเรียน {zone.trees.length} ต้น — ดูข้อมูลรายต้น</p>
        </div>
      </div>

      {/* Tree selector */}
      <div className="flex gap-2 flex-wrap">
        {zone.trees.map((t) => {
          const tStatus = [t.tempStatus, t.humidStatus].includes('critical') ? 'critical'
            : [t.tempStatus, t.humidStatus].includes('warning') ? 'warning' : 'normal'
          const isActive = t.id === selectedTreeId
          return (
            <button key={t.id} onClick={() => setSelectedTreeId(t.id)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all" style={{ backgroundColor: isActive ? 'var(--primary)' : 'var(--card)', color: isActive ? 'var(--primary-foreground)' : 'var(--foreground)', border: `1px solid ${isActive ? 'var(--primary)' : 'var(--border)'}` }}>
              🌳 {t.name}
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: isActive ? 'var(--primary-foreground)' : statusColor[tStatus] }} />
            </button>
          )
        })}
      </div>

      {/* Live sensors — 2 cards only */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'อุณหภูมิในดิน', value: liveTemp, unit: '°C', color: '#f97316', tab: 'temperature' as ChartTab,
            icon: <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" /> },
          { label: 'ความชื้นในดิน', value: liveHumid, unit: '%RH', color: '#38bdf8', tab: 'humidity' as ChartTab,
            icon: <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" /> },
        ].map((s) => (
          <button key={s.label} onClick={() => setActiveTab(s.tab)} className="p-5 rounded-xl border flex flex-col gap-3 text-left transition-all" style={{ backgroundColor: 'var(--card)', borderColor: activeTab === s.tab ? s.color : 'var(--border)', outline: 'none' }}>
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${s.color}20`, color: s.color }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{s.icon}</svg>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#00c9a720', color: '#00c9a7' }}>Live</span>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>{s.label}</p>
              <p className="text-3xl font-bold font-mono mt-1" style={{ color: s.color }}>
                {s.value}<span className="text-sm font-normal ml-1" style={{ color: 'var(--muted-foreground)' }}>{s.unit}</span>
              </p>
            </div>
          </button>
        ))}
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 300px' }}>
        {/* Chart */}
        <div className="p-5 rounded-xl border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div className="flex gap-1">
              {(['temperature', 'humidity'] as ChartTab[]).map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)} className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all" style={{ backgroundColor: activeTab === tab ? chartConfig[tab].color : 'var(--secondary)', color: activeTab === tab ? '#080d16' : 'var(--muted-foreground)' }}>
                  {chartConfig[tab].label}
                </button>
              ))}
            </div>
            <div className="flex gap-1 p-1 rounded-lg" style={{ backgroundColor: 'var(--secondary)' }}>
              {(['live', 'history'] as ViewMode[]).map((v) => (
                <button key={v} onClick={() => setViewMode(v)} className="px-3 py-1 rounded-md text-xs font-medium transition-all" style={{ backgroundColor: viewMode === v ? 'var(--primary)' : 'transparent', color: viewMode === v ? 'var(--primary-foreground)' : 'var(--muted-foreground)' }}>
                  {v === 'live' ? 'Live (2h)' : 'ย้อนหลัง 10 วัน'}
                </button>
              ))}
            </div>
          </div>
          <p className="text-xs mb-3" style={{ color: 'var(--muted-foreground)' }}>
            {viewMode === 'live' ? `กราฟ Live — ${cfg.label} (${tree.name})` : `ประวัติ 10 วัน — ${cfg.label} (${tree.name})`}
          </p>
          {viewMode === 'live' ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="4 4" />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false} interval={5} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false} width={40} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px', color: 'var(--foreground)' }} formatter={(val) => [`${val}${cfg.unit}`, cfg.label]} />
                <Line type="monotone" dataKey={cfg.key} stroke={cfg.color} strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dailyData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="4 4" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false} width={40} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px', color: 'var(--foreground)' }} formatter={(val) => [`${val}${cfg.unit}`, cfg.label]} />
                <Bar dataKey={cfg.key} fill={cfg.color} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Manual control */}
        <div className="p-5 rounded-xl border flex flex-col gap-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Manual Control</h2>
          <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--secondary)', borderColor: 'var(--border)' }}>
            <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: 'var(--muted-foreground)' }}>ปั๊มน้ำ (Water Pump)</p>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-full transition-all" style={{ backgroundColor: pumpMode === 'on' ? '#00c9a7' : pumpMode === 'auto' ? '#f59e0b' : 'var(--muted-foreground)', boxShadow: pumpMode !== 'off' ? `0 0 8px ${pumpMode === 'on' ? '#00c9a7' : '#f59e0b'}` : 'none' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                {pumpMode === 'on' ? 'กำลังทำงาน' : pumpMode === 'auto' ? 'โหมดอัตโนมัติ' : 'หยุดทำงาน'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {(['on', 'off', 'auto'] as PumpMode[]).map((mode) => (
                <button key={mode} onClick={() => setPumpMode(mode)} className="py-2 rounded-lg text-xs font-semibold transition-all" style={pumpBtnStyle(mode)}>
                  {mode === 'on' ? 'เปิด' : mode === 'off' ? 'ปิด' : 'Auto'}
                </button>
              ))}
            </div>
            {pumpMode === 'auto' && <p className="text-xs mt-2" style={{ color: 'var(--muted-foreground)' }}>ระบบจะเปิด/ปิดปั๊มอัตโนมัติตามค่าความชื้น</p>}
          </div>

          <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--secondary)', borderColor: 'var(--border)' }}>
            <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: 'var(--muted-foreground)' }}>ค่าเกณฑ์ทุเรียน</p>
            <div className="space-y-2.5 text-xs">
              {[
                { label: '🌡 อุณหภูมิในดิน', range: '25 – 32', unit: '°C', color: '#f97316' },
                { label: '💧 ความชื้นในดิน', range: '60 – 80', unit: '%', color: '#38bdf8' },
              ].map((t) => (
                <div key={t.label} className="flex items-center justify-between">
                  <span style={{ color: 'var(--muted-foreground)' }}>{t.label}</span>
                  <span className="font-mono font-semibold" style={{ color: t.color }}>{t.range} {t.unit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
