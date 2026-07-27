# 🚀 QUICK START - เริ่มต้นอย่างรวดเร็ว (5 นาที)

## ⏱️ สำหรับคนรีบ

```bash
# Terminal 1: Backend
cd /home/sun/Project-iot/Project/backend
source .venv/bin/activate
python -m uvicorn app.main:app --reload --port 8000

# Terminal 2: Frontend  
cd /home/sun/Project-iot/Project/frontend
pnpm dev

# Terminal 3: Monitor
watch -n 1 'ps aux | grep -E "uvicorn|pnpm|mosquitto" | grep -v grep'
```

## 🌐 เข้าถึง

| บริการ | URL | ชื่อผู้ใช้ | รหัสผ่าน |
|-------|-----|----------|---------|
| Dashboard | http://localhost:5173 | admin | Admin@1234 |
| Backend | http://localhost:8000 | - | JWT Token |
| API Docs | http://localhost:8000/docs | - | - |
| MQTT | localhost:1883 | - | - |

## 🔑 API Commands

### เข้าสู่ระบบ
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin@1234"}'
```

### ดึงข้อมูล Dashboard
```bash
TOKEN="your_token_here"
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/dashboard/summary
```

## 🐛 ปัญหาทั่วไป

| ปัญหา | คำสั่ง |
|-------|--------|
| Port 5173 ไม่ว่าง | `lsof -i :5173 && kill -9 <PID>` |
| Port 8000 ไม่ว่าง | `lsof -i :8000 && kill -9 <PID>` |
| MQTT ไม่ทำงาน | `sudo systemctl restart mosquitto` |
| Database lock | `cd backend && rm -f *.db*` |

## 📚 ไฟล์เอกสาร
- [USER_GUIDE_TH.md](USER_GUIDE_TH.md) - คู่มือแบบยาว 📖
- [ANALYSIS_REPORT_TH.md](ANALYSIS_REPORT_TH.md) - วิเคราะห์เชิงเทคนิค 📊

---
✅ **ระบบพร้อมใช้งาน!** ยินดีต้อนรับสู่ Project-iot 🌊
