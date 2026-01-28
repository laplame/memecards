import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { apiRouter } from './routes/api.routes.js';
import { audioRouter } from './routes/audio.routes.js';
import { pageRouter } from './routes/page.routes.js';
import { publicPageRouter } from './routes/publicPage.routes.js';
import { storeLocationRouter } from './routes/storeLocation.routes.js';
import { imageRouter } from './routes/image.routes.js';
import { unsplashRouter } from './routes/unsplash.routes.js';
import { nanoBananaRouter } from './routes/nanoBanana.routes.js';
import { staticPagesRouter } from './routes/staticPages.routes.js';
import { connectDatabase } from './config/database.js';
import { errorHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar .env desde la raíz del proyecto y desde server/
// __dirname apunta a server/src cuando se ejecuta con tsx
// Intentar múltiples rutas posibles para encontrar el .env
const envPaths = [
  path.resolve(process.cwd(), '../.env'),      // Desde server/ -> ../.env (raíz del proyecto)
  path.resolve(__dirname, '../../.env'),        // Desde server/src -> ../../.env (raíz del proyecto)
  path.resolve(__dirname, '../.env'),           // Desde server/src -> ../.env (server/.env)
  path.resolve(process.cwd(), '.env'),          // .env en el directorio actual
];

// Cargar .env desde múltiples ubicaciones posibles
// La última carga exitosa tiene prioridad (override: true)
let envLoaded = false;
for (const envPath of envPaths) {
  try {
    // Verificar que el archivo existe antes de intentar cargarlo
    if (fs.existsSync(envPath)) {
      const result = dotenv.config({ path: envPath, override: true });
      if (!result.error) {
        console.log(`✅ Cargado .env desde: ${envPath}`);
        envLoaded = true;
      } else {
        console.warn(`⚠️  Error al cargar ${envPath}: ${result.error.message}`);
      }
    }
  } catch (error) {
    // Continuar con la siguiente ruta
  }
}

if (!envLoaded) {
  console.warn('⚠️  No se pudo cargar ningún archivo .env');
  console.warn(`   Rutas intentadas: ${envPaths.join(', ')}`);
  console.warn(`   process.cwd(): ${process.cwd()}`);
  console.warn(`   __dirname: ${__dirname}`);
}

// Debug: mostrar qué variables se cargaron
if (process.env.MONGODB_ATLAS) {
  console.log('✅ MONGODB_ATLAS encontrada en variables de entorno');
} else {
  console.log('⚠️  MONGODB_ATLAS no encontrada');
  console.log(`   Buscando en: ${rootEnvPath}`);
  console.log(`   Buscando en: ${serverEnvPath}`);
  console.log(`   __dirname: ${__dirname}`);
}

// Debug: verificar nano_banana
if (process.env.nano_banana || process.env.NANO_BANANA) {
  const key = process.env.nano_banana || process.env.NANO_BANANA;
  console.log(`✅ nano_banana encontrada (longitud: ${key?.length} caracteres)`);
} else {
  console.log('⚠️  nano_banana no encontrada en variables de entorno');
  console.log(`   Buscando en: ${rootEnvPath}`);
  console.log(`   Buscando en: ${serverEnvPath}`);
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', apiRouter); // API info, version, health
app.use('/api/audio', audioRouter);
app.use('/api/pages', pageRouter); // API de páginas (POST /api/pages/create, GET /api/pages, etc.)
app.use('/page', publicPageRouter); // Páginas públicas (GET /page/:code)
app.use('/api/stores', storeLocationRouter); // API de tiendas (GET /api/stores/:id, etc.)
app.use('/api/images', imageRouter); // API de imágenes (GET /api/images/:filename)
app.use('/api/unsplash', unsplashRouter); // API de Unsplash (GET /api/unsplash/search, POST /api/unsplash/download)
app.use('/api/nano-banana', nanoBananaRouter); // API de Nano Banana (GET /api/nano-banana/ideas, POST /api/nano-banana/generate)
app.use('/', staticPagesRouter); // Páginas estáticas (GET /terminos, GET /antibullying)

// Health check (legacy, redirige a /api/health)
app.get('/health', (req, res) => {
  res.redirect('/api/health');
});

// Error handler
app.use(errorHandler);

// Iniciar servidor
const startServer = async () => {
  try {
    // Conectar a MongoDB
    if (process.env.MONGODB_ATLAS || process.env.MONGODB_URI) {
      await connectDatabase();
    } else {
      console.warn('⚠️  MONGODB_ATLAS no configurada, algunas funcionalidades no estarán disponibles');
    }

    // Iniciar servidor Express
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📁 Upload directory: ${process.env.UPLOAD_DIR || './uploads'}`);
      console.log(`🎵 Processed directory: ${process.env.PROCESSED_DIR || './processed'}`);
      console.log(`🗄️  MongoDB: ${process.env.MONGODB_ATLAS || process.env.MONGODB_URI ? 'Conectado' : 'No configurado'}`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();
