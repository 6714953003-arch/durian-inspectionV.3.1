# Bank_CHANGES_TH.md

เอกสารสรุปงานที่ Bank แก้ไข — สำหรับพี่ในทีมอ่านเพื่อทำตามให้ได้ผลลัพธ์เหมือนกัน

**อัปเดตล่าสุด:** 31 กรกฎาคม 2569

---

## สรุปสั้น ๆ ว่าแก้อะไรไป

| # | เรื่อง | ไฟล์ที่แตะ | commit |
|---|---|---|---|
| 1 | ทำให้ปุ่มสลับ Dark/Light Mode ใช้งานได้จริง | 4 ไฟล์ | `f62e344` |
| 2 | เขียน `requirements.txt` ให้ครบ (ของเดิมเป็น placeholder) | 1 ไฟล์ | `31a0824` |
| 3 | ต่อหน้า Login เข้ากับ backend จริง + จำ session | 3 ไฟล์ | `31a0824` |

**ไม่ได้แตะ:** UI ทุกหน้า, layout, ข้อความ, สีของ Dark Mode เดิม, โครงสร้าง backend, models, routers

---

## ส่วนที่ 1 — แก้บั๊ก Dark/Light Mode

### อาการเดิม

กดเลือก Light Mode ในหน้า Settings แล้วกด "บันทึกการตั้งค่า" แต่สีไม่เปลี่ยน

### สาเหตุที่แท้จริง (มี 2 จุด)

**จุดที่ 1** — `src/index.css` มีชุดตัวแปรสีชุดเดียวใน `:root` ซึ่งเป็นสีมืดทั้งหมด **ไม่มีชุดสีสว่างอยู่ในโปรเจกต์เลย** ต่อให้สั่งเปลี่ยนก็ไม่มีสีให้เปลี่ยนไป

**จุดที่ 2** — `handleSave()` ใน `SettingsPage.tsx` ทำแค่นี้:

```tsx
const handleSave = () => {
  setSaved(true)
  setTimeout(() => setSaved(false), 2000)
}
```

คือแค่โชว์ข้อความ "✓ บันทึกแล้ว" 2 วินาที **ไม่ได้เอาค่า `themeMode` ไปใช้จริง** และ `themeMode` เองก็เป็น `useState` ที่อยู่แค่ในหน้า Settings ไม่ได้ส่งออกไปไหน

### วิธีแก้

| ไฟล์ | ทำอะไร |
|---|---|
| `src/index.css` | **เพิ่ม** บล็อก `:root[data-theme='light']` ต่อท้าย — ค่าสีเดิมของ Dark Mode ไม่แตะเลยแม้แต่ค่าเดียว |
| `src/theme.ts` | **ไฟล์ใหม่** — ฟังก์ชัน 3 ตัว: `getSavedTheme()` / `applyTheme()` / `saveTheme()` ทำหน้าที่ตั้ง-ถอด attribute `data-theme` บน `<html>` และจำค่าใน localStorage |
| `src/main.tsx` | เรียก `applyTheme(getSavedTheme())` ก่อน render เพื่อให้รีเฟรชแล้วธีมไม่หาย |
| `src/pages/SettingsPage.tsx` | `useState('dark')` → `useState(getSavedTheme)` และเพิ่ม `saveTheme(themeMode)` ใน `handleSave` |

### หลักการทำงาน

ถ้า `<html>` **ไม่มี** attribute `data-theme="light"` → ใช้ค่าจาก `:root` เดิม (Dark Mode) เหมือนเดิม 100%
ถ้า **มี** → ค่าใน `:root[data-theme='light']` จะทับ เพราะ specificity สูงกว่า

พฤติกรรมคือ **ต้องกดปุ่ม "บันทึกการตั้งค่า" สีถึงจะเปลี่ยน** (ไม่ใช่เปลี่ยนทันทีตอนกดเลือกการ์ด)

### ยังไม่ได้แก้

การตั้งค่าอื่นในหน้า Settings — **ภาษา, refresh rate, เสียงแจ้งเตือน, ค่าเกณฑ์อุณหภูมิ/ความชื้น** — ยังเป็นแบบเดิมคือกดบันทึกแล้วไม่มีผลจริง (ปัญหาเดียวกับ theme แต่ยังไม่ได้ทำ)

---

## ส่วนที่ 2 — requirements.txt

### ปัญหาเดิม

ไฟล์ทั้งไฟล์เป็น comment หมด สั่ง `pip install -r requirements.txt` ไปก็ไม่ได้อะไรเลย:

```
# Placeholder: Backend Python dependencies
# fastapi
# sqlalchemy
# pydantic
# uvicorn
```

และรายชื่อที่ comment ไว้ก็**ยังไม่ครบ** — โค้ดจริงใน `app/auth.py` เรียกใช้ `python-jose` (ทำ JWT) กับ `passlib` (แฮชรหัสผ่าน) ซึ่งไม่มีในลิสต์

### ของใหม่

```
fastapi>=0.110
uvicorn>=0.27
sqlalchemy>=2.0
pydantic>=2.5
python-jose[cryptography]>=3.3
passlib[bcrypt]>=1.7.4
```

ไม่ล็อกเวอร์ชันตายตัว เพื่อให้ใช้ได้ทั้ง Python 3.10 และ 3.12

---

## ส่วนที่ 3 — ต่อหน้า Login เข้ากับ backend

### 🔴 เรื่องนี้สำคัญที่สุด กรุณาอ่าน

**หน้า Login เดิมไม่ได้คุยกับ backend เลยแม้แต่นิดเดียว**

```tsx
// โค้ดเดิมใน LoginPage.tsx
setLoading(true)
setTimeout(() => {
  setLoading(false)
  onLogin()        // ← ปล่อยเข้าเลย ไม่ถามใคร
}, 800)
```

มันเช็คแค่ว่า 2 ช่องไม่ว่าง → รอ 800 มิลลิวินาที (แกล้งทำเป็นกำลังโหลด) → ปล่อยเข้า

grep ทั้งโฟลเดอร์ `src/` แล้ว**ไม่พบ `fetch` หรือ `axios` แม้แต่จุดเดียว** ทุกหน้าอ่านข้อมูลจาก `src/data/mockData.ts` ทั้งหมด

**นี่คือคำตอบว่าทำไมแก้ `schemas.py` แล้วเหมือนไม่มีอะไรเกิดขึ้น** — เพราะ backend ไม่เคยถูกเรียกใช้เลยสักครั้ง จะแก้เป็นอะไรก็ไม่มีผล

### เรื่อง `str` กับตัวเลข

`str` คือ**ประเภทข้อมูล** ไม่ใช่**กฎตรวจสอบ** — `"12345"` เป็น `str` ที่ถูกต้องสมบูรณ์ Pydantic จึงปล่อยผ่าน

ทดสอบจริงกับ backend แล้วได้ผลตามนี้:

| ส่งอะไรไป | ผลลัพธ์ |
|---|---|
| `{"username": 12345}` (ตัวเลขจริง ไม่มีเครื่องหมายคำพูด) | **422** ปฏิเสธ |
| `{"username": "12345"}` (ข้อความที่มีแต่ตัวเลข) | **ผ่าน** |

และช่องกรอกในเบราว์เซอร์**ส่งเป็นข้อความเสมอ** ไม่ว่าจะพิมพ์อะไรลงไป พิมพ์ `12345` ก็ได้ `"12345"` ที่เป็น string ดังนั้น `str` จึงไม่มีทางกันตัวเลขได้เลยในทางปฏิบัติ

ถ้าจะห้ามจริง ต้องเขียนกฎเพิ่ม เช่น `field_validator` หรือ regex — **ยังไม่ได้ทำ** รอตกลงกันก่อนว่าอยากได้กฎแบบไหน

### ของใหม่

| ไฟล์ | ทำอะไร |
|---|---|
| `src/api.ts` | **ไฟล์ใหม่** — ตัวกลางคุยกับ backend ที่เดียว มี `login()`, `getToken()`, `clearSession()`, `authHeaders()` |
| `src/pages/LoginPage.tsx` | เปลี่ยนแค่ `handleSubmit` ให้ `await apiLogin()` แล้วค่อย `onLogin()` — **UI ไม่แตะเลยสักบรรทัด** |
| `src/App.tsx` | `useState(false)` → `useState(hasSession)` และเพิ่ม `handleLogout()` ที่ล้าง token |

### พฤติกรรมใหม่

| สถานการณ์ | ผลลัพธ์ |
|---|---|
| `admin` / `Admin@1234` | เข้าได้ + เก็บ JWT token ไว้ |
| รหัสผิด | ขึ้นข้อความแดง "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" (จาก 401 ของ backend) |
| backend ไม่ได้รัน | "เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ — ตรวจสอบว่า backend ทำงานอยู่หรือไม่" |
| กด F5 รีเฟรช | **ยังอยู่ในระบบ** (token เก็บใน localStorage) |
| กด Logout | ล้าง token จริง รีเฟรชแล้วไม่กลับเข้าไปอีก |

`authHeaders()` ใน `api.ts` เตรียมไว้ให้แล้วสำหรับเอาไปใช้ต่อหน้าอื่น (Dashboard, Zones, History) ที่ยังใช้ `mockData.ts` อยู่

---

## วิธีติดตั้งและรัน (ทำตามนี้จะได้ผลเหมือนกัน)

> ปรับ path ให้ตรงกับเครื่องพี่นะครับ ของ Bank อยู่ที่ `/home/sensor/durian`

### เตรียมเครื่อง (ทำครั้งเดียว)

**Node.js** ต้อง v20 ขึ้นไป (โปรเจกต์ใช้ Vite 8 + React 19 + Tailwind 4)

```bash
node -v    # ถ้าต่ำกว่า v20 หรือไม่มี ให้ติดตั้งด้วย nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
# ปิด terminal เปิดใหม่ แล้ว
nvm install 22
```

⚠️ **อย่าใช้ `sudo apt install nodejs`** จะได้เวอร์ชันเก่าเกินไป รันโปรเจกต์ไม่ได้

**Python venv** (ถ้ายังไม่มี)

```bash
sudo apt update
sudo apt install -y python3-venv python3-pip
```

> ถ้าขึ้น `ensurepip is not available` ให้ดูว่า Python เวอร์ชันอะไร (`python3 --version`) แล้วลง `python3.XX-venv` ให้ตรง เช่น `python3.10-venv`

⚠️ **`pnpm` ติดตั้งด้วย `apt` ไม่ได้** มันไม่ใช่แพ็กเกจของ Ubuntu ถ้าอยากใช้ต้อง `npm install -g pnpm` หรือ `corepack enable pnpm` — แต่ใช้ `npm` แทนได้เลย ผลเหมือนกัน

### รัน backend

```bash
cd <path>/Project/backend
python3 -m venv venv
source venv/bin/activate          # ต้องเห็น (venv) หน้า prompt
pip install --upgrade pip
pip install -r requirements.txt
python -m uvicorn app.main:app --port 8000
```

รอจนขึ้น `Application startup complete.` แล้ว**ทิ้ง terminal นี้ไว้** อย่าพิมพ์อะไรต่อ

**ทดสอบ:** เปิด http://localhost:8000/docs → หา `POST /api/auth/login` → Try it out → ใส่ `admin` / `Admin@1234` → Execute → ควรได้ `200` พร้อม `access_token`

### รัน frontend

เปิด terminal **อีกอัน**

```bash
cd <path>/Project/frontend
npm install
npm run dev
```

เปิด http://localhost:5173

⚠️ อย่าพิมพ์ `q` ใน terminal ที่รัน Vite อยู่ — เป็นคำสั่งปิด server

### ทดสอบว่าได้ผลเหมือนกัน

| # | ทดสอบ | ผลที่ควรได้ |
|---|---|---|
| 1 | `admin` / อะไรก็ได้ที่ผิด | ❌ ขึ้นแดง "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" |
| 2 | `admin` / `Admin@1234` | ✅ เข้า Dashboard ได้ |
| 3 | กด F5 | ✅ ยังอยู่ในระบบ |
| 4 | กด Logout | ✅ ออกมาหน้า Login |
| 5 | Settings → Light Mode → บันทึก | ✅ สีเปลี่ยนทั้งเว็บ |

**ข้อ 1 สำคัญที่สุด** ถ้าใส่รหัสผิดแล้วยังเข้าได้ แปลว่ายังใช้โค้ดเดิมอยู่

---

## ⚠️ ปัญหาที่เจอระหว่างทาง (ยังไม่ได้แก้)

### 1. ฐานข้อมูลไม่ใช่ MySQL — เป็น SQLite

`.env` ตั้งค่า MySQL ไว้ (`DB_HOST`, `DB_PORT=3306`, `DB_USER`, `DB_PASSWORD`) แต่ **`app/config.py` ไม่เคยอ่านตัวแปรพวกนั้นเลย** มันมองหา `DB_URL` / `DATABASE_URL` / `DB_URI` ซึ่งไม่มีใน `.env` สักตัว จึงตกไปใช้ค่าสำรอง:

```python
DB_URL = os.getenv("DB_URL") or os.getenv("DATABASE_URL") or os.getenv("DB_URI") \
         or f"sqlite:///{BASE_DIR / 'sensorhub.db'}"
```

**ผลคือข้อมูลลง SQLite ไฟล์ `backend/sensorhub.db` ทั้งหมด** ตัวแปร MySQL ทั้ง 5 ตัวเป็นค่าตายอยู่เฉย ๆ

ข่าวดีคือ `database.py` รองรับ MySQL ไว้แล้ว (`if DB_URL.startswith("sqlite")` ... `else`) และ SQLAlchemy เป็นตัวกลาง โค้ดใน `models.py` กับ router ทั้งหมด**ไม่ต้องแก้สักบรรทัด** ถ้าจะย้ายไป MySQL แค่แก้ `config.py` ให้ประกอบ `DB_URL` จากตัวแปรใน `.env` + ติดตั้ง driver (`pymysql`)

### 2. MQTT ยังไม่ได้เขียน

`dependency/mqtt_client.py` มีแค่ 2 บรรทัดที่เป็น comment ยังไม่มีโค้ดจริง

### 3. หน้าอื่นยังใช้ข้อมูลปลอม

Dashboard, ZoneList, ZoneDetail, History, Settings — ทุกหน้าอ่านจาก `src/data/mockData.ts` ยังไม่ได้ต่อ backend (ตอนนี้ต่อแค่ Login)

### 4. `commands/routers/` ซ้ำกับ `app/routers/`

ไม่แน่ใจว่าตั้งใจหรือเป็นของเก่าที่ค้างไว้ — `app/main.py` เรียกใช้แค่ `app/routers/` เท่านั้น

### 5. repo ใหญ่ 315MB

`node_modules/` (131MB) กับ `backend/.venv/` (118MB) ถูก commit ขึ้น repo เพราะไม่มี `.gitignore`

`.venv` ที่ติดมาใน repo **ใช้ไม่ได้** เพราะสร้างจากเครื่องคนอื่น path ข้างในผิด — Bank จึงสร้างใหม่ชื่อ `venv` แทนเพื่อไม่ให้ชนกัน

**ยังไม่ได้แก้** เพราะการถอด `node_modules` ออกจาก tracking จะกระทบทุกคนในทีม (ต้อง `npm install` เอง) ควรตกลงกันก่อน

### 6. เรื่องความปลอดภัย (ไม่ด่วน แต่ควรรู้)

`app/config.py` มีค่าเริ่มต้นเขียนไว้ในโค้ดที่ push ขึ้น public repo:

```python
JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret-change-me")
DEFAULT_ADMIN_PASSWORD = os.getenv("DEFAULT_ADMIN_PASSWORD", "Admin@1234")
```

และเพราะ `.env` มีแต่ค่า placeholder ระบบจึงใช้ค่า default พวกนี้จริง ๆ ตอนนี้ไม่เป็นไรเพราะรันแค่ในเครื่อง แต่**ถ้าจะ deploy ขึ้นอินเทอร์เน็ตจริงต้องแก้ก่อน**

หมายเหตุ: `auth.py` บรรทัด 22 (`user.password_hash = user.password_hash`) เป็น dead code ไม่มีผลอะไร และอยู่หลังการตรวจรหัสจริงไปแล้ว ไม่ใช่ช่องโหว่

---

## เรื่อง `sensorhub.db`

Bank commit ไฟล์นี้ขึ้น repo ตามที่พี่บอกว่าอยากเปิดดูข้อมูลได้

**ข้อควรระวัง:** `.db` เป็นไฟล์ binary ที่ git รวมให้ไม่ได้ ถ้าเราสองคนแก้ข้อมูลคนละเครื่องแล้ว push ทั้งคู่ จะเกิด conflict ที่แก้ได้ทางเดียวคือ**เลือกเอาไฟล์ของใครคนหนึ่งทั้งก้อน** อีกคนเสียข้อมูลไปเลย

เสนอให้ตกลงกันว่าใครจะเป็นคนอัปเดต `.db` หรือบอกกันก่อนทุกครั้งที่จะแก้

ไฟล์ปัจจุบันมี `login_history` ที่เกิดจากการทดสอบของ Bank เพิ่มเข้าไปแล้ว

---

## สิ่งที่ต้องตัดสินใจร่วมกัน

1. **กฎตรวจสอบ username** — "ตัวเลขเข้าได้แล้วเป็นปัญหาตรงไหน" อยากได้กฎแบบไหนกันแน่?
   - เข้มสุด: ตัวอักษรล้วน — แต่จะใช้ `farmer01`, `staff02` ไม่ได้
   - มาตรฐาน: `^[a-zA-Z0-9_]{3,20}$` + ต้องมีตัวอักษรอย่างน้อย 1 ตัว (กัน `12345` ได้)
   - หลวม: แค่ห้ามช่องว่างกับอักขระพิเศษ

   ⚠️ **รหัสผ่านห้ามจำกัดตัวเลขเด็ดขาด** จะทำให้รหัสอ่อนลงมาก และรหัสปัจจุบัน `Admin@1234` จะใช้ไม่ได้ทันที

2. **จะย้ายไป MySQL ไหม** ถ้าเป็นข้อบังคับของงานต้องแก้ `config.py`

3. **จะถอด `node_modules` ออกจาก repo ไหม** จะทำให้เล็กลงเหลือไม่กี่ MB แต่ทุกคนต้อง `npm install` เอง
