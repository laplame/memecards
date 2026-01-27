import { useState } from 'react';
import { Heart, Gift, Mic, QrCode, Search, Loader2, PlayCircle } from 'lucide-react';
import { StoreLocations } from './StoreLocations';
import { ValentineCardAnimation } from './ValentineCardAnimation';
import { FestivitiesNavigation, type FestivityType } from './FestivitiesNavigation';

interface LandingPageProps {
  onSearchCard: (code: string) => void;
}

export function LandingPage({ onSearchCard }: LandingPageProps) {
  const [searchCode, setSearchCode] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selectedFestivity, setSelectedFestivity] = useState<FestivityType>('valentine');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchCode.trim()) {
      setSearchError('Por favor ingresa un código');
      return;
    }

    const code = searchCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
    
    if (code.length !== 8) {
      setSearchError('El código debe tener 8 caracteres');
      return;
    }

    setSearching(true);
    setSearchError(null);

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      const response = await fetch(`${backendUrl}/api/pages/${code}`);

      if (!response.ok) {
        if (response.status === 404) {
          setSearchError('Tarjeta no encontrada. Verifica el código e intenta de nuevo.');
        } else {
          setSearchError('Error al buscar la tarjeta. Intenta de nuevo.');
        }
        setSearching(false);
        return;
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        onSearchCard(code);
      } else {
        setSearchError('Tarjeta no encontrada');
        setSearching(false);
      }
    } catch (error) {
      console.error('Error searching card:', error);
      setSearchError('Error al buscar la tarjeta. Intenta de nuevo.');
      setSearching(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)',
      }}
    >
      <div className="absolute inset-0 bg-black/40"></div>
      <div className="relative">
      <div className="container mx-auto px-4 py-8">
        {/* Navegación de Festividades */}
        <div className="mb-8">
          <FestivitiesNavigation 
            selectedFestivity={selectedFestivity}
            onFestivityChange={setSelectedFestivity}
          />
        </div>

        <header className="text-center mb-16">
          <div className="flex items-center justify-center mb-4">
            <Heart className="w-12 h-12 text-red-400 fill-red-400 animate-pulse drop-shadow-lg" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
            Tarjetas con Corazón
          </h1>
          <p className="text-xl text-gray-100 max-w-2xl mx-auto drop-shadow-md mb-6">
            Crea tarjetas híbridas únicas que combinan el encanto físico con la magia digital
          </p>
          <div className="max-w-3xl mx-auto mt-6 p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
            <p className="text-xl md:text-2xl font-semibold text-white drop-shadow-lg italic text-center">
              "Escanea, personaliza y regala… porque nada dice 'te quiero' como un glitch multiversal de amor." 🌌💘
            </p>
          </div>
          
          {/* Animación de tarjeta de San Valentín */}
          <div className="mt-12 mb-8">
            <ValentineCardAnimation />
          </div>
        </header>

        {/* Barra de Búsqueda de Tarjetas */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
            <div className="flex items-center space-x-3 mb-4">
              <Search className="w-6 h-6 text-red-500" />
              <h2 className="text-2xl font-bold text-gray-800">Buscar Mi Tarjeta</h2>
            </div>
            <p className="text-gray-600 mb-4 text-sm">
              Ingresa el código de 8 caracteres de tu tarjeta para verla
            </p>
            <form onSubmit={handleSearch} className="space-y-3">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={searchCode}
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
                    setSearchCode(value);
                    setSearchError(null);
                  }}
                  placeholder="Ej: ABC12345"
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-center text-lg font-mono font-bold tracking-widest"
                  maxLength={8}
                  disabled={searching}
                />
                <button
                  type="submit"
                  disabled={searching || !searchCode.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold rounded-lg transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-2"
                >
                  {searching ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Buscando...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      <span>Buscar</span>
                    </>
                  )}
                </button>
              </div>
              {searchError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-700 text-sm">{searchError}</p>
                </div>
              )}
            </form>
          </div>
        </div>

        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden mb-16">
          <div className={`p-8 text-white ${
            selectedFestivity === 'valentine' ? 'bg-gradient-to-r from-red-500 to-pink-500' :
            selectedFestivity === 'mothers-day' ? 'bg-gradient-to-r from-pink-500 to-rose-500' :
            selectedFestivity === 'birthday' ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
            selectedFestivity === 'fathers-day' ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
            selectedFestivity === 'teachers-day' ? 'bg-gradient-to-r from-purple-500 to-indigo-500' :
            selectedFestivity === 'grandparents-day' ? 'bg-gradient-to-r from-orange-500 to-amber-500' :
            'bg-gradient-to-r from-green-500 to-emerald-500'
          }`}>
            <h2 className="text-3xl font-bold mb-4">
              {selectedFestivity === 'valentine' && 'Sorprende este 14 de Febrero'}
              {selectedFestivity === 'mothers-day' && 'Celebra el Día de la Madre'}
              {selectedFestivity === 'birthday' && 'Celebra un Cumpleaños Especial'}
              {selectedFestivity === 'fathers-day' && 'Honra al Día del Padre'}
              {selectedFestivity === 'teachers-day' && 'Agradece a tu Maestro'}
              {selectedFestivity === 'grandparents-day' && 'Celebra a los Abuelos'}
              {selectedFestivity === 'christmas' && 'Feliz Navidad'}
            </h2>
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
              {/* Botón de Demo */}
              <div className="relative">
                <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                  DEMO
                </div>
                <button
                  onClick={() => {
                    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
                    // Inicializar la demo si no existe
                    fetch(`${backendUrl}/api/pages/demo/init`)
                      .then(() => {
                        // Redirigir a la página demo
                        window.location.href = `${backendUrl}/page/DEMO1234`;
                      })
                      .catch((error) => {
                        console.error('Error al inicializar demo:', error);
                        // Intentar de todas formas
                        window.location.href = `${backendUrl}/page/DEMO1234`;
                      });
                  }}
                  className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold py-4 px-8 rounded-full text-xl hover:from-purple-600 hover:to-indigo-600 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
                >
                  <PlayCircle className="w-6 h-6" />
                  <span>Ver Demo - Probar Funcionalidad</span>
                </button>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Prueba la funcionalidad completa sin crear una tarjeta
                </p>
              </div>
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
