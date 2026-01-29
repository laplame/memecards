import { CheckCircle, Download, Copy, Check, X, Save, DollarSign } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { getCardUrl } from '../utils/cardCode';
import { Footer } from './Footer';

interface CardSuccessProps {
  code: string;
  onCreateAnother: () => void;
}

export function CardSuccess({ code, onCreateAnother }: CardSuccessProps) {
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [showSaveOffer, setShowSaveOffer] = useState(true);
  const [saving, setSaving] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    generateQRCode();
  }, [code]);

  const generateQRCode = async () => {
    const QRCode = (await import('qrcode')).default;
    const url = getCardUrl(code);

    try {
      const canvas = canvasRef.current;
      if (canvas) {
        await QRCode.toCanvas(canvas, url, {
          width: 300,
          margin: 2,
          color: {
            dark: '#DC2626',
            light: '#FFFFFF',
          },
        });
        const dataUrl = canvas.toDataURL();
        setQrDataUrl(dataUrl);
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const copyToClipboard = async () => {
    const url = getCardUrl(code);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  const downloadQR = () => {
    if (!qrDataUrl) return;

    const link = document.createElement('a');
    link.download = `tarjeta-${code}.png`;
    link.href = qrDataUrl;
    link.click();
  };

  const handleSaveCard = async () => {
    setSaving(true);
    // Aquí iría la lógica de pago (Stripe, PayPal, etc.)
    // Por ahora solo simulamos el proceso
    setTimeout(() => {
      alert('Redirigiendo al pago... (Funcionalidad de pago pendiente de implementar)');
      setSaving(false);
      setShowSaveOffer(false);
    }, 1000);
  };

  const handleDismissOffer = () => {
    setShowSaveOffer(false);
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
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 text-white">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="w-12 h-12" />
            </div>
            <h2 className="text-3xl font-bold text-center">¡Tarjeta Creada!</h2>
          </div>

          <div className="p-8 space-y-6">
            {/* Oferta de Guardar Tarjeta */}
            {showSaveOffer && (
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl p-6 relative">
                <button
                  onClick={handleDismissOffer}
                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-start space-x-4">
                  <div className="bg-yellow-100 p-3 rounded-full">
                    <DollarSign className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-800 mb-2">
                      ¿Quieres guardar esta tarjeta por 1 año?
                    </h3>
                    <p className="text-sm text-gray-700 mb-4">
                      Por solo <span className="font-bold text-yellow-600 text-lg">$1 USD</span>, tu tarjeta estará disponible durante todo un año sin límite de reproducciones.
                    </p>
                    <div className="flex space-x-3">
                      <button
                        onClick={handleSaveCard}
                        disabled={saving}
                        className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
                      >
                        {saving ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Procesando...</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-5 h-5" />
                            <span>Guardar por $1 USD</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleDismissOffer}
                        className="px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors"
                      >
                        Ahora no
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="text-center">
              <p className="text-lg text-gray-700 mb-2">
                Tu tarjeta ha sido creada exitosamente
              </p>
              <p className="text-sm text-gray-600">
                Código: <span className="font-mono font-bold text-red-600">{code}</span>
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-bold text-lg mb-4 text-center">Código QR</h3>
              <div className="flex justify-center mb-4">
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <canvas ref={canvasRef} className="mx-auto"></canvas>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={downloadQR}
                  className="w-full flex items-center justify-center space-x-2 bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                >
                  <Download className="w-5 h-5" />
                  <span>Descargar QR</span>
                </button>

                <button
                  onClick={copyToClipboard}
                  className="w-full flex items-center justify-center space-x-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-6 rounded-lg transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-5 h-5" />
                      <span>¡Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5" />
                      <span>Copiar Enlace</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-bold text-blue-900 mb-2">Próximos pasos:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                <li>Descarga el código QR</li>
                <li>Imprime tu tarjeta física e incluye el QR</li>
                <li>Entrega la tarjeta a esa persona especial</li>
                <li>Cuando escanee el QR, podrá ver tu mensaje y escuchar tu voz</li>
              </ol>
            </div>

            <button
              onClick={onCreateAnother}
              className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold py-4 px-8 rounded-full text-lg hover:from-red-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-lg"
            >
              Crear Otra Tarjeta
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
    </div>
  );
}
