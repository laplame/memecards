#!/usr/bin/env tsx

/**
 * Script simple para crear páginas de prueba directamente en el archivo JSON
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar .env
dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config({ path: path.join(__dirname, '../.env') });

const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
const pagesDir = path.join(__dirname, '../pages-data');
const pagesFile = path.join(pagesDir, 'pages.json');

function generateUniqueCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

async function createTestPages() {
  try {
    console.log('🧪 Creando páginas de prueba...\n');

    // Asegurar que el directorio existe
    await fs.mkdir(pagesDir, { recursive: true });

    // Cargar páginas existentes
    let existingPages: any[] = [];
    try {
      const data = await fs.readFile(pagesFile, 'utf-8');
      existingPages = JSON.parse(data);
    } catch {
      // Archivo no existe, empezar con array vacío
    }

    // Crear 10 páginas de prueba
    const testPages = [];
    for (let i = 1; i <= 10; i++) {
      const code = generateUniqueCode();
      const page = {
        id: uuidv4(),
        code,
        audioUrl: `${baseUrl}/api/audio/stream/test-${i}.mp3`,
        audioFilename: `test-${i}.mp3`,
        title: `Página de Prueba ${i}`,
        description: `Esta es la página de prueba número ${i} para el dashboard`,
        createdAt: new Date().toISOString(),
        pageUrl: `${baseUrl}/page/${code}`,
      };
      testPages.push(page);
      console.log(`✅ Página ${i} creada: ${code} - ${page.pageUrl}`);
    }

    // Combinar con páginas existentes
    const allPages = [...existingPages, ...testPages];

    // Guardar
    await fs.writeFile(pagesFile, JSON.stringify(allPages, null, 2), 'utf-8');

    console.log(`\n✨ ${testPages.length} páginas de prueba creadas exitosamente!`);
    console.log(`📊 Total de páginas: ${allPages.length}`);
    console.log('\n📋 URLs generadas:');
    testPages.forEach((page, index) => {
      console.log(`   ${index + 1}. ${page.pageUrl}`);
    });

    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createTestPages();
