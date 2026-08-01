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

export interface LoginRecord {
  id: number
  user: string
  email: string
  action: 'login' | 'logout'
  status: 'success' | 'failed'
  ip: string
  device: string
  timestamp: string
}

/** ดึงประวัติการเข้า-ออกระบบจากฐานข้อมูลจริง */
export async function fetchLoginHistory(): Promise<LoginRecord[]> {
  let res: Response
  try {
    res = await fetch(`${API_BASE}/api/history/logins`, { headers: authHeaders() })
  } catch {
    throw new ApiError('เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ — ตรวจสอบว่า backend ทำงานอยู่หรือไม่')
  }
  if (!res.ok) {
    if (res.status === 401) throw new ApiError('เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่')
    throw new ApiError(`โหลดข้อมูลไม่สำเร็จ (รหัส ${res.status})`)
  }
  return (await res.json()) as LoginRecord[]
}

export interface ThresholdItem {
  parameter: string
  min_value: number
  max_value: number
}

/** อ่านค่าเกณฑ์จากฐานข้อมูล */
export async function fetchThresholds(): Promise<ThresholdItem[]> {
  let res: Response
  try {
    res = await fetch(`${API_BASE}/api/thresholds`, { headers: authHeaders() })
  } catch {
    throw new ApiError('เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ — ตรวจสอบว่า backend ทำงานอยู่หรือไม่')
  }
  if (!res.ok) {
    if (res.status === 401) throw new ApiError('เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่')
    throw new ApiError(`โหลดค่าเกณฑ์ไม่สำเร็จ (รหัส ${res.status})`)
  }
  return (await res.json()) as ThresholdItem[]
}

/** บันทึกค่าเกณฑ์ลงฐานข้อมูล — ส่งเฉพาะรายการที่แก้ ตัวอื่นในตารางไม่ถูกแตะ */
export async function saveThresholds(items: ThresholdItem[]): Promise<void> {
  let res: Response
  try {
    res = await fetch(`${API_BASE}/api/thresholds`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(items),
    })
  } catch {
    throw new ApiError('เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ — ตรวจสอบว่า backend ทำงานอยู่หรือไม่')
  }
  if (!res.ok) {
    if (res.status === 401) throw new ApiError('เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่')
    throw new ApiError(`บันทึกค่าเกณฑ์ไม่สำเร็จ (รหัส ${res.status})`)
  }
}

/** แจ้ง backend ว่าออกจากระบบ เพื่อบันทึกลงประวัติ แล้วล้าง token */
export async function logout(): Promise<void> {
  try {
    await fetch(`${API_BASE}/api/auth/logout`, { method: 'POST', headers: authHeaders() })
  } catch {
    // ต่อ backend ไม่ได้ก็ยังต้องออกจากระบบฝั่งเราให้สำเร็จ
  }
  clearSession()
}

/** ดาวน์โหลดประวัติเป็นไฟล์ CSV */
export async function exportLoginHistory(): Promise<void> {
  let res: Response
  try {
    res = await fetch(`${API_BASE}/api/history/logins/export`, { headers: authHeaders() })
  } catch {
    throw new ApiError('เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ — ตรวจสอบว่า backend ทำงานอยู่หรือไม่')
  }
  if (!res.ok) {
    if (res.status === 401) throw new ApiError('เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่')
    throw new ApiError(`ดาวน์โหลดไม่สำเร็จ (รหัส ${res.status})`)
  }
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `login-history-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
