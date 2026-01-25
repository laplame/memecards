#!/usr/bin/env tsx

/**
 * Script para actualizar páginas existentes con los nuevos campos
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import { AudioPage } from '../src/services/pageService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar .env
dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config({ path: path.join(__dirname, '../.env') });

const pagesDir = process.env.PAGES_DIR || './pages-data';
const pagesFile = path.join(pagesDir, 'pages.json');

async function updateExistingPages() {
  try {
    console.log('🔄 Actualizando páginas existentes...\n');

    // Leer páginas existentes
    let pages: AudioPage[] = [];
    try {
      const data = await fs.readFile(pagesFile, 'utf-8');
      pages = JSON.parse(data);
    } catch (error) {
      console.log('⚠️  No se encontraron páginas existentes');
      process.exit(0);
    }

    if (pages.length === 0) {
      console.log('ℹ️  No hay páginas para actualizar');
      process.exit(0);
    }

    // Calcular fecha de expiración
    const expirationDate = new Date();
    expirationDate.setMonth(1); // Febrero
    expirationDate.setDate(14);
    expirationDate.setHours(0, 0, 0, 0);
    if (expirationDate < new Date()) {
      expirationDate.setFullYear(expirationDate.getFullYear() + 1);
    }

    let updatedCount = 0;

    // Actualizar cada página
    for (const page of pages) {
      const needsUpdate = 
        page.isPersonalized === undefined ||
        page.playCount === undefined ||
        page.maxPlays === undefined ||
        page.expirationDate === undefined;

      if (needsUpdate) {
        page.isPersonalized = page.isPersonalized || false;
        page.playCount = page.playCount || 0;
        page.maxPlays = page.maxPlays || 5;
        page.expirationDate = page.expirationDate || expirationDate.toISOString();
        updatedCount++;
        console.log(`✅ Actualizada: ${page.code}`);
      }
    }

    // Guardar páginas actualizadas
    await fs.writeFile(pagesFile, JSON.stringify(pages, null, 2), 'utf-8');

    console.log(`\n✨ ${updatedCount} de ${pages.length} páginas actualizadas`);
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

updateExistingPages();
