import { Router } from 'express';
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();

/**
 * GET /api/gifs/search
 * Busca GIFs usando Giphy (no requiere autenticación para desarrollo)
 * Alternativa a Tenor que es más fácil de usar
 */
router.get('/search', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { q = 'love', limit = 12, provider = 'giphy' } = req.query;

    if (provider === 'giphy') {
      // Giphy tiene una key pública para desarrollo
      // En producción, obtén tu propia key en https://developers.giphy.com/
      const apiKey = process.env.GIPHY_API_KEY || 'dc6zaTOxFJmzC'; // Key pública de desarrollo
      const url = `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${encodeURIComponent(q as string)}&limit=${limit}&rating=g&lang=es`;

      try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.data && Array.isArray(data.data)) {
          const gifs = data.data.map((gif: any) => ({
            id: gif.id,
            title: gif.title,
            url: gif.images.original.url,
            previewUrl: gif.images.fixed_height_small.url || gif.images.preview_gif.url,
            width: gif.images.original.width,
            height: gif.images.original.height,
            provider: 'giphy',
          }));

          res.json({
            success: true,
            data: gifs,
            count: gifs.length,
            provider: 'giphy',
          });
        } else {
          throw new Error('Formato de respuesta inválido de Giphy');
        }
      } catch (error: any) {
        console.error('Error con Giphy:', error);
        // Fallback a Tenor si Giphy falla
        return searchTenor(q as string, parseInt(limit as string), res, next);
      }
    } else {
      // Usar Tenor como alternativa
      return searchTenor(q as string, parseInt(limit as string), res, next);
    }
  } catch (error) {
    next(error);
  }
});

/**
 * Función helper para buscar en Tenor
 */
async function searchTenor(
  query: string,
  limit: number,
  res: Response,
  next: NextFunction
) {
  try {
    const apiKey = process.env.TENOR_API_KEY || 'AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYg';
    const url = `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(query)}&key=${apiKey}&client_key=my_test_app&limit=${limit}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.results && Array.isArray(data.results)) {
      const gifs = data.results.map((gif: any) => ({
        id: gif.id,
        title: gif.content_description || '',
        url: gif.media_formats.gif.url,
        previewUrl: gif.media_formats.nanogif.url || gif.media_formats.tinygif.url,
        width: gif.media_formats.gif.dims?.[0] || 0,
        height: gif.media_formats.gif.dims?.[1] || 0,
        provider: 'tenor',
      }));

      res.json({
        success: true,
        data: gifs,
        count: gifs.length,
        provider: 'tenor',
      });
    } else {
      throw new AppError('No se encontraron GIFs', 404);
    }
  } catch (error: any) {
    console.error('Error con Tenor:', error);
    next(new AppError('Error al buscar GIFs. Intenta de nuevo más tarde.', 500));
  }
}

export { router as gifRouter };
