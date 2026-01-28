#!/usr/bin/env tsx
/**
 * Script de diagnóstico para verificar variables de entorno
 * Ejecutar con: npx tsx scripts/check-env.ts
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Diagnóstico de Variables de Entorno\n');
console.log('=' .repeat(60));

// Información del sistema
console.log('\n📁 Información del Sistema:');
console.log(`   process.cwd(): ${process.cwd()}`);
console.log(`   __dirname: ${__dirname}`);

// Rutas posibles del .env
const possiblePaths = [
  path.resolve(process.cwd(), '.env'),                    // Desde donde se ejecuta
  path.resolve(process.cwd(), '../.env'),                 // Raíz del proyecto
  path.resolve(__dirname, '../.env'),                     // server/.env
  path.resolve(__dirname, '../../.env'),                   // raíz/.env desde server/scripts
  path.resolve(__dirname, '../../../.env'),                // raíz/.env desde server/src
];

console.log('\n📂 Rutas posibles del archivo .env:');
possiblePaths.forEach((envPath, index) => {
  const exists = fs.existsSync(envPath);
  console.log(`   ${index + 1}. ${envPath} ${exists ? '✅ EXISTE' : '❌ NO EXISTE'}`);
  if (exists) {
    try {
      const content = fs.readFileSync(envPath, 'utf-8');
      const lines = content.split('\n').filter(line => line.trim() && !line.trim().startsWith('#'));
      console.log(`      Contiene ${lines.length} variables definidas`);
      
      // Buscar nano_banana específicamente
      const nanoBananaLine = lines.find(line => 
        line.toLowerCase().includes('nano') || line.toLowerCase().includes('banana')
      );
      if (nanoBananaLine) {
        const [key, ...valueParts] = nanoBananaLine.split('=');
        const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
        console.log(`      ✅ Encontrada: ${key.trim()}=${value.substring(0, 10)}... (longitud: ${value.length})`);
      }
    } catch (error) {
      console.log(`      ⚠️  Error al leer: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }
});

// Intentar cargar .env desde diferentes ubicaciones
console.log('\n🔄 Intentando cargar .env:');

let loaded = false;
for (const envPath of possiblePaths) {
  if (fs.existsSync(envPath)) {
    console.log(`   Intentando cargar desde: ${envPath}`);
    const result = dotenv.config({ path: envPath });
    if (!result.error) {
      console.log(`   ✅ Cargado exitosamente desde: ${envPath}`);
      loaded = true;
      break;
    } else {
      console.log(`   ❌ Error al cargar: ${result.error.message}`);
    }
  }
}

if (!loaded) {
  console.log('   ⚠️  No se pudo cargar ningún archivo .env');
}

// Verificar variables de entorno
console.log('\n🔑 Variables de Entorno Cargadas:');
console.log('   Variables que contienen "nano" o "banana":');
const nanoVars = Object.keys(process.env).filter(key => 
  key.toLowerCase().includes('nano') || key.toLowerCase().includes('banana')
);

if (nanoVars.length > 0) {
  nanoVars.forEach(key => {
    const value = process.env[key] || '';
    const maskedValue = value.length > 10 
      ? `${value.substring(0, 10)}... (${value.length} caracteres)`
      : value.length > 0 
        ? `${value.substring(0, value.length)} (${value.length} caracteres)`
        : 'VACÍA';
    console.log(`   ✅ ${key} = ${maskedValue}`);
  });
} else {
  console.log('   ❌ No se encontraron variables relacionadas con nano_banana');
}

// Verificar específicamente nano_banana
console.log('\n🎯 Verificación Específica de nano_banana:');
const checks = [
  { name: 'process.env.nano_banana', value: process.env.nano_banana },
  { name: 'process.env.NANO_BANANA', value: process.env.NANO_BANANA },
  { name: 'process.env["nano_banana"]', value: process.env['nano_banana'] },
  { name: 'process.env["NANO_BANANA"]', value: process.env['NANO_BANANA'] },
];

let found = false;
checks.forEach(check => {
  if (check.value) {
    console.log(`   ✅ ${check.name}: ${check.value.substring(0, 10)}... (${check.value.length} caracteres)`);
    found = true;
  } else {
    console.log(`   ❌ ${check.name}: undefined`);
  }
});

if (!found) {
  console.log('\n❌ PROBLEMA: nano_banana no está disponible en process.env');
  console.log('\n💡 Soluciones posibles:');
  console.log('   1. Verifica que el archivo .env esté en la raíz del proyecto');
  console.log('   2. Verifica que la variable se llame exactamente: nano_banana=...');
  console.log('   3. Asegúrate de que no haya espacios alrededor del signo =');
  console.log('   4. Reinicia el servidor después de modificar .env');
  console.log('   5. Verifica que el archivo .env no tenga comillas innecesarias');
} else {
  console.log('\n✅ ÉXITO: nano_banana está disponible');
}

console.log('\n' + '='.repeat(60));
