#!/usr/bin/env bash
set -euo pipefail

ROOTDIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PIDDIR="$ROOTDIR/.pids"
LOGDIR="$ROOTDIR/logs"
mkdir -p "$PIDDIR" "$LOGDIR"

echo "Starting Project-iot services..."

# Start mosquitto (system service) if available
if command -v systemctl >/dev/null 2>&1; then
  echo "Starting mosquitto (systemctl)..."
  sudo systemctl start mosquitto || echo "Warning: failed to start mosquitto via systemctl"
fi

# Start backend (Project/backend)
BACKEND_DIR="$ROOTDIR/Project/backend"
BACKEND_PY="$BACKEND_DIR/.venv/bin/python3"
if [ -d "$BACKEND_DIR" ]; then
  echo "Starting backend..."
  pushd "$BACKEND_DIR" >/dev/null || true
  if [ -x "$BACKEND_PY" ]; then
    nohup "$BACKEND_PY" -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload > "$LOGDIR/backend.log" 2>&1 &
  else
    nohup python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload > "$LOGDIR/backend.log" 2>&1 &
  fi
  echo $! > "$PIDDIR/backend.pid"
  popd >/dev/null || true
else
  echo "Backend folder not found; skipping backend start"
fi

# Start frontend (Project/frontend) using pnpm if available
FRONTEND_DIR="$ROOTDIR/Project/frontend"
if command -v pnpm >/dev/null 2>&1 && [ -d "$FRONTEND_DIR" ]; then
  echo "Starting frontend (pnpm dev) on port 5173..."
  # Force Vite to bind to port 5173 and all interfaces for consistent checks
  nohup pnpm --prefix "$FRONTEND_DIR" dev -- --host 0.0.0.0 --port 5173 > "$LOGDIR/frontend.log" 2>&1 &
  echo $! > "$PIDDIR/frontend.pid"
else
  echo "pnpm not found or frontend folder missing; skipping frontend start"
fi

# Start iot-water-server (if exists)
IOT_DIR="$ROOTDIR/iot-water-server"
IOT_PY="$IOT_DIR/.venv/bin/python3"
if [ -f "$IOT_DIR/main.py" ]; then
  echo "Starting iot-water-server..."
  if [ -x "$IOT_PY" ]; then
    nohup "$IOT_PY" "$IOT_DIR/main.py" > "$LOGDIR/iot-server.log" 2>&1 &
  else
    nohup python3 "$IOT_DIR/main.py" > "$LOGDIR/iot-server.log" 2>&1 &
  fi
  echo $! > "$PIDDIR/iot-server.pid"
fi

echo "Start commands issued. PIDs saved to $PIDDIR. Logs: $LOGDIR"
#!/bin/bash
# เริ่มต้น Project-iot - สคริปต์เริ่มโครงการอัตโนมัติ
# Usage: chmod +x start-project.sh && ./start-project.sh

set -e

echo "════════════════════════════════════════════════════════════"
echo "  🌊 PROJECT-IOT - ระบบจัดการน้ำชลประทานอัจฉริยะ"
echo "════════════════════════════════════════════════════════════"
echo ""

PROJECT_ROOT="/home/sun/Project-iot"
BACKEND_DIR="$PROJECT_ROOT/Project/backend"
FRONTEND_DIR="$PROJECT_ROOT/Project/frontend"

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 ตรวจสอบสถานะก่อน...${NC}"
echo ""

# 1. ตรวจสอบ Mosquitto
echo -n "🔍 ตรวจสอบ Mosquitto... "
if systemctl is-active --quiet mosquitto; then
    echo -e "${GREEN}✅ ทำงานอยู่${NC}"
else
    echo -e "${YELLOW}⚠️  ไม่ทำงาน - กำลังเริ่ม...${NC}"
    sudo systemctl start mosquitto
    echo -e "${GREEN}✅ เริ่มแล้ว${NC}"
fi

# 2. ตรวจสอบ Backend
echo -n "🔍 ตรวจสอบ Backend... "
if pgrep -f "uvicorn" > /dev/null; then
    echo -e "${GREEN}✅ ทำงานอยู่${NC}"
else
    echo -e "${YELLOW}⚠️  ไม่ทำงาน - กำลังเริ่ม...${NC}"
    echo ""
    echo "📌 ให้เปิด Terminal ใหม่และรัน:"
    echo "   cd $BACKEND_DIR"
    echo "   source .venv/bin/activate"
    echo "   python -m uvicorn app.main:app --reload --port 8000"
    echo ""
fi

# 3. ตรวจสอบ Frontend
echo -n "🔍 ตรวจสอบ Frontend... "
if pgrep -f "pnpm dev" > /dev/null; then
    echo -e "${GREEN}✅ ทำงานอยู่${NC}"
else
    echo -e "${YELLOW}⚠️  ไม่ทำงาน - กำลังเริ่ม...${NC}"
    echo ""
    echo "📌 ให้เปิด Terminal ใหม่และรัน:"
    echo "   cd $FRONTEND_DIR"
    echo "   pnpm dev"
    echo ""
fi

echo ""
echo "════════════════════════════════════════════════════════════"
echo "  ✨ ระบบพร้อมใช้งาน!"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "🌐 เข้าถึงได้ที่:"
echo "   🖥️  Dashboard:    http://localhost:5173"
echo "   🔌 Backend API:  http://localhost:8000"
echo "   📚 API Docs:     http://localhost:8000/docs"
echo "   🐛 Swagger:      http://localhost:8000/redoc"
echo "   🌊 MQTT Broker:  localhost:1883"
echo ""
echo "🔐 ข้อมูลเข้าสู่ระบบ:"
echo "   Username: admin"
echo "   Password: Admin@1234"
echo ""
echo "💡 เคล็ดลับ:"
echo "   • ดูเอกสาร: cat USER_GUIDE_TH.md"
echo "   • ทดสอบ API: curl -X GET http://localhost:8000/docs"
echo "   • หยุดทั้งหมด: Ctrl+C ในแต่ละ Terminal"
echo ""
echo "════════════════════════════════════════════════════════════"
