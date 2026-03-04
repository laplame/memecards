/**
 * Servicio para generar imágenes usando Nano Banana (Gemini Image Generation API)
 */

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent';

const QUOTA_EXCEEDED_MESSAGE = 'Cuota de Gemini agotada. Prueba en unos minutos o revisa tu plan y facturación en https://ai.google.dev';

/**
 * Parsea la respuesta de error de Gemini y devuelve un mensaje corto para el usuario.
 */
function parseGeminiError(status: number, body: string): string {
  if (status === 429) {
    try {
      const json = JSON.parse(body) as { error?: { message?: string } };
      if (json?.error?.message?.toLowerCase().includes('quota')) {
        return QUOTA_EXCEEDED_MESSAGE;
      }
    } catch {
      // ignore
    }
    return QUOTA_EXCEEDED_MESSAGE;
  }
  try {
    const json = JSON.parse(body) as { error?: { message?: string } };
    return json?.error?.message || `Error en Gemini (${status})`;
  } catch {
    return `Error en Gemini API (${status})`;
  }
}

/**
 * Obtiene la API key de Gemini (lazy loading para asegurar que .env esté cargado)
 */
function getGeminiApiKey(): string | undefined {
  // Intentar múltiples variantes del nombre de la variable
  return process.env.nano_banana || 
         process.env.NANO_BANANA || 
         process.env['nano_banana'] ||
         process.env['NANO_BANANA'];
}

export interface NanoBananaImageResponse {
  success: boolean;
  imageUrl?: string;
  usage?: {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
    totalTokenCount?: number;
  };
  error?: string;
}

/**
 * Remix de una imagen con IA usando Nano Banana (Gemini Image Generation)
 * @param imageBuffer Buffer de la imagen original
 * @param userText Texto del usuario (ej: "llevanos a paris", "tu yo viendo una aurora boreal")
 * @param festivity Tipo de festividad (ej: 'mothers-day', 'fathers-day', 'birthday')
 * @returns URL de la imagen remixada o error
 */
export async function remixImageWithNanoBanana(
  imageBuffer: Buffer,
  userText: string,
  festivity?: string
): Promise<NanoBananaImageResponse> {
  const GEMINI_API_KEY = getGeminiApiKey();
  
  if (!GEMINI_API_KEY) {
    throw new Error('nano_banana API key no está configurada en las variables de entorno');
  }

  // Convertir imagen a base64
  const imageBase64 = imageBuffer.toString('base64');
  
  // Determinar el tipo MIME (asumimos JPEG por defecto, pero podríamos detectarlo)
  const mimeType = 'image/jpeg';

  // Construir el prompt contextual basado en la festividad
  const festivityContext: Record<string, string> = {
    'mothers-day': 'Día de la Madre, celebración familiar, amor maternal',
    'fathers-day': 'Día del Padre, celebración familiar, amor paternal',
    'birthday': 'Cumpleaños, celebración, fiesta, alegría',
    'valentine': 'San Valentín, amor romántico, pareja',
    'friendship': 'Amistad, celebración entre amigos',
    'teachers-day': 'Día del Maestro, educación, agradecimiento',
    'grandparents-day': 'Día del Abuelo, familia, sabiduría',
    'christmas': 'Navidad, celebración navideña, familia',
  };

  const context = festivity ? festivityContext[festivity] || '' : '';
  
  // Construir el prompt final combinando contexto, texto del usuario y la imagen
  const prompt = context 
    ? `${context}. ${userText}. Remix esta imagen manteniendo el estilo y composición pero incorporando los elementos mencionados.`
    : `${userText}. Remix esta imagen manteniendo el estilo y composición pero incorporando los elementos mencionados.`;

  const requestBody = {
    contents: [{
      parts: [
        { inlineData: { data: imageBase64, mimeType } },
        { text: prompt },
      ],
    }],
    generationConfig: {
      responseModalities: ['IMAGE'],
      imageConfig: { aspectRatio: '4:3' },
    },
  };

  const doFetch = () =>
    fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY,
      },
      body: JSON.stringify(requestBody),
    });

  try {
    let response = await doFetch();

    if (!response.ok) {
      const errorText = await response.text();
      if (response.status === 429) {
        console.warn('Gemini 429 (cuota) en remix. Reintentando en 8s...');
        await new Promise((r) => setTimeout(r, 8000));
        response = await doFetch();
        if (!response.ok) {
          const retryText = await response.text();
          return {
            success: false,
            error: parseGeminiError(response.status, retryText),
          };
        }
      } else {
        return {
          success: false,
          error: parseGeminiError(response.status, errorText),
        };
      }
    }

    interface GeminiCandidate {
      content?: { parts?: Array<{ inlineData?: { data?: string; mimeType?: string } }> };
    }
    interface GeminiUsage {
      promptTokenCount?: number;
      candidatesTokenCount?: number;
      totalTokenCount?: number;
    }
    interface GeminiResponse {
      candidates?: GeminiCandidate[];
      usageMetadata?: GeminiUsage;
    }
    const data = (await response.json()) as GeminiResponse;

    // Extraer la imagen de la respuesta
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const parts = data.candidates[0].content.parts ?? [];
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          const imageData = part.inlineData.data;
          const mimeType = part.inlineData.mimeType || 'image/png';
          const imageUrl = `data:${mimeType};base64,${imageData}`;

          const usage = data.usageMetadata
            ? {
                promptTokenCount: data.usageMetadata.promptTokenCount,
                candidatesTokenCount: data.usageMetadata.candidatesTokenCount,
                totalTokenCount: data.usageMetadata.totalTokenCount,
              }
            : undefined;
          
          return {
            success: true,
            imageUrl,
            usage,
          };
        }
      }
    }

    throw new Error('No se encontró imagen en la respuesta de Gemini API');
  } catch (error) {
    console.error('Error haciendo remix de imagen con Nano Banana:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido al hacer remix de imagen',
    };
  }
}

/**
 * Genera una imagen usando Nano Banana (Gemini Image Generation)
 * @param prompt Descripción de la imagen a generar
 * @returns URL de la imagen generada o error
 */
export async function generateImageWithNanoBanana(
  prompt: string
): Promise<NanoBananaImageResponse> {
  // Leer la API key de forma lazy (cuando se llama la función)
  const GEMINI_API_KEY = getGeminiApiKey();
  
  if (!GEMINI_API_KEY) {
    // Debug: mostrar qué variables están disponibles
    const nanoVars = Object.keys(process.env).filter(key => 
      key.toLowerCase().includes('nano') || key.toLowerCase().includes('banana')
    );
    console.error('❌ nano_banana API key no encontrada en variables de entorno');
    console.error('Variables disponibles que contienen "nano" o "banana":', nanoVars);
    console.error('Todas las variables de entorno:', Object.keys(process.env).slice(0, 20));
    throw new Error('nano_banana API key no está configurada en las variables de entorno');
  }

  const requestBody = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      responseModalities: ['IMAGE'],
      imageConfig: { aspectRatio: '4:3' },
    },
  };

  const doFetch = () =>
    fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY,
      },
      body: JSON.stringify(requestBody),
    });

  try {
    let response = await doFetch();

    if (!response.ok) {
      const errorText = await response.text();
      if (response.status === 429) {
        console.warn('Gemini 429 (cuota). Reintentando en 8s...');
        await new Promise((r) => setTimeout(r, 8000));
        response = await doFetch();
        if (!response.ok) {
          const retryText = await response.text();
          return {
            success: false,
            error: parseGeminiError(response.status, retryText),
          };
        }
      } else {
        return {
          success: false,
          error: parseGeminiError(response.status, errorText),
        };
      }
    }

    interface GeminiCandidate {
      content?: { parts?: Array<{ inlineData?: { data?: string; mimeType?: string } }> };
    }
    interface GeminiUsage {
      promptTokenCount?: number;
      candidatesTokenCount?: number;
      totalTokenCount?: number;
    }
    interface GeminiResponse {
      candidates?: GeminiCandidate[];
      usageMetadata?: GeminiUsage;
    }
    const data = (await response.json()) as GeminiResponse;

    // Extraer la imagen de la respuesta
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const parts = data.candidates[0].content.parts ?? [];
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          // Convertir base64 a buffer y devolver como data URL
          const imageData = part.inlineData.data;
          const mimeType = part.inlineData.mimeType || 'image/png';
          const imageUrl = `data:${mimeType};base64,${imageData}`;

          const usage = data.usageMetadata
            ? {
                promptTokenCount: data.usageMetadata.promptTokenCount,
                candidatesTokenCount: data.usageMetadata.candidatesTokenCount,
                totalTokenCount: data.usageMetadata.totalTokenCount,
              }
            : undefined;
          
          return {
            success: true,
            imageUrl,
            usage,
          };
        }
      }
    }

    throw new Error('No se encontró imagen en la respuesta de Gemini API');
  } catch (error) {
    console.error('Error generando imagen con Nano Banana:', error);
    const msg = error instanceof Error ? error.message : 'Error desconocido al generar imagen';
    return { success: false, error: msg };
  }
}

/**
 * Lista de 14 ideas predefinidas para generar imágenes
 * Ahora soporta múltiples ocasiones (San Valentín, Día de la Madre, Día del Padre, Cumpleaños, etc.)
 * Nota: mantenemos prompts cortos (4 palabras) para consistencia y control.
 */
export const NANO_BANANA_IDEAS = [
  {
    id: 1,
    title: 'Corazones románticos',
    prompt: 'San Valentín corazones rojos',
    category: '14 de febrero',
    occasion: 'valentine',
  },
  {
    id: 2,
    title: 'Rosa roja clásica',
    prompt: 'San Valentín rosa roja',
    category: '14 de febrero',
    occasion: 'valentine',
  },
  {
    id: 3,
    title: 'Cupido y flechas',
    prompt: 'San Valentín cupido amor',
    category: '14 de febrero',
    occasion: 'valentine',
  },
  {
    id: 4,
    title: 'Chocolates y flores',
    prompt: 'San Valentín chocolates flores',
    category: '14 de febrero',
    occasion: 'valentine',
  },
  {
    id: 5,
    title: 'Amigos abrazándose',
    prompt: 'San Valentín amigos abrazo',
    category: 'Amor y amistad',
    occasion: 'valentine',
  },
  {
    id: 6,
    title: 'Manos entrelazadas',
    prompt: 'San Valentín manos juntas',
    category: 'Amor y amistad',
    occasion: 'valentine',
  },
  {
    id: 7,
    title: 'Corazones de amistad',
    prompt: 'San Valentín amistad corazones',
    category: 'Amor y amistad',
    occasion: 'valentine',
  },
  {
    id: 8,
    title: 'Regalo de amistad',
    prompt: 'San Valentín regalo amistad',
    category: 'Amor y amistad',
    occasion: 'valentine',
  },
  // Amistad (tema amistad, no solo 14 de febrero)
  {
    id: 23,
    title: 'Amigos abrazándose',
    prompt: 'Amistad amigos abrazo feliz',
    category: 'Amistad',
    occasion: 'friendship',
  },
  {
    id: 24,
    title: 'Manos de amigos',
    prompt: 'Amistad manos juntas unión',
    category: 'Amistad',
    occasion: 'friendship',
  },
  {
    id: 25,
    title: 'Corazones de amistad',
    prompt: 'Amistad corazones amigos',
    category: 'Amistad',
    occasion: 'friendship',
  },
  {
    id: 26,
    title: 'Regalo para un amigo',
    prompt: 'Amistad regalo sorpresa amigo',
    category: 'Amistad',
    occasion: 'friendship',
  },
  {
    id: 27,
    title: 'Celebración entre amigos',
    prompt: 'Amistad fiesta amigos alegría',
    category: 'Amistad',
    occasion: 'friendship',
  },
  {
    id: 28,
    title: 'Café con amigos',
    prompt: 'Amistad café charla amigos',
    category: 'Amistad',
    occasion: 'friendship',
  },
  {
    id: 9,
    title: 'Pastel de cumpleaños',
    prompt: 'Cumpleaños pastel velas',
    category: 'Cumpleaños',
    occasion: 'birthday',
  },
  {
    id: 10,
    title: 'Globos de cumpleaños',
    prompt: 'Cumpleaños globos coloridos fiesta',
    category: 'Cumpleaños',
    occasion: 'birthday',
  },
  {
    id: 11,
    title: 'Confeti y celebración',
    prompt: 'Cumpleaños confeti alegría brillante',
    category: 'Cumpleaños',
    occasion: 'birthday',
  },
  {
    id: 12,
    title: 'Regalo de cumpleaños',
    prompt: 'Cumpleaños regalo sorpresa moño',
    category: 'Cumpleaños',
    occasion: 'birthday',
  },
  {
    id: 13,
    title: 'Velas de cumpleaños',
    prompt: 'Cumpleaños velas pastel dorado',
    category: 'Cumpleaños',
    occasion: 'birthday',
  },
  {
    id: 14,
    title: 'Fiesta de cumpleaños',
    prompt: 'Cumpleaños fiesta luces música',
    category: 'Cumpleaños',
    occasion: 'birthday',
  },
  // Día de la Madre
  {
    id: 15,
    title: 'Flores para mamá',
    prompt: 'Día Madre flores rosas',
    category: 'Día de la madre',
    occasion: 'mothers-day',
  },
  {
    id: 16,
    title: 'Abrazo con mamá',
    prompt: 'Mamá abrazo tierno amor',
    category: 'Día de la madre',
    occasion: 'mothers-day',
  },
  {
    id: 17,
    title: 'Carta para mamá',
    prompt: 'Mamá carta corazón gracias',
    category: 'Día de la madre',
    occasion: 'mothers-day',
  },
  {
    id: 18,
    title: 'Desayuno sorpresa',
    prompt: 'Mamá desayuno sorpresa feliz',
    category: 'Día de la madre',
    occasion: 'mothers-day',
  },
  // Día del Padre
  {
    id: 19,
    title: 'Herramientas para papá',
    prompt: 'Día Padre herramientas regalo',
    category: 'Día del padre',
    occasion: 'fathers-day',
  },
  {
    id: 20,
    title: 'Papá y familia',
    prompt: 'Papá familia abrazo orgullo',
    category: 'Día del padre',
    occasion: 'fathers-day',
  },
  {
    id: 21,
    title: 'Tarjeta para papá',
    prompt: 'Papá gracias corazón fuerte',
    category: 'Día del padre',
    occasion: 'fathers-day',
  },
  {
    id: 22,
    title: 'Café con papá',
    prompt: 'Papá café charla feliz',
    category: 'Día del padre',
    occasion: 'fathers-day',
  },
];
