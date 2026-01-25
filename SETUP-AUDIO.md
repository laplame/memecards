# Configuración de Audio

Hay dos opciones para almacenar los archivos de audio:

## Opción 1: Usar Supabase Storage (Recomendado si ya usas Supabase)

### Crear el bucket en Supabase

1. Ve a tu proyecto en Supabase Dashboard
2. Navega a **Storage** en el menú lateral
3. Haz clic en **New bucket**
4. Crea un bucket con:
   - **Name**: `card-audios`
   - **Public bucket**: ✅ Activado (para que las URLs sean públicas)

### O ejecuta el SQL

Ejecuta el siguiente SQL en el SQL Editor de Supabase:

```sql
-- Create storage bucket for audio files
INSERT INTO storage.buckets (id, name, public)
VALUES ('card-audios', 'card-audios', true)
ON CONFLICT (id) DO NOTHING;

-- Policy for uploading audio files
CREATE POLICY "Anyone can upload audio files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'card-audios');

-- Policy for reading audio files
CREATE POLICY "Anyone can view audio files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'card-audios');
```

## Opción 2: Usar el Backend Local

Si prefieres usar el backend que creamos (recomendado para desarrollo):

### 1. Configurar la variable de entorno

Crea o edita `.env` en la raíz del proyecto frontend:

```env
VITE_BACKEND_URL=http://localhost:3000
```

### 2. Asegúrate de que el backend esté corriendo

```bash
cd server
npm install
npm run dev
```

El backend automáticamente:
- Procesará el audio con FFmpeg
- Creará una página única con URL
- Almacenará el archivo procesado

### 3. El frontend usará automáticamente el backend

Si el bucket de Supabase no existe, el frontend automáticamente intentará usar el backend local.

## Solución de Problemas

### Error: "Bucket not found"

**Solución 1**: Crea el bucket en Supabase (ver Opción 1 arriba)

**Solución 2**: Usa el backend local (ver Opción 2 arriba)

### Error: "Permission dismissed" (Micrófono)

1. Ve a la configuración de tu navegador
2. Busca los permisos del sitio
3. Permite el acceso al micrófono
4. Recarga la página

### Error: "Backend no responde"

1. Verifica que el servidor esté corriendo: `cd server && npm run dev`
2. Verifica que el puerto 3000 esté disponible
3. Verifica la variable `VITE_BACKEND_URL` en tu `.env`

## Ventajas de cada opción

### Supabase Storage
- ✅ No requiere servidor adicional
- ✅ Escalable automáticamente
- ✅ CDN incluido
- ❌ Requiere cuenta de Supabase

### Backend Local
- ✅ Control total sobre el procesamiento
- ✅ Procesamiento con FFmpeg incluido
- ✅ Páginas únicas con URLs
- ✅ No requiere Supabase Storage
- ❌ Requiere servidor corriendo
- ❌ Requiere FFmpeg instalado
