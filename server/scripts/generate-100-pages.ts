#!/usr/bin/env tsx

/**
 * Script para generar 100 páginas de ejemplo con audio
 * Uso: tsx scripts/generate-100-pages.ts
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import QRCode from 'qrcode';
import FormData from 'form-data';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';
const OUTPUT_DIR = path.join(__dirname, '..', 'generated-qrs');

// Asegurar que el directorio existe
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Títulos y descripciones de ejemplo
const titles = [
  'Mensaje de Amor',
  'Tarjeta Especial',
  'Recuerdo Inolvidable',
  'Mensaje del Corazón',
  'Voz del Alma',
  'Mensaje Personal',
  'Tarjeta Única',
  'Mensaje Especial',
  'Recuerdo Eterno',
  'Voz del Amor',
];

const descriptions = [
  'Un mensaje especial para ti',
  'Escucha este mensaje con atención',
  'Este audio contiene algo importante',
  'Un recuerdo que durará para siempre',
  'Mensaje grabado con cariño',
  'Escucha mi voz',
  'Un momento especial capturado',
  'Mensaje personalizado para ti',
  'Este audio es único',
  'Un regalo en forma de voz',
];

// Crear un archivo de audio de ejemplo (silencioso, solo para testing)
async function createDummyAudioFile(): Promise<string> {
  const audioPath = path.join(__dirname, '..', 'dummy-audio.mp3');
  
  // Si no existe, crear un archivo de audio mínimo (solo metadata)
  if (!fs.existsSync(audioPath)) {
    // Crear un archivo MP3 mínimo válido (solo headers)
    // En producción, usarías un archivo real
    console.log('⚠️  Nota: Necesitas un archivo de audio real para generar páginas.');
    console.log('   Coloca un archivo llamado "dummy-audio.mp3" en la carpeta server/');
    console.log('   O modifica este script para usar un archivo de audio existente.\n');
    return '';
  }
  
  return audioPath;
}

async function generatePage(audioPath: string, index: number): Promise<void> {
  try {
    const title = `${titles[index % titles.length]} #${index + 1}`;
    const description = `${descriptions[index % descriptions.length]} - Página ${index + 1}`;

    console.log(`[${index + 1}/100] Creando página: ${title}...`);

    // Crear FormData
    const form = new FormData();
    form.append('audio', fs.createReadStream(audioPath));
    form.append('title', title);
    form.append('description', description);

    // Subir y crear página
    const response = await fetch(`${BACKEND_URL}/api/pages/create`, {
      method: 'POST',
      body: form,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Error al crear página');
    }

    const data = await response.json();
    const page = data.data.page;

    // Generar QR code
    const qrDataUrl = await QRCode.toDataURL(page.pageUrl, {
      width: 500,
      margin: 2,
      color: {
        dark: '#DC2626',
        light: '#FFFFFF',
      },
    });

    // Guardar QR code
    const qrPath = path.join(OUTPUT_DIR, `qr-${page.code}.png`);
    const base64Data = qrDataUrl.replace(/^data:image\/png;base64,/, '');
    fs.writeFileSync(qrPath, base64Data, 'base64');

    console.log(`   ✅ Creada: ${page.code} - ${page.pageUrl}`);
    console.log(`   📱 QR guardado: qr-${page.code}.png`);

    return page;
  } catch (error: any) {
    console.error(`   ❌ Error: ${error.message}`);
    throw error;
  }
}

async function main() {
  console.log('🚀 Generando 100 páginas de ejemplo con QR codes...\n');

  const audioPath = await createDummyAudioFile();
  
  if (!audioPath || !fs.existsSync(audioPath)) {
    console.log('❌ No se encontró archivo de audio. Por favor:');
    console.log('   1. Coloca un archivo MP3 en server/dummy-audio.mp3');
    console.log('   2. O modifica el script para usar otro archivo\n');
    console.log('💡 Alternativa: Usa el endpoint directamente desde el frontend o crea páginas manualmente.');
    process.exit(1);
  }

  const pages: any[] = [];
  const errors: any[] = [];

  // Generar páginas en lotes para no sobrecargar el servidor
  const batchSize = 5;
  for (let i = 0; i < 100; i += batchSize) {
    const batch = [];
    for (let j = 0; j < batchSize && i + j < 100; j++) {
      batch.push(generatePage(audioPath, i + j));
    }

    try {
      const results = await Promise.allSettled(batch);
      results.forEach((result, idx) => {
        if (result.status === 'fulfilled') {
          pages.push(result.value);
        } else {
          errors.push({ index: i + idx, error: result.reason });
        }
      });
    } catch (error) {
      console.error(`Error en lote ${i / batchSize + 1}:`, error);
    }

    // Pequeña pausa entre lotes
    if (i + batchSize < 100) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  // Generar resumen
  const summaryPath = path.join(OUTPUT_DIR, 'summary.json');
  const summary = {
    total: 100,
    created: pages.length,
    errors: errors.length,
    pages: pages.map((p) => ({
      code: p.code,
      url: p.pageUrl,
      qrFile: `qr-${p.code}.png`,
    })),
    errors: errors,
    generatedAt: new Date().toISOString(),
  };

  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));

  console.log('\n✨ Generación completada!\n');
  console.log(`📊 Resumen:`);
  console.log(`   ✅ Páginas creadas: ${pages.length}/100`);
  console.log(`   ❌ Errores: ${errors.length}`);
  console.log(`   📁 QR codes guardados en: ${OUTPUT_DIR}`);
  console.log(`   📄 Resumen guardado en: ${summaryPath}\n`);

  if (pages.length > 0) {
    console.log('🌐 URLs generadas:');
    pages.slice(0, 5).forEach((page) => {
      console.log(`   - ${page.pageUrl}`);
    });
    if (pages.length > 5) {
      console.log(`   ... y ${pages.length - 5} más`);
    }
  }
}

main().catch((error) => {
  console.error('Error fatal:', error);
  process.exit(1);
});
