/**
 * Servicio para generar imágenes usando Nano Banana (Gemini Image Generation API)
 */

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent';

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

  try {
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt }
          ]
        }],
        generationConfig: {
          responseModalities: ['IMAGE'],
          imageConfig: {
            aspectRatio: '4:3',
          }
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error en Gemini API: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    // Extraer la imagen de la respuesta
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const parts = data.candidates[0].content.parts;
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
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido al generar imagen',
    };
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
