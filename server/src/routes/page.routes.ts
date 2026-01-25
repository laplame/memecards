import { Router } from 'express';
import { upload } from '../middleware/upload.js';
import { processAudio } from '../services/audioProcessor.js';
import { createAudioPage, getPageByCode, getAllPages, deletePageByCode, updatePageByCode, incrementPlayCount } from '../services/pageService.js';
import { generateAdditionalPages } from '../services/autoGeneratePages.js';
import { AppError } from '../middleware/errorHandler.js';
import { Request, Response, NextFunction } from 'express';

const router = Router();
const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

/**
 * POST /api/pages/create
 * Crea una nueva página con audio
 */
router.post(
  '/create',
  upload.single('audio'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        throw new AppError('No se proporcionó ningún archivo de audio', 400);
      }

      const { title, description, format, bitrate, sampleRate } = req.body;

      // Procesar el audio
      const processed = await processAudio(req.file.path, {
        format: (format as 'mp3' | 'wav' | 'ogg') || 'mp3',
        bitrate: bitrate ? parseInt(bitrate, 10) : undefined,
        sampleRate: sampleRate ? parseInt(sampleRate, 10) : undefined,
      });

      // Crear la página principal
      const page = await createAudioPage(
        processed.url,
        processed.processedPath,
        {
          title: title || 'Audio Player',
          description: description || 'Reproduce el audio',
        }
      );

      // Generar 10 páginas adicionales automáticamente (en segundo plano, no bloquea)
      generateAdditionalPages(
        processed.processedPath,
        processed.url,
        10
      ).catch((error) => {
        console.error('Error al generar páginas adicionales:', error);
        // No interrumpir la respuesta si falla
      });

      res.json({
        success: true,
        data: {
          page,
          audio: {
            info: processed.info,
            processedUrl: processed.url,
          },
          message: 'Página creada. Se están generando 10 páginas adicionales automáticamente.',
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/pages/:code
 * Obtiene información de una página por código
 */
router.get('/:code', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code } = req.params;
    const page = await getPageByCode(code);

    if (!page) {
      throw new AppError('Página no encontrada', 404);
    }

    res.json({
      success: true,
      data: page,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/pages
 * Obtiene todas las páginas
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pages = await getAllPages();
    res.json({
      success: true,
      data: pages,
      count: pages.length,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/pages/:code/personalize
 * Personaliza una página (sube audio, título, descripción)
 */
router.put(
  '/:code/personalize',
  upload.single('audio'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { code } = req.params;
      const page = await getPageByCode(code);

      if (!page) {
        throw new AppError('Página no encontrada', 404);
      }

      if (page.isPersonalized) {
        throw new AppError('Esta página ya fue personalizada', 400);
      }

      const { senderName, recipientName, writtenMessage, title, description, selectedGifUrl, selectedGifId } = req.body;
      let audioUrl = page.audioUrl;
      let audioFilename = page.audioFilename;

      // Si se subió un nuevo audio, procesarlo
      if (req.file) {
        try {
          console.log(`📤 Procesando audio: ${req.file.originalname} (${req.file.mimetype}, ${(req.file.size / 1024 / 1024).toFixed(2)} MB)`);
          
          const processed = await processAudio(req.file.path, {
            format: 'mp3',
            bitrate: '128k', // Calidad estándar para voz
            sampleRate: 44100,
          });
          
          console.log(`✅ Audio procesado: ${processed.url}`);
          audioUrl = processed.url;
          audioFilename = processed.processedPath;
        } catch (error: any) {
          console.error('❌ Error procesando audio:', error);
          throw new AppError(`Error al procesar el audio: ${error.message}`, 500);
        }
      } else {
        // Si no se subió audio, es requerido
        throw new AppError('El mensaje de voz es requerido', 400);
      }

      // Generar título y descripción si no se proporcionaron
      const finalTitle = title || (senderName && recipientName ? `De ${senderName} para ${recipientName}` : page.title);
      const finalDescription = description || writtenMessage || page.description;

      const updatedPage = await updatePageByCode(code, {
        title: finalTitle,
        description: finalDescription,
        audioUrl,
        audioFilename,
        isPersonalized: true,
        senderName: senderName || page.senderName,
        recipientName: recipientName || page.recipientName,
        writtenMessage: writtenMessage || page.writtenMessage,
        selectedGifUrl: selectedGifUrl || page.selectedGifUrl,
        selectedGifId: selectedGifId || page.selectedGifId,
      });

      if (!updatedPage) {
        throw new AppError('Error al actualizar la página', 500);
      }

      res.json({
        success: true,
        data: updatedPage,
        message: 'Página personalizada correctamente',
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/pages/:code/play
 * Incrementa el contador de reproducciones
 * Elimina la página automáticamente si se alcanza el límite
 */
router.post('/:code/play', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code } = req.params;
    const page = await incrementPlayCount(code);

    if (!page) {
      throw new AppError('Página no encontrada', 404);
    }

    const playCount = page.playCount || 0;
    const maxPlays = page.maxPlays || 5;
    const canPlay = playCount < maxPlays;

    // Si se alcanzó el límite, eliminar la página automáticamente
    if (playCount >= maxPlays) {
      console.log(`🗑️  Eliminando página ${code} - Límite de reproducciones alcanzado`);
      await deletePageByCode(code);
      
      res.json({
        success: true,
        data: {
          playCount,
          maxPlays,
          canPlay: false,
          destroyed: true,
          message: 'La tarjeta se ha autodestruido al alcanzar el límite de reproducciones',
        },
      });
    } else {
      res.json({
        success: true,
        data: {
          playCount,
          maxPlays,
          canPlay: true,
          destroyed: false,
        },
      });
    }
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/pages/:code
 * Elimina una página por código
 */
router.delete('/:code', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code } = req.params;
    const deleted = await deletePageByCode(code);

    if (!deleted) {
      throw new AppError('Página no encontrada', 404);
    }

    res.json({
      success: true,
      message: 'Página eliminada correctamente',
    });
  } catch (error) {
    next(error);
  }
});

export { router as pageRouter };
