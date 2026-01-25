import { createAudioPage } from './pageService.js';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

/**
 * Genera automáticamente 10 páginas adicionales cuando se crea una nueva página
 * Usa el mismo archivo de audio procesado para crear múltiples páginas
 */
export async function generateAdditionalPages(
  processedAudioPath: string,
  processedAudioUrl: string,
  count: number = 10
): Promise<void> {
  try {
    const processedDir = process.env.PROCESSED_DIR || './processed';

    // Verificar que el archivo procesado existe
    try {
      await fs.access(processedAudioPath);
    } catch {
      console.warn('Archivo procesado no encontrado para generar páginas adicionales');
      return;
    }

    console.log(`🔄 Generando ${count} páginas adicionales automáticamente...`);

    // Crear múltiples páginas usando el mismo audio procesado
    const pages = [];
    for (let i = 1; i <= count; i++) {
      try {
        // Copiar el archivo procesado para cada página
        const fileExt = path.extname(processedAudioPath);
        const newFilename = `${uuidv4()}${fileExt}`;
        const newPath = path.join(processedDir, newFilename);
        await fs.copyFile(processedAudioPath, newPath);

        // Crear URL para el nuevo archivo
        const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
        const audioUrl = `${baseUrl}/api/audio/stream/${newFilename}`;

        // Crear la página
        const page = await createAudioPage(
          audioUrl,
          newPath,
          {
            title: `Página Auto ${i}`,
            description: `Página generada automáticamente #${i}`,
          }
        );

        pages.push(page);
        console.log(`  ✅ Página ${i}/${count} creada: ${page.code} - ${page.pageUrl}`);
      } catch (error) {
        console.error(`  ❌ Error al crear página ${i}:`, error);
      }
    }

    console.log(`✨ ${pages.length}/${count} páginas adicionales generadas exitosamente`);
  } catch (error) {
    console.error('Error al generar páginas adicionales:', error);
    // No lanzar error para no interrumpir la creación de la página principal
  }
}
