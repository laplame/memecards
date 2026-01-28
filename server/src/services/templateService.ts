import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { AudioPage } from './pageService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const templatePath = path.join(__dirname, '..', 'templates', 'audioPage.html');

/**
 * Renderiza el template HTML con los datos de la página
 */
export async function renderAudioPage(page: AudioPage): Promise<string> {
  try {
    let template = await fs.readFile(templatePath, 'utf-8');
    
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const isPersonalized = Boolean(page.isPersonalized);
    const playCount = page.playCount || 0;
    const maxPlays = page.maxPlays || 5;
    const expirationDate = page.expirationDate 
      ? new Date(page.expirationDate).toISOString() 
      : '';
    
    // Reemplazar placeholders
    template = template.replace(/{{TITLE}}/g, escapeHtml(page.title || 'Audio Player'));
    template = template.replace(/{{DESCRIPTION}}/g, escapeHtml(page.description || 'Reproduce el audio'));
    template = template.replace(/{{AUDIO_URL}}/g, escapeHtml(page.audioUrl));
    template = template.replace(/{{CODE}}/g, escapeHtml(page.code));
    template = template.replace(/{{BASE_URL}}/g, escapeHtml(baseUrl));
    template = template.replace(/{{IS_PERSONALIZED}}/g, String(isPersonalized));
    template = template.replace(/{{PLAY_COUNT}}/g, String(playCount));
    template = template.replace(/{{MAX_PLAYS}}/g, String(maxPlays));
    template = template.replace(/{{EXPIRATION_DATE}}/g, expirationDate);
    template = template.replace(/{{SENDER_NAME}}/g, escapeHtml(page.senderName || ''));
    template = template.replace(/{{RECIPIENT_NAME}}/g, escapeHtml(page.recipientName || ''));
    template = template.replace(/{{WRITTEN_MESSAGE}}/g, escapeHtml(page.writtenMessage || ''));
    const imageUrl = page.imageUrl || '';
    template = template.replace(/{{IMAGE_URL}}/g, escapeHtml(imageUrl));
    const videoUrl = page.videoUrl || '';
    template = template.replace(/{{VIDEO_URL}}/g, escapeHtml(videoUrl));
    template = template.replace(/{{HAS_PIN}}/g, String(page.hasPin || false));
    template = template.replace(/{{PIN}}/g, escapeHtml(page.pin || ''));
    template = template.replace(/{{USE_IMAGE_AS_WALLPAPER}}/g, String(page.useImageAsWallpaper || false));
    
    // Agregar campos personalizados para JavaScript
    template = template.replace(/{{JS_TITLE}}/g, escapeHtml(page.title || ''));
    template = template.replace(/{{JS_DESCRIPTION}}/g, escapeHtml(page.description || ''));
    template = template.replace(/{{JS_WRITTEN_MESSAGE}}/g, escapeHtml(page.writtenMessage || ''));
    template = template.replace(/{{JS_SENDER_NAME}}/g, escapeHtml(page.senderName || ''));
    template = template.replace(/{{JS_RECIPIENT_NAME}}/g, escapeHtml(page.recipientName || ''));
    
    return template;
  } catch (error) {
    throw new Error(`Error al renderizar template: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Renderiza el template de animación de tarjeta
 */
export async function renderCardAnimation(page: AudioPage): Promise<string> {
  try {
    const templatePath = path.join(__dirname, '..', 'templates', 'card_animation.hmtl');
    let template = await fs.readFile(templatePath, 'utf-8');
    
    // Reemplazar placeholders
    template = template.replace(/{{CARD_MESSAGE}}/g, escapeHtml(page.writtenMessage || page.description || '¡Feliz Día!'));
    template = template.replace(/{{CARD_IMAGE_URL}}/g, escapeHtml(page.imageUrl || ''));
    template = template.replace(/{{SENDER_NAME}}/g, escapeHtml(page.senderName || ''));
    template = template.replace(/{{RECIPIENT_NAME}}/g, escapeHtml(page.recipientName || ''));
    
    return template;
  } catch (error) {
    throw new Error(`Error al renderizar template de animación: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Escapa caracteres HTML para prevenir XSS
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
