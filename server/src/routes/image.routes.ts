import { Router } from 'express';
import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs/promises';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();
const imagesDir = process.env.IMAGES_DIR || './images';
const optimizedDir = path.join(imagesDir, 'optimized');

/**
 * GET /api/images/:filename
 * Sirve una imagen subida
 */
router.get('/:filename', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { filename } = req.params;
    // Buscar primero en optimized, luego en imagesDir
    let imagePath = path.join(optimizedDir, filename);
    
    try {
      await fs.access(imagePath);
    } catch {
      // Si no está en optimized, buscar en imagesDir
      imagePath = path.join(imagesDir, filename);
      try {
        await fs.access(imagePath);
      } catch {
        throw new AppError('Imagen no encontrada', 404);
      }
    }

    // Determinar el tipo de contenido basado en la extensión
    const ext = path.extname(filename).toLowerCase();
    const contentTypeMap: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
    };

    const contentType = contentTypeMap[ext] || 'image/jpeg';

    // Enviar la imagen
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache por 1 año
    res.sendFile(path.resolve(imagePath));
  } catch (error) {
    next(error);
  }
});

export { router as imageRouter };
