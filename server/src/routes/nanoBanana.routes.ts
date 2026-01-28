import { Router } from 'express';
import { Request, Response, NextFunction } from 'express';
import { generateImageWithNanoBanana, NANO_BANANA_IDEAS } from '../services/nanoBananaService.js';
import { optimizeImage } from '../services/imageOptimizer.js';
import { AppError } from '../middleware/errorHandler.js';
import path from 'path';
import fs from 'fs/promises';

const router = Router();
const imagesDir = process.env.IMAGES_DIR || './images';
const optimizedDir = path.join(imagesDir, 'optimized');
const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

/**
 * GET /api/nano-banana/ideas
 * Obtiene las 14 ideas predefinidas para generar imágenes
 */
router.get('/ideas', async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({
      success: true,
      data: NANO_BANANA_IDEAS,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/nano-banana/generate
 * Genera una imagen usando Nano Banana
 */
router.post('/generate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { prompt, ideaId } = req.body;

    if (!prompt && !ideaId) {
      throw new AppError('Se requiere "prompt" o "ideaId"', 400);
    }

    let finalPrompt = prompt;

    // Si se proporciona ideaId, usar el prompt de la idea
    if (ideaId) {
      const idea = NANO_BANANA_IDEAS.find(i => i.id === ideaId);
      if (!idea) {
        throw new AppError('Idea no encontrada', 404);
      }
      finalPrompt = idea.prompt;
    }

    // Generar imagen con Nano Banana
    const result = await generateImageWithNanoBanana(finalPrompt);

    if (!result.success || !result.imageUrl) {
      throw new AppError(result.error || 'Error al generar imagen', 500);
    }

    // Convertir data URL a buffer
    const base64Data = result.imageUrl.split(',')[1];
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // Guardar imagen temporalmente
    const tempFilename = `nano-banana-${Date.now()}.png`;
    const tempPath = path.join(imagesDir, tempFilename);

    // Asegurar que el directorio existe
    await fs.mkdir(imagesDir, { recursive: true });

    // Guardar imagen temporal
    await fs.writeFile(tempPath, imageBuffer);

    // Optimizar imagen
    const optimizedPath = await optimizeImage(tempPath, {
      maxWidth: 1200,
      maxHeight: 1200,
      quality: 85,
    });

    const optimizedFilename = path.basename(optimizedPath);
    const imageUrl = `${baseUrl}/api/images/${optimizedFilename}`;

    // Eliminar imagen temporal
    try {
      await fs.unlink(tempPath);
    } catch (error) {
      console.error('Error al eliminar imagen temporal:', error);
    }

    res.json({
      success: true,
      data: {
        imageUrl,
        filename: optimizedFilename,
      },
    });
  } catch (error) {
    next(error);
  }
});

export { router as nanoBananaRouter };
