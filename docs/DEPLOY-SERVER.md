# Deploy MemeCards (frontend 5173 + backend 3000)

Base URL: **http://efef79cc-0938-42cc-8a5a-43020deccf0c.clouding.host/**

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
curl -s -o /dev/null -w "%{http_code}" http://efef79cc-0938-42cc-8a5a-43020deccf0c.clouding.host/api/health
curl -s -o /dev/null -w "%{http_code}" http://efef79cc-0938-42cc-8a5a-43020deccf0c.clouding.host/
```

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
