# Deploy MemeCards (frontend 5173 + backend 3000)

Base URL: **https://tarjetas.shop**

## Arquitectura

- **Frontend (puerto 5173):** SPA (Vite preview sirve `dist/`).
- **Backend (puerto 3000):** API Express (solo API, no sirve la SPA).
- **Nginx:** `/api/` y `/page/` → 3000; `/` → 5173.

## 1. Levantar todo en el servidor

```bash
cd ~/projects/memecards
./scripts/start-servers.sh
```

El script:

- Libera los puertos 3000 y 5173 (mata procesos que los usen).
- Para y elimina apps PM2 anteriores (memecards-backend, memecards-frontend, memecards-server).
- Hace `npm run build:all`.
- Arranca con PM2: `memecards-backend` (3000) y `memecards-frontend` (5173).

## 2. Nginx

Debe estar configurado para este host:

- `location /api/` y `location /page/` → `proxy_pass http://127.0.0.1:3000;`
- `location /` → `proxy_pass http://127.0.0.1:5173;`

```bash
sudo cp ~/projects/memecards/nginx/memecards.conf /etc/nginx/sites-available/memecards
sudo ln -sf /etc/nginx/sites-available/memecards /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

## 3. Comprobar

```bash
# En el servidor
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/api/health   # 200
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:5173/             # 200

# Por el dominio
curl -s -o /dev/null -w "%{http_code}" http://tarjetas.shop/api/health
curl -s -o /dev/null -w "%{http_code}" http://tarjetas.shop/
```

### Si en producción /page/CODE muestra la SPA ("Crea tu Tarjeta") en vez del template de la tarjeta

En local `http://localhost:3000/page/CODE` funciona porque la petición va directo al backend. En producción, nginx debe enviar **solo** las rutas `/page/` al backend (3000). Si ves el formulario de la SPA en `https://tarjetas.shop/page/3G8PW2R9`, nginx está enviando esa ruta al frontend (5173).

**En el servidor:**

1. **Comprobar qué responde el backend y qué nginx** (en el servidor; si no tienes `verify-page-route.sh`, usa estos comandos):
   ```bash
   cd ~/projects/memecards
   # Backend directo (debe devolver 200 y HTML de la tarjeta)
   curl -s -o /dev/null -w "Backend: HTTP %{http_code}\n" http://127.0.0.1:3000/page/3G8PW2R9
   # Por dominio (debe ser 200; si ves el formulario en el navegador, nginx estaba mal)
   curl -s -o /dev/null -w "HTTPS /page/: HTTP %{http_code}\n" https://tarjetas.shop/page/3G8PW2R9
   ```
   O ejecuta el script si está en el repo: `./scripts/verify-page-route.sh 3G8PW2R9`. Si nginx devolvía la SPA, sigue los pasos siguientes.

2. **Asegurar que la config activa es la del repo** (con `location /page/` → backend):
   ```bash
   ./scripts/nginx-update.sh
   ```
   Esto copia `nginx/memecards.conf` a `sites-available/memecards` y enlaza en `sites-enabled`.

3. **Quitar config duplicada de Certbot** (si existe): Certbot a veces crea `memecards-le-ssl.conf` que solo hace proxy de todo a un solo puerto. Si ese archivo está en `sites-enabled`, nginx puede usarlo para HTTPS y no tendrá `/page/` → backend:
   ```bash
   ls -la /etc/nginx/sites-enabled/
   # Si ves memecards-le-ssl.conf además de memecards:
   sudo rm -f /etc/nginx/sites-enabled/memecards-le-ssl.conf
   sudo nginx -t && sudo systemctl reload nginx
   ```

4. **Comprobar que el archivo en el servidor tiene `location /page/`:**
   ```bash
   grep -n "page" /etc/nginx/sites-available/memecards
   ```
   Debe aparecer `location ^~ /page/` o `location /page/`. Si no aparece, haz `git pull` en el servidor y vuelve a ejecutar `./scripts/nginx-update.sh`.

5. **Comprobar que no hay otro sitio que capture tarjetas.shop en 443:**
   ```bash
   sudo grep -r "server_name.*tarjetas\|listen.*443" /etc/nginx/sites-enabled /etc/nginx/conf.d 2>/dev/null
   ```
   Solo debería salir el archivo `memecards`. Si sale otro con `tarjetas.shop` y `443`, desactívalo.

6. **Comprobar en el navegador:** https://tarjetas.shop/page/3G8PW2R9 — debe verse la tarjeta con audio y el modal de términos, no solo "Crea tu Tarjeta".

## 4. PM2

```bash
pm2 status
pm2 logs memecards-backend
pm2 logs memecards-frontend
pm2 restart memecards-backend memecards-frontend
```

Solo deben estar activos `memecards-backend` y `memecards-frontend`. Si tienes otros procesos (backend, frontend, memecards-server) de configuraciones viejas, puedes pararlos y borrarlos:

```bash
pm2 stop backend frontend memecards-server 2>/dev/null || true
pm2 delete backend frontend memecards-server 2>/dev/null || true
```
