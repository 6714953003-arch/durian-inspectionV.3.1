# Project-iot — ระบบจัดการน้ำแบบอัจฉริยะ

คู่มือนี้เป็นเอกสารสรุปสำหรับติดตั้ง ทดสอบ และใช้งาน Project-iot (Backend: FastAPI, Frontend: React, IoT: ESP/MQTT)

## ภาพรวมอย่างย่อ

- Backend: FastAPI (Python) ให้บริการ API, JWT authentication, และเชื่อมต่อกับฐานข้อมูล SQLite (พัฒนา)
- Frontend: React + Vite แสดง Dashboard, Zones, Tree details และการตั้งค่า
- IoT Server: ตัวอย่าง FastAPI + โค้ด ESP8266 ส่ง/รับข้อมูลผ่าน MQTT (Mosquitto)

## สิ่งที่รวมมาในโปรเจกต์

- โค้ด Backend: `Project/backend`
- โค้ด Frontend: `Project/frontend`
- โค้ด IoT server: `iot-water-server`
- ตัวอย่างสเก็ตช์ ESP8266: `esp8266/ESP8266.ino`
- เอกสารภาษาไทย: `README_TH.md`, `USER_GUIDE_TH.md`, `QUICK_START_TH.md`
- สคริปต์อำนวยความสะดวก: `start-project.sh`, `check-status.sh`

## ความต้องการของระบบ

- Python 3.10+
- Node.js 18+ และ `pnpm`
- Mosquitto MQTT broker
- คอมพิวเตอร์/เซิร์ฟเวอร์ที่รัน services (หรือแยกเครื่อง)

## วิธีการเริ่มต้น (Quick Start)

1. ติดตั้ง dependencies สำหรับ Backend

```bash
cd Project/backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

2. รันบริการ Mosquitto (บนเครื่องเดียวกันหรือระยะไกล)

```bash
sudo apt-get update
sudo apt-get install -y mosquitto mosquitto-clients
sudo systemctl start mosquitto
```

3. เรียกใช้ Backend

```bash
cd Project/backend
source .venv/bin/activate
python -m uvicorn app.main:app --reload --port 8000
```

4. ติดตั้งและรัน Frontend

```bash
cd Project/frontend
pnpm install
pnpm dev
# เข้าดูที่ http://localhost:5173
```

5. รัน IoT Server (ตัวอย่าง) หรือ อัพโหลดสเก็ตช์ ESP8266

```bash
cd iot-water-server
pip install -r requirements.txt
python3 main.py

# บน ESP8266: แก้ค่า WIFI/MQTT ใน esp8266/ESP8266.ino แล้วอัปโหลดผ่าน Arduino IDE หรือ PlatformIO
```

## คำสั่งทดสอบสำคัญ

- รัน unit tests (Backend):

```bash
cd Project/backend
source .venv/bin/activate
pytest tests/test_api.py -v
```

- ตรวจสอบ API docs (Swagger): http://localhost:8000/docs

## ข้อมูลประจำตัวสำหรับทดสอบ

```
Username: admin
Password: Admin@1234
```

## คำอธิบายเกี่ยวกับ MQTT topics ที่ใช้

- Publish (จากอุปกรณ์): `sensors/<deviceId>/reading` (JSON)
- Control (subscribe): `pump/+/control` (ข้อความ `on`/`off` หรือ `1`/`0`)
- Pump status publish: `pump/status`

## ไฟล์เอกสารเพิ่มเติม

- คู่มือผู้ใช้ (ไทย): `USER_GUIDE_TH.md`
- คู่มือเริ่มต้นด่วน (ไทย): `QUICK_START_TH.md`
- รายงานการวิเคราะห์ (ไทย): `ANALYSIS_REPORT_TH.md`
- สรุปการทดสอบ (ไทย): `TESTING_SUMMARY_TH.md`
- สรุปการเปลี่ยนแปลง (ไทย): `CHANGES_SUMMARY_TH.md`

## การนำไปใช้งานจริง (Production notes)

- เปลี่ยนจาก SQLite เป็น PostgreSQL หรือ MySQL
- ใช้การแฮชรหัสผ่านด้วย `bcrypt` หรือ `argon2` แทน plaintext
- ตั้งค่า TLS/SSL สำหรับ API และ MQTT
- ตั้งค่า environment variables สำหรับ secrets (ไม่เก็บใน repo)

## ปัญหาที่พบบ่อย & การแก้ไขเบื้องต้น

- ถ้า Frontend ไม่โหลด: ตรวจสอบว่า `pnpm dev` ทำงานและพอร์ต 5173 ว่าง
- ถ้า Backend ขึ้น error เรื่องฐานข้อมูล: ลองลบไฟล์ `.db` แล้วสตาร์ทใหม่ (สำหรับ dev)
- ถ้า MQTT ไม่เชื่อม: ตรวจสอบ `mosquitto` service และพอร์ต 1883

## ติดต่อ/ข้อมูลเพิ่มเติม

อ่านเอกสารฉบับเต็มได้ที่ไฟล์ในโฟลเดอร์โครงการ หรือสอบถามฉันเพื่อให้ช่วยตั้งค่าเพิ่มเติม

---

เอกสารนี้สร้างโดย GitHub Copilot — โปรดปรับแต่งข้อความสำหรับการใช้งานจริง
