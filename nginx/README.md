# Nginx – MemeCards en Clouding

Configuración para exponer MemeCards en **http://efef79cc-0938-42cc-8a5a-43020deccf0c.clouding.host/** mediante nginx como proxy inverso al backend Node.

## Puertos

- **Backend (Node):** por defecto `3000`. Se cambia con `BACKEND_PORT` en `scripts/start-servers.sh`.
- Si cambias el puerto del backend, edita en `memecards.conf` la línea `proxy_pass` (ej. `http://127.0.0.1:4000`).

## Instalación en el servidor

1. Copiar el sitio a nginx:
   ```bash
   sudo cp nginx/memecards.conf /etc/nginx/sites-available/memecards
   ```

2. Activar el sitio:
   ```bash
   sudo ln -sf /etc/nginx/sites-available/memecards /etc/nginx/sites-enabled/
   ```

3. Comprobar y recargar:
   ```bash
   sudo nginx -t && sudo systemctl reload nginx
   ```

El tráfico a `http://efef79cc-0938-42cc-8a5a-43020deccf0c.clouding.host/` se enviará al backend en `127.0.0.1:3000` (o al puerto que tengas en `proxy_pass`).

## Levantar la app

Desde la raíz del proyecto:

- **Producción (build + PM2):**
  ```bash
  ./scripts/start-servers.sh
  ```

- **Con otro puerto de backend:**
  ```bash
  BACKEND_PORT=4000 ./scripts/start-servers.sh
  ```
  (y actualiza `proxy_pass` en `memecards.conf` a `http://127.0.0.1:4000`).
