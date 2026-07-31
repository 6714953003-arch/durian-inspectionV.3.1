const API_BASE = 'http://localhost:8000'

const TOKEN_KEY = 'sensorhub-token'
const USER_KEY = 'sensorhub-user'

export interface AuthUser {
  id: number
  username: string
  email: string | null
  role: string
}

export class ApiError extends Error {}

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function getUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? (JSON.parse(raw) as AuthUser) : null
  } catch {
    return null
  }
}

export function hasSession(): boolean {
  return getToken() !== null
}

export function clearSession(): void {
  try {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  } catch {}
}

export function authHeaders(): Record<string, string> {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function login(username: string, password: string): Promise<AuthUser> {
  let res: Response
  try {
    res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
  } catch {
    throw new ApiError('เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ — ตรวจสอบว่า backend ทำงานอยู่หรือไม่')
  }

  if (!res.ok) {
    if (res.status === 401) throw new ApiError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง')
    if (res.status === 422) throw new ApiError('รูปแบบข้อมูลไม่ถูกต้อง')
    throw new ApiError(`เข้าสู่ระบบไม่สำเร็จ (รหัส ${res.status})`)
  }

  const data = await res.json()
  try {
    localStorage.setItem(TOKEN_KEY, data.access_token)
    localStorage.setItem(USER_KEY, JSON.stringify(data.user))
  } catch {}
  return data.user as AuthUser
}
