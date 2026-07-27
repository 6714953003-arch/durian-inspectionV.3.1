#!/usr/bin/env bash
set -euo pipefail

ROOTDIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PIDDIR="$ROOTDIR/.pids"
echo "Stopping Project-iot services..."

for name in backend frontend iot-server; do
  pidfile="$PIDDIR/${name}.pid"
  if [ -f "$pidfile" ]; then
    pid=$(cat "$pidfile")
    if kill -0 "$pid" >/dev/null 2>&1; then
      echo "Stopping $name (pid $pid)"
      kill "$pid" || echo "Failed to kill $pid"
      sleep 1
      if kill -0 "$pid" >/dev/null 2>&1; then
        echo "$name did not stop; sending SIGKILL"
        kill -9 "$pid" || true
      fi
    fi
    rm -f "$pidfile"
  fi
done

# Stop mosquitto if systemctl available
if command -v systemctl >/dev/null 2>&1; then
  echo "Stopping mosquitto (systemctl)..."
  sudo systemctl stop mosquitto || echo "Warning: failed to stop mosquitto via systemctl"
fi

echo "Stop complete. Check logs in $ROOTDIR/logs for details."

# Clear common ports used by the project (best-effort)
PORTS=(5173 5174 8000 1883)
echo "Cleaning listeners on ports: ${PORTS[*]}"
for port in "${PORTS[@]}"; do
  echo "- checking port $port"
  pids=()
  if command -v lsof >/dev/null 2>&1; then
    mapfile -t pids < <(lsof -ti :"$port" 2>/dev/null || true)
  else
    # parse ss output for pid=NNN
    mapfile -t pids < <(ss -ltnp 2>/dev/null | awk -v p=":$port" '$4 ~ p { if (match($0,/pid=[0-9]+/)) { pidstr=substr($0,RSTART,RLENGTH); gsub(/pid=/,"",pidstr); print pidstr } }')
  fi

  for pid in "${pids[@]}"; do
    [ -z "$pid" ] && continue
    # safety: don't kill very small pids or this script
    if [ "$pid" -le 2 ] || [ "$pid" -eq $$ ]; then
      echo "  skip pid $pid"
      continue
    fi
    if kill -0 "$pid" >/dev/null 2>&1; then
      owner=$(ps -o user= -p "$pid" 2>/dev/null | awk '{print $1}') || owner="?"
      if [ "$owner" = "$(whoami)" ]; then
        echo "  killing $pid (owned by $owner) on port $port"
        kill "$pid" || ( echo "  SIGTERM failed for $pid, SIGKILL"; kill -9 "$pid" || true )
      else
        echo "  process $pid on port $port owned by $owner; attempting sudo kill"
        sudo kill "$pid" || sudo kill -9 "$pid" || echo "  could not kill $pid"
      fi
    fi
  done
done

echo "Port cleaning complete."
