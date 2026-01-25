# Configuración de la Base de Datos

Para que la aplicación funcione correctamente, necesitas configurar la base de datos en Supabase.

## Pasos para Configurar

1. Ve a tu proyecto de Supabase en [https://supabase.com/dashboard](https://supabase.com/dashboard)

2. En el menú lateral, haz clic en "SQL Editor"

3. Copia todo el contenido del archivo `supabase-setup.sql` y pégalo en el editor

4. Haz clic en "Run" para ejecutar el script

Esto creará:
- La tabla `cards` con todos los campos necesarios
- Políticas de seguridad (RLS) para acceso público a las tarjetas
- Un bucket de almacenamiento llamado `card-audios` para los archivos de audio

## Verificar la Configuración

Para verificar que todo se configuró correctamente:

1. Ve a "Table Editor" en el menú lateral
2. Deberías ver la tabla `cards`
3. Ve a "Storage" y deberías ver el bucket `card-audios`

¡Listo! Tu aplicación ya está lista para usarse.
