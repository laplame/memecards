import { useState, useRef, useEffect } from 'react';
import { Heart, Mic, Square, Play, Pause, ArrowLeft, Loader2, Volume2, Image, X, Shield, AlertCircle } from 'lucide-react';
import { CardSendingAnimation } from './CardSendingAnimation';

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
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showTermsModal, setShowTermsModal] = useState(true);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isAdult, setIsAdult] = useState(false);
  const [showSendingAnimation, setShowSendingAnimation] = useState(false);
  const [cardData, setCardData] = useState<{
    code: string;
    imageUrl?: string;
    audioUrl?: string;
  } | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona un archivo de imagen válido');
        return;
      }
      
      // Validar tamaño (10MB máximo)
      if (file.size > 10 * 1024 * 1024) {
        alert('La imagen no puede ser mayor a 10MB');
        return;
      }

      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const handleAcceptTerms = () => {
    if (!isAdult) {
      alert('Debes confirmar que eres mayor de edad para continuar');
      return;
    }
    setAcceptedTerms(true);
    setShowTermsModal(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!acceptedTerms || !isAdult) {
      setShowTermsModal(true);
      alert('Debes aceptar los términos y condiciones, la política anti-bullying y confirmar que eres mayor de edad para continuar');
      return;
    }

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
      const backendUrlEnv = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      const formData = new FormData();
      formData.append('audio', audioBlob, `audio-${Date.now()}.webm`);
      formData.append('title', `Tarjeta de ${senderName} para ${recipientName}`);
      formData.append('description', message);
      formData.append('senderName', senderName);
      formData.append('recipientName', recipientName);
      formData.append('writtenMessage', message);
      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      const backendResponse = await fetch(`${backendUrlEnv}/api/pages/create`, {
        method: 'POST',
        body: formData,
      });

      if (!backendResponse.ok) {
        const backendError = await backendResponse.json();
        throw new Error(backendError.error?.message || 'Error al crear la tarjeta');
      }

      const backendData = await backendResponse.json();
      
      if (!backendData.success || !backendData.data?.page?.code) {
        throw new Error('No se recibió un código de tarjeta válido del servidor');
      }

      const code = backendData.data.page.code;
      
      // Construir URLs completas
      let pageImageUrl: string | undefined = undefined;
      if (backendData.data.page.imageUrl) {
        pageImageUrl = backendData.data.page.imageUrl.startsWith('http')
          ? backendData.data.page.imageUrl
          : `${backendUrlEnv}${backendData.data.page.imageUrl}`;
      } else if (imagePreview) {
        pageImageUrl = imagePreview;
      }
      
      const pageAudioUrl = backendData.data.page.audioUrl || undefined;
      
      // Guardar datos y mostrar animación
      setCardData({
        code,
        imageUrl: pageImageUrl,
        audioUrl: pageAudioUrl,
      });
      setShowSendingAnimation(true);
    } catch (error: any) {
      console.error('Error creating card:', error);
      let errorMessage = 'Hubo un error al crear la tarjeta. Por favor intenta de nuevo.';
      
      if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }
      
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnimationComplete = () => {
    if (cardData) {
      onSuccess(cardData.code);
    }
  };

  // Mostrar animación de envío si está activa
  if (showSendingAnimation && cardData) {
    return (
      <CardSendingAnimation
        senderName={senderName}
        recipientName={recipientName}
        message={message}
        imageUrl={cardData.imageUrl}
        audioUrl={cardData.audioUrl}
        onAnimationComplete={handleAnimationComplete}
      />
    );
  }

  return (
    <>
      {/* Modal de Términos y Condiciones */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-red-500 to-pink-500 p-6 text-white">
              <div className="flex items-center space-x-3 mb-2">
                <Shield className="w-8 h-8" />
                <h2 className="text-2xl font-bold">Términos y Condiciones</h2>
              </div>
              <p className="text-sm opacity-90">Debes aceptar para continuar</p>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-red-900 mb-1">Política Anti-Bullying y Anti-Acoso</h3>
                    <p className="text-sm text-red-800">
                      Estamos comprometidos a crear un ambiente seguro y respetuoso. No toleramos ningún tipo de acoso, 
                      intimidación, discriminación o comportamiento dañino.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-sm text-gray-700">
                <div>
                  <h4 className="font-semibold mb-2">Al crear una tarjeta, te comprometes a:</h4>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>No usar contenido ofensivo, discriminatorio o que promueva el acoso</li>
                    <li>Respetar los derechos de propiedad intelectual</li>
                    <li>No compartir información personal de terceros sin consentimiento</li>
                    <li>No crear contenido falso o difamatorio</li>
                    <li>Mantener un ambiente seguro y respetuoso</li>
                  </ul>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Consecuencias:</strong> El contenido que viole esta política será eliminado inmediatamente 
                    y puede resultar en la prohibición permanente de tu cuenta.
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="font-semibold">Al hacer clic en "Aceptar", confirmas que:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-xs">
                    <li>Has leído y entendido los términos y condiciones</li>
                    <li>Has leído y entendido la política anti-bullying</li>
                    <li>Aceptas cumplir con todas las políticas</li>
                    <li>Entiendes las consecuencias de violar estas políticas</li>
                  </ul>
                </div>
              </div>

              <div className="flex space-x-3 pt-4 border-t">
                <a
                  href="/terminos"
                  onClick={(e) => {
                    e.preventDefault();
                    window.open('/terminos', '_blank');
                  }}
                  className="flex-1 text-center px-4 py-2 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Ver Términos Completos
                </a>
                <a
                  href="/antibullying"
                  onClick={(e) => {
                    e.preventDefault();
                    window.open('/antibullying', '_blank');
                  }}
                  className="flex-1 text-center px-4 py-2 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Ver Política Anti-Bullying
                </a>
              </div>

              <div className="pt-4 border-t">
                <label className="flex items-center space-x-3 cursor-pointer p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={isAdult}
                    onChange={(e) => setIsAdult(e.target.checked)}
                    className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500 focus:ring-2"
                  />
                  <span className="text-gray-700 font-medium">
                    Confirmo que soy mayor de edad (18 años o más)
                  </span>
                </label>
              </div>

              <button
                onClick={handleAcceptTerms}
                disabled={!isAdult}
                className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold py-4 px-8 rounded-lg text-lg hover:from-red-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                Acepto los Términos y la Política Anti-Bullying
              </button>
            </div>
          </div>
        </div>
      )}

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
                Foto (Opcional)
              </label>
              <div className="space-y-4">
                {!imagePreview ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-red-400 transition-colors">
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer flex flex-col items-center space-y-2"
                    >
                      <Image className="w-12 h-12 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Haz clic para seleccionar una imagen
                      </span>
                      <span className="text-xs text-gray-500">
                        JPG, PNG, GIF o WEBP (máx. 10MB)
                      </span>
                    </label>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
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
              disabled={isSubmitting || !acceptedTerms || !isAdult}
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

        {/* Footer con Términos y Condiciones */}
        <div className="mt-8 bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <div className="text-center space-y-4">
            <p className="text-xs text-gray-600 leading-relaxed">
              Al crear una tarjeta, aceptas nuestros{' '}
              <a href="/terminos" target="_blank" className="text-red-600 hover:text-red-700 underline font-medium">
                Términos y Condiciones
              </a>
              {' '}y nuestra{' '}
              <a href="/antibullying" target="_blank" className="text-red-600 hover:text-red-700 underline font-medium">
                Política Anti-Bullying
              </a>
            </p>
            <p className="text-xs text-gray-500">
              Nos comprometemos a crear un ambiente seguro y respetuoso. El contenido ofensivo, discriminatorio o que promueva el acoso será eliminado inmediatamente.
            </p>
          </div>
        </div>
      </div>
    </div>
    </div>
    </>
  );
}
