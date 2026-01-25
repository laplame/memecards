import { Router } from 'express';
import { Request, Response, NextFunction } from 'express';
import os from 'os';
import fs from 'fs/promises';
import path from 'path';

const router = Router();

/**
 * GET /api
 * Información general de la API
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const packagePath = path.join(process.cwd(), 'package.json');
    let packageInfo: any = {};
    
    try {
      const packageContent = await fs.readFile(packagePath, 'utf-8');
      packageInfo = JSON.parse(packageContent);
    } catch {
      // Si no se puede leer, usar valores por defecto
    }

    const uptime = process.uptime();
    const uptimeHours = Math.floor(uptime / 3600);
    const uptimeMinutes = Math.floor((uptime % 3600) / 60);
    const uptimeSeconds = Math.floor(uptime % 60);

    res.json({
      success: true,
      data: {
        name: packageInfo.name || 'audio-server',
        version: packageInfo.version || '1.0.0',
        description: packageInfo.description || 'Backend server for audio upload and processing',
        environment: process.env.NODE_ENV || 'development',
        server: {
          port: process.env.PORT || 3000,
          baseUrl: process.env.BASE_URL || 'http://localhost:3000',
          uptime: {
            total: uptime,
            formatted: `${uptimeHours}h ${uptimeMinutes}m ${uptimeSeconds}s`,
          },
          nodeVersion: process.version,
          platform: os.platform(),
          arch: os.arch(),
          cpuCount: os.cpus().length,
          memory: {
            total: Math.round(os.totalmem() / 1024 / 1024 / 1024 * 100) / 100,
            free: Math.round(os.freemem() / 1024 / 1024 / 1024 * 100) / 100,
            used: Math.round((os.totalmem() - os.freemem()) / 1024 / 1024 / 1024 * 100) / 100,
            unit: 'GB',
          },
        },
        features: {
          audioProcessing: true,
          pageGeneration: true,
          storeManagement: true,
          mongodb: !!process.env.MONGODB_ATLAS || !!process.env.MONGODB_URI,
        },
        endpoints: {
          audio: {
            upload: 'POST /api/audio/upload',
            process: 'POST /api/audio/process',
            stream: 'GET /api/audio/stream/:filename',
            info: 'GET /api/audio/info/:filename',
            convert: 'POST /api/audio/convert',
          },
          pages: {
            create: 'POST /api/pages/create',
            list: 'GET /api/pages',
            get: 'GET /api/pages/:code',
            delete: 'DELETE /api/pages/:code',
            public: 'GET /page/:code',
          },
          stores: {
            list: 'GET /api/stores',
            get: 'GET /api/stores/:id',
            create: 'POST /api/stores',
            update: 'PUT /api/stores/:id',
            delete: 'DELETE /api/stores/:id',
            bulk: 'POST /api/stores/bulk',
          },
          api: {
            info: 'GET /api',
            health: 'GET /api/health',
            version: 'GET /api/version',
          },
        },
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/version
 * Versión de la API
 */
router.get('/version', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      version: '1.0.0',
      apiVersion: 'v1',
      timestamp: new Date().toISOString(),
    },
  });
});

/**
 * GET /api/health
 * Estado de salud del servidor
 */
router.get('/health', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        server: 'running',
        mongodb: 'unknown',
        storage: {
          uploads: false,
          processed: false,
        },
      },
    };

    // Verificar MongoDB
    try {
      const mongoose = await import('mongoose');
      if (mongoose.default.connection.readyState === 1) {
        health.services.mongodb = 'connected';
      } else if (mongoose.default.connection.readyState === 0) {
        health.services.mongodb = 'disconnected';
      } else {
        health.services.mongodb = 'connecting';
      }
    } catch {
      health.services.mongodb = 'not configured';
    }

    // Verificar directorios de almacenamiento
    try {
      const uploadDir = process.env.UPLOAD_DIR || './uploads';
      const processedDir = process.env.PROCESSED_DIR || './processed';
      await fs.access(uploadDir);
      health.services.storage.uploads = true;
      await fs.access(processedDir);
      health.services.storage.processed = true;
    } catch {
      // Directorios no existen, pero no es crítico
    }

    res.json({
      success: true,
      data: health,
    });
  } catch (error) {
    next(error);
  }
});

export { router as apiRouter };
