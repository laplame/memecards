# Nginx – MemeCards (frontend 5173 + backend 3000)

Configuración para **http://efef79cc-0938-42cc-8a5a-43020deccf0c.clouding.host/**:

- **`/api/`** y **`/page/`** → backend (127.0.0.1:3000)
- **`/`** (SPA) → frontend (127.0.0.1:5173)

## Puertos

- **Backend:** 3000 (API only)
- **Frontend:** 5173 (Vite preview / SPA)

Si cambias puertos, actualiza `proxy_pass` en `memecards.conf` y el script/PM2.

## Instalación en el servidor

```bash
sudo cp nginx/memecards.conf /etc/nginx/sites-available/memecards
sudo ln -sf /etc/nginx/sites-available/memecards /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

## Levantar la app

```bash
./scripts/start-servers.sh
```

Libera los puertos 3000 y 5173, hace build y arranca `memecards-backend` y `memecards-frontend` con PM2.
