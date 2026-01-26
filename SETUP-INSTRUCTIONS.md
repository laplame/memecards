# Instrucciones de Configuración

Para que la aplicación funcione correctamente, necesitas configurar el backend y MongoDB.

## 1. Configurar Backend

1. Ve a la carpeta `server`:
```bash
cd server
```

2. Instala las dependencias:
```bash
npm install
```

3. Copia el archivo `.env.example` a `.env`:
```bash
cp .env.example .env
```

4. Edita el archivo `.env` con tus configuraciones:
```env
PORT=3000
NODE_ENV=development
UPLOAD_DIR=./uploads
PROCESSED_DIR=./processed
PAGES_DIR=./pages-data
BASE_URL=http://localhost:3000
MONGODB_ATLAS=tu_connection_string_aqui
```

5. Inicia el servidor:
```bash
npm run dev
```

## 2. Configurar Frontend

1. En la raíz del proyecto, crea un archivo `.env`:
```env
VITE_BACKEND_URL=http://localhost:3000
```

2. Instala las dependencias:
```bash
npm install
```

3. Inicia el servidor de desarrollo:
```bash
npm run dev
```

## 3. Configurar MongoDB (Opcional - Solo para tiendas)

Si quieres usar la funcionalidad de tiendas, necesitas configurar MongoDB Atlas:

1. Crea una cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crea un cluster gratuito
3. Obtén tu connection string
4. Agrega el connection string a `server/.env`:
```env
MONGODB_ATLAS=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

Para más detalles, consulta `server/MONGODB-SETUP.md`.

## 4. Verificar la Instalación

1. Asegúrate de que ambos servidores estén corriendo:
   - Backend: `http://localhost:3000`
   - Frontend: `http://localhost:5173` (o el puerto que Vite asigne)

2. Verifica el estado del backend:
```bash
curl http://localhost:3000/api/health
```

3. Abre el navegador en la URL del frontend y prueba crear una tarjeta.

## Requisitos del Sistema

- Node.js 18 o superior
- FFmpeg instalado (para procesamiento de audio)
- Navegador moderno con soporte para MediaRecorder API
