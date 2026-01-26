# Configuración de Audio

Este proyecto usa el backend local para procesar y almacenar archivos de audio.

## Backend Local (Recomendado)

El backend local procesa los archivos de audio usando FFmpeg y los almacena en el sistema de archivos.

### Requisitos

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

### Configuración

1. Asegúrate de que el servidor backend esté corriendo:
```bash
cd server
npm install
npm run dev
```

2. Verifica la variable `VITE_BACKEND_URL` en tu `.env`:
```env
VITE_BACKEND_URL=http://localhost:3000
```

3. El backend procesará automáticamente los archivos de audio y los guardará en:
   - `server/uploads/` - Archivos originales
   - `server/processed/` - Archivos procesados

### Ventajas del Backend Local

- ✅ No requiere servicios externos
- ✅ Control total sobre el procesamiento
- ✅ Procesamiento rápido con FFmpeg
- ✅ Almacenamiento local

## Solución de Problemas

### Error: "Error al crear la tarjeta"

**Solución**: Verifica que el servidor backend esté corriendo en el puerto configurado (por defecto 3000)

```bash
# Verificar que el servidor esté corriendo
curl http://localhost:3000/api/health
```

### Error: "FFmpeg no encontrado"

**Solución**: Instala FFmpeg en tu sistema (ver instrucciones arriba)

### Error: "No se pudo acceder al micrófono"

**Solución**: 
1. Permite el acceso al micrófono en la configuración de tu navegador
2. Asegúrate de que estés usando HTTPS o localhost (los navegadores requieren permisos para micrófono)
