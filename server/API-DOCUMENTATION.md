# Documentación de la API

## Información General

**Base URL:** `http://localhost:3000`

**Versión de API:** `v1.0.0`

## Endpoints de Información

### GET /api
Obtiene información completa de la API, versión, detalles del servidor y endpoints disponibles.

**Response:**
```json
{
  "success": true,
  "data": {
    "name": "audio-server",
    "version": "1.0.0",
    "description": "Backend server for audio upload and processing",
    "environment": "development",
    "server": {
      "port": 3000,
      "baseUrl": "http://localhost:3000",
      "uptime": {
        "total": 3600,
        "formatted": "1h 0m 0s"
      },
      "nodeVersion": "v22.18.0",
      "platform": "darwin",
      "arch": "x64",
      "cpuCount": 8,
      "memory": {
        "total": 16.0,
        "free": 8.5,
        "used": 7.5,
        "unit": "GB"
      }
    },
    "features": {
      "audioProcessing": true,
      "pageGeneration": true,
      "storeManagement": true,
      "mongodb": true
    },
    "endpoints": { ... },
    "timestamp": "2026-01-24T..."
  }
}
```

### GET /api/version
Obtiene la versión de la API.

**Response:**
```json
{
  "success": true,
  "data": {
    "version": "1.0.0",
    "apiVersion": "v1",
    "timestamp": "2026-01-24T..."
  }
}
```

### GET /api/health
Estado de salud del servidor y servicios.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2026-01-24T...",
    "uptime": 3600,
    "services": {
      "server": "running",
      "mongodb": "connected",
      "storage": {
        "uploads": true,
        "processed": true
      }
    }
  }
}
```

## Endpoints de Páginas Dinámicas

### POST /api/pages/create
Crea una nueva página con audio. **Automáticamente genera 10 páginas adicionales.**

**Request:**
- Form-data:
  - `audio` (file): Archivo de audio
  - `title` (string, opcional): Título de la página
  - `description` (string, opcional): Descripción
  - `format` (string, opcional): mp3, wav, ogg
  - `bitrate` (number, opcional): Bitrate del audio
  - `sampleRate` (number, opcional): Sample rate del audio

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
      "description": "Descripción",
      "createdAt": "2026-01-24T...",
      "pageUrl": "http://localhost:3000/page/ABC12345"
    },
    "audio": {
      "info": {
        "duration": 120.5,
        "bitrate": 192000,
        "format": "mp3",
        "sampleRate": 44100,
        "channels": 2
      },
      "processedUrl": "http://localhost:3000/api/audio/stream/uuid.mp3"
    },
    "message": "Página creada. Se están generando 10 páginas adicionales automáticamente."
  }
}
```

**Nota:** Después de crear la página principal, se generan automáticamente 10 páginas adicionales en segundo plano.

### GET /api/pages
Obtiene todas las páginas creadas.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "code": "ABC12345",
      "audioUrl": "...",
      "title": "...",
      "pageUrl": "http://localhost:3000/page/ABC12345",
      "createdAt": "..."
    }
  ],
  "count": 11
}
```

### GET /api/pages/:code
Obtiene información de una página por código.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "code": "ABC12345",
    "audioUrl": "...",
    "title": "...",
    "pageUrl": "http://localhost:3000/page/ABC12345"
  }
}
```

### GET /page/:code
Sirve la página HTML pública para reproducir el audio.

**Response:** HTML completo con reproductor de audio

### DELETE /api/pages/:code
Elimina una página por código.

## Endpoints de Tiendas (MongoDB)

### GET /api/stores
Obtiene todas las tiendas (con filtros opcionales).

**Query params:**
- `city`: Filtrar por ciudad
- `state`: Filtrar por estado
- `isActive`: true/false
- `search`: Búsqueda de texto

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "69754938095b038136b75278",
      "name": "Papelería El Corazón",
      "address": "...",
      "latitude": 19.4326,
      "longitude": -99.1332,
      "city": "Ciudad de México",
      "pageUrl": "http://localhost:5173/69754938095b038136b75278"
    }
  ],
  "count": 6
}
```

### GET /api/stores/:id
Obtiene una tienda por ID de MongoDB.

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "69754938095b038136b75278",
    "name": "Papelería El Corazón",
    "address": "...",
    "latitude": 19.4326,
    "longitude": -99.1332
  }
}
```

### POST /api/stores
Crea una nueva tienda.

**Request:**
```json
{
  "name": "Mi Tienda",
  "address": "Calle Principal 123",
  "latitude": 19.4326,
  "longitude": -99.1332,
  "city": "Ciudad de México",
  "phone": "+52 55 1234 5678",
  "hours": "Lun-Sab: 9:00 AM - 8:00 PM"
}
```

## Ejemplos de Uso

### Crear una página con audio
```bash
curl -X POST http://localhost:3000/api/pages/create \
  -F "audio=@mi-audio.mp3" \
  -F "title=Mi Mensaje Especial" \
  -F "description=Este es mi mensaje de voz"
```

### Obtener información de la API
```bash
curl http://localhost:3000/api
```

### Obtener todas las páginas
```bash
curl http://localhost:3000/api/pages
```

### Acceder a una página pública
```bash
# Abre en navegador:
http://localhost:3000/page/ABC12345
```

### Obtener una tienda por ID
```bash
curl http://localhost:3000/api/stores/69754938095b038136b75278
```

## Flujo de Generación Automática

1. **Usuario crea página:**
   ```bash
   POST /api/pages/create
   → Retorna página principal inmediatamente
   ```

2. **Sistema genera automáticamente:**
   - 10 páginas adicionales en segundo plano
   - Cada una con código único
   - Todas usando el mismo audio

3. **Resultado:**
   - 1 página principal (creada por usuario)
   - 10 páginas adicionales (generadas automáticamente)
   - Total: 11 páginas con el mismo audio

## URLs Dinámicas

### Páginas de Audio
- Formato: `http://localhost:3000/page/{code}`
- Ejemplo: `http://localhost:3000/page/ABC12345`

### Tiendas
- Formato: `http://localhost:5173/{id}`
- Ejemplo: `http://localhost:5173/69754938095b038136b75278`
- Donde `{id}` es el ObjectId de MongoDB (24 caracteres hex)

## Estado de Servicios

El endpoint `/api/health` muestra el estado de:
- Servidor Express
- MongoDB Atlas
- Directorios de almacenamiento (uploads, processed)
