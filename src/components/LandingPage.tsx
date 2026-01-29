import { useState } from 'react';
import { Heart, Gift, Mic, QrCode, Search, Loader2, PlayCircle, Grid3x3, X, CreditCard } from 'lucide-react';
import { StoreLocations } from './StoreLocations';
import { ValentineCardAnimation } from './ValentineCardAnimation';
import { FestivitiesNavigation, type FestivityType } from './FestivitiesNavigation';
import { Footer } from './Footer';
import { Header } from './Header';

interface LandingPageProps {
  onSearchCard: (code: string) => void;
}

export function LandingPage({ onSearchCard }: LandingPageProps) {
  const [lang, setLang] = useState<'es' | 'en'>(() => {
    const saved = localStorage.getItem('lang');
    if (saved === 'en' || saved === 'es') return saved;
    return navigator.language?.toLowerCase().startsWith('es') ? 'es' : 'en';
  });
  const [searchCode, setSearchCode] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selectedFestivity, setSelectedFestivity] = useState<FestivityType>('valentine');
  const [showTransferBanner, setShowTransferBanner] = useState(true);

  const t = (key: string) => {
    const dict: Record<'es' | 'en', Record<string, string>> = {
      es: {
        enterCode: 'Por favor ingresa un código',
        codeLen: 'El código debe tener 8 caracteres',
        notFound: 'Tarjeta no encontrada. Verifica el código e intenta de nuevo.',
        searchErr: 'Error al buscar la tarjeta. Intenta de nuevo.',
        searchMyCard: 'Buscar Mi Tarjeta',
        feed: 'Ver Feed de Tarjetas',
        codeHint: 'Ingresa el código de 8 caracteres de tu tarjeta para verla',
        example: 'Ej: ABC12345',
        searching: 'Buscando...',
        search: 'Buscar',
        close: 'Cerrar',
        soon: 'PRÓXIMAMENTE',
        transferTitle: '¿No sabes qué regalar?',
        transferLine: 'Regala una transferencia',
        transferDesc: 'Pronto podrás enviar dinero directamente desde las tarjetas',
        headline: 'Tarjetas con Corazón',
        subhead: 'Crea tarjetas híbridas únicas que combinan el encanto físico con la magia digital',
        quote: "Escanea, personaliza y regala… porque nada dice 'te quiero' como un glitch multiversal de amor.",
        festHeadline_valentine: 'Sorprende este 14 de Febrero',
        festHeadline_mothers: 'Celebra el Día de la Madre',
        festHeadline_birthday: 'Celebra un Cumpleaños Especial',
        festHeadline_fathers: 'Honra al Día del Padre',
        festHeadline_teachers: 'Agradece a tu Maestro',
        festHeadline_grandparents: 'Celebra a los Abuelos',
        festHeadline_christmas: 'Feliz Navidad',
        festSubhead: 'Una tarjeta física con QR que revela tu mensaje de voz especial',
        feat_voice_title: 'Graba tu Voz',
        feat_voice_desc: 'Expresa tus sentimientos con tu propia voz, haciendo el regalo más personal y emotivo',
        feat_qr_title: 'Código QR Único',
        feat_qr_desc: 'Cada tarjeta incluye un QR que lleva a una experiencia digital personalizada',
        feat_physical_title: 'Tarjeta Física',
        feat_physical_desc: 'Recibe una hermosa tarjeta impresa para entregar en mano con todo tu amor',
        feat_memory_title: 'Recuerdo Eterno',
        feat_memory_desc: 'Tu mensaje de voz quedará guardado para siempre, reviviendo ese momento especial',
        demo_btn: 'Ver Demo - Probar Funcionalidad',
        demo_desc: 'Prueba la funcionalidad completa sin crear una tarjeta',
        perfectFor: 'Perfecto para San Valentín, aniversarios, cumpleaños y momentos especiales',
      },
      en: {
        enterCode: 'Please enter a code',
        codeLen: 'Code must be 8 characters',
        notFound: 'Card not found. Check the code and try again.',
        searchErr: 'Error searching the card. Try again.',
        searchMyCard: 'Find My Card',
        feed: 'View Cards Feed',
        codeHint: 'Enter your 8-character card code to view it',
        example: 'Ex: ABC12345',
        searching: 'Searching...',
        search: 'Search',
        close: 'Close',
        soon: 'COMING SOON',
        transferTitle: 'Not sure what to gift?',
        transferLine: 'Gift a transfer',
        transferDesc: 'Soon you will be able to send money directly from cards',
        headline: 'Cards with Heart',
        subhead: 'Create unique hybrid cards that blend physical charm with digital magic',
        quote: "Scan, personalize and gift… because nothing says 'I love you' like a multiverse love glitch.",
        festHeadline_valentine: "Surprise them on February 14",
        festHeadline_mothers: "Celebrate Mother's Day",
        festHeadline_birthday: 'Celebrate a Special Birthday',
        festHeadline_fathers: "Honor Father's Day",
        festHeadline_teachers: 'Thank Your Teacher',
        festHeadline_grandparents: 'Celebrate Grandparents',
        festHeadline_christmas: 'Merry Christmas',
        festSubhead: 'A physical card with a QR that reveals your special voice message',
        feat_voice_title: 'Record Your Voice',
        feat_voice_desc: 'Share your feelings in your own voice, making the gift more personal and emotional',
        feat_qr_title: 'Unique QR Code',
        feat_qr_desc: 'Every card includes a QR that opens a personalized digital experience',
        feat_physical_title: 'Printed Card',
        feat_physical_desc: 'Receive a beautiful printed card to hand-deliver with all your love',
        feat_memory_title: 'Keepsake Forever',
        feat_memory_desc: 'Your voice message stays saved forever, bringing that special moment back',
        demo_btn: 'View Demo - Try It',
        demo_desc: 'Try the full experience without creating a card',
        perfectFor: 'Perfect for Valentine’s, anniversaries, birthdays, and special moments',
      },
    };
    return dict[lang][key] ?? key;
  };

  const setLanguage = (next: 'es' | 'en') => {
    setLang(next);
    localStorage.setItem('lang', next);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchCode.trim()) {
      setSearchError(t('enterCode'));
      return;
    }

    const code = searchCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
    
    if (code.length !== 8) {
      setSearchError(t('codeLen'));
      return;
    }

    setSearching(true);
    setSearchError(null);

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      const response = await fetch(`${backendUrl}/api/pages/${code}`);

      if (!response.ok) {
        if (response.status === 404) {
          setSearchError(t('notFound'));
        } else {
          setSearchError(t('searchErr'));
        }
        setSearching(false);
        return;
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        onSearchCard(code);
      } else {
        setSearchError(t('notFound'));
        setSearching(false);
      }
    } catch (error) {
      console.error('Error searching card:', error);
      setSearchError(t('searchErr'));
      setSearching(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header showNavigation={true} showDashboardLink={false} />
      <div
        className="flex-1 bg-cover bg-center bg-fixed relative"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)',
        }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative">
          <div className="container mx-auto px-4 py-8">
        {/* Language toggle */}
        <div className="flex justify-end mb-4">
          <div className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-full p-1 flex gap-1">
            <button
              type="button"
              onClick={() => setLanguage('es')}
              className={`px-3 py-1 rounded-full text-sm font-bold ${lang === 'es' ? 'bg-white text-gray-900' : 'text-white hover:bg-white/20'}`}
            >
              ES
            </button>
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-3 py-1 rounded-full text-sm font-bold ${lang === 'en' ? 'bg-white text-gray-900' : 'text-white hover:bg-white/20'}`}
            >
              EN
            </button>
          </div>
        </div>
        {/* Banner de Transferencia - Popup */}
        {showTransferBanner && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4 animate-slide-down">
            <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 rounded-2xl shadow-2xl p-6 border-4 border-yellow-400 relative overflow-hidden">
              {/* Efecto de brillo animado */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
              
              {/* Botón de cerrar */}
              <button
                onClick={() => setShowTransferBanner(false)}
                className="absolute top-3 right-3 text-white hover:text-yellow-300 transition-colors z-10"
                aria-label={t('close')}
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative z-10">
                <div className="flex items-start space-x-4">
                  <div className="bg-yellow-400 rounded-full p-3 flex-shrink-0">
                    <CreditCard className="w-8 h-8 text-purple-700" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="bg-yellow-400 text-purple-900 text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                        {t('soon')}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {t('transferTitle')}
                    </h3>
                    <p className="text-white/90 text-lg font-semibold">
                      {t('transferLine')} 💸
                    </p>
                    <p className="text-white/80 text-sm mt-2">
                      {t('transferDesc')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
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
            {t('headline')}
          </h1>
          <p className="text-xl text-gray-100 max-w-2xl mx-auto drop-shadow-md mb-6">
            {t('subhead')}
          </p>
          <div className="max-w-3xl mx-auto mt-6 p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
            <p className="text-xl md:text-2xl font-semibold text-white drop-shadow-lg italic text-center">
              "{t('quote')}" 🌌💘
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
              <h2 className="text-2xl font-bold text-gray-800">{t('searchMyCard')}</h2>
            </div>
            {/* Botón Feed destacado */}
            <div className="mb-4">
              <a
                href="/feed"
                className="block w-full text-center bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
              >
                <Grid3x3 className="w-5 h-5" />
                <span>{t('feed')}</span>
              </a>
            </div>
            <p className="text-gray-600 mb-4 text-sm">
              {t('codeHint')}
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
                  placeholder={t('example')}
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
                      <span>{t('searching')}</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      <span>{t('search')}</span>
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
              {selectedFestivity === 'valentine' && t('festHeadline_valentine')}
              {selectedFestivity === 'mothers-day' && t('festHeadline_mothers')}
              {selectedFestivity === 'birthday' && t('festHeadline_birthday')}
              {selectedFestivity === 'fathers-day' && t('festHeadline_fathers')}
              {selectedFestivity === 'teachers-day' && t('festHeadline_teachers')}
              {selectedFestivity === 'grandparents-day' && t('festHeadline_grandparents')}
              {selectedFestivity === 'christmas' && t('festHeadline_christmas')}
            </h2>
            <p className="text-lg opacity-90">
              {t('festSubhead')}
            </p>
          </div>

          <div className="p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="flex items-start space-x-4">
                <div className="bg-red-100 p-3 rounded-full">
                  <Mic className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">{t('feat_voice_title')}</h3>
                  <p className="text-gray-600">
                    {t('feat_voice_desc')}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-pink-100 p-3 rounded-full">
                  <QrCode className="w-6 h-6 text-pink-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">{t('feat_qr_title')}</h3>
                  <p className="text-gray-600">
                    {t('feat_qr_desc')}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-red-100 p-3 rounded-full">
                  <Gift className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">{t('feat_physical_title')}</h3>
                  <p className="text-gray-600">
                    {t('feat_physical_desc')}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-pink-100 p-3 rounded-full">
                  <Heart className="w-6 h-6 text-pink-600 fill-pink-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">{t('feat_memory_title')}</h3>
                  <p className="text-gray-600">
                    {t('feat_memory_desc')}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {/* Botón de Feed */}
              <a
                href="/feed"
                className="block w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold py-4 px-8 rounded-full text-xl hover:from-pink-600 hover:to-rose-600 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
              >
                <Grid3x3 className="w-6 h-6" />
                <span>{t('feed')}</span>
              </a>
              
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
                  <span>{t('demo_btn')}</span>
                </button>
                <p className="text-xs text-gray-500 text-center mt-2">
                  {t('demo_desc')}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center text-gray-200 mb-8">
          <p className="text-sm drop-shadow-md">
            {t('perfectFor')}
          </p>
        </div>

        {/* Sección de Ubicaciones */}
        <div className="max-w-6xl mx-auto">
          <StoreLocations />
        </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
