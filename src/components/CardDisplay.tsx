import { useEffect, useState, useRef } from 'react';
import { Heart, Play, Pause, Volume2, Loader2 } from 'lucide-react';
import { supabase, Card } from '../lib/supabase';

interface CardDisplayProps {
  code: string;
}

export function CardDisplay({ code }: CardDisplayProps) {
  const [card, setCard] = useState<Card | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    loadCard();
  }, [code]);

  const loadCard = async () => {
    try {
      const { data, error } = await supabase
        .from('cards')
        .select('*')
        .eq('code', code.toUpperCase())
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        setError('Tarjeta no encontrada');
      } else {
        setCard(data);
      }
    } catch (err) {
      console.error('Error loading card:', err);
      setError('Error al cargar la tarjeta');
    } finally {
      setLoading(false);
    }
  };

  const togglePlayback = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  if (loading) {
    return (
      <div
        className="min-h-screen bg-cover bg-center bg-fixed flex items-center justify-center"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)',
        }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-red-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-100">Cargando tarjeta...</p>
        </div>
        </div>
      </div>
    );
  }

  if (error || !card) {
    return (
      <div
        className="min-h-screen bg-cover bg-center bg-fixed flex items-center justify-center p-4"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)',
        }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md text-center">
          <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Tarjeta no encontrada
          </h2>
          <p className="text-gray-600">
            El código de tarjeta ingresado no existe o es incorrecto.
          </p>
        </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed flex items-center justify-center p-4"
      style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)',
      }}
    >
      <div className="absolute inset-0 bg-black/40"></div>
      <div className="relative">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="relative bg-gradient-to-r from-red-500 to-pink-500 p-8 md:p-12">
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
              <div className="absolute top-4 left-4">
                <Heart className="w-12 h-12 fill-white" />
              </div>
              <div className="absolute top-8 right-8">
                <Heart className="w-8 h-8 fill-white" />
              </div>
              <div className="absolute bottom-8 left-12">
                <Heart className="w-6 h-6 fill-white" />
              </div>
              <div className="absolute bottom-4 right-12">
                <Heart className="w-10 h-10 fill-white" />
              </div>
            </div>

            <div className="relative z-10 text-center text-white">
              <Heart className="w-16 h-16 fill-white mx-auto mb-4 animate-pulse" />
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Para {card.recipient_name}
              </h1>
              <p className="text-lg opacity-90">
                De: {card.sender_name}
              </p>
            </div>
          </div>

          <div className="p-8 md:p-12 space-y-8">
            <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-6 md:p-8">
              <p className="text-gray-800 text-lg leading-relaxed whitespace-pre-wrap">
                {card.message}
              </p>
            </div>

            {card.audio_url && (
              <div className="bg-gray-50 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-red-100 p-2 rounded-full">
                      <Volume2 className="w-5 h-5 text-red-600" />
                    </div>
                    <span className="font-medium text-gray-800">
                      Mensaje de voz
                    </span>
                  </div>
                </div>

                <button
                  onClick={togglePlayback}
                  className="w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold py-4 px-6 rounded-full transition-all transform hover:scale-105 shadow-lg"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-6 h-6" />
                      <span>Pausar</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-6 h-6" />
                      <span>Escuchar Mensaje</span>
                    </>
                  )}
                </button>

                <audio
                  ref={audioRef}
                  src={card.audio_url}
                  onEnded={() => setIsPlaying(false)}
                  className="hidden"
                />
              </div>
            )}

            <div className="text-center pt-4">
              <p className="text-sm text-gray-500">
                Esta tarjeta fue creada con amor especialmente para ti
              </p>
              <div className="flex justify-center mt-4 space-x-1">
                <Heart className="w-4 h-4 text-red-400 fill-red-400" />
                <Heart className="w-4 h-4 text-red-400 fill-red-400" />
                <Heart className="w-4 h-4 text-red-400 fill-red-400" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
