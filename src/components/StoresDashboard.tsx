import { useState, useEffect } from 'react';
import { MapPin, Phone, Clock, ExternalLink, Navigation, Search, Filter, Download, RefreshCw, Plus, X, Navigation2, Loader2 } from 'lucide-react';
import { PinLock } from './PinLock';
import { Footer } from './Footer';

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
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    hours: '',
    latitude: '',
    longitude: '',
    city: '',
    state: '',
    country: 'México',
    isActive: true,
  });

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

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.address || !formData.latitude || !formData.longitude || !formData.city) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    try {
      setCreating(true);
      const response = await fetch(`${backendUrl}/api/stores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Tienda creada exitosamente');
        setShowCreateForm(false);
      setFormData({
        name: '',
        address: '',
        phone: '',
        hours: '',
        latitude: '',
        longitude: '',
        city: '',
        state: '',
        country: 'México',
        isActive: true,
      });
      setLocationError(null);
        loadStores();
      } else {
        alert(data.error?.message || 'Error al crear la tienda');
      }
    } catch (error) {
      console.error('Error creating store:', error);
      alert('Error al crear la tienda');
    } finally {
      setCreating(false);
    }
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Tu navegador no soporta geolocalización');
      return;
    }

    setGettingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData({
          ...formData,
          latitude: latitude.toFixed(6),
          longitude: longitude.toFixed(6),
        });
        setGettingLocation(false);
        setLocationError(null);
      },
      (error) => {
        setGettingLocation(false);
        let errorMessage = 'Error al obtener la ubicación';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Permiso de ubicación denegado. Por favor, permite el acceso a la ubicación en la configuración de tu navegador.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'La información de ubicación no está disponible.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Tiempo de espera agotado al obtener la ubicación.';
            break;
          default:
            errorMessage = 'Error desconocido al obtener la ubicación.';
            break;
        }
        
        setLocationError(errorMessage);
        alert(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleDeleteStore = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta tienda?')) {
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/api/stores/${id}?hard=true`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        alert('Tienda eliminada exitosamente');
        loadStores();
      } else {
        alert(data.error?.message || 'Error al eliminar la tienda');
      }
    } catch (error) {
      console.error('Error deleting store:', error);
      alert('Error al eliminar la tienda');
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
                Tiendas ({filteredStores.length})
              </div>
              <button
                onClick={() => setShowCreateForm(true)}
                className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Nueva Tienda</span>
              </button>
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

        {/* Formulario de Creación */}
        {showCreateForm && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Crear Nueva Tienda</h2>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleCreateStore} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre de la Tienda *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Ej: Papelería El Corazón"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ciudad *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Ej: Ciudad de México"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dirección *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Ej: Av. Principal 123, Centro"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Ej: +52 55 1234 5678"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Horarios
                  </label>
                  <input
                    type="text"
                    value={formData.hours}
                    onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Ej: Lun-Sab: 9:00 AM - 8:00 PM"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Latitud *
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      step="any"
                      required
                      value={formData.latitude}
                      onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Ej: 19.4326"
                    />
                    <button
                      type="button"
                      onClick={handleGetCurrentLocation}
                      disabled={gettingLocation}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                      title="Obtener ubicación GPS"
                    >
                      {gettingLocation ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Navigation2 className="w-4 h-4" />
                      )}
                      <span className="hidden sm:inline">GPS</span>
                    </button>
                  </div>
                  {locationError && (
                    <p className="mt-1 text-xs text-red-600">{locationError}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Longitud *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Ej: -99.1332"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Ej: CDMX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    País
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="México"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-6 py-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? 'Creando...' : 'Crear Tienda'}
                </button>
              </div>
            </form>
          </div>
        )}

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
            <p className="text-gray-600 text-lg mb-6">
              {stores.length === 0 ? 'No hay tiendas registradas' : 'No se encontraron tiendas'}
            </p>
            {stores.length === 0 && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="mt-4 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105 shadow-lg flex items-center space-x-2 mx-auto"
              >
                <Plus className="w-5 h-5" />
                <span>Crear Primera Tienda</span>
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
                    <button
                      onClick={() => handleDeleteStore(store._id)}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-3 rounded-lg transition-colors text-sm"
                    >
                      Eliminar Tienda
                    </button>
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
      <Footer />
    </div>
  );
}
