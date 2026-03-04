#!/usr/bin/env bash
#
# Sube las imágenes locales (server/images/) al servidor de producción
# para que el feed y las tarjetas muestren las fotos correctamente.
#
# Uso:
#   SERVER=cto@200.234.228.73 ./scripts/sync-images-to-production.sh
#   # o export SERVER y REMOTE antes:
#   export SERVER=cto@200.234.228.73
#   export REMOTE=~/projects/memecards
#   ./scripts/sync-images-to-production.sh
#
# Opcional: SYNC_RESTART=1 para reiniciar el backend tras subir (por defecto no reinicia).
#

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

SERVER="${SERVER:-cto@200.234.228.73}"
REMOTE="${REMOTE:-~/projects/memecards}"
IMAGES_DIR="$ROOT_DIR/server/images"

if [ ! -d "$IMAGES_DIR" ]; then
  echo "No existe la carpeta de imágenes: $IMAGES_DIR"
  exit 1
fi

echo "=== Subir imágenes a producción ==="
echo "  Origen:  $IMAGES_DIR"
echo "  Servidor: $SERVER"
echo "  Destino: $REMOTE/server/images/"
echo ""

# Crear carpeta en el servidor si no existe
ssh "$SERVER" "mkdir -p $REMOTE/server/images"

# Sincronizar imágenes (incluye optimized/ si existe)
rsync -avz --progress "$IMAGES_DIR/" "$SERVER:$REMOTE/server/images/"

echo ""
echo "Imágenes subidas correctamente."

if [ "${SYNC_RESTART:-0}" = "1" ]; then
  echo "Reiniciando backend..."
  ssh "$SERVER" "cd $REMOTE && pm2 restart memecards-backend"
  echo "Hecho."
else
  echo "Para reiniciar el backend en el servidor: ssh $SERVER 'cd $REMOTE && pm2 restart memecards-backend'"
fi
