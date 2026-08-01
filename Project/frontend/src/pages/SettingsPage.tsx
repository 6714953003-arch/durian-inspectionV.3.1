import { useEffect, useState } from 'react'
import { ApiError, fetchThresholds, saveThresholds } from '../api'
import { getSavedTheme, saveTheme, type ThemeMode } from '../theme'

type RefreshRate = '3' | '5' | '10' | '30'

interface SettingsPageProps {
  onLogout: () => void
}

export function SettingsPage({ onLogout }: SettingsPageProps) {
  const [themeMode, setThemeMode] = useState<ThemeMode>(getSavedTheme)
  const [refreshRate, setRefreshRate] = useState<RefreshRate>('5')
  const [alertSound, setAlertSound] = useState(true)
  const [emailAlert, setEmailAlert] = useState(true)
  const [tempMin, setTempMin] = useState('25')
  const [tempMax, setTempMax] = useState('32')
  const [humidMin, setHumidMin] = useState('60')
  const [humidMax, setHumidMax] = useState('80')
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  // โหลดค่าเกณฑ์จริงจากฐานข้อมูลตอนเปิดหน้า
  useEffect(() => {
    let active = true
    fetchThresholds()
      .then((rows) => {
        if (!active) return
        const temp = rows.find((r) => r.parameter === 'temperature')
        const humid = rows.find((r) => r.parameter === 'humidity')
        if (temp) { setTempMin(String(temp.min_value)); setTempMax(String(temp.max_value)) }
        if (humid) { setHumidMin(String(humid.min_value)); setHumidMax(String(humid.max_value)) }
      })
      .catch((err) => {
        if (active) setError(err instanceof ApiError ? err.message : 'โหลดค่าเกณฑ์ไม่สำเร็จ')
      })
    return () => { active = false }
  }, [])

  const handleSave = async () => {
    setError('')

    const nums = [tempMin, tempMax, humidMin, humidMax].map(Number)
    if (nums.some((n) => Number.isNaN(n))) {
      setError('กรุณากรอกค่าเกณฑ์เป็นตัวเลข')
      return
    }
    if (Number(tempMin) >= Number(tempMax)) {
      setError('อุณหภูมิต่ำสุดต้องน้อยกว่าสูงสุด')
      return
    }
    if (Number(humidMin) >= Number(humidMax)) {
      setError('ความชื้นต่ำสุดต้องน้อยกว่าสูงสุด')
      return
    }

    saveTheme(themeMode)
    setSaving(true)
    try {
      await saveThresholds([
        { parameter: 'temperature', min_value: Number(tempMin), max_value: Number(tempMax) },
        { parameter: 'humidity', min_value: Number(humidMin), max_value: Number(humidMax) },
      ])
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'บันทึกไม่สำเร็จ')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>Settings</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>ตั้งค่าการแสดงผลและระบบแจ้งเตือน</p>
      </div>

      {/* Theme */}
      <Section title="การแสดงผล" subtitle="ธีมของอินเตอร์เฟส">
        <SettingRow label="โหมดสี" desc="เลือกธีมการแสดงผล">
          <div className="flex gap-3">
            {([
              { value: 'dark' as ThemeMode, emoji: '🌙', label: 'Dark Mode', desc: 'พื้นหลังมืด' },
              { value: 'light' as ThemeMode, emoji: '☀️', label: 'Light Mode', desc: 'พื้นหลังสว่าง' },
            ]).map((opt) => (
              <button
                key={opt.value}
                onClick={() => setThemeMode(opt.value)}
                className="flex flex-col items-center px-5 py-4 rounded-xl border text-sm font-medium transition-all"
                style={{
                  backgroundColor: themeMode === opt.value ? 'var(--primary)' : 'var(--secondary)',
                  color: themeMode === opt.value ? 'var(--primary-foreground)' : 'var(--foreground)',
                  borderColor: themeMode === opt.value ? 'var(--primary)' : 'var(--border)',
                }}
              >
                <span className="text-2xl mb-1">{opt.emoji}</span>
                <span className="font-semibold text-sm">{opt.label}</span>
                <span className="text-xs mt-0.5 opacity-70">{opt.desc}</span>
              </button>
            ))}
          </div>
        </SettingRow>
      </Section>

      {/* Data refresh */}
      <Section title="ข้อมูลและการอัปเดต" subtitle="ความถี่ในการรับข้อมูล">
        <SettingRow label="อัปเดตข้อมูลทุก" desc="ความถี่ในการดึงข้อมูลใหม่">
          <div className="flex gap-2">
            {(['3', '5', '10', '30'] as RefreshRate[]).map((r) => (
              <button
                key={r}
                onClick={() => setRefreshRate(r)}
                className="px-4 py-2 rounded-lg text-sm font-medium font-mono transition-all"
                style={{
                  backgroundColor: refreshRate === r ? 'var(--primary)' : 'var(--secondary)',
                  color: refreshRate === r ? 'var(--primary-foreground)' : 'var(--foreground)',
                  border: `1px solid ${refreshRate === r ? 'var(--primary)' : 'var(--border)'}`,
                }}
              >
                {r}s
              </button>
            ))}
          </div>
        </SettingRow>
      </Section>

      {/* Alerts */}
      <Section title="การแจ้งเตือน" subtitle="ตั้งค่าการแจ้งเตือนเมื่อค่าผิดปกติ">
        <SettingRow label="เสียงแจ้งเตือน" desc="เล่นเสียงเมื่อมีการแจ้งเตือน">
          <Toggle value={alertSound} onChange={setAlertSound} />
        </SettingRow>
        <SettingRow label="แจ้งเตือนทาง Email" desc="ส่ง Email เมื่อมีสถานะวิกฤต">
          <Toggle value={emailAlert} onChange={setEmailAlert} />
        </SettingRow>
      </Section>

      {/* Thresholds */}
      <Section title="ค่าเกณฑ์สำหรับทุเรียน" subtitle="ช่วงค่าที่เหมาะสม — นอกช่วงนี้จะแจ้งเตือน">
        {[
          { label: '🌡 อุณหภูมิ', unit: '°C', min: tempMin, max: tempMax, setMin: setTempMin, setMax: setTempMax, color: '#f97316' },
          { label: '💧 ความชื้น', unit: '%', min: humidMin, max: humidMax, setMin: setHumidMin, setMax: setHumidMax, color: '#38bdf8' },
        ].map((t) => (
          <SettingRow key={t.label} label={t.label} desc={`ช่วงปกติ (${t.unit})`}>
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>ต่ำสุด</span>
              <input
                type="number"
                value={t.min}
                onChange={(e) => t.setMin(e.target.value)}
                className="w-20 px-3 py-1.5 rounded-lg text-sm text-center font-mono outline-none"
                style={{ backgroundColor: 'var(--secondary)', color: t.color, border: '1px solid var(--border)' }}
                onFocus={(e) => { e.target.style.borderColor = t.color }}
                onBlur={(e) => { e.target.style.borderColor = 'var(--border)' }}
              />
              <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>–</span>
              <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>สูงสุด</span>
              <input
                type="number"
                value={t.max}
                onChange={(e) => t.setMax(e.target.value)}
                className="w-20 px-3 py-1.5 rounded-lg text-sm text-center font-mono outline-none"
                style={{ backgroundColor: 'var(--secondary)', color: t.color, border: '1px solid var(--border)' }}
                onFocus={(e) => { e.target.style.borderColor = t.color }}
                onBlur={(e) => { e.target.style.borderColor = 'var(--border)' }}
              />
              <span className="text-xs w-10" style={{ color: 'var(--muted-foreground)' }}>{t.unit}</span>
            </div>
          </SettingRow>
        ))}
      </Section>

      {/* Save */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 rounded-lg text-sm font-semibold transition-all"
          style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)', opacity: saving ? 0.6 : 1 }}
        >
          {saving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
        </button>
        {saved && (
          <span className="text-sm" style={{ color: '#00c9a7' }}>✓ บันทึกแล้ว</span>
        )}
        {error && (
          <span className="text-sm" style={{ color: '#ef4444' }}>{error}</span>
        )}
      </div>

      {/* Logout section */}
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: '#ef444440' }}>
        <div className="px-5 py-4 border-b" style={{ backgroundColor: '#ef444408', borderColor: '#ef444430' }}>
          <p className="font-semibold text-sm" style={{ color: '#ef4444' }}>ออกจากระบบ</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>ออกจากระบบ SensorHub และกลับสู่หน้า Login</p>
        </div>
        <div className="px-5 py-4 flex items-center justify-between" style={{ backgroundColor: 'var(--card)' }}>
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>เข้าสู่ระบบในฐานะ <span style={{ color: 'var(--foreground)' }}>Admin</span></p>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all"
            style={{ backgroundColor: '#ef4444', color: '#fff' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#dc2626' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ef4444' }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}

function Section({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
      <div className="px-5 py-4 border-b" style={{ backgroundColor: 'var(--secondary)', borderColor: 'var(--border)' }}>
        <p className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>{title}</p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{subtitle}</p>
      </div>
      <div style={{ backgroundColor: 'var(--card)' }}>
        {children}
      </div>
    </div>
  )
}

function SettingRow({ label, desc, children }: { label: string; desc: string; children: React.ReactNode }) {
  return (
    <div
      className="flex items-center justify-between px-5 py-4 border-b last:border-0"
      style={{ borderColor: 'var(--border)' }}
    >
      <div>
        <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{label}</p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{desc}</p>
      </div>
      <div className="ml-8 shrink-0">{children}</div>
    </div>
  )
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="relative w-11 h-6 rounded-full transition-all"
      style={{ backgroundColor: value ? 'var(--primary)' : 'var(--secondary)', border: '1px solid var(--border)' }}
    >
      <span
        className="absolute top-0.5 w-5 h-5 rounded-full transition-all"
        style={{ backgroundColor: '#fff', left: value ? 'calc(100% - 22px)' : '2px', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }}
      />
    </button>
  )
}
