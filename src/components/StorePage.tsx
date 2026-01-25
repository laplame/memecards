import { useState, useEffect } from 'react';
import { MapPin, Phone, Clock, ExternalLink, Navigation, Loader2, ArrowLeft } from 'lucide-react';

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

interface StorePageProps {
  storeId: string;
}

export function StorePage({ storeId }: StorePageProps) {
  const [store, setStore] = useState<StoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

  useEffect(() => {
    loadStore();
  }, [storeId]);

  const loadStore = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${backendUrl}/api/stores/${storeId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Error al cargar la tienda');
      }

      if (data.success && data.data) {
        setStore(data.data);
      } else {
        throw new Error('Tienda no encontrada');
      }
    } catch (err: any) {
      console.error('Error loading store:', err);
      setError(err.message || 'Error al cargar la tienda');
    } finally {
      setLoading(false);
    }
  };

  const getGoogleMapsUrl = (lat: number, lng: number) => {
    return `https://www.google.com/maps?q=${lat},${lng}`;
  };

  const getGoogleMapsDirections = (lat: number, lng: number) => {
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-red-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-red-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando información de la tienda...</p>
        </div>
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-red-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="bg-red-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <MapPin className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Tienda no encontrada</h2>
          <p className="text-gray-600 mb-6">{error || 'La tienda que buscas no existe'}</p>
          <a
            href="/"
            className="inline-flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Volver al inicio</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-red-100 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <a
            href="/"
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Volver al inicio</span>
          </a>
        </div>

        {/* Store Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header con gradiente */}
          <div className="bg-gradient-to-r from-red-500 to-pink-500 p-8 text-white">
            <div className="flex items-center space-x-3 mb-2">
              <MapPin className="w-8 h-8" />
              <div>
                <h1 className="text-3xl font-bold">{store.name}</h1>
                <p className="text-lg opacity-90">{store.city}{store.state ? `, ${store.state}` : ''}</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Información */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Información de la Tienda</h2>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <MapPin className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-700">Dirección</p>
                        <p className="text-gray-600">{store.address}</p>
                      </div>
                    </div>

                    {store.phone && (
                      <div className="flex items-start space-x-3">
                        <Phone className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-700">Teléfono</p>
                          <a
                            href={`tel:${store.phone}`}
                            className="text-red-600 hover:text-red-700 font-medium"
                          >
                            {store.phone}
                          </a>
                        </div>
                      </div>
                    )}

                    {store.hours && (
                      <div className="flex items-start space-x-3">
                        <Clock className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-700">Horarios</p>
                          <p className="text-gray-600">{store.hours}</p>
                        </div>
                      </div>
                    )}

                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Coordenadas GPS</p>
                      <div className="grid grid-cols-2 gap-2 text-sm font-mono text-gray-600">
                        <div>
                          <span className="text-gray-500">Lat:</span> {store.latitude}
                        </div>
                        <div>
                          <span className="text-gray-500">Lng:</span> {store.longitude}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mapa y Acciones */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Ubicación</h2>
                  <div className="bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-200 rounded-lg overflow-hidden mb-4">
                    <a
                      href={getGoogleMapsUrl(store.latitude, store.longitude)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full h-64 relative group"
                    >
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                        <MapPin className="w-16 h-16 text-red-500 mb-4 group-hover:scale-110 transition-transform" />
                        <h4 className="text-xl font-bold text-gray-800 mb-2">{store.name}</h4>
                        <p className="text-sm text-gray-600 text-center mb-4">{store.address}</p>
                        <div className="bg-red-500 text-white px-6 py-3 rounded-lg font-medium group-hover:bg-red-600 transition-colors">
                          Ver en Google Maps →
                        </div>
                      </div>
                      <div className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg">
                        <ExternalLink className="w-5 h-5 text-red-500" />
                      </div>
                    </a>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <a
                    href={getGoogleMapsUrl(store.latitude, store.longitude)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center space-x-2 bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                  >
                    <ExternalLink className="w-5 h-5" />
                    <span>Abrir en Google Maps</span>
                  </a>
                  <a
                    href={getGoogleMapsDirections(store.latitude, store.longitude)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                  >
                    <Navigation className="w-5 h-5" />
                    <span>Obtener Ruta</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>ID de la tienda: <span className="font-mono text-xs">{store._id}</span></p>
        </div>
      </div>
    </div>
  );
}
