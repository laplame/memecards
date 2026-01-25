#!/usr/bin/env tsx

/**
 * Script para crear páginas de prueba
 * Crea una página de prueba sin necesidad de archivo de audio
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createAudioPage } from '../src/services/pageService.js';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar .env
dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config({ path: path.join(__dirname, '../.env') });

const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

async function createTestPages() {
  try {
    console.log('🧪 Creando páginas de prueba...\n');

    // Crear un archivo de audio dummy (solo para testing)
    const processedDir = process.env.PROCESSED_DIR || './processed';
    await fs.mkdir(processedDir, { recursive: true });

    // Crear páginas de prueba con URLs de audio de ejemplo
    const testPages = [
      {
        title: 'Página de Prueba 1',
        description: 'Esta es una página de prueba para el dashboard',
        audioUrl: `${baseUrl}/api/audio/stream/test1.mp3`,
      },
      {
        title: 'Página de Prueba 2',
        description: 'Segunda página de prueba',
        audioUrl: `${baseUrl}/api/audio/stream/test2.mp3`,
      },
      {
        title: 'Página de Prueba 3',
        description: 'Tercera página de prueba',
        audioUrl: `${baseUrl}/api/audio/stream/test3.mp3`,
      },
    ];

    const createdPages = [];

    for (let i = 0; i < testPages.length; i++) {
      const testPage = testPages[i];
      try {
        // Crear un archivo dummy
        const dummyFile = path.join(processedDir, `test-${i + 1}.mp3`);
        await fs.writeFile(dummyFile, 'dummy audio content');

        const page = await createAudioPage(
          testPage.audioUrl,
          dummyFile,
          {
            title: testPage.title,
            description: testPage.description,
          }
        );

        createdPages.push(page);
        console.log(`✅ Página ${i + 1} creada: ${page.code}`);
        console.log(`   URL: ${page.pageUrl}`);
      } catch (error: any) {
        console.error(`❌ Error al crear página ${i + 1}:`, error.message);
      }
    }

    console.log(`\n✨ ${createdPages.length} páginas de prueba creadas exitosamente!`);
    console.log('\n📋 URLs generadas:');
    createdPages.forEach((page, index) => {
      console.log(`   ${index + 1}. ${page.pageUrl}`);
    });

    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createTestPages();
