#!/usr/bin/env bash
#
# Actualiza la configuración de nginx con la del repo (tarjetas.shop, www.tarjetas.shop).
# Elimina el sitio del host antiguo de Clouding si existe como archivo separado.
#
# Ejecutar en el servidor, desde la raíz del proyecto:
#   ./scripts/nginx-update.sh
#
# Requiere: sudo para copiar a /etc/nginx y recargar.
#

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CONF_SOURCE="$ROOT_DIR/nginx/memecards.conf"
SITES_AVAILABLE="/etc/nginx/sites-available"
SITES_ENABLED="/etc/nginx/sites-enabled"

if [ ! -f "$CONF_SOURCE" ]; then
  echo "No se encuentra $CONF_SOURCE. Ejecuta desde la raíz del proyecto."
  exit 1
fi

echo "=== Actualizar nginx (tarjetas.shop) ==="
echo ""

# Quitar sitio antiguo de Clouding si está en un archivo separado
OLD_CLOUDING="efef79cc-0938-42cc-8a5a-43020deccf0c.clouding.host"
for site in default clouding memecards-clouding "$OLD_CLOUDING"; do
  if [ -L "$SITES_ENABLED/$site" ] 2>/dev/null; then
    echo "  Desactivando sitio antiguo: $site"
    sudo rm -f "$SITES_ENABLED/$site"
  fi
done

# Buscar en sites-enabled si algún archivo contiene el host antiguo y no es nuestro memecards
for link in "$SITES_ENABLED"/*; do
  [ -e "$link" ] || continue
  target="$(readlink -f "$link" 2>/dev/null)"
  [ -f "$target" ] || continue
  if grep -q "$OLD_CLOUDING" "$target" 2>/dev/null && [ "$(basename "$target")" != "memecards" ]; then
    echo "  Desactivando sitio que usaba $OLD_CLOUDING: $(basename "$link")"
    sudo rm -f "$link"
  fi
done

echo "  Copiando memecards.conf (tarjetas.shop, www.tarjetas.shop)..."
sudo cp -f "$CONF_SOURCE" "$SITES_AVAILABLE/memecards"
sudo ln -sf "$SITES_AVAILABLE/memecards" "$SITES_ENABLED/memecards"

echo "  Comprobando configuración..."
if ! sudo nginx -t; then
  echo "  Error en la configuración de nginx. No se ha recargado."
  exit 1
fi

echo "  Recargando nginx..."
sudo systemctl reload nginx

echo ""
echo "=== Nginx actualizado ==="
echo "  Dominios activos: tarjetas.shop, www.tarjetas.shop, 200.234.228.73"
echo "  Certbot HTTPS: sudo certbot --nginx -d tarjetas.shop -d www.tarjetas.shop"
echo ""
