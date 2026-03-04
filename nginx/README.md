# Nginx – Tarjetas.shop (MemeCards)

- **https://tarjetas.shop** y **https://www.tarjetas.shop** → HTTPS (puerto 443, certificados Certbot).
- **http://tarjetas.shop** y **http://www.tarjetas.shop** → redirigen a HTTPS.
- **http://200.234.228.73** → HTTP (sin certificado).

El archivo `memecards.conf` incluye:
- Bloque 80 para los dominios: redirección 301 a https.
- Bloque 80 para la IP: proxy a la app.
- Bloque 443: SSL con `/etc/letsencrypt/live/tarjetas.shop/` y proxy a la app.

## Aplicar en el servidor

1. Certbot (si aún no tienes certificados):

   ```bash
   sudo certbot --nginx -d tarjetas.shop -d www.tarjetas.shop
   ```

2. Copiar esta config (sobrescribe lo que certbot haya puesto en memecards):

   ```bash
   ./scripts/nginx-update.sh
   ```

   Si certbot creó un archivo aparte (ej. `memecards-le-ssl.conf`), el script puede avisarte; desactívalo con `sudo rm -f /etc/nginx/sites-enabled/memecards-le-ssl.conf` y vuelve a ejecutar el script.

## Si ves 502

1. Dejar solo apps MemeCards en PM2: `pm2 delete backend frontend; pm2 restart memecards-backend memecards-frontend; pm2 save`
2. Comprobar: `curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/api/health` y `http://127.0.0.1:5173/` (deben devolver 200)
3. Logs: `sudo tail -50 /var/log/nginx/memecards-error.log` y `pm2 logs`
