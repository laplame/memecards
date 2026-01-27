import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const imagesDir = process.env.IMAGES_DIR || './images';
const optimizedDir = path.join(imagesDir, 'optimized');

// Crear directorio de imágenes optimizadas si no existe
async function ensureOptimizedDir() {
  try {
    await fs.access(optimizedDir);
  } catch {
    await fs.mkdir(optimizedDir, { recursive: true });
  }
}

/**
 * Optimiza una imagen: redimensiona y comprime
 * @param imagePath Ruta de la imagen original
 * @param maxWidth Ancho máximo (default: 1200px)
 * @param maxHeight Alto máximo (default: 1200px)
 * @param quality Calidad JPEG (default: 80)
 * @returns Ruta de la imagen optimizada
 */
export async function optimizeImage(
  imagePath: string,
  options?: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
  }
): Promise<string> {
  await ensureOptimizedDir();

  const maxWidth = options?.maxWidth || 1200;
  const maxHeight = options?.maxHeight || 1200;
  const quality = options?.quality || 80;

  const ext = path.extname(imagePath).toLowerCase();
  const outputFilename = `${uuidv4()}.jpg`; // Siempre convertir a JPEG para mejor compresión
  const outputPath = path.join(optimizedDir, outputFilename);

  try {
    await sharp(imagePath)
      .resize(maxWidth, maxHeight, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality, mozjpeg: true })
      .toFile(outputPath);

    return outputPath;
  } catch (error) {
    throw new Error(`Error al optimizar imagen: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Descarga y optimiza una imagen desde una URL
 * @param imageUrl URL de la imagen
 * @returns Ruta de la imagen optimizada
 */
export async function downloadAndOptimizeImage(
  imageUrl: string,
  options?: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
  }
): Promise<string> {
  await ensureOptimizedDir();

  const maxWidth = options?.maxWidth || 1200;
  const maxHeight = options?.maxHeight || 1200;
  const quality = options?.quality || 80;

  const outputFilename = `${uuidv4()}.jpg`;
  const outputPath = path.join(optimizedDir, outputFilename);

  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Error al descargar imagen: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await sharp(buffer)
      .resize(maxWidth, maxHeight, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality, mozjpeg: true })
      .toFile(outputPath);

    return outputPath;
  } catch (error) {
    throw new Error(`Error al descargar y optimizar imagen: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
