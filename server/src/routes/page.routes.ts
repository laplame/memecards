import { Router } from 'express';
import { upload } from '../middleware/upload.js';
import { uploadImage } from '../middleware/uploadImage.js';
import { processAudio } from '../services/audioProcessor.js';
import { createAudioPage, getPageByCode, getAllPages, deletePageByCode, updatePageByCode, incrementPlayCount, createEmptyPage, getOrCreateDemoPage } from '../services/pageService.js';
import { generateAdditionalPages } from '../services/autoGeneratePages.js';
import { AppError } from '../middleware/errorHandler.js';
import { Request, Response, NextFunction } from 'express';
import { optimizeImage, downloadAndOptimizeImage } from '../services/imageOptimizer.js';
import path from 'path';
import fs from 'fs/promises';

const router = Router();
const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

/**
 * GET /api/pages/demo/init
 * Inicializa o obtiene la página demo (siempre crea una nueva)
 */
router.get('/demo/init', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const demoPage = await getOrCreateDemoPage();
    res.json({
      success: true,
      data: {
        code: demoPage.code,
        url: demoPage.pageUrl,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/pages/demo
 * Elimina la página demo
 */
router.delete('/demo', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deleted = await deletePageByCode('DEMO1234');
    res.json({
      success: true,
      data: {
        deleted,
        message: deleted ? 'Demo eliminada correctamente' : 'Demo no encontrada',
      },
    });
  } catch (error) {
    next(error);
  }
});

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

      const { title, description, format, bitrate, sampleRate, senderName, recipientName, writtenMessage, pin, useImageAsWallpaper } = req.body;

      // Validar duración del audio antes de procesar
      const { getAudioInfo } = await import('../services/audioProcessor.js');
      const audioInfo = await getAudioInfo(audioFile.path);
      if (audioInfo.duration > 60) {
        throw new AppError('El audio no puede ser mayor a 1 minuto. Por favor, graba un mensaje más corto.', 400);
      }

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
        // Optimizar la imagen
        const optimizedPath = await optimizeImage(imageFile.path, {
          maxWidth: 1200,
          maxHeight: 1200,
          quality: 80,
        });
        
        const optimizedFilename = path.basename(optimizedPath);
        const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
        imageUrl = `${baseUrl}/api/images/${optimizedFilename}`;
        imageFilename = optimizedFilename;
        
        // Eliminar la imagen original no optimizada
        try {
          await fs.promises.unlink(imageFile.path);
        } catch (error) {
          console.error('Error al eliminar imagen original:', error);
        }
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
          pin: pin || undefined,
          useImageAsWallpaper: useImageAsWallpaper === 'true' || useImageAsWallpaper === true,
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
    
    // Si es la demo, crear o obtener automáticamente
    let page;
    if (code === 'DEMO1234') {
      page = await getOrCreateDemoPage();
    } else {
      page = await getPageByCode(code);
    }

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
      
      // Si es la demo, crear o obtener automáticamente
      let page;
      if (code === 'DEMO1234') {
        page = await getOrCreateDemoPage();
      } else {
        page = await getPageByCode(code);
      }

      if (!page) {
        throw new AppError('Página no encontrada', 404);
      }

      if (page.isPersonalized) {
        throw new AppError('Esta página ya fue personalizada', 400);
      }

      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const { senderName, recipientName, writtenMessage, title, description, useImageAsWallpaper } = req.body;
      let audioUrl = page.audioUrl;
      let audioFilename = page.audioFilename;
      let imageUrl = page.imageUrl;
      let imageFilename = page.imageFilename;

      // Si se subió un nuevo audio, procesarlo
      if (files.audio && files.audio[0]) {
        const audioFile = files.audio[0];
        try {
          console.log(`📤 Procesando audio: ${audioFile.originalname} (${audioFile.mimetype}, ${(audioFile.size / 1024 / 1024).toFixed(2)} MB)`);
          
          // Validar duración del audio antes de procesar
          const { getAudioInfo } = await import('../services/audioProcessor.js');
          const audioInfo = await getAudioInfo(audioFile.path);
          if (audioInfo.duration > 60) {
            throw new AppError('El audio no puede ser mayor a 1 minuto. Por favor, graba un mensaje más corto.', 400);
          }
          
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

      // Si se subió una imagen, procesarla y optimizarla
      if (files.image && files.image[0]) {
        const imageFile = files.image[0];
        
        // Optimizar la imagen
        const optimizedPath = await optimizeImage(imageFile.path, {
          maxWidth: 1200,
          maxHeight: 1200,
          quality: 80,
        });
        
        const optimizedFilename = path.basename(optimizedPath);
        const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
        imageUrl = `${baseUrl}/api/images/${optimizedFilename}`;
        imageFilename = optimizedFilename;
        
        // Eliminar la imagen original no optimizada
        try {
          await fs.unlink(imageFile.path);
        } catch (error) {
          console.error('Error al eliminar imagen original:', error);
        }
        
        console.log(`✅ Imagen optimizada: ${imageUrl}`);
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
        useImageAsWallpaper: useImageAsWallpaper !== undefined ? (useImageAsWallpaper === 'true' || useImageAsWallpaper === true) : page.useImageAsWallpaper,
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

/**
 * POST /api/pages/bulk-create
 * Crea múltiples tarjetas sin audio (solo estructura)
 */
router.post('/bulk-create', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { storeName, serverId, quantity } = req.body;

    // Validaciones
    if (!storeName || !serverId) {
      throw new AppError('Faltan campos requeridos: storeName, serverId', 400);
    }

    const qty = parseInt(quantity, 10);
    if (![10, 50, 100, 1000].includes(qty)) {
      throw new AppError('La cantidad debe ser 10, 50, 100 o 1000', 400);
    }

    if (qty > 1000) {
      throw new AppError('No se pueden crear más de 1000 tarjetas a la vez', 400);
    }

    console.log(`🔄 Creando ${qty} tarjetas para ${storeName} (${serverId})...`);

    const createdPages = [];
    const errors = [];

    for (let i = 1; i <= qty; i++) {
      try {
        const page = await createEmptyPage({
          title: `${storeName} - ${serverId} - Tarjeta ${i}`,
          description: `Tarjeta ${i} de ${qty} para ${storeName}`,
          storeName,
          serverId,
        });
        createdPages.push(page);
        
        if (i % 10 === 0) {
          console.log(`  ✅ ${i}/${qty} tarjetas creadas...`);
        }
      } catch (error: any) {
        console.error(`  ❌ Error al crear tarjeta ${i}:`, error.message);
        errors.push({ index: i, error: error.message });
      }
    }

    console.log(`✨ ${createdPages.length}/${qty} tarjetas creadas exitosamente`);

    res.json({
      success: true,
      data: {
        created: createdPages.length,
        total: qty,
        errors: errors.length,
        pages: createdPages.map(p => ({
          code: p.code,
          pageUrl: p.pageUrl,
          title: p.title,
        })),
      },
      message: `${createdPages.length} tarjetas creadas para ${storeName}`,
    });
  } catch (error) {
    next(error);
  }
});

export { router as pageRouter };
