import { useState } from 'react'
import { ApiError, login as apiLogin } from '../api'

interface LoginPageProps {
  onLogin: () => void
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!username || !password) {
      setError('กรุณากรอกข้อมูลให้ครบถ้วน')
      return
    }
    setLoading(true)
    try {
      await apiLogin(username, password)
      onLogin()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'เกิดข้อผิดพลาด กรุณาลองใหม่')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ backgroundColor: 'var(--background)' }}
    >
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Glow */}
      <div
        className="absolute w-96 h-96 rounded-full blur-3xl opacity-10"
        style={{ background: 'radial-gradient(circle, var(--primary), transparent)', top: '20%', left: '50%', transform: 'translateX(-50%)' }}
      />

      <div className="relative w-full max-w-sm mx-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>SensorHub</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>IoT Environmental Monitor</p>
        </div>

        {/* Card */}
        <div
          className="p-8 rounded-2xl border"
          style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
        >
          <h2 className="text-lg font-semibold mb-6" style={{ color: 'var(--foreground)' }}>เข้าสู่ระบบ</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--muted-foreground)' }}>
                ชื่อผู้ใช้
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-all"
                style={{
                  backgroundColor: 'var(--secondary)',
                  color: 'var(--foreground)',
                  border: '1px solid var(--border)',
                }}
                onFocus={(e) => { e.target.style.borderColor = 'var(--primary)' }}
                onBlur={(e) => { e.target.style.borderColor = 'var(--border)' }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--muted-foreground)' }}>
                รหัสผ่าน
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-all"
                style={{
                  backgroundColor: 'var(--secondary)',
                  color: 'var(--foreground)',
                  border: '1px solid var(--border)',
                }}
                onFocus={(e) => { e.target.style.borderColor = 'var(--primary)' }}
                onBlur={(e) => { e.target.style.borderColor = 'var(--border)' }}
              />
            </div>

            {error && (
              <p className="text-sm text-red-400">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-semibold transition-all"
              style={{
                backgroundColor: 'var(--primary)',
                color: 'var(--primary-foreground)',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-4" style={{ color: 'var(--muted-foreground)' }}>
          SensorHub v2.1.0 — Secure Connection
        </p>
      </div>
    </div>
  )
}
