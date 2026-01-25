/**
 * Datos de ubicaciones de tiendas donde se pueden comprar las tarjetas físicas
 * Puedes editar este archivo para agregar tus propias ubicaciones
 */

export interface StoreLocation {
  id: string;
  name: string;
  address: string;
  phone?: string;
  hours?: string;
  latitude: number;
  longitude: number;
  city: string;
  state?: string;
  country?: string;
}

export const storeLocations: StoreLocation[] = [
  {
    id: '1',
    name: 'Papelería El Corazón',
    address: 'Av. Principal 123, Centro',
    phone: '+52 55 1234 5678',
    hours: 'Lun-Sab: 9:00 AM - 8:00 PM',
    latitude: 19.4326,
    longitude: -99.1332,
    city: 'Ciudad de México',
    state: 'CDMX',
    country: 'México',
  },
  {
    id: '2',
    name: 'Regalos y Más',
    address: 'Calle Reforma 456, Zona Rosa',
    phone: '+52 55 2345 6789',
    hours: 'Lun-Dom: 10:00 AM - 9:00 PM',
    latitude: 19.4285,
    longitude: -99.1616,
    city: 'Ciudad de México',
    state: 'CDMX',
    country: 'México',
  },
  {
    id: '3',
    name: 'Artesanías del Amor',
    address: 'Plaza del Sol, Local 12',
    phone: '+52 33 3456 7890',
    hours: 'Lun-Sab: 8:00 AM - 7:00 PM',
    latitude: 20.6597,
    longitude: -103.3496,
    city: 'Guadalajara',
    state: 'Jalisco',
    country: 'México',
  },
  {
    id: '4',
    name: 'Tarjetas Especiales',
    address: 'Av. Insurgentes 789, Col. Roma',
    phone: '+52 55 4567 8901',
    hours: 'Lun-Vie: 9:00 AM - 7:00 PM',
    latitude: 19.4208,
    longitude: -99.1606,
    city: 'Ciudad de México',
    state: 'CDMX',
    country: 'México',
  },
  {
    id: '5',
    name: 'Regalos Únicos',
    address: 'Centro Comercial Galerías, Nivel 2',
    phone: '+52 81 5678 9012',
    hours: 'Lun-Dom: 10:00 AM - 10:00 PM',
    latitude: 25.6866,
    longitude: -100.3161,
    city: 'Monterrey',
    state: 'Nuevo León',
    country: 'México',
  },
  {
    id: '6',
    name: 'Papelería San Valentín',
    address: 'Calle 60 #456, Centro Histórico',
    phone: '+52 999 6789 0123',
    hours: 'Lun-Sab: 8:00 AM - 6:00 PM',
    latitude: 20.9674,
    longitude: -89.5926,
    city: 'Mérida',
    state: 'Yucatán',
    country: 'México',
  },
];
