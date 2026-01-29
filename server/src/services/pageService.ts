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
  // URL de video (Facebook, Instagram, TikTok)
  videoUrl?: string;
  // PIN de privacidad (opcional)
  pin?: string;
  hasPin?: boolean;
  // Usar imagen como wallpaper/fondo
  useImageAsWallpaper?: boolean;
  // Marcar como tarjeta de prueba (no se borra)
  isTest?: boolean;
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
    videoUrl?: string;
    pin?: string;
    useImageAsWallpaper?: boolean;
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
    videoUrl: options?.videoUrl,
    pin: options?.pin,
    hasPin: !!options?.pin,
    useImageAsWallpaper: options?.useImageAsWallpaper || false,
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
  const page = pages.find((p) => p.code === code);
  
  if (!page) {
    return null;
  }
  
  // Reiniciar contador a cero si es después de las 12:00 AM del 14 de febrero de 2026
  const resetDate = new Date('2026-02-14T00:00:00');
  const now = new Date();
  
  // Si ya pasó la fecha de reinicio, resetear el contador
  if (now >= resetDate && (page.playCount || 0) > 0) {
    const pageIndex = pages.findIndex((p) => p.code === code);
    if (pageIndex !== -1) {
      pages[pageIndex] = {
        ...page,
        playCount: 0,
      };
      await savePages(pages);
      return pages[pageIndex];
    }
  }
  
  return page;
}

/**
 * Crea o obtiene la página demo
 * Siempre elimina la demo anterior y crea una nueva para empezar de cero
 */
export async function getOrCreateDemoPage(): Promise<AudioPage> {
  const DEMO_CODE = 'DEMO1234';
  const pages = await loadPages();
  
  // Eliminar la demo anterior si existe
  const demoIndex = pages.findIndex((p) => p.code === DEMO_CODE);
  if (demoIndex !== -1) {
    pages.splice(demoIndex, 1);
    await savePages(pages);
  }

  // Crear una nueva demo siempre
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  const pageUrl = `${baseUrl}/page/${DEMO_CODE}`;
  // Usar un audio placeholder que se creará automáticamente si no existe
  const audioUrl = `${baseUrl}/api/audio/stream/placeholder.mp3`;
  const audioFilename = 'placeholder.mp3';
  const expirationDate = new Date();
  expirationDate.setFullYear(expirationDate.getFullYear() + 1); // Expira en 1 año

  const demoPage: AudioPage = {
    id: uuidv4(),
    code: DEMO_CODE,
    audioUrl,
    audioFilename,
    title: 'Tarjeta Demo - Prueba la Funcionalidad',
    description: 'Esta es una tarjeta de demostración. Puedes grabar un mensaje de voz y personalizarla.',
    createdAt: new Date(),
    pageUrl,
    isPersonalized: false,
    playCount: 0,
    maxPlays: 100, // Más reproducciones para la demo
    expirationDate,
  };

  pages.push(demoPage);
  await savePages(pages);

  return demoPage;
}

/**
 * Obtiene todas las páginas
 */
export async function getAllPages(): Promise<AudioPage[]> {
  return loadPages();
}

/**
 * Elimina una página por su código
 * No elimina tarjetas marcadas como test
 */
export async function deletePageByCode(code: string): Promise<boolean> {
  const pages = await loadPages();
  const page = pages.find((p) => p.code === code);
  
  if (!page) {
    return false;
  }
  
  // No eliminar si está marcada como test
  if (page.isTest) {
    throw new Error('No se puede eliminar una tarjeta marcada como test');
  }
  
  const filteredPages = pages.filter((p) => p.code !== code);
  await savePages(filteredPages);
  return true;
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
    videoUrl?: string;
    pin?: string;
    useImageAsWallpaper?: boolean;
    isTest?: boolean;
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
    useImageAsWallpaper: updates.useImageAsWallpaper !== undefined ? updates.useImageAsWallpaper : page.useImageAsWallpaper,
    videoUrl: updates.videoUrl !== undefined ? updates.videoUrl : page.videoUrl,
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
  
  // Reiniciar contador a cero si es después de las 12:00 AM del 14 de febrero de 2026
  const resetDate = new Date('2026-02-14T00:00:00');
  const now = new Date();
  let currentPlayCount = page.playCount || 0;
  
  // Si ya pasó la fecha de reinicio, resetear el contador
  if (now >= resetDate) {
    currentPlayCount = 0;
  }
  
  const updatedPage: AudioPage = {
    ...page,
    playCount: currentPlayCount + 1,
  };

  pages[pageIndex] = updatedPage;
  await savePages(pages);

  return updatedPage;
}
