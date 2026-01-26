import { Router } from 'express';
import { upload } from '../middleware/upload.js';
import { processAudio, getAudioInfo, convertAudio } from '../services/audioProcessor.js';
import { AppError } from '../middleware/errorHandler.js';
import path from 'path';
import fs from 'fs/promises';
import { Request, Response, NextFunction } from 'express';

const router = Router();
const processedDir = process.env.PROCESSED_DIR || './processed';
const uploadDir = process.env.UPLOAD_DIR || './uploads';
const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

/**
 * POST /api/audio/upload
 * Sube un archivo de audio
 */
router.post(
  '/upload',
  upload.single('audio'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        throw new AppError('No se proporcionó ningún archivo');
      }

      const filePath = req.file.path;
      const fileInfo = await getAudioInfo(filePath);

      res.json({
        success: true,
        data: {
          fileId: path.basename(req.file.filename, path.extname(req.file.filename)),
          filename: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype,
          info: fileInfo,
          uploadUrl: `${baseUrl}/api/audio/file/${req.file.filename}`,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/audio/process
 * Procesa un archivo de audio subido
 */
router.post(
  '/process',
  upload.single('audio'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        throw new AppError('No se proporcionó ningún archivo');
      }

      const { format, bitrate, sampleRate } = req.body;
      const processed = await processAudio(req.file.path, {
        format: format || 'mp3',
        bitrate: bitrate ? parseInt(bitrate, 10) : undefined,
        sampleRate: sampleRate ? parseInt(sampleRate, 10) : undefined,
      });

      res.json({
        success: true,
        data: processed,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/audio/file/:filename
 * Obtiene un archivo de audio original
 */
router.get('/file/:filename', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(uploadDir, filename);

    try {
      await fs.access(filePath);
    } catch {
      throw new AppError('Archivo no encontrado', 404);
    }

    res.sendFile(path.resolve(filePath));
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/audio/stream/:filename
 * Stream de audio procesado
 */
router.get('/stream/:filename', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filename = req.params.filename;
    
    // Verificar que el directorio existe
    try {
      await fs.access(processedDir);
    } catch {
      await fs.mkdir(processedDir, { recursive: true });
    }
    
    const filePath = path.join(processedDir, filename);

    try {
      await fs.access(filePath);
    } catch {
      console.warn(`⚠️  Archivo de audio no encontrado: ${filename} en ${processedDir}`);
      throw new AppError(`Archivo procesado no encontrado: ${filename}`, 404);
    }

    const stat = await fs.stat(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      // Streaming con soporte para range requests
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = end - start + 1;
      const file = await fs.readFile(filePath);
      const chunk = file.slice(start, end + 1);

      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'audio/mpeg',
      };

      res.writeHead(206, head);
      res.end(chunk);
    } else {
      // Envío completo del archivo
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'audio/mpeg',
      };

      res.writeHead(200, head);
      const file = await fs.readFile(filePath);
      res.end(file);
    }
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/audio/info/:filename
 * Obtiene información de un archivo de audio
 */
router.get('/info/:filename', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(uploadDir, filename);

    try {
      await fs.access(filePath);
    } catch {
      throw new AppError('Archivo no encontrado', 404);
    }

    const info = await getAudioInfo(filePath);
    const stat = await fs.stat(filePath);

    res.json({
      success: true,
      data: {
        filename,
        size: stat.size,
        info,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/audio/convert
 * Convierte un archivo de audio a otro formato
 */
router.post(
  '/convert',
  upload.single('audio'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        throw new AppError('No se proporcionó ningún archivo');
      }

      const { format } = req.body;
      if (!format || !['mp3', 'wav', 'ogg'].includes(format)) {
        throw new AppError('Formato inválido. Use: mp3, wav o ogg', 400);
      }

      const outputPath = await convertAudio(req.file.path, format as 'mp3' | 'wav' | 'ogg');
      const outputFilename = path.basename(outputPath);
      const url = `${baseUrl}/api/audio/stream/${outputFilename}`;

      res.json({
        success: true,
        data: {
          originalFile: req.file.originalname,
          convertedFile: outputFilename,
          format,
          url,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/audio/generate-url
 * Genera una URL dinámica para un archivo
 */
router.get('/generate-url', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { filename, expiresIn } = req.query;

    if (!filename) {
      throw new AppError('Se requiere el parámetro filename', 400);
    }

    // Verificar que el archivo existe
    const filePath = path.join(processedDir, filename as string);
    try {
      await fs.access(filePath);
    } catch {
      throw new AppError('Archivo no encontrado', 404);
    }

    // Generar URL dinámica (puedes agregar lógica de expiración aquí)
    const expiresAt = expiresIn
      ? new Date(Date.now() + parseInt(expiresIn as string, 10) * 1000)
      : null;

    const url = `${baseUrl}/api/audio/stream/${filename}`;

    res.json({
      success: true,
      data: {
        url,
        filename: filename as string,
        expiresAt,
        expiresIn: expiresIn ? parseInt(expiresIn as string, 10) : null,
      },
    });
  } catch (error) {
    next(error);
  }
});

export { router as audioRouter };
