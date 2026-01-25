#!/usr/bin/env tsx

/**
 * Script para generar 10 páginas nuevas sin personalizar
 * Para probar la lógica de personalización
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import { createAudioPage } from '../src/services/pageService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar .env
dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config({ path: path.join(__dirname, '../.env') });

const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

async function generateUnusedPages() {
  try {
    console.log('🎴 Generando 10 páginas nuevas sin personalizar...\n');

    // Crear un archivo de audio dummy para las páginas
    const processedDir = process.env.PROCESSED_DIR || './processed';
    await fs.mkdir(processedDir, { recursive: true });

    const dummyAudioPath = path.join(processedDir, 'dummy-audio.mp3');
    const dummyAudioUrl = `${baseUrl}/api/audio/stream/dummy-audio.mp3`;

    // Crear archivo dummy si no existe
    try {
      await fs.access(dummyAudioPath);
    } catch {
      // Crear un archivo vacío como placeholder
      await fs.writeFile(dummyAudioPath, 'dummy');
      console.log('📁 Archivo dummy creado (será reemplazado al personalizar)\n');
    }

    const createdPages = [];

    for (let i = 1; i <= 10; i++) {
      try {
        const page = await createAudioPage(
          dummyAudioUrl,
          'dummy-audio.mp3',
          {
            title: `Tarjeta ${i}`,
            description: `Página de prueba ${i} - Lista para personalizar`,
          }
        );

        createdPages.push(page);
        console.log(`✅ Página ${i} creada: ${page.code}`);
        console.log(`   URL: ${page.pageUrl}`);
        console.log(`   Estado: ${page.isPersonalized ? 'Personalizada' : 'Sin personalizar ✨'}\n`);
      } catch (error: any) {
        console.error(`❌ Error al crear página ${i}:`, error.message);
      }
    }

    console.log(`\n✨ ${createdPages.length} páginas generadas exitosamente!`);
    console.log('\n📋 URLs generadas (listas para personalizar):');
    console.log('─'.repeat(60));
    createdPages.forEach((page, index) => {
      console.log(`${String(index + 1).padStart(2, ' ')}. ${page.pageUrl}`);
    });
    console.log('─'.repeat(60));
    console.log('\n💡 Instrucciones:');
    console.log('   1. Visita cualquiera de las URLs arriba');
    console.log('   2. Verás el formulario de personalización');
    console.log('   3. Completa el formulario y sube tu audio');
    console.log('   4. Después de personalizar, solo podrás reproducir el audio');
    console.log('   5. Máximo 5 reproducciones o hasta el 14 de febrero a las 12 AM\n');

    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

generateUnusedPages();
