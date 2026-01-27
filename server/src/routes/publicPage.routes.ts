import { Router } from 'express';
import { getPageByCode, getOrCreateDemoPage } from '../services/pageService.js';
import { renderAudioPage } from '../services/templateService.js';
import { AppError } from '../middleware/errorHandler.js';
import { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Sirve la página HTML de tarjeta eliminada
 */
async function renderDeletedPage(): Promise<string> {
  try {
    const templatePath = path.join(__dirname, '../templates/deletedPage.html');
    const html = await fs.readFile(templatePath, 'utf-8');
    return html;
  } catch (error) {
    // Si no se puede cargar el template, devolver HTML básico
    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Tarjeta Eliminada</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #fce4ec 0%, #ffe0e6 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            margin: 0;
          }
          .container {
            background: white;
            border-radius: 20px;
            padding: 40px;
            max-width: 500px;
            text-align: center;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
          }
          .icon { font-size: 64px; margin-bottom: 20px; }
          h1 { color: #333; font-size: 28px; margin-bottom: 15px; }
          p { color: #666; font-size: 16px; line-height: 1.6; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="icon">🗑️</div>
          <h1>Tarjeta Eliminada</h1>
          <p>Esta tarjeta ha sido eliminada y ya no está disponible.</p>
          <p style="margin-top: 20px;">
            <a href="/" style="color: #ef4444; text-decoration: none;">Volver al Inicio</a>
          </p>
        </div>
      </body>
      </html>
    `;
  }
}

/**
 * GET /page/:code
 * Sirve la página HTML única para el código
 */
router.get('/:code', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code } = req.params;
    
    // Si es la página demo, siempre crear una nueva (elimina la anterior)
    let page;
    if (code === 'DEMO1234') {
      // Siempre crear una nueva demo, eliminando la anterior
      page = await getOrCreateDemoPage();
    } else {
      page = await getPageByCode(code);
    }

    if (!page) {
      // En lugar de lanzar error, servir página de tarjeta eliminada
      const deletedHtml = await renderDeletedPage();
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(404).send(deletedHtml);
    }

    // Verificar si la página está expirada o destruida
    const expirationDate = page.expirationDate ? new Date(page.expirationDate) : null;
    const isExpired = expirationDate && new Date() > expirationDate;
    const playCount = page.playCount || 0;
    const maxPlays = page.maxPlays || 5;
    const isDestroyed = playCount >= maxPlays;

    if (isExpired || isDestroyed) {
      // Mostrar página de destrucción
      const destroyedHtml = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Tarjeta Destruida</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: linear-gradient(135deg, #ef4444 0%, #ec4899 100%);
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 20px;
            }
            .container {
              background: white;
              border-radius: 20px;
              box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
              padding: 60px 40px;
              max-width: 500px;
              width: 100%;
              text-align: center;
            }
            .icon { font-size: 64px; margin-bottom: 20px; }
            h1 { color: #333; font-size: 32px; margin-bottom: 15px; }
            p { color: #666; font-size: 18px; line-height: 1.6; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">🔒</div>
            <h1>Tarjeta Autodestruida</h1>
            <p style="margin-bottom: 15px;">
              ${isExpired 
                ? 'Esta tarjeta expiró el 14 de febrero de 2026 a las 12:00 AM y ha sido eliminada.'
                : 'Esta tarjeta ha alcanzado su límite de reproducciones y ha sido eliminada automáticamente.'}
            </p>
            <p style="color: #999; font-size: 14px; margin-top: 20px;">
              Las tarjetas se autodestruyen después de 5 reproducciones o el 14/02/2026 12:00 AM
            </p>
          </div>
        </body>
        </html>
      `;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.send(destroyedHtml);
    }

    const html = await renderAudioPage(page);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (error) {
    next(error);
  }
});

export { router as publicPageRouter };
