#!/usr/bin/env bash
set -euo pipefail

ROOTDIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PIDDIR="$ROOTDIR/.pids"
LOGDIR="$ROOTDIR/logs"

echo "Project-iot status check"
echo "Root: $ROOTDIR"

echo
echo "1) System services"
if command -v systemctl >/dev/null 2>&1; then
  if systemctl is-active --quiet mosquitto; then
    echo "- mosquitto: active"
  else
    echo "- mosquitto: not active"
  fi
else
  if pgrep -x mosquitto >/dev/null 2>&1; then
    echo "- mosquitto: running (no systemctl)"
  else
    echo "- mosquitto: not running"
  fi
fi

echo
echo "2) Backend (FastAPI)"
if [ -f "$PIDDIR/backend.pid" ]; then
  pid=$(cat "$PIDDIR/backend.pid")
  if kill -0 "$pid" >/dev/null 2>&1; then
    echo "- backend: running (pid $pid)"
  else
    echo "- backend: pid file exists but process not running"
  fi
else
  echo "- backend: pid file not found"
fi

if command -v curl >/dev/null 2>&1; then
  if curl -sSf "http://localhost:8000/docs" >/dev/null 2>&1; then
    echo "  -> /docs reachable"
  else
    echo "  -> /docs not reachable"
  fi
fi

echo
echo "3) Frontend (Vite)"
if [ -f "$PIDDIR/frontend.pid" ]; then
  pid=$(cat "$PIDDIR/frontend.pid")
  if kill -0 "$pid" >/dev/null 2>&1; then
    echo "- frontend: running (pid $pid)"
  else
    echo "- frontend: pid file exists but process not running"
  fi
else
  echo "- frontend: pid file not found"
fi

if command -v curl >/dev/null 2>&1; then
  if curl -sSf "http://localhost:5173" >/dev/null 2>&1; then
    echo "  -> frontend server reachable"
  else
    echo "  -> frontend server not reachable"
  fi
fi

echo
echo "4) IoT server (iot-water-server)"
if [ -f "$PIDDIR/iot-server.pid" ]; then
  pid=$(cat "$PIDDIR/iot-server.pid")
  if kill -0 "$pid" >/dev/null 2>&1; then
    echo "- iot-water-server: running (pid $pid)"
  else
    echo "- iot-water-server: pid file exists but process not running"
  fi
else
  echo "- iot-water-server: pid file not found"
fi

echo
echo "5) Recent log tails"
for f in backend frontend iot-server; do
  logfile="$LOGDIR/${f}.log"
  if [ -f "$logfile" ]; then
    echo "--- $f log (last 10 lines) ---"
    tail -n 10 "$logfile" || true
  fi
done

echo
echo "Status check complete. PID files:"
ls -la "$PIDDIR" 2>/dev/null || true
#!/bin/bash
# check-status.sh - ตรวจสอบสถานะระบบ Project-iot
# Usage: chmod +x check-status.sh && ./check-status.sh

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║   🔍 PROJECT-IOT - ตรวจสอบสถานะระบบ"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Function: ตรวจสอบเซ็วรีส
check_service() {
    local service_name=$1
    local check_cmd=$2
    local port=$3
    
    echo -n "🔍 $service_name..."
    
    if eval "$check_cmd" > /dev/null 2>&1; then
        echo -e " ${GREEN}✅ ทำงานอยู่${NC}"
        if [ ! -z "$port" ]; then
            echo "   📍 Port: $port"
        fi
        return 0
    else
        echo -e " ${RED}❌ ไม่ทำงาน${NC}"
        return 1
    fi
}

# 1. ตรวจสอบ Mosquitto
echo "📡 MQTT BROKER"
echo "─────────────────────────────────────────────────────────"
check_service "Mosquitto" "systemctl is-active mosquitto" "1883"
mosquitto_status=$?

# 2. ตรวจสอบ Backend
echo ""
echo "🔌 BACKEND API"
echo "─────────────────────────────────────────────────────────"
check_service "Backend (uvicorn)" "pgrep -f 'uvicorn app.main'" "8000"
backend_status=$?

if [ $backend_status -eq 0 ]; then
    echo -n "   📊 API Health... "
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ OK${NC}"
    elif curl -s http://localhost:8000/ > /dev/null 2>&1; then
        echo -e "${GREEN}✅ OK (Response OK)${NC}"
    else
        echo -e "${YELLOW}⚠️  No response${NC}"
    fi
fi

# 3. ตรวจสอบ Frontend
echo ""
echo "🖥️  FRONTEND"
echo "─────────────────────────────────────────────────────────"
check_service "Frontend (Vite)" "pgrep -f 'pnpm dev'" "5173"
frontend_status=$?

if [ $frontend_status -eq 0 ]; then
    echo -n "   🌐 Web Server... "
    if curl -s http://localhost:5173 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ OK${NC}"
    else
        echo -e "${YELLOW}⚠️  Loading...${NC}"
    fi
fi

# 4. ตรวจสอบ Database
echo ""
echo "💾 DATABASE"
echo "─────────────────────────────────────────────────────────"
DB_FILE="/home/sun/Project-iot/Project/backend/sensorhub.db"
if [ -f "$DB_FILE" ]; then
    echo -e "📁 Database file... ${GREEN}✅ exists${NC}"
    SIZE=$(du -sh "$DB_FILE" | cut -f1)
    echo "   📊 Size: $SIZE"
else
    echo -e "📁 Database file... ${YELLOW}⚠️  not found${NC}"
fi

# 5. ตรวจสอบ Dependencies
echo ""
echo "📦 DEPENDENCIES"
echo "─────────────────────────────────────────────────────────"

echo -n "🐍 Python 3... "
if command -v python3 &> /dev/null; then
    py_version=$(python3 --version 2>&1 | awk '{print $2}')
    echo -e "${GREEN}✅ $py_version${NC}"
else
    echo -e "${RED}❌ Not installed${NC}"
fi

echo -n "📦 Node.js... "
if command -v node &> /dev/null; then
    node_version=$(node --version)
    echo -e "${GREEN}✅ $node_version${NC}"
else
    echo -e "${RED}❌ Not installed${NC}"
fi

echo -n "📦 pnpm... "
if command -v pnpm &> /dev/null; then
    pnpm_version=$(pnpm --version)
    echo -e "${GREEN}✅ $pnpm_version${NC}"
else
    echo -e "${RED}❌ Not installed${NC}"
fi

# 6. ตรวจสอบ Ports
echo ""
echo "🔌 PORTS"
echo "─────────────────────────────────────────────────────────"

echo -n "Port 1883 (MQTT)... "
if lsof -Pi :1883 -sTCP:LISTEN > /dev/null 2>&1; then
    echo -e "${GREEN}✅ In use${NC}"
else
    echo -e "${RED}❌ Available${NC}"
fi

echo -n "Port 5173 (Frontend)... "
if lsof -Pi :5173 -sTCP:LISTEN > /dev/null 2>&1; then
    echo -e "${GREEN}✅ In use${NC}"
else
    echo -e "${RED}❌ Available${NC}"
fi

echo -n "Port 8000 (Backend)... "
if lsof -Pi :8000 -sTCP:LISTEN > /dev/null 2>&1; then
    echo -e "${GREEN}✅ In use${NC}"
else
    echo -e "${RED}❌ Available${NC}"
fi

# 7. สรุป
echo ""
echo "═════════════════════════════════════════════════════════"
echo "📊 SUMMARY"
echo "═════════════════════════════════════════════════════════"

if [ $mosquitto_status -eq 0 ] && [ $backend_status -eq 0 ] && [ $frontend_status -eq 0 ]; then
    echo -e "${GREEN}✅ ระบบทั้งหมดทำงานปกติ${NC}"
    echo ""
    echo "🌐 เข้าถึงได้ที่:"
    echo "   • Dashboard:  http://localhost:5173"
    echo "   • Backend:    http://localhost:8000"
    echo "   • API Docs:   http://localhost:8000/docs"
else
    echo -e "${YELLOW}⚠️  บริการบางตัวไม่ทำงาน${NC}"
    echo ""
    echo "📌 วิธีเริ่มต้น:"
    echo ""
    
    if [ $mosquitto_status -ne 0 ]; then
        echo "Mosquitto:"
        echo "  sudo systemctl start mosquitto"
        echo ""
    fi
    
    if [ $backend_status -ne 0 ]; then
        echo "Backend:"
        echo "  cd /home/sun/Project-iot/Project/backend"
        echo "  source .venv/bin/activate"
        echo "  python -m uvicorn app.main:app --reload --port 8000"
        echo ""
    fi
    
    if [ $frontend_status -ne 0 ]; then
        echo "Frontend:"
        echo "  cd /home/sun/Project-iot/Project/frontend"
        echo "  pnpm dev"
        echo ""
    fi
fi

echo ""
echo "═════════════════════════════════════════════════════════"
