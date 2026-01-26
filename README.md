# Tarjetas con Corazón 💌

Una aplicación full-stack para crear tarjetas digitales personalizadas con mensajes de voz, imágenes y contenido único. Cada tarjeta incluye un código QR que lleva a una experiencia digital personalizada.

## ✨ Características

- 🎤 **Grabación de Voz**: Graba mensajes de voz personalizados directamente desde el navegador
- 🖼️ **Subida de Imágenes**: Personaliza tus tarjetas con imágenes propias
- 📱 **Códigos QR Únicos**: Cada tarjeta genera un código QR único para compartir
- 🎨 **Animaciones**: Animaciones CSS personalizadas para una experiencia visual atractiva
- 🛡️ **Políticas de Seguridad**: Términos y condiciones y política anti-bullying integradas
- 📍 **Ubicaciones de Tiendas**: Sistema de gestión de tiendas físicas con MongoDB
- 🎵 **Procesamiento de Audio**: Optimización automática de audio con FFmpeg

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18+ y npm
- MongoDB Atlas (opcional, para tiendas)
- FFmpeg instalado (para procesamiento de audio)

### Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd memecards
   ```

2. **Instalar dependencias del frontend**
   ```bash
   npm install
   ```

3. **Instalar dependencias del backend**
   ```bash
   cd server
   npm install
   ```

4. **Configurar variables de entorno**

   Crear `.env` en la raíz del proyecto:
   ```env
   VITE_BACKEND_URL=http://localhost:3000
   ```

   Crear `server/.env`:
   ```env
   PORT=3000
   BASE_URL=http://localhost:3000
   UPLOAD_DIR=./uploads
   PROCESSED_DIR=./processed
   IMAGES_DIR=./images
   PAGES_DIR=./pages-data
   MONGODB_ATLAS=tu_connection_string_mongodb
   ```

5. **Iniciar el servidor backend**
   ```bash
   cd server
   npm run dev
   ```

6. **Iniciar el frontend** (en otra terminal)
   ```bash
   npm run dev
   ```

## 📁 Estructura del Proyecto

```
memecards/
├── src/                    # Frontend React
│   ├── components/         # Componentes React
│   │   ├── CreateCardForm.tsx
│   │   ├── CardDisplay.tsx
│   │   ├── CardSuccess.tsx
│   │   ├── LandingPage.tsx
│   │   ├── Dashboard.tsx
│   │   ├── TermsAndConditions.tsx
│   │   ├── AntiBullying.tsx
│   │   ├── CardSendingAnimation.tsx
│   │   └── ValentineCardAnimation.tsx
│   └── App.tsx
├── server/                 # Backend Node.js/Express
│   ├── src/
│   │   ├── routes/        # Rutas de la API
│   │   ├── services/      # Lógica de negocio
│   │   ├── templates/      # Templates HTML
│   │   └── middleware/    # Middleware personalizado
│   └── package.json
└── README.md
```

## 🎯 Funcionalidades Principales

### Creación de Tarjetas

1. **Formulario de Creación**
   - Nombre del remitente y destinatario
   - Mensaje escrito personalizado
   - Grabación de mensaje de voz
   - Subida de imagen opcional
   - Aceptación de términos y condiciones (requerido)
   - Confirmación de mayoría de edad (requerido)

2. **Animación de Envío**
   - Animación CSS que muestra la tarjeta con contenido
   - La tarjeta se inserta en un sobre animado
   - El sobre se cierra y se "envía" visualmente

3. **Resultado**
   - Código QR único generado
   - URL de la tarjeta para compartir
   - Opción de descargar el QR
   - Oferta de guardar la tarjeta por 1 año ($1 USD)

### Páginas Públicas

- **Página de Tarjeta**: `/page/:code` - Página única para cada tarjeta
- **Términos y Condiciones**: `/terminos` - Página de términos completos
- **Política Anti-Bullying**: `/antibullying` - Política de seguridad

### API Endpoints

- `POST /api/pages/create` - Crear una nueva tarjeta
- `GET /api/pages/:code` - Obtener información de una tarjeta
- `GET /api/audio/stream/:filename` - Stream de audio procesado
- `GET /api/images/:filename` - Servir imágenes subidas
- `GET /api/stores` - API de tiendas físicas

## 🛠️ Tecnologías Utilizadas

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Lucide React (iconos)
- QRCode (generación de códigos QR)

### Backend
- Node.js
- Express
- TypeScript
- Multer (manejo de archivos)
- FFmpeg (procesamiento de audio)
- MongoDB Atlas (tiendas)
- File-based JSON (páginas de audio)

## 📝 Notas Importantes

- **Supabase**: Removido del proyecto. El sistema ahora usa exclusivamente el backend local.
- **GIFs**: Funcionalidad de GIFs removida. Reemplazada por subida de imágenes.
- **Audio**: Los archivos de audio se procesan automáticamente con FFmpeg para optimización.
- **Imágenes**: Las imágenes se almacenan localmente y se sirven a través de `/api/images/:filename`.

## 🔒 Seguridad y Políticas

- Modal obligatorio de términos y condiciones antes de crear tarjetas
- Confirmación de mayoría de edad requerida
- Política anti-bullying integrada
- Validación de contenido en el servidor

## 📚 Documentación Adicional

- `SETUP-INSTRUCTIONS.md` - Instrucciones detalladas de configuración
- `SETUP-AUDIO.md` - Configuración de FFmpeg y procesamiento de audio
- `STATUS.md` - Estado actual del proyecto
- `server/API-DOCUMENTATION.md` - Documentación completa de la API
- `server/MONGODB-SETUP.md` - Configuración de MongoDB

## 🚧 Desarrollo

Para desarrollo, usa:
```bash
# Frontend
npm run dev

# Backend
cd server
npm run dev
```

## 📄 Licencia

Este proyecto es privado y propietario.

---

**Creado con ❤️ para momentos especiales**
