/**
 * Servicio para buscar imágenes en Unsplash
 */

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY || '';
const UNSPLASH_API_URL = 'https://api.unsplash.com';

export interface UnsplashImage {
  id: string;
  urls: {
    thumb: string;
    small: string;
    regular: string;
    full: string;
  };
  alt_description: string;
  description: string;
  user: {
    name: string;
    username: string;
  };
  width: number;
  height: number;
}

export interface UnsplashSearchResponse {
  results: UnsplashImage[];
  total: number;
  total_pages: number;
}

/**
 * Busca imágenes en Unsplash
 * @param query Término de búsqueda
 * @param page Página (default: 1)
 * @param perPage Resultados por página (default: 20, máximo 30)
 * @returns Resultados de la búsqueda
 */
export async function searchUnsplashImages(
  query: string,
  page: number = 1,
  perPage: number = 20
): Promise<UnsplashSearchResponse> {
  if (!UNSPLASH_ACCESS_KEY) {
    throw new Error('UNSPLASH_ACCESS_KEY no está configurada en las variables de entorno');
  }

  if (perPage > 30) {
    perPage = 30;
  }

  try {
    const url = new URL(`${UNSPLASH_API_URL}/search/photos`);
    url.searchParams.set('query', query);
    url.searchParams.set('page', String(page));
    url.searchParams.set('per_page', String(perPage));
    url.searchParams.set('orientation', 'landscape'); // Preferir imágenes horizontales

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error en Unsplash API: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return {
      results: data.results || [],
      total: data.total || 0,
      total_pages: data.total_pages || 0,
    };
  } catch (error) {
    throw new Error(`Error al buscar imágenes en Unsplash: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Obtiene una imagen específica de Unsplash por ID
 * @param imageId ID de la imagen
 * @returns Datos de la imagen
 */
export async function getUnsplashImage(imageId: string): Promise<UnsplashImage> {
  if (!UNSPLASH_ACCESS_KEY) {
    throw new Error('UNSPLASH_ACCESS_KEY no está configurada en las variables de entorno');
  }

  try {
    const response = await fetch(`${UNSPLASH_API_URL}/photos/${imageId}`, {
      headers: {
        'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error en Unsplash API: ${response.status} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    throw new Error(`Error al obtener imagen de Unsplash: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
