import { useState, useEffect, useRef } from 'react';
import { 
  BarChart3, 
  ExternalLink, 
  Copy, 
  Check, 
  Download, 
  Trash2, 
  RefreshCw,
  Search,
  QrCode,
  MapPin,
  Phone,
  Clock,
  Navigation,
  Plus,
  FileText,
  X
} from 'lucide-react';
import QRCode from 'qrcode';
import { PinLock } from './PinLock';

interface AudioPage {
  id: string;
  code: string;
  audioUrl: string;
  title: string;
  description: string;
  createdAt: string;
  pageUrl: string;
}

interface StoreData {
  _id: string;
  name: string;
  address: string;
  phone?: string;
  hours?: string;
  latitude: number;
  longitude: number;
  city: string;
  state?: string;
  country?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export function Dashboard() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pages, setPages] = useState<AudioPage[]>([]);
  const [stores, setStores] = useState<StoreData[]>([]);
  const [loading, setLoading] = useState(true);
  const [storesLoading, setStoresLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'pages' | 'stores'>('pages');
  const [qrCodes, setQrCodes] = useState<Record<string, string>>({});
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const canvasRefs = useRef<Record<string, HTMLCanvasElement>>({});
  const [showCreateCardsForm, setShowCreateCardsForm] = useState(false);
  const [creatingCards, setCreatingCards] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    storeName: '',
    serverId: '',
    quantity: 10,
  });

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

  useEffect(() => {
    if (isUnlocked) {
      fetchPages();
      fetchStores();
    }
  }, [isUnlocked]);

  useEffect(() => {
    // Generar QR codes para todas las páginas
    pages.forEach((page) => {
      generateQRCode(page.code, page.pageUrl);
    });
  }, [pages]);

  const fetchPages = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching pages from:', `${backendUrl}/api/pages`);
      
      const response = await fetch(`${backendUrl}/api/pages`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📦 Response data:', data);
      
      if (data.success) {
        if (Array.isArray(data.data)) {
          // Ordenar por fecha de creación (más recientes primero)
          const sortedPages = data.data.sort((a: AudioPage, b: AudioPage) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return dateB - dateA;
          });
          console.log(`✅ Loaded ${sortedPages.length} pages`);
          setPages(sortedPages);
        } else {
          console.warn('⚠️  Response data is not an array:', data.data);
          setPages([]);
        }
      } else {
        console.warn('⚠️  Response success is false:', data);
        setPages([]);
      }
    } catch (error: any) {
      console.error('❌ Error fetching pages:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        backendUrl,
      });
      // Mostrar error al usuario
      alert(`Error al cargar páginas: ${error.message}\n\nVerifica que el servidor esté corriendo en ${backendUrl}`);
      setPages([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStores = async () => {
    try {
      setStoresLoading(true);
      const response = await fetch(`${backendUrl}/api/stores`);
      const data = await response.json();
      
      if (data.success && data.data) {
        // Filtrar solo tiendas activas y ordenar por ciudad
        const activeStores = data.data
          .filter((store: StoreData) => store.isActive)
          .sort((a: StoreData, b: StoreData) => a.city.localeCompare(b.city));
        setStores(activeStores);
      }
    } catch (error) {
      console.error('Error fetching stores:', error);
    } finally {
      setStoresLoading(false);
    }
  };

  const getGoogleMapsUrl = (lat: number, lng: number) => {
    return `https://www.google.com/maps?q=${lat},${lng}`;
  };

  const getGoogleMapsDirections = (lat: number, lng: number) => {
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  };

  const generateQRCode = async (code: string, url: string) => {
    try {
      const canvas = canvasRefs.current[code];
      if (canvas) {
        await QRCode.toCanvas(canvas, url, {
          width: 200,
          margin: 2,
          color: {
            dark: '#DC2626',
            light: '#FFFFFF',
          },
        });
        const dataUrl = canvas.toDataURL();
        setQrCodes((prev) => ({ ...prev, [code]: dataUrl }));
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const copyToClipboard = async (text: string, code: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  const downloadQR = (code: string) => {
    const qrDataUrl = qrCodes[code];
    if (!qrDataUrl) return;

    const link = document.createElement('a');
    link.download = `qr-${code}.png`;
    link.href = qrDataUrl;
    link.click();
  };

  const deletePage = async (code: string) => {
    if (!confirm(`¿Estás seguro de eliminar la página ${code}?`)) return;

    try {
      const response = await fetch(`${backendUrl}/api/pages/${code}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setPages((prev) => prev.filter((p) => p.code !== code));
      } else {
        alert('Error al eliminar la página');
      }
    } catch (error) {
      console.error('Error deleting page:', error);
      alert('Error al eliminar la página');
    }
  };

  const handleCreateCards = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!createFormData.storeName || !createFormData.serverId) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    if (!confirm(`¿Estás seguro de crear ${createFormData.quantity} tarjetas para ${createFormData.storeName}?`)) {
      return;
    }

    try {
      setCreatingCards(true);
      const response = await fetch(`${backendUrl}/api/pages/bulk-create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storeName: createFormData.storeName,
          serverId: createFormData.serverId,
          quantity: createFormData.quantity,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert(`¡${data.data.created} tarjetas creadas exitosamente!`);
        setShowCreateCardsForm(false);
        setCreateFormData({
          storeName: '',
          serverId: '',
          quantity: 10,
        });
        fetchPages();
      } else {
        alert(data.error?.message || 'Error al crear las tarjetas');
      }
    } catch (error) {
      console.error('Error creating cards:', error);
      alert('Error al crear las tarjetas');
    } finally {
      setCreatingCards(false);
    }
  };

  const filteredPages = pages.filter((page) =>
    page.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredStores = stores.filter((store) =>
    store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    store.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    store.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // No mostrar loading global, solo en las secciones específicas

  if (!isUnlocked) {
    return (
      <PinLock
        correctPin="8044"
        onUnlock={() => setIsUnlocked(true)}
        title="Dashboard"
        message="Ingresa el código PIN para acceder al dashboard"
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-3">
              <BarChart3 className="w-8 h-8 text-red-500" />
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
                <p className="text-gray-600">Gestiona páginas de audio y tiendas</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-red-100 text-red-700 px-4 py-2 rounded-lg font-semibold">
                {activeTab === 'pages' ? (
                  <>
                    {pages.length} {pages.length === 1 ? 'página' : 'páginas'}
                    {filteredPages.length !== pages.length && searchTerm && (
                      <span className="text-xs block">({filteredPages.length} filtradas)</span>
                    )}
                  </>
                ) : (
                  `Tiendas (${stores.length})`
                )}
              </div>
              {activeTab === 'pages' && (
                <button
                  onClick={() => setShowCreateCardsForm(true)}
                  className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  <span>Crear Tarjetas</span>
                </button>
              )}
              {activeTab === 'stores' && (
                <a
                  href="/stores-dashboard"
                  className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nueva Tienda</span>
                </a>
              )}
              <button
                onClick={activeTab === 'pages' ? fetchPages : fetchStores}
                disabled={loading || storesLoading}
                className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-4 h-4 ${(loading || storesLoading) ? 'animate-spin' : ''}`} />
                <span>Actualizar</span>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-4 flex space-x-2 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('pages')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'pages'
                  ? 'text-red-600 border-b-2 border-red-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Páginas de Audio ({pages.length})
            </button>
            <button
              onClick={() => setActiveTab('stores')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'stores'
                  ? 'text-red-600 border-b-2 border-red-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Tiendas ({stores.length})
            </button>
          </div>
        </div>

        {/* Formulario de Creación de Tarjetas */}
        {showCreateCardsForm && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
                <FileText className="w-6 h-6 text-green-500" />
                <span>Crear Tarjetas en Masa</span>
              </h2>
              <button
                onClick={() => setShowCreateCardsForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleCreateCards} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre de la Papelería *
                  </label>
                  <input
                    type="text"
                    required
                    value={createFormData.storeName}
                    onChange={(e) => setCreateFormData({ ...createFormData, storeName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Ej: Papelería El Corazón"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID del Servidor *
                  </label>
                  <input
                    type="text"
                    required
                    value={createFormData.serverId}
                    onChange={(e) => setCreateFormData({ ...createFormData, serverId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Ej: SERVER-001"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cantidad de Tarjetas *
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {[10, 50, 100, 1000].map((qty) => (
                      <button
                        key={qty}
                        type="button"
                        onClick={() => setCreateFormData({ ...createFormData, quantity: qty })}
                        className={`px-4 py-3 rounded-lg font-medium transition-all ${
                          createFormData.quantity === qty
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg transform scale-105'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {qty}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Resumen:</strong> Se crearán <strong>{createFormData.quantity} tarjetas</strong> para{' '}
                  <strong>{createFormData.storeName || '[Nombre de papelería]'}</strong> con ID{' '}
                  <strong>{createFormData.serverId || '[ID del servidor]'}</strong>
                </p>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateCardsForm(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creatingCards}
                  className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {creatingCards ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Creando...</span>
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4" />
                      <span>Crear {createFormData.quantity} Tarjetas</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Search */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por código, título o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'pages' ? (
          /* Pages Grid */
          loading ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <RefreshCw className="w-12 h-12 animate-spin text-red-500 mx-auto mb-4" />
              <p className="text-gray-600">Cargando páginas...</p>
            </div>
          ) : filteredPages.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {searchTerm ? 'No se encontraron páginas' : 'No hay páginas creadas aún'}
              </h3>
              {!searchTerm && (
                <div className="mt-6 space-y-4">
                  <p className="text-sm text-gray-600">
                    Total de páginas en el servidor: <span className="font-bold">{pages.length}</span>
                  </p>
                  <div className="flex flex-col items-center space-y-3">
                    <button
                      onClick={fetchPages}
                      className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                      <RefreshCw className="w-4 h-4 inline mr-2" />
                      Recargar Páginas
                    </button>
                    <p className="text-xs text-gray-400 mt-2">
                      Backend: {backendUrl}
                    </p>
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg max-w-md">
                      <p className="text-sm text-blue-800">
                        <strong>💡 Tip:</strong> Crea una tarjeta desde la página principal para generar páginas automáticamente.
                        Cada tarjeta crea 10 páginas adicionales.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPages.map((page) => (
              <div
                key={page.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                {/* QR Code Section */}
                <div className="bg-gradient-to-br from-red-500 to-pink-500 p-6 text-center">
                  <div className="bg-white rounded-lg p-3 inline-block mb-3">
                    <canvas
                      ref={(el) => {
                        if (el) canvasRefs.current[page.code] = el;
                      }}
                      className="w-32 h-32"
                    />
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-white">
                    <QrCode className="w-4 h-4" />
                    <span className="font-mono font-bold text-sm">{page.code}</span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-4">
                  <h3 className="font-bold text-lg text-gray-800 mb-1 truncate">
                    {page.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {page.description}
                  </p>
                  <p className="text-xs text-gray-500 mb-4">
                    {new Date(page.createdAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>

                  {/* Actions */}
                  <div className="space-y-2">
                    <a
                      href={page.pageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center space-x-2 bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Abrir Página</span>
                    </a>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => copyToClipboard(page.pageUrl, page.code)}
                        className="flex items-center justify-center space-x-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-3 rounded-lg transition-colors text-xs"
                      >
                        {copiedCode === page.code ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>Copiado</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copiar</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => downloadQR(page.code)}
                        className="flex items-center justify-center space-x-1 bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium py-2 px-3 rounded-lg transition-colors text-xs"
                      >
                        <Download className="w-3 h-3" />
                        <span>QR</span>
                      </button>
                    </div>

                    <button
                      onClick={() => deletePage(page.code)}
                      className="w-full flex items-center justify-center space-x-1 bg-red-100 hover:bg-red-200 text-red-700 font-medium py-2 px-4 rounded-lg transition-colors text-xs"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Eliminar</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          )
        ) : (
          /* Stores Grid */
          storesLoading ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <RefreshCw className="w-12 h-12 animate-spin text-red-500 mx-auto mb-4" />
              <p className="text-gray-600">Cargando tiendas...</p>
            </div>
          ) : filteredStores.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg mb-6">
                {searchTerm ? 'No se encontraron tiendas' : 'No hay tiendas disponibles'}
              </p>
              {!searchTerm && stores.length === 0 && (
                <a
                  href="/stores-dashboard"
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105 shadow-lg"
                >
                  <Plus className="w-5 h-5" />
                  <span>Crear Primera Tienda</span>
                </a>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredStores.map((store) => (
                <div
                  key={store._id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  {/* Header */}
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4 text-white">
                    <div className="flex items-center space-x-2 mb-1">
                      <MapPin className="w-5 h-5" />
                      <h3 className="font-bold text-lg truncate">{store.name}</h3>
                    </div>
                    <p className="text-sm opacity-90">{store.city}{store.state ? `, ${store.state}` : ''}</p>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex items-start space-x-2">
                        <MapPin className="w-4 h-4 mt-0.5 text-red-500 flex-shrink-0" />
                        <span className="text-gray-700 text-xs line-clamp-2">{store.address}</span>
                      </div>
                      {store.phone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <a href={`tel:${store.phone}`} className="text-gray-700 hover:text-red-600 text-xs">
                            {store.phone}
                          </a>
                        </div>
                      )}
                      {store.hours && (
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600 text-xs">{store.hours}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="space-y-2 pt-2 border-t border-gray-200">
                      <a
                        href={`/${store._id}`}
                        className="block w-full text-center bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                      >
                        Ver Página
                      </a>
                      <div className="grid grid-cols-2 gap-2">
                        <a
                          href={getGoogleMapsUrl(store.latitude, store.longitude)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center space-x-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-3 rounded-lg transition-colors text-xs"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Maps</span>
                        </a>
                        <a
                          href={getGoogleMapsDirections(store.latitude, store.longitude)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center space-x-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-3 rounded-lg transition-colors text-xs"
                        >
                          <Navigation className="w-3 h-3" />
                          <span>Ruta</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
