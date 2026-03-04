# Nginx – Tarjetas.shop (MemeCards)

Dominios: **tarjetas.shop**, **www.tarjetas.shop** y IP **200.234.228.73**.

- **`/api/`** y **`/page/`** → backend (127.0.0.1:3000)
- **`/`** (SPA) → frontend (127.0.0.1:5173)

## Aplicar / actualizar en el servidor

Desde la raíz del proyecto (tras `git pull`):

```bash
./scripts/nginx-update.sh
```

El script copia `nginx/memecards.conf`, desactiva sitios que usen el host antiguo de Clouding, activa memecards y recarga nginx.

## HTTPS con Certbot

```bash
sudo certbot --nginx -d tarjetas.shop -d www.tarjetas.shop
```

## Si ves 502

1. Dejar solo apps MemeCards en PM2: `pm2 delete backend frontend; pm2 restart memecards-backend memecards-frontend; pm2 save`
2. Comprobar: `curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/api/health` y `http://127.0.0.1:5173/` (deben devolver 200)
3. Logs: `sudo tail -50 /var/log/nginx/memecards-error.log` y `pm2 logs`
