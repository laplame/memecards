#!/bin/bash

# Script de ejemplo para crear una página con audio
# Uso: ./create-page-example.sh /ruta/al/audio.mp3

if [ -z "$1" ]; then
  echo "Uso: $0 <archivo_audio> [titulo] [descripcion]"
  exit 1
fi

AUDIO_FILE="$1"
TITLE="${2:-Audio Player}"
DESCRIPTION="${3:-Reproduce el audio}"
BASE_URL="${BASE_URL:-http://localhost:3000}"

echo "Subiendo y creando página para: $AUDIO_FILE"
echo "Título: $TITLE"
echo "Descripción: $DESCRIPTION"
echo ""

RESPONSE=$(curl -s -X POST "$BASE_URL/api/pages/create" \
  -F "audio=@$AUDIO_FILE" \
  -F "title=$TITLE" \
  -F "description=$DESCRIPTION")

echo "Respuesta del servidor:"
echo "$RESPONSE" | jq '.'

# Extraer la URL de la página
PAGE_URL=$(echo "$RESPONSE" | jq -r '.data.page.pageUrl // empty')

if [ -n "$PAGE_URL" ] && [ "$PAGE_URL" != "null" ]; then
  echo ""
  echo "✅ Página creada exitosamente!"
  echo "🌐 URL: $PAGE_URL"
  echo ""
  echo "Abre esta URL en tu navegador para ver la página de audio."
else
  echo ""
  echo "❌ Error al crear la página"
fi
