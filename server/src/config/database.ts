import mongoose from 'mongoose';

export const connectDatabase = async (): Promise<boolean> => {
  try {
    const mongoUri = process.env.MONGODB_ATLAS || process.env.MONGODB_URI;

    if (!mongoUri) {
      console.warn('⚠️  MONGODB_ATLAS/MONGODB_URI no está definida. Se continuará sin MongoDB.');
      return false;
    }

    const options = {
      // Opciones recomendadas para MongoDB Atlas
      maxPoolSize: 10, // Mantener hasta 10 conexiones en el pool
      serverSelectionTimeoutMS: 5000, // Tiempo de espera para seleccionar servidor
      socketTimeoutMS: 45000, // Cerrar sockets después de 45 segundos de inactividad
    };

    await mongoose.connect(mongoUri, options);

    console.log('✅ Conectado a MongoDB Atlas');
    console.log(`📊 Base de datos: ${mongoose.connection.name}`);

    // Manejar eventos de conexión
    mongoose.connection.on('error', (err) => {
      console.error('❌ Error de MongoDB:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB desconectado');
    });

    // Cerrar conexión al terminar la aplicación
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB conexión cerrada por terminación de la aplicación');
      process.exit(0);
    });

    return true;
  } catch (error) {
    console.error('❌ Error al conectar a MongoDB:', error);
    console.warn('⚠️  Continuando sin MongoDB (features de feed/votos/comentarios pueden no funcionar).');
    return false;
  }
};
