#!/usr/bin/env tsx

/**
 * Script para poblar la base de datos con tiendas de ejemplo
 * Uso: tsx scripts/seed-stores.ts
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDatabase } from '../src/config/database.js';
import { StoreLocation } from '../src/models/StoreLocation.js';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar .env desde la raíz del proyecto y desde server/
dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config({ path: path.join(__dirname, '../.env') });

const sampleStores = [
  {
    name: 'Papelería El Corazón',
    address: 'Av. Principal 123, Centro',
    phone: '+52 55 1234 5678',
    hours: 'Lun-Sab: 9:00 AM - 8:00 PM',
    latitude: 19.4326,
    longitude: -99.1332,
    city: 'Ciudad de México',
    state: 'CDMX',
    country: 'México',
    isActive: true,
  },
  {
    name: 'Regalos y Más',
    address: 'Calle Reforma 456, Zona Rosa',
    phone: '+52 55 2345 6789',
    hours: 'Lun-Dom: 10:00 AM - 9:00 PM',
    latitude: 19.4285,
    longitude: -99.1616,
    city: 'Ciudad de México',
    state: 'CDMX',
    country: 'México',
    isActive: true,
  },
  {
    name: 'Artesanías del Amor',
    address: 'Plaza del Sol, Local 12',
    phone: '+52 33 3456 7890',
    hours: 'Lun-Sab: 8:00 AM - 7:00 PM',
    latitude: 20.6597,
    longitude: -103.3496,
    city: 'Guadalajara',
    state: 'Jalisco',
    country: 'México',
    isActive: true,
  },
  {
    name: 'Tarjetas Especiales',
    address: 'Av. Insurgentes 789, Col. Roma',
    phone: '+52 55 4567 8901',
    hours: 'Lun-Vie: 9:00 AM - 7:00 PM',
    latitude: 19.4208,
    longitude: -99.1606,
    city: 'Ciudad de México',
    state: 'CDMX',
    country: 'México',
    isActive: true,
  },
  {
    name: 'Regalos Únicos',
    address: 'Centro Comercial Galerías, Nivel 2',
    phone: '+52 81 5678 9012',
    hours: 'Lun-Dom: 10:00 AM - 10:00 PM',
    latitude: 25.6866,
    longitude: -100.3161,
    city: 'Monterrey',
    state: 'Nuevo León',
    country: 'México',
    isActive: true,
  },
  {
    name: 'Papelería San Valentín',
    address: 'Calle 60 #456, Centro Histórico',
    phone: '+52 999 6789 0123',
    hours: 'Lun-Sab: 8:00 AM - 6:00 PM',
    latitude: 20.9674,
    longitude: -89.5926,
    city: 'Mérida',
    state: 'Yucatán',
    country: 'México',
    isActive: true,
  },
];

async function seedStores() {
  try {
    console.log('🌱 Iniciando seed de tiendas...\n');

    // Conectar a MongoDB
    if (!process.env.MONGODB_ATLAS && !process.env.MONGODB_URI) {
      throw new Error('MONGODB_ATLAS o MONGODB_URI no está configurada en .env');
    }

    await connectDatabase();

    // Limpiar tiendas existentes (opcional)
    const { clear } = process.argv.includes('--clear');
    if (clear) {
      console.log('🗑️  Eliminando tiendas existentes...');
      await StoreLocation.deleteMany({});
      console.log('✅ Tiendas eliminadas\n');
    }

    // Insertar tiendas
    console.log(`📦 Insertando ${sampleStores.length} tiendas...`);
    const result = await StoreLocation.insertMany(sampleStores, { ordered: false });

    console.log(`\n✅ ${result.length} tiendas insertadas exitosamente!`);
    console.log('\n📊 Resumen:');
    result.forEach((store, index) => {
      console.log(`   ${index + 1}. ${store.name} (${store.city}) - ID: ${store._id}`);
    });

    // Cerrar conexión
    await mongoose.connection.close();
    console.log('\n✅ Seed completado');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error durante el seed:', error.message);
    if (error.name === 'BulkWriteError') {
      console.error('Algunas tiendas ya existen o hay duplicados');
    }
    await mongoose.connection.close();
    process.exit(1);
  }
}

seedStores();
