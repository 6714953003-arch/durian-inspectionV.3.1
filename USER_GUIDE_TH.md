# คู่มือการใช้งาน Project-iot 🌊💧

## 📋 สารบัญ
1. [ภาพรวมระบบ](#-ภาพรวมระบบ)
2. [การเริ่มต้นใช้งาน](#-การเริ่มต้นใช้งาน)
3. [การใช้งานแต่ละส่วน](#-การใช้งานแต่ละส่วน)
4. [การทดสอบระบบ](#-การทดสอบระบบ)
5. [การแก้ไขปัญหา](#-การแก้ไขปัญหา)
6. [คำแนะนำสำหรับผู้พัฒนา](#-คำแนะนำสำหรับผู้พัฒนา)

---

## 📊 ภาพรวมระบบ

Project-iot เป็นระบบจัดการน้ำชลประทานอัจฉริยะที่ใช้เซนเซอร์ IoT เพื่อการจัดการน้ำแบบอัตโนมัติ

### 🏗️ สถาปัตยกรรม
```
┌─────────────────────────────────────────────────────────┐
│                   USER BROWSER (Port 5173)              │
│        React Frontend (Dashboard, Settings, etc)        │
└─────────────────────────────────────────────────────────┘
                           ↓ HTTP/JSON
┌─────────────────────────────────────────────────────────┐
│                 BACKEND API (Port 8000)                 │
│              FastAPI + SQLAlchemy + JWT                 │
│  • Authentication  • Dashboard  • Zones  • Trees        │
│  • Sensors  • Alerts  • History  • Settings             │
└─────────────────────────────────────────────────────────┘
        ↓ MQTT               ↓ SQLite               ↓
   ┌─────────────┐     ┌─────────────┐      [DATABASE]
   │ Mosquitto   │     │ SQLAlchemy  │
   │ MQTT Broker │     │ ORM Models  │
   │(Port 1883)  │     │             │
   └─────────────┘     └─────────────┘
        ↑
   [IoT Devices/Sensors]
```

### 🔧 ส่วนประกอบหลัก

| ส่วนประกอบ | ที่อยู่ | พอร์ต | สถานะ | ฟังก์ชัน |
|-----------|--------|-------|-------|---------|
| **Frontend** | `/Project/frontend` | 5173 | ✅ | Dashboard, Settings, Charts |
| **Backend** | `/Project/backend` | 8000 | ✅ | API Endpoints, Auth, Database |
| **MQTT** | Mosquitto | 1883 | ✅ | Sensor Data, IoT Communication |
| **Database** | SQLite (dev) | - | ✅ | User, Zone, Tree, Readings |

---

## 🚀 การเริ่มต้นใช้งาน

### 📌 ข้อมูลประจำตัวการเข้าสู่ระบบ
```
ชื่อผู้ใช้:  admin
รหัสผ่าน:   Admin@1234
```

### 🌐 การเข้าถึงระบบ

#### 1️⃣ **Dashboard (หน้าแรก)**
```
URL: http://localhost:5173
หรือ: http://[your-ip]:5173
```
- ไปที่ URL ด้านบนในเบราว์เซอร์
- ใส่ชื่อผู้ใช้และรหัสผ่าน
- กด Login

#### 2️⃣ **API Documentation**
```
URL: http://localhost:8000/docs
```
- Swagger UI - ทดสอบ API endpoints ได้เลย
- Redoc - ดู API documentation
- ปิด backend ไม่ได้

### 🎯 การสำรวจระบบ

#### Dashboard 📊
![Dashboard Features]
- แสดงสรุปข้อมูล (Zones, Trees, Sensors)
- กราฟอุณหภูมิและความชื้น
- สถานะปั๊มน้ำ
- การแจ้งเตือน

#### Zone List (รายการโซน) 📍
- ดูทุกโซนแจกจ่ายน้ำ
- 3 โซน (Zone 1, 2, 3)
- คลิกเพื่อดูรายละเอียด

#### Zone Detail (รายละเอียดโซน) 🌳
- ต้นไม้ 10 ต้นในแต่ละโซน
- ข้อมูลเซนเซอร์:
  - 🌡️ อุณหภูมิ
  - 💧 ความชื้น
  - 💡 แสง
  - 🌱 ความชื้นดิน
  - pH

#### History (ประวัติ) 📈
- ดูข้อมูลในอดีต
- คำสั่งควบคุมปั๊ม
- การแจ้งเตือน

#### Settings (การตั้งค่า) ⚙️
- ตั้งค่าเกณฑ์การแจ้งเตือน
- การตั้งค่าระบบ
- ภาษา (ปัจจุบันภาษาไทย)
- ธีม (Dark/Light)

---

## 🛠️ การใช้งานแต่ละส่วน

### 📱 Frontend (React Dashboard)

#### ❌ ปิด Frontend
```bash
# Ctrl+C ในเทอร์มินัลที่รัน pnpm dev
# หรือ
pkill -f "pnpm dev"
```

#### ✅ เปิด Frontend
```bash
cd /home/sun/Project-iot/Project/frontend
pnpm dev

# ผลลัพธ์:
#   VITE v8.0.3  ready in 123 ms
#   ➜  Local:   http://localhost:5173/
#   ➜  press h to show help
```

#### 🔧 สั่งการทั่วไป Frontend
```bash
# ติดตั้ง dependencies
pnpm install

# รัน dev server
pnpm dev

# สร้าง production build
pnpm build

# ดูตัวอย่าง build
pnpm preview

# Lint และ format code
pnpm lint
pnpm format
```

### 🔌 Backend (FastAPI)

#### ❌ ปิด Backend
```bash
# Ctrl+C ในเทอร์มินัลที่รัน uvicorn
# หรือ
pkill -f "uvicorn"
```

#### ✅ เปิด Backend
```bash
cd /home/sun/Project-iot/Project/backend
source .venv/bin/activate
python -m uvicorn app.main:app --reload --port 8000

# ผลลัพธ์:
#   INFO:     Uvicorn running on http://0.0.0.0:8000
#   INFO:     Application startup complete
```

#### 🧪 ทดสอบ Backend
```bash
cd /home/sun/Project-iot/Project/backend
pytest tests/test_api.py -v

# ผลลัพธ์ที่คาดหวัง:
#   test_login_and_dashboard_auth PASSED
#   test_dashboard_requires_auth PASSED
#   2 passed in 3.75s
```

#### 📚 API Endpoints หลัก

**Authentication**
```
POST   /api/auth/login          - เข้าสู่ระบบ
POST   /api/auth/logout         - ออกจากระบบ
GET    /api/auth/me             - ข้อมูลผู้ใช้ปัจจุบัน
```

**Dashboard**
```
GET    /api/dashboard/summary   - สรุปข้อมูล Dashboard
GET    /api/dashboard/zones     - รายการโซน
GET    /api/dashboard/trees     - รายการต้นไม้
```

**Zones**
```
GET    /api/zones               - ทุกโซน
GET    /api/zones/{id}          - โซนเฉพาะ
POST   /api/zones               - สร้างโซน
PUT    /api/zones/{id}          - แก้ไขโซน
DELETE /api/zones/{id}          - ลบโซน
```

**Trees**
```
GET    /api/trees               - ทุกต้นไม้
GET    /api/trees/{id}          - ต้นไม้เฉพาะ
GET    /api/zones/{zone_id}/trees - ต้นไม้ในโซน
```

**Sensors & Readings**
```
GET    /api/history/readings    - ประวัติการอ่าน
GET    /api/history/readings?limit=100 - 100 รายการล่าสุด
```

**Alerts**
```
GET    /api/alerts              - ทุกการแจ้งเตือน
GET    /api/alerts/active       - การแจ้งเตือนที่ใช้งาน
```

### 🌊 MQTT Broker (Mosquitto)

#### ✅ ตรวจสอบ MQTT
```bash
# ตรวจสอบสถานะ
sudo systemctl status mosquitto

# ผลลัพธ์:
#   Active: active (running)
```

#### 📤 ส่งข้อมูล MQTT ทดสอบ
```bash
# สร้างใหม่ใน terminal ใหม่
mosquitto_pub -h localhost -p 1883 -t "pump/status" -m '{"state": "on", "flow": 100}'

# ตัวอย่าง topics:
#   pump/status      - สถานะปั๊ม
#   pump/zone/control - ควบคุมปั๊มแต่ละโซน
#   sensors/+/temp   - ข้อมูลอุณหภูมิ
```

#### 📥 รับข้อมูล MQTT
```bash
# Subscribe ไปยัง topic ทั้งหมด
mosquitto_sub -h localhost -p 1883 -t "#" -v

# ตัวอย่าง:
#   sensors/tree1/temp 28.5
#   sensors/tree1/humidity 65.2
#   pump/status/zone1 {"state":"on"}
```

#### 🔧 จัดการ Mosquitto
```bash
# เริ่มต้น
sudo systemctl start mosquitto

# หยุด
sudo systemctl stop mosquitto

# รีสตาร์ท
sudo systemctl restart mosquitto

# ดูบันทึก
sudo tail -f /var/log/mosquitto/mosquitto.log
```

---

## 🧪 การทดสอบระบบ

### ✅ ทดสอบ API ด้วย curl

#### 1. เข้าสู่ระบบ
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin@1234"}'

# ผลลัพธ์:
# {
#   "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
#   "token_type": "bearer",
#   "user": {"id": 1, "username": "admin", ...}
# }
```

#### 2. ดึงข้อมูล Dashboard
```bash
# กำหนด TOKEN จากขั้นตอน 1
TOKEN="your_access_token_here"

curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/dashboard/summary

# ผลลัพธ์:
# {
#   "treeCount": 10,
#   "zoneCount": 3,
#   "avgTemperature": 31.2,
#   "avgHumidity": 72.1,
#   "activeAlerts": 2
# }
```

#### 3. ดึงรายการโซน
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/zones

# ผลลัพธ์:
# [
#   {"id": 1, "name": "Zone 1", "treeCount": 10, ...},
#   {"id": 2, "name": "Zone 2", "treeCount": 10, ...},
#   {"id": 3, "name": "Zone 3", "treeCount": 10, ...}
# ]
```

### 🧪 ทดสอบหน้าเว็บ

#### ทดสอบการเข้าสู่ระบบ
1. เปิด http://localhost:5173
2. ใส่ username: `admin`
3. ใส่ password: `Admin@1234`
4. กดปุ่ม Login
5. ตรวจสอบ Dashboard ปรากฏ

#### ทดสอบการนำทาง
1. คลิก "Zones" ดูรายการโซน
2. คลิกโซนใดโซนหนึ่ง ดูรายละเอียด
3. คลิก "History" ดูประวัติ
4. คลิก "Settings" ตั้งค่า

---

## 🔧 การแก้ไขปัญหา

### ❌ "Cannot connect to localhost:5173"
**ปัญหา**: Frontend ไม่ขึ้น

**วิธีแก้**:
```bash
# 1. ตรวจสอบว่า pnpm dev กำลังทำงาน
ps aux | grep pnpm

# 2. ถ้าไม่มี ให้เริ่มใหม่
cd /home/sun/Project-iot/Project/frontend
pnpm dev

# 3. ถ้ายังไม่ได้ ลบ cache
rm -rf node_modules .pnpm-store
pnpm install && pnpm dev
```

### ❌ "Cannot connect to localhost:8000"
**ปัญหา**: Backend ไม่ขึ้น

**วิธีแก้**:
```bash
# 1. ตรวจสอบว่า uvicorn กำลังทำงาน
ps aux | grep uvicorn

# 2. ถ้าไม่มี ให้เริ่มใหม่
cd /home/sun/Project-iot/Project/backend
source .venv/bin/activate
python -m uvicorn app.main:app --reload --port 8000

# 3. ถ้า port 8000 ใช้งานแล้ว
lsof -i :8000
# ให้ kill process ที่ใช้ port นั้น
```

### ❌ "MQTT Connection refused"
**ปัญหา**: Mosquitto ไม่ขึ้น

**วิธีแก้**:
```bash
# 1. ตรวจสอบสถานะ
sudo systemctl status mosquitto

# 2. เริ่มใหม่
sudo systemctl restart mosquitto

# 3. ดูบันทึก
sudo tail -f /var/log/mosquitto/mosquitto.log
```

### ❌ "Database locked" หรือ "no such table"
**ปัญหา**: ฐานข้อมูล SQLite มีปัญหา

**วิธีแก้**:
```bash
# 1. ลบฐานข้อมูลเดิม
cd /home/sun/Project-iot/Project/backend
rm -f *.db*

# 2. สตาร์ทใหม่ backend
# ตัวระบบจะสร้างฐานข้อมูลใหม่อัตโนมัติ
python -m uvicorn app.main:app --reload --port 8000
```

### ❌ "401 Unauthorized" หรือ "Invalid token"
**ปัญหา**: Token JWT หมดอายุหรือไม่ถูกต้อง

**วิธีแก้**:
```bash
# 1. ออกจากระบบ
# กดปุ่ม Logout ในอินเตอร์เฟซ

# 2. เข้าสู่ระบบใหม่
# ใส่ admin / Admin@1234
```

### ❌ ความเร็วช้าหรือ lag
**วิธีแก้**:
```bash
# 1. ตรวจสอบทรัพยากรระบบ
top -b -n 1 | head -15

# 2. หากใช้ CPU หรือ RAM มากไป ให้รีสตาร์ท
sudo systemctl restart mosquitto
pkill -f "uvicorn"
pkill -f "pnpm"

# 3. เริ่มทีละตัว
# Backend ก่อน → Frontend → MQTT
```

---

## 💡 คำแนะนำสำหรับผู้พัฒนา

### 📂 โครงสร้างไฟล์

```
/home/sun/Project-iot/
├── Project/
│   ├── backend/
│   │   ├── app/
│   │   │   ├── __init__.py
│   │   │   ├── main.py          ← จุดเข้า FastAPI
│   │   │   ├── auth.py          ← JWT & Password
│   │   │   ├── database.py      ← SQLAlchemy
│   │   │   ├── models.py        ← 10 ORM Models
│   │   │   ├── schemas.py       ← Pydantic Schemas
│   │   │   ├── seed.py          ← ข้อมูลเริ่มต้น
│   │   │   ├── config.py        ← การตั้งค่า
│   │   │   └── routers/         ← 8 API routers
│   │   ├── tests/
│   │   │   └── test_api.py      ← Unit tests (2 ตัว)
│   │   ├── .venv/               ← Virtual environment
│   │   ├── requirements.txt
│   │   └── pytest.ini
│   │
│   └── frontend/
│       ├── src/
│       │   ├── main.tsx         ← React entry point
│       │   ├── App.tsx          ← Main component
│       │   ├── index.css        ← Tailwind CSS
│       │   ├── components/      ← Reusable components
│       │   │   ├── Sidebar.tsx
│       │   │   └── Topbar.tsx
│       │   ├── pages/           ← Route pages
│       │   │   ├── LoginPage.tsx
│       │   │   ├── DashboardPage.tsx
│       │   │   ├── ZoneListPage.tsx
│       │   │   ├── ZoneDetailPage.tsx
│       │   │   ├── HistoryPage.tsx
│       │   │   └── SettingsPage.tsx
│       │   ├── data/
│       │   │   └── mockData.ts  ← Mock data
│       │   └── imports/
│       ├── node_modules/        ← Dependencies
│       ├── dist/                ← Build output
│       ├── package.json
│       ├── vite.config.ts       ← Vite configuration
│       └── tsconfig.json
│
├── iot-water-server/            ← IoT MQTT Server
│   ├── main.py
│   ├── mqtt_handler.py
│   ├── dashboard.html
│   └── requirements.txt
│
└── [Docs & Guides]
    ├── USER_GUIDE_TH.md         ← คู่มือนี้ 📖
    ├── ANALYSIS_REPORT.md
    ├── TESTING_SUMMARY.md
    └── CHANGES_SUMMARY.md
```

### 🔑 ไฟล์สำคัญที่ควรรู้

#### Backend Key Files
| ไฟล์ | ฟังก์ชัน |
|-----|---------|
| `app/main.py` | ตั้งค่า FastAPI, CORS, Routers |
| `app/models.py` | SQLAlchemy models (10 ตัว) |
| `app/schemas.py` | Pydantic request/response schemas |
| `app/database.py` | SQLAlchemy configuration |
| `app/auth.py` | JWT & password hashing |
| `app/seed.py` | ข้อมูลเริ่มต้น (3 zones, 10 trees) |
| `app/routers/*` | API endpoints |

#### Frontend Key Files
| ไฟล์ | ฟังก์ชัน |
|-----|---------|
| `src/main.tsx` | React entry point |
| `src/App.tsx` | Main routing & layout |
| `src/pages/*` | Page components |
| `src/components/*` | Reusable UI components |
| `src/data/mockData.ts` | Mock test data |

### 🛠️ คำสั่งการพัฒนา

#### Backend Development
```bash
# อัพเดท dependencies
cd /home/sun/Project-iot/Project/backend
.venv/bin/pip install -r requirements.txt

# เพิ่ม package ใหม่
.venv/bin/pip install [package-name]

# Lint code
.venv/bin/pytest --flake8

# Debug ด้วย ipdb
# เพิ่ม `breakpoint()` ในโค้ด
python -m uvicorn app.main:app --reload
```

#### Frontend Development
```bash
# อัพเดท dependencies
cd /home/sun/Project-iot/Project/frontend
pnpm update

# เพิ่ม package ใหม่
pnpm add [package-name]

# ลบ package
pnpm remove [package-name]

# Format code
pnpm format

# Lint
pnpm lint
```

### 📝 Git Workflow

```bash
# Clone repository
git clone [your-repo-url]

# Create feature branch
git checkout -b feature/new-feature

# Commit changes
git add .
git commit -m "feat: add new feature"

# Push to remote
git push origin feature/new-feature

# Create Pull Request on GitHub
```

### 🐛 Debugging Tips

#### Backend Debugging
```bash
# เพิ่มบรรทัดนี้ในโค้ด Python
breakpoint()  # หรือ import pdb; pdb.set_trace()

# ตรวจสอบ logs
tail -f /tmp/uvicorn.log

# ตรวจสอบ database
sqlite3 sensorhub.db
.tables
SELECT * FROM users;
```

#### Frontend Debugging
```bash
# ใช้ Chrome DevTools
# F12 ในเบราว์เซอร์

# ตรวจสอบ console errors
# Console tab → ดูข้อความ error

# เพิ่ม console.log ในโค้ด
console.log('Debug:', variable);

# ตรวจสอบ network requests
# Network tab → ดูทุก request/response
```

### 📚 Resources

- **FastAPI Docs**: https://fastapi.tiangolo.com/
- **React Docs**: https://react.dev/
- **Vite Docs**: https://vitejs.dev/
- **SQLAlchemy Docs**: https://docs.sqlalchemy.org/
- **Mosquitto Docs**: https://mosquitto.org/man/

---

## 🎯 Workflow ทั่วไป

### วันแรก: Setup & Testing
```
1. ติดตั้ง dependencies ทั้งหมด ✅
2. เริ่ม 3 services (Backend, Frontend, MQTT) ✅
3. ทดสอบ API ด้วย curl ✅
4. เข้า Dashboard ทดสอบ UI ✅
```

### วันปกติ: Development
```
1. เปิด 3 terminals สำหรับ 3 services
   - Terminal 1: Backend (uvicorn)
   - Terminal 2: Frontend (pnpm dev)
   - Terminal 3: Monitor logs
2. ทำการเปลี่ยนแปลงโค้ด
3. Hot reload จะทำอัตโนมัติ
4. ทดสอบใน browser & API docs
5. Commit & Push
```

### ก่อน Deploy: Checklist
- [ ] ทั้งหมด tests ผ่าน
- [ ] ไม่มี console errors/warnings
- [ ] .env files ถูกกำหนดไว้
- [ ] Database ตั้งค่าถูกต้อง
- [ ] MQTT broker ทำงาน
- [ ] API documentation อัพเดท

---

## 📞 ติดต่อ & Support

### ไฟล์ Documentation อื่น ๆ
- 📄 [ANALYSIS_REPORT.md](./ANALYSIS_REPORT.md) - วิเคราะห์เชิงเทคนิค
- 📄 [TESTING_SUMMARY.md](./TESTING_SUMMARY.md) - สรุปการทดสอบ
- 📄 [CHANGES_SUMMARY.md](./CHANGES_SUMMARY.md) - ประวัติการแก้ไข

### ระบบปฏิบัติการที่สนับสนุน
- ✅ Ubuntu 22.04 LTS
- ✅ Debian 12
- ✅ macOS (Intel/Apple Silicon)
- ✅ Windows WSL2

### Version Requirements
- Python: 3.10+
- Node.js: 18+
- npm/pnpm: 8+
- SQLite: 3.0+

---

## ⚠️ ข้อควรจำ

### ⚡ Production vs Development
```
DEVELOPMENT (Current):
- ✅ Auto-reload enabled
- ✅ Debug mode ON
- ✅ Plaintext passwords (NOT SECURE)
- ✅ SQLite database
- ✅ CORS open to localhost

PRODUCTION (Before Deploy):
- ❌ Auto-reload disabled
- ❌ Debug mode OFF
- ✅ bcrypt/argon2 passwords (REQUIRED)
- ✅ PostgreSQL database
- ✅ CORS restricted
- ✅ HTTPS/SSL enabled
- ✅ Environment variables .env
```

### 🔐 ความปลอดภัย
- ❌ **ไม่**ใช้รหัสผ่านปกติในการผลิต
- ❌ **ไม่**เปิด Debug mode บนเซิร์ฟเวอร์สาธารณะ
- ✅ ใช้ environment variables สำหรับ secrets
- ✅ ตรวจสอบ JWT token
- ✅ ตั้งค่า CORS อย่างถูกต้อง

---

**อัปเดตล่าสุด**: 26 กรกฎาคม 2026  
**สถานะ**: ✅ พร้อมใช้งาน  
**เวอร์ชัน**: 1.0  

---

*สร้างโดย: GitHub Copilot*  
*สำหรับ: Project-iot Water Management System*  
*ภาษา: 🇹🇭 ไทย*
