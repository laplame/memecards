import { useState } from 'react';
import { MapPin, Phone, Clock, ExternalLink, Navigation } from 'lucide-react';
import { storeLocations, type StoreLocation } from '../data/storeLocations';

const stores = storeLocations;

export function StoreLocations() {
  const [selectedStore, setSelectedStore] = useState<StoreLocation | null>(null);

  const getGoogleMapsUrl = (store: StoreLocation) => {
    return `https://www.google.com/maps?q=${store.latitude},${store.longitude}`;
  };

  const getGoogleMapsDirections = (store: StoreLocation) => {
    return `https://www.google.com/maps/dir/?api=1&destination=${store.latitude},${store.longitude}`;
  };

  const getGoogleMapsEmbed = (store: StoreLocation) => {
    return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3762.5!2d${store.longitude}!3d${store.latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTHCsDI1JzU3LjQiTiA5OcKwMDcnNTkuNSJX!5e0!3m2!1ses!2smx!4v1234567890123!5m2!1ses!2smx`;
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden my-16">
      <div className="bg-gradient-to-r from-red-500 to-pink-500 p-8 text-white">
        <div className="flex items-center space-x-3 mb-2">
          <MapPin className="w-8 h-8" />
          <h2 className="text-3xl font-bold">¿Dónde Comprar las Tarjetas Físicas?</h2>
        </div>
        <p className="text-lg opacity-90">
          Encuentra nuestras tiendas asociadas cerca de ti
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-0">
        {/* Lista de Tiendas */}
        <div className="p-6 overflow-y-auto max-h-[600px]">
          <div className="space-y-4">
            {stores.map((store) => (
              <div
                key={store.id}
                onClick={() => setSelectedStore(store)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedStore?.id === store.id
                    ? 'border-red-500 bg-red-50 shadow-md'
                    : 'border-gray-200 hover:border-red-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-800 mb-1">
                      {store.name}
                    </h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-start space-x-2">
                        <MapPin className="w-4 h-4 mt-0.5 text-red-500 flex-shrink-0" />
                        <span>{store.address}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                          {store.city}
                        </span>
                      </div>
                      {store.phone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span>{store.phone}</span>
                        </div>
                      )}
                      {store.hours && (
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span>{store.hours}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex space-x-2">
                  <a
                    href={getGoogleMapsUrl(store)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center space-x-1 text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Ver en Maps</span>
                  </a>
                  <a
                    href={getGoogleMapsDirections(store)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <Navigation className="w-4 h-4" />
                    <span>Ruta</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mapa */}
        <div className="bg-gray-100 p-6">
          {selectedStore ? (
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 shadow-md">
                <h3 className="font-bold text-lg text-gray-800 mb-2">
                  {selectedStore.name}
                </h3>
                <p className="text-sm text-gray-600 mb-4">{selectedStore.address}</p>
                
                {/* Mapa embebido de Google Maps */}
                {/* Mapa interactivo - placeholder que abre Google Maps */}
                <div className="rounded-lg overflow-hidden shadow-lg mb-4 bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-200">
                  <a
                    href={getGoogleMapsUrl(selectedStore)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full h-[300px] relative group"
                  >
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                      <MapPin className="w-16 h-16 text-red-500 mb-4 group-hover:scale-110 transition-transform" />
                      <h4 className="text-xl font-bold text-gray-800 mb-2">{selectedStore.name}</h4>
                      <p className="text-sm text-gray-600 text-center mb-4">{selectedStore.address}</p>
                      <div className="bg-red-500 text-white px-6 py-3 rounded-lg font-medium group-hover:bg-red-600 transition-colors">
                        Ver en Google Maps →
                      </div>
                    </div>
                    <div className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg">
                      <ExternalLink className="w-5 h-5 text-red-500" />
                    </div>
                  </a>
                </div>

                <div className="flex space-x-2">
                  <a
                    href={getGoogleMapsUrl(selectedStore)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center space-x-2 bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Abrir en Google Maps</span>
                  </a>
                  <a
                    href={getGoogleMapsDirections(selectedStore)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    <Navigation className="w-4 h-4" />
                    <span>Ruta</span>
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              <div className="text-center">
                <MapPin className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Selecciona una tienda para ver su ubicación</p>
              </div>
            </div>
          )}

          {/* Mapa general con todas las ubicaciones */}
          {!selectedStore && (
            <div className="rounded-lg overflow-hidden shadow-lg">
              <iframe
                width="100%"
                height="500"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps/embed/v1/view?key=AIzaSyBFw0Qbyq9zTFTd-tUY6d-s6L4c27NZmj1&center=19.4326,-99.1332&zoom=6`}
              ></iframe>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
