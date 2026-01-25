import { Heart, Gift, Mic, QrCode } from 'lucide-react';
import { StoreLocations } from './StoreLocations';

interface LandingPageProps {
  onCreateCard: () => void;
}

export function LandingPage({ onCreateCard }: LandingPageProps) {
  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)',
      }}
    >
      <div className="absolute inset-0 bg-black/40"></div>
      <div className="relative">
      <div className="container mx-auto px-4 py-16">
        <header className="text-center mb-16">
          <div className="flex items-center justify-center mb-4">
            <Heart className="w-12 h-12 text-red-400 fill-red-400 animate-pulse drop-shadow-lg" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
            Tarjetas con Corazón
          </h1>
          <p className="text-xl text-gray-100 max-w-2xl mx-auto drop-shadow-md">
            Crea tarjetas híbridas únicas que combinan el encanto físico con la magia digital
          </p>
        </header>

        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden mb-16">
          <div className="bg-gradient-to-r from-red-500 to-pink-500 p-8 text-white">
            <h2 className="text-3xl font-bold mb-4">Sorprende este 14 de Febrero</h2>
            <p className="text-lg opacity-90">
              Una tarjeta física con QR que revela tu mensaje de voz especial
            </p>
          </div>

          <div className="p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="flex items-start space-x-4">
                <div className="bg-red-100 p-3 rounded-full">
                  <Mic className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Graba tu Voz</h3>
                  <p className="text-gray-600">
                    Expresa tus sentimientos con tu propia voz, haciendo el regalo más personal y emotivo
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-pink-100 p-3 rounded-full">
                  <QrCode className="w-6 h-6 text-pink-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Código QR Único</h3>
                  <p className="text-gray-600">
                    Cada tarjeta incluye un QR que lleva a una experiencia digital personalizada
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-red-100 p-3 rounded-full">
                  <Gift className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Tarjeta Física</h3>
                  <p className="text-gray-600">
                    Recibe una hermosa tarjeta impresa para entregar en mano con todo tu amor
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-pink-100 p-3 rounded-full">
                  <Heart className="w-6 h-6 text-pink-600 fill-pink-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Recuerdo Eterno</h3>
                  <p className="text-gray-600">
                    Tu mensaje de voz quedará guardado para siempre, reviviendo ese momento especial
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={onCreateCard}
                className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold py-4 px-8 rounded-full text-xl hover:from-red-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-lg"
              >
                Crear Mi Tarjeta
              </button>
              <a
                href="/dashboard"
                className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-8 rounded-full text-lg transition-all text-center"
              >
                Ver Dashboard
              </a>
            </div>
          </div>
        </div>

        <div className="text-center text-gray-200 mb-8">
          <p className="text-sm drop-shadow-md">
            Perfecto para San Valentín, aniversarios, cumpleaños y momentos especiales
          </p>
        </div>

        {/* Sección de Ubicaciones */}
        <div className="max-w-6xl mx-auto">
          <StoreLocations />
        </div>
      </div>
    </div>
    </div>
  );
}
