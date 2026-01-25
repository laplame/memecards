import { useState, useRef, useEffect } from 'react';
import { Lock, X } from 'lucide-react';

interface PinLockProps {
  correctPin: string;
  onUnlock: () => void;
  title?: string;
  message?: string;
}

export function PinLock({ correctPin, onUnlock, title = 'Acceso Restringido', message = 'Ingresa el código PIN de 4 dígitos' }: PinLockProps) {
  const [pin, setPin] = useState<string[]>(['', '', '', '']);
  const [error, setError] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus en el primer input al montar
    inputRefs.current[0]?.focus();
  }, []);

  const handleInputChange = (index: number, value: string) => {
    // Solo permitir números
    if (value && !/^\d$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    setError(false);

    // Auto-focus al siguiente input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    // Verificar si todos los dígitos están completos
    if (newPin.every(digit => digit !== '') && newPin.join('').length === 4) {
      verifyPin(newPin.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 4);
    if (/^\d{4}$/.test(pastedData)) {
      const newPin = pastedData.split('');
      setPin(newPin);
      verifyPin(pastedData);
    }
  };

  const verifyPin = (enteredPin: string) => {
    if (enteredPin === correctPin) {
      onUnlock();
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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{title}</h1>
          <p className="text-gray-600">{message}</p>
        </div>

        <div className="space-y-6">
          {/* PIN Input */}
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
                className={`w-16 h-16 text-center text-2xl font-bold border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all ${
                  error
                    ? 'border-red-500 bg-red-50 shake'
                    : digit
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-300 bg-gray-50'
                }`}
              />
            ))}
          </div>

          {/* Error Message */}
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

          {/* Clear Button */}
          <div className="flex justify-center">
            <button
              onClick={clearPin}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
              <span>Limpiar</span>
            </button>
          </div>

          {/* Numpad */}
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
                className="bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-800 font-bold text-xl py-4 rounded-lg transition-colors"
              >
                {num}
              </button>
            ))}
            <button
              onClick={clearPin}
              className="bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-800 font-bold text-lg py-4 rounded-lg transition-colors"
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
              className="bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-800 font-bold text-xl py-4 rounded-lg transition-colors"
            >
              0
            </button>
            <button
              onClick={() => {
                const emptyIndex = pin.findIndex(d => d === '');
                if (emptyIndex !== -1) {
                  handleInputChange(emptyIndex, '0');
                }
              }}
              className="bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-800 font-bold text-lg py-4 rounded-lg transition-colors"
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
