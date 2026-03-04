# Despliegue MemeCards

## 1. Build local (comprobar que todo funciona)

En tu máquina, en la raíz del proyecto:

```bash
npm run build:all
```

Si termina sin errores, el build está bien para desplegar.

## 2. Subir cambios (cuando quieras)

```bash
git add .
git commit -m "mensaje"
git push
```

## 3. En el servidor: primer despliegue (instalar PM2 y nginx)

Conéctate al servidor y clona o entra en el proyecto:

```bash
# Si es la primera vez (clonar)
git clone <url-del-repo> ~/projects/memecards
cd ~/projects/memecards
```

Instalar dependencias del sistema, build y arranque:

```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh --install
```

Eso hace:

- Instala **nginx** (apt) y **PM2** (npm global) si no están.
- `npm install` en raíz y en `server/`.
- `npm run build:all`.
- Copia la config de nginx y recarga nginx.
- Mata procesos en 3000/5173, arranca **memecards-backend** y **memecards-frontend** con PM2.
- `pm2 save`.

## 4. En el servidor: despliegues siguientes (tras git pull)

Sin instalar nada nuevo, solo actualizar código, build y reiniciar:

```bash
cd ~/projects/memecards
git pull
./scripts/deploy.sh
```

## 5. Certbot (HTTPS) – manual

Cuando quieras HTTPS:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d efef79cc-0938-42cc-8a5a-43020deccf0c.clouding.host
```

Certbot modificará la config de nginx para servir HTTPS. Luego:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

## 6. PM2 al arrancar el servidor

Solo una vez, para que PM2 levante la app al reiniciar la máquina:

```bash
pm2 startup
# Ejecuta el comando que te muestre (suele llevar sudo)
pm2 save
```

## Resumen de comandos

| Dónde   | Qué hacer |
|--------|------------|
| Local  | `npm run build:all` (comprobar) |
| Local  | `git push` (cuando quieras subir cambios) |
| Servidor primera vez | `./scripts/deploy.sh --install` |
| Servidor siguientes  | `git pull` + `./scripts/deploy.sh` |
| Servidor HTTPS       | `sudo certbot --nginx -d ...` (manual) |
