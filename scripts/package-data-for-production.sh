#!/usr/bin/env bash
#
# Empaqueta datos locales (pages-data, images, uploads, processed) para subir a producción.
# Uso: ./scripts/package-data-for-production.sh
# Genera: memecards-data.tar.gz en la raíz del proyecto.
#

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

OUTPUT="$ROOT_DIR/memecards-data.tar.gz"

echo "Empaquetando datos para producción..."
echo "  Incluye: server/pages-data, server/images, server/uploads, server/processed"
echo ""

# Incluir solo lo que exista
INCLUDES=()
[ -d server/pages-data ] && INCLUDES+=(server/pages-data)
[ -d server/images ]     && INCLUDES+=(server/images)
[ -d server/uploads ]   && INCLUDES+=(server/uploads)
[ -d server/processed ] && INCLUDES+=(server/processed)

if [ ${#INCLUDES[@]} -eq 0 ]; then
  echo "No hay carpetas de datos (server/pages-data, server/images, server/uploads, server/processed)."
  exit 1
fi

tar -czf "$OUTPUT" "${INCLUDES[@]}"
echo "Creado: $OUTPUT"
echo ""
echo "Para subir al servidor:"
echo "  scp memecards-data.tar.gz cto@TU_SERVIDOR:~/projects/memecards/"
echo "  ssh cto@TU_SERVIDOR 'cd ~/projects/memecards && tar -xzf memecards-data.tar.gz && rm memecards-data.tar.gz && pm2 restart memecards-backend'"
