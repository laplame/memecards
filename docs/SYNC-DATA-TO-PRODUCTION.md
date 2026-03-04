# Sincronizar datos locales a producción

Para usar en el servidor de producción los mismos datos que tienes en local (páginas, imágenes, audio, .env).

## Qué datos hay que subir

| Origen (local) | Destino (servidor) | Descripción |
|----------------|--------------------|-------------|
| `server/pages-data/` | `~/projects/memecards/server/pages-data/` | `pages.json` (tarjetas) y `nano-banana-usage.jsonl` |
| `server/images/` | `~/projects/memecards/server/images/` | Imágenes subidas y `optimized/` |
| `server/uploads/` | `~/projects/memecards/server/uploads/` | Archivos subidos (raw) |
| `server/processed/` | `~/projects/memecards/server/processed/` | Audio procesado |
| `.env` (claves) | `~/projects/memecards/.env` o variables PM2 | MONGODB_ATLAS, nano_banana, BASE_URL, etc. |

El backend en producción usa `PAGES_DIR=./server/pages-data`, `IMAGES_DIR=./server/images`, etc. (definidos en `ecosystem.config.cjs`), así que la estructura debe ser la misma que en local.

## Opción 1: rsync desde tu máquina

Desde tu **ordenador** (en la carpeta del proyecto):

```bash
# Sustituye cto@200.234.228.73 por tu usuario@servidor
SERVER="cto@200.234.228.73"
REMOTE="~/projects/memecards"

# Crear carpetas en el servidor si no existen
ssh $SERVER "mkdir -p $REMOTE/server/pages-data $REMOTE/server/images $REMOTE/server/uploads $REMOTE/server/processed"

# Sincronizar datos
rsync -avz --progress server/pages-data/    $SERVER:$REMOTE/server/pages-data/
rsync -avz --progress server/images/        $SERVER:$REMOTE/server/images/
rsync -avz --progress server/uploads/       $SERVER:$REMOTE/server/uploads/
rsync -avz --progress server/processed/     $SERVER:$REMOTE/server/processed/
```

## Opción 2: Script que empaqueta datos (local) y los sube

En **local**:

```bash
./scripts/package-data-for-production.sh
```

Eso genera `memecards-data.tar.gz`. Luego súbelo al servidor y descomprímelo:

```bash
scp memecards-data.tar.gz cto@200.234.228.73:~/projects/memecards/
ssh cto@200.234.228.73 "cd ~/projects/memecards && tar -xzf memecards-data.tar.gz && rm memecards-data.tar.gz"
```

## Opción 3: Solo pages.json (sin medios)

Si solo quieres las tarjetas (códigos, textos) y en producción no te importa perder imágenes/audio hasta que se vuelvan a subir:

```bash
scp server/pages-data/pages.json cto@200.234.228.73:~/projects/memecards/server/pages-data/
```

Las rutas a imágenes/audio en `pages.json` apuntarán a archivos que no existan en el servidor hasta que sincronices `server/images/`, `server/uploads/` y `server/processed/`.

## Variables de entorno en producción

En el servidor, el `.env` (o las variables que use PM2) deben tener al menos:

- **MONGODB_ATLAS** (o MONGODB_URI) – mismo que en local si quieres feed/votos/comentarios.
- **nano_banana** (o NANO_BANANA) – API key de Gemini para generación de imágenes.
- **BASE_URL** – URL pública, p. ej. `https://tarjetas.shop`
- Opcional: UNSPLASH_ACCESS_KEY, etc.

Puedes copiar el `.env` local (sin subirlo a git) y ajustar `BASE_URL`:

```bash
# En local: mostrar .env sin subirlo
cat .env

# En el servidor: crear/editar .env
ssh cto@200.234.228.73 "nano ~/projects/memecards/.env"
```

## Después de sincronizar

En el servidor:

```bash
cd ~/projects/memecards
pm2 restart memecards-backend
```

Comprueba que las tarjetas y medios cargan:

- `https://tarjetas.shop/feed`
- Abrir una tarjeta por código
