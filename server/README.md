# Audio Server Backend

Servidor backend con Node.js y TypeScript para subir, procesar y servir archivos de audio usando Multer y FFmpeg.

## Características

- ✅ Subida de archivos de audio con Multer
- ✅ Procesamiento de audio con FFmpeg
- ✅ Generación de URLs dinámicas
- ✅ **Creación de páginas únicas con audio** (cada URL es única)
- ✅ Streaming de audio con soporte para range requests
- ✅ Conversión de formatos de audio
- ✅ Obtención de información de archivos de audio

## Requisitos Previos

- Node.js 18+ 
- FFmpeg instalado en el sistema

### Instalar FFmpeg

**macOS:**
```bash
brew install ffmpeg
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install ffmpeg
```

**Windows:**
Descargar desde [ffmpeg.org](https://ffmpeg.org/download.html) o usar Chocolatey:
```bash
choco install ffmpeg
```

## Instalación

```bash
cd server
npm install
```

## Configuración

1. Copia el archivo `.env.example` a `.env`:
```bash
cp .env.example .env
```

2. Edita `.env` con tus configuraciones:
```env
PORT=3000
NODE_ENV=development
UPLOAD_DIR=./uploads
PROCESSED_DIR=./processed
PAGES_DIR=./pages-data
BASE_URL=http://localhost:3000
```

## Uso

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm run build
npm start
```

## Endpoints API

### POST /api/audio/upload
Sube un archivo de audio.

**Request:**
- Form-data con campo `audio` (archivo)

**Response:**
```json
{
  "success": true,
  "data": {
    "fileId": "uuid",
    "filename": "original.mp3",
    "size": 1234567,
    "mimetype": "audio/mpeg",
    "info": {
      "duration": 120.5,
      "bitrate": 192000,
      "format": "mp3",
      "sampleRate": 44100,
      "channels": 2
    },
    "uploadUrl": "http://localhost:3000/api/audio/file/uuid.mp3"
  }
}
```

### POST /api/audio/process
Sube y procesa un archivo de audio.

**Request:**
- Form-data con campo `audio` (archivo)
- Opcional: `format` (mp3, wav, ogg)
- Opcional: `bitrate` (número)
- Opcional: `sampleRate` (número)

**Response:**
```json
{
  "success": true,
  "data": {
    "originalPath": "./uploads/uuid.mp3",
    "processedPath": "./processed/uuid.mp3",
    "info": { ... },
    "url": "http://localhost:3000/api/audio/stream/uuid.mp3"
  }
}
```

### GET /api/audio/file/:filename
Obtiene el archivo original subido.

### GET /api/audio/stream/:filename
Stream de audio procesado (soporta range requests para reproductores).

### GET /api/audio/info/:filename
Obtiene información detallada de un archivo de audio.

### POST /api/audio/convert
Convierte un archivo de audio a otro formato.

**Request:**
- Form-data con campo `audio` (archivo)
- `format`: mp3, wav o ogg

### GET /api/audio/generate-url
Genera una URL dinámica para un archivo.

**Query params:**
- `filename`: nombre del archivo
- `expiresIn`: segundos hasta expiración (opcional)

## Sistema de Páginas Únicas con Audio

### POST /api/pages/create
Crea una nueva página única con audio. Cada página tiene su propia URL única.

**Request:**
- Form-data con campo `audio` (archivo)
- Opcional: `title` (título de la página)
- Opcional: `description` (descripción de la página)
- Opcional: `format` (mp3, wav, ogg)
- Opcional: `bitrate` (número)
- Opcional: `sampleRate` (número)

**Response:**
```json
{
  "success": true,
  "data": {
    "page": {
      "id": "uuid",
      "code": "ABC12345",
      "audioUrl": "http://localhost:3000/api/audio/stream/uuid.mp3",
      "title": "Mi Audio",
      "description": "Descripción del audio",
      "createdAt": "2026-01-24T...",
      "pageUrl": "http://localhost:3000/page/ABC12345"
    },
    "audio": {
      "info": { ... },
      "processedUrl": "http://localhost:3000/api/audio/stream/uuid.mp3"
    }
  }
}
```

### GET /page/:code
Sirve la página HTML única para reproducir el audio. Cada código genera una URL única.

**Ejemplo:**
- `http://localhost:3000/page/ABC12345` - Página única con reproductor de audio

### GET /api/pages/:code
Obtiene información de una página por su código único.

### GET /api/pages
Obtiene todas las páginas creadas.

### DELETE /api/pages/:code
Elimina una página por su código.

## Ejemplo de Uso con cURL

```bash
# Subir archivo
curl -X POST http://localhost:3000/api/audio/upload \
  -F "audio=@/path/to/audio.mp3"

# Procesar archivo
curl -X POST http://localhost:3000/api/audio/process \
  -F "audio=@/path/to/audio.mp3" \
  -F "format=mp3" \
  -F "bitrate=192"

# Convertir formato
curl -X POST http://localhost:3000/api/audio/convert \
  -F "audio=@/path/to/audio.wav" \
  -F "format=mp3"

# Generar URL dinámica
curl "http://localhost:3000/api/audio/generate-url?filename=audio.mp3&expiresIn=3600"

# Crear página única con audio
curl -X POST http://localhost:3000/api/pages/create \
  -F "audio=@/path/to/audio.mp3" \
  -F "title=Mi Audio Especial" \
  -F "description=Este es mi mensaje de audio"

# Obtener información de una página
curl http://localhost:3000/api/pages/ABC12345

# Obtener todas las páginas
curl http://localhost:3000/api/pages
```

## Ejemplo: Crear una Página Única con Audio

```bash
# 1. Sube un audio y crea una página única
curl -X POST http://localhost:3000/api/pages/create \
  -F "audio=@mi-audio.mp3" \
  -F "title=Mensaje de Voz" \
  -F "description=Escucha este mensaje especial"

# Respuesta incluirá una URL única como:
# "pageUrl": "http://localhost:3000/page/ABC12345"

# 2. Abre la URL en tu navegador para ver la página con reproductor de audio
# Cada código genera una URL completamente única
```

## Estructura del Proyecto

```
server/
├── src/
│   ├── index.ts                    # Punto de entrada
│   ├── routes/
│   │   ├── audio.routes.ts         # Rutas de audio
│   │   ├── page.routes.ts          # API de páginas
│   │   └── publicPage.routes.ts      # Páginas públicas
│   ├── services/
│   │   ├── audioProcessor.ts       # Servicio de procesamiento FFmpeg
│   │   ├── pageService.ts          # Gestión de páginas únicas
│   │   └── templateService.ts      # Renderizado de templates HTML
│   ├── templates/
│   │   └── audioPage.html          # Template HTML para páginas de audio
│   └── middleware/
│       ├── upload.ts               # Configuración Multer
│       └── errorHandler.ts         # Manejo de errores
├── uploads/                        # Archivos subidos (generado)
├── processed/                       # Archivos procesados (generado)
├── pages-data/                      # Datos de páginas (generado)
├── scripts/                         # Scripts de ejemplo
├── dist/                            # Build compilado (generado)
├── package.json
├── tsconfig.json
└── README.md
```
