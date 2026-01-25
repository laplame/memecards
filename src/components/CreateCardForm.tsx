import { useState, useRef, useEffect } from 'react';
import { Heart, Mic, Square, Play, Pause, ArrowLeft, Loader2, Volume2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { generateCardCode } from '../utils/cardCode';

interface CreateCardFormProps {
  onBack: () => void;
  onSuccess: (code: string) => void;
}

export function CreateCardForm({ onBack, onSuccess }: CreateCardFormProps) {
  const [senderName, setSenderName] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Actualizar tiempo de reproducción
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      setCurrentTime(audio.currentTime);
      setDuration(audio.duration || 0);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration || 0);
    });

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', () => {});
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error: any) {
      console.error('Error accessing microphone:', error);
      let errorMessage = 'No se pudo acceder al micrófono.';
      
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDismissedError') {
        errorMessage = 'Permiso de micrófono denegado. Por favor, permite el acceso al micrófono en la configuración de tu navegador y recarga la página.';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No se encontró ningún micrófono. Por favor, conecta un micrófono e intenta de nuevo.';
      } else if (error.name === 'NotReadableError') {
        errorMessage = 'El micrófono está siendo usado por otra aplicación. Por favor, cierra otras aplicaciones que puedan estar usando el micrófono.';
      }
      
      alert(errorMessage);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const formatTime = (seconds: number): string => {
    if (!isFinite(seconds) || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePlayback = () => {
    if (!audioRef.current || !audioUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch((error) => {
        console.error('Error al reproducir audio:', error);
        setIsPlaying(false);
      });
      setIsPlaying(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!senderName || !recipientName || !message) {
      alert('Por favor completa todos los campos');
      return;
    }

    if (!audioBlob) {
      alert('Por favor graba un mensaje de voz');
      return;
    }

    setIsSubmitting(true);

    try {
      const code = generateCardCode();
      const fileName = `${code}-${Date.now()}.webm`;

      // Intentar subir a Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('card-audios')
        .upload(fileName, audioBlob);

      if (uploadError) {
        // Si el bucket no existe, intentar usar el backend local
        if (uploadError.message?.includes('Bucket not found') || uploadError.message?.includes('not found')) {
          console.warn('Supabase bucket no encontrado, usando backend local...');
          
          // Usar el backend que creamos
          const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
          const formData = new FormData();
          formData.append('audio', audioBlob, fileName);
          formData.append('title', `Tarjeta de ${senderName} para ${recipientName}`);
          formData.append('description', message);

          const backendResponse = await fetch(`${backendUrl}/api/pages/create`, {
            method: 'POST',
            body: formData,
          });

          if (!backendResponse.ok) {
            const backendError = await backendResponse.json();
            throw new Error(backendError.error?.message || 'Error al subir audio al backend');
          }

          const backendData = await backendResponse.json();
          const audioUrl = backendData.data?.page?.audioUrl || backendData.data?.audio?.processedUrl;

          // Insertar en Supabase con la URL del backend
          const { error: insertError } = await supabase
            .from('cards')
            .insert({
              code,
              sender_name: senderName,
              recipient_name: recipientName,
              message,
              audio_url: audioUrl,
              theme: 'valentine',
            });

          if (insertError) throw insertError;

          onSuccess(code);
          return;
        }
        throw uploadError;
      }

      const { data: urlData } = supabase.storage
        .from('card-audios')
        .getPublicUrl(fileName);

      const { error: insertError } = await supabase
        .from('cards')
        .insert({
          code,
          sender_name: senderName,
          recipient_name: recipientName,
          message,
          audio_url: urlData.publicUrl,
          theme: 'valentine',
        });

      if (insertError) throw insertError;

      onSuccess(code);
    } catch (error: any) {
      console.error('Error creating card:', error);
      let errorMessage = 'Hubo un error al crear la tarjeta. Por favor intenta de nuevo.';
      
      if (error.message?.includes('Bucket not found')) {
        errorMessage = 'El bucket de almacenamiento no está configurado. Por favor, crea el bucket "card-audios" en Supabase o configura el backend local.';
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }
      
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed py-8"
      style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)',
      }}
    >
      <div className="absolute inset-0 bg-black/40"></div>
      <div className="relative">
      <div className="container mx-auto px-4 max-w-2xl">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-6 transition-colors drop-shadow-md"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Volver
        </button>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-red-500 to-pink-500 p-6 text-white">
            <div className="flex items-center justify-center mb-2">
              <Heart className="w-8 h-8 fill-white" />
            </div>
            <h2 className="text-3xl font-bold text-center">Crea tu Tarjeta</h2>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tu nombre
              </label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="¿Quién envía esta tarjeta?"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Para
              </label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="¿A quién va dirigida?"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mensaje escrito
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                placeholder="Escribe tu mensaje de amor..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mensaje de voz
              </label>
              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                {!audioBlob ? (
                  <button
                    type="button"
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`w-full flex items-center justify-center space-x-3 py-4 px-6 rounded-lg font-medium transition-all ${
                      isRecording
                        ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
                        : 'bg-red-500 hover:bg-red-600 text-white'
                    }`}
                  >
                    {isRecording ? (
                      <>
                        <Square className="w-5 h-5" />
                        <span>Detener Grabación</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-5 h-5" />
                        <span>Grabar Mensaje</span>
                      </>
                    )}
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Audio grabado ✓</span>
                      <button
                        type="button"
                        onClick={() => {
                          setAudioBlob(null);
                          setAudioUrl(null);
                          setIsPlaying(false);
                          setCurrentTime(0);
                          setDuration(0);
                          if (audioRef.current) {
                            audioRef.current.pause();
                            audioRef.current.currentTime = 0;
                          }
                        }}
                        className="text-sm text-red-600 hover:text-red-700 font-medium"
                      >
                        Grabar de nuevo
                      </button>
                    </div>

                    {/* Reproductor de Audio Mejorado */}
                    <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-lg p-5 border-2 border-red-300">
                      <div className="flex items-center space-x-2 mb-4">
                        <Volume2 className="w-5 h-5 text-red-600" />
                        <h3 className="text-lg font-bold text-gray-800">Escucha tu grabación</h3>
                      </div>

                      <div className="bg-white rounded-lg p-4 shadow-md">
                        {/* Controles principales */}
                        <div className="flex items-center space-x-4 mb-4">
                          <button
                            type="button"
                            onClick={togglePlayback}
                            className="flex-shrink-0 w-14 h-14 rounded-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white flex items-center justify-center transition-all shadow-lg transform hover:scale-105"
                          >
                            {isPlaying ? (
                              <Pause className="w-7 h-7" />
                            ) : (
                              <Play className="w-7 h-7 ml-1" />
                            )}
                          </button>
                          
                          <div className="flex-1">
                            {/* Barra de progreso */}
                            <div className="w-full bg-gray-200 rounded-full h-3 mb-2 cursor-pointer"
                              onClick={(e) => {
                                if (audioRef.current && duration) {
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  const clickX = e.clientX - rect.left;
                                  const percentage = clickX / rect.width;
                                  audioRef.current.currentTime = percentage * duration;
                                }
                              }}
                            >
                              <div 
                                className="bg-gradient-to-r from-red-500 to-pink-500 h-3 rounded-full transition-all duration-100 relative"
                                style={{ 
                                  width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' 
                                }}
                              >
                                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2 w-4 h-4 bg-white rounded-full border-2 border-red-500 shadow-md"></div>
                              </div>
                            </div>
                            
                            {/* Tiempo */}
                            <div className="flex justify-between text-xs text-gray-600">
                              <span>{formatTime(currentTime)}</span>
                              <span>{formatTime(duration)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Estado */}
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-700">
                            {isPlaying ? (
                              <span className="text-red-600">▶ Reproduciendo...</span>
                            ) : currentTime > 0 ? (
                              <span className="text-gray-600">⏸ Pausado</span>
                            ) : (
                              <span className="text-gray-500">Listo para reproducir</span>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Audio element oculto */}
                      {audioUrl && (
                        <audio
                          ref={audioRef}
                          src={audioUrl}
                          onEnded={() => {
                            setIsPlaying(false);
                            setCurrentTime(0);
                            if (audioRef.current) {
                              audioRef.current.currentTime = 0;
                            }
                          }}
                          onPlay={() => setIsPlaying(true)}
                          onPause={() => setIsPlaying(false)}
                          className="hidden"
                        />
                      )}
                    </div>

                    <div className="text-xs text-gray-500 text-center">
                      Escucha tu grabación antes de crear la tarjeta
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold py-4 px-8 rounded-full text-lg hover:from-red-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creando tarjeta...
                </>
              ) : (
                'Crear Tarjeta'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
    </div>
  );
}
