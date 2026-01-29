import { useEffect, useState, useRef } from 'react';
import { Heart, Play, Pause, Volume2, Loader2, Lock, X } from 'lucide-react';
import { Footer } from './Footer';

interface Card {
  code: string;
  senderName?: string;
  recipientName?: string;
  writtenMessage?: string;
  audioUrl: string;
  imageUrl?: string;
  title?: string;
  description?: string;
  hasPin?: boolean;
}

interface CardDisplayProps {
  code: string;
}

export function CardDisplay({ code }: CardDisplayProps) {
  const [card, setCard] = useState<Card | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(true);
  const [hasPin, setHasPin] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    loadCard();
  }, [code]);

  const loadCard = async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      const response = await fetch(`${backendUrl}/api/pages/${code.toUpperCase()}`);

      if (!response.ok) {
        if (response.status === 404) {
          setError('Tarjeta no encontrada');
        } else {
          throw new Error('Error al cargar la tarjeta');
        }
        return;
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        const pageData = data.data;
        const cardHasPin = pageData.hasPin || false;
        setHasPin(cardHasPin);
        
        setCard({
          code: pageData.code,
          senderName: pageData.senderName || 'Anónimo',
          recipientName: pageData.recipientName || 'Tú',
          writtenMessage: pageData.writtenMessage || pageData.description || '',
          audioUrl: pageData.audioUrl,
          imageUrl: pageData.imageUrl,
          title: pageData.title,
          description: pageData.description,
          hasPin: cardHasPin,
        });
        
        // Si no tiene PIN, desbloquear automáticamente
        if (!cardHasPin) {
          setIsLocked(false);
        }
      } else {
        setError('Tarjeta no encontrada');
      }
    } catch (err) {
      console.error('Error loading card:', err);
      setError('Error al cargar la tarjeta');
    } finally {
      setLoading(false);
    }
  };

  const verifyPin = async (enteredPin: string): Promise<boolean> => {
    try {
      // PIN Master para efectos de seguridad
      const MASTER_PIN = '8044';
      
      // Verificar primero el PIN master localmente (más rápido)
      if (enteredPin === MASTER_PIN) {
        return true;
      }

      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      const response = await fetch(`${backendUrl}/api/pages/${code.toUpperCase()}/verify-pin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pin: enteredPin }),
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return data.success && data.data?.verified === true;
    } catch (err) {
      console.error('Error verifying PIN:', err);
      return false;
    }
  };

  const handleUnlock = async (enteredPin: string) => {
    const isValid = await verifyPin(enteredPin);
    if (isValid) {
      setIsLocked(false);
    }
    return isValid;
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

  // Mostrar bloqueo de PIN si la tarjeta tiene PIN y está bloqueada
  if (hasPin && isLocked) {
    return (
      <PinLockWrapper 
        code={code}
        onUnlock={handleUnlock}
      />
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
                Para {card.recipientName}
              </h1>
              <p className="text-lg opacity-90">
                De: {card.senderName}
              </p>
            </div>
          </div>

          <div className="p-8 md:p-12 space-y-8">
            {card.imageUrl && (
              <div className="bg-white rounded-2xl p-4 shadow-md">
                <img
                  src={card.imageUrl}
                  alt="Tarjeta personalizada"
                  className="w-full h-auto rounded-xl object-cover max-h-96"
                />
              </div>
            )}

            <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-6 md:p-8">
              <p className="text-gray-800 text-lg leading-relaxed whitespace-pre-wrap">
                {card.writtenMessage}
              </p>
            </div>

            {card.audioUrl && (
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
                  src={card.audioUrl}
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
      <Footer />
    </div>
    </div>
  );
}

// Componente wrapper para manejar el desbloqueo con verificación en el servidor
function PinLockWrapper({ code, onUnlock }: { code: string; onUnlock: (pin: string) => Promise<boolean> }) {
  const [pin, setPin] = useState<string[]>(['', '', '', '']);
  const [error, setError] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleInputChange = async (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    setError(false);

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newPin.every(digit => digit !== '') && newPin.join('').length === 4) {
      await verifyPin(newPin.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 4);
    if (/^\d{4}$/.test(pastedData)) {
      const newPin = pastedData.split('');
      setPin(newPin);
      await verifyPin(pastedData);
    }
  };

  const verifyPin = async (enteredPin: string) => {
    setIsVerifying(true);
    const isValid = await onUnlock(enteredPin);
    setIsVerifying(false);
    
    if (isValid) {
      // El componente padre manejará el desbloqueo
      return;
    } else {
      setError(true);
      setAttempts(prev => prev + 1);
      setPin(['', '', '', '']);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  };

  const clearPin = () => {
    setPin(['', '', '', '']);
    setError(false);
    inputRefs.current[0]?.focus();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-red-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-red-100 rounded-full p-4">
              <Lock className="w-12 h-12 text-red-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Acceso Restringido</h1>
          <p className="text-gray-600">Ingresa el código PIN de 4 dígitos para ver esta tarjeta</p>
        </div>

        <div className="space-y-6">
          <div className="flex justify-center space-x-3">
            {pin.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                disabled={isVerifying}
                className={`w-16 h-16 text-center text-2xl font-bold border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all ${
                  error
                    ? 'border-red-500 bg-red-50 shake'
                    : digit
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-300 bg-gray-50'
                } ${isVerifying ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
            ))}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <p className="text-red-700 font-medium">
                Código incorrecto
                {attempts > 0 && (
                  <span className="block text-sm text-red-600 mt-1">
                    Intentos: {attempts}
                  </span>
                )}
              </p>
            </div>
          )}

          {isVerifying && (
            <div className="text-center">
              <Loader2 className="w-6 h-6 text-red-600 animate-spin mx-auto" />
              <p className="text-sm text-gray-600 mt-2">Verificando...</p>
            </div>
          )}

          <div className="flex justify-center">
            <button
              onClick={clearPin}
              disabled={isVerifying}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
              <span>Limpiar</span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => {
                  const emptyIndex = pin.findIndex(d => d === '');
                  if (emptyIndex !== -1) {
                    handleInputChange(emptyIndex, num.toString());
                  }
                }}
                disabled={isVerifying}
                className="bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-800 font-bold text-xl py-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {num}
              </button>
            ))}
            <button
              onClick={clearPin}
              disabled={isVerifying}
              className="bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-800 font-bold text-lg py-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              C
            </button>
            <button
              onClick={() => {
                const emptyIndex = pin.findIndex(d => d === '');
                if (emptyIndex !== -1) {
                  handleInputChange(emptyIndex, '0');
                }
              }}
              disabled={isVerifying}
              className="bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-800 font-bold text-xl py-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              0
            </button>
            <button
              onClick={() => {
                for (let i = pin.length - 1; i >= 0; i--) {
                  if (pin[i]) {
                    const newPin = [...pin];
                    newPin[i] = '';
                    setPin(newPin);
                    inputRefs.current[i]?.focus();
                    break;
                  }
                }
              }}
              disabled={isVerifying}
              className="bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-800 font-bold text-lg py-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ←
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .shake {
          animation: shake 0.3s;
        }
      `}</style>
    </div>
  );
}
