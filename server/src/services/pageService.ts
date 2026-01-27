import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface AudioPage {
  id: string;
  code: string;
  audioUrl: string;
  audioFilename: string;
  title?: string;
  description?: string;
  createdAt: Date;
  pageUrl: string;
  // Nuevos campos para personalización y límites
  isPersonalized?: boolean;
  playCount?: number;
  maxPlays?: number;
  expirationDate?: Date;
  personalizedAt?: Date;
  // Campos del formulario de personalización
  senderName?: string;
  recipientName?: string;
  writtenMessage?: string;
  imageUrl?: string;
  imageFilename?: string;
  // PIN de privacidad (opcional)
  pin?: string;
  hasPin?: boolean;
}

const pagesDir = process.env.PAGES_DIR || './pages-data';
const pagesFile = path.join(pagesDir, 'pages.json');

// Asegurar que el directorio existe
async function ensurePagesDir() {
  try {
    await fs.access(pagesDir);
  } catch {
    await fs.mkdir(pagesDir, { recursive: true });
  }
}

/**
 * Genera un código único de 8 caracteres
 */
function generateUniqueCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Carga todas las páginas desde el archivo
 */
async function loadPages(): Promise<AudioPage[]> {
  await ensurePagesDir();
  try {
    const data = await fs.readFile(pagesFile, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

/**
 * Guarda todas las páginas en el archivo
 */
async function savePages(pages: AudioPage[]): Promise<void> {
  await ensurePagesDir();
  await fs.writeFile(pagesFile, JSON.stringify(pages, null, 2), 'utf-8');
}

/**
 * Crea una nueva página de audio
 */
export async function createAudioPage(
  audioUrl: string,
  audioFilename: string,
  options?: {
    title?: string;
    description?: string;
    senderName?: string;
    recipientName?: string;
    writtenMessage?: string;
    imageUrl?: string;
    imageFilename?: string;
    pin?: string;
  }
): Promise<AudioPage> {
  const pages = await loadPages();
  
  // Generar código único (verificar que no exista)
  let code: string = '';
  let exists = true;
  while (exists) {
    code = generateUniqueCode();
    exists = pages.some((p) => p.code === code);
  }

  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  const pageUrl = `${baseUrl}/page/${code}`;

  // Fecha de expiración: 14 de febrero de 2026 a las 12:00 AM
  const expirationDate = new Date('2026-02-14T00:00:00');

  const newPage: AudioPage = {
    id: uuidv4(),
    code,
    audioUrl,
    audioFilename,
    title: options?.title || 'Audio Player',
    description: options?.description || 'Reproduce el audio',
    createdAt: new Date(),
    pageUrl,
    isPersonalized: !!options?.senderName || !!options?.recipientName || !!options?.writtenMessage || !!options?.imageUrl,
    playCount: 0,
    maxPlays: 5,
    expirationDate,
    senderName: options?.senderName,
    recipientName: options?.recipientName,
    writtenMessage: options?.writtenMessage,
    imageUrl: options?.imageUrl,
    imageFilename: options?.imageFilename,
    pin: options?.pin,
    hasPin: !!options?.pin,
  };

  pages.push(newPage);
  await savePages(pages);

  return newPage;
}

/**
 * Crea una página sin audio (solo estructura)
 */
export async function createEmptyPage(
  options?: {
    title?: string;
    description?: string;
    storeName?: string;
    serverId?: string;
    pin?: string;
  }
): Promise<AudioPage> {
  const pages = await loadPages();
  
  // Generar código único
  let code: string = '';
  let exists = true;
  while (exists) {
    code = generateUniqueCode();
    exists = pages.some((p) => p.code === code);
  }

  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  const pageUrl = `${baseUrl}/page/${code}`;
  
  // URL de audio placeholder (no existe realmente)
  const audioUrl = `${baseUrl}/api/audio/stream/placeholder.mp3`;
  const audioFilename = 'placeholder.mp3';

  const expirationDate = new Date('2026-02-14T00:00:00');

  const title = options?.title || (options?.storeName && options?.serverId 
    ? `Tarjeta ${options.storeName} - ${options.serverId}`
    : 'Tarjeta sin personalizar');

  const newPage: AudioPage = {
    id: uuidv4(),
    code,
    audioUrl,
    audioFilename,
    title,
    description: options?.description || 'Tarjeta creada en masa',
    createdAt: new Date(),
    pageUrl,
    isPersonalized: false,
    playCount: 0,
    maxPlays: 5,
    expirationDate,
    pin: options?.pin,
    hasPin: !!options?.pin,
  };

  pages.push(newPage);
  await savePages(pages);

  return newPage;
}

/**
 * Obtiene una página por su código
 */
export async function getPageByCode(code: string): Promise<AudioPage | null> {
  const pages = await loadPages();
  return pages.find((p) => p.code === code) || null;
}

/**
 * Obtiene todas las páginas
 */
export async function getAllPages(): Promise<AudioPage[]> {
  return loadPages();
}

/**
 * Elimina una página por su código
 */
export async function deletePageByCode(code: string): Promise<boolean> {
  const pages = await loadPages();
  const initialLength = pages.length;
  const filteredPages = pages.filter((p) => p.code !== code);
  
  if (filteredPages.length < initialLength) {
    await savePages(filteredPages);
    return true;
  }
  
  return false;
}

/**
 * Actualiza una página (personalización)
 */
export async function updatePageByCode(
  code: string,
  updates: {
    title?: string;
    description?: string;
    audioUrl?: string;
    audioFilename?: string;
    isPersonalized?: boolean;
    senderName?: string;
    recipientName?: string;
    writtenMessage?: string;
    imageUrl?: string;
    imageFilename?: string;
    pin?: string;
  }
): Promise<AudioPage | null> {
  const pages = await loadPages();
  const pageIndex = pages.findIndex((p) => p.code === code);
  
  if (pageIndex === -1) {
    return null;
  }

  const page = pages[pageIndex];
  const updatedPage: AudioPage = {
    ...page,
    ...updates,
    personalizedAt: updates.isPersonalized ? new Date() : page.personalizedAt,
    pin: updates.pin !== undefined ? updates.pin : page.pin,
    hasPin: updates.pin !== undefined ? !!updates.pin : page.hasPin,
  };

  pages[pageIndex] = updatedPage;
  await savePages(pages);

  return updatedPage;
}

/**
 * Incrementa el contador de reproducciones
 */
export async function incrementPlayCount(code: string): Promise<AudioPage | null> {
  const pages = await loadPages();
  const pageIndex = pages.findIndex((p) => p.code === code);
  
  if (pageIndex === -1) {
    return null;
  }

  const page = pages[pageIndex];
  const currentPlayCount = page.playCount || 0;
  const updatedPage: AudioPage = {
    ...page,
    playCount: currentPlayCount + 1,
  };

  pages[pageIndex] = updatedPage;
  await savePages(pages);

  return updatedPage;
}
