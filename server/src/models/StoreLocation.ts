import mongoose, { Schema, Document } from 'mongoose';

export interface IStoreLocation extends Document {
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
  createdAt: Date;
  updatedAt: Date;
}

const StoreLocationSchema = new Schema<IStoreLocation>(
  {
    name: {
      type: String,
      required: [true, 'El nombre de la tienda es requerido'],
      trim: true,
      maxlength: [200, 'El nombre no puede exceder 200 caracteres'],
    },
    address: {
      type: String,
      required: [true, 'La dirección es requerida'],
      trim: true,
      maxlength: [500, 'La dirección no puede exceder 500 caracteres'],
    },
    phone: {
      type: String,
      trim: true,
      maxlength: [20, 'El teléfono no puede exceder 20 caracteres'],
    },
    hours: {
      type: String,
      trim: true,
      maxlength: [100, 'Los horarios no pueden exceder 100 caracteres'],
    },
    latitude: {
      type: Number,
      required: [true, 'La latitud es requerida'],
      min: [-90, 'La latitud debe estar entre -90 y 90'],
      max: [90, 'La latitud debe estar entre -90 y 90'],
    },
    longitude: {
      type: Number,
      required: [true, 'La longitud es requerida'],
      min: [-180, 'La longitud debe estar entre -180 y 180'],
      max: [180, 'La longitud debe estar entre -180 y 180'],
    },
    city: {
      type: String,
      required: [true, 'La ciudad es requerida'],
      trim: true,
      maxlength: [100, 'La ciudad no puede exceder 100 caracteres'],
    },
    state: {
      type: String,
      trim: true,
      maxlength: [100, 'El estado no puede exceder 100 caracteres'],
    },
    country: {
      type: String,
      trim: true,
      default: 'México',
      maxlength: [100, 'El país no puede exceder 100 caracteres'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Crea createdAt y updatedAt automáticamente
    collection: 'storelocations', // Nombre de la colección en MongoDB
  }
);

// Índices para mejorar las búsquedas
StoreLocationSchema.index({ city: 1 });
StoreLocationSchema.index({ state: 1 });
StoreLocationSchema.index({ isActive: 1 });
StoreLocationSchema.index({ latitude: 1, longitude: 1 }); // Índice geoespacial
StoreLocationSchema.index({ name: 'text', address: 'text', city: 'text' }); // Índice de texto para búsqueda

// Método para obtener la URL de Google Maps
StoreLocationSchema.methods.getGoogleMapsUrl = function (): string {
  return `https://www.google.com/maps?q=${this.latitude},${this.longitude}`;
};

// Método para obtener las direcciones de Google Maps
StoreLocationSchema.methods.getGoogleMapsDirections = function (): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${this.latitude},${this.longitude}`;
};

export const StoreLocation = mongoose.model<IStoreLocation>('StoreLocation', StoreLocationSchema);
