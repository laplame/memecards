import { Router } from 'express';
import { getPageByCode } from '../services/pageService.js';
import { renderAudioPage } from '../services/templateService.js';
import { AppError } from '../middleware/errorHandler.js';
import { Request, Response, NextFunction } from 'express';

const router = Router();

/**
 * GET /page/:code
 * Sirve la página HTML única para el código
 */
router.get('/:code', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code } = req.params;
    const page = await getPageByCode(code);

    if (!page) {
      throw new AppError('Página no encontrada', 404);
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
