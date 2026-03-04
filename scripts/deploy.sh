#!/usr/bin/env bash
#
# Despliegue MemeCards: instala PM2 y nginx si hace falta, build y arranque.
# Ejecutar en el servidor dentro del proyecto (tras git pull).
#
# Uso:
#   ./scripts/deploy.sh              # build + nginx + PM2 (asume PM2 y nginx ya instalados)
#   ./scripts/deploy.sh --install     # instala nginx y PM2 si faltan, luego build + arranque
#
# Después: certbot y git push se hacen a mano.
#

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

INSTALL_DEPS=false
for arg in "$@"; do
  [ "$arg" = "--install" ] && INSTALL_DEPS=true
done

echo "=== MemeCards – Despliegue ==="
echo "  Directorio: $ROOT_DIR"
echo ""

# --- Instalar nginx y PM2 si se pide ---
if [ "$INSTALL_DEPS" = true ]; then
  echo ">>> Comprobando e instalando dependencias del sistema..."

  if ! command -v nginx &>/dev/null; then
    echo "  Instalando nginx..."
    sudo apt-get update -qq
    sudo apt-get install -y nginx
  else
    echo "  nginx ya instalado."
  fi

  if ! command -v node &>/dev/null; then
    echo "  Node.js no encontrado. Instálalo manualmente (nvm, NodeSource o apt) y vuelve a ejecutar."
    exit 1
  fi

  if ! command -v pm2 &>/dev/null; then
    echo "  Instalando PM2 globalmente..."
    sudo npm install -g pm2
  else
    echo "  PM2 ya instalado."
  fi

  echo ""
fi

# --- Dependencias npm (incluye dev para el build) ---
echo ">>> Instalando dependencias npm (raíz)..."
npm ci 2>/dev/null || npm install

echo ">>> Instalando dependencias npm (server)..."
(cd server && npm ci 2>/dev/null || npm install)

# --- Build ---
echo ">>> Build frontend + server..."
npm run build:all

# --- Nginx ---
echo ">>> Configurando nginx..."
sudo cp -f "$ROOT_DIR/nginx/memecards.conf" /etc/nginx/sites-available/memecards
sudo ln -sf /etc/nginx/sites-available/memecards /etc/nginx/sites-enabled/memecards
sudo nginx -t && sudo systemctl reload nginx
echo "  Nginx recargado."

# --- PM2: liberar puertos, arrancar ---
echo ">>> Arrancando aplicación con PM2..."
export PORT=3000
export API_ONLY=true

if command -v pm2 &>/dev/null; then
  for name in memecards-backend memecards-frontend memecards-server; do
    pm2 delete "$name" 2>/dev/null || true
  done
  for port in 3000 5173; do
    pids=$(lsof -ti :"$port" 2>/dev/null) || true
    [ -n "$pids" ] && echo "$pids" | xargs kill -9 2>/dev/null || true
  done
  sleep 1

  pm2 start ecosystem.config.cjs --update-env
  pm2 save
  echo ""
  echo "  PM2 apps: memecards-backend (3000), memecards-frontend (5173)"
  echo "  Comandos: pm2 status | pm2 logs | pm2 restart memecards-backend memecards-frontend"
  echo ""
  echo "  Para que PM2 arranque al reiniciar el servidor, ejecuta (si no lo has hecho):"
  echo "    pm2 startup"
  echo "  y luego el comando que te muestre (suele llevar sudo)."
else
  echo "  PM2 no está instalado. Usa: ./scripts/deploy.sh --install"
  exit 1
fi

echo ""
echo "=== Despliegue listo ==="
echo "  URL: http://efef79cc-0938-42cc-8a5a-43020deccf0c.clouding.host"
echo "  Certbot (HTTPS): hacerlo manualmente cuando quieras."
echo "  git push: hacerlo desde tu máquina cuando quieras subir cambios."
