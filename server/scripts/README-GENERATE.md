# Scripts para Generar Páginas de Ejemplo

## Generar 100 Páginas con QR Codes

### Opción 1: Script Bash (Recomendado)

El script más simple que usa curl:

```bash
# Asegúrate de tener un archivo de audio
cd server
chmod +x scripts/generate-100-pages.sh

# Ejecutar (necesitas un archivo de audio)
./scripts/generate-100-pages.sh ../test-audio.mp3

# O si tienes un archivo en la carpeta server
./scripts/generate-100-pages.sh dummy-audio.mp3
```

**Requisitos:**
- `curl` instalado
- `jq` instalado (para parsear JSON): `brew install jq` (macOS) o `apt-get install jq` (Linux)
- Un archivo de audio (MP3, WAV, etc.)
- El servidor backend corriendo (`npm run dev`)

### Opción 2: Script TypeScript

```bash
cd server
npm install  # Instala las dependencias nuevas (qrcode, form-data, node-fetch)
npm run generate-pages
```

**Requisitos:**
- Un archivo `dummy-audio.mp3` en la carpeta `server/`
- El servidor backend corriendo

### Opción 3: Usar el Dashboard

La forma más fácil es usar el dashboard web:

1. Inicia el frontend: `npm run dev` (en la raíz del proyecto)
2. Inicia el backend: `cd server && npm run dev`
3. Ve a `http://localhost:5173/dashboard`
4. Crea páginas manualmente desde la interfaz

### Crear un Archivo de Audio de Prueba

Si no tienes un archivo de audio, puedes crear uno de prueba:

```bash
# Usando ffmpeg para crear un audio de silencio (1 segundo)
ffmpeg -f lavfi -i anullsrc=r=44100:cl=stereo -t 1 -q:a 9 -acodec libmp3lame dummy-audio.mp3

# O descargar un audio de prueba
curl -o test-audio.mp3 "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
```

### Verificar las Páginas Creadas

Después de generar las páginas:

1. Ve al dashboard: `http://localhost:5173/dashboard`
2. Verás todas las páginas con sus QR codes
3. Puedes descargar cada QR code individualmente
4. Puedes copiar las URLs para compartir

### Estructura de Archivos Generados

```
server/
├── generated-qrs/
│   ├── urls.txt          # Lista de todas las URLs
│   ├── errors.log        # Errores si los hay
│   └── qr-*.png          # QR codes individuales (si usas el script TS)
```

### Notas

- El script genera páginas en lotes para no sobrecargar el servidor
- Cada página tiene un código único de 8 caracteres
- Los QR codes se generan automáticamente en el dashboard
- Puedes eliminar páginas desde el dashboard si es necesario
