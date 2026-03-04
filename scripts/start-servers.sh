#!/usr/bin/env bash
#
# MemeCards: frontend (5173) + backend (3000).
# Libera los puertos, hace build y arranca ambos con PM2.
# Base URL: http://efef79cc-0938-42cc-8a5a-43020deccf0c.clouding.host
#
# Uso:
#   ./scripts/start-servers.sh           # producción: liberar puertos, build, PM2
#   ./scripts/start-servers.sh --dev     # desarrollo: backend + Vite dev (sin PM2)
#   BACKEND_PORT=4000 FRONTEND_PORT=5180 ./scripts/start-servers.sh
#

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

export BACKEND_PORT="${BACKEND_PORT:-3000}"
export FRONTEND_PORT="${FRONTEND_PORT:-5173}"
export PUBLIC_HOST="${PUBLIC_HOST:-efef79cc-0938-42cc-8a5a-43020deccf0c.clouding.host}"
export BASE_URL="${BASE_URL:-http://${PUBLIC_HOST}}"

MODE="${1:-prod}"

# Libera el puerto (mata procesos que lo usen)
kill_port() {
  local port="$1"
  if [ -z "$port" ]; then return; fi
  local pids
  pids=$(lsof -ti :"$port" 2>/dev/null) || true
  if [ -n "$pids" ]; then
    echo "  Liberando puerto $port (PIDs: $pids)..."
    echo "$pids" | xargs kill -9 2>/dev/null || true
    sleep 1
  fi
}

# Detiene y elimina apps MemeCards en PM2
pm2_clean() {
  if command -v pm2 &>/dev/null; then
    for name in backend frontend memecards-backend memecards-frontend memecards-server; do
      pm2 stop "$name" 2>/dev/null || true
      pm2 delete "$name" 2>/dev/null || true
    done
  fi
}

echo "=== MemeCards ==="
echo "  Backend:  port $BACKEND_PORT (API only)"
echo "  Frontend: port $FRONTEND_PORT (SPA)"
echo "  Base URL: $BASE_URL"
echo "  Modo:     $MODE"
echo ""

echo "Comprobando puertos..."
kill_port "$BACKEND_PORT"
kill_port "$FRONTEND_PORT"
echo ""

if [ "$MODE" = "--dev" ]; then
  echo "Modo desarrollo: backend ($BACKEND_PORT) + Vite dev ($FRONTEND_PORT)"
  echo ""

  cleanup() {
    if [ -f "$ROOT_DIR/.backend.pid" ]; then
      kill "$(cat "$ROOT_DIR/.backend.pid")" 2>/dev/null || true
      rm -f "$ROOT_DIR/.backend.pid"
    fi
  }
  trap cleanup EXIT

  (cd server && PORT=$BACKEND_PORT API_ONLY=true npm run dev &
   echo $! > "$ROOT_DIR/.backend.pid")

  npm run dev -- --port "$FRONTEND_PORT" --host
else
  echo "Modo producción: build + PM2 (backend $BACKEND_PORT, frontend $FRONTEND_PORT)"
  echo ""

  pm2_clean
  kill_port "$BACKEND_PORT"
  kill_port "$FRONTEND_PORT"

  npm run build:all || { echo "Build falló."; exit 1; }

  export PORT=$BACKEND_PORT
  export API_ONLY=true

  if command -v pm2 &>/dev/null; then
    pm2 start ecosystem.config.cjs --update-env
    echo ""
    echo "Apps en PM2:"
    echo "  memecards-backend  -> http://localhost:$BACKEND_PORT (API)"
    echo "  memecards-frontend -> http://localhost:$FRONTEND_PORT (SPA)"
    echo ""
    echo "Comandos: pm2 status | pm2 logs | pm2 restart memecards-backend memecards-frontend"
    echo "Base URL: $BASE_URL"
  else
    echo "PM2 no instalado. Iniciando manualmente..."
    (PORT=$BACKEND_PORT API_ONLY=true node server/dist/index.js &)
    (npm run preview -- --port "$FRONTEND_PORT" --host &)
    wait
  fi
fi
