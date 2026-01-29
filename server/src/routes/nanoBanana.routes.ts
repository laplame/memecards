import { Router } from 'express';
import { Request, Response, NextFunction } from 'express';
import { generateImageWithNanoBanana, NANO_BANANA_IDEAS } from '../services/nanoBananaService.js';
import { optimizeImage } from '../services/imageOptimizer.js';
import { AppError } from '../middleware/errorHandler.js';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';

const router = Router();
const imagesDir = process.env.IMAGES_DIR || './images';
const optimizedDir = path.join(imagesDir, 'optimized');
const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
const usageLogPath = path.join(process.cwd(), 'pages-data', 'nano-banana-usage.jsonl');

async function appendUsageLog(entry: any) {
  try {
    const dir = path.dirname(usageLogPath);
    await fs.mkdir(dir, { recursive: true });
    await fs.appendFile(usageLogPath, JSON.stringify(entry) + '\n', 'utf8');
  } catch (e) {
    console.error('Error writing nano-banana usage log:', e);
  }
}

async function readUsageLog(limit = 200) {
  try {
    const content = await fs.readFile(usageLogPath, 'utf8');
    const lines = content.split('\n').filter(Boolean);
    const parsed = lines
      .map((l) => {
        try { return JSON.parse(l); } catch { return null; }
      })
      .filter(Boolean) as any[];
    const recent = parsed.slice(-limit).reverse();

    const totals = recent.reduce(
      (acc, r) => {
        acc.count += 1;
        acc.promptTokens += Number(r?.usage?.promptTokenCount || 0);
        acc.candidatesTokens += Number(r?.usage?.candidatesTokenCount || 0);
        acc.totalTokens += Number(r?.usage?.totalTokenCount || 0);
        return acc;
      },
      { count: 0, promptTokens: 0, candidatesTokens: 0, totalTokens: 0 }
    );

    return { recent, totals };
  } catch (e) {
    return { recent: [], totals: { count: 0, promptTokens: 0, candidatesTokens: 0, totalTokens: 0 } };
  }
}

/**
 * GET /api/nano-banana/ideas
 * Obtiene las 14 ideas predefinidas para generar imágenes
 */
router.get('/ideas', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const occasion = typeof req.query.occasion === 'string' ? req.query.occasion : undefined;
    const category = typeof req.query.category === 'string' ? req.query.category : undefined;

    const ideas = NANO_BANANA_IDEAS.filter((idea: any) => {
      if (occasion && idea.occasion !== occasion) return false;
      if (category && idea.category !== category) return false;
      return true;
    });

    res.json({
      success: true,
      data: ideas,
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

    // Log de uso (prompt + tokens) para Dashboard
    const userAgent = String(req.headers['user-agent'] || '');
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      '';
    const userId = crypto
      .createHash('sha256')
      .update(`${ip}|${userAgent}`)
      .digest('hex')
      .slice(0, 16);

    await appendUsageLog({
      ts: new Date().toISOString(),
      prompt: finalPrompt,
      ideaId: ideaId ?? null,
      imageUrl,
      filename: optimizedFilename,
      usage: result.usage ?? null,
      userId,
    });

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
        usage: result.usage ?? null,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/nano-banana/usage
 * Devuelve uso reciente (prompts + tokens) para el Dashboard
 */
router.get('/usage', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limitRaw = typeof req.query.limit === 'string' ? Number(req.query.limit) : 200;
    const limit = Number.isFinite(limitRaw) ? Math.max(1, Math.min(1000, limitRaw)) : 200;
    const { recent, totals } = await readUsageLog(limit);
    res.json({
      success: true,
      data: {
        totals,
        recent,
      },
    });
  } catch (e) {
    next(e);
  }
});

export { router as nanoBananaRouter };
