import { Router } from 'express';
import { upload } from '../middleware/upload.js';
import { uploadImage } from '../middleware/uploadImage.js';
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
  upload.fields([
    { name: 'audio', maxCount: 1 },
    { name: 'image', maxCount: 1 },
  ]),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      
      if (!files.audio || !files.audio[0]) {
        throw new AppError('No se proporcionó ningún archivo de audio', 400);
      }

      const audioFile = files.audio[0];
      const imageFile = files.image?.[0];

      const { title, description, format, bitrate, sampleRate, senderName, recipientName, writtenMessage } = req.body;

      // Procesar el audio
      const processed = await processAudio(audioFile.path, {
        format: (format as 'mp3' | 'wav' | 'ogg') || 'mp3',
        bitrate: bitrate ? parseInt(bitrate, 10) : undefined,
        sampleRate: sampleRate ? parseInt(sampleRate, 10) : undefined,
      });

      // Procesar la imagen si existe
      let imageUrl: string | undefined;
      let imageFilename: string | undefined;
      
      if (imageFile) {
        const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
        imageUrl = `${baseUrl}/api/images/${imageFile.filename}`;
        imageFilename = imageFile.filename;
      }

      // Generar título y descripción si no se proporcionaron
      const finalTitle = title || (senderName && recipientName ? `Tarjeta de ${senderName} para ${recipientName}` : 'Audio Player');
      const finalDescription = description || writtenMessage || 'Reproduce el audio';

      // Crear la página principal
      const page = await createAudioPage(
        processed.url,
        processed.processedPath,
        {
          title: finalTitle,
          description: finalDescription,
          senderName,
          recipientName,
          writtenMessage,
          imageUrl,
          imageFilename,
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
  upload.fields([
    { name: 'audio', maxCount: 1 },
    { name: 'image', maxCount: 1 },
  ]),
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

      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const { senderName, recipientName, writtenMessage, title, description } = req.body;
      let audioUrl = page.audioUrl;
      let audioFilename = page.audioFilename;
      let imageUrl = page.imageUrl;
      let imageFilename = page.imageFilename;

      // Si se subió un nuevo audio, procesarlo
      if (files.audio && files.audio[0]) {
        const audioFile = files.audio[0];
        try {
          console.log(`📤 Procesando audio: ${audioFile.originalname} (${audioFile.mimetype}, ${(audioFile.size / 1024 / 1024).toFixed(2)} MB)`);
          
          const processed = await processAudio(audioFile.path, {
            format: 'mp3',
            bitrate: 128, // Calidad estándar para voz (128 kbps)
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

      // Si se subió una imagen, procesarla
      if (files.image && files.image[0]) {
        const imageFile = files.image[0];
        const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
        imageUrl = `${baseUrl}/api/images/${imageFile.filename}`;
        imageFilename = imageFile.filename;
        console.log(`✅ Imagen subida: ${imageUrl}`);
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
        imageUrl: imageUrl || page.imageUrl,
        imageFilename: imageFilename || page.imageFilename,
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
