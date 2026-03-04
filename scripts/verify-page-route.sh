#!/usr/bin/env bash
#
# Comprueba en el servidor que /page/:code va al backend y no al frontend.
# Ejecutar en el servidor: ./scripts/verify-page-route.sh [CODE]
# Si no pasas CODE, usa 3G8PW2R9.
#
# Si el backend responde con el HTML de la tarjeta (audioPage), verás "audioPage" o "Crea tu Tarjeta"
# dentro del body. Si nginx está mandando /page/ al frontend, verás el SPA (React) y quizá
# "root" id o "Crea tu Tarjeta" como título del formulario.
#

set -e

CODE="${1:-3G8PW2R9}"
BACKEND="http://127.0.0.1:3000"
PAGE_URL="$BACKEND/page/$CODE"

echo "=== Verificar ruta /page/ en producción ==="
echo "  Código: $CODE"
echo ""

echo "1. Backend directo (puerto 3000):"
if curl -s -o /tmp/page-backend.html -w "   HTTP %{http_code}\n" "$PAGE_URL"; then
  if grep -q "audioPage\|card-form\|tarjeta.*audio" /tmp/page-backend.html 2>/dev/null; then
    echo "   Contenido: parece template de tarjeta (audioPage) ✅"
  else
    echo "   Contenido: primeras líneas:"
    head -5 /tmp/page-backend.html | sed 's/^/   /'
  fi
else
  echo "   Error: backend no respondió (¿pm2 list | grep memecards-backend?)"
fi
echo ""

echo "2. Nginx (HTTPS, Host tarjetas.shop):"
# Sin SSL desde dentro del servidor podemos usar curl -k a localhost 443 o usar el dominio
RESP=$(curl -s -o /tmp/page-nginx.html -w "%{http_code}" "https://tarjetas.shop/page/$CODE" 2>/dev/null || true)
if [ -n "$RESP" ]; then
  echo "   HTTP $RESP"
  if grep -q "id=\"root\"\|react-root\|Crea tu Tarjeta.*Términos" /tmp/page-nginx.html 2>/dev/null; then
    echo "   Contenido: SPA (React) — nginx está enviando /page/ al FRONTEND ❌"
    echo ""
    echo "   Solución: aplicar la config que manda /page/ al backend:"
    echo "     ./scripts/nginx-update.sh"
    echo "     (y si existe sites-enabled/memecards-le-ssl.conf, desactivarlo: sudo rm /etc/nginx/sites-enabled/memecards-le-ssl.conf)"
  elif grep -q "audioPage\|card-form\|tarjeta.*audio" /tmp/page-nginx.html 2>/dev/null; then
    echo "   Contenido: template de tarjeta (backend) ✅"
  else
    echo "   Contenido: primeras líneas:"
    head -5 /tmp/page-nginx.html | sed 's/^/   /'
  fi
else
  echo "   No se pudo conectar (¿nginx escuchando 443?). Prueba en tu navegador: https://tarjetas.shop/page/$CODE"
fi
echo ""
echo "=== Fin ==="
