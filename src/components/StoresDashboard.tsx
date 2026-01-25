import { useState, useEffect } from 'react';
import { MapPin, Phone, Clock, ExternalLink, Navigation, Search, Filter, Download, RefreshCw } from 'lucide-react';
import { PinLock } from './PinLock';

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

export function StoresDashboard() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [stores, setStores] = useState<StoreData[]>([]);
  const [loading, setLoading] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

  useEffect(() => {
    if (isUnlocked) {
      loadStores();
    }
  }, [isUnlocked]);

  if (!isUnlocked) {
    return (
      <PinLock
        correctPin="8044"
        onUnlock={() => setIsUnlocked(true)}
        title="Dashboard de Direcciones"
        message="Ingresa el código PIN para acceder al dashboard de tiendas"
      />
    );
  }

  const loadStores = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${backendUrl}/api/stores`);
      const data = await response.json();

      if (data.success && data.data) {
        setStores(data.data);
      }
    } catch (error) {
      console.error('Error loading stores:', error);
    } finally {
      setLoading(false);
    }
  };

  const cities = Array.from(new Set(stores.map(store => store.city)));

  const filteredStores = stores.filter(store => {
    const matchesSearch = 
      store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.city.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCity = selectedCity === 'all' || store.city === selectedCity;
    
    return matchesSearch && matchesCity && store.isActive;
  });

  const getGoogleMapsUrl = (lat: number, lng: number) => {
    return `https://www.google.com/maps?q=${lat},${lng}`;
  };

  const getGoogleMapsDirections = (lat: number, lng: number) => {
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Nombre', 'Dirección', 'Teléfono', 'Horarios', 'Ciudad', 'Estado', 'Latitud', 'Longitud'];
    const rows = stores.map(store => [
      store._id,
      store.name,
      store.address,
      store.phone || '',
      store.hours || '',
      store.city,
      store.state || '',
      store.latitude.toString(),
      store.longitude.toString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `tiendas-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-red-100 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-3">
              <MapPin className="w-8 h-8 text-red-500" />
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Dashboard de Direcciones</h1>
                <p className="text-gray-600">Gestión de tiendas y ubicaciones</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-red-100 text-red-700 px-4 py-2 rounded-lg font-semibold">
                {filteredStores.length} tiendas
              </div>
              <button
                onClick={loadStores}
                disabled={loading}
                className="flex items-center space-x-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Actualizar</span>
              </button>
              <button
                onClick={exportToCSV}
                className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Exportar CSV</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nombre, dirección o ciudad..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">Todas las ciudades</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Stores Grid */}
        {loading && stores.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <RefreshCw className="w-16 h-16 text-red-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Cargando tiendas...</p>
          </div>
        ) : filteredStores.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No se encontraron tiendas</p>
            {stores.length === 0 && (
              <button
                onClick={loadStores}
                className="mt-4 bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg"
              >
                Cargar Tiendas
              </button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStores.map((store) => (
              <div
                key={store._id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-red-500 to-pink-500 p-4 text-white">
                  <h3 className="font-bold text-lg mb-1">{store.name}</h3>
                  <p className="text-sm opacity-90">{store.city}, {store.state || store.country}</p>
                </div>

                {/* Content */}
                <div className="p-5 space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-4 h-4 mt-0.5 text-red-500 flex-shrink-0" />
                      <span className="text-gray-700">{store.address}</span>
                    </div>
                    {store.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <a href={`tel:${store.phone}`} className="text-gray-700 hover:text-red-600">
                          {store.phone}
                        </a>
                      </div>
                    )}
                    {store.hours && (
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">{store.hours}</span>
                      </div>
                    )}
                  </div>

                  {/* GPS Coordinates */}
                  <div className="bg-gray-50 rounded-lg p-3 text-xs font-mono text-gray-600">
                    <div className="flex justify-between">
                      <span>Lat:</span>
                      <span className="font-semibold">{store.latitude}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Lng:</span>
                      <span className="font-semibold">{store.longitude}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2 pt-2 border-t border-gray-200">
                    <a
                      href={`/${store._id}`}
                      className="block w-full text-center bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-medium py-2 px-3 rounded-lg transition-colors text-sm"
                    >
                      Ver Página Completa
                    </a>
                    <div className="grid grid-cols-2 gap-2">
                      <a
                        href={getGoogleMapsUrl(store.latitude, store.longitude)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center space-x-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-3 rounded-lg transition-colors text-sm"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Ver Maps</span>
                      </a>
                      <a
                        href={getGoogleMapsDirections(store.latitude, store.longitude)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center space-x-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-3 rounded-lg transition-colors text-sm"
                      >
                        <Navigation className="w-4 h-4" />
                        <span>Ruta</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary Table */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mt-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Resumen por Ciudad</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Ciudad</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Estado</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Tiendas</th>
                </tr>
              </thead>
              <tbody>
                {cities.map(city => {
                  const cityStores = stores.filter(s => s.city === city && s.isActive);
                  const state = cityStores[0]?.state || cityStores[0]?.country || '-';
                  return (
                    <tr key={city} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-800">{city}</td>
                      <td className="py-3 px-4 text-gray-600">{state}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full font-semibold">
                          {cityStores.length}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
