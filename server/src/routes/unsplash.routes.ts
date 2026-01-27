import { Router } from 'express';
import { Request, Response, NextFunction } from 'express';
import { searchUnsplashImages, getUnsplashImage } from '../services/unsplashService.js';
import { downloadAndOptimizeImage } from '../services/imageOptimizer.js';
import { AppError } from '../middleware/errorHandler.js';
import path from 'path';

const router = Router();
const imagesDir = process.env.IMAGES_DIR || './images';
const optimizedDir = path.join(imagesDir, 'optimized');

/**
 * GET /api/unsplash/search
 * Busca imágenes en Unsplash
 */
router.get('/search', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { query, page = '1', perPage = '20' } = req.query;

    if (!query || typeof query !== 'string') {
      throw new AppError('El parámetro "query" es requerido', 400);
    }

    const pageNum = parseInt(page as string, 10) || 1;
    const perPageNum = parseInt(perPage as string, 10) || 20;

    const results = await searchUnsplashImages(query, pageNum, perPageNum);

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/unsplash/download
 * Descarga y optimiza una imagen de Unsplash
 */
router.post('/download', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl || typeof imageUrl !== 'string') {
      throw new AppError('El parámetro "imageUrl" es requerido', 400);
    }

    // Validar que sea una URL de Unsplash
    if (!imageUrl.includes('unsplash.com')) {
      throw new AppError('La URL debe ser de Unsplash', 400);
    }

    // Descargar y optimizar la imagen
    const optimizedPath = await downloadAndOptimizeImage(imageUrl, {
      maxWidth: 1200,
      maxHeight: 1200,
      quality: 80,
    });

    const filename = path.basename(optimizedPath);
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const imageUrlOptimized = `${baseUrl}/api/images/${filename}`;

    res.json({
      success: true,
      data: {
        filename,
        url: imageUrlOptimized,
        path: optimizedPath,
      },
    });
  } catch (error) {
    next(error);
  }
});

export { router as unsplashRouter };
