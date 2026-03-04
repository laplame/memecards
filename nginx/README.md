# Nginx – MemeCards (frontend 5173 + backend 3000)

Configuración para acceso por **IP** o por **dominio**:

- **http://200.234.228.73**
- **http://efef79cc-0938-42cc-8a5a-43020deccf0c.clouding.host**

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

## Si ves 502 Bad Gateway

1. **Deja solo las apps de MemeCards.** Si en `pm2 status` ves 4 apps (backend, frontend, memecards-backend, memecards-frontend), las antiguas "backend" y "frontend" pueden estar ocupando los puertos. Elimínalas y reinicia:
   ```bash
   pm2 delete backend frontend
   pm2 restart memecards-backend memecards-frontend
   pm2 save
   ```
2. Comprueba que solo estén en marcha `memecards-backend` y `memecards-frontend`: `pm2 status`.
3. Comprueba que respondan en los puertos: `curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/api/health` y `curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:5173/` (deben devolver 200).
4. Si no están corriendo: `cd ~/projects/memecards && ./scripts/deploy.sh` o `./scripts/start-servers.sh`.
5. Revisa logs: `sudo tail -50 /var/log/nginx/memecards-error.log` y `pm2 logs`.
