#!/bin/bash

# Script para generar 100 páginas de ejemplo usando curl
# Requiere: curl, jq, y un archivo de audio de ejemplo

BACKEND_URL="${BACKEND_URL:-http://localhost:3000}"
AUDIO_FILE="${1:-dummy-audio.mp3}"
OUTPUT_DIR="./generated-qrs"

# Crear directorio de salida
mkdir -p "$OUTPUT_DIR"

# Verificar que el archivo de audio existe
if [ ! -f "$AUDIO_FILE" ]; then
  echo "❌ Error: Archivo de audio no encontrado: $AUDIO_FILE"
  echo ""
  echo "Uso: $0 [archivo_audio.mp3]"
  echo ""
  echo "Ejemplo:"
  echo "  $0 ../test-audio.mp3"
  exit 1
fi

echo "🚀 Generando 100 páginas de ejemplo..."
echo "📁 Archivo de audio: $AUDIO_FILE"
echo "🌐 Backend URL: $BACKEND_URL"
echo ""

# Títulos y descripciones
titles=(
  "Mensaje de Amor"
  "Tarjeta Especial"
  "Recuerdo Inolvidable"
  "Mensaje del Corazón"
  "Voz del Alma"
  "Mensaje Personal"
  "Tarjeta Única"
  "Mensaje Especial"
  "Recuerdo Eterno"
  "Voz del Amor"
)

descriptions=(
  "Un mensaje especial para ti"
  "Escucha este mensaje con atención"
  "Este audio contiene algo importante"
  "Un recuerdo que durará para siempre"
  "Mensaje grabado con cariño"
  "Escucha mi voz"
  "Un momento especial capturado"
  "Mensaje personalizado para ti"
  "Este audio es único"
  "Un regalo en forma de voz"
)

success_count=0
error_count=0

for i in {1..100}; do
  title_index=$(( (i - 1) % ${#titles[@]} ))
  desc_index=$(( (i - 1) % ${#descriptions[@]} ))
  
  title="${titles[$title_index]} #$i"
  description="${descriptions[$desc_index]} - Página $i"
  
  echo -n "[$i/100] Creando: $title... "
  
  # Crear página
  response=$(curl -s -X POST "$BACKEND_URL/api/pages/create" \
    -F "audio=@$AUDIO_FILE" \
    -F "title=$title" \
    -F "description=$description")
  
  # Extraer código y URL
  code=$(echo "$response" | jq -r '.data.page.code // empty')
  page_url=$(echo "$response" | jq -r '.data.page.pageUrl // empty')
  
  if [ -n "$code" ] && [ "$code" != "null" ]; then
    echo "✅ $code"
    echo "$page_url" >> "$OUTPUT_DIR/urls.txt"
    ((success_count++))
  else
    echo "❌ Error"
    echo "$response" >> "$OUTPUT_DIR/errors.log"
    ((error_count++))
  fi
  
  # Pequeña pausa para no sobrecargar
  sleep 0.2
done

echo ""
echo "✨ Generación completada!"
echo "📊 Resumen:"
echo "   ✅ Páginas creadas: $success_count/100"
echo "   ❌ Errores: $error_count"
echo "   📁 URLs guardadas en: $OUTPUT_DIR/urls.txt"
echo ""
echo "🌐 Visita el dashboard en: http://localhost:5173/dashboard"
