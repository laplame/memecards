#!/usr/bin/env node

/**
 * Script de ejemplo para crear una página con audio
 * Uso: node create-page-example.js <archivo_audio> [titulo] [descripcion]
 */

import fs from 'fs';
import FormData from 'form-data';
import fetch from 'node-fetch';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function createAudioPage(audioPath, title = 'Audio Player', description = 'Reproduce el audio') {
  if (!fs.existsSync(audioPath)) {
    console.error(`❌ Error: El archivo ${audioPath} no existe`);
    process.exit(1);
  }

  console.log(`📤 Subiendo y creando página para: ${audioPath}`);
  console.log(`📝 Título: ${title}`);
  console.log(`📄 Descripción: ${description}\n`);

  try {
    const form = new FormData();
    form.append('audio', fs.createReadStream(audioPath));
    form.append('title', title);
    form.append('description', description);

    const response = await fetch(`${BASE_URL}/api/pages/create`, {
      method: 'POST',
      body: form,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Error:', data.error || data.message);
      process.exit(1);
    }

    if (data.success && data.data?.page) {
      const page = data.data.page;
      console.log('✅ Página creada exitosamente!\n');
      console.log(`🌐 URL: ${page.pageUrl}`);
      console.log(`🔑 Código: ${page.code}`);
      console.log(`📅 Creada: ${new Date(page.createdAt).toLocaleString()}\n`);
      console.log('Abre la URL en tu navegador para ver la página de audio.');
    } else {
      console.error('❌ Error: Respuesta inesperada del servidor');
      console.log(data);
    }
  } catch (error) {
    console.error('❌ Error al crear la página:', error.message);
    process.exit(1);
  }
}

// Obtener argumentos de la línea de comandos
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('Uso: node create-page-example.js <archivo_audio> [titulo] [descripcion]');
  console.log('\nEjemplo:');
  console.log('  node create-page-example.js audio.mp3 "Mi Audio" "Descripción del audio"');
  process.exit(1);
}

const [audioPath, title, description] = args;
createAudioPage(audioPath, title, description);
