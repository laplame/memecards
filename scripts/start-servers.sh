#!/usr/bin/env bash
#
# Levanta frontend (Vite dev) y backend (Express) con puertos configurables.
# En producción: solo backend (sirve el build del frontend); nginx hace proxy al backend.
#
# Uso:
#   ./scripts/start-servers.sh           # producción: build + PM2 backend
#   ./scripts/start-servers.sh --dev      # desarrollo: backend + frontend dev
#   BACKEND_PORT=4000 ./scripts/start-servers.sh
#

set -e

# Directorio raíz del proyecto (donde está package.json)
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

# Puertos (modificables por variables de entorno)
export BACKEND_PORT="${BACKEND_PORT:-3000}"
export FRONTEND_DEV_PORT="${FRONTEND_DEV_PORT:-5173}"

# Host público (para BASE_URL y nginx)
export PUBLIC_HOST="${PUBLIC_HOST:-efef79cc-0938-42cc-8a5a-43020deccf0c.clouding.host}"
export BASE_URL="${BASE_URL:-http://${PUBLIC_HOST}}"

MODE="${1:-prod}"

echo "=== MemeCards - Puertos ==="
echo "  BACKEND_PORT: $BACKEND_PORT"
echo "  FRONTEND_DEV_PORT: $FRONTEND_DEV_PORT"
echo "  PUBLIC_HOST: $PUBLIC_HOST"
echo "  BASE_URL: $BASE_URL"
echo "  Modo: $MODE"
echo ""

if [ "$MODE" = "--dev" ]; then
  echo "Modo desarrollo: backend (puerto $BACKEND_PORT) + frontend Vite (puerto $FRONTEND_DEV_PORT)"
  echo "Nginx debe hacer proxy a backend en $BACKEND_PORT (o accede a frontend en http://localhost:$FRONTEND_DEV_PORT)"
  echo ""

  # Al salir (Ctrl+C), matar el backend
  cleanup() {
    if [ -f "$ROOT_DIR/.backend.pid" ]; then
      kill "$(cat "$ROOT_DIR/.backend.pid")" 2>/dev/null || true
      rm -f "$ROOT_DIR/.backend.pid"
    fi
  }
  trap cleanup EXIT

  # Backend en segundo plano con el puerto configurado
  (cd server && PORT=$BACKEND_PORT npm run dev &
   echo $! > "$ROOT_DIR/.backend.pid")

  # Frontend dev (en primer plano para ver logs; Ctrl+C mata frontend y backend)
  PORT=$FRONTEND_DEV_PORT npm run dev -- --port "$FRONTEND_DEV_PORT" --host
else
  echo "Modo producción: build + PM2 (backend en puerto $BACKEND_PORT)"
  echo ""

  # Build frontend y backend
  npm run build:all || { echo "Build falló. Revisa errores arriba."; exit 1; }

  # Exportar puerto para el proceso Node
  export PORT=$BACKEND_PORT

  # Iniciar con PM2 (usa ecosystem.config.cjs)
  if command -v pm2 &>/dev/null; then
    pm2 start ecosystem.config.cjs --update-env
    echo ""
    echo "Backend en PM2. Comandos: pm2 status | pm2 logs memecards-server | pm2 restart memecards-server"
  else
    echo "PM2 no instalado. Iniciando backend con node..."
    node server/dist/index.js
  fi
fi
