import { Router, Request, Response, NextFunction } from 'express';
import { getAllPages } from '../services/pageService.js';
import { CardVote } from '../models/CardVote.js';
import { CardComment } from '../models/CardComment.js';
import { AppError } from '../middleware/errorHandler.js';
import mongoose from 'mongoose';

const router = Router();

function ensureMongoOrThrow() {
  // readyState: 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
  if (mongoose.connection.readyState !== 1) {
    throw new AppError('MongoDB no disponible. Feed/votos/comentarios temporalmente deshabilitados.', 503);
  }
}

// Función helper para obtener userId (IP + User-Agent hash)
function getUserId(req: Request): string {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const userAgent = req.get('user-agent') || 'unknown';
  // Crear un hash simple (en producción usar algo más robusto)
  return Buffer.from(`${ip}-${userAgent}`).toString('base64').substring(0, 32);
}

/**
 * GET /api/feed
 * Obtiene tarjetas personalizadas para el feed (desde archivo o MongoDB).
 * Funciona sin MongoDB: muestra tarjetas desde pages.json con votos/comentarios en 0.
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pageNum = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (pageNum - 1) * limit;

    const allPages = await getAllPages();

    // Filtrar tarjetas personalizadas con contenido (incluir isTest para "Preservar" o cualquiera con contenido)
    const personalizedPages = allPages.filter(
      (p) => p.isPersonalized && (p.writtenMessage || p.imageUrl || p.audioUrl)
    );

    // Ordenar por fecha (más recientes primero)
    personalizedPages.sort((a, b) => {
      const dateA = new Date(a.personalizedAt || a.createdAt).getTime();
      const dateB = new Date(b.personalizedAt || b.createdAt).getTime();
      return dateB - dateA;
    });

    const paginatedPages = personalizedPages.slice(skip, skip + limit);
    const hasMore = skip + limit < personalizedPages.length;

    const mongoAvailable = mongoose.connection.readyState === 1;

    const pagesWithStats = await Promise.all(
      paginatedPages.map(async (p) => {
        let voteCount = 0;
        let commentCount = 0;
        if (mongoAvailable) {
          try {
            voteCount = await CardVote.countDocuments({ cardCode: p.code });
            commentCount = await CardComment.countDocuments({ cardCode: p.code });
          } catch {
            // ignorar si falla
          }
        }
        return {
          ...p,
          voteCount,
          commentCount,
        };
      })
    );

    res.json({
      success: true,
      data: {
        pages: pagesWithStats,
        pagination: {
          page: pageNum,
          limit,
          total: personalizedPages.length,
          hasMore,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/feed/:code/votes
 * Obtiene el conteo de votos y si el usuario votó. Sin MongoDB devuelve 0 / false.
 */
router.get('/:code/votes', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code } = req.params;
    if (mongoose.connection.readyState !== 1) {
      return res.json({
        success: true,
        data: { voteCount: 0, userVoted: false },
      });
    }
    const userId = getUserId(req);
    const voteCount = await CardVote.countDocuments({ cardCode: code });
    const userVoted = !!(await CardVote.findOne({ cardCode: code, userId }));

    res.json({
      success: true,
      data: {
        voteCount,
        userVoted,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/feed/:code/vote
 * Agrega o elimina un voto (toggle)
 */
router.post('/:code/vote', async (req: Request, res: Response, next: NextFunction) => {
  try {
    ensureMongoOrThrow();
    const { code } = req.params;
    const userId = getUserId(req);

    // Verificar si ya votó
    const existingVote = await CardVote.findOne({ cardCode: code, userId });

    if (existingVote) {
      // Eliminar voto
      await CardVote.deleteOne({ _id: existingVote._id });
    } else {
      // Agregar voto
      await CardVote.create({ cardCode: code, userId });
    }

    const voteCount = await CardVote.countDocuments({ cardCode: code });

    res.json({
      success: true,
      data: {
        voteCount,
        userVoted: !existingVote,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/feed/:code/comments
 * Obtiene los comentarios de una tarjeta
 */
router.get('/:code/comments', async (req: Request, res: Response, next: NextFunction) => {
  try {
    ensureMongoOrThrow();
    const { code } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const comments = await CardComment.find({ cardCode: code })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await CardComment.countDocuments({ cardCode: code });

    res.json({
      success: true,
      data: {
        comments,
        pagination: {
          page,
          limit,
          total,
          hasMore: skip + limit < total,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/feed/:code/comments
 * Agrega un comentario a una tarjeta
 */
router.post('/:code/comments', async (req: Request, res: Response, next: NextFunction) => {
  try {
    ensureMongoOrThrow();
    const { code } = req.params;
    const { text, userName } = req.body;
    const userId = getUserId(req);

    if (!text || text.trim().length === 0) {
      throw new AppError('El comentario no puede estar vacío', 400);
    }

    if (text.length > 500) {
      throw new AppError('El comentario no puede tener más de 500 caracteres', 400);
    }

    const comment = await CardComment.create({
      cardCode: code,
      userId,
      userName: userName || 'Anónimo',
      text: text.trim(),
    });

    res.json({
      success: true,
      data: comment,
    });
  } catch (error) {
    next(error);
  }
});

export { router as feedRouter };
