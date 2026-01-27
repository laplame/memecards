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

export const storeLocations: StoreLocation[] = [];
